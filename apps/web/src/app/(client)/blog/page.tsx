import { api } from "@/lib/api-client";
import BlogPageContent from "./BlogPageContent";

export const revalidate = 60; // Revalidate every minute

export const metadata = {
  title: "Blog & Culinary Stories | TastyRecipes",
  description: "Explore our collection of expert culinary guides, cooking techniques, kitchen tips, and lifestyle stories.",
};

export default async function BlogPage() {
  try {
    const articles = await api.articles.list().catch(() => []);
    
    return (
      <BlogPageContent initialArticles={articles} />
    );
  } catch (error) {
    console.error("Error fetching articles:", error);
    return (
      <BlogPageContent initialArticles={[]} />
    );
  }
}
