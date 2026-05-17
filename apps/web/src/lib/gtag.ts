/**
 * Production-Grade Google Analytics (GA4) & Google Tag Manager (GTM)
 * Reusable Server-Safe Browser Tracking Utilities
 */

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Log page views
export const pageview = (url: string, title?: string) => {
  if (typeof window === 'undefined' || !(window as any).gtag) return;
  
  try {
    (window as any).gtag('config', GA_TRACKING_ID, {
      page_path: url,
      page_title: title || document.title,
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[GA4 pageview] ${url} | Title: ${title || document.title}`);
    }
  } catch (err) {
    console.error('Error tracking pageview:', err);
  }
};

// Log generic custom events
export interface GAEventOptions {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

export const event = ({ action, category, label, value, ...rest }: GAEventOptions) => {
  if (typeof window === 'undefined' || !(window as any).gtag) return;

  try {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...rest,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[GA4 event] Action: ${action} | Category: ${category} | Label: ${label}`, rest);
    }
  } catch (err) {
    console.error('Error tracking event:', err);
  }
};

// Log recipe pageviews & engagement
export const trackRecipeView = (recipeId: number | string, title: string, categoryName?: string) => {
  event({
    action: 'view_recipe',
    category: 'Recipe Engagement',
    label: title,
    recipe_id: recipeId,
    recipe_category: categoryName || 'Uncategorized',
  });
};

// Log recipe cooking actions
export const trackRecipeCookStart = (recipeId: number | string, title: string) => {
  event({
    action: 'start_cooking',
    category: 'Recipe Engagement',
    label: title,
    recipe_id: recipeId,
  });
};

// Log search queries & results count
export const trackSearch = (query: string, resultsCount: number) => {
  event({
    action: 'search',
    category: 'Search Engagement',
    label: query,
    search_term: query,
    results_count: resultsCount,
  });
};
