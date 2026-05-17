'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, Save, Loader2, Info, CheckCircle2, AlertCircle, ArrowUpRight, 
  ArrowDownRight, Globe, AlertTriangle, RefreshCw, Smartphone, Key, Lock, 
  ToggleLeft, ToggleRight, FileText, Check, Play, Settings2, BarChart3, Activity
} from 'lucide-react';
import { 
  useGetWebmasterToolsQuery, 
  useUpdateWebmasterToolsMutation,
  useGetCrawlReportsQuery,
  useRunCrawlScanMutation
} from '@/store/api/seoApi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, BarChart, Bar, Legend
} from 'recharts';
import { toast } from 'sonner';

// Simulated high-fidelity Search Console performance logs
const searchConsoleStats = [
  { date: 'May 10', clicks: 120, impressions: 3400, ctr: 3.5, position: 14.2 },
  { date: 'May 11', clicks: 145, impressions: 3800, ctr: 3.8, position: 13.8 },
  { date: 'May 12', clicks: 190, impressions: 4200, ctr: 4.5, position: 12.5 },
  { date: 'May 13', clicks: 165, impressions: 4000, ctr: 4.1, position: 12.9 },
  { date: 'May 14', clicks: 220, impressions: 4900, ctr: 4.4, position: 11.8 },
  { date: 'May 15', clicks: 250, impressions: 5300, ctr: 4.7, position: 11.2 },
  { date: 'May 16', clicks: 240, impressions: 5100, ctr: 4.7, position: 11.5 },
];

export default function WebmasterToolsPage() {
  const [activeTab, setActiveTab] = useState<'google' | 'bing' | 'health' | 'settings'>('google');
  
  const { data: webmasterTools, isLoading } = useGetWebmasterToolsQuery();
  const [updateWebmaster, { isLoading: isUpdating }] = useUpdateWebmasterToolsMutation();
  
  const { data: crawlReports, refetch: refetchCrawl } = useGetCrawlReportsQuery();
  const [runCrawlScan, { isLoading: isScanning }] = useRunCrawlScanMutation();

  const [formData, setFormData] = useState({
    googleVerification: '',
    bingVerification: '',
    yandexVerification: '',
    pinterestVerify: '',
    sitemapUrl: '',
    autoSitemapSubmit: true,
  });

  const [scanResult, setScanResult] = useState<any>(null);

  useEffect(() => {
    if (webmasterTools) {
      setFormData({
        googleVerification: webmasterTools.googleVerification || '',
        bingVerification: webmasterTools.bingVerification || '',
        yandexVerification: webmasterTools.yandexVerification || '',
        pinterestVerify: webmasterTools.pinterestVerify || '',
        sitemapUrl: webmasterTools.sitemapUrl || '',
        autoSitemapSubmit: webmasterTools.autoSitemapSubmit ?? true,
      });
    }
  }, [webmasterTools]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateWebmaster(formData).unwrap();
      toast.success('Webmaster tools settings updated successfully');
    } catch {
      toast.error('Failed to update webmaster settings');
    }
  };

  const handleCrawlScan = async () => {
    try {
      const res = await runCrawlScan().unwrap();
      setScanResult(res);
      refetchCrawl();
      toast.success('Automated website SEO health audit completed!');
    } catch {
      toast.error('Crawl scan failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#5850ec]" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading Webmaster Tools...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub tabs navigation */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5 max-w-xl">
        {[
          { id: 'google', label: 'Google Search Console', icon: BarChart3 },
          { id: 'bing', label: 'Bing Webmaster', icon: Globe },
          { id: 'health', label: 'Site Health & Audit', icon: Activity },
          { id: 'settings', label: 'Verification Settings', icon: Settings2 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-indigo-600/90 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE TAB */}

      {/* 1. Google Search Console Dashboard */}
      {activeTab === 'google' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Metric 1 */}
            <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-indigo-500/5 blur-[40px] pointer-events-none" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Indexed Pages</p>
              <h3 className="text-2xl font-black text-white">124 <span className="text-[10px] font-bold text-slate-500">/ 136 submitted</span></h3>
              <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 mt-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 91.2% Index Coverage
              </span>
            </div>

            {/* Metric 2 */}
            <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-blue-500/5 blur-[40px] pointer-events-none" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total Clicks (28d)</p>
              <h3 className="text-2xl font-black text-white">1,410</h3>
              <span className="flex items-center gap-0.5 text-[9px] font-black text-emerald-400 mt-2">
                <ArrowUpRight className="h-3 w-3" /> +12.4% vs last month
              </span>
            </div>

            {/* Metric 3 */}
            <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-emerald-500/5 blur-[40px] pointer-events-none" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Avg Click-Through Rate (CTR)</p>
              <h3 className="text-2xl font-black text-white">4.38%</h3>
              <span className="flex items-center gap-0.5 text-[9px] font-black text-emerald-400 mt-2">
                <ArrowUpRight className="h-3 w-3" /> +8.2% CTR growth
              </span>
            </div>

            {/* Metric 4 */}
            <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-amber-500/5 blur-[40px] pointer-events-none" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Average Position</p>
              <h3 className="text-2xl font-black text-white">#12.8</h3>
              <span className="flex items-center gap-0.5 text-[9px] font-black text-emerald-400 mt-2">
                <ArrowDownRight className="h-3 w-3" /> -1.4 rank positions (improved)
              </span>
            </div>
          </div>

          {/* Recharts Clicks & Impressions Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-8 rounded-[32px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 blur-[80px] pointer-events-none rounded-full" />
              <div className="border-b border-white/5 pb-4 mb-6">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Search Performance Trends
                </h3>
                <p className="text-[11px] text-muted-foreground/60">Impressions vs Clicks from Google Search logs</p>
              </div>

              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={searchConsoleStats}>
                    <defs>
                      <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#272a35" opacity={0.2} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f111a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="impressions" name="Impressions" stroke="#818cf8" fillOpacity={1} fill="url(#colorImpressions)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#10b981" fillOpacity={1} fill="url(#colorClicks)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Position and Rank trend */}
            <div className="p-8 rounded-[32px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-amber-500/5 blur-[60px] pointer-events-none rounded-full" />
              <div className="border-b border-white/5 pb-4 mb-6">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Average Rank Position Trend
                </h3>
                <p className="text-[11px] text-muted-foreground/60">Search rank average positions (lower is better)</p>
              </div>

              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={searchConsoleStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#272a35" opacity={0.2} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} reversed />
                    <Tooltip contentStyle={{ backgroundColor: '#0f111a', border: '1px solid rgba(255,255,255,0.05)' }} />
                    <Line type="monotone" dataKey="position" name="Avg Position" stroke="#fbbf24" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sitemaps and Crawl Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-8 rounded-[32px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 space-y-4">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-bold text-white">Sitemaps submitted on Google</h3>
                <p className="text-[11px] text-muted-foreground/60">XML index maps submitted directly to Google crawler</p>
              </div>

              <div className="overflow-x-auto text-xs font-semibold">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                      <th className="pb-3">Sitemap URL</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Submitted Date</th>
                      <th className="pb-3">Last Read</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="py-3 text-white font-mono">/sitemap.xml</td>
                      <td className="py-3 text-slate-300">Sitemap Index</td>
                      <td className="py-3 text-slate-400">May 01, 2026</td>
                      <td className="py-3 text-slate-400">May 16, 2026</td>
                      <td className="py-3 text-right text-emerald-400">Success</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-white font-mono">/sitemap-recipes.xml</td>
                      <td className="py-3 text-slate-300">Recipe Schema URLs</td>
                      <td className="py-3 text-slate-400">May 03, 2026</td>
                      <td className="py-3 text-slate-400">May 16, 2026</td>
                      <td className="py-3 text-right text-emerald-400">Success</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Core Web Vitals / Mobile usability */}
            <div className="p-8 rounded-[32px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 space-y-4">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-bold text-white">Mobile Usability Status</h3>
                <p className="text-[11px] text-muted-foreground/60">Mobile friendly page audit statuses</p>
              </div>

              <div className="space-y-4 font-semibold text-xs">
                <div className="flex items-center justify-between p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none">Usable Mobile URLs</span>
                    <p className="text-sm font-black text-white mt-0.5">124 Pages</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none">Mobile Usability Errors</span>
                    <p className="text-sm font-black text-white mt-0.5">0 Pages</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Bing Webmaster Dashboard */}
      {activeTab === 'bing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Metric 1 */}
            <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-indigo-500/5 blur-[40px] pointer-events-none" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Bing Indexed URLs</p>
              <h3 className="text-2xl font-black text-white">88 <span className="text-[10px] font-bold text-slate-500">/ 136 submitted</span></h3>
              <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 mt-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 64.7% Index Coverage
              </span>
            </div>

            {/* Metric 2 */}
            <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-blue-500/5 blur-[40px] pointer-events-none" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">SEO Suggestions</p>
              <h3 className="text-2xl font-black text-white text-amber-400">12 Warnings</h3>
              <span className="flex items-center gap-0.5 text-[9px] font-black text-slate-400 mt-2">
                All minor optimization points
              </span>
            </div>

            {/* Metric 3 */}
            <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-emerald-500/5 blur-[40px] pointer-events-none" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Crawl Information (28d)</p>
              <h3 className="text-2xl font-black text-white">2.4k Requests</h3>
              <span className="flex items-center gap-0.5 text-[9px] font-black text-emerald-400 mt-2">
                No crawler errors detected
              </span>
            </div>

            {/* Metric 4 */}
            <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-amber-500/5 blur-[40px] pointer-events-none" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Site Scan Status</p>
              <h3 className="text-2xl font-black text-emerald-400">100% Secure</h3>
              <span className="flex items-center gap-0.5 text-[9px] font-black text-emerald-400 mt-2">
                Passed last automatic scan
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top SEO recommendations */}
            <div className="lg:col-span-2 p-8 rounded-[32px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 space-y-4">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-bold text-white">Bing SEO Analyzer Recommendations</h3>
                <p className="text-[11px] text-muted-foreground/60">SEO guidelines warnings triggered on crawl audits</p>
              </div>

              <div className="space-y-3 font-semibold text-xs">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-white text-xs font-bold">Missing &lt;alt&gt; attribute on images</p>
                    <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                      Detected on 4 recipe page headers. Search crawlers rely on image alt tags to interpret the visual context.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-white text-xs font-bold">Meta Description too short</p>
                    <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                      Detected on 2 categories. Ensure your meta description is between 120 and 160 characters for optimum preview snippets.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bing index stats summary */}
            <div className="p-8 rounded-[32px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 space-y-4">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-bold text-white">Bing Site Scan Index</h3>
                <p className="text-[11px] text-muted-foreground/60">Deep site crawler status breakdown</p>
              </div>

              <div className="space-y-3.5 font-semibold text-xs">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Total crawled pages</span>
                  <span className="text-white">136 URLs</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Successful index</span>
                  <span className="text-emerald-400">88 URLs</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Excluded URLs</span>
                  <span className="text-slate-500">48 URLs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Site Health & Audit (Crawl scan report) */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          {/* Site Health Widgets Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Widget 1: robots.txt */}
            <div className="p-5 rounded-3xl bg-[#0b0c16]/90 border border-white/5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">Robots.txt status</p>
                <p className="text-xs font-black text-white mt-1">VALID</p>
                <span className="text-[8px] text-emerald-400 block mt-1 font-bold">100% crawl permissions</span>
              </div>
            </div>

            {/* Widget 2: sitemap */}
            <div className="p-5 rounded-3xl bg-[#0b0c16]/90 border border-white/5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">Sitemap validation</p>
                <p className="text-xs font-black text-white mt-1">VALID INDEX</p>
                <span className="text-[8px] text-emerald-400 block mt-1 font-bold">Includes recipe XMLs</span>
              </div>
            </div>

            {/* Widget 3: SSL detection */}
            <div className="p-5 rounded-3xl bg-[#0b0c16]/90 border border-white/5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">SSL Security Audit</p>
                <p className="text-xs font-black text-white mt-1">ACTIVE HTTPS</p>
                <span className="text-[8px] text-emerald-400 block mt-1 font-bold">Strong SHA-256 certificate</span>
              </div>
            </div>

            {/* Widget 4: mobile friendly */}
            <div className="p-5 rounded-3xl bg-[#0b0c16]/90 border border-white/5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">Mobile responsive</p>
                <p className="text-xs font-black text-white mt-1">PASS</p>
                <span className="text-[8px] text-emerald-400 block mt-1 font-bold">Passed Google Lighthouse viewport checks</span>
              </div>
            </div>
          </div>

          {/* Run New Audit trigger panel */}
          <div className="p-8 rounded-[32px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#5850ec]/5 blur-[80px] pointer-events-none rounded-full" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Live Audit Site Health Scan
                </h3>
                <p className="text-[11px] text-muted-foreground/60">Simulate a search crawler robot crawling and validating key permalink layouts</p>
              </div>

              <button
                onClick={handleCrawlScan}
                disabled={isScanning}
                className="px-6 py-3 bg-[#5850ec] hover:bg-[#4a42df] disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                {isScanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Run Live Audit Scan
              </button>
            </div>

            {/* Table listing crawl reports */}
            <div className="pt-6 space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Crawl Reports ({crawlReports?.length || 4})</h4>
              
              <div className="overflow-x-auto text-xs font-semibold">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-500">
                      <th className="pb-3">Path</th>
                      <th className="pb-3">HTTP Code</th>
                      <th className="pb-3">Last Checked</th>
                      <th className="pb-3">Discovered Issues</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(crawlReports || []).map((report: any) => (
                      <tr key={report.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 text-white font-mono max-w-[240px] truncate">{report.url}</td>
                        <td className="py-3.5 text-slate-300 font-mono">{report.statusCode || 200}</td>
                        <td className="py-3.5 text-slate-400">
                          {new Date(report.lastCrawled).toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-3.5 max-w-[280px] truncate">
                          {report.issues && report.issues.length > 0 ? (
                            <span className="text-rose-400 font-medium leading-relaxed block truncate">{report.issues[0].message}</span>
                          ) : (
                            <span className="text-slate-500 font-medium">None</span>
                          )}
                        </td>
                        <td className="py-3.5 text-right font-black uppercase tracking-wider">
                          <span className={`px-2.5 py-1 rounded-md text-[9px] font-black ${
                            report.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            report.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Webmaster & Verification Settings */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSubmit} className="bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-6">
          <div className="border-b border-white/5 pb-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#5850ec]" />
              Webmaster Verification & Sitemaps
            </h2>
            <p className="text-[11px] text-muted-foreground/60 mt-1">
              Connect search engines and define index scopes to claim recipes discoverability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Google */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-indigo-400" /> Google site verification meta code
              </label>
              <input 
                type="text" 
                value={formData.googleVerification}
                onChange={(e) => setFormData({ ...formData, googleVerification: e.target.value })}
                placeholder="google-site-verification-token"
                className="w-full bg-background/50 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
              />
              <p className="text-[9px] text-muted-foreground/40 leading-relaxed">
                Enter ownership hash meta code to claiming on Google search dashboards.
              </p>
            </div>

            {/* Bing */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-indigo-400" /> Bing site verification meta code
              </label>
              <input 
                type="text" 
                value={formData.bingVerification}
                onChange={(e) => setFormData({ ...formData, bingVerification: e.target.value })}
                placeholder="bing-verification-token"
                className="w-full bg-background/50 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
              />
              <p className="text-[9px] text-muted-foreground/40 leading-relaxed">
                Verify ownership for Bing Webmaster Tools logs.
              </p>
            </div>

            {/* Sitemap URL */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                Sitemap Index URL
              </label>
              <input 
                type="text" 
                value={formData.sitemapUrl}
                onChange={(e) => setFormData({ ...formData, sitemapUrl: e.target.value })}
                placeholder="https://tastyrecipes.com/sitemap.xml"
                className="w-full bg-background/50 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
              />
              <p className="text-[9px] text-muted-foreground/40 leading-relaxed">
                Provide sitemap URL (defaults to your canonical domain).
              </p>
            </div>

            {/* Auto Submit Switch */}
            <div className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl md:col-span-2 mt-2">
              <div className="space-y-1">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-400" />
                  Auto Sitemap Submission Toggle
                </p>
                <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                  Trigger ping signals to search console crawlers automatically when a recipe is published or updated.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, autoSitemapSubmit: !formData.autoSitemapSubmit })}
                className={`h-7 w-12 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                  formData.autoSitemapSubmit ? 'bg-[#5850ec]' : 'bg-slate-700'
                }`}
              >
                <div className={`h-5 w-5 rounded-full bg-white transition-transform duration-200 transform ${
                  formData.autoSitemapSubmit ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-end gap-3">
            <button 
              type="submit" 
              disabled={isUpdating}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Verification Code Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
