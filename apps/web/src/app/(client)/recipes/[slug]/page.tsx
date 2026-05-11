import { api } from "@/lib/api-client";
import { notFound } from "next/navigation";
import RecipeView from "@/components/recipes/RecipeView";

interface RecipePageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;

  try {
    const recipe = await api.recipes.getBySlug(slug);

    if (!recipe) {
      notFound();
    }

    return <RecipeView recipe={recipe} />;
  } catch (error) {
    console.error(error);
    notFound();
  }
}