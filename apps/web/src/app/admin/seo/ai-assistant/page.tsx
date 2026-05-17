'use client';

import { useState } from 'react';
import { 
  Sparkles, Loader2, RefreshCw, AlertTriangle, CheckCircle2, ChevronRight, Gauge, HelpCircle, ArrowUpRight
} from 'lucide-react';
import { useGetAiRecommendationsQuery } from '@/store/api/seoApi';
import { toast } from 'sonner';

export default function AiAssistantPage() {
  const { data: recommendations, isLoading, refetch } = useGetAiRecommendationsQuery();

  const handleRefresh = () => {
    refetch();
    toast.success('AI SEO Insights updated successfully!');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#5850ec]" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Consulting AI Assistant...</p>
      </div>
    );
  }

  // Calculate stats
  const totalRecommendations = recommendations?.length || 0;
  const totalScoreGain = (recommendations || []).reduce((acc: number, curr: any) => acc + curr.scoreImprovement, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header card with glowing AI gradients */}
      <div className="relative overflow-hidden rounded-[32px] border border-indigo-500/10 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-[#0b0c16]/80 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-500/15 border border-indigo-500/20 text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              AI SEO Engine Active
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">AI SEO Assistant</h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Unlock maximum search reach! The AI agent analyzes title lengths, readability levels, schema configurations, and keyword placements to generate optimization advice.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-[#5850ec] hover:bg-[#4a42df] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh AI Diagnostics
          </button>
        </div>

        {/* Diagnostic overview metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/5 relative z-10">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Diagnosed Actions</p>
            <h4 className="text-xl font-black text-white">{totalRecommendations} pending suggestions</h4>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expected SEO Score Gain</p>
            <h4 className="text-xl font-black text-indigo-400 flex items-center gap-1.5">
              <ArrowUpRight className="h-5 w-5 text-indigo-400" />
              +{totalScoreGain} Points
            </h4>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Optimization Level</p>
            <h4 className="text-xl font-black text-emerald-400">High efficiency</h4>
          </div>
        </div>
      </div>

      {/* Main panel splitting checklist and recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: AI Optimization Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Actionable AI Recommendations</h3>
          </div>

          {(recommendations || []).map((rec: any) => (
            <div 
              key={rec.id}
              className="p-6 rounded-[24px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 shadow-xl hover:border-indigo-500/20 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    {rec.recType.replace(/_/g, ' ')}
                  </span>
                  {rec.recipe && (
                    <span className="text-[10px] font-bold text-slate-400">
                      Recipe: {rec.recipe.title}
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-200 leading-normal">{rec.aiOutput}</p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-lg">
                  +{rec.scoreImprovement} Score
                </span>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
            </div>
          ))}

          {(!recommendations || recommendations.length === 0) && (
            <div className="py-8 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
              No active recommendations generated yet.
            </div>
          )}
        </div>

        {/* Right Column: General Checklist & Optimization rules */}
        <div className="p-8 rounded-[32px] bg-[#0b0c16]/90 border border-white/5 space-y-6">
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Gauge className="h-4.5 w-4.5 text-indigo-400" />
              SEO Checklist
            </h3>
            <p className="text-[10px] text-muted-foreground/60 leading-normal mt-0.5">Continuous crawling guidelines monitored by AI.</p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-white">Title length tags range</p>
                <p className="text-[9px] text-slate-500">Ensure title tags are between 45 and 65 characters.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-white">Keyword inclusion in slug</p>
                <p className="text-[9px] text-slate-500">Slug must match keyword strings perfectly.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-white">JSON-LD schemas validation</p>
                <p className="text-[9px] text-slate-500">Structured data fully injected for Google cards.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-white">Alt image descriptions</p>
                <p className="text-[9px] text-slate-500">Ensure alt text encapsulates target keyword queries.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
