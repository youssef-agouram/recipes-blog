'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  Utensils, 
  Users, 
  LayoutGrid, 
  MessageSquare,
  Calendar
} from 'lucide-react';
import { useGetAdminRecipesQuery } from '@/store/api/recipeApi';
import { useGetAdminCategoriesQuery } from '@/store/api/categoryApi';
import { StatsCard } from '@/components/admin/dashboard/StatsCard';
import { OverviewChart } from '@/components/admin/dashboard/OverviewChart';
import { TopRecipes } from '@/components/admin/dashboard/TopRecipes';
import { StatusChart } from '@/components/admin/dashboard/StatusChart';
import { RecentComments } from '@/components/admin/dashboard/RecentComments';
import { RecentRecipesGrid } from '@/components/admin/dashboard/RecentRecipesGrid';
import { ActivityFeed } from '@/components/admin/dashboard/ActivityFeed';

export default function AdminDashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: recipesData } = useGetAdminRecipesQuery({ limit: 5 });
  const { data: categories } = useGetAdminCategoriesQuery();

  const stats = [
    { 
      label: 'Total Recipes', 
      value: recipesData?.meta.total || '1,248', 
      icon: Utensils, 
      color: 'bg-orange-500',
      trend: { value: '12.5%', isUp: true },
      data: [{value: 400}, {value: 300}, {value: 500}, {value: 450}, {value: 600}, {value: 550}, {value: 700}]
    },
    { 
      label: 'Total Categories', 
      value: categories?.length || '32', 
      icon: LayoutGrid, 
      color: 'bg-purple-500',
      trend: { value: '8.3%', isUp: true },
      data: [{value: 200}, {value: 250}, {value: 220}, {value: 280}, {value: 240}, {value: 300}, {value: 320}]
    },
    { 
      label: 'Total Users', 
      value: '8,549', 
      icon: Users, 
      color: 'bg-emerald-500',
      trend: { value: '15.7%', isUp: true },
      data: [{value: 500}, {value: 600}, {value: 550}, {value: 700}, {value: 650}, {value: 800}, {value: 850}]
    },
    { 
      label: 'Total Comments', 
      value: '756', 
      icon: MessageSquare, 
      color: 'bg-rose-500',
      trend: { value: '4.2%', isUp: false },
      data: [{value: 300}, {value: 250}, {value: 280}, {value: 220}, {value: 200}, {value: 180}, {value: 150}]
    },
  ];

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Welcome back, {user?.name?.split(' ')[0] || 'John'}! 👋</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Here's what's happening with your recipes today.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#0F172A] border border-white/5 px-4 py-2 rounded-xl text-slate-300 text-xs font-bold cursor-pointer hover:bg-white/5 transition-colors">
          <Calendar className="w-4 h-4 text-orange-500" />
          <span>May 15 — May 21, 2024</span>
          <span className="ml-2">▼</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard 
            key={stat.label}
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            data={stat.data}
            color={stat.color}
          />
        ))}
      </div>

      {/* Main Charts & Lists Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <OverviewChart />
        </div>
        <div className="lg:col-span-4">
          <TopRecipes />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <StatusChart />
        </div>
        <div className="lg:col-span-4">
          <RecentComments />
        </div>
        <div className="lg:col-span-4">
          <ActivityFeed />
        </div>
      </div>

      {/* Bottom Grid */}
      <RecentRecipesGrid />
    </div>
  );
}
