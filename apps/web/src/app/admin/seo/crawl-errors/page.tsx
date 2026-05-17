'use client';

import { useState } from 'react';
import { 
  AlertCircle, Loader2, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Link2Off
} from 'lucide-react';
import { 
  useGetCrawlErrorsQuery,
  useRunTechnicalScanMutation
} from '@/store/api/seoApi';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { toast } from 'sonner';

// Simulated daily crawl issues trends
const crawlTrends = [
  { day: 'Mon', issues: 12 },
  { day: 'Tue', issues: 10 },
  { day: 'Wed', issues: 8 },
  { day: 'Thu', issues: 6 },
  { day: 'Fri', issues: 4 },
  { day: 'Sat', issues: 3 },
  { day: 'Sun', issues: 2 },
];

export default function CrawlErrorsPage() {
  const { data: errors, isLoading, refetch } = useGetCrawlErrorsQuery();
  const [runScan, { isLoading: isScanning }] = useRunTechnicalScanMutation();

  const handleScan = async () => {
    try {
      await runScan().unwrap();
      toast.success('Live database SEO technical audit completed!');
      refetch();
    } catch {
      toast.error('Scan execution failed.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#5850ec]" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading Crawl logs...</p>
      </div>
    );
  }

  const totalErrors = errors?.length || 0;
  const critical = (errors || []).filter((e: any) => e.severity === 'error').length;
  const warnings = (errors || []).filter((e: any) => e.severity === 'warning').length;

  return (
    <div className="space-y-6">
      
      {/* Overview widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Crawl Errors */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-rose-500/5 blur-[40px] pointer-events-none" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Crawl Errors (404/Broken)</p>
          <h3 className={`text-2xl font-black ${totalErrors > 0 ? 'text-rose-400' : 'text-white'}`}>{totalErrors}</h3>
          <span className="text-[9px] text-slate-400 block mt-1.5 font-semibold">Broken anchors detected</span>
        </div>

        {/* Critical Errors */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-rose-500/5 blur-[40px] pointer-events-none" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Critical 404 Responses</p>
          <h3 className={`text-2xl font-black ${critical > 0 ? 'text-rose-400' : 'text-white'}`}>{critical}</h3>
          <span className="text-[9px] text-rose-400 block mt-1.5 font-bold">Requires urgent correction</span>
        </div>

        {/* Warning Errors */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-amber-500/5 blur-[40px] pointer-events-none" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Circular / Invalid Redirects</p>
          <h3 className={`text-2xl font-black ${warnings > 0 ? 'text-amber-400' : 'text-white'}`}>{warnings}</h3>
          <span className="text-[9px] text-amber-400 block mt-1.5 font-semibold">Avoid chain loop structures</span>
        </div>

        {/* Healthy crawler coverage */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-emerald-500/5 blur-[40px] pointer-events-none" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Crawl Success rate</p>
          <h3 className="text-2xl font-black text-white">98.4%</h3>
          <span className="text-[9px] text-emerald-400 block mt-1.5 font-bold">
            Optimal search indexing rate
          </span>
        </div>

      </div>

      {/* Recharts Bar chart & details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Crawl Issue trend */}
        <div className="lg:col-span-2 p-8 rounded-[32px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 blur-[80px] pointer-events-none rounded-full" />
          <div className="border-b border-white/5 pb-4 mb-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Link2Off className="h-5 w-5 text-rose-400" />
              Crawl Errors Trends Log
            </h3>
            <p className="text-[11px] text-muted-foreground/60">Weekly broken internal/external page detections</p>
          </div>

          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crawlTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#272a35" opacity={0.2} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#0f111a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }} />
                <Bar dataKey="issues" name="Crawl Issues" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick actions info card */}
        <div className="p-8 rounded-[32px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 space-y-5">
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-base font-bold text-white">Crawler Optimization</h3>
            <p className="text-[11px] text-muted-foreground/60">Best practices to correct broken backlinks</p>
          </div>

          <div className="space-y-4 text-xs font-semibold text-slate-300">
            <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground/60 leading-normal">
                Avoid deleted permalinks. If changing a recipe slug, configure manual 301 redirects to guide crawlers.
              </p>
            </div>
            
            <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground/60 leading-normal">
                Check instructions anchors regularly to avoid linking to misspelled recipe names.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Crawl Errors Detailed Log Table */}
      <div className="p-8 rounded-[32px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-5">
          <div>
            <h3 className="text-base font-bold text-white">Active Crawl Errors Log</h3>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">Identifies broken 404 links, invalid external referrers, and missing target pages.</p>
          </div>
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="px-6 py-3 bg-[#5850ec] hover:bg-[#4a42df] disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            {isScanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh Crawl Log
          </button>
        </div>

        <div className="overflow-x-auto text-xs font-semibold">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                <th className="pb-3">Source page URL</th>
                <th className="pb-3">Error type</th>
                <th className="pb-3">Broken anchor target URL</th>
                <th className="pb-3">HTTP log Details</th>
                <th className="pb-3 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(errors || []).map((err: any) => (
                <tr key={err.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 font-mono text-[#a5b4fc] max-w-[200px] truncate">{err.pageUrl}</td>
                  <td className="py-4">
                    <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase bg-rose-500/10 border border-rose-500/20 text-rose-400">
                      {err.issueType}
                    </span>
                  </td>
                  <td className="py-4 font-mono text-slate-400 max-w-[200px] truncate">
                    {err.targetUrl || 'N/A (Broken root slug)'}
                  </td>
                  <td className="py-4 text-slate-300 font-medium max-w-[280px] truncate" title={err.errorMessage}>
                    {err.errorMessage}
                  </td>
                  <td className="py-4 text-right">
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase ${
                      err.resolutionStatus === 'resolved' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {err.resolutionStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
