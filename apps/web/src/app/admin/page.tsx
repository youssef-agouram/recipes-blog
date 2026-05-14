'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  Globe,
  Clock,
  Zap,
  ShieldCheck,
  Bug,
  Smartphone,
  Link as LinkIcon,
  Loader2,
  Search,
  Check,
  Monitor
} from 'lucide-react';
import { useGetDashboardStatsQuery } from '@/store/api/statsApi';
import { StatsCard } from '@/components/admin/dashboard/StatsCard';
import { SearchConsoleChart } from '@/components/admin/dashboard/SearchConsoleChart';
import { AdSenseChart } from '@/components/admin/dashboard/AdSenseChart';
import { TopRecipes } from '@/components/admin/dashboard/TopRecipes';
import { KeywordRankings } from '@/components/admin/dashboard/KeywordRankings';
import { GaugeChart } from '@/components/admin/dashboard/GaugeChart';
import { MiniStat } from '@/components/admin/dashboard/MiniStat';

export default function AdminDashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: statsData, isLoading: isLoadingStats } = useGetDashboardStatsQuery();

  if (isLoadingStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Analytics...</p>
      </div>
    );
  }

  const topRowStats = [
    { 
      label: 'Total Sessions', 
      value: statsData?.summary.sessions?.total.toLocaleString() ?? '0', 
      trend: statsData?.summary.sessions?.trend.value || '0%', 
      isUp: statsData?.summary.sessions?.trend.isUp ?? true, 
      color: '#3b82f6' 
    },
    { 
      label: 'Total Pageviews', 
      value: statsData?.summary.sessions?.total.toLocaleString() ?? '0', 
      trend: '18.7%', 
      isUp: true, 
      color: '#a855f7' 
    },
    { 
      label: 'Avg. Session Duration', 
      value: statsData?.summary.avgDuration?.value ?? '00:00', 
      trend: statsData?.summary.avgDuration?.trend.value || '0%', 
      isUp: statsData?.summary.avgDuration?.trend.isUp ?? true, 
      color: '#eab308' 
    },
    { 
      label: 'Pages / Session', 
      value: statsData?.summary.pagesPerSession?.value ?? '0', 
      trend: statsData?.summary.pagesPerSession?.trend.value || '0%', 
      isUp: statsData?.summary.pagesPerSession?.trend.isUp ?? true, 
      color: '#10b981' 
    },
    { 
      label: 'Bounce Rate', 
      value: statsData?.summary.bounceRate?.value ?? '0%', 
      trend: statsData?.summary.bounceRate?.trend.value || '0%', 
      isUp: statsData?.summary.bounceRate?.trend.isUp ?? false, 
      color: '#f43f5e' 
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Recipes Dashboard</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Growth & Performance Hub • 2024</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search anything..."
              className="bg-[#0F172A] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 w-[240px] transition-all"
            />
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-black text-primary">
            {user?.name?.[0] || 'A'}
          </div>
        </div>
      </div>

      {/* Top row stats (5 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {topRowStats.map((stat) => (
          <StatsCard 
            key={stat.label}
            title={stat.label}
            value={stat.value}
            trend={{ value: stat.trend, isUp: stat.isUp }}
            period="vs Apr 19 - May 18, 2024"
            data={Array.from({ length: 8 }, () => ({ value: 100 + Math.random() * 500 }))}
            color={stat.color}
          />
        ))}
      </div>

      {/* Analytics Main Row (3 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 bg-[#0F172A] border border-white/5 rounded-[32px] p-8 flex flex-col items-center justify-center">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 self-start">SEO Performance</h3>
          <GaugeChart value={86} subLabel="Excellent" color="#10b981" size={180} />
          <div className="w-full mt-8 space-y-4">
            {[
              { label: 'Technical SEO', score: '92/100', color: 'bg-emerald-500' },
              { label: 'On-Page SEO', score: '85/100', color: 'bg-orange-500' },
              { label: 'Content Quality', score: '88/100', color: 'bg-blue-500' },
              { label: 'Backlinks', score: '78/100', color: 'bg-purple-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                </div>
                <span className="text-[10px] font-black text-white">{item.score}</span>
              </div>
            ))}
          </div>
          <button className="text-blue-500 text-[10px] font-black uppercase mt-8 self-start hover:underline">View full SEO report →</button>
        </div>

        <div className="lg:col-span-6">
          <SearchConsoleChart />
        </div>

        <div className="lg:col-span-3">
          <AdSenseChart />
        </div>
      </div>

      {/* Tables & Rankings Row (3 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <TopRecipes recipes={statsData?.topRecipes} />
        </div>
        <div className="lg:col-span-5">
          <KeywordRankings />
        </div>
        <div className="lg:col-span-3 bg-[#0F172A] border border-white/5 rounded-[32px] p-8">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8">Site Health</h3>
           <div className="flex flex-col items-center">
             <GaugeChart value={96} subLabel="Healthy" color="#10b981" size={160} />
             <div className="w-full mt-8 space-y-3">
               {[
                 'No broken links', 'Sitemap is valid', 'Robots.txt is valid', 'SSL is enabled', 'Mobile friendly'
               ].map(check => (
                 <div key={check} className="flex items-center gap-3">
                   <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                     <Check className="w-2.5 h-2.5 text-emerald-500" />
                   </div>
                   <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{check}</span>
                 </div>
               ))}
             </div>
             <button className="text-blue-500 text-[10px] font-black uppercase mt-8 self-start hover:underline">View full site health →</button>
           </div>
        </div>
      </div>

      {/* Footer Tiny Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MiniStat label="Indexed Pages" value="2,350" trend="120" trendUp={true} icon={Globe} color="bg-blue-500" />
        <MiniStat label="Crawl Errors" value="3" trend="2" trendUp={false} icon={Bug} color="bg-rose-500" />
        <MiniStat label="Mobile Usability" value="100%" trend="Good" trendUp={true} icon={Smartphone} color="bg-emerald-500" />
        <MiniStat label="Page Speed (Mobile)" value="92" trend="Good" trendUp={true} icon={Zap} color="bg-orange-500" />
        <MiniStat label="Page Speed (Desktop)" value="98" trend="Good" trendUp={true} icon={Monitor} color="bg-emerald-500" />
        <MiniStat label="Backlinks" value="6.45K" trend="312" trendUp={true} icon={LinkIcon} color="bg-purple-500" />
      </div>
      
      <p className="text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest pt-4">© 2024 Recipes. All rights reserved.</p>
    </div>
  );
}
