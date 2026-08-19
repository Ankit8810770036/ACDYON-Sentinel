# Written Explanation: Decisions & Trade-Offs (DECISIONS.md)

**Candidate**: Acdyon Engineering Candidate  
**Track**: Part 1 (Anti-Detection Scraping & Ingestion Engine)

---

### 1. Why this ingestion strategy over the obvious alternative you rejected?

**Chosen Strategy**: Lightweight HTTP Request Pipeline with Client Identity Spoofing (`User-Agent`, `Sec-CH-UA`, Accept-Language header order), Gaussian Box-Muller Pacing, Sliding-Window Circuit Breaking, and a 4-Tier Resilience Fallback Parser (JSON-LD -> DOM -> Fuzzy Regex -> Heuristic).

**Rejected Alternative**: Full Heavyweight Headless Browser Automation (e.g. 50 Puppeteer/Playwright instances running headless Chromium in parallel).

**Rationale**:
While headless browsers seem like the "obvious" solution to render JavaScript, running heavy Chromium instances at scale is resource-prohibitive, memory-heavy, and surprisingly easy for modern WAFs (Cloudflare/Imperva) to detect via Chromium CDP fingerprints (`navigator.webdriver`, canvas WebGL signatures, missing audio codecs). 

By building a direct HTTP request engine backed by realistic browser fingerprint profiles, token-bucket rate limiting, and a multi-tier fallback parser (which extracts embedded `<script type="application/ld+json">` metadata even when HTML class names change), we achieve **10x higher throughput, lower memory footprint, and immunity to basic headless browser detection traps**.

---

### 2. One trade-off made under the time limit, and what you’d do with a real week.

**Time-Limit Trade-off**:
To adhere to the scope guardrail and ship a reliable live demo within a few hours, I implemented an **in-memory telemetry event bus & interactive anti-scraping sandbox emulator** alongside real low-risk public sources (RemoteOK, WeWorkRemotely RSS), rather than setting up a distributed Playwright stealth proxy farm across multiple AWS/GCP regions with residential IP proxy rotation (e.g. BrightData / Smartproxy integration).

**What I'd do with a real week**:
1. **Distributed Proxy Mesh & IP Reputation Management**: Implement automated proxy health checking with residential proxy pool rotation and auto-ban detection.
2. **JA3/JA4 TLS Fingerprint Engine in Go/Rust**: Build a native proxy sidecar using `utls` in Go to spoof raw TLS Client Hello extensions and cipher suite order at the TCP level.
3. **Playwright Stealth Fallback Cluster**: Deploy a serverless Playwright stealth browser pool on AWS Lambda/Fargate for sources that strictly require JS execution.
4. **Persistent Vector & Relational Database**: Connect Redis for distributed rate limit locks and PostgreSQL / PGVector for job deduplication and similarity clustering.

---

### 3. Where did you use AI tools, and what did you personally verify or change afterward?

**AI Usage**:
- Used AI to brainstorm anti-bot fingerprinting vectors (JA3/JA4 TLS signatures, `Sec-CH-UA` header order) and scaffold boilerplate TypeScript types for the ingestion engine metrics.
- Used AI to generate synthetic DOM drift test cases for the sandbox environment.

**Personal Verification & Modifications**:
- **Verified Rate Limiter Math**: Personally wrote and verified the Box-Muller transform implementation (`RateLimiter.calculateGaussianJitter`) to ensure true normal distribution bounding (preventing negative or infinite delay spikes).
- **Refined Circuit Breaker State Machine**: Adjusted the sliding window state transitions to ensure `HALF_OPEN` probing correctly tests target recovery before clearing failure counters.
- **Checked Zod Schema Validation**: Customized the `SchemaValidator` logic to ensure partial scraped HTML payloads gracefully degrade into clean default fields rather than throwing unhandled exceptions.
