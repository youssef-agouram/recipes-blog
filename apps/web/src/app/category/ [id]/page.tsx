import { api } from "@/lib/api-client";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;
  
  try {
    const categories = await api.categories.list();
    const category = categories.find(c => c.id === Number(id));
    
    if (!category) return notFound();

    const { data: recipes } = await api.recipes.list({ categoryId: Number(id) });

    return (
      <div className="container max-w-screen-2xl px-4 py-12 md:py-20">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
        </Link>

        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            {category.name} <span className="text-muted-foreground font-normal text-2xl">Recipes</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore all our {category.name.toLowerCase()} recipes.
          </p>
        </header>

        {recipes.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl border-border/60">
            <p className="text-muted-foreground">No recipes found in this category.</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}
