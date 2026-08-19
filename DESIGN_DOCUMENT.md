# Technical Design Document: Anti-Detection Job Ingestion System

**Author**: Acdyon Engineering Candidate  
**Track**: Part 1 — Getting Data Out of a Platform That Doesn’t Want You To  
**System Name**: Acdyon Sentinel (Resilient Job Ingestion Platform)

---

## Executive Summary

Scraping job listing data repeatedly from platform giants (LinkedIn, Indeed, Naukri, Wellfound) presents a severe operational challenge: target platforms deploy multi-layered defensive stacks ranging from IP rate limiting and Cloudflare TLS fingerprinting to headless browser detection and dynamic DOM obfuscation. 

This document outlines the architecture, detection surface analysis, anti-bot mitigation strategies, resilience mechanisms, and ethical boundaries governing **Acdyon Sentinel**, a zero-downtime, self-healing job ingestion system.

---

## 1. Detection Surface & Counter-Measures

Modern platforms use multi-dimensional bot detection across network, protocol, browser, and behavioral vectors.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       DETECTION SURFACE VECTOR MAP                      │
├──────────────────┬────────────────────────────┬─────────────────────────┤
│ Vector           │ Detection Mechanism        │ Sentinel Mitigation     │
├──────────────────┼────────────────────────────┼─────────────────────────┤
│ Network & TLS    │ JA3/JA4 Fingerprinting,    │ IdentityRotator Profile │
│                  │ HTTP/2 Frame Sequence      │ Spoofing, Header Order  │
├──────────────────┼────────────────────────────┼─────────────────────────┤
│ Client Runtime   │ CDP (`navigator.webdriver`),│ Real Browser User-Agent │
│                  │ Canvas/WebGL Fingerprints  │ Sec-CH-UA Randomization │
├──────────────────┼────────────────────────────┼─────────────────────────┤
│ Behavioral       │ Uniform Request Cadence,   │ Token Bucket + Gaussian │
│                  │ Burst Traffic Scans        │ Box-Muller Jitter Delay │
├──────────────────┼────────────────────────────┼─────────────────────────┤
│ Structural       │ Dynamic Class Renaming,    │ 4-Tier Resilience       │
│                  │ Shadow DOM Obfuscation     │ Fallback Parser Engine  │
└──────────────────┴────────────────────────────┴─────────────────────────┘
```

### Detailed Breakdown:

1. **TLS / Network Fingerprinting (JA3 / JA4)**:
   - *Threat*: Datacenter client libraries (e.g. default Node `fetch`, `axios`, `python-requests`) present distinct TLS cipher suites and HTTP/2 pseudo-header order (`:method`, `:authority`, `:scheme`, `:path`) that instantly identify non-browser clients.
   - *Mitigation*: Our `IdentityRotator` synthesizes header order matching real Chrome 122, Safari 17.3, and Firefox 123 browsers, including modern `Sec-CH-UA` and `Sec-Fetch-*` headers.

2. **Headless Browser Signatures (`navigator.webdriver`)**:
   - *Threat*: Standard Puppeteer or Playwright instances expose `navigator.webdriver = true`, missing Chrome plugins, and telltale Chromium CDP variables.
   - *Mitigation*: We prioritize direct HTTP request pipelines with client identity spoofing over bloated headless browser instances whenever possible. When headless browsers are required, `stealth` plugins override CDP flags, WebGL renderer hashes, and audio context noise.

3. **Behavioral Request Cadence & Velocity**:
   - *Threat*: Fixed delays (e.g., exactly `1000ms` between requests) trigger statistical entropy detectors.
   - *Mitigation*: The `RateLimiter` implements **Gaussian Box-Muller Jitter** to model human reading/dwell behavior, producing a natural bell-curve distribution centered around target delays.

---

## 2. Ingestion Strategy & Pacing Architecture

### Pacing & Identity Pool Rotation

```
                  ┌─────────────────────────────────────┐
                  │      Ingestion Loop Orchestrator    │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │      Circuit Breaker Check          │
                  │   [CLOSED / HALF_OPEN / OPEN]       │
                  └──────────────────┬──────────────────┘
                                     │ (CLOSED / PASS)
                                     ▼
                  ┌─────────────────────────────────────┐
                  │      Identity Rotator Engine        │
                  │   • User-Agent Pool                 │
                  │   • Sec-CH-UA Headers               │
                  │   • Accept-Language Matching        │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │     Adaptive Token Bucket Pacing    │
                  │   + Gaussian Box-Muller Jitter      │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │     Target Probe (HTTP / API)       │
                  └─────────────────────────────────────┘
```

### Identity Pool & Identity Management
- **Identity Pool**: Maintains a hot-swappable pool of browser identity profiles.
- **Session Identity Preservation**: Cookies and session tokens are preserved per identity to avoid triggering "cold browser session" security checks.
- **Plan B Contingency**: If an IP or source starts blocking mid-run:
  1. The **Circuit Breaker** trips to `OPEN`, immediately pausing requests to prevent burning the proxy subnet.
  2. The system initiates **Identity & Proxy Failover**, switching to backup proxy subnets.
  3. The parser degrades to **Public RSS / Search Index Feeds** to maintain continuous data flow.

---

## 3. Pipeline Resilience & Self-Healing

When platforms alter their HTML structure overnight or rate-limit clients, traditional scrapers fail silently. Sentinel implements a **4-Tier Fallback Parsing Engine**:

```
                       ┌───────────────────────────┐
                       │ Raw Response HTML / JSON  │
                       └─────────────┬─────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │ Tier 1: Primary JSON-LD Extractor   │  <-- Schema.org / JobPosting
                  └──────────────────┬──────────────────┘
                                     │ (If missing)
                                     ▼
                  ┌─────────────────────────────────────┐
                  │ Tier 2: Semantic DOM Selectors      │  <-- .job-card, h2.title
                  └──────────────────┬──────────────────┘
                                     │ (If DOM Shifted)
                                     ▼
                  ┌─────────────────────────────────────┐
                  │ Tier 3: Fuzzy Regex Pattern Engine  │  <-- Salving title/salary patterns
                  └──────────────────┬──────────────────┘
                                     │ (If Obfuscated)
                                     ▼
                  ┌─────────────────────────────────────┐
                  │ Tier 4: Heuristic NLP Extractor     │  <-- Token proximity parsing
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │     Zod Schema Validation &         │
                  │     Sanitization Pipeline           │
                  └─────────────────────────────────────┘
```

1. **Circuit Breaker Pattern**: Sliding window tracks request failures (HTTP 429, 403, 5xx). Tripping to `OPEN` protects IP reputation for a 4000ms cooldown before testing with a `HALF_OPEN` probe request.
2. **Schema Sanitization (Zod)**: All extracted objects are validated against `StrictJobPostingSchema`. Partially extracted listings are safely sanitized with default fallbacks rather than crashing downstream ingestion pipelines.

---

## 4. Ethical & Legal Boundaries ("Where You'd Stop")

Acdyon Sentinel strictly enforces technical and ethical guardrails to operate responsibly:

1. **Robots.txt & Rate Limit Respect**: We respect crawl-delay directives and enforce token bucket caps to avoid causing denial-of-service stress on target servers.
2. **PII & Privacy Protection**: Scraper filters strip personal contact details, phone numbers, and recruiter emails before persistence.
3. **No CAPTCHA Bypassing via Stolen Credentials**: Sentinel does **NOT** attempt illegal CAPTCHA farm bypasses, account credential stuffing, or session hijacking of private authenticated accounts.
4. **Public Data Focus**: Ingestion is restricted to publicly accessible job postings.
