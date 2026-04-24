import { apiService } from './apiService';
import { Category } from '@/lib/types';

export const categoryApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getAdminCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
  }),
});

export const { useGetAdminCategoriesQuery } = categoryApi;
