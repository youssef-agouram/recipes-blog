import { apiService } from './apiService';
import { Recipe, PaginatedResponse } from '@/lib/types';

export const recipeApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getAdminRecipes: builder.query<PaginatedResponse<Recipe>, { page?: number; limit?: number; all?: string }>({
      query: (params) => ({
        url: '/recipes',
        params,
      }),
      providesTags: ['Recipe'],
    }),
    getRecipeById: builder.query<Recipe, number>({
      query: (id) => `/recipes/id/${id}`,
      providesTags: ['Recipe'],
    }),
    searchRecipes: builder.query<PaginatedResponse<Recipe>, { search: string; limit?: number }>({
      query: (params) => ({
        url: '/recipes',
        params,
      }),
      providesTags: ['Recipe'],
    }),
    getRecipeStats: builder.query<{ total: number; published: number; draft: number; trash: number }, void>({
      query: () => '/recipes/stats',
      providesTags: ['Recipe'],
    }),
    getFeaturedRecipes: builder.query<PaginatedResponse<Recipe>, void>({
      query: () => ({
        url: '/recipes',
        params: { featured: 'true', limit: 10 },
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
    clearTrashRecipes: builder.mutation<{ message: string; count: number }, void>({
      query: () => ({
        url: '/recipes/trash/clear',
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
    toggleFeaturedRecipe: builder.mutation<Recipe, number>({
      query: (id) => ({
        url: `/recipes/${id}/feature`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Recipe'],
    }),
    toggleTopArticleRecipe: builder.mutation<Recipe, number>({
      query: (id) => ({
        url: `/recipes/${id}/top-article`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Recipe'],
    }),
    uploadImage: builder.mutation<{ imageUrl: string }, FormData>({
      query: (body) => ({
        url: '/uploads',
        method: 'POST',
        body,
      }),
    }),
    saveRecipe: builder.mutation<void, number>({
      query: (id) => ({
        url: `/recipes/${id}/save`,
        method: 'POST',
      }),
      invalidatesTags: ['SavedRecipe'],
    }),
    unsaveRecipe: builder.mutation<void, number>({
      query: (id) => ({
        url: `/recipes/${id}/save`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SavedRecipe'],
    }),
    favoriteRecipe: builder.mutation<void, number>({
      query: (id) => ({
        url: `/recipes/${id}/favorite`,
        method: 'POST',
      }),
      invalidatesTags: ['FavoriteRecipe'],
    }),
    unfavoriteRecipe: builder.mutation<void, number>({
      query: (id) => ({
        url: `/recipes/${id}/favorite`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FavoriteRecipe'],
    }),
    getSavedRecipes: builder.query<Recipe[], void>({
      query: () => '/recipes/saved',
      providesTags: ['SavedRecipe'],
    }),
    getFavoritedRecipes: builder.query<Recipe[], void>({
      query: () => '/recipes/favorited',
      providesTags: ['FavoriteRecipe'],
    }),
  }),
});

export const {
  useGetAdminRecipesQuery,
  useGetRecipeByIdQuery,
  useSearchRecipesQuery,
  useGetRecipeStatsQuery,
  useGetFeaturedRecipesQuery,
  useDeleteRecipeMutation,
  useClearTrashRecipesMutation,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useToggleFeaturedRecipeMutation,
  useToggleTopArticleRecipeMutation,
  useUploadImageMutation,
  useSaveRecipeMutation,
  useUnsaveRecipeMutation,
  useFavoriteRecipeMutation,
  useUnfavoriteRecipeMutation,
  useGetSavedRecipesQuery,
  useGetFavoritedRecipesQuery
} = recipeApi;
