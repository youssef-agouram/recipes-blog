'use client';

import { useState, useEffect } from 'react';
import { 
  Globe, Save, Loader2, Info, ChevronDown, CheckCircle2,
  Sparkles, Monitor, Smartphone, Palette, Eye
} from 'lucide-react';
import { useGetSeoSettingsQuery, useUpdateSeoSettingsMutation } from '@/store/api/seoApi';
import { toast } from 'sonner';

export default function GlobalSEOPage() {
  const { data: seoSettings, isLoading } = useGetSeoSettingsQuery();
  const [updateSeo, { isLoading: isUpdating }] = useUpdateSeoSettingsMutation();

  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const [formData, setFormData] = useState({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogImage: '',
    twitterCard: 'summary_large_image',
    canonicalUrl: '',
    robotsTxt: '',
    brandName: '',
    twitterUsername: '',
    themeColor: '#5850ec'
  });

  useEffect(() => {
    if (seoSettings) {
      setFormData({
        metaTitle: seoSettings.metaTitle || '',
        metaDescription: seoSettings.metaDescription || '',
        metaKeywords: seoSettings.metaKeywords || '',
        ogImage: seoSettings.ogImage || '',
        twitterCard: seoSettings.twitterCard || 'summary_large_image',
        canonicalUrl: seoSettings.canonicalUrl || '',
        robotsTxt: seoSettings.robotsTxt || 'User-agent: *\nAllow: /',
        brandName: seoSettings.brandName || 'TastyRecipes',
        twitterUsername: seoSettings.twitterUsername || '@tastyrecipes',
        themeColor: seoSettings.themeColor || '#5850ec'
      });
    }
  }, [seoSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSeo(formData).unwrap();
      toast.success('Global SEO settings saved successfully');
    } catch (err) {
      toast.error('Failed to save global SEO settings');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#5850ec]" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Global SEO...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Form inputs */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="bg-[#0f111a]/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#5850ec]" />
              Global SEO Identity
            </h2>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Configure search indexing variables and base metadata parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            
            {/* Site Title / Default Meta Title */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-300 uppercase tracking-widest">Site Title (Meta Title)</label>
                <span className={`text-[10px] font-bold ${formData.metaTitle.length > 60 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {formData.metaTitle.length} / 60 chars
                </span>
              </div>
              <input 
                type="text" 
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="e.g. TastyRecipes - Best Food and Cooking Recipes"
                className="w-full bg-background/50 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
                required
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-300 uppercase tracking-widest">Meta Description</label>
                <span className={`text-[10px] font-bold ${formData.metaDescription.length > 160 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {formData.metaDescription.length} / 160 chars
                </span>
              </div>
              <textarea 
                rows={4}
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="e.g. Find the best and most delicious cooking recipes online on TastyRecipes."
                className="w-full bg-background/50 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all resize-none leading-relaxed"
                required
              />
            </div>

            {/* Brand Name */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 uppercase tracking-widest">Brand Name</label>
              <input 
                type="text" 
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                placeholder="e.g. TastyRecipes"
                className="w-full bg-background/50 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
                required
              />
            </div>

            {/* Canonical Base URL */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 uppercase tracking-widest">Canonical Base URL</label>
              <input 
                type="url" 
                value={formData.canonicalUrl}
                onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                placeholder="e.g. https://tastyrecipes.com"
                className="w-full bg-background/50 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
                required
              />
            </div>

            {/* Meta Keywords */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-slate-300 uppercase tracking-widest">Keywords (comma-separated)</label>
              <input 
                type="text" 
                value={formData.metaKeywords}
                onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                placeholder="e.g. recipes, cooking, food, easy recipes, quick dinner"
                className="w-full bg-background/50 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
              />
            </div>

            {/* Default OpenGraph Image URL */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-slate-300 uppercase tracking-widest">Default OpenGraph Image URL</label>
              <input 
                type="text" 
                value={formData.ogImage}
                onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                placeholder="e.g. https://tastyrecipes.com/images/og-default.jpg"
                className="w-full bg-background/50 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
              />
            </div>

            {/* Twitter Username */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 uppercase tracking-widest">Twitter Username</label>
              <input 
                type="text" 
                value={formData.twitterUsername}
                onChange={(e) => setFormData({ ...formData, twitterUsername: e.target.value })}
                placeholder="e.g. @tastyrecipes"
                className="w-full bg-background/50 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
              />
            </div>

            {/* Theme Color Picker */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#5850ec]" />
                Brand Theme Color
              </label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={formData.themeColor}
                  onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                  className="w-12 h-12 bg-background border border-white/10 rounded-xl cursor-pointer p-1"
                />
                <input 
                  type="text" 
                  value={formData.themeColor}
                  onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                  placeholder="#5850ec"
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2 text-sm font-mono text-[#a5b4fc] focus:outline-none focus:ring-1 focus:ring-[#5850ec]"
                />
              </div>
            </div>

          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={isUpdating}
              className="px-8 py-3.5 bg-[#5850ec] hover:bg-[#4d45d1] disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#5850ec]/25 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Global SEO
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Previews */}
      <div className="space-y-8">
        
        {/* Live Search Engine Preview */}
        <div className="bg-[#0f111a]/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-black text-white uppercase tracking-widest">
              Google Preview
            </h2>
            <div className="flex items-center bg-background border border-white/5 p-1 rounded-xl">
              <button 
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${previewMode === 'desktop' ? 'bg-[#5850ec] text-white' : 'text-muted-foreground/40 hover:text-white'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${previewMode === 'mobile' ? 'bg-[#5850ec] text-white' : 'text-muted-foreground/40 hover:text-white'}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Google Result Mock */}
          <div className={`bg-white rounded-2xl p-6 shadow-xl border border-black/5 ${previewMode === 'mobile' ? 'max-w-[340px] mx-auto' : ''}`}>
            <div className="flex items-center gap-2 text-xs text-[#202124] mb-1 font-sans">
              <Globe className="w-4 h-4 text-[#5f6368]" />
              <span className="truncate">
                {formData.canonicalUrl || 'https://tastyrecipes.com'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#70757a]" />
            </div>
            <h3 className="text-[19px] text-[#1a0dab] font-medium leading-tight mb-2 hover:underline cursor-pointer font-sans truncate">
              {formData.metaTitle || 'TastyRecipes - Best Food and Cooking Recipes'}
            </h3>
            <p className="text-[13px] text-[#4d5156] leading-snug font-sans break-words line-clamp-3">
              {formData.metaDescription || 'Find the best and most delicious cooking recipes online on TastyRecipes.'}
            </p>
          </div>
          
          <div className="flex items-center gap-2.5 p-4.5 bg-white/5 border border-white/5 rounded-2xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
              Google preview displays a simulated search card display. Keep your title below 60 chars and description below 160 chars to avoid content truncation.
            </p>
          </div>
        </div>

        {/* Real-time Accent Glow preview */}
        <div className="bg-[#0f111a]/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-4">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#5850ec]" />
            Accent Preview
          </h3>
          <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
            Search engines (such as Google Mobile Search and Android Chrome headers) utilize the theme color parameter to brand search cards and dynamic taskbars.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <div 
              className="w-10 h-10 rounded-full blur-sm animate-pulse"
              style={{ 
                backgroundColor: formData.themeColor,
                boxShadow: `0 0 15px ${formData.themeColor}`
              }}
            />
            <div className="space-y-1">
              <span className="text-xs font-black text-white uppercase">{formData.brandName || 'TastyRecipes'}</span>
              <p className="text-[10px] font-bold font-mono text-muted-foreground/40">{formData.themeColor}</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
