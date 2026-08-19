import React from 'react';
import { Shield, Activity, Database, FileText, Cpu, Terminal, Sliders, Play, Pause } from 'lucide-react';
import { CircuitState, SourceType } from '../types/ingestion';

export type ActiveTabType = 'telemetry' | 'controls' | 'logs' | 'jobs' | 'design' | 'decisions';

interface HeaderProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  isRunning: boolean;
  onTogglePipeline: () => void;
  circuitState: CircuitState;
  activeSource: SourceType;
  totalJobs: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isRunning,
  onTogglePipeline,
  circuitState,
  totalJobs,
}) => {
  return (
    <header className="w-full border-b border-[#E2E8F0] bg-white/90 backdrop-blur-xl sticky top-0 z-50 px-4 sm:px-8 py-2.5 shadow-sm">
      <div className="w-full max-w-[1536px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        
        {/* Light Mode Brand Lockup */}
        <div className="flex items-center justify-between w-full lg:w-auto shrink-0 h-9">
          <div className="flex items-center gap-2.5 h-9">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0066FF]/10 border border-[#0066FF]/20 text-[#0066FF] shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm h-9">
              <span className="font-bold text-[#0F172A] tracking-wider uppercase">ACDYON</span>
              <span className="text-[#64748B]/40">/</span>
              <span className="font-semibold text-[#0066FF]">Sentinel</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] font-mono ml-0.5 font-semibold">
                v1.4
              </span>
            </div>
          </div>

          {/* Mobile Launch Button */}
          <button
            onClick={onTogglePipeline}
            className={`lg:hidden h-8 px-3 rounded-lg font-mono text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isRunning
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-[#FF5722] hover:bg-[#ff6f42] text-white shadow-sm'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5"/> : <Play className="w-3.5 h-3.5"/>}
            {isRunning ? 'Pause' : 'Launch'}
          </button>
        </div>

        {/* Light Mode Navigation Bar */}
        <nav className="flex-1 max-w-2xl h-9 flex items-center justify-evenly gap-1 bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0] flex-nowrap overflow-x-hidden font-mono text-xs">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex-1 h-7 flex items-center justify-center gap-1.5 px-2.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
              activeTab === 'telemetry'
                ? 'bg-[#0066FF] text-white font-semibold shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('controls')}
            className={`flex-1 h-7 flex items-center justify-center gap-1.5 px-2.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
              activeTab === 'controls'
                ? 'bg-[#0066FF] text-white font-semibold shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Tuning</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 h-7 flex items-center justify-center gap-1.5 px-2.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-[#0066FF] text-white font-semibold shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 h-7 flex items-center justify-center gap-1.5 px-2.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
              activeTab === 'jobs'
                ? 'bg-[#0066FF] text-white font-semibold shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Jobs ({totalJobs})</span>
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`flex-1 h-7 flex items-center justify-center gap-1.5 px-2.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
              activeTab === 'design'
                ? 'bg-[#0066FF] text-white font-semibold shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Spec</span>
          </button>

          <button
            onClick={() => setActiveTab('decisions')}
            className={`flex-1 h-7 flex items-center justify-center gap-1.5 px-2.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
              activeTab === 'decisions'
                ? 'bg-[#0066FF] text-white font-semibold shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Decisions</span>
          </button>
        </nav>

        {/* Light Mode Status Badges & Action Button */}
        <div className="hidden lg:flex items-center gap-3 shrink-0 h-9">
          <div className="h-9 flex items-center gap-2.5 bg-white border border-[#E2E8F0] rounded-xl px-3 text-xs font-mono shadow-sm">
            {/* Status */}
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className={isRunning ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                {isRunning ? 'RUNNING' : 'PAUSED'}
              </span>
            </div>

            {/* Circuit Status */}
            <div className="flex items-center gap-1.5 border-l border-[#E2E8F0] pl-2.5">
              <span className="text-[#64748B]">Circuit:</span>
              <span className={`font-bold ${
                circuitState === 'CLOSED' ? 'text-emerald-700' :
                circuitState === 'OPEN' ? 'text-[#FF5722]' :
                'text-amber-700'
              }`}>
                {circuitState}
              </span>
            </div>
          </div>

          <button
            onClick={onTogglePipeline}
            className={`h-9 px-5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 ${
              isRunning
                ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                : 'bg-[#FF5722] hover:bg-[#ff6f42] text-white shadow-sm'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isRunning ? 'Pause Engine' : 'Launch Ingestion'}
          </button>
        </div>
      </div>
    </header>
  );
};
