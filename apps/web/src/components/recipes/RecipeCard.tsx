'use client';

import Link from "next/link";
import { Recipe } from "@/lib/types";
import { useSaveRecipeMutation, useUnsaveRecipeMutation, useFavoriteRecipeMutation, useUnfavoriteRecipeMutation } from "@/store/api/recipeApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Heart, Bookmark, Clock, Star } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [saveRecipe] = useSaveRecipeMutation();
  const [unsaveRecipe] = useUnsaveRecipeMutation();
  const [favoriteRecipe] = useFavoriteRecipeMutation();
  const [unfavoriteRecipe] = useUnfavoriteRecipeMutation();

  const [isSaved, setIsSaved] = useState(recipe.isSaved);
  const [isFavorited, setIsFavorited] = useState(recipe.isFavorited);

  useEffect(() => {
    setIsSaved(recipe.isSaved);
    setIsFavorited(recipe.isFavorited);
  }, [recipe.isSaved, recipe.isFavorited]);

  const category = recipe.categories?.[0]?.name || 'Recipe';

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to save recipes");
      router.push("/login");
      return;
    }

    try {
      if (isSaved) {
        setIsSaved(false);
        await unsaveRecipe(recipe.id).unwrap();
        toast.success("Recipe removed from saved collection");
      } else {
        setIsSaved(true);
        await saveRecipe(recipe.id).unwrap();
        toast.success("Recipe added to saved collection");
      }
    } catch (error) {
      setIsSaved(!isSaved); // revert on error
      toast.error("Something went wrong");
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to favorite recipes");
      router.push("/login");
      return;
    }

    try {
      if (isFavorited) {
        setIsFavorited(false);
        await unfavoriteRecipe(recipe.id).unwrap();
        toast.success("Removed from favorites");
      } else {
        setIsFavorited(true);
        await favoriteRecipe(recipe.id).unwrap();
        toast.success("Added to favorites");
      }
    } catch (error) {
      setIsFavorited(!isFavorited); // revert on error
      toast.error("Something went wrong");
    }
  };
  
  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group flex flex-col bg-card/40 backdrop-blur-xl rounded-[32px] overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-500 shadow-xl hover:shadow-primary/5 hover:-translate-y-2 h-full"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={handleSaveToggle}
            className={cn(
              "w-10 h-10 rounded-2xl backdrop-blur-md flex items-center justify-center transition-all duration-300",
              isSaved 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "bg-black/40 text-white/90 hover:bg-primary hover:text-primary-foreground"
            )}
            title={isSaved ? "Unsave recipe" : "Save recipe"}
          >
            <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
          </button>
          <button
            onClick={handleFavoriteToggle}
            className={cn(
              "w-10 h-10 rounded-2xl backdrop-blur-md flex items-center justify-center transition-all duration-300",
              isFavorited 
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
                : "bg-black/40 text-white/90 hover:bg-rose-500 hover:text-white"
            )}
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
          </button>
        </div>
        
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
          />
        ) : (
          <div className="w-full h-full bg-white/[0.02] flex items-center justify-center text-muted-foreground/20 italic text-xs">
            No image available
          </div>
        )}
        
        <div className="absolute bottom-4 left-4 z-20">
          <span className="px-3 py-1 rounded-lg bg-primary/90 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-primary-foreground shadow-lg">
            {category}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {recipe.totalTime || recipe.prepTime || '30 Min'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-primary text-primary" />
            <span className="text-[10px] font-black text-white">4.9</span>
          </div>
        </div>

        <h3 className="text-lg font-black text-white leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {recipe.title}
        </h3>
        
        <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-6 line-clamp-2 flex-1">
          {recipe.summary || "A delightful harmony of succulent ingredients and expert culinary techniques."}
        </p>

        <div className="pt-5 border-t border-white/5 flex items-center justify-between">
          <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">
            View Details
          </span>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <Clock className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
