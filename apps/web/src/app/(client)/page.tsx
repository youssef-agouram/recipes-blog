import { api } from "@/lib/api-client";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Suspense } from "react";

import { Pagination } from "@/components/ui/Pagination";

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { page = '1' } = await searchParams;
  const { data: recipes, meta } = await api.recipes.list({ 
    limit: 6, 
    page: Number(page) 
  });
  const categories = await api.categories.list();

  return (
    <div className="flex flex-col space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-muted/30 py-20 lg:py-32">
        <div className="container relative max-w-screen-2xl px-4 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
              Simple Recipes for <span className="text-primary italic">Everyday</span> Living.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Explore our curated collection of minimalist recipes, designed to bring joy and health to your kitchen with minimal effort and maximum flavor.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Link 
                href="/categories"
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-transform hover:scale-105 active:scale-95"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Quick Links */}
      <section className="container max-w-screen-2xl px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">Popular Categories</h2>
          <Link href="/categories" className="flex items-center text-sm font-medium text-primary hover:underline">
            View all <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="rounded-full border border-border/40 bg-card px-5 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              {category.name}
            </Link>
          ))}
          {categories.length === 0 && (
             <p className="text-sm text-muted-foreground italic">No categories found.</p>
          )}
        </div>
      </section>

      {/* Latest Recipes Grid */}
      <section className="container max-w-screen-2xl px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">Latest Recipes</h2>
        </div>
        
        {recipes.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl border-border/60">
            <p className="text-muted-foreground mb-4">No recipes found yet.</p>
            <Link href="/" className="text-sm font-semibold text-primary">Check back soon!</Link>
          </div>
        )}

        <div className="mt-12">
          <Suspense fallback={<div className="h-9 w-full bg-muted animate-pulse rounded-md" />}>
            <Pagination totalPages={meta.totalPages} currentPage={meta.page} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
