'use client';

import { Analytics } from '@vercel/analytics/react';

export function VercelAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        // Discard events for any path starting with /admin
        if (event.url) {
          try {
            const pathname = event.url.startsWith('/') 
              ? event.url 
              : new URL(event.url).pathname;
              
            if (pathname.startsWith('/admin')) {
              return null;
            }
          } catch (e) {
            // If URL parsing fails, check substring fallback
            if (event.url.includes('/admin')) {
              return null;
            }
          }
        }

        // Discard events if the logged in user is an Administrator or Editor
        if (typeof window !== 'undefined') {
          try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
              const user = JSON.parse(userStr);
              if (user?.role === 'Administrator' || user?.role === 'Editor') {
                return null;
              }
            }
          } catch (e) {
            // Ignore storage/parsing errors
          }
        }

        return event;
      }}
    />
  );
}

export default VercelAnalytics;
