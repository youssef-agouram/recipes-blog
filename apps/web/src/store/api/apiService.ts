import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { logout } from '../slices/authSlice';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // If we get a 401, it means the token is invalid or expired
    api.dispatch(logout());
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  }

  return result;
};

export const apiService = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Recipe', 'Category', 'CategoryGroup', 'User', 'Article', 'Settings', 'Comment', 'SavedRecipe', 'SavedArticle', 'FavoriteRecipe', 'FavoriteArticle'],
  endpoints: () => ({}),
});
