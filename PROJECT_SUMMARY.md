# 🛡️ ACDYON SENTINEL — Project State & Memory Context

> **Instant Agent Memory Snapshot**: This file contains the complete architectural blueprint, deployment configurations, design system tokens, and module map for the **Acdyon Sentinel Anti-Detection Ingestion Platform**. Read this file upon returning to resume work without full codebase rescanning.

---

## 🌐 Live Production Links & Repositories

- **Live Deployed Production Site**: [https://acdyon-technologies-sable.vercel.app](https://acdyon-technologies-sable.vercel.app)
- **Public GitHub Repository**: [https://github.com/Ankit8810770036/ACDYON-Sentinel](https://github.com/Ankit8810770036/ACDYON-Sentinel)
- **Local Dev Server**: `http://localhost:5173/` (`npm run dev`)

---

## 🏗️ Architecture & Core Engine Modules

The core ingestion engine is located in `src/engine/` and `src/sandbox/`:

1. **`src/engine/ingestionPipeline.ts`**:
   - Orchestrates request batch execution, pacing, circuit breaking, telemetry updates, and job deduplication.
2. **`src/engine/rateLimiter.ts`**:
   - Implements Gaussian Box-Muller transform for randomized human-like delay pacing (`wait(minDelayMs, jitterEnabled)`).
3. **`src/engine/identityRotator.ts`**:
   - Manages browser fingerprint profile rotation (`User-Agent`, `Sec-CH-UA`, `Accept-Language`, `Sec-Fetch-Dest`).
4. **`src/engine/circuitBreaker.ts`**:
   - Sliding-window state machine (`CLOSED` $\rightarrow$ `OPEN` $\rightarrow$ `HALF_OPEN`) preventing IP bans during 403/429 spikes.
5. **`src/engine/fallbackParser.ts`**:
   - 4-Tier resilience parsing engine:
     - **Tier 1**: JSON / JSON-LD Schema.org parser
     - **Tier 2**: DOM CSS Selectors
     - **Tier 3**: Fuzzy Regex pattern matcher (salvages listings when DOM class names drift or get obfuscated)
     - **Tier 4**: NLP Heuristic chunker
6. **`src/engine/schemaValidator.ts`**:
   - Zod schema validator with automatic **PII Masking** (email/phone sanitization) and **XSS/URL Protocol Sanitization** (`http://` / `https://` enforcement).
7. **`src/sandbox/antiScrapingSandbox.ts`**:
   - Dynamic Indian tech job generator (Acdyon, Swiggy, Razorpay, Flipkart, PhonePe, Zomato AI across Bengaluru, Gurgaon, Hyderabad, Mumbai, Pune, Noida, Remote India in ₹ LPA) and Cloudflare WAF 403 / 429 / 503 / DOM Drift simulator.

---

## 🎨 UI Design System & Component Hierarchy

The UI is built with React 18, TailwindCSS, and Inter typography in a high-contrast Corporate Light Mode:

- **Primary Background Canvas**: `#EAEFF5` (Cool Slate Gray)
- **Card Containers**: `#FFFFFF` (Pure Crisp White) with `#CBD5E1` borders & soft shadows
- **Text Main**: `#0F172A` (Deep Slate-900)
- **Text Muted**: `#64748B` (Slate-500)
- **Corporate Accent**: `#0066FF` (Corporate Blue)
- **Action Alert CTA**: `#FF5722` (Sentinel Orange)
- **Font Stack**: `Inter` (UI & Body), `JetBrains Mono` (Logs & Telemetry)

### 6 UI Workspaces:
1. **`Header.tsx`**: Single-row navigation bar with active tab pills, brand emblems, and engine toggle button.
2. **`TelemetryDashboard.tsx`**: Metric cards, live Latency Area Chart, and Response Status Code Bar Distribution Chart (`200 OK`, `429`, `403`, `503`).
3. **`PipelineControls.tsx`**: Target source selectors, pacing sliders, defense toggles, sandbox WAF controls, and real-time Toast Notification banners.
4. **`LogViewer.tsx`**: Color-coded live log stream (`INFO`, `SUCCESS`, `WARN`, `ERROR`, `CIRCUIT`), level/search filters, isolated inner scrollbar, and 1-Click Copy row buttons.
5. **`IngestedJobsTable.tsx`**: Ingested job storage table, 1-Click **CSV Export** and **JSON Export** buttons, raw Zod payload inspector modal with Copy JSON, and isolated inner scrollbar.
6. **`DesignDocViewer.tsx` & `DecisionsViewer.tsx`**: Embedded technical architecture design document and DECISIONS.md interview trade-off answers.

---

## 🚀 Key Commands & Deployment Configs

- **Run Local Development**: `npm run dev`
- **Build Production Bundle**: `npm run build`
- **Vercel Config**: `vercel.json` (SPA routing rewrites to `/index.html`)
- **Git Config**: `.gitignore` (ignores `node_modules`, `dist`, `logs`)
