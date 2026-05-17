import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * Next.js App Router Robots.txt Generator
 * Outputs a standard-compliant robots.txt at /robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', 
        '/api/', 
        '/editor/',
        '/_next/', 
        '/static/'
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
