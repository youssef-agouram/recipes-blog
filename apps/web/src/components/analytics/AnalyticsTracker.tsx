'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useGetAnalyticsSettingsQuery } from '@/store/api/seoApi';

function TrackRouteChange() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    
    // Build full path including query parameters
    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    
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
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsTracker() {
  const { data: settings, isLoading } = useGetAnalyticsSettingsQuery();

  const isEnabled = settings?.analyticsEnabled ?? true;

  if (isLoading || !isEnabled) {
    return null;
  }

  return (
    <>
      {/* Route change pageview tracking within Suspense boundary */}
      <Suspense fallback={null}>
        <TrackRouteChange />
      </Suspense>

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
