import React, { useState } from 'react';
import { Sliders, ShieldAlert, Cpu, RefreshCw, Zap, Shuffle, Code2, Trash2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { IngestionConfig, SourceType } from '../types/ingestion';
import { CustomDropdown } from './CustomDropdown';

interface PipelineControlsProps {
  config: IngestionConfig;
  onChangeConfig: (newConfig: IngestionConfig) => void;
  onClearData: () => void;
  onTriggerSingle: () => void;
}

export const PipelineControls: React.FC<PipelineControlsProps> = ({
  config,
  onChangeConfig,
  onClearData,
  onTriggerSingle,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'SUCCESS' | 'CLEAR'>('SUCCESS');

  const handleChange = <K extends keyof IngestionConfig>(key: K, value: IngestionConfig[K]) => {
    onChangeConfig({ ...config, [key]: value });
  };

  const handleStepSingleClick = () => {
    onTriggerSingle();
    setToastType('SUCCESS');
    setToastMessage('⚡ Executed 1 Request Probe! Check "Telemetry" for graphs & "Logs" for stream output.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearDataClick = () => {
    onClearData();
    setToastType('CLEAR');
    setToastMessage('🗑️ Telemetry logs and ingested job storage cleared successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const sourceOptions = [
    { value: 'SANDBOX_SIMULATOR' as SourceType, label: '🛡️ Sandbox Simulator (Anti-Bot Enabled)' },
    { value: 'REMOTEOK_API' as SourceType, label: '🌐 RemoteOK API (Public Feed)' },
    { value: 'WEWORKREMOTELY_RSS' as SourceType, label: '📰 WeWorkRemotely (Public RSS Feed)' },
  ];

  const strictnessOptions = [
    { value: 'LOW' as const, label: 'LOW (Basic User-Agent filter)' },
    { value: 'MEDIUM' as const, label: 'MEDIUM (Check Sec-CH-UA + Accept-Lang)' },
    { value: 'HIGH' as const, label: 'HIGH (Strict WAF Signature Verification)' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`p-4 rounded-xl border text-xs sm:text-sm font-mono font-bold flex items-center gap-2.5 shadow-md animate-fadeIn ${
          toastType === 'SUCCESS'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : 'bg-blue-50 text-[#0066FF] border-blue-200'
        }`}>
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-[#0066FF]" />
            <h2 className="text-lg font-bold text-[#0F172A] font-mono">Engine Control & Anti-Bot Tuning Workspace</h2>
          </div>
          <p className="text-xs text-[#64748B] mt-1 font-mono">Configure target sources, pacing algorithms, resilience mechanisms, and sandbox defenses.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStepSingleClick}
            className="px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-[#297fff] text-white font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Zap className="w-4 h-4 text-white" />
            Step Single Request
          </button>
          <button
            onClick={handleClearDataClick}
            className="px-4 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] hover:text-[#FF5722] text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Clear Telemetry
          </button>
        </div>
      </div>

      {/* Grid Layout: 3 Light Mode Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Target & Pacing */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <Cpu className="w-5 h-5 text-[#0066FF]" />
            <h3 className="text-base font-bold text-[#0F172A] font-mono uppercase tracking-wider">
              Target & Pacing Parameters
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-[#0F172A] mb-1.5 block font-mono">Active Target Source</label>
              <CustomDropdown
                options={sourceOptions}
                value={config.source}
                onChange={(val) => handleChange('source', val)}
              />
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
              <div className="flex justify-between text-xs sm:text-sm font-mono">
                <span className="text-[#0F172A] font-semibold">Base Delay Pacing</span>
                <span className="text-[#0066FF] font-bold bg-[#0066FF]/10 px-2.5 py-0.5 rounded-md border border-[#0066FF]/20">{config.minDelayMs}ms</span>
              </div>
              <input
                type="range"
                min="100"
                max="4000"
                step="100"
                value={config.minDelayMs}
                onChange={(e) => handleChange('minDelayMs', Number(e.target.value))}
                className="w-full accent-[#0066FF] h-2 bg-[#E2E8F0] rounded-lg cursor-pointer"
              />
              <p className="text-xs text-[#64748B] font-mono">Interval wait time between request batches.</p>
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
              <div className="flex justify-between text-xs sm:text-sm font-mono">
                <span className="text-[#0F172A] font-semibold">Request Concurrency</span>
                <span className="text-[#0066FF] font-bold bg-[#0066FF]/10 px-2.5 py-0.5 rounded-md border border-[#0066FF]/20">{config.concurrency} Worker(s)</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={config.concurrency}
                onChange={(e) => handleChange('concurrency', Number(e.target.value))}
                className="w-full accent-[#0066FF] h-2 bg-[#E2E8F0] rounded-lg cursor-pointer"
              />
              <p className="text-xs text-[#64748B] font-mono">Number of parallel scraping requests per batch cycle.</p>
            </div>
          </div>
        </div>

        {/* Card 2: Resilience Mechanisms */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-[#0F172A] font-mono uppercase tracking-wider">
              Resilience Mechanisms
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs sm:text-sm">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer hover:border-[#0066FF]/50 transition-all">
              <div className="flex items-center gap-2.5 text-[#0F172A]">
                <ShieldAlert className="w-4 h-4 text-[#FF5722] shrink-0" />
                <div>
                  <span className="block font-bold">Circuit Breaker</span>
                  <span className="text-xs text-[#64748B]">Auto-trips on 429/403 errors to save IP</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.circuitBreakerEnabled}
                onChange={(e) => handleChange('circuitBreakerEnabled', e.target.checked)}
                className="w-4 h-4 accent-[#0066FF] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer hover:border-[#0066FF]/50 transition-all">
              <div className="flex items-center gap-2.5 text-[#0F172A]">
                <Shuffle className="w-4 h-4 text-[#0066FF] shrink-0" />
                <div>
                  <span className="block font-bold">UA / Header Rotation</span>
                  <span className="text-xs text-[#64748B]">Rotates real browser identity profiles</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.identityRotationEnabled}
                onChange={(e) => handleChange('identityRotationEnabled', e.target.checked)}
                className="w-4 h-4 accent-[#0066FF] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer hover:border-[#0066FF]/50 transition-all">
              <div className="flex items-center gap-2.5 text-[#0F172A]">
                <Code2 className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="block font-bold">Tiered Fallback Parser</span>
                  <span className="text-xs text-[#64748B]">JSON-LD -&gt; Selectors -&gt; Fuzzy Regex</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.fallbackParserEnabled}
                onChange={(e) => handleChange('fallbackParserEnabled', e.target.checked)}
                className="w-4 h-4 accent-[#0066FF] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer hover:border-[#0066FF]/50 transition-all">
              <div className="flex items-center gap-2.5 text-[#0F172A]">
                <Zap className="w-4 h-4 text-[#0066FF] shrink-0" />
                <div>
                  <span className="block font-bold">Gaussian Jitter Pacing</span>
                  <span className="text-xs text-[#64748B]">Box-Muller normal distribution calculation</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.jitterEnabled}
                onChange={(e) => handleChange('jitterEnabled', e.target.checked)}
                className="w-4 h-4 accent-[#0066FF] rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Card 3: Sandbox Defense Controls */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <RefreshCw className="w-5 h-5 text-[#0066FF]" />
            <h3 className="text-base font-bold text-[#0F172A] font-mono uppercase tracking-wider">
              Sandbox Bot Protections
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-[#0F172A] mb-1.5 block font-mono">WAF Bot Strictness (403)</label>
              <CustomDropdown
                options={strictnessOptions}
                value={config.sandboxBotCheckStrictness}
                onChange={(val) => handleChange('sandboxBotCheckStrictness', val)}
              />
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
              <div className="flex justify-between text-xs sm:text-sm font-mono">
                <span className="text-[#0F172A] font-semibold">Rate Limit Trigger (429)</span>
                <span className="text-[#FF5722] font-bold">{config.sandboxRateLimitThreshold} req/sec</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={config.sandboxRateLimitThreshold}
                onChange={(e) => handleChange('sandboxRateLimitThreshold', Number(e.target.value))}
                className="w-full accent-[#FF5722] h-2 bg-[#E2E8F0] rounded-lg cursor-pointer"
              />
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
              <div className="flex justify-between text-xs sm:text-sm font-mono">
                <span className="text-[#0F172A] font-semibold">DOM Drift Probability</span>
                <span className="text-amber-600 font-bold">{Math.round(config.sandboxDomDriftProbability * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.sandboxDomDriftProbability}
                onChange={(e) => handleChange('sandboxDomDriftProbability', Number(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-[#E2E8F0] rounded-lg cursor-pointer"
              />
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
              <div className="flex justify-between text-xs sm:text-sm font-mono">
                <span className="text-[#0F172A] font-semibold">503 Outage Rate</span>
                <span className="text-[#0066FF] font-bold">{Math.round(config.sandboxErrorRate * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={config.sandboxErrorRate}
                onChange={(e) => handleChange('sandboxErrorRate', Number(e.target.value))}
                className="w-full accent-[#0066FF] h-2 bg-[#E2E8F0] rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
