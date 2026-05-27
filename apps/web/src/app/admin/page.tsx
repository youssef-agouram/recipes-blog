'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  Users,
  Eye,
  Globe,
  TrendingDown,
  Clock,
  MousePointerClick,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { useGetDashboardStatsQuery } from '@/store/api/statsApi';

import { DashboardHeader } from '@/components/admin/dashboard/DashboardHeader';
import { KpiCard } from '@/components/admin/dashboard/KpiCard';
import { TrafficOverviewChart } from '@/components/admin/dashboard/TrafficOverviewChart';
import { TrafficSourcesChart } from '@/components/admin/dashboard/TrafficSourcesChart';
import { DeviceAnalyticsChart } from '@/components/admin/dashboard/DeviceAnalyticsChart';
import { TopRecipesTable } from '@/components/admin/dashboard/TopRecipesTable';
import { TopCountries } from '@/components/admin/dashboard/TopCountries';
import { SeoAnalytics } from '@/components/admin/dashboard/SeoAnalytics';
import { EngagementOverview } from '@/components/admin/dashboard/EngagementOverview';
import { CoreWebVitals } from '@/components/admin/dashboard/CoreWebVitals';
import { RealTimeVisitors } from '@/components/admin/dashboard/RealTimeVisitors';
import { AdSenseOverviewCard } from '@/components/admin/dashboard/AdSenseOverviewCard';

export default function AdminDashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: statsData, isLoading } = useGetDashboardStatsQuery(undefined, { pollingInterval: 60000 });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-[#5850ec]/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#5850ec]" />
          </div>
        </div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Analytics...</p>
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Total Visitors',
      value: statsData?.summary?.sessions?.total?.toLocaleString() || '0',
      trend: statsData?.summary?.sessions?.trend?.value || '0%',
      trendUp: statsData?.summary?.sessions?.trend?.isUp ?? true,
      trendLabel: 'from last 7 days',
      icon: Users,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
    },
    {
      label: 'Page Views',
      value: statsData?.summary?.pageviews?.total?.toLocaleString() || '0',
      trend: statsData?.summary?.pageviews?.trend?.value || '0%',
      trendUp: statsData?.summary?.pageviews?.trend?.isUp ?? true,
      trendLabel: 'from last 7 days',
      icon: Eye,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10',
    },
    {
      label: 'Unique Visitors',
      value: statsData?.summary?.uniqueVisitors?.total?.toLocaleString() || '0',
      trend: statsData?.summary?.uniqueVisitors?.trend?.value || '0%',
      trendUp: statsData?.summary?.uniqueVisitors?.trend?.isUp ?? true,
      trendLabel: 'from last 7 days',
      icon: Globe,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
    },
    {
      label: 'Bounce Rate',
      value: statsData?.summary?.bounceRate?.value || '0%',
      trend: statsData?.summary?.bounceRate?.trend?.value || '0%',
      trendUp: statsData?.summary?.bounceRate?.trend?.isUp ?? false,
      trendLabel: 'from last 7 days',
      icon: TrendingDown,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10',
    },
    {
      label: 'Avg. Session Duration',
      value: statsData?.summary?.avgDuration?.value || '0m 0s',
      trend: statsData?.summary?.avgDuration?.trend?.value || '0%',
      trendUp: statsData?.summary?.avgDuration?.trend?.isUp ?? true,
      trendLabel: 'from last 7 days',
      icon: Clock,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
    },
    {
      label: 'Ad Clicks',
      value: '3,456',
      trend: '15.8%',
      trendUp: true,
      trendLabel: 'from last 7 days',
      icon: MousePointerClick,
      iconColor: 'text-pink-400',
      iconBg: 'bg-pink-500/10',
    },
    {
      label: 'Est. Earnings',
      value: '$318.45',
      trend: '20.8%',
      trendUp: true,
      trendLabel: 'from last 7 days',
      icon: DollarSign,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* ───── Header ───── */}
      <DashboardHeader
        userName={user?.name || 'Admin'}
        activeUsers={statsData?.activeUsers?.total || 1}
      />

      {/* ───── KPI Cards Row ───── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>

      {/* ───── Row 2: Traffic Overview + Sources + Devices ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5">
          <TrafficOverviewChart data={statsData?.overviewData} />
        </div>
        <div className="lg:col-span-4">
          <TrafficSourcesChart sources={statsData?.referrerData} />
        </div>
        <div className="lg:col-span-3">
          <DeviceAnalyticsChart devices={statsData?.deviceData} />
        </div>
      </div>

      {/* ───── Row 3: Top Recipes + Countries + SEO Analytics ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4">
          <TopRecipesTable recipes={statsData?.topRecipes} />
        </div>
        <div className="lg:col-span-4">
          <TopCountries countries={statsData?.countryData} />
        </div>
        <div className="lg:col-span-4">
          <SeoAnalytics />
        </div>
      </div>

      {/* ───── Row 4: Engagement + Core Web Vitals + Real-Time + AdSense ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-3">
          <EngagementOverview />
        </div>
        <div className="lg:col-span-3">
          <CoreWebVitals />
        </div>
        <div className="lg:col-span-3">
          <RealTimeVisitors activeUsers={statsData?.activeUsers} />
        </div>
        <div className="lg:col-span-3">
          <AdSenseOverviewCard />
        </div>
      </div>
    </div>
  );
}
