import { api } from "@/lib/api-client";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function SearchResults({ q }: { q: string }) {
  const { data: recipes } = await api.recipes.list({ search: q });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Search Results
        </h1>
        <p className="text-muted-foreground">
          Showing results for <span className="text-foreground font-semibold">"{q}"</span>
        </p>
      </header>

      {recipes.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl border-border/60">
          <p className="text-muted-foreground mb-4">No recipes found for your search.</p>
        </div>
      )}
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams;

  return (
    <div className="container max-w-screen-2xl px-4 py-12 md:py-20">
      <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <SearchResults q={q} />
      </Suspense>
    </div>
  );
}
