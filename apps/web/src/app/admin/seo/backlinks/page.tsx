'use client';

import { useState } from 'react';
import { 
  Link2, Loader2, Globe, Sparkles, TrendingUp, CheckCircle2, ArrowUpRight, ArrowDownRight, RefreshCw
} from 'lucide-react';
import { useGetBacklinksQuery } from '@/store/api/seoApi';
import { toast } from 'sonner';

export default function BacklinksPage() {
  const { data: backlinks, isLoading, refetch } = useGetBacklinksQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#5850ec]" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading Backlinks Profile...</p>
      </div>
    );
  }

  // Calculate statistics
  const totalBacklinks = backlinks?.length || 0;
  const referringDomains = new Set((backlinks || []).map((b: any) => {
    try {
      return new URL(b.sourceUrl).hostname;
    } catch {
      return b.sourceUrl;
    }
  })).size;

  const averageDr = totalBacklinks > 0 
    ? Math.round((backlinks || []).reduce((acc: number, curr: any) => acc + curr.domainRating, 0) / totalBacklinks)
    : 0;

  const activeBacklinks = (backlinks || []).filter((b: any) => b.status === 'active');
  const lostBacklinks = (backlinks || []).filter((b: any) => b.status === 'lost');

  return (
    <div className="space-y-6">
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Backlinks */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-indigo-500/5 blur-[40px] pointer-events-none" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total Crawled Backlinks</p>
          <h3 className="text-2xl font-black text-white">{totalBacklinks}</h3>
          <span className="flex items-center gap-0.5 text-[9px] font-black text-emerald-400 mt-2">
            <ArrowUpRight className="h-3 w-3" /> +2 new this month
          </span>
        </div>

        {/* Referring Domains */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-purple-500/5 blur-[40px] pointer-events-none" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Referring Domains</p>
          <h3 className="text-2xl font-black text-white">{referringDomains}</h3>
          <span className="text-[9px] text-slate-400 block mt-2 font-semibold">Unique root publishers</span>
        </div>

        {/* Domain Quality Average */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-emerald-500/5 blur-[40px] pointer-events-none" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Average Domain Quality (DR)</p>
          <h3 className="text-2xl font-black text-white">{averageDr} <span className="text-xs font-normal text-slate-500">/ 100</span></h3>
          <span className="text-[9px] text-emerald-400 block mt-2 font-bold">
            High Quality index references
          </span>
        </div>

        {/* Lost Backlinks count */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-rose-500/5 blur-[40px] pointer-events-none" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Lost Backlinks (30d)</p>
          <h3 className={`text-2xl font-black ${lostBacklinks.length > 0 ? 'text-rose-400' : 'text-white'}`}>
            {lostBacklinks.length}
          </h3>
          <span className="text-[9px] text-slate-400 block mt-2 font-semibold">Inactive links</span>
        </div>

      </div>

      {/* Backlinks Detail Table Log */}
      <div className="p-8 rounded-[32px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#5850ec]/5 blur-[80px] pointer-events-none rounded-full" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Link2 className="h-5 w-5 text-indigo-400" />
              Incoming Backlinks & Anchors Registry
            </h3>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">Lists all external food portals, directories, and Pinterest channels sharing referrers.</p>
          </div>

          <button
            onClick={() => {
              refetch();
              toast.success('Backlinks profile refreshed!');
            }}
            className="px-6 py-3 bg-[#5850ec] hover:bg-[#4a42df] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Backlinks Index
          </button>
        </div>

        <div className="overflow-x-auto text-xs font-semibold">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                <th className="pb-3">Source referring page</th>
                <th className="pb-3">Target permalink page</th>
                <th className="pb-3">Domain Quality (DR)</th>
                <th className="pb-3">Anchor Tag Text</th>
                <th className="pb-3 text-right">Referral State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(backlinks || []).map((link: any) => (
                <tr key={link.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 font-mono text-[#a5b4fc] max-w-[280px] truncate" title={link.sourceUrl}>
                    {link.sourceUrl}
                  </td>
                  <td className="py-4 font-mono text-slate-400 max-w-[200px] truncate" title={link.targetUrl}>
                    {link.targetUrl}
                  </td>
                  <td className="py-4 font-mono text-white">{link.domainRating}</td>
                  <td className="py-4 text-slate-300 font-medium">{link.anchorText || 'No text anchor'}</td>
                  <td className="py-4 text-right font-black uppercase tracking-wider">
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black ${
                      link.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {link.status}
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
