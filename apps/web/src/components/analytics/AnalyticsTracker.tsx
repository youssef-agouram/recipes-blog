'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useGetAnalyticsSettingsQuery } from '@/store/api/seoApi';
import * as gtag from '@/lib/gtag';

function TrackRouteChange() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    
    // Build full path including query parameters
    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    
    // Execute standard pageview tracking
    gtag.pageview(url);
    
    // Auto-track search queries if search tracking is enabled
    if (pathname.includes('/search') && searchParams) {
      const q = searchParams.get('q') || searchParams.get('query');
      if (q) {
        gtag.trackSearch(q, 1); // Track search queries automatically
      }
    }
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsTracker() {
  const { data: settings, isLoading } = useGetAnalyticsSettingsQuery();

  // Fallback GA4 ID from environment variable if database is empty
  const gaId = settings?.ga4Id || settings?.googleAnalyticsId || process.env.NEXT_PUBLIC_GA_ID || '';
  const gtmId = settings?.gtmId || '';
  const isEnabled = settings?.analyticsEnabled ?? true;
  const isDebug = settings?.debugMode ?? false;

  if (isLoading || !isEnabled || (!gaId && !gtmId)) {
    return null;
  }

  return (
    <>
      {/* Route change pageview tracking within Suspense boundary */}
      <Suspense fallback={null}>
        <TrackRouteChange />
      </Suspense>

      {/* Google Analytics 4 (GA4) Tag Script */}
      {gaId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script
            id="google-analytics-ga4"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                  debug_mode: ${isDebug},
                  send_page_view: false // Managed manually via TrackRouteChange
                });
              `,
            }}
          />
        </>
      )}

      {/* Google Tag Manager (GTM) Script */}
      {gtmId && (
        <Script
          id="google-tag-manager-gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `,
          }}
        />
      )}

      {/* Inject custom script code overrides (ad networks/verify codes) */}
      {settings?.customScriptsCode && (
        <Script
          id="custom-scripts-code"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: settings.customScriptsCode,
          }}
        />
      )}
    </>
  );
}
export default AnalyticsTracker;
