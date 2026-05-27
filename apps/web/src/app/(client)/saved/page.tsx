'use client';

import { useGetSavedRecipesQuery } from "@/store/api/recipeApi";
import { useGetSavedArticlesQuery } from "@/store/api/articleApi";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleCardSkeleton } from "@/components/articles/ArticleCardSkeleton";
import { Bookmark, ChefHat, Search, ArrowLeft, Newspaper, Heart, Utensils } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SavedRecipesPage() {
  const [activeTab, setActiveTab] = useState<'recipes' | 'articles'>('recipes');
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const { data: recipes, isLoading: isLoadingRecipes } = useGetSavedRecipesQuery(undefined, {
    skip: !isAuthenticated
  });

  const { data: articles, isLoading: isLoadingArticles } = useGetSavedArticlesQuery(undefined, {
    skip: !isAuthenticated
  });

  const isLoading = isLoadingRecipes || isLoadingArticles;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/saved');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-6 max-w-[1536px] py-12 min-h-[60vh]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/10">
              <Bookmark className="w-6 h-6" />
            </div>
            <Link href="/" className="flex items-center gap-2 text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to home
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2 font-heading">
            Your <span className="text-primary">Saved</span> Collection
          </h1>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
            All your culinary inspirations and stories in one place.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'recipes' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <Utensils className="w-3.5 h-3.5" />
            Recipes ({recipes?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'articles' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            Articles ({articles?.length || 0})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            activeTab === 'articles' ? (
              <ArticleCardSkeleton key={i} />
            ) : (
              <div key={i} className="aspect-[4/3] bg-white/5 rounded-[32px] animate-pulse border border-white/10" />
            )
          ))}
        </div>
      ) : activeTab === 'recipes' ? (
        recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 border border-dashed border-white/10 flex items-center justify-center mb-8">
              <ChefHat className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">No saved recipes yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-8 font-medium">
              Browse our collection and save your favorite recipes to find them easily later.
            </p>
            <Link
              href="/recipes"
              className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-1"
            >
              Explore Recipes
            </Link>
          </div>
        )
      ) : (
        articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 border border-dashed border-white/10 flex items-center justify-center mb-8">
              <Newspaper className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">No saved articles yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-8 font-medium">
              Read our latest stories and save the ones you love to your personal collection.
            </p>
            <Link
              href="/"
              className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-1"
            >
              Discover Stories
            </Link>
          </div>
        )
      )}
    </div>
  );
}
