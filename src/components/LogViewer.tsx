import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Search, Pause, Play, ArrowDown, Copy, Check } from 'lucide-react';
import { LogEntry } from '../types/ingestion';
import { CustomDropdown } from './CustomDropdown';

interface LogViewerProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs, onClearLogs }) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef<boolean>(false);

  const levelOptions = [
    { value: 'ALL', label: 'All Levels' },
    { value: 'info', label: '🔵 INFO' },
    { value: 'success', label: '🟢 SUCCESS' },
    { value: 'warn', label: '🟡 WARN' },
    { value: 'error', label: '🔴 ERROR' },
    { value: 'circuit', label: '🟣 CIRCUIT' },
  ];

  // Smooth scroll container to bottom when new logs arrive (only if autoScroll is enabled)
  useEffect(() => {
    if (autoScroll && containerRef.current && !userScrolledUpRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Track manual scroll position to auto-pause autoScroll when user scrolls up
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 40;

    if (!isAtBottom) {
      userScrolledUpRef.current = true;
      if (autoScroll) setAutoScroll(false);
    } else {
      userScrolledUpRef.current = false;
      if (!autoScroll) setAutoScroll(true);
    }
  };

  const handleResumeAutoScroll = () => {
    userScrolledUpRef.current = false;
    setAutoScroll(true);
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  const handleCopyLog = (log: LogEntry) => {
    const text = `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.category}] ${log.message}`;
    navigator.clipboard.writeText(text);
    setCopiedLogId(log.id);
    setTimeout(() => setCopiedLogId(null), 1500);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
    const matchesSearch = searchQuery === '' || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const getLogBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold shadow-sm">SUCCESS</span>;
      case 'warn':
        return <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-amber-100 text-amber-800 border border-amber-300 font-bold shadow-sm">WARN</span>;
      case 'error':
        return <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-rose-100 text-rose-800 border border-rose-300 font-bold shadow-sm">ERROR</span>;
      case 'circuit':
        return <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-purple-100 text-purple-800 border border-purple-300 font-bold shadow-sm">CIRCUIT</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-blue-100 text-blue-800 border border-blue-300 font-bold shadow-sm">INFO</span>;
    }
  };

  const getLogMessageColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'text-emerald-700 font-semibold';
      case 'warn':
        return 'text-amber-700 font-semibold';
      case 'error':
        return 'text-rose-700 font-bold';
      case 'circuit':
        return 'text-purple-700 font-bold';
      default:
        return 'text-[#0F172A] font-medium';
    }
  };

  const getCategoryColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'text-emerald-600';
      case 'warn':
        return 'text-amber-600';
      case 'error':
        return 'text-rose-600';
      case 'circuit':
        return 'text-purple-600';
      default:
        return 'text-[#0066FF]';
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm flex flex-col h-full min-h-[500px] relative max-w-7xl mx-auto">
      {/* Log Header & Controls */}
      <div className="relative bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 z-40 shrink-0">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-[#0F172A] font-mono uppercase tracking-wider">
            Live Telemetry & Resilience Stream
          </h3>
          <span className="text-xs font-mono text-[#64748B] bg-white px-2.5 py-0.5 rounded-full border border-[#E2E8F0] font-bold">
            {filteredLogs.length} events
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#0066FF] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] rounded-xl pl-9 pr-3.5 py-1.5 text-xs sm:text-sm font-mono font-bold text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0066FF] shadow-sm"
            />
          </div>

          <div className="w-40">
            <CustomDropdown
              options={levelOptions}
              value={filterLevel}
              onChange={setFilterLevel}
            />
          </div>

          <button
            onClick={() => {
              if (autoScroll) {
                userScrolledUpRef.current = true;
                setAutoScroll(false);
              } else {
                handleResumeAutoScroll();
              }
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm transition-all font-mono flex items-center gap-2 ${
              autoScroll
                ? 'bg-[#0066FF] border-[#0066FF] text-white font-bold shadow-sm'
                : 'bg-amber-100 border-amber-300 text-amber-800 font-bold'
            }`}
            title={autoScroll ? 'Auto-scroll Active (Scroll up to pause)' : 'Auto-scroll Paused (Click to resume)'}
          >
            {autoScroll ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{autoScroll ? 'Auto-Scroll' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Window */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 bg-[#F8FAFC] p-5 font-mono text-xs sm:text-sm overflow-y-auto space-y-2.5 selection:bg-[#0066FF]/20 relative"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#64748B] text-sm font-mono font-semibold">
            No telemetry log entries match current filter criteria...
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 hover:bg-white p-2 rounded-lg transition-colors border border-transparent hover:border-[#E2E8F0] group">
              <span className="text-[#64748B] text-xs shrink-0 pt-0.5 font-mono font-semibold">{log.timestamp}</span>
              {getLogBadge(log.level)}
              <span className={`font-bold text-xs shrink-0 uppercase tracking-wider ${getCategoryColor(log.level)}`}>
                [{log.category}]
              </span>
              <span className={`flex-1 break-all ${getLogMessageColor(log.level)}`}>
                {log.message}
              </span>
              <button
                onClick={() => handleCopyLog(log)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#64748B] hover:text-[#0066FF] hover:bg-[#F1F5F9] rounded"
                title="Copy log line to clipboard"
              >
                {copiedLogId === log.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Floating Resume Auto-Scroll Button */}
      {!autoScroll && (
        <button
          onClick={handleResumeAutoScroll}
          className="absolute bottom-4 right-6 bg-[#FF5722] hover:bg-[#ff6f42] text-white text-xs font-mono px-4 py-2 rounded-full shadow-lg border border-[#FF5722]/40 flex items-center gap-2 transition-all z-20 animate-bounce font-bold"
        >
          <ArrowDown className="w-4 h-4" />
          <span>Scroll to latest</span>
        </button>
      )}
    </div>
  );
};
