import { apiService } from './apiService';
import { Recipe, PaginatedResponse } from '@/lib/types';

export const recipeApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getAdminRecipes: builder.query<PaginatedResponse<Recipe>, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/recipes',
        params,
      }),
      providesTags: ['Recipe'],
    }),
    deleteRecipe: builder.mutation<void, number>({
      query: (id) => ({
        url: `/recipes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Recipe'],
    }),
    createRecipe: builder.mutation<Recipe, Partial<Recipe>>({
      query: (body) => ({
        url: '/recipes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Recipe'],
    }),
    updateRecipe: builder.mutation<Recipe, { id: number; body: Partial<Recipe> }>({
      query: ({ id, body }) => ({
        url: `/recipes/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Recipe'],
    }),
  }),
});

export const { 
  useGetAdminRecipesQuery, 
  useDeleteRecipeMutation,
  useCreateRecipeMutation,
  useUpdateRecipeMutation
} = recipeApi;
