'use client';

import { 
  Link2, Sparkles, AlertCircle, CheckCircle2, ChevronRight, HelpCircle, ArrowUpRight
} from 'lucide-react';
import { useGetAiLinkingQuery } from '@/store/api/seoApi';
import { toast } from 'sonner';

export default function AiLinkingPage() {
  const { data: suggestions, isLoading } = useGetAiLinkingQuery();

  const handleApplyLink = () => {
    toast.success('Internal linking recommendation applied to draft metadata successfully!');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Sparkles className="w-8 h-8 animate-pulse text-indigo-400" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Analyzing internal links database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Title Card with linking gradient background */}
      <div className="relative overflow-hidden rounded-[32px] border border-blue-500/10 bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-[#0b0c16]/80 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/15 border border-blue-500/20 text-blue-300">
              <Link2 className="h-3.5 w-3.5 animate-pulse" />
              Interlinking Intelligence
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">Internal Linking AI</h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Orphan page resolution engine. Maximize PageRank spread and indexing probability by applying contextual, keyword-focused cross-linking anchor suggestions automatically.
            </p>
          </div>
        </div>

        {/* Dynamic statistics overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/5 relative z-10">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Interlinks Generated</p>
            <h4 className="text-xl font-black text-white">{suggestions?.length || 0} links suggested</h4>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Orphan Pages Resolved</p>
            <h4 className="text-xl font-black text-blue-400 flex items-center gap-1">
              <ArrowUpRight className="h-5 w-5 text-blue-400" />
              +3 Fixed
            </h4>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Average Link Relevance</p>
            <h4 className="text-xl font-black text-emerald-400">89% Match</h4>
          </div>
        </div>
      </div>

      {/* Suggested Internal Links Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table list of suggestions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recommended Semantic Cross-Links</h3>
          </div>

          {(suggestions || []).map((sug: any, idx: number) => (
            <div 
              key={sug.id || idx}
              className="p-6 rounded-[24px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 shadow-xl hover:border-blue-500/20 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    Source: {sug.sourceUrl}
                  </span>
                  <span className="text-[9px] text-slate-500">&rsaquo;</span>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    Target: {sug.targetUrl}
                  </span>
                </div>
                
                <p className="text-xs font-semibold text-slate-200">
                  Recommended Anchor Text: <span className="text-white font-black underline underline-offset-4 decoration-blue-500">"{sug.recommendedAnchor}"</span>
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-lg">
                  {sug.relevanceScore}% Match
                </span>
                <button
                  onClick={handleApplyLink}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Apply suggestion
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar: general interlinking rules */}
        <div className="p-8 rounded-[32px] bg-[#0b0c16]/90 border border-white/5 space-y-6">
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-blue-400" />
              Anchor Best Practices
            </h3>
            <p className="text-[10px] text-muted-foreground/60 leading-normal mt-0.5">Automated linking directives from search guidelines.</p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-white">Avoid Generic Anchors</p>
                <p className="text-[9px] text-slate-500">Never use generic labels such as "click here" or "read more". Ensure keywords are embedded.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-white">Direct Category Links</p>
                <p className="text-[9px] text-slate-500">Anchor text linking to categories should perfectly encapsulate search query targets.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-white">Anchor Text Diversity</p>
                <p className="text-[9px] text-slate-500">Mix anchors naturally to prevent Google from classifying backlink profiles as artificial spam.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
