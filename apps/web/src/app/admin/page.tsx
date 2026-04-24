'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  Utensils, 
  Tags, 
  TrendingUp, 
  Clock 
} from 'lucide-react';
import { useGetAdminRecipesQuery } from '@/store/api/recipeApi';
import { useGetAdminCategoriesQuery } from '@/store/api/categoryApi';

export default function AdminDashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: recipesData } = useGetAdminRecipesQuery({ limit: 5 });
  const { data: categories } = useGetAdminCategoriesQuery();

  const stats = [
    { label: 'Total Recipes', value: recipesData?.meta.total || 0, icon: Utensils, color: 'text-blue-600' },
    { label: 'Categories', value: categories?.length || 0, icon: Tags, color: 'text-green-600' },
    { label: 'Avg. Weekly Views', value: '0', icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Recent Activity', value: recipesData?.data.length || 0, icon: Clock, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name || 'Admin'}</h1>
        <p className="text-sm text-muted-foreground">Here is what is happening with your blog today.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border/40 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-4 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Recent Recipes</h3>
          <div className="space-y-4">
            {recipesData?.data.map((recipe) => (
              <div key={recipe.id} className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
                <span className="text-sm font-medium">{recipe.title}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(recipe.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {recipesData?.data.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No recipes yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
