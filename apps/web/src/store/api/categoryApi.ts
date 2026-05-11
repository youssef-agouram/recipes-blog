import { apiService } from './apiService';
import { Category } from '@/lib/types';

export const categoryApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getAdminCategories: builder.query<Category[], void>({
      query: () => '/categories?all=true',
      providesTags: ['Category'],
    }),
    getCategory: builder.query<Category, number>({
      query: (id) => `/categories/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Category', id }],
    }),
    createCategory: builder.mutation<Category, Partial<Category>>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<Category, { id: number } & Partial<Category>>({
      query: ({ id, ...body }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body,
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
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation
} = categoryApi;
