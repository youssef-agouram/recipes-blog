import { apiService } from './apiService';

export const articleApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getArticles: builder.query<any[], { limit?: number } | void>({
      query: (params) => ({
        url: '/articles',
        params: params ? params : undefined,
      }),
      providesTags: ['Article'],
    }),
    getArticleBySlug: builder.query<any, string>({
      query: (slug) => `/articles/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Article', id: slug }],
    }),
    createArticle: builder.mutation<any, any>({
      query: (body) => ({
        url: '/articles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Article'],
    }),
    updateArticle: builder.mutation<any, { id: number; body: any }>({
      query: ({ id, body }) => ({
        url: `/articles/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Article'],
    }),
    deleteArticle: builder.mutation<void, number>({
      query: (id) => ({
        url: `/articles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Article'],
    }),
    toggleTopArticle: builder.mutation<any, number>({
      query: (id) => ({
        url: `/articles/${id}/toggle-top-article`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Article'],
    }),
    saveArticle: builder.mutation<void, number>({
      query: (id) => ({
        url: `/articles/${id}/save`,
        method: 'POST',
      }),
      invalidatesTags: ['SavedArticle'],
    }),
    unsaveArticle: builder.mutation<void, number>({
      query: (id) => ({
        url: `/articles/${id}/save`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SavedArticle'],
    }),
    favoriteArticle: builder.mutation<void, number>({
      query: (id) => ({
        url: `/articles/${id}/favorite`,
        method: 'POST',
      }),
      invalidatesTags: ['FavoriteArticle'],
    }),
    unfavoriteArticle: builder.mutation<void, number>({
      query: (id) => ({
        url: `/articles/${id}/favorite`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FavoriteArticle'],
    }),
    getSavedArticles: builder.query<any[], void>({
      query: () => '/articles/saved',
      providesTags: ['SavedArticle'],
    }),
    getFavoritedArticles: builder.query<any[], void>({
      query: () => '/articles/favorited',
      providesTags: ['FavoriteArticle'],
    }),
  }),
});

export const {
  useGetArticlesQuery,
  useGetArticleBySlugQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useToggleTopArticleMutation,
  useSaveArticleMutation,
  useUnsaveArticleMutation,
  useFavoriteArticleMutation,
  useUnfavoriteArticleMutation,
  useGetSavedArticlesQuery,
  useGetFavoritedArticlesQuery
} = articleApi;
