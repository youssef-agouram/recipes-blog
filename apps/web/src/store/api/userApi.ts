import { apiService } from './apiService';

export interface User {
  id: number;
  email: string;
  password?: string;
  name: string | null;
  role: string;
  status: string;
  avatar: string | null;
  createdAt: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  subscribers: number;
  admins: number;
}

export const userApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    getUserStats: builder.query<UserStats, void>({
      query: () => '/users/stats',
      providesTags: ['User'],
    }),
    updateUserRole: builder.mutation<User, { id: number; role: string }>({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),
    updateUserDetails: builder.mutation<User, { id: number; name: string; email: string; status: string }>({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { 
  useGetUsersQuery, 
  useGetUserStatsQuery, 
  useUpdateUserRoleMutation,
  useUpdateUserDetailsMutation,
  useDeleteUserMutation
} = userApi;
