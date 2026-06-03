'use client';

import { useState, useEffect } from 'react';
import { 
  Save, Loader2, Code, ShieldCheck, ArrowLeft, ToggleLeft, ToggleRight
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
    customScriptsCode: '',
    analyticsEnabled: true,
  });

  useEffect(() => {
    if (analyticsSettings) {
      setFormData({
        customScriptsCode: analyticsSettings.customScriptsCode || '',
        analyticsEnabled: analyticsSettings.analyticsEnabled ?? true,
      });
    }
  }, [analyticsSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        customScriptsCode: formData.customScriptsCode,
        analyticsEnabled: formData.analyticsEnabled,
      };

      await updateAnalytics(payload).unwrap();
      toast.success('Analytics settings saved successfully!');
    } catch (err) {
      toast.error('Failed to update analytics settings.');
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
      <div className="flex items-center gap-3">
        <Link href="/admin/seo/analytics" className="h-10 w-10 flex items-center justify-center rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">Analytics Configuration</h1>
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Custom script setup and tracking status</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Settings Panel */}
        <div className="bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 blur-[80px] pointer-events-none rounded-full" />
          
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Code className="h-5 w-5 text-[#5850ec]" />
                Custom Scripts Configuration
              </h2>
              <p className="text-[11px] text-muted-foreground/60">Configure active global scripts and tracking overrides</p>
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
                  Scripts Active
                </>
              ) : (
                <>
                  <ToggleLeft className="h-5 w-5 text-slate-500" />
                  Scripts Suspended
                </>
              )}
            </button>
          </div>

          {/* Legacy Custom Scripts Overrides */}
          <div className="space-y-2 pt-6">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Advanced Custom Scripts Overrides
            </label>
            <textarea 
              rows={8}
              value={formData.customScriptsCode}
              onChange={(e) => setFormData({ ...formData, customScriptsCode: e.target.value })}
              placeholder="e.g. <!-- Custom Pixel/Tracking Script -->"
              className="w-full bg-background/60 border border-white/10 rounded-xl px-5 py-3.5 text-xs font-mono text-[#a5b4fc] focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all resize-y"
            />
            <p className="text-[10px] text-muted-foreground/40 leading-relaxed">
              Ensure you input valid HTML &lt;script&gt; tags to prevent UI render blocking. Auxiliary HTML scripts (like Pinterest pixels or custom verify tags) will be injected directly into the head element.
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
            Save Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
