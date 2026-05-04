'use client';

import { useGetHeroSettingsQuery, useUpdateHeroSettingsMutation } from '@/store/api/settingsApi';
import { Save, Image as ImageIcon, Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const { data: settings, isLoading } = useGetHeroSettingsQuery();
  const [updateHero, { isLoading: isUpdating }] = useUpdateHeroSettingsMutation();
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    ctaText: '',
    imageUrl: ''
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        title: settings.title,
        subtitle: settings.subtitle,
        ctaText: settings.ctaText,
        imageUrl: settings.imageUrl || ''
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateHero(formData).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-[#8b929d]">Loading settings...</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#e4e6eb]">Homepage Settings</h1>
        <p className="text-sm text-[#8b929d] mt-1">Control the main sections of your public homepage.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Hero Section Control */}
        <section className="rounded-xl border border-[#272a35] bg-[#1a1d26] overflow-hidden">
          <div className="p-6 border-b border-[#272a35] bg-[#141821]/50">
            <h2 className="font-bold text-[#e4e6eb]">Hero Section</h2>
            <p className="text-xs text-[#8b929d] mt-1">The first thing users see when they land on your site.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#8b929d]">Main Title</label>
                <input 
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full h-11 rounded-lg border border-[#272a35] bg-[#141821] px-4 text-sm text-[#e4e6eb] focus:outline-none focus:ring-1 focus:ring-[#f29e1f]/50"
                  placeholder="e.g. Good Food, Good Mood"
                />
                <p className="text-[10px] text-[#8b929d]">Use a comma to split the title into two lines (e.g. Good Food, Good Mood)</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#8b929d]">CTA Button Text</label>
                <input 
                  type="text"
                  value={formData.ctaText}
                  onChange={(e) => setFormData({...formData, ctaText: e.target.value})}
                  className="w-full h-11 rounded-lg border border-[#272a35] bg-[#141821] px-4 text-sm text-[#e4e6eb] focus:outline-none focus:ring-1 focus:ring-[#f29e1f]/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#8b929d]">Subtitle / Description</label>
              <textarea 
                rows={3}
                value={formData.subtitle}
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                className="w-full rounded-lg border border-[#272a35] bg-[#141821] p-4 text-sm text-[#e4e6eb] focus:outline-none focus:ring-1 focus:ring-[#f29e1f]/50 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#8b929d]">Hero Image URL</label>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b929d]" />
                  <input 
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full h-11 rounded-lg border border-[#272a35] bg-[#141821] pl-10 pr-4 text-sm text-[#e4e6eb] focus:outline-none focus:ring-1 focus:ring-[#f29e1f]/50"
                    placeholder="https://..."
                  />
                </div>
                {formData.imageUrl && (
                  <div className="h-11 w-11 rounded-lg border border-[#272a35] overflow-hidden shrink-0">
                    <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                {saved && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                    <Check className="h-3 w-3" /> Changes Saved
                  </span>
                )}
              </div>
              <button 
                type="submit"
                disabled={isUpdating}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[#f29e1f] px-8 text-sm font-bold text-[#0f1117] transition-all hover:bg-[#f29e1f]/90 disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </section>

        {/* Other sections could go here */}
        <div className="p-8 rounded-xl border border-dashed border-[#272a35] text-center">
          <p className="text-xs text-[#8b929d] uppercase tracking-widest font-bold">More controls coming soon</p>
        </div>
      </div>
    </div>
  );
}
