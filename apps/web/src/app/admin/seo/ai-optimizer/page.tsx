'use client';

import { useState } from 'react';
import { 
  Sparkles, Loader2, Gauge, BarChart2, BookOpen, AlertCircle, FileText, CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';
import { useGetAdminRecipesQuery } from '@/store/api/recipeApi';
import { useOptimizeAiContentMutation } from '@/store/api/seoApi';
import { toast } from 'sonner';

export default function AiOptimizerPage() {
  const { data: recipesRes, isLoading: isLoadingRecipes } = useGetAdminRecipesQuery({ limit: 100 });
  const recipes = recipesRes?.data || [];

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
  const [focusKeyword, setFocusKeyword] = useState<string>('');
  
  const [optimizeContent, { data: results, isLoading: isOptimizing }] = useOptimizeAiContentMutation();

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipeId) {
      toast.error('Please select a recipe first.');
      return;
    }
    try {
      await optimizeContent({
        recipeId: parseInt(selectedRecipeId),
        focusKeyword
      }).unwrap();
      toast.success('AI Content Optimization scan complete!');
    } catch {
      toast.error('Failed to run optimization scan.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Glow Title Card */}
      <div className="p-8 rounded-[32px] border border-purple-500/10 bg-gradient-to-r from-purple-950/30 via-indigo-950/20 to-[#0b0c16]/80 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/15 border border-purple-500/20 text-purple-300">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          Intelligent Semantic Audits
        </span>
        
        <h2 className="text-2xl font-black text-white tracking-tight mt-2">AI Content Optimizer</h2>
        <p className="text-xs text-slate-300 max-w-xl leading-relaxed mt-1.5">
          Deep-analyze keyword density ratios, structural heading distribution, content depths, and readability scores. Generate perfect JSON-LD FAQ schemas automatically.
        </p>
      </div>

      {/* Selector form */}
      <div className="p-6 rounded-[24px] bg-[#0b0c16]/80 border border-white/5 shadow-xl">
        <form onSubmit={handleOptimize} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Recipe</label>
            <select
              value={selectedRecipeId}
              onChange={(e) => setSelectedRecipeId(e.target.value)}
              className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-xs font-bold text-white outline-none focus:border-purple-500/50"
            >
              <option value="" disabled>Select recipe...</option>
              {recipes.map((r: any) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Focus Keyword</label>
            <input
              type="text"
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              placeholder="e.g. healthy chicken bowl"
              className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white placeholder-slate-500 outline-none focus:border-purple-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={isOptimizing || isLoadingRecipes}
            className="w-full h-11 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze Content
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results grid */}
      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Metrics Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Real-time Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-[20px] bg-black/40 border border-white/5 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Keyword Density</span>
                <span className="text-xl font-black text-purple-400 mt-1 block">
                  {results.metrics.keywordDensity}%
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 mt-0.5 block">
                  {results.metrics.densityStatus.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="p-5 rounded-[20px] bg-black/40 border border-white/5 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Readability Score</span>
                <span className="text-xl font-black text-indigo-400 mt-1 block">
                  {results.metrics.readabilityScore}/100
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 mt-0.5 block">
                  High Quality
                </span>
              </div>

              <div className="p-5 rounded-[20px] bg-black/40 border border-white/5 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Semantic Relevance</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">
                  {results.metrics.semanticRelevance}%
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 mt-0.5 block">
                  Strong Match
                </span>
              </div>
            </div>

            {/* Quality enhancements */}
            <div className="p-6 rounded-[24px] bg-[#0b0c16]/80 border border-white/5 space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">AI Enhancement Suggestions</h3>
              <div className="space-y-3">
                {results.enhancementSuggestions.map((suggestion: string, idx: number) => (
                  <div key={idx} className="flex gap-3 bg-black/30 p-4 rounded-xl border border-white/5">
                    <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-semibold text-slate-300 leading-normal">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar: AI FAQ Schema Generation */}
          <div className="p-6 rounded-[24px] bg-[#0b0c16]/90 border border-white/5 space-y-6">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-purple-400" />
                AI FAQ Generator
              </h3>
              <p className="text-[9px] text-slate-400 mt-0.5">Automated rich FAQ schema suggestions.</p>
            </div>

            <div className="space-y-4">
              {results.faqSuggestions.map((faq: any, idx: number) => (
                <div key={idx} className="space-y-1 bg-black/40 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] font-black text-purple-300 uppercase tracking-tight">Q: {faq.question}</p>
                  <p className="text-[10px] font-semibold text-slate-400 leading-normal">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {!results && (
        <div className="py-20 text-center rounded-[24px] border border-dashed border-white/10 bg-[#0b0c16]/40">
          <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Select a recipe above to start optimizing</p>
        </div>
      )}

    </div>
  );
}
