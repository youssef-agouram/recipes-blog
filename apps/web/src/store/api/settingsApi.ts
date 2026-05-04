import { apiService } from './apiService';

export const settingsApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getHeroSettings: builder.query<any, void>({
      query: () => '/settings/hero',
      providesTags: ['Settings'],
    }),
    updateHeroSettings: builder.mutation<any, any>({
      query: (body) => ({
        url: '/settings/hero',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const {
  useGetHeroSettingsQuery,
  useUpdateHeroSettingsMutation,
} = settingsApi;
