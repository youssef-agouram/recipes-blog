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
  }),
});

export const {
  useGetArticlesQuery,
  useGetArticleBySlugQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
} = articleApi;
