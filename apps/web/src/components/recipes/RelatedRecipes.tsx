import { api } from "@/lib/api-client";
import { RecipeCard } from "./RecipeCard";

interface RelatedRecipesProps {
  categoryId: number;
  currentRecipeId: number;
}

export async function RelatedRecipes({ categoryId, currentRecipeId }: RelatedRecipesProps) {
  const { data: recipes } = await api.recipes.list({ categoryId, limit: 4 });
  
  const related = recipes
    .filter(r => r.id !== currentRecipeId)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="mt-20 pt-20 border-t border-border/40">
      <h3 className="text-2xl font-bold tracking-tight mb-8">You Might Also Like</h3>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </section>
  );
}
