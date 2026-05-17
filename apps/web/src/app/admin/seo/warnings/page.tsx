'use client';

import { useState } from 'react';
import { 
  AlertTriangle, Loader2, RefreshCw, HelpCircle, ArrowLeftRight, Activity, Zap, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { useGetAdvancedWarningsQuery } from '@/store/api/seoApi';
import { toast } from 'sonner';

export default function WarningsPage() {
  const { data: warnings, isLoading, refetch } = useGetAdvancedWarningsQuery();
  const [filterType, setFilterType] = useState<string>('all');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#5850ec]" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Running advanced audits...</p>
      </div>
    );
  }

  // Statistics
  const totalWarnings = warnings?.length || 0;
  const errors = (warnings || []).filter((w: any) => w.severity === 'error').length;
  const warns = (warnings || []).filter((w: any) => w.severity === 'warning').length;
  const infos = (warnings || []).filter((w: any) => w.severity === 'info').length;

  const filteredWarnings = filterType === 'all' 
    ? (warnings || []) 
    : (warnings || []).filter((w: any) => w.type === filterType);

  return (
    <div className="space-y-6">
      
      {/* Overview grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total issues */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-indigo-500/5 blur-[40px] pointer-events-none" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Advanced Warnings Detected</p>
          <h3 className="text-2xl font-black text-white">{totalWarnings}</h3>
          <span className="text-[9px] text-slate-400 block mt-1.5 font-semibold">Active structure validations</span>
        </div>

        {/* Errors */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-rose-500/5 blur-[40px] pointer-events-none" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Critical Loops (Errors)</p>
          <h3 className={`text-2xl font-black ${errors > 0 ? 'text-rose-400' : 'text-white'}`}>{errors}</h3>
          <span className="text-[9px] text-rose-400 block mt-1.5 font-bold">Fix to avoid browser timeouts</span>
        </div>

        {/* Warnings */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-amber-500/5 blur-[40px] pointer-events-none" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Chains & Speeds (Warnings)</p>
          <h3 className={`text-2xl font-black ${warns > 0 ? 'text-amber-400' : 'text-white'}`}>{warns}</h3>
          <span className="text-[9px] text-amber-400 block mt-1.5 font-semibold">Redirects & slow renders</span>
        </div>

        {/* Information alerts */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-sky-500/5 blur-[40px] pointer-events-none" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Orphans & Content (Info)</p>
          <h3 className="text-2xl font-black text-white">{infos}</h3>
          <span className="text-[9px] text-sky-400 block mt-1.5 font-bold">Optimize for crawling depth</span>
        </div>

      </div>

      {/* Main warning manager */}
      <div className="p-8 rounded-[32px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#5850ec]/5 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Advanced Architecture SEO Warnings
            </h3>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">Crawls and evaluates redirects, page load latencies, thin word profiles, and missing link structures.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter select */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#0f111a] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none"
            >
              <option value="all">Filter: All Issues</option>
              <option value="REDIRECT_LOOP">Redirect Loops</option>
              <option value="REDIRECT_CHAIN">Redirect Chains</option>
              <option value="SLOW_PAGE">Slow Pages</option>
              <option value="ORPHAN_PAGE">Orphan Pages</option>
              <option value="THIN_CONTENT">Thin Content</option>
            </select>

            <button
              onClick={() => {
                refetch();
                toast.success('Audits evaluated successfully!');
              }}
              className="px-6 py-2.5 bg-[#5850ec] hover:bg-[#4a42df] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Re-Scan warnings
            </button>
          </div>
        </div>

        {/* Warnings list cards */}
        <div className="space-y-4 pt-2">
          {filteredWarnings.map((warning: any, idx: number) => (
            <div 
              key={idx} 
              className={`p-6 rounded-3xl border transition-all ${
                warning.severity === 'error' ? 'bg-rose-500/5 border-rose-500/10 hover:border-rose-500/25' :
                warning.severity === 'warning' ? 'bg-amber-500/5 border-amber-500/10 hover:border-amber-500/25' :
                'bg-white/5 border-white/5 hover:border-white/10'
              } flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                    warning.severity === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    warning.severity === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  }`}>
                    {warning.type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{warning.url}</span>
                </div>
                <p className="text-xs font-semibold text-slate-300">{warning.message}</p>
              </div>

              <div className="shrink-0">
                <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                  warning.severity === 'error' ? 'text-rose-400 bg-rose-500/5' :
                  warning.severity === 'warning' ? 'text-amber-400 bg-amber-500/5' :
                  'text-sky-400 bg-sky-500/5'
                }`}>
                  Severity: {warning.severity}
                </span>
              </div>
            </div>
          ))}

          {filteredWarnings.length === 0 && (
            <div className="py-8 text-center text-xs font-bold text-slate-500 uppercase tracking-widest flex flex-col items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              Everything is green! No architect warnings detected.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
