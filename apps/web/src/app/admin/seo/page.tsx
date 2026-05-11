'use client';

import { useState } from 'react';
import { 
  Search, Globe, Settings, Map, RefreshCw, 
  Wrench, ChevronDown, HelpCircle, Bell, 
  ArrowLeft, Info, CheckCircle2, AlertCircle,
  Monitor, Smartphone, ExternalLink, X
} from 'lucide-react';
import Link from 'next/link';

export default function AdminSEOPage() {
  const [activeTab, setActiveTab] = useState('Page SEO');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [keywords, setKeywords] = useState(['creamy garlic pasta', 'garlic pasta recipe', 'easy pasta recipe', 'dinner ideas', 'quick pasta']);

  const tabs = ['SEO Overview', 'Page SEO', 'Site Settings', 'Sitemap', 'Redirections', 'SEO Tools'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">SEO</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
            <Link href="/admin" className="hover:text-white transition-colors">Dashboard</Link>
            <span className="opacity-30">&gt;</span>
            <span className="text-white/60 text-[10px]">SEO</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-xl transition-all">
              <span>View Recipe</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-xl transition-all">
            <HelpCircle className="w-4 h-4" />
            <span>How SEO works?</span>
          </button>
          <button className="relative p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[#0a0b14]">5</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-1.5 flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab 
                ? 'bg-[#5850ec] text-white shadow-lg shadow-[#5850ec]/20' 
                : 'text-muted-foreground/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Page SEO Settings */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Page SEO Settings</h2>
                <p className="text-sm text-muted-foreground/60">Optimize your recipe page for search engines</p>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-all">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Recipes</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Recipe Selection */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/90">Recipe</label>
                <div className="relative">
                  <select className="appearance-none w-full bg-background border border-white/5 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] cursor-pointer">
                    <option>Creamy Garlic Pasta</option>
                    <option>Beef Tacos</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" />
                </div>
              </div>

              {/* URL Slug */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/90">URL Slug</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-background border border-white/5 rounded-xl px-5 py-3 text-sm font-medium text-muted-foreground/60 italic">
                    /recipes/creamy-garlic-pasta
                  </div>
                  <button className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-all">
                    Edit
                  </button>
                </div>
              </div>

              {/* SEO Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-sm font-bold text-white/90">
                    SEO Title
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/40" />
                  </label>
                  <span className="text-[11px] font-bold text-green-500">58 / 60 characters</span>
                </div>
                <input 
                  type="text" 
                  defaultValue="Creamy Garlic Pasta Recipe | Easy & Delicious Dinner Idea"
                  className="w-full bg-background border border-white/5 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
                />
              </div>

              {/* Meta Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-sm font-bold text-white/90">
                    Meta Description
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/40" />
                  </label>
                  <span className="text-[11px] font-bold text-green-500">137 / 160 characters</span>
                </div>
                <textarea 
                  rows={4}
                  defaultValue="Learn how to make creamy garlic pasta at home with this easy recipe. Perfect for a quick and delicious dinner. Ready in 20 minutes!"
                  className="w-full bg-background border border-white/5 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all resize-none"
                />
              </div>

              {/* Focus Keyword */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-sm font-bold text-white/90">
                    Focus Keyword
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/40" />
                  </label>
                  <span className="text-[11px] font-bold text-green-500">100 / 100</span>
                </div>
                <input 
                  type="text" 
                  defaultValue="creamy garlic pasta"
                  className="w-full bg-background border border-white/5 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
                />
              </div>

              {/* Meta Keywords */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-sm font-bold text-white/90">
                    Meta Keywords
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/40" />
                  </label>
                  <span className="text-[11px] font-bold text-green-500">5 / 10 keywords</span>
                </div>
                <div className="w-full bg-background border border-white/5 rounded-2xl p-4 flex flex-wrap gap-2">
                  {keywords.map((kw) => (
                    <span key={kw} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white group cursor-pointer hover:border-[#5850ec] transition-all">
                      {kw}
                      <X className="w-3 h-3 text-muted-foreground/40 group-hover:text-red-400" />
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <button className="px-10 py-3 bg-[#5850ec] hover:bg-[#4d45d1] text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-[#5850ec]/20 active:scale-95">
                  Save Changes
                </button>
                <button className="px-10 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-all border border-white/10">
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Previews & Score */}
        <div className="space-y-8">
          {/* Google Preview */}
          <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                Google Preview
                <HelpCircle className="w-4 h-4 text-muted-foreground/40" />
              </h2>
              <div className="flex items-center bg-background border border-white/5 p-1 rounded-xl">
                <button 
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-[#5850ec] text-white' : 'text-muted-foreground/40 hover:text-white'}`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-[#5850ec] text-white' : 'text-muted-foreground/40 hover:text-white'}`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl border border-black/5">
              <div className="flex items-center gap-2 text-[13px] text-[#202124] mb-1">
                <Globe className="w-4 h-4 text-[#5f6368]" />
                <span className="flex items-center gap-1">
                  https://www.tastyrecipes.com/recipes/creamy-garlic-pasta
                  <ChevronDown className="w-3 h-3 text-[#70757a]" />
                </span>
              </div>
              <h3 className="text-[19px] text-[#1a0dab] font-medium leading-tight mb-2 hover:underline cursor-pointer">
                Creamy Garlic Pasta Recipe | Easy & Delicious Dinner Idea
              </h3>
              <p className="text-[14px] text-[#4d5156] leading-snug mb-3">
                Learn how to make creamy garlic pasta at home with this easy recipe. Perfect for a quick and delicious dinner. Ready in 20 minutes!
              </p>
              <div className="flex items-center gap-3 text-[12px] text-[#70757a]">
                <div className="flex items-center gap-1">
                  <div className="flex text-[#f9ab00]">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    ))}
                  </div>
                  <span>Rating: 4.8</span>
                </div>
                <span>•</span>
                <span>25 min</span>
                <span>•</span>
                <span>Easy</span>
              </div>
            </div>
          </div>

          {/* SEO Score */}
          <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-8">
              SEO Score
              <HelpCircle className="w-4 h-4 text-muted-foreground/40" />
            </h2>
            
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="364" strokeDashoffset={364 - (364 * 92) / 100} className="text-green-500 transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white leading-none">92</span>
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-1">Excellent</span>
                </div>
              </div>

              <div className="w-full space-y-4">
                <p className="text-sm font-medium text-slate-400 text-center mb-4">Great job! Your page is SEO-optimized.</p>
                {[
                  { label: 'SEO Title', status: 'Good' },
                  { label: 'Meta Description', status: 'Good' },
                  { label: 'Focus Keyword', status: 'Good' },
                  { label: 'Content Length', status: 'Good' },
                  { label: 'Image Alt Text', status: 'Good' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-[13px] font-bold">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-green-500">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SEO Analysis */}
          <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                SEO Analysis
                <HelpCircle className="w-4 h-4 text-muted-foreground/40" />
              </h2>
              <button className="text-[11px] font-black text-[#5850ec] uppercase tracking-widest hover:underline">View Details</button>
            </div>

            <div className="space-y-4">
              {[
                { text: 'Focus keyword is used in the SEO title.', type: 'success' },
                { text: 'Meta description is well optimized.', type: 'success' },
                { text: 'URL is short and SEO friendly.', type: 'success' },
                { text: 'Image alt text is set.', type: 'success' },
                { text: 'Add more content to improve your ranking.', type: 'warning' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  {item.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  )}
                  <span className="text-[13px] font-medium text-slate-400 leading-tight">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
