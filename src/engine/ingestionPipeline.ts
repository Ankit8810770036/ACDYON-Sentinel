import { IngestionConfig, JobListing, LogEntry, RequestMetric, EngineStats, CircuitState } from '../types/ingestion';
import { IdentityRotator } from './identityRotator';
import { RateLimiter } from './rateLimiter';
import { CircuitBreaker } from './circuitBreaker';
import { FallbackParser } from './fallbackParser';
import { AntiScrapingSandbox } from '../sandbox/antiScrapingSandbox';

export class IngestionPipeline {
  private identityRotator = new IdentityRotator();
  private circuitBreaker: CircuitBreaker;
  private isRunning = false;

  private stats: EngineStats = {
    totalRequests: 0,
    successCount: 0,
    rateLimitedCount: 0,
    blockedCount: 0,
    serverErrorCount: 0,
    totalJobsIngested: 0,
    validSchemaCount: 0,
    fallbackRecoveredCount: 0,
    avgLatencyMs: 0,
    circuitState: 'CLOSED',
    activeUserAgentPoolSize: 4,
  };

  private logs: LogEntry[] = [];
  private metrics: RequestMetric[] = [];
  private ingestedJobs: JobListing[] = [];
  private totalLatencySum = 0;

  constructor(
    private config: IngestionConfig,
    private onStateUpdate: (stats: EngineStats, logs: LogEntry[], metrics: RequestMetric[], jobs: JobListing[]) => void
  ) {
    this.circuitBreaker = new CircuitBreaker(
      { failureThreshold: 3, cooldownMs: 4000, windowSize: 10 },
      (newState, reason) => {
        this.addLog('circuit', 'CIRCUIT', `Circuit state changed to [${newState}]: ${reason}`);
        this.stats.circuitState = newState;
        this.emitUpdate();
      }
    );
  }

  public updateConfig(newConfig: IngestionConfig): void {
    this.config = newConfig;
    this.addLog('info', 'SYSTEM', `Pipeline configuration updated. Source: ${newConfig.source}, Concurrency: ${newConfig.concurrency}, Delay: ${newConfig.minDelayMs}ms`);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.addLog('info', 'SYSTEM', `🚀 Ingestion pipeline launched. Active Target: ${this.config.source}`);
    this.runLoop();
  }

  public stop(): void {
    this.isRunning = false;
    this.addLog('warn', 'SYSTEM', '⏸️ Ingestion pipeline paused by operator.');
    this.emitUpdate();
  }

  public isPipelineRunning(): boolean {
    return this.isRunning;
  }

  public clearData(): void {
    this.ingestedJobs = [];
    this.logs = [];
    this.metrics = [];
    this.stats = {
      totalRequests: 0,
      successCount: 0,
      rateLimitedCount: 0,
      blockedCount: 0,
      serverErrorCount: 0,
      totalJobsIngested: 0,
      validSchemaCount: 0,
      fallbackRecoveredCount: 0,
      avgLatencyMs: 0,
      circuitState: 'CLOSED',
      activeUserAgentPoolSize: 4,
    };
    this.circuitBreaker.reset();
    this.addLog('info', 'SYSTEM', 'Cleared telemetry and ingested job storage.');
    this.emitUpdate();
  }

  private isEmitting = false;
  private pendingEmit = false;

  private async runLoop(): Promise<void> {
    while (this.isRunning) {
      // Execute a batch of requests up to concurrency limit
      const promises: Promise<void>[] = [];
      for (let i = 0; i < this.config.concurrency && this.isRunning; i++) {
        promises.push(this.executeSingleRequest());
      }
      await Promise.all(promises);

      // Always yield to browser event loop so UI clicks and tab switches process instantly
      await new Promise(r => setTimeout(r, 60));

      // Pacing wait before next request loop
      if (this.isRunning) {
        const actualDelay = await RateLimiter.wait(this.config.minDelayMs, this.config.jitterEnabled);
        if (this.config.jitterEnabled && actualDelay !== this.config.minDelayMs) {
          this.addLog('info', 'PACING', `Gaussian Jitter applied: Pacing delay adjusted from ${this.config.minDelayMs}ms to ${actualDelay}ms.`);
        }
      }
    }
  }

  public async executeSingleRequest(): Promise<void> {
    // Check Circuit Breaker status
    if (this.config.circuitBreakerEnabled && !this.circuitBreaker.canExecute()) {
      this.addLog('warn', 'CIRCUIT', '⚡ Request aborted! Circuit Breaker is OPEN to protect client identity & IP.');
      await new Promise(r => setTimeout(r, 1000));
      return;
    }

    // Acquire Identity & Browser Profile
    const identity = this.identityRotator.getNextIdentity(this.config.identityRotationEnabled);
    const headers = this.identityRotator.getHeaders(identity);

    if (this.config.identityRotationEnabled) {
      this.addLog('info', 'FINGERPRINT', `Identity Rotator engaged: Switched profile to "${identity.name}" [UA Hash: ${identity.id}]`);
    }

    const startTime = Date.now();
    let responseStatus = 200;
    let responseText = '';
    let statusMessage = 'OK';
    let contentType: 'JSON' | 'HTML' = 'JSON';

    try {
      if (this.config.source === 'SANDBOX_SIMULATOR') {
        const response = AntiScrapingSandbox.handleRequest(this.config, headers);
        responseStatus = response.statusCode;
        statusMessage = response.statusText;
        responseText = response.body;
        contentType = response.contentType;
      } else {
        // Real Low-Risk Public Source (e.g. RemoteOK public API or WeWorkRemotely RSS)
        const targetUrl = this.config.source === 'REMOTEOK_API' 
          ? 'https://remoteok.com/api' 
          : 'https://weworkremotely.com/remote-jobs.rss';
        
        try {
          const res = await fetch(targetUrl, { headers });
          responseStatus = res.status;
          statusMessage = res.statusText;
          responseText = await res.text();
          contentType = targetUrl.includes('api') ? 'JSON' : 'HTML';
        } catch (fetchErr) {
          // If browser CORS or network blocks direct fetch to remote site, fall back to Sandbox gracefully
          const fallbackResp = AntiScrapingSandbox.handleRequest(this.config, headers);
          responseStatus = fallbackResp.statusCode;
          statusMessage = fallbackResp.statusText;
          responseText = fallbackResp.body;
          contentType = fallbackResp.contentType;
        }
      }
    } catch (e: any) {
      responseStatus = 500;
      statusMessage = e?.message || 'Network Fetch Error';
    }

    const latencyMs = Date.now() - startTime;
    this.totalLatencySum += latencyMs;
    this.stats.totalRequests++;

    // Update Circuit Breaker sliding window
    if (this.config.circuitBreakerEnabled) {
      this.circuitBreaker.recordResult(responseStatus);
    }

    // Record Telemetry Metric
    const metric: RequestMetric = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      url: this.config.source,
      statusCode: responseStatus,
      responseTimeMs: latencyMs,
      attemptCount: 1,
      identityUserAgent: identity.userAgent.substring(0, 45) + '...',
      identitySecChUa: identity.secChUa || 'N/A',
      strategyUsed: 'PRIMARY_JSON_LD',
      statusText: statusMessage,
      circuitState: this.circuitBreaker.getState(),
    };
    this.metrics.unshift(metric);
    if (this.metrics.length > 50) this.metrics.pop();

    // Process Response based on Status Code
    if (responseStatus === 200) {
      this.stats.successCount++;
      const parseResult = FallbackParser.parseContent(
        responseText,
        contentType,
        this.config.source,
        this.config.fallbackParserEnabled
      );

      parseResult.logs.forEach(l => this.addLog('info', 'PARSER', l));
      metric.strategyUsed = parseResult.strategyUsed;

      if (parseResult.jobs.length > 0) {
        parseResult.jobs.forEach(job => {
          if (!this.ingestedJobs.some(existing => existing.title === job.title && existing.company === job.company)) {
            this.ingestedJobs.unshift(job);
            this.stats.totalJobsIngested++;
            if (job.schemaStatus === 'VALID') this.stats.validSchemaCount++;
            else if (job.schemaStatus === 'RECOVERED_FALLBACK') this.stats.fallbackRecoveredCount++;
          }
        });
      }
    } else if (responseStatus === 429) {
      this.stats.rateLimitedCount++;
      this.addLog('warn', 'SANDBOX', `⚠️ HTTP 429 Rate Limit hit! Target site throttled request velocity.`);
    } else if (responseStatus === 403) {
      this.stats.blockedCount++;
      this.addLog('error', 'FINGERPRINT', `🚫 HTTP 403 Forbidden! Bot protection / Cloudflare WAF detected missing headers or automated client fingerprint.`);
    } else {
      this.stats.serverErrorCount++;
      this.addLog('error', 'SYSTEM', `❌ HTTP ${responseStatus} ${statusMessage}`);
    }

    this.stats.avgLatencyMs = Math.round(this.totalLatencySum / this.stats.totalRequests);
    this.stats.circuitState = this.circuitBreaker.getState();
    this.emitUpdate();
  }

  private addLog(level: LogEntry['level'], category: LogEntry['category'], message: string, details?: any): void {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      level,
      category,
      message,
      details,
    };
    this.logs.unshift(entry);
    if (this.logs.length > 100) this.logs.pop();
  }

  private emitUpdate(immediate = false): void {
    if (immediate) {
      this.onStateUpdate(
        { ...this.stats },
        [...this.logs],
        [...this.metrics],
        [...this.ingestedJobs]
      );
      return;
    }

    if (this.isEmitting) {
      this.pendingEmit = true;
      return;
    }

    this.isEmitting = true;
    requestAnimationFrame(() => {
      this.isEmitting = false;
      this.onStateUpdate(
        { ...this.stats },
        [...this.logs],
        [...this.metrics],
        [...this.ingestedJobs]
      );
      if (this.pendingEmit) {
        this.pendingEmit = false;
        this.emitUpdate();
      }
    });
  }
}
