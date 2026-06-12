import { apiService } from './apiService';
import { Comment, Recipe } from '@/lib/types';

export interface DashboardStats {
  summary: {
    recipes: { total: number; trend: { value: string; isUp: boolean } };
    categories: { total: number; trend: { value: string; isUp: boolean } };
    users: { total: number; trend: { value: string; isUp: boolean } };
    comments: { total: number; trend: { value: string; isUp: boolean } };
    sessions?: { total: number; trend: { value: string; isUp: boolean } };
    pageviews?: { total: number; trend: { value: string; isUp: boolean } };
    uniqueVisitors?: { total: number; trend: { value: string; isUp: boolean } };
    avgDuration?: { value: string; trend: { value: string; isUp: boolean } };
    pagesPerSession?: { value: string; trend: { value: string; isUp: boolean } };
    bounceRate?: { value: string; trend: { value: string; isUp: boolean } };
  };
  status: {
    published: number;
    draft: number;
    pending: number;
  };
  recentComments: Comment[];
  topRecipes: any[];
  overviewData: any[];
  deviceData?: { name: string; value: number }[];
  referrerData?: { name: string; value: number; percentage: string; color: string }[];
  countryData?: { name: string; value: number; percentage: string; color: string }[];
  activeUsers?: {
    total: number;
    pages: { path: string; users: number }[];
  };
}

export const statsApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, string | undefined>({
      query: (range) => `/stats/dashboard${range ? `?range=${range}` : ''}`,
      providesTags: ['Recipe', 'Category', 'User', 'Comment'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = statsApi;
