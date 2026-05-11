import { apiService } from './apiService';
import { CategoryGroup } from '@/lib/types';

export const categoryGroupApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getCategoryGroups: builder.query<CategoryGroup[], void>({
      query: () => '/category-groups',
      providesTags: ['CategoryGroup'],
    }),
    createCategoryGroup: builder.mutation<CategoryGroup, Partial<CategoryGroup>>({
      query: (body) => ({
        url: '/category-groups',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CategoryGroup'],
    }),
    updateCategoryGroup: builder.mutation<CategoryGroup, { id: number } & Partial<CategoryGroup>>({
      query: ({ id, ...body }) => ({
        url: `/category-groups/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['CategoryGroup'],
    }),
    deleteCategoryGroup: builder.mutation<void, number>({
      query: (id) => ({
        url: `/category-groups/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CategoryGroup'],
    }),
  }),
});

export const { 
  useGetCategoryGroupsQuery,
  useCreateCategoryGroupMutation,
  useUpdateCategoryGroupMutation,
  useDeleteCategoryGroupMutation
} = categoryGroupApi;
