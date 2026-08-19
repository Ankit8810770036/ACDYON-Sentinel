# Acdyon Sentinel — Resilient Job Ingestion & Anti-Detection Engine

> **Acdyon Technologies Frontend Challenge — Part 1 Solution**  
> *"Build It Like You Mean It"*

---

## 🌟 Overview

**Acdyon Sentinel** is a resilient, production-grade job scraping and ingestion system designed to pull job postings from target platforms without getting IP-blocked or bot-flagged.

It includes an interactive **Telemetry Control Dashboard**, a 4-Tier **Fallback Parsing Engine**, an adaptive **Token Bucket Rate Limiter with Gaussian Jitter**, sliding-window **Circuit Breakers**, browser **Identity Profile Rotation**, an interactive **Anti-Scraping Sandbox Simulator**, and embedded technical design documentation (`DESIGN_DOCUMENT.md` and `DECISIONS.md`).

---

## 📁 Submission Deliverables

- **Deployed URL**: Ready for 1-click deployment on Vercel / Netlify / Render (`npm run build`).
- **DECISIONS.md**: [DECISIONS.md](file:///c:/Users/Ankit%20kumar%20singh/Desktop/myProject/Acdyon%20Technologies/DECISIONS.md) (1 page max answering the 3 challenge questions).
- **Design Document**: [DESIGN_DOCUMENT.md](file:///c:/Users/Ankit%20kumar%20singh/Desktop/myProject/Acdyon%20Technologies/DESIGN_DOCUMENT.md) (Covering Detection Surface, Ingestion Strategy, Resilience, and Ethical Boundaries).

---

## 🚀 Quick Start (Local Run)

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production deployment
npm run build
```

---

## 🛠️ Architecture Highlights

1. **Anti-Detection Engine**: Spoofs real browser identity headers (`User-Agent`, `Sec-CH-UA`, `Accept-Language`), matching real Chrome 122, Safari 17.3, and Firefox 123 profiles.
2. **Pacing & Gaussian Jitter**: Box-Muller normal distribution calculation simulates natural human reading/dwelling delays.
3. **Sliding-Window Circuit Breaker**: Auto-trips to `OPEN` when target site returns repeated 429/403 errors, protecting client proxy reputation for a cooldown period before probing with a `HALF_OPEN` request.
4. **4-Tier Fallback Parser**:
   - *Tier 1*: Structured Schema.org/JobPosting JSON-LD metadata.
   - *Tier 2*: Standard Semantic DOM Selectors.
   - *Tier 3*: Fuzzy Regex Pattern Matching (salvages data when class names mutate overnight).
   - *Tier 4*: Heuristic NLP Text Chunking.
5. **Interactive Sandbox**: Emulates 429 rate limit velocity triggers, Cloudflare 403 bot blocks, and DOM class drift in real-time.
