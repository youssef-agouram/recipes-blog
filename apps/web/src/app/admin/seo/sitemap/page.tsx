'use client';

import { useState } from 'react';
import { 
  Map, Send, CheckCircle2, AlertCircle, RefreshCw, 
  ExternalLink, List, Calendar, HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SitemapManagerPage() {
  const [isPinging, setIsPinging] = useState(false);
  const [pingLogs, setPingLogs] = useState<{ engine: string; time: string; status: 'SUCCESS' | 'PENDING' | 'FAILED' }[]>([
    { engine: 'Google Search Console', time: 'Last submitted: 2 hours ago', status: 'SUCCESS' },
    { engine: 'Bing Webmaster Portal', time: 'Last submitted: Yesterday', status: 'SUCCESS' },
  ]);

  const handlePing = () => {
    setIsPinging(true);
    toast.info('Initiating sitemap submission to search engines...');
    
    setTimeout(() => {
      setIsPinging(false);
      setPingLogs([
        { engine: 'Google Search Console', time: 'Just now', status: 'SUCCESS' },
        { engine: 'Bing Webmaster Portal', time: 'Just now', status: 'SUCCESS' },
      ]);
      toast.success('Sitemaps successfully submitted!');
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Stats & Ping Controls */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Sitemap controls card */}
        <div className="bg-[#0f111a]/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Map className="w-5 h-5 text-[#5850ec]" />
                Sitemap Console
              </h2>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Monitor and manually submit index mapping logs directly to search engines.
              </p>
            </div>

            <button
              onClick={handlePing}
              disabled={isPinging}
              className="px-6 py-3 bg-[#5850ec] hover:bg-[#4d45d1] disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#5850ec]/25 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              {isPinging ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Ping Search Engines
            </button>
          </div>

          {/* Active Sitemap Status */}
          <div className="bg-background/40 border border-white/5 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Active XML Index File</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active & Valid</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-black/35 border border-white/5 rounded-xl text-xs font-mono">
              <span className="text-[#a5b4fc] truncate">/sitemap.xml</span>
              <Link 
                href="/sitemap.xml" 
                target="_blank" 
                className="text-muted-foreground/60 hover:text-white shrink-0 ml-4 flex items-center gap-1 transition-colors"
              >
                Open <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Indexing breakdown */}
          <div className="space-y-4 pt-2">
            <span className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <List className="w-4 h-4 text-[#5850ec]" />
              URL Type Breakdown
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Recipes', count: '1,894', color: 'text-indigo-400' },
                { label: 'Categories', count: '48', color: 'text-purple-400' },
                { label: 'Static Pages', count: '5', color: 'text-emerald-400' },
                { label: 'Total Mapped', count: '1,947', color: 'text-white font-black' },
              ].map((item, index) => (
                <div key={index} className="bg-background/20 border border-white/5 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider">{item.label}</span>
                  <p className={`text-xl font-bold ${item.color}`}>{item.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mock Search Engine Ping Log */}
        <div className="bg-[#0f111a]/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Submission Log History</h3>
            <p className="text-xs text-muted-foreground/50">Details for the last sitemap submission actions.</p>
          </div>

          <div className="space-y-3">
            {pingLogs.map((log, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-background/35 border border-white/5 rounded-2xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-white">{log.engine}</span>
                  <p className="text-[10px] font-bold text-muted-foreground/45 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {log.time}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[9px] font-black text-emerald-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Sent
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column: Information & Help */}
      <div className="space-y-8">
        <div className="bg-[#0f111a]/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-4">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-[#5850ec]" />
            What is a Sitemap?
          </h3>
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
            A sitemap is an XML file where you list the web pages of your site to tell search engine crawlers about the organization of your site content. 
          </p>
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed pt-2">
            Search engine web crawlers like Googlebot read this file to more intelligently crawl your site, ensuring all of your tasty recipes and category pages are properly indexed and ranked!
          </p>
        </div>
      </div>

    </div>
  );
}
