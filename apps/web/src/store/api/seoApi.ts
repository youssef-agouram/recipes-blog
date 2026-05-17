import { apiService } from './apiService';

export const seoApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    // Global SEO
    getSeoSettings: builder.query<any, void>({
      query: () => '/seo/settings',
      providesTags: ['Settings'],
    }),
    updateSeoSettings: builder.mutation<any, any>({
      query: (body) => ({
        url: '/seo/settings',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),

    // Analytics
    getAnalyticsSettings: builder.query<any, void>({
      query: () => '/seo/analytics',
      providesTags: ['Settings'],
    }),
    updateAnalyticsSettings: builder.mutation<any, any>({
      query: (body) => ({
        url: '/seo/analytics',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),

    // Webmaster Tools
    getWebmasterTools: builder.query<any, void>({
      query: () => '/seo/webmaster',
      providesTags: ['Settings'],
    }),
    updateWebmasterTools: builder.mutation<any, any>({
      query: (body) => ({
        url: '/seo/webmaster',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),

    // Crawl Reports
    getCrawlReports: builder.query<any, void>({
      query: () => '/seo/crawl',
      providesTags: ['Settings'],
    }),
    runCrawlScan: builder.mutation<any, void>({
      query: () => ({
        url: '/seo/crawl/scan',
        method: 'POST',
      }),
      invalidatesTags: ['Settings'],
    }),

    // Technical SEO & Health
    getSeoHealth: builder.query<any, void>({
      query: () => '/seo/health',
      providesTags: ['Settings'],
    }),
    getTechnicalReports: builder.query<any, void>({
      query: () => '/seo/technical',
      providesTags: ['Settings'],
    }),
    getCrawlErrors: builder.query<any, void>({
      query: () => '/seo/crawl-errors',
      providesTags: ['Settings'],
    }),
    runTechnicalScan: builder.mutation<any, void>({
      query: () => ({
        url: '/seo/health/scan',
        method: 'POST',
      }),
      invalidatesTags: ['Settings'],
    }),

    // Redirect Manager CRUD
    getRedirects: builder.query<any, void>({
      query: () => '/seo/redirects',
      providesTags: ['Settings'],
    }),
    createRedirect: builder.mutation<any, any>({
      query: (body) => ({
        url: '/seo/redirects',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),
    updateRedirect: builder.mutation<any, { id: number; body: any }>({
      query: ({ id, body }) => ({
        url: `/seo/redirects/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),
    deleteRedirect: builder.mutation<any, number>({
      query: (id) => ({
        url: `/seo/redirects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Settings'],
    }),

    // Performance & Core Web Vitals
    getPerformance: builder.query<any, void>({
      query: () => '/seo/performance',
      providesTags: ['Settings'],
    }),
    runPerformanceScan: builder.mutation<any, void>({
      query: () => ({
        url: '/seo/performance/scan',
        method: 'POST',
      }),
      invalidatesTags: ['Settings'],
    }),

    // Backlinks & Advanced Warnings
    getBacklinks: builder.query<any, void>({
      query: () => '/seo/backlinks',
      providesTags: ['Settings'],
    }),
    getAdvancedWarnings: builder.query<any, void>({
      query: () => '/seo/warnings',
      providesTags: ['Settings'],
    }),

    // AI SEO Assistant & Recommendations
    getAiRecommendations: builder.query<any, void>({
      query: () => '/seo/ai/recommendations',
      providesTags: ['Settings'],
    }),
    generateAiMetadata: builder.mutation<any, { recipeId: number; action: string }>({
      query: (body) => ({
        url: '/seo/ai/generate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),

    // Advanced AI SEO Automation & Optimization
    getAiAudit: builder.query<any, void>({
      query: () => '/seo/ai/audit',
      providesTags: ['Settings'],
    }),
    runAiAudit: builder.mutation<any, void>({
      query: () => ({
        url: '/seo/ai/audit/run',
        method: 'POST',
      }),
      invalidatesTags: ['Settings'],
    }),
    getAiKeywords: builder.query<any, void>({
      query: () => '/seo/ai/keywords',
      providesTags: ['Settings'],
    }),
    getAiLinking: builder.query<any, void>({
      query: () => '/seo/ai/linking',
      providesTags: ['Settings'],
    }),
    optimizeAiContent: builder.mutation<any, { recipeId: number; focusKeyword: string }>({
      query: (body) => ({
        url: '/seo/ai/optimize',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const {
  useGetSeoSettingsQuery,
  useUpdateSeoSettingsMutation,
  useGetAnalyticsSettingsQuery,
  useUpdateAnalyticsSettingsMutation,
  useGetWebmasterToolsQuery,
  useUpdateWebmasterToolsMutation,
  useGetCrawlReportsQuery,
  useRunCrawlScanMutation,
  useGetSeoHealthQuery,
  useGetTechnicalReportsQuery,
  useGetCrawlErrorsQuery,
  useRunTechnicalScanMutation,
  useGetRedirectsQuery,
  useCreateRedirectMutation,
  useUpdateRedirectMutation,
  useDeleteRedirectMutation,
  useGetPerformanceQuery,
  useRunPerformanceScanMutation,
  useGetBacklinksQuery,
  useGetAdvancedWarningsQuery,
  useGetAiRecommendationsQuery,
  useGenerateAiMetadataMutation,
  useGetAiAuditQuery,
  useRunAiAuditMutation,
  useGetAiKeywordsQuery,
  useGetAiLinkingQuery,
  useOptimizeAiContentMutation,
} = seoApi;
