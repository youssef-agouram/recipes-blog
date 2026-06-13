import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * Next.js App Router Sitemap Generator
 * Generates an XML sitemap at /sitemap.xml mapping static routes and dynamic recipes/categories.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/recipes',
    '/categories',
    '/login',
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").trim();
    
    // Fetch recipes from Express backend
    const recipesRes = await fetch(`${API_BASE_URL}/recipes?limit=100`, { 
      next: { revalidate: 3600 } 
    }).catch(() => null);

    if (recipesRes && recipesRes.ok) {
      const recipesData = await recipesRes.json();
      const recipes = Array.isArray(recipesData) ? recipesData : recipesData.data || [];
      
      recipes.forEach((recipe: any) => {
        if (recipe.slug && recipe.status === 'PUBLISHED') {
          dynamicRoutes.push({
            url: `${SITE_URL}/recipes/${recipe.slug}`,
            lastModified: new Date(recipe.updatedAt || recipe.createdAt || new Date()),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      });
    }
  } catch (err) {
    // Fallback if backend API is not reachable during build time
    console.warn('Could not fetch recipes for sitemap generation:', err);
  }

  try {
    const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").trim();
    
    // Fetch categories from Express backend
    const categoriesRes = await fetch(`${API_BASE_URL}/categories`, { 
      next: { revalidate: 3600 } 
    }).catch(() => null);

    if (categoriesRes && categoriesRes.ok) {
      const categories = await categoriesRes.json();
      
      categories.forEach((category: any) => {
        if (category.slug && category.status !== 'HIDDEN') {
          dynamicRoutes.push({
            url: `${SITE_URL}/categories/${category.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          });
        }
      });
    }
  } catch (err) {
    console.warn('Could not fetch categories for sitemap generation:', err);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
