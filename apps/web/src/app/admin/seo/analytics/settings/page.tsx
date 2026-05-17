'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart2, Save, Loader2, Code, ShieldCheck, ArrowLeft, ToggleLeft, ToggleRight, Sparkles, Check, Info
} from 'lucide-react';
import { useGetAnalyticsSettingsQuery, useUpdateAnalyticsSettingsMutation } from '@/store/api/seoApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AnalyticsSettingsPage() {
  const router = useRouter();
  const { data: analyticsSettings, isLoading } = useGetAnalyticsSettingsQuery();
  const [updateAnalytics, { isLoading: isUpdating }] = useUpdateAnalyticsSettingsMutation();

  const [formData, setFormData] = useState({
    googleAnalyticsId: '',
    customScriptsCode: '',
    ga4Id: '',
    gtmId: '',
    analyticsEnabled: true,
    debugMode: false,
    pageTracking: true,
    recipeTracking: true,
    searchTracking: true
  });

  useEffect(() => {
    if (analyticsSettings) {
      let tracking = { pageTracking: true, recipeTracking: true, searchTracking: true };
      if (analyticsSettings.trackingSettings) {
        try {
          const parsed = typeof analyticsSettings.trackingSettings === 'string' 
            ? JSON.parse(analyticsSettings.trackingSettings) 
            : analyticsSettings.trackingSettings;
          tracking = { ...tracking, ...parsed };
        } catch (e) {
          // Fallback
        }
      }
      setFormData({
        googleAnalyticsId: analyticsSettings.googleAnalyticsId || '',
        customScriptsCode: analyticsSettings.customScriptsCode || '',
        ga4Id: analyticsSettings.ga4Id || '',
        gtmId: analyticsSettings.gtmId || '',
        analyticsEnabled: analyticsSettings.analyticsEnabled ?? true,
        debugMode: analyticsSettings.debugMode ?? false,
        pageTracking: tracking.pageTracking ?? true,
        recipeTracking: tracking.recipeTracking ?? true,
        searchTracking: tracking.searchTracking ?? true
      });
    }
  }, [analyticsSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        googleAnalyticsId: formData.googleAnalyticsId,
        customScriptsCode: formData.customScriptsCode,
        ga4Id: formData.ga4Id,
        gtmId: formData.gtmId,
        analyticsEnabled: formData.analyticsEnabled,
        debugMode: formData.debugMode,
        trackingSettings: {
          pageTracking: formData.pageTracking,
          recipeTracking: formData.recipeTracking,
          searchTracking: formData.searchTracking
        }
      };

      await updateAnalytics(payload).unwrap();
      toast.success('GA4 analytics settings saved successfully!');
    } catch (err) {
      toast.error('Failed to update GA4 settings.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#5850ec]" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading Settings Configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/seo/analytics" className="h-10 w-10 flex items-center justify-center rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">Analytics Configuration</h1>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Google Analytics (GA4) & Tag Manager setup</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Settings Panel */}
        <div className="bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 blur-[80px] pointer-events-none rounded-full" />
          
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-[#5850ec]" />
                Primary Tracking Properties
              </h2>
              <p className="text-[11px] text-muted-foreground/60">Configure active global scripts and tracking engines</p>
            </div>
            
            {/* Enable/Disable Master Switch */}
            <button 
              type="button"
              onClick={() => setFormData({ ...formData, analyticsEnabled: !formData.analyticsEnabled })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                formData.analyticsEnabled 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              {formData.analyticsEnabled ? (
                <>
                  <ToggleRight className="h-5 w-5 text-emerald-400" />
                  Analytics Active
                </>
              ) : (
                <>
                  <ToggleLeft className="h-5 w-5 text-slate-500" />
                  Analytics Suspended
                </>
              )}
            </button>
          </div>

          <div className="space-y-6 pt-6">
            {/* GA4 Measurement ID & GTM Container ID Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GA4 ID */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  GA4 Measurement ID
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.ga4Id}
                  onChange={(e) => setFormData({ ...formData, ga4Id: e.target.value })}
                  placeholder="e.g. G-R2BCX12345"
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
                  required={formData.analyticsEnabled && !formData.gtmId}
                />
                <p className="text-[10px] text-muted-foreground/40 leading-relaxed">
                  The primary measurement identifier for Google Analytics 4 tracking.
                </p>
              </div>

              {/* GTM Container ID */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Google Tag Manager ID (Optional)
                </label>
                <input 
                  type="text" 
                  value={formData.gtmId}
                  onChange={(e) => setFormData({ ...formData, gtmId: e.target.value })}
                  placeholder="e.g. GTM-XXXXXXX"
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
                />
                <p className="text-[10px] text-muted-foreground/40 leading-relaxed">
                  Provide to boot Tag Manager tags concurrently alongside Google Analytics.
                </p>
              </div>
            </div>

            {/* Debug Mode Switch */}
            <div className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl">
              <div className="space-y-1">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  Enable GA4 Debug Mode
                </p>
                <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                  Sends pageviews and custom interaction events with debug directives, visible instantly inside GA4's Realtime DebugView dashboard.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, debugMode: !formData.debugMode })}
                className={`h-7 w-12 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                  formData.debugMode ? 'bg-[#5850ec]' : 'bg-slate-700'
                }`}
              >
                <div className={`h-5 w-5 rounded-full bg-white transition-transform duration-200 transform ${
                  formData.debugMode ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Specialized Event Modules Settings */}
        <div className="bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 blur-[80px] pointer-events-none rounded-full" />
          
          <div className="border-b border-white/5 pb-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Code className="h-5 w-5 text-emerald-400" />
              Granular Event Tracking Rules
            </h2>
            <p className="text-[11px] text-muted-foreground/60">Choose specific user actions to stream dynamically to Google Analytics servers</p>
          </div>

          <div className="space-y-4 pt-5 divide-y divide-white/5">
            {/* Rule 1: Page Tracking */}
            <div className="flex items-center justify-between pb-4">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  Pageview Tracking
                </p>
                <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                  Logs user history page transitions automatically as single-page routes changes.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, pageTracking: !formData.pageTracking })}
                className={`h-7 w-12 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                  formData.pageTracking ? 'bg-[#5850ec]' : 'bg-slate-700'
                }`}
              >
                <div className={`h-5 w-5 rounded-full bg-white transition-transform duration-200 transform ${
                  formData.pageTracking ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Rule 2: Recipe Tracking */}
            <div className="flex items-center justify-between py-4">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  Recipe Interaction Events
                </p>
                <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                  Captures dynamic recipe view events, categorizing properties, servings, and cook start logs.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, recipeTracking: !formData.recipeTracking })}
                className={`h-7 w-12 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                  formData.recipeTracking ? 'bg-[#5850ec]' : 'bg-slate-700'
                }`}
              >
                <div className={`h-5 w-5 rounded-full bg-white transition-transform duration-200 transform ${
                  formData.recipeTracking ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Rule 3: Search Tracking */}
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  Search Phrase Queries
                </p>
                <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                  Log user search terms and matching result counts to identify highly searched food keywords.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, searchTracking: !formData.searchTracking })}
                className={`h-7 w-12 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                  formData.searchTracking ? 'bg-[#5850ec]' : 'bg-slate-700'
                }`}
              >
                <div className={`h-5 w-5 rounded-full bg-white transition-transform duration-200 transform ${
                  formData.searchTracking ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Legacy Custom Scripts Overrides */}
        <div className="bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Code className="h-5 w-5 text-indigo-400" />
              Advanced Custom Scripts Overrides
            </h2>
            <p className="text-[11px] text-muted-foreground/60">Inject auxiliary HTML scripts (like Pinterest pixels or custom verify tags) directly into the head element</p>
          </div>
          
          <div className="space-y-2 pt-4">
            <textarea 
              rows={5}
              value={formData.customScriptsCode}
              onChange={(e) => setFormData({ ...formData, customScriptsCode: e.target.value })}
              placeholder="e.g. <!-- Custom Pixel Script -->"
              className="w-full bg-background/60 border border-white/10 rounded-xl px-5 py-3.5 text-xs font-mono text-[#a5b4fc] focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
            />
            <p className="text-[10px] text-muted-foreground/40 leading-relaxed">
              Ensure you input valid HTML &lt;script&gt; tags to prevent UI render blocking.
            </p>
          </div>
        </div>

        {/* Policy Warning */}
        <div className="flex items-start gap-4 p-5 bg-amber-500/5 border border-amber-500/15 rounded-2xl">
          <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-white">Production Synchronization Policy</p>
            <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
              Updates saved will update in-memory caches instantly. Active clients will load scripts automatically starting with their very next page hit.
            </p>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <Link
            href="/admin/seo/analytics"
            className="px-6 py-3.5 border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isUpdating}
            className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-[#5850ec] hover:from-indigo-500 hover:to-[#4e46dd] disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#5850ec]/25 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Tracking Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
