import { api } from "@/lib/api-client";
import { notFound } from "next/navigation";
import RecipeView from "@/components/recipes/RecipeView";
import { RelatedRecipes } from "@/components/recipes/RelatedRecipes";

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

    return (
      <RecipeView 
        recipe={recipe} 
        relatedRecipes={
          <RelatedRecipes 
            categoryId={recipe.categories?.[0]?.id || 1} 
            currentRecipeId={recipe.id} 
          />
        }
      />
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}