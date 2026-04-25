import Link from "next/link";
import { Recipe } from "@/lib/types";
import Image from "next/image";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link 
      href={`/recipes/${recipe.slug}`}
      className="group flex flex-col space-y-3 rounded-xl border border-border/40 bg-card p-3 transition-all hover:border-border hover:shadow-sm"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40 italic">
            No image available
          </div>
        )}
      </div>
      
      <div className="flex flex-col space-y-1.5 px-1">
        <div className="flex items-center space-x-2">
          {recipe.categories?.[0] && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {recipe.categories[0].name}
            </span>
          )}
        </div>
        
        <h3 className="line-clamp-1 font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
          {recipe.title}
        </h3>
        
        {recipe.summary && (
          <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {recipe.summary}
          </p>
        )}
      </div>
    </Link>
  );
}
