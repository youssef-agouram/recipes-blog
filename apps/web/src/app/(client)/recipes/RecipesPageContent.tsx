'use client';

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Recipe, PaginatedResponse } from "@/lib/types";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { Search, ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecipesPageContentProps {
  recipesResponse: PaginatedResponse<Recipe>;
  initialSearch: string;
}

export function RecipesPageContent({
  recipesResponse,
  initialSearch,
}: RecipesPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);

  // Synchronize state with URL search param changes (e.g. back navigation)
  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQuerySearch = searchParams.get("search") || "";
      if (search !== currentQuerySearch) {
        updateFilters(search, 1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, searchParams]);

  const { data: recipes, meta } = recipesResponse;
  const { totalPages, page } = meta;

  const updateFilters = (newSearch: string, newPage: number = 1) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Remove category if any exists, since filters are removed
    params.delete("category");

    if (newSearch) {
      params.set("search", newSearch);
    } else {
      params.delete("search");
    }

    if (newPage > 1) {
      params.set("page", newPage.toString());
    } else {
      params.delete("page");
    }

    startTransition(() => {
      router.push(`/recipes?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(search, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateFilters(search, newPage);
    }
  };

  const handleClearAll = () => {
    setSearch("");
    startTransition(() => {
      router.push("/recipes");
    });
  };

  return (
    <div className="min-h-screen bg-[#060913] text-white pt-16 pb-24">
      <div className="container mx-auto px-6 max-w-[1536px]">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover culinary arts</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-tight font-heading">
            Our Recipe <span className="text-primary">Collection</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Explore thousands of handpicked recipes from around the world. Search by ingredients or names to find your next meal.
          </p>
        </div>

        {/* Centered Search Input */}
        <div className="flex justify-center mb-16">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14 bg-white/[0.02] border border-white/10 rounded-xl pl-12 pr-12 text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:bg-white/[0.04] transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  updateFilters("", 1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Recipes Grid */}
        <div className={cn(
          "transition-opacity duration-300",
          isPending ? "opacity-50 pointer-events-none" : "opacity-100"
        )}>
          {recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-[#0b0f1d] border border-white/5 rounded-[32px] max-w-xl mx-auto px-6">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-black text-white mb-2">No Recipes Found</h2>
              <p className="text-sm text-muted-foreground font-medium mb-6">
                We couldn't find any recipes matching your search criteria. Try searching for different keywords.
              </p>
              <button
                onClick={handleClearAll}
                className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-16 pt-8 border-t border-white/5">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || isPending}
              className={cn(
                "w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:pointer-events-none"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = pageNum === page;
                
                // Show first, last, current, and pages near current
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  Math.abs(pageNum - page) <= 1
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isPending}
                      className={cn(
                        "w-12 h-12 rounded-2xl text-xs font-black transition-all border",
                        isCurrent
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                          : "bg-white/5 text-white/60 border-white/10 hover:text-white hover:border-white/20"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                }

                // Show ellipsis if needed
                if (
                  (pageNum === 2 && page > 3) ||
                  (pageNum === totalPages - 1 && page < totalPages - 2)
                ) {
                  return (
                    <span key={pageNum} className="w-8 text-center text-xs font-bold text-muted-foreground/60">
                      ...
                    </span>
                  );
                }

                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || isPending}
              className={cn(
                "w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:pointer-events-none"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
