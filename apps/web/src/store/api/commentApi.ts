import { apiService } from './apiService';
import { Comment } from '@/lib/types';

export const commentApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query<Comment[], void>({
      query: () => '/comments',
      providesTags: ['Comment'],
    }),
    updateCommentStatus: builder.mutation<Comment, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/comments/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Comment'],
    }),
    deleteComment: builder.mutation<void, number>({
      query: (id) => ({
        url: `/comments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Comment'],
    }),
    likeComment: builder.mutation<Comment, number>({
      query: (id) => ({
        url: `/comments/${id}/like`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Comment'],
    }),
  }),
});

export const { 
  useGetCommentsQuery, 
  useUpdateCommentStatusMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation
} = commentApi;
