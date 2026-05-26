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
    getSiteSettings: builder.query<any, void>({
      query: () => '/settings/site',
      providesTags: ['Settings'],
    }),
    updateSiteSettings: builder.mutation<any, any>({
      query: (body) => ({
        url: '/settings/site',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),
    testCloudinarySettings: builder.mutation<any, { cloudName: string; apiKey: string; apiSecret: string }>({
      query: (body) => ({
        url: '/uploads/test-cloudinary',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetHeroSettingsQuery,
  useUpdateHeroSettingsMutation,
  useGetSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
  useTestCloudinarySettingsMutation,
} = settingsApi;
