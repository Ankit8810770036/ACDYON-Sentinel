import { IngestionConfig } from '../types/ingestion';

export interface SandboxResponse {
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  contentType: 'JSON' | 'HTML';
}

const JOB_TITLES = [
  'Senior Frontend Systems Architect',
  'Lead Distributed Scraping Engineer',
  'Fullstack Security & Automation Engineer',
  'Staff AI Systems Engineer',
  'Principal Cloud Infrastructure Lead',
  'Senior Rust & WAF Security Engineer',
  'Lead ML / LLM Pipeline Architect',
  'Site Reliability & Proxy Mesh Specialist',
  'Data Ingestion & Telemetry Engineer',
  'Senior React & TypeScript Developer',
  'Cyber Intelligence & Threat Analyst',
  'Distributed DB & Scaling Architect',
  'Senior Go Backend Services Lead',
  'DevOps & Kubernetes Infra Specialist',
  'Principal Data Privacy & Compliance Lead',
];

const COMPANIES = [
  'Acdyon Technologies',
  'Sentinel Cyber IN',
  'Razorpay Engineering',
  'Swiggy Core Systems',
  'Zomato AI Labs',
  'Flipkart Infra Labs',
  'PhonePe Tech Platform',
  'HyperScale India',
  'Neural Edge Labs',
  'Apex Stealth AI',
];

const LOCATIONS = [
  'Bengaluru, Karnataka (Hybrid)',
  'Gurgaon / Delhi NCR (Cyber City)',
  'Hyderabad, Telangana (Remote)',
  'Mumbai, Maharashtra',
  'Pune, Maharashtra (Hinjewadi Tech Park)',
  'Noida, Uttar Pradesh (Sector 62)',
  'Remote (India)',
  'Bengaluru (Whitefield Tech Park)',
  'Hyderabad (HITEC City)',
];

const SALARIES = [
  '₹28,00,000 - ₹42,00,000 PA',
  '₹35,00,000 - ₹55,00,000 PA',
  '₹22,00,000 - ₹34,00,000 PA',
  '₹45,00,000 - ₹75,00,000 PA',
  '₹30,00,000 - ₹48,00,000 PA',
  '₹18,00,000 - ₹28,00,000 PA',
];

const TECH_STACKS = [
  ['React', 'TypeScript', 'Vite', 'Tailwind'],
  ['Node.js', 'Playwright', 'TLS', 'Go'],
  ['Python', 'FastAPI', 'PyTorch', 'Docker'],
  ['Rust', 'WebAssembly', 'Security', 'C++'],
  ['Kubernetes', 'AWS', 'Terraform', 'Proxy Mesh'],
];

export class AntiScrapingSandbox {
  private static requestTimestamps: number[] = [];
  private static requestCount = 0;

  public static handleRequest(
    config: IngestionConfig,
    headers: Record<string, string>
  ): SandboxResponse {
    this.requestCount++;
    const now = Date.now();

    // Clean up timestamps older than 1 second for sliding window rate calculation
    this.requestTimestamps = this.requestTimestamps.filter((t) => now - t < 1000);
    this.requestTimestamps.push(now);

    const currentRps = this.requestTimestamps.length;

    // 1. Check Rate Limiter Defense (HTTP 429)
    if (currentRps > config.sandboxRateLimitThreshold) {
      return {
        statusCode: 429,
        statusText: 'Too Many Requests (Rate Limit Exceeded)',
        headers: {
          'Retry-After': '3',
          'X-RateLimit-Limit': String(config.sandboxRateLimitThreshold),
          'X-RateLimit-Remaining': '0',
          'Content-Type': 'application/json',
        },
        contentType: 'JSON',
        body: JSON.stringify({
          error: 'Rate limit exceeded',
          message: `Velocity threshold violated (${currentRps} req/sec > limit of ${config.sandboxRateLimitThreshold} req/sec). IP automatically throttled for 3000ms.`,
          code: 'RATE_LIMITED_429',
        }, null, 2),
      };
    }

    // 2. Check Bot & Fingerprint Defense (HTTP 403)
    const ua = headers['User-Agent'] || '';
    const acceptLang = headers['Accept-Language'] || '';
    const secFetchDest = headers['Sec-Fetch-Dest'] || '';

    let botProbability = 0;
    if (!ua || ua.includes('axios') || ua.includes('python') || ua.includes('curl')) {
      botProbability += 0.9;
    }
    if (!acceptLang) botProbability += 0.4;

    // If Identity Rotation is disabled (static client profile), WAF flags request in MEDIUM/HIGH strictness
    if (!config.identityRotationEnabled && config.sandboxBotCheckStrictness !== 'LOW') {
      botProbability += 0.6;
    }

    if (!secFetchDest && config.sandboxBotCheckStrictness === 'HIGH') {
      botProbability += 0.4;
    }

    if (botProbability > 0.5) {
      return {
        statusCode: 403,
        statusText: 'Forbidden (Bot Protection Triggered)',
        headers: {
          'Server': 'Cloudflare-WAF-Shield/2.0',
          'CF-RAY': `7f9b8c2d1e0a-${Math.random().toString(36).substring(2, 6)}`,
          'Content-Type': 'text/html',
        },
        contentType: 'HTML',
        body: `<!DOCTYPE html><html><head><title>Just a moment...</title></head><body><h1>Attention Required!</h1><p>Cloudflare Ray ID: 7f9b8c2d1e0a</p><p>Your request signature matches automated scraper patterns (Missing Sec-CH-UA / Accept-Language headers or static non-rotating User-Agent: "${ua}").</p></body></html>`,
      };
    }

    // 3. Check Intermittent 503 Server Failure Rate
    if (config.sandboxErrorRate > 0 && Math.random() < config.sandboxErrorRate) {
      return {
        statusCode: 503,
        statusText: 'Service Unavailable (Server Overload)',
        headers: { 'Content-Type': 'application/json' },
        contentType: 'JSON',
        body: JSON.stringify({ error: 'Database overloaded under traffic spike', code: 'SERVER_503' }),
      };
    }

    // 4. Generate Successful Dynamic Job Response with Indian Tech Locations
    const isDrift = config.sandboxDomDriftProbability > 0 && Math.random() < config.sandboxDomDriftProbability;
    
    if (isDrift) {
      const title1 = JOB_TITLES[this.requestCount % JOB_TITLES.length] + ' (Drift Test)';
      const company1 = COMPANIES[(this.requestCount * 2) % COMPANIES.length];
      const loc1 = LOCATIONS[(this.requestCount + 1) % LOCATIONS.length];
      const sal1 = SALARIES[this.requestCount % SALARIES.length];

      const title2 = JOB_TITLES[(this.requestCount + 3) % JOB_TITLES.length] + ' (Obfuscated DOM)';
      const company2 = COMPANIES[(this.requestCount + 4) % COMPANIES.length];
      const loc2 = LOCATIONS[(this.requestCount + 3) % LOCATIONS.length];
      const sal2 = SALARIES[(this.requestCount + 2) % SALARIES.length];

      // Obfuscated HTML with mutated class names to simulate DOM drift
      const obfuscatedHtml = `
        <!DOCTYPE html>
        <html>
        <body>
          <div class="site_wrapper_v2">
            <!-- Target DOM selector shifted from .job-card to ._x89a_item -->
            <div class="_x89a_item">
              <span class="_k82_title">${title1}</span>
              <span class="_m19_comp">${company1}</span>
              <span class="_p99_loc">${loc1}</span>
              <span class="_s44_sal">${sal1}</span>
            </div>
            <div class="_x89a_item">
              <span class="_k82_title">${title2}</span>
              <span class="_m19_comp">${company2}</span>
              <span class="_p99_loc">${loc2}</span>
              <span class="_s44_sal">${sal2}</span>
            </div>
          </div>
        </body>
        </html>
      `;
      return {
        statusCode: 200,
        statusText: 'OK (DOM Drift Triggered)',
        headers: { 'Content-Type': 'text/html' },
        contentType: 'HTML',
        body: obfuscatedHtml,
      };
    }

    // Dynamic JSON jobs generation with Indian Tech Hubs (Bengaluru, Gurgaon, Hyderabad, Mumbai, Pune, Noida, Remote India)
    const mockJobs = [1, 2, 3].map((idx) => {
      const titleIndex = (this.requestCount * 3 + idx) % JOB_TITLES.length;
      const compIndex = (this.requestCount * 2 + idx) % COMPANIES.length;
      const locIndex = (this.requestCount + idx) % LOCATIONS.length;
      const salIndex = (this.requestCount + idx * 2) % SALARIES.length;
      const stackIndex = (this.requestCount + idx) % TECH_STACKS.length;

      return {
        id: `sb-${this.requestCount}-${idx}`,
        title: JOB_TITLES[titleIndex],
        company: COMPANIES[compIndex],
        location: LOCATIONS[locIndex],
        salary: SALARIES[salIndex],
        tags: TECH_STACKS[stackIndex],
        description: `Engineering role located in ${LOCATIONS[locIndex]} focusing on high-throughput resilient scraper architectures, telemetry streaming, and anti-detection systems at ${COMPANIES[compIndex]}.`,
        url: `https://acdyon.com/careers/${JOB_TITLES[titleIndex].toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        is_remote: true,
      };
    });

    return {
      statusCode: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Powered-By': 'Acdyon-Sandbox-V1',
      },
      contentType: 'JSON',
      body: JSON.stringify(mockJobs, null, 2),
    };
  }
}
