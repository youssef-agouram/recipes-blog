'use client';

import { useState } from 'react';
import { 
  ShieldCheck, Loader2, RefreshCw, AlertTriangle, CheckCircle2, Info, AlertCircle, Sparkles
} from 'lucide-react';
import { 
  useGetTechnicalReportsQuery,
  useRunTechnicalScanMutation
} from '@/store/api/seoApi';
import { toast } from 'sonner';

export default function TechnicalSeoPage() {
  const { data: reports, isLoading, refetch } = useGetTechnicalReportsQuery();
  const [runScan, { isLoading: isScanning }] = useRunTechnicalScanMutation();

  const handleScan = async () => {
    try {
      await runScan().unwrap();
      toast.success('Live database SEO technical audit completed!');
      refetch();
    } catch {
      toast.error('Scan execution failed.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#5850ec]" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading Technical Audit logs...</p>
      </div>
    );
  }

  // Calculate status counters
  const totalIssues = reports?.length || 0;
  const errors = (reports || []).filter((r: any) => r.severity === 'error').length;
  const warnings = (reports || []).filter((r: any) => r.severity === 'warning').length;
  const resolved = (reports || []).filter((r: any) => r.resolutionStatus === 'resolved').length;
  const pending = totalIssues - resolved;

  return (
    <div className="space-y-6">
      
      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total issues */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-indigo-500/5 blur-[40px] pointer-events-none" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total Audited Issues</p>
          <h3 className="text-2xl font-black text-white">{totalIssues}</h3>
          <span className="text-[9px] text-slate-400 block mt-1.5 font-semibold">Active directives crawled</span>
        </div>

        {/* Errors */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-rose-500/5 blur-[40px] pointer-events-none" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Severity: Error</p>
          <h3 className={`text-2xl font-black ${errors > 0 ? 'text-rose-400' : 'text-white'}`}>{errors}</h3>
          <span className="text-[9px] text-rose-400 block mt-1.5 font-bold">Critical ranking blocks</span>
        </div>

        {/* Warnings */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-amber-500/5 blur-[40px] pointer-events-none" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Severity: Warning</p>
          <h3 className={`text-2xl font-black ${warnings > 0 ? 'text-amber-400' : 'text-white'}`}>{warnings}</h3>
          <span className="text-[9px] text-amber-400 block mt-1.5 font-bold">Metadata warnings to resolve</span>
        </div>

        {/* Status: Pending */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-emerald-500/5 blur-[40px] pointer-events-none" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Remaining Tasks</p>
          <h3 className="text-2xl font-black text-white">{pending} <span className="text-xs font-normal text-slate-400">pending</span></h3>
          <span className="text-[9px] text-emerald-400 block mt-1.5 font-bold">
            {resolved} issues resolved
          </span>
        </div>

      </div>

      {/* Audit Log Table Section */}
      <div className="p-8 rounded-[32px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#5850ec]/5 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
              Technical SEO Core Audits Log
            </h3>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">Scans page-titles, meta descriptions, image alts, canonical links, and indexing directives.</p>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="px-6 py-3 bg-[#5850ec] hover:bg-[#4a42df] disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            {isScanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Trigger Deep Meta Audit
          </button>
        </div>

        {/* Audit list */}
        <div className="overflow-x-auto text-xs font-semibold">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                <th className="pb-3">Audit target URL</th>
                <th className="pb-3">Audit rule / Issue type</th>
                <th className="pb-3">Audit Details</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(reports || []).map((issue: any) => (
                <tr key={issue.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 font-mono text-[#a5b4fc] max-w-[200px] truncate">{issue.pageUrl}</td>
                  <td className="py-4">
                    <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase bg-white/5 border border-white/5 text-slate-300">
                      {issue.issueType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-4 text-slate-300 font-medium max-w-[340px] truncate" title={issue.description}>
                    {issue.description || 'Verified successfully.'}
                  </td>
                  <td className="py-4">
                    <span className={`text-[9px] font-black uppercase tracking-wider ${
                      issue.severity === 'error' ? 'text-rose-400' :
                      issue.severity === 'warning' ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      {issue.severity}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase ${
                      issue.resolutionStatus === 'resolved' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {issue.resolutionStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
