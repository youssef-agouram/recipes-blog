'use client';

import Link from "next/link";
import { Recipe } from "@/lib/types";
import { useSaveRecipeMutation, useUnsaveRecipeMutation, useFavoriteRecipeMutation, useUnfavoriteRecipeMutation } from "@/store/api/recipeApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn, formatCardTime } from "@/lib/utils";
import { Heart, Bookmark, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

interface RecipeCardProps {
  recipe: Recipe;
  priority?: boolean;
}

export function RecipeCard({ recipe, priority = false }: RecipeCardProps) {
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

  const timeText = formatCardTime(recipe.totalTime || recipe.prepTime || '30 Min');

  return (
    <div className="group/card flex flex-col bg-card/50 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-border h-full">
      <Link
        href={`/recipes/${recipe.slug}`}
        className="flex flex-col flex-1"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <div className="absolute top-2 left-2 z-20">
            <span className="px-1.5 py-0.5 rounded text-[6px] font-black uppercase tracking-wider text-white bg-primary">
              {category}
            </span>
          </div>
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
            <button
              onClick={handleSaveToggle}
              className={cn(
                "w-9 h-9 rounded-xl backdrop-blur-md flex items-center justify-center transition-all duration-300",
                isSaved
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-black/40 text-white hover:bg-primary"
              )}
              title={isSaved ? "Unsave recipe" : "Save recipe"}
            >
              <Bookmark className={cn("w-4.5 h-4.5", isSaved && "fill-current")} />
            </button>
            <button
              onClick={handleFavoriteToggle}
              className={cn(
                "w-9 h-9 rounded-xl backdrop-blur-md flex items-center justify-center transition-all duration-300",
                isFavorited
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                  : "bg-black/40 text-white hover:bg-rose-500 hover:text-white"
              )}
              title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={cn("w-4.5 h-4.5", isFavorited && "fill-current")} />
            </button>
          </div>
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover/card:scale-105 transition-transform duration-[1.5s]"
            />
          ) : (
            <div className="w-full h-full bg-white/[0.02] flex items-center justify-center text-muted-foreground/20 italic text-xs">
              No image available
            </div>
          )}
        </div>

        <div className="p-3.5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[7px] font-black uppercase tracking-wider text-primary">{category}</span>
            <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-wider">{timeText}</span>
          </div>
          <h3 className="text-[12px] font-black text-white leading-tight mb-1 group-hover/card:text-primary transition-colors line-clamp-1">
            {recipe.title}
          </h3>
          <p className="text-[9px] text-muted-foreground font-medium leading-relaxed mb-2 line-clamp-3 h-[42px]">
            {recipe.summary || "Master this delicious dish with our step-by-step guide."}
          </p>
          <button className="flex items-center gap-1 text-[7px] font-black text-white uppercase tracking-wider group/btn mt-auto text-left">
            <span className="border-b pb-0.5 border-primary">
              View Recipe
            </span>
            <ArrowRight className="w-2.5 h-2.5 group-hover/btn:translate-x-0.5 transition-transform text-primary" />
          </button>
        </div>
      </Link>
    </div>
  );
}
