import { api } from "@/lib/api-client";
import BlogPageContent from "./BlogPageContent";

export const revalidate = 60; // Revalidate every minute

export const metadata = {
  title: "Blog & Culinary Stories | TastyRecipes",
  description: "Explore our collection of expert culinary guides, cooking techniques, kitchen tips, and lifestyle stories.",
};

const DEFAULT_META = {
  total: 0,
  page: 1,
  limit: 3,
  totalPages: 0
};

export default async function BlogPage() {
  try {
    const [response, categories, settings] = await Promise.all([
      api.articles.list({ page: 1, limit: 3 }).catch(() => ({ data: [], meta: DEFAULT_META })),
      api.articles.getCategories().catch(() => []),
      api.settings.getSite().catch(() => null),
    ]);
    
    return (
      <BlogPageContent 
        initialArticles={response?.data || []} 
        initialMeta={response?.meta || DEFAULT_META}
        categories={categories}
        pageTitle={settings?.blogTitle}
        pageSubtitle={settings?.blogSubtitle}
      />
    );
  } catch (error) {
    console.error("Error fetching articles:", error);
    return (
      <BlogPageContent 
        initialArticles={[]} 
        initialMeta={DEFAULT_META}
        categories={[]}
      />
    );
  }
}
