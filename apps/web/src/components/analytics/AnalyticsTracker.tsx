'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useGetAnalyticsSettingsQuery } from '@/store/api/seoApi';
import * as gtag from '@/lib/gtag';

function TrackRouteChange({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    
    // Build full path including query parameters
    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    
    // Execute standard pageview tracking
    gtag.pageview(url, undefined, gaId);
    
    // Log visit in database for dashboard stats
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    let sessionId = typeof window !== 'undefined' ? window.sessionStorage.getItem('tasty_session_id') : null;
    if (!sessionId && typeof window !== 'undefined') {
      sessionId = 'session_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      window.sessionStorage.setItem('tasty_session_id', sessionId);
    }
    
    if (sessionId) {
      fetch(`${API_BASE_URL}/stats/visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: url,
          sessionId: sessionId,
        }),
      }).catch(() => {
        // Silently fail if api server is offline during dev/initialization
      });
    }
    
    // Auto-track search queries if search tracking is enabled
    if (pathname.includes('/search') && searchParams) {
      const q = searchParams.get('q') || searchParams.get('query');
      if (q) {
        gtag.trackSearch(q, 1); // Track search queries automatically
      }
    }
  }, [pathname, searchParams, gaId]);

  return null;
}

export function AnalyticsTracker() {
  const { data: settings, isLoading } = useGetAnalyticsSettingsQuery();

  // Fallback GA4 ID from environment variable if database is empty
  const gaId = settings?.ga4Id || settings?.googleAnalyticsId || process.env.NEXT_PUBLIC_GA_ID || '';
  const gtmId = settings?.gtmId || '';
  const isEnabled = settings?.analyticsEnabled ?? true;
  const isDebug = settings?.debugMode ?? false;

  useEffect(() => {
    if (typeof window !== 'undefined' && gaId) {
      (window as any).gtagId = gaId;
    }
  }, [gaId]);

  if (isLoading || !isEnabled || (!gaId && !gtmId)) {
    return null;
  }

  return (
    <>
      {/* Route change pageview tracking within Suspense boundary */}
      <Suspense fallback={null}>
        <TrackRouteChange gaId={gaId} />
      </Suspense>

      {/* Google Analytics 4 (GA4) Tag Script */}
      {gaId && (
        <>
          <Script
            strategy="lazyOnload"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script
            id="google-analytics-ga4"
            strategy="lazyOnload"
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
          strategy="lazyOnload"
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
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: settings.customScriptsCode,
          }}
        />
      )}
    </>
  );
}
export default AnalyticsTracker;
