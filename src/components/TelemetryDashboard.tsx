import React from 'react';
import { Activity, ShieldCheck, AlertOctagon, Ban, Clock, Layers, ShieldAlert } from 'lucide-react';
import { EngineStats, RequestMetric } from '../types/ingestion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, LabelList } from 'recharts';

interface TelemetryDashboardProps {
  stats: EngineStats;
  metrics: RequestMetric[];
}

export const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({ stats, metrics }) => {
  const successRate = stats.totalRequests > 0 
    ? Math.round((stats.successCount / stats.totalRequests) * 100) 
    : 100;

  // Status distribution chart data for Light Mode
  const statusData = [
    { name: '200 OK', count: stats.successCount, color: '#059669' },
    { name: '429 RateLimit', count: stats.rateLimitedCount, color: '#d97706' },
    { name: '403 BotBlock', count: stats.blockedCount, color: '#FF5722' },
    { name: '503 Outage', count: stats.serverErrorCount, color: '#0066FF' },
  ];

  // Format latency metrics for chart (last 20 requests)
  const chartMetrics = [...metrics].reverse().slice(-20).map((m, i) => ({
    index: i + 1,
    time: m.timestamp.split(' ')[0],
    latency: m.responseTimeMs,
    status: m.statusCode,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 6 Light Mode Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-mono font-medium">Total Requests</span>
            <Activity className="w-4 h-4 text-[#0066FF]" />
          </div>
          <p className="text-3xl font-bold text-[#0F172A] font-mono">{stats.totalRequests}</p>
          <span className="text-xs text-[#64748B]">Total payload probes</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-mono font-medium">Success Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-emerald-600 font-mono">{successRate}%</p>
          <span className="text-xs text-[#64748B]">{stats.successCount} passed checks</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-mono font-medium">429 Throttled</span>
            <AlertOctagon className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-amber-600 font-mono">{stats.rateLimitedCount}</p>
          <span className="text-xs text-[#64748B]">Velocity violations</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-mono font-medium">403 Blocked</span>
            <Ban className="w-4 h-4 text-[#FF5722]" />
          </div>
          <p className="text-3xl font-bold text-[#FF5722] font-mono">{stats.blockedCount}</p>
          <span className="text-xs text-[#64748B]">Bot WAF triggers</span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-mono font-medium">Jobs Ingested</span>
            <Layers className="w-4 h-4 text-[#0066FF]" />
          </div>
          <p className="text-3xl font-bold text-[#0066FF] font-mono">{stats.totalJobsIngested}</p>
          <span className="text-xs text-[#0066FF] font-mono font-medium">
            {stats.fallbackRecoveredCount} salvaged fallback
          </span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-mono font-medium">Avg Latency</span>
            <Clock className="w-4 h-4 text-[#0066FF]" />
          </div>
          <p className="text-3xl font-bold text-[#0F172A] font-mono">{stats.avgLatencyMs}ms</p>
          <span className="text-xs text-[#64748B]">Response roundtrip</span>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-Time Latency Timeline */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] font-mono flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0066FF]" /> Latency & Request Timing Stream
              </h3>
              <p className="text-xs text-[#64748B]">Real-time roundtrip latency per probe (ms)</p>
            </div>
            <span className="text-xs font-mono text-[#0066FF] bg-[#0066FF]/10 border border-[#0066FF]/20 px-3 py-1 rounded-full font-semibold">
              Live Window
            </span>
          </div>

          <div className="h-64 w-full">
            {chartMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartMetrics}>
                  <defs>
                    <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="ms" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '12px', fontSize: '12px', color: '#0F172A' }}
                    itemStyle={{ color: '#0066FF' }}
                  />
                  <Area type="monotone" dataKey="latency" stroke="#0066FF" strokeWidth={2} fillOpacity={1} fill="url(#latencyGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#64748B] font-mono text-xs sm:text-sm">
                Launch pipeline to stream real-time latency analytics...
              </div>
            )}
          </div>
        </div>

        {/* HTTP Status Code Breakdown */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] font-mono flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#0066FF]" /> Response Status Distribution
              </h3>
              <p className="text-xs text-[#64748B]">Target server response codes</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ right: 30 }}>
                <XAxis type="number" stroke="#64748B" fontSize={11} hide />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} width={100} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '12px', fontSize: '12px', color: '#0F172A' }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} isAnimationActive={true}>
                  <LabelList dataKey="count" position="right" fill="#0F172A" fontSize={11} fontWeight="bold" />
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
