import { apiService } from './apiService';
import { Comment, Recipe } from '@/lib/types';

export interface DashboardStats {
  summary: {
    recipes: { total: number; trend: { value: string; isUp: boolean } };
    categories: { total: number; trend: { value: string; isUp: boolean } };
    users: { total: number; trend: { value: string; isUp: boolean } };
    comments: { total: number; trend: { value: string; isUp: boolean } };
  };
  status: {
    published: number;
    draft: number;
    pending: number;
  };
  recentComments: Comment[];
  topRecipes: Partial<Recipe>[];
  overviewData: any[];
}

export const statsApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/stats/dashboard',
      providesTags: ['Recipe', 'Category', 'User', 'Comment'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = statsApi;
