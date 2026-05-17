'use client';

import { useState } from 'react';
import { 
  Sparkles, Loader2, RefreshCw, CheckCircle2, AlertTriangle, AlertCircle, ShieldAlert, ShieldCheck
} from 'lucide-react';
import { useGetAiAuditQuery, useRunAiAuditMutation } from '@/store/api/seoApi';
import { toast } from 'sonner';

export default function AiAuditPage() {
  const { data: audit, isLoading, refetch } = useGetAiAuditQuery();
  const [runAudit, { isLoading: isRunning }] = useRunAiAuditMutation();

  const handleRunAudit = async () => {
    try {
      await runAudit().unwrap();
      refetch();
      toast.success('SEO Audit completed successfully!');
    } catch {
      toast.error('Failed to run SEO Audit.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Running advanced diagnostic crawl...</p>
      </div>
    );
  }

  // Parse arrays
  const strengths = audit?.strengthsJson ? JSON.parse(audit.strengthsJson) : [];
  const weaknesses = audit?.weaknessesJson ? JSON.parse(audit.weaknessesJson) : [];
  const missingOpts = audit?.missingOptJson ? JSON.parse(audit.missingOptJson) : [];
  const technicalIssues = audit?.technicalIssuesJson ? JSON.parse(audit.technicalIssuesJson) : [];
  const recommendations = audit?.recommendationsJson ? JSON.parse(audit.recommendationsJson) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Title Card with re-scan actions */}
      <div className="relative overflow-hidden rounded-[32px] border border-emerald-500/10 bg-gradient-to-r from-emerald-950/40 via-indigo-950/20 to-[#0b0c16]/80 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/20 text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5 animate-pulse" />
              Automated Site Audit
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">SEO Audit AI</h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Consolidated intelligence monitoring strengths, weaknesses, indexability leaks, redirect health levels, and duplicate metadata structures.
            </p>
          </div>

          <button
            onClick={handleRunAudit}
            disabled={isRunning}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Auditing...
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                Re-Run System Audit
              </>
            )}
          </button>
        </div>

        {/* Dynamic statistics overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/5 relative z-10">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Global Health Score</p>
            <h4 className="text-xl font-black text-emerald-400">{audit?.auditScore || 80}/100 Rating</h4>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Passed Audit Benchmarks</p>
            <h4 className="text-xl font-black text-white">{strengths.length} checks passing</h4>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Unresolved Technical Issues</p>
            <h4 className="text-xl font-black text-rose-400">{technicalIssues.length} alerts</h4>
          </div>
        </div>
      </div>

      {/* Main panel layout splitting Strengths, Weaknesses, and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Strengths & Weaknesses audits */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Passed Checks (Strengths) */}
          <div className="p-6 rounded-[24px] bg-[#0b0c16]/80 border border-white/5 space-y-4">
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5" />
              Passed Audits ({strengths.length})
            </h3>
            <div className="space-y-3">
              {strengths.map((str: string, idx: number) => (
                <div key={idx} className="flex gap-3 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-semibold text-slate-300 leading-normal">{str}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Warnings (Weaknesses & Technical Issues) */}
          <div className="p-6 rounded-[24px] bg-[#0b0c16]/80 border border-white/5 space-y-4">
            <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5" />
              Detected Errors & Technical Alerts ({technicalIssues.length + weaknesses.length})
            </h3>
            <div className="space-y-3">
              {technicalIssues.map((issue: string, idx: number) => (
                <div key={idx} className="flex gap-3 bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-semibold text-slate-300 leading-normal">{issue}</p>
                </div>
              ))}
              {weaknesses.map((weak: string, idx: number) => (
                <div key={idx} className="flex gap-3 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-semibold text-slate-300 leading-normal">{weak}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Recommendations Roadmap */}
        <div className="p-8 rounded-[32px] bg-[#0b0c16]/90 border border-white/5 space-y-6">
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
              Fix Recommendations
            </h3>
            <p className="text-[10px] text-muted-foreground/60 leading-normal mt-0.5">Continuous guidelines monitored by AI.</p>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec: string, idx: number) => (
              <div key={idx} className="flex gap-3 bg-black/40 p-4 rounded-xl border border-white/5">
                <span className="h-5 w-5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-white">{rec}</p>
                  <p className="text-[9px] text-slate-500">Resolve this now to increase your overall rating.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
