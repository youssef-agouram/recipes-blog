import { api } from "@/lib/api-client";
import { RecipesPageContent } from "./RecipesPageContent";
import { constructMetadata } from "@/lib/seo";
import { Metadata } from "next";

export const revalidate = 60;

interface RecipesPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
  }>;
}

export async function generateMetadata({ searchParams }: RecipesPageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const categoryId = resolvedParams.category ? parseInt(resolvedParams.category) : undefined;
  const search = resolvedParams.search || "";
  const page = resolvedParams.page || "1";

  let title = "Delicious Recipes";
  let description = "Browse all our handpicked cooking recipes and start your culinary journey today.";

  if (search) {
    title = `Search results for "${search}" - Recipes`;
    description = `Find the best cooking recipes matching "${search}" on TastyRecipes.`;
  } else if (categoryId) {
    try {
      const categories = await api.categories.list();
      const currentCategory = categories.find((c) => c.id === categoryId);
      if (currentCategory) {
        title = `${currentCategory.name} Recipes`;
        description = currentCategory.description || `Browse our delicious collection of ${currentCategory.name} recipes.`;
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (page !== "1") {
    title += ` (Page ${page})`;
  }

  return constructMetadata({
    title,
    description,
    path: `/recipes?${new URLSearchParams(resolvedParams as any).toString()}`,
  });
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1;
  const limit = resolvedParams.limit ? parseInt(resolvedParams.limit) : 12;
  const search = resolvedParams.search || "";
  const categoryId = resolvedParams.category ? parseInt(resolvedParams.category) : undefined;

  const [categories, recipesResponse, settings] = await Promise.all([
    api.categories.list().catch(() => []),
    api.recipes.list({
      page,
      limit,
      search,
      categoryId,
    }).catch((err) => {
      console.error("Error fetching recipes:", err);
      return { 
        data: [], 
        meta: { total: 0, page: 1, limit: 12, totalPages: 0 } 
      };
    }),
    api.settings.getSite().catch(() => null)
  ]);

  return (
    <RecipesPageContent
      recipesResponse={recipesResponse}
      initialSearch={search}
      pageTitle={settings?.recipesTitle}
      pageSubtitle={settings?.recipesSubtitle}
    />
  );
}
