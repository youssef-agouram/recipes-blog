'use client';

import { useGetFavoritedRecipesQuery } from "@/store/api/recipeApi";
import { useGetFavoritedArticlesQuery } from "@/store/api/articleApi";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleCardSkeleton } from "@/components/articles/ArticleCardSkeleton";
import { Heart, ChefHat, ArrowLeft, Newspaper, Utensils, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState<'recipes' | 'articles'>('recipes');
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const { data: recipes, isLoading: isLoadingRecipes } = useGetFavoritedRecipesQuery(undefined, {
    skip: !isAuthenticated
  });

  const { data: articles, isLoading: isLoadingArticles } = useGetFavoritedArticlesQuery(undefined, {
    skip: !isAuthenticated
  });

  const isLoading = isLoadingRecipes || isLoadingArticles;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/favorites');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-6 max-w-[1536px] py-12 min-h-[60vh]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 shadow-lg shadow-rose-500/10">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <Link href="/" className="flex items-center gap-2 text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to home
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2 font-heading">
            Your <span className="text-rose-500">Favorite</span> Items
          </h1>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
            The recipes and stories you love the most.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'recipes' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <Utensils className="w-3.5 h-3.5" />
            Recipes ({recipes?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'articles' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
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
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">No favorites yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-8 font-medium">
              Show some love to the recipes you enjoy and they will appear here.
            </p>
            <Link
              href="/recipes"
              className="px-8 py-4 rounded-2xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 hover:-translate-y-1"
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
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">No favorite stories yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-8 font-medium">
              Save your favorite stories to your personal collection.
            </p>
            <Link
              href="/"
              className="px-8 py-4 rounded-2xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 hover:-translate-y-1"
            >
              Discover Stories
            </Link>
          </div>
        )
      )}
    </div>
  );
}
