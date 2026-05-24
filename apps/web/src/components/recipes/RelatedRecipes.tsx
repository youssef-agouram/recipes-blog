import { api } from "@/lib/api-client";
import { RecipeCard } from "./RecipeCard";

interface RelatedRecipesProps {
  categoryId: number;
  currentRecipeId: number;
}

export async function RelatedRecipes({ categoryId, currentRecipeId }: RelatedRecipesProps) {
  const { data: recipes } = await api.recipes.list({ categoryId, limit: 5 });
  
  const related = recipes
    .filter(r => r.id !== currentRecipeId)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="mt-8 md:mt-20 pt-6 md:pt-20 border-t border-border/40 print:hidden">
      <div className="flex items-center gap-2 mb-4 md:mb-8">
        <div className="w-1.5 h-5 md:h-6 bg-primary rounded-full" />
        <h3 className="text-sm md:text-2xl font-black text-white tracking-tight">You Might Also Like</h3>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {related.map((recipe, index) => (
          <div key={recipe.id} className={index >= 2 ? "hidden lg:block" : ""}>
            <RecipeCard recipe={recipe} />
          </div>
        ))}
      </div>
    </section>
  );
}
