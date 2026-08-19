export type SourceType = 'SANDBOX_SIMULATOR' | 'REMOTEOK_API' | 'WEWORKREMOTELY_RSS' | 'HACKERNEWS_HIRING';

export type ParsingStrategy = 'PRIMARY_JSON_LD' | 'DOM_SELECTORS' | 'FUZZY_REGEX' | 'HEURISTIC_FALLBACK';

export type SchemaValidationStatus = 'VALID' | 'PARTIAL' | 'RECOVERED_FALLBACK' | 'INVALID';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  tags: string[];
  descriptionSnippet: string;
  sourceUrl: string;
  scrapedAt: string;
  sourceName: string;
  schemaStatus: SchemaValidationStatus;
  parsingStrategyUsed: ParsingStrategy;
  rawPayloadPreview?: string;
}

export interface IngestionConfig {
  source: SourceType;
  concurrency: number;
  minDelayMs: number;
  maxDelayMs: number;
  jitterEnabled: boolean;
  circuitBreakerEnabled: boolean;
  identityRotationEnabled: boolean;
  fallbackParserEnabled: boolean;
  
  // Sandbox Controls
  sandboxRateLimitThreshold: number; // requests/sec trigger
  sandboxBotCheckStrictness: 'LOW' | 'MEDIUM' | 'HIGH';
  sandboxDomDriftProbability: number; // 0 to 1
  sandboxErrorRate: number; // 0 to 1
}

export interface RequestMetric {
  id: string;
  timestamp: string;
  url: string;
  statusCode: number;
  responseTimeMs: number;
  attemptCount: number;
  identityUserAgent: string;
  identitySecChUa: string;
  strategyUsed: ParsingStrategy;
  statusText: string;
  circuitState: CircuitState;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success' | 'circuit';
  category: 'PACING' | 'FINGERPRINT' | 'CIRCUIT' | 'PARSER' | 'SANDBOX' | 'SYSTEM';
  message: string;
  details?: Record<string, any>;
}

export interface EngineStats {
  totalRequests: number;
  successCount: number;
  rateLimitedCount: number; // 429
  blockedCount: number;     // 403
  serverErrorCount: number; // 5xx
  totalJobsIngested: number;
  validSchemaCount: number;
  fallbackRecoveredCount: number;
  avgLatencyMs: number;
  circuitState: CircuitState;
  activeUserAgentPoolSize: number;
}
