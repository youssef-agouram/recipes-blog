'use client';

import { useState } from 'react';
import { 
  Globe, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Monitor, Smartphone, 
  Map, FileText, Gauge, TrendingUp, Info, Zap, RefreshCw, Loader2, Lock, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { 
  useGetSeoHealthQuery,
  useRunTechnicalScanMutation
} from '@/store/api/seoApi';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { toast } from 'sonner';

export default function AdminSEODashboardPage() {
  const { data: healthHistory, isLoading, refetch } = useGetSeoHealthQuery();
  const [runScan, { isLoading: isScanning }] = useRunTechnicalScanMutation();

  const handleScan = async () => {
    try {
      await runScan().unwrap();
      toast.success('Live database SEO technical audit completed!');
      refetch();
    } catch {
      toast.error('Automated scan failed. Please verify API server state.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#5850ec]" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading SEO Health Dashboard...</p>
      </div>
    );
  }

  // Get current active report (last item in history)
  const currentReport = healthHistory && healthHistory.length > 0 
    ? healthHistory[healthHistory.length - 1] 
    : {
        healthScore: 92,
        sitemapStatus: 'valid',
        robotsStatus: 'valid',
        sslStatus: 'valid',
        mobileFriendly: 'valid',
        indexedPages: 124,
        crawlErrorsCount: 1,
        duplicateMetaCount: 1,
        detectionDate: new Date()
      };

  const seoScore = currentReport.healthScore;

  // Formatting historical scan records for Recharts
  const chartData = (healthHistory || []).map((rep: any) => ({
    date: new Date(rep.detectionDate).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    score: rep.healthScore,
    errors: rep.crawlErrorsCount,
    duplicates: rep.duplicateMetaCount
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-indigo-400 animate-pulse" />
            Live Site Health Assessment
          </h2>
          <p className="text-[11px] text-muted-foreground/60">Inspect dynamic recipes, missing metadata indexes, and technical crawling issues.</p>
        </div>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="h-11 px-6 inline-flex items-center justify-center gap-2 bg-[#5850ec] hover:bg-[#4a42df] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer shrink-0"
        >
          {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Run Technical SEO Audit
        </button>
      </div>

      {/* Overview Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* WIDGET 1: SEO Score (Animated circular gauge with neon glow) */}
        <div className="bg-[#0f111a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden group hover:border-[#5850ec]/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#5850ec]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest">SEO Health Score</span>
            <Sparkles className="w-4 h-4 text-[#5850ec] animate-pulse" />
          </div>

          <div className="relative flex items-center justify-center my-2">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="46"
                className="stroke-white/5"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r="46"
                className={`transition-all duration-1000 ease-out ${
                  seoScore >= 90 ? 'stroke-emerald-400' :
                  seoScore >= 75 ? 'stroke-indigo-500' : 'stroke-rose-500'
                }`}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - seoScore / 100)}
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 6px ${seoScore >= 90 ? '#10b981' : '#5850ec'})`
                }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-white">{seoScore}%</span>
              <span className={`text-[8px] font-black uppercase tracking-wider ${
                seoScore >= 90 ? 'text-emerald-400' : 'text-indigo-400'
              }`}>
                {seoScore >= 90 ? 'Optimal' : 'Needs Work'}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground/50 text-center mt-3">
            {seoScore >= 90 ? 'Excellent metadata health' : 'Run automated checks to fix issues'}
          </span>
        </div>

        {/* WIDGET 2: Indexed Pages */}
        <div className="bg-[#0f111a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-[#a855f7]/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#a855f7]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest">Indexed URL Count</span>
            <Globe className="w-4 h-4 text-purple-400 animate-pulse" />
          </div>

          <div className="space-y-1.5 my-2">
            <h3 className="text-4xl font-black text-white tracking-tight">{currentReport.indexedPages}</h3>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 animate-pulse" /> Active search presence
            </div>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground/50">Dynamic XML Index Synchronized</span>
        </div>

        {/* WIDGET 3: Crawl Errors Count */}
        <div className="bg-[#0f111a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest">Broken Permalinks</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>

          <div className="space-y-1.5 my-2">
            <h3 className={`text-4xl font-black tracking-tight ${
              currentReport.crawlErrorsCount > 0 ? 'text-rose-400' : 'text-white'
            }`}>
              {currentReport.crawlErrorsCount}
            </h3>
            <div className={`flex items-center gap-1.5 text-[9px] font-black ${
              currentReport.crawlErrorsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {currentReport.crawlErrorsCount > 0 ? (
                <>⚠️ Active 404 links detected</>
              ) : (
                <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Clean crawl logs</>
              )}
            </div>
          </div>
          <Link href="/admin/seo/crawl-errors" className="text-[10px] font-black uppercase text-indigo-400 hover:underline">
            Manage Broken Permalinks &gt;
          </Link>
        </div>

        {/* WIDGET 4: Duplicate Metadata Warnings */}
        <div className="bg-[#0f111a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest">Metadata Warnings</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>

          <div className="space-y-1.5 my-2">
            <h3 className={`text-4xl font-black tracking-tight ${
              currentReport.duplicateMetaCount > 0 ? 'text-amber-400' : 'text-white'
            }`}>
              {currentReport.duplicateMetaCount}
            </h3>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-300">
              Duplicates or missing headers
            </div>
          </div>
          <Link href="/admin/seo/technical" className="text-[10px] font-black uppercase text-indigo-400 hover:underline">
            Inspect Meta Warnings &gt;
          </Link>
        </div>
      </div>

      {/* Middle Health Verification Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Core Checklist */}
        <div className="lg:col-span-2 p-8 rounded-[32px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 shadow-2xl space-y-5">
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
              Technical Core Checklist
            </h3>
            <p className="text-[11px] text-muted-foreground/60">Validation rules verified across your food platform</p>
          </div>

          <div className="space-y-3 font-semibold text-xs text-slate-300">
            {/* Rule 1: Sitemap */}
            <div className="flex items-center justify-between p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
              <span className="flex items-center gap-2">
                <Map className="h-4 w-4 text-emerald-400" />
                Dynamic Sitemap Index
              </span>
              <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                {currentReport.sitemapStatus.toUpperCase()}
              </span>
            </div>

            {/* Rule 2: Robots */}
            <div className="flex items-center justify-between p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-400" />
                Robots.txt Directives
              </span>
              <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                {currentReport.robotsStatus.toUpperCase()}
              </span>
            </div>

            {/* Rule 3: SSL */}
            <div className="flex items-center justify-between p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                Active SSL Certificate
              </span>
              <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                {currentReport.sslStatus.toUpperCase()}
              </span>
            </div>

            {/* Rule 4: Mobile */}
            <div className="flex items-center justify-between p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
              <span className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-emerald-400" />
                Mobile friendly responsive layouts
              </span>
              <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                {currentReport.mobileFriendly.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* History Recharts Area chart */}
        <div className="lg:col-span-2 p-8 rounded-[32px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 blur-[80px] pointer-events-none rounded-full" />
          
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              SEO Health Score Trend
            </h3>
            <p className="text-[11px] text-muted-foreground/60">Historical audits quality average position graph</p>
          </div>

          <div className="h-[180px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="healthScoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#272a35" opacity={0.2} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} domain={[50, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f111a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="score" name="SEO Score" stroke="#6366f1" fillOpacity={1} fill="url(#healthScoreGrad)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
