import { apiService } from './apiService';
import { Category } from '@/lib/types';

export const categoryApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getAdminCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation<Category, { name: string }>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<Category, { id: number; name: string }>({
      query: ({ id, name }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: { name },
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const { 
  useGetAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation
} = categoryApi;
