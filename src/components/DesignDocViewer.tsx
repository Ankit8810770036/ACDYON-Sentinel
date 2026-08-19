import React from 'react';
import { Cpu, ShieldCheck, Zap, Layers, Lock } from 'lucide-react';

export const DesignDocViewer: React.FC = () => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm space-y-8 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="border-b border-[#E2E8F0] pb-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-[#0066FF]/10 border border-[#0066FF]/20 text-[#0066FF] shadow-sm">
            <Cpu className="w-6 h-6 text-[#0066FF]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] font-mono">Technical Design Document</h2>
            <p className="text-xs text-[#64748B] font-semibold mt-0.5">Anti-Detection Ingestion Architecture & Resilience System</p>
          </div>
        </div>
      </div>

      {/* Detection Surface Section */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-[#0066FF] font-mono flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#0066FF]" /> 1. Detection Surface & Counter-Measures
        </h3>
        <p className="text-sm text-[#0F172A] font-medium leading-relaxed">
          Modern job platforms deploy multi-layered defensive stacks across network, runtime, and behavioral vectors. Sentinel mitigates each surface:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
            <span className="text-[#0066FF] font-bold block">Network & TLS Surface</span>
            <p className="text-[#64748B] text-xs font-semibold">
              JA3/JA4 fingerprinting & HTTP/2 frame order. Default node clients get flagged instantly.
            </p>
            <div className="text-emerald-800 bg-emerald-100 p-2 rounded-lg border border-emerald-300 text-xs font-bold">
              Mitigation: Real browser header ordering & Sec-CH-UA spoofing.
            </div>
          </div>

          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
            <span className="text-[#0066FF] font-bold block">Client Runtime Surface</span>
            <p className="text-[#64748B] text-xs font-semibold">
              CDP <code className="text-[#0066FF] font-bold">navigator.webdriver</code> flags & canvas/WebGL rendering hashes.
            </p>
            <div className="text-emerald-800 bg-emerald-100 p-2 rounded-lg border border-emerald-300 text-xs font-bold">
              Mitigation: Direct HTTP API pipeline over bloated browser instances.
            </div>
          </div>

          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
            <span className="text-[#0066FF] font-bold block">Behavioral Surface</span>
            <p className="text-[#64748B] text-xs font-semibold">
              Fixed request intervals (e.g. 1000ms uniform delays) trigger entropy rate limiters.
            </p>
            <div className="text-emerald-800 bg-emerald-100 p-2 rounded-lg border border-emerald-300 text-xs font-bold">
              Mitigation: Gaussian Box-Muller Jitter for human-like request timing.
            </div>
          </div>
        </div>
      </section>

      {/* Ingestion Strategy Section */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-[#0066FF] font-mono flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#0066FF]" /> 2. Ingestion Strategy & Pacing Architecture
        </h3>
        <div className="bg-[#F8FAFC] p-5 rounded-xl border border-[#E2E8F0] font-mono text-xs sm:text-sm text-[#0F172A] space-y-3">
          <p>
            <strong className="text-[#0066FF] font-bold">Pacing & Jitter:</strong> Implements a Token Bucket algorithm with randomized delay jitter to mimic human navigation timing between requests.
          </p>
          <p>
            <strong className="text-[#0066FF] font-bold">Identity Management:</strong> Rotates browser identities, header orders, and language preferences per request while preserving cookie state to avoid cold-session security triggers.
          </p>
          <p>
            <strong className="text-[#0066FF] font-bold">Plan B Contingency:</strong> If a source starts blocking mid-run, the Circuit Breaker trips to OPEN, freezing traffic to save proxy reputation, and automatically degrades data ingestion to public search index / RSS endpoints.
          </p>
        </div>
      </section>

      {/* Resilience Section */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-emerald-700 font-mono flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" /> 3. 4-Tier Resilience & Fallback Engine
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
          <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
            <span className="text-[#0066FF] font-bold block mb-1">Tier 1: JSON-LD</span>
            <span className="text-[#64748B] text-xs font-semibold">Extracts structured Schema.org/JobPosting scripts embedded in HTML header.</span>
          </div>
          <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
            <span className="text-emerald-700 font-bold block mb-1">Tier 2: DOM Selectors</span>
            <span className="text-[#64748B] text-xs font-semibold">Extracts standard CSS selector classes (.job-card, h2.title).</span>
          </div>
          <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
            <span className="text-amber-700 font-bold block mb-1">Tier 3: Fuzzy Regex</span>
            <span className="text-[#64748B] text-xs font-semibold">Salvages data when DOM class names drift or get obfuscated overnight.</span>
          </div>
          <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
            <span className="text-[#FF5722] font-bold block mb-1">Tier 4: NLP Heuristics</span>
            <span className="text-[#64748B] text-xs font-semibold">Text chunking & token proximity extraction for scrubbed markup.</span>
          </div>
        </div>
      </section>

      {/* Ethical Boundaries Section */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-[#FF5722] font-mono flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#FF5722]" /> 4. Ethical & Technical Line ("Where You'd Stop")
        </h3>
        <div className="bg-[#F8FAFC] p-5 rounded-xl border border-[#E2E8F0] font-mono text-xs sm:text-sm text-[#0F172A] space-y-2.5">
          <p>• <strong className="text-[#0F172A] font-bold">Robots.txt & Rate Limit Etiquette:</strong> Respect crawl-delays to prevent server load spikes.</p>
          <p>• <strong className="text-[#0F172A] font-bold">PII Masking:</strong> Automatic sanitization strips recruiter emails and private contact numbers before database insertion.</p>
          <p>• <strong className="text-[#FF5722] font-bold">Strict Non-Bypass Policy:</strong> Sentinel does NOT engage in illegal CAPTCHA solving farms, stolen session cookie insertion, or credential stuffing.</p>
        </div>
      </section>
    </div>
  );
};
