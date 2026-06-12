'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  BarChart2, Settings, TrendingUp, Users, Eye, Clock, ShieldAlert, ArrowUpRight, 
  ArrowDownRight, Compass, MousePointer, Share2, Search, Sparkles, Calendar, ChevronDown
} from 'lucide-react';
import { useGetAnalyticsSettingsQuery } from '@/store/api/seoApi';
import { useGetDashboardStatsQuery } from '@/store/api/statsApi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import Link from 'next/link';

// Mock high-fidelity daily traffic logs matching actual GA4 streams
const dailyTrafficData = [
  { date: 'May 10', sessions: 1240, pageviews: 2850, bounceRate: 42 },
  { date: 'May 11', sessions: 1450, pageviews: 3120, bounceRate: 40 },
  { date: 'May 12', sessions: 1890, pageviews: 4100, bounceRate: 38 },
  { date: 'May 13', sessions: 1720, pageviews: 3950, bounceRate: 39 },
  { date: 'May 14', sessions: 2100, pageviews: 4800, bounceRate: 36 },
  { date: 'May 15', sessions: 2450, pageviews: 5600, bounceRate: 35 },
  { date: 'May 16', sessions: 2300, pageviews: 5200, bounceRate: 37 },
];

// referral source data
const referrersData = [
  { name: 'Organic Search', value: 45, color: '#6366f1' }, // Indigo
  { name: 'Direct Traffic', value: 25, color: '#3b82f6' }, // Blue
  { name: 'Social Media', value: 20, color: '#10b981' }, // Emerald
  { name: 'Email Campaigns', value: 10, color: '#f59e0b' }, // Amber
];

// Top viewed recipe pages
const topRecipePages = [
  { path: '/recipes/creamy-tuscan-chicken', title: 'Creamy Tuscan Garlic Chicken', views: 2450, duration: '4m 32s', bounce: '32.4%' },
  { path: '/recipes/perfect-chocolate-fondant', title: 'Perfect Lava Chocolate Fondant', views: 1890, duration: '3m 50s', bounce: '35.8%' },
  { path: '/recipes/vegan-lentil-bolognese', title: 'Savory Vegan Lentil Bolognese', views: 1420, duration: '5m 12s', bounce: '28.1%' },
  { path: '/recipes/classic-french-onion-soup', title: 'Classic French Onion Soup', views: 1280, duration: '4m 10s', bounce: '40.2%' },
  { path: '/recipes/avocado-toast-pomegranate', title: 'Avocado Toast with Pomegranate Seeds', views: 980, duration: '2m 45s', bounce: '45.6%' },
];

export default function AnalyticsDashboardPage() {
  const { data: settings } = useGetAnalyticsSettingsQuery();
  const [filter, setFilter] = useState<'24h' | '7d' | '30d'>('7d');
  const { data: statsData, isLoading } = useGetDashboardStatsQuery(filter, { pollingInterval: 60000 });
  const [activeTab, setActiveTab] = useState<'overview' | 'pageviews' | 'sessions'>('overview');

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const today = new Date();
  const getStartDate = () => {
    const start = new Date(today);
    if (filter === '24h') {
      start.setDate(today.getDate() - 1);
    } else if (filter === '30d') {
      start.setDate(today.getDate() - 29);
    } else {
      start.setDate(today.getDate() - 6);
    }
    return start;
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const filterLabels = {
    '24h': 'Last 24 hours',
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
  };

  // Google Analytics removed

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-400">Loading Analytics Data...</p>
        </div>
      </div>
    );
  }

  const chartData = statsData?.overviewData && statsData.overviewData.length > 0
    ? statsData.overviewData.map(d => ({ ...d, date: d.name }))
    : dailyTrafficData;

  const displayRecipes = statsData?.topRecipes || [];

  const displayReferrers = statsData?.referrerData || [];
  const topReferrer = displayReferrers[0];
  const totalReferrerVal = displayReferrers.reduce((acc, r) => acc + r.value, 0);
  const topReferrerPct = totalReferrerVal ? Math.round(topReferrer.value / totalReferrerVal * 100) : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white font-heading">Analytics Dashboard</h1>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
            <Link href="/admin" className="hover:text-primary transition-colors">Dashboard</Link>
            <span>/</span>
            <Link href="/admin/seo" className="hover:text-primary transition-colors">SEO</Link>
            <span>/</span>
            <span className="text-white/40">Analytics</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Range Display */}
          <div className="flex items-center gap-2 bg-[#0b0c16]/90 border border-white/10 rounded-xl px-4 h-11 text-xs font-semibold text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDate(getStartDate())} - {formatDate(today)}</span>
          </div>

          {/* Filter Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="h-11 flex items-center gap-2 bg-[#0b0c16]/90 border border-white/10 rounded-xl px-4 text-xs font-semibold text-slate-300 hover:border-white/20 transition-all cursor-pointer select-none"
            >
              <span>Range: {filterLabels[filter]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0b0c16] border border-white/10 shadow-2xl z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                {(['24h', '7d', '30d'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setFilter(opt);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-white/5 transition-colors cursor-pointer ${
                      filter === opt ? 'text-[#5850ec]' : 'text-slate-300'
                    }`}
                  >
                    {filterLabels[opt]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/admin/seo/analytics/settings"
            className="h-11 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-xs font-black uppercase tracking-wider text-slate-300 transition-all hover:bg-white/10 active:scale-95"
          >
            <Settings className="h-4 w-4" /> Custom Scripts
          </Link>
        </div>
      </div>


      {/* Analytics Core Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Widget 1: Sessions */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-[#5850ec]/30 transition-all">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-[#5850ec]/5 blur-[40px] pointer-events-none rounded-full" />
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-[#5850ec]/10 flex items-center justify-center text-[#5850ec]">
              <Users className="h-5 w-5" />
            </div>
            <span className={`flex items-center gap-0.5 text-[10px] font-black ${
              (statsData?.summary?.sessions?.trend?.isUp ?? true) ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            } px-2 py-0.5 rounded-md`}>
              {(statsData?.summary?.sessions?.trend?.isUp ?? true) ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {statsData?.summary?.sessions?.trend?.value || '0%'}
            </span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Total Sessions</p>
          <h3 className="text-2xl font-black text-white">{statsData?.summary?.sessions?.total?.toLocaleString() || '0'}</h3>
          <p className="text-[9px] text-muted-foreground/40 mt-1">Unique user cycles tracked</p>
        </div>

        {/* Widget 2: Pageviews */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-indigo-500/5 blur-[40px] pointer-events-none rounded-full" />
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Eye className="h-5 w-5" />
            </div>
            <span className={`flex items-center gap-0.5 text-[10px] font-black ${
              (statsData?.summary?.pageviews?.trend?.isUp ?? true) ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            } px-2 py-0.5 rounded-md`}>
              {(statsData?.summary?.pageviews?.trend?.isUp ?? true) ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {statsData?.summary?.pageviews?.trend?.value || '0%'}
            </span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Total Pageviews</p>
          <h3 className="text-2xl font-black text-white">{statsData?.summary?.pageviews?.total?.toLocaleString() || '0'}</h3>
          <p className="text-[9px] text-muted-foreground/40 mt-1">Aggregate views stream</p>
        </div>

        {/* Widget 3: Avg Duration */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-emerald-500/5 blur-[40px] pointer-events-none rounded-full" />
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Clock className="h-5 w-5" />
            </div>
            <span className={`flex items-center gap-0.5 text-[10px] font-black ${
              (statsData?.summary?.avgDuration?.trend?.isUp ?? true) ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            } px-2 py-0.5 rounded-md`}>
              {(statsData?.summary?.avgDuration?.trend?.isUp ?? true) ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {statsData?.summary?.avgDuration?.trend?.value || '0%'}
            </span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Avg Session Duration</p>
          <h3 className="text-2xl font-black text-white">{statsData?.summary?.avgDuration?.value || '0m 0s'}</h3>
          <p className="text-[9px] text-muted-foreground/40 mt-1">Average user engagement time</p>
        </div>

        {/* Widget 4: Bounce Rate */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-rose-500/30 transition-all">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-rose-500/5 blur-[40px] pointer-events-none rounded-full" />
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
              <MousePointer className="h-5 w-5" />
            </div>
            <span className={`flex items-center gap-0.5 text-[10px] font-black ${
              (statsData?.summary?.bounceRate?.trend?.isUp ?? true) ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            } px-2 py-0.5 rounded-md`}>
              {(statsData?.summary?.bounceRate?.trend?.isUp ?? true) ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {statsData?.summary?.bounceRate?.trend?.value || '0%'}
            </span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Bounce Rate</p>
          <h3 className="text-2xl font-black text-white">{statsData?.summary?.bounceRate?.value || '0%'}</h3>
          <p className="text-[9px] text-muted-foreground/40 mt-1">Single page dropoff factor</p>
        </div>

        {/* Widget 5: Pages Per Session */}
        <div className="p-6 rounded-3xl bg-[#0b0c16]/90 border border-white/5 shadow-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-amber-500/5 blur-[40px] pointer-events-none rounded-full" />
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Compass className="h-5 w-5" />
            </div>
            <span className={`flex items-center gap-0.5 text-[10px] font-black ${
              (statsData?.summary?.pagesPerSession?.trend?.isUp ?? true) ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            } px-2 py-0.5 rounded-md`}>
              {(statsData?.summary?.pagesPerSession?.trend?.isUp ?? true) ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {statsData?.summary?.pagesPerSession?.trend?.value || '0%'}
            </span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Pages Per Session</p>
          <h3 className="text-2xl font-black text-white">{statsData?.summary?.pagesPerSession?.value || '0'}</h3>
          <p className="text-[9px] text-muted-foreground/40 mt-1">Average depth of interaction</p>
        </div>
      </div>

      {/* Middle Interactive Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Dynamic Tabbed Recharts Line/Bar Chart (2 cols-width equivalent) */}
        <div className="lg:col-span-2 p-8 rounded-[32px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#5850ec]/5 blur-[120px] pointer-events-none rounded-full" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#5850ec]" />
                Visitor Traffic Trends
              </h3>
              <p className="text-[11px] text-muted-foreground/60">Live metrics analysis from local traffic logs</p>
            </div>
            
            {/* Chart Sub-tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5 self-start sm:self-auto">
              {[
                { id: 'overview', label: 'Traffic Overview' },
                { id: 'pageviews', label: 'Pageviews' },
                { id: 'sessions', label: 'Sessions' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-[#5850ec] text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Render Recharts block */}
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'overview' ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5850ec" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#5850ec" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#272a35" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f111a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="pageviews" name="Pageviews" stroke="#5850ec" fillOpacity={1} fill="url(#colorPageviews)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#10b981" fillOpacity={1} fill="url(#colorSessions)" strokeWidth={2.5} />
                </AreaChart>
              ) : activeTab === 'pageviews' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#272a35" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f111a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Bar dataKey="pageviews" name="Pageviews" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#272a35" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f111a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="sessions" name="Sessions" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side Referral Doughnut Chart */}
        <div className="p-8 rounded-[32px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 shadow-2xl space-y-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/5 blur-[60px] pointer-events-none rounded-full" />
          
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="h-5 w-5 text-indigo-400" />
              Traffic Referrer Sources
            </h3>
            <p className="text-[11px] text-muted-foreground/60 font-medium mt-0.5">Top incoming referral channels</p>
          </div>

          {/* Recharts Pie (Doughnut) */}
          <div className="h-[220px] w-full flex items-center justify-center relative">
            {displayReferrers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayReferrers}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {displayReferrers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f111a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '11px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 gap-1">
                <span className="text-xs font-semibold text-slate-400">No referrer data yet</span>
                <span className="text-[9px] text-slate-600">Referrers will show up live</span>
              </div>
            )}
            
            {/* Absolute Center Metric */}
            {displayReferrers.length > 0 && (
              <div className="absolute flex flex-col items-center justify-center pointer-events-none max-w-[110px] text-center">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none truncate w-full">{topReferrer.name}</span>
                <span className="text-2xl font-black text-white mt-1">{topReferrerPct}%</span>
              </div>
            )}
          </div>

          {/* Color Indicators Legend Grid */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
            {displayReferrers.length > 0 ? (
              displayReferrers.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-bold text-slate-300 truncate">{item.name}</span>
                  <span className="text-[10px] font-black text-white ml-auto">{item.percentage}</span>
                </div>
              ))
            ) : (
              <span className="text-[9px] text-slate-600 col-span-2 text-center py-2">No indicators available</span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Recipes & Global Tracking Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Top performing pages (2 cols-width) */}
        <div className="lg:col-span-2 p-8 rounded-[32px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 shadow-2xl space-y-5">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Most Visited Recipe Pages
            </h3>
            <p className="text-[11px] text-muted-foreground/60">Recipe engagement mapped via custom event streams</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                  <th className="pb-3">Target Path</th>
                  <th className="pb-3">Unique Views</th>
                  <th className="pb-3">Avg Engagement</th>
                  <th className="pb-3 text-right">Bounce Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-semibold">
                {displayRecipes.length > 0 ? (
                  displayRecipes.map((page, index) => (
                    <tr key={index} className="group hover:bg-white/5 transition-colors">
                      <td className="py-3.5 pr-4 max-w-[280px] truncate">
                        <div className="space-y-0.5">
                          <p className="text-white group-hover:text-indigo-400 transition-colors truncate">{page.title}</p>
                          <p className="text-[9px] text-muted-foreground/50 truncate font-mono">{page.path}</p>
                        </div>
                      </td>
                      <td className="py-3.5 text-white">
                        {typeof page.views === 'number' ? page.views.toLocaleString() : page.views}
                      </td>
                      <td className="py-3.5 text-slate-300">{page.avgTime || '4m 12s'}</td>
                      <td className="py-3.5 text-right text-rose-400">{page.bounce || '32.5%'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 font-semibold text-xs">
                      No recipes viewed yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Active tracking schema status summary */}
        <div className="p-8 rounded-[32px] bg-[#0b0c16]/80 backdrop-blur-xl border border-white/5 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/5 blur-[80px] pointer-events-none rounded-full" />
          
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-emerald-400" />
              Tracking Nodes Status
            </h3>
            <p className="text-[11px] text-muted-foreground/60 font-medium mt-0.5">Analytics engine status indicators</p>
          </div>

          <div className="space-y-3 font-semibold">
            {/* Status: Local Database Analytics */}
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-[#10b981] uppercase tracking-widest leading-none">Local Database Analytics</span>
                <p className="text-xs font-bold text-white mt-0.5">ACTIVE & RECORDING</p>
              </div>
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            </div>

            {/* Status: Vercel Web Analytics */}
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl opacity-60">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Vercel Analytics</span>
                <p className="text-xs font-bold text-slate-400 mt-0.5">DISCONNECTED / INACTIVE</p>
              </div>
              <div className="h-2.5 w-2.5 rounded-full bg-slate-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
