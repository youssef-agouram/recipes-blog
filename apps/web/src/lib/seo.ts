import { Metadata } from 'next';

// Base Site URL configuration
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tastyrecipes.com';

/**
 * 1. Canonical URL Helper
 * Creates absolute canonical URLs for the platform
 */
export function getCanonicalUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

// OpenGraph Types
export interface OGArgs {
  title: string;
  description: string;
  image?: string | null;
  type?: 'website' | 'article' | 'recipe';
  url?: string;
  siteName?: string;
}

/**
 * 2. OpenGraph Helper
 * Builds standard OpenGraph object for Next.js Metadata
 */
export function buildOpenGraph({
  title,
  description,
  image,
  type = 'website',
  url,
  siteName = 'TastyRecipes',
}: OGArgs) {
  const defaultImage = `${SITE_URL}/images/og-default.jpg`;
  const imageUrl = image || defaultImage;

  return {
    title,
    description,
    url: url || SITE_URL,
    siteName,
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
    locale: 'en_US',
    type,
  };
}

// Robots Types
export interface RobotsArgs {
  index?: boolean;
  follow?: boolean;
  nocache?: boolean;
}

/**
 * 3. Robots Helper
 * Configures search engine crawl behavior
 */
export function buildRobotsConfig({
  index = true,
  follow = true,
  nocache = false,
}: RobotsArgs = {}) {
  return {
    index,
    follow,
    nocache,
    googleBot: {
      index,
      follow,
      noimageindex: !index,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  };
}

// Metadata Generator Interface
export interface MetadataArgs {
  title: string;
  description: string;
  keywords?: string | string[];
  image?: string | null;
  path?: string;
  noIndex?: boolean;
  type?: 'website' | 'article' | 'recipe';
}

/**
 * 4. Construct Metadata Helper
 * Primary generator for pages using standard Next.js 15 Metadata API
 */
export function constructMetadata({
  title,
  description,
  keywords,
  image,
  path = '',
  noIndex = false,
  type = 'website',
}: MetadataArgs): Metadata {
  const canonical = getCanonicalUrl(path);
  const parsedKeywords = Array.isArray(keywords)
    ? keywords
    : keywords
    ? keywords.split(',').map((k) => k.trim())
    : [];

  const metaTitle = title.toLowerCase().includes('tastyrecipes') 
    ? title 
    : `${title} | TastyRecipes`;

  return {
    title: metaTitle,
    description,
    keywords: parsedKeywords,
    alternates: {
      canonical,
    },
    robots: buildRobotsConfig({ index: !noIndex, follow: !noIndex }),
    openGraph: buildOpenGraph({
      title: metaTitle,
      description,
      image,
      type,
      url: canonical,
    }),
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description,
      images: [image || `${SITE_URL}/images/og-default.jpg`],
      creator: '@tastyrecipes',
    },
    verification: {
      google: process.env.GOOGLE_VERIFICATION || undefined,
      other: {
        bing: process.env.BING_VERIFICATION || '',
      },
    },
  };
}

/**
 * 5. JSON-LD Utility Foundation
 * Generates Schema.org Recipe and Breadcrumb markup for search engine rich results
 */
export function generateRecipeJsonLd(recipe: {
  title: string;
  summary?: string | null;
  imageUrl?: string | null;
  prepTime?: string | null;
  cookTime?: string | null;
  totalTime?: string | null;
  servings?: number | null;
  difficulty?: string | null;
  authorName?: string;
  createdAt: string | Date;
  ingredients?: string[] | { name: string; quantity: string }[];
  instructions?: { text: string }[] | string[] | any;
}) {
  const ingredientsArray = recipe.ingredients
    ? recipe.ingredients.map((ing) => {
        if (typeof ing === 'string') return ing;
        return `${ing.quantity || ''} ${ing.name || ''}`.trim();
      })
    : [];

  // Parse Tiptap / JSON instructions if necessary, fallback to list
  let instructionsArray: any[] = [];
  if (Array.isArray(recipe.instructions)) {
    instructionsArray = recipe.instructions.map((inst, i) => {
      const text = typeof inst === 'string' ? inst : inst.text || '';
      return {
        '@type': 'HowToStep',
        name: `Step ${i + 1}`,
        text,
        url: `${SITE_URL}/recipes#step-${i + 1}`,
      };
    });
  }

  // Parse custom times into standard ISO 8601 Durations
  const parseDuration = (timeStr?: string | null) => {
    if (!timeStr) return undefined;
    const digits = timeStr.replace(/\D/g, '');
    return digits ? `PT${digits}M` : undefined;
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    image: recipe.imageUrl ? [recipe.imageUrl] : [`${SITE_URL}/images/og-default.jpg`],
    author: {
      '@type': 'Person',
      name: recipe.authorName || 'TastyRecipes Chef',
    },
    datePublished: new Date(recipe.createdAt).toISOString(),
    description: recipe.summary || recipe.title,
    prepTime: parseDuration(recipe.prepTime),
    cookTime: parseDuration(recipe.cookTime),
    totalTime: parseDuration(recipe.totalTime),
    recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,
    recipeIngredient: ingredientsArray,
    recipeInstructions: instructionsArray,
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; item: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item.startsWith('http') ? item.item : `${SITE_URL}${item.item}`,
    })),
  };
}
