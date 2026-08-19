import React, { useState } from 'react';
import { Database, Search, Code, CheckCircle, AlertTriangle, ShieldCheck, X, Download, FileJson, Copy, Check } from 'lucide-react';
import { JobListing, SchemaValidationStatus } from '../types/ingestion';
import { CustomDropdown } from './CustomDropdown';

interface IngestedJobsTableProps {
  jobs: JobListing[];
}

export const IngestedJobsTable: React.FC<IngestedJobsTableProps> = ({ jobs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [copiedModalJson, setCopiedModalJson] = useState<boolean>(false);

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'VALID', label: 'Schema Valid' },
    { value: 'RECOVERED_FALLBACK', label: 'Salvaged Fallback' },
    { value: 'PARTIAL', label: 'Partial Schema' },
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = statusFilter === 'ALL' || job.schemaStatus === statusFilter;
    const matchesSearch = searchQuery === '' ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // 1-Click Export CSV Handler
  const handleExportCSV = () => {
    if (jobs.length === 0) return;
    const headers = ['Title', 'Company', 'Location', 'Salary', 'Schema Status', 'Parser Tier', 'Source URL'];
    const rows = jobs.map((job) => [
      `"${job.title.replace(/"/g, '""')}"`,
      `"${job.company.replace(/"/g, '""')}"`,
      `"${job.location.replace(/"/g, '""')}"`,
      `"${(job.salary || 'N/A').replace(/"/g, '""')}"`,
      `"${job.schemaStatus}"`,
      `"${job.parsingStrategyUsed}"`,
      `"${job.sourceUrl || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `acdyon-ingested-jobs-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1-Click Export JSON Handler
  const handleExportJSON = () => {
    if (jobs.length === 0) return;
    const blob = new Blob([JSON.stringify(jobs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `acdyon-ingested-jobs-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1-Click Copy Modal JSON Handler
  const handleCopyModalJSON = () => {
    if (!selectedJob) return;
    navigator.clipboard.writeText(JSON.stringify(selectedJob, null, 2));
    setCopiedModalJson(true);
    setTimeout(() => setCopiedModalJson(false), 1500);
  };

  const getStatusBadge = (status: SchemaValidationStatus) => {
    switch (status) {
      case 'VALID':
        return <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1 w-fit"><CheckCircle className="w-3.5 h-3.5"/> Schema Valid</span>;
      case 'RECOVERED_FALLBACK':
        return <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-blue-100 text-blue-800 border border-blue-300 font-bold flex items-center gap-1 w-fit"><ShieldCheck className="w-3.5 h-3.5"/> Salvaged Fallback</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-amber-100 text-amber-800 border border-amber-300 font-bold flex items-center gap-1 w-fit"><AlertTriangle className="w-3.5 h-3.5"/> Partial Payload</span>;
    }
  };

  const getStrategyBadge = (strategy: JobListing['parsingStrategyUsed']) => {
    switch (strategy) {
      case 'PRIMARY_JSON_LD':
        return <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-50 text-[#0066FF] border border-blue-200 font-bold">JSON-LD</span>;
      case 'DOM_SELECTORS':
        return <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-800 border border-slate-300 font-bold">DOM Selectors</span>;
      case 'FUZZY_REGEX':
        return <span className="px-2 py-0.5 rounded text-xs font-mono bg-amber-50 text-amber-800 border border-amber-200 font-bold">Fuzzy Regex</span>;
      case 'HEURISTIC_FALLBACK':
        return <span className="px-2 py-0.5 rounded text-xs font-mono bg-orange-50 text-[#FF5722] border border-orange-200 font-bold">NLP Heuristics</span>;
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm flex flex-col h-full min-h-[500px] relative max-w-7xl mx-auto">
      {/* Top Header & Search Controls with 1-Click Export Buttons */}
      <div className="relative bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 z-40 shrink-0">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-[#0066FF]" />
          <h3 className="text-sm font-bold text-[#0F172A] font-mono uppercase tracking-wider">
            Ingested Job Storage
          </h3>
          <span className="text-xs font-mono text-[#64748B] bg-white px-2.5 py-0.5 rounded-full border border-[#E2E8F0] font-bold">
            {filteredJobs.length} listings
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Export Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={jobs.length === 0}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                jobs.length > 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-sm cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
              title="Download ingested jobs as CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>

            <button
              onClick={handleExportJSON}
              disabled={jobs.length === 0}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                jobs.length > 0
                  ? 'bg-blue-50 text-[#0066FF] border-blue-200 hover:bg-blue-100 shadow-sm cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
              title="Download ingested jobs as JSON payload file"
            >
              <FileJson className="w-3.5 h-3.5" /> Export JSON
            </button>
          </div>

          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-[#0066FF] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#CBD5E1] rounded-xl pl-9 pr-3.5 py-1.5 text-xs sm:text-sm font-mono font-bold text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0066FF] shadow-sm"
            />
          </div>

          <div className="w-40">
            <CustomDropdown
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>
      </div>

      {/* Scrollable Inner Table Window */}
      <div className="flex-1 min-h-0 bg-white overflow-y-auto relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#F1F5F9] z-10 shadow-sm">
            <tr className="border-b border-[#E2E8F0] text-[#64748B] font-mono text-xs uppercase tracking-wider">
              <th className="py-3.5 px-5 font-bold">Position & Company</th>
              <th className="py-3.5 px-5 font-bold">Location / Salary</th>
              <th className="py-3.5 px-5 font-bold">Schema Status</th>
              <th className="py-3.5 px-5 font-bold">Parser Tier</th>
              <th className="py-3.5 px-5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] font-mono text-xs sm:text-sm">
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#64748B] font-mono text-sm font-semibold">
                  No ingested job records match current filter parameters...
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-[#F8FAFC] transition-colors group">
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-[#0F172A] group-hover:text-[#0066FF] transition-colors">
                      {job.title}
                    </div>
                    <div className="text-xs text-[#64748B] font-mono font-semibold">{job.company}</div>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="text-xs sm:text-sm text-[#0F172A] font-mono font-semibold">{job.location}</div>
                    <div className="text-xs text-emerald-700 font-mono font-bold">{job.salary || 'N/A'}</div>
                  </td>
                  <td className="py-3.5 px-5">{getStatusBadge(job.schemaStatus)}</td>
                  <td className="py-3.5 px-5">{getStrategyBadge(job.parsingStrategyUsed)}</td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-3 py-1.5 rounded-xl bg-[#0066FF] hover:bg-[#297fff] text-white text-xs font-mono font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <Code className="w-3.5 h-3.5" /> Payload
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Inspector Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#CBD5E1] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A] font-mono">{selectedJob.title}</h3>
                <p className="text-xs text-[#64748B] font-mono font-semibold">{selectedJob.company} • {selectedJob.sourceName}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1.5 rounded-xl bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                <div>
                  <span className="text-[#64748B] block mb-1 font-semibold">Schema Compliance</span>
                  {getStatusBadge(selectedJob.schemaStatus)}
                </div>
                <div>
                  <span className="text-[#64748B] block mb-1 font-semibold">Recovery Engine Tier</span>
                  {getStrategyBadge(selectedJob.parsingStrategyUsed)}
                </div>
              </div>

              <div>
                <span className="text-[#64748B] block mb-1 font-semibold">Description Snippet:</span>
                <p className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] text-[#0F172A] font-sans text-xs sm:text-sm">
                  {selectedJob.descriptionSnippet}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#64748B] font-semibold">Normalized Zod Schema Payload (JSON):</span>
                  <button
                    onClick={handleCopyModalJSON}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0066FF] border border-blue-200 text-xs font-mono font-bold hover:bg-blue-100 transition-all flex items-center gap-1"
                  >
                    {copiedModalJson ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy JSON
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] text-[#0066FF] overflow-x-auto max-h-48 text-xs font-mono font-semibold">
                  {JSON.stringify(selectedJob, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-5 py-2.5 bg-[#0066FF] hover:bg-[#297fff] text-white rounded-xl text-xs sm:text-sm font-mono font-bold shadow-md"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
