'use client';

import { useState, useEffect } from 'react';
import { 
  Save, Loader2, BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { 
  useGetSiteSettingsQuery, 
  useUpdateSiteSettingsMutation 
} from '@/store/api/settingsApi';
import { toast } from 'sonner';

export default function PagesControlPage() {
  const [mounted, setMounted] = useState(false);
  
  // Settings API hooks
  const { data: settings, isLoading } = useGetSiteSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSiteSettingsMutation();

  const [formData, setFormData] = useState({
    categoriesTitle: '',
    categoriesSubtitle: '',
    blogTitle: '',
    blogSubtitle: '',
    recipesTitle: '',
    recipesSubtitle: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        categoriesTitle: settings.categoriesTitle || 'Browse by Category',
        categoriesSubtitle: settings.categoriesSubtitle || "Find exactly what you're craving. Explore our handpicked recipe collections by course, ingredient, dietary preferences, or preparation style.",
        blogTitle: settings.blogTitle || 'Stories, Guides & Tips',
        blogSubtitle: settings.blogSubtitle || 'Explore our collection of expert culinary guides, cooking techniques, kitchen tips, and lifestyle stories.',
        recipesTitle: settings.recipesTitle || 'Delicious Recipes',
        recipesSubtitle: settings.recipesSubtitle || 'Browse all our handpicked cooking recipes and start your culinary journey today.',
      });
    }
  }, [settings]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async () => {
    try {
      // Merge new page fields into settings data
      const payload = {
        ...settings,
        ...formData
      };
      await updateSettings(payload).unwrap();
      toast.success('Page controls updated successfully!');
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      toast.error('Error saving settings: ' + (err?.message || JSON.stringify(err)));
    }
  };

  if (!mounted) return null;
  if (isLoading) return <div className="p-10 text-center text-slate-400 animate-pulse">Loading settings...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Sticky Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-16 z-10 py-4 bg-[#05060b]/80 backdrop-blur-md border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Pages Control</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
            <Link href="/admin/settings" className="hover:text-white transition-colors">Settings</Link>
            <span className="opacity-30">&gt;</span>
            <span className="text-white/60 text-[10px]">Pages Control</span>
          </div>
        </div>
      </div>
      
      {/* Floating Save Button */}
      <button 
        onClick={handleSave}
        disabled={isUpdating}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-8 py-4 bg-[#5850ec] hover:bg-[#4d45d1] text-white text-sm font-bold rounded-full transition-all shadow-[0_8px_30px_rgba(88,80,236,0.4)] hover:shadow-[0_12px_40px_rgba(88,80,236,0.6)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">About Pages Control</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Configure the header titles and descriptions for the main reader-facing pages. These texts are used to explain the content of each section to the users.
              </p>
            </div>
            
            <div className="p-6 bg-[#5850ec]/5 border border-[#5850ec]/10 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-[#5850ec]">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Page Headings</span>
              </div>
              <p className="text-[12px] text-slate-400 leading-relaxed font-medium">
                Keep the descriptions descriptive yet concise (1-3 sentences) to maintain the premium visual balance across the application headers.
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 lg:p-10 shadow-2xl space-y-8">
            
            {/* Categories Page Control */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Categories Page</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-widest">Page Title</label>
                  <input 
                    type="text" 
                    value={formData.categoriesTitle}
                    onChange={(e) => setFormData({ ...formData, categoriesTitle: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-widest">Page Description</label>
                  <textarea 
                    rows={3}
                    value={formData.categoriesSubtitle}
                    onChange={(e) => setFormData({ ...formData, categoriesSubtitle: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]/50 transition-all resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Recipes Page Control */}
            <section className="space-y-4 pt-6 border-t border-white/5">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Recipes Page</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-widest">Page Title</label>
                  <input 
                    type="text" 
                    value={formData.recipesTitle}
                    onChange={(e) => setFormData({ ...formData, recipesTitle: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-widest">Page Description</label>
                  <textarea 
                    rows={3}
                    value={formData.recipesSubtitle}
                    onChange={(e) => setFormData({ ...formData, recipesSubtitle: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]/50 transition-all resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Blog Page Control */}
            <section className="space-y-4 pt-6 border-t border-white/5">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Blog / Journal Page</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-widest">Page Title</label>
                  <input 
                    type="text" 
                    value={formData.blogTitle}
                    onChange={(e) => setFormData({ ...formData, blogTitle: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-widest">Page Description</label>
                  <textarea 
                    rows={3}
                    value={formData.blogSubtitle}
                    onChange={(e) => setFormData({ ...formData, blogSubtitle: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]/50 transition-all resize-none"
                  />
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
