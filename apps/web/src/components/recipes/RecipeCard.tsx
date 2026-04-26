import Link from "next/link";
import { Recipe } from "@/lib/types";
import { Clock, Users } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link 
      href={`/recipes/${recipe.slug}`}
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group"
    >
      <div className="relative h-48 overflow-hidden">
        {/* Random score badge for design match */}
        {Math.random() > 0.5 && (
           <div className="absolute bottom-4 right-4 z-10 w-10 h-10 bg-brand-green rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow-sm transform -rotate-12 border-2 border-white">
             9.5
           </div>
        )}
        {recipe.imageUrl ? (
          <img 
            src={recipe.imageUrl.startsWith('/') ? `http://localhost:3000${recipe.imageUrl}` : recipe.imageUrl}
            alt={recipe.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400 italic text-sm">
            No image
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-bold mb-2 tracking-tight line-clamp-1">{recipe.title}</h3>
        <p className="text-xs text-gray-500 mb-6 flex-1 line-clamp-2">
          {recipe.summary || "A delightful harmony of succulent ingredients and herbs."}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-400">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {recipe.prepTime || 30} Min</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3"/> {recipe.servings || 2} P</span>
          </div>
          <button className="border border-gray-300 text-gray-600 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider hover:bg-brand-dark hover:text-white hover:border-brand-dark transition-colors">
            View Recipe
          </button>
        </div>
      </div>
    </Link>
  );
}
