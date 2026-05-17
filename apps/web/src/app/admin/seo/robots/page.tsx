'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, Save, Loader2, Info, CheckCircle2, 
  HelpCircle, Eye, ShieldAlert
} from 'lucide-react';
import { useGetSeoSettingsQuery, useUpdateSeoSettingsMutation } from '@/store/api/seoApi';
import { toast } from 'sonner';

export default function RobotsTxtPage() {
  const { data: seoSettings, isLoading } = useGetSeoSettingsQuery();
  const [updateSeo, { isLoading: isUpdating }] = useUpdateSeoSettingsMutation();

  const [robotsTxt, setRobotsTxt] = useState('');

  useEffect(() => {
    if (seoSettings) {
      setRobotsTxt(seoSettings.robotsTxt || 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /editor/');
    }
  }, [seoSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Gather existing SEO settings to update alongside robotsTxt
      const updatedData = {
        ...seoSettings,
        robotsTxt
      };
      await updateSeo(updatedData).unwrap();
      toast.success('Robots.txt rules updated successfully');
    } catch {
      toast.error('Failed to update robots.txt rules');
    }
  };

  const handleInsertRule = (rule: string) => {
    setRobotsTxt(prev => prev + (prev.endsWith('\n') || prev === '' ? '' : '\n') + rule + '\n');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#5850ec]" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Robots Directives...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Code Editor */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="bg-[#0f111a]/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#5850ec]" />
                Robots.txt Directives Editor
              </h2>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Customize instructions for search engine web crawlers.
              </p>
            </div>
          </div>

          {/* Interactive Code Editor with line numbers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-300 uppercase tracking-widest">Directives File Editor</label>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Online</span>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/60 font-mono text-sm leading-relaxed flex">
              {/* Line numbers column */}
              <div className="bg-black/30 px-3 py-4 text-right text-muted-foreground/35 select-none text-xs border-r border-white/5 flex flex-col min-w-[3rem]">
                {robotsTxt.split('\n').map((_, idx) => (
                  <span key={idx}>{idx + 1}</span>
                ))}
              </div>
              
              {/* Actual Textarea code block */}
              <textarea 
                rows={10}
                value={robotsTxt}
                onChange={(e) => setRobotsTxt(e.target.value)}
                placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /admin/"
                className="w-full bg-transparent px-5 py-4 text-[#a5b4fc] focus:outline-none resize-none overflow-y-auto leading-relaxed border-0"
              />
            </div>
            
            <p className="text-[10px] text-muted-foreground/40 leading-relaxed mt-1">
              Changes take effect immediately and are dynamic under the <code>/robots.txt</code> path.
            </p>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button 
              type="submit" 
              disabled={isUpdating}
              className="px-8 py-3.5 bg-[#5850ec] hover:bg-[#4d45d1] disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#5850ec]/25 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Robots.txt
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Rule helpers & Guidelines */}
      <div className="space-y-8">
        
        {/* Preset Helper tools */}
        <div className="bg-[#0f111a]/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-4">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#5850ec]" />
            Insert Preset Directives
          </h3>
          <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
            Quickly append common rules directly to your editor console with one click.
          </p>

          <div className="space-y-2 pt-2">
            {[
              { label: 'Disallow Admin folders', code: 'Disallow: /admin/' },
              { label: 'Disallow API folders', code: 'Disallow: /api/' },
              { label: 'Allow everything', code: 'User-agent: *\nAllow: /' },
              { label: 'Disallow everything', code: 'User-agent: *\nDisallow: /' }
            ].map((preset, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleInsertRule(preset.code)}
                className="w-full text-left px-4 py-2.5 bg-background/40 hover:bg-background/80 border border-white/5 rounded-xl text-[10px] font-bold text-slate-300 transition-all cursor-pointer truncate"
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Security Alert notice */}
        <div className="bg-[#0f111a]/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-4">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            Directives Warning
          </h3>
          <p className="text-[11px] text-muted-foreground/60 leading-normal">
            Mistakes in robots.txt rules can cause search engines like Google or Bing to drop your index entirely. 
          </p>
          <p className="text-[11px] text-muted-foreground/60 leading-normal">
            Ensure that public recipes and categories (paths starting with <code>/recipes</code> or <code>/categories</code>) are never set to <strong>Disallow</strong>.
          </p>
        </div>

      </div>

    </div>
  );
}
