'use client';

import { 
  Sparkles, BarChart2, TrendingUp, HelpCircle, ArrowUpRight, Gauge
} from 'lucide-react';
import { useGetAiKeywordsQuery } from '@/store/api/seoApi';

export default function AiKeywordsPage() {
  const { data: keywords, isLoading } = useGetAiKeywordsQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Sparkles className="w-8 h-8 animate-pulse text-purple-400" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Scanning search queries index...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Title Card with glowing layout */}
      <div className="relative overflow-hidden rounded-[32px] border border-purple-500/10 bg-gradient-to-r from-purple-950/40 via-indigo-950/20 to-[#0b0c16]/80 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/15 border border-purple-500/20 text-purple-300">
              <TrendingUp className="h-3.5 w-3.5 animate-pulse" />
              Keyword Intelligence
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">Keyword Opportunities</h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Identify traffic opportunities, competitor keyword gaps, trending recipes, and low competition kitchen query terms to boost rankings.
            </p>
          </div>
        </div>

        {/* Dynamic statistics overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/5 relative z-10">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Search Volume</p>
            <h4 className="text-xl font-black text-purple-400">54,000 Searches/mo</h4>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Average Difficulty Index</p>
            <h4 className="text-xl font-black text-white">38/100 (Easy-Medium)</h4>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Identified Keyword Gaps</p>
            <h4 className="text-xl font-black text-emerald-400">5 High Opportunities</h4>
          </div>
        </div>
      </div>

      {/* Suggested Keywords Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Keywords list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Identified Keyword Targets</h3>
          </div>

          {(keywords || []).map((kw: any, idx: number) => (
            <div 
              key={kw.id || idx}
              className="p-6 rounded-[24px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 shadow-xl hover:border-purple-500/20 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    {kw.keyword}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-slate-800 text-slate-300 border border-white/5">
                    Trend: {kw.trendingStatus}
                  </span>
                </div>
                
                <p className="text-xs font-semibold text-slate-400">
                  Difficulty Rating: <span className={`font-black ${kw.rankDifficulty < 35 ? 'text-emerald-400' : kw.rankDifficulty < 60 ? 'text-amber-500' : 'text-rose-400'}`}>{kw.rankDifficulty}/100</span>
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Search Potential</span>
                  <span className="text-sm font-black text-white">{kw.trafficPotential.toLocaleString()} searches/mo</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar: competitive guidelines */}
        <div className="p-8 rounded-[32px] bg-[#0b0c16]/90 border border-white/5 space-y-6">
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Gauge className="h-4.5 w-4.5 text-purple-400" />
              Gains Breakdown
            </h3>
            <p className="text-[10px] text-muted-foreground/60 leading-normal mt-0.5">Automated directives from search guidelines.</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
              <p className="text-[11px] font-bold text-white">Low Competition Terms</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Optimize keywords with difficulty indexes under 35 first to gain quick page 1 rankings.</p>
            </div>

            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
              <p className="text-[11px] font-bold text-white">Trending Breakout Keywords</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Rising keywords see temporary search volume surges. Inject trending terms within introductory recipes.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
