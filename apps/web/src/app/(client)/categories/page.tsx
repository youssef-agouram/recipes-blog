import { api } from "@/lib/api-client";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, Coffee, Salad, CookingPot, Cake, Leaf, 
  WheatOff, Timer, CupSoda, Soup, Utensils, Pizza, 
  Sandwich, Apple, Fish, Croissant, Carrot, Flame, 
  Heart, Sparkles, BookOpen, Star, Clock, ChevronRight
} from "lucide-react";

export const revalidate = 60; // Revalidate every minute

export const metadata = {
  title: "Explore Recipe Categories | TastyRecipes",
  description: "Browse all food and cooking categories to find your perfect recipe: dessert, vegetarian, dinner, drinks, and more.",
};

export default async function CategoriesPage() {
  const categories = await api.categories.list().catch(() => []);

  const iconComponents: Record<string, any> = {
    Utensils, Coffee, Pizza, Sandwich, Cake, Leaf,
    Apple, Fish, Croissant, Carrot, Soup, CupSoda,
    Flame, Star, Heart, Clock, Salad, CookingPot
  };

  const fallbackIconMap: Record<string, any> = {
    'breakfast': Coffee,
    'lunch': Utensils,
    'dinner': CookingPot,
    'desserts': Cake,
    'dessert': Cake,
    'vegan': Leaf,
    'gluten free': WheatOff,
    'quick & easy': Timer,
    'drinks': CupSoda,
    'salads': Salad,
    'soup': Soup,
    'fish': Fish,
  };

  return (
    <div className="w-full bg-background text-foreground pb-24 min-h-screen">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-card/30 via-card/10 to-transparent border-b border-white/5 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(242,158,31,0.04),transparent_60%)]"></div>
        <div className="container mx-auto px-6 max-w-[1536px] relative z-10">
          <Link 
            href="/" 
            className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.25em] text-primary hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
          
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Recipe Index
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-none font-heading mb-6">
              Browse by <span className="text-primary">Category</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
              Find exactly what you're craving. Explore our handpicked recipe collections by course, ingredient, dietary preferences, or preparation style.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-6 max-w-[1536px] mt-16">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categories.map((cat) => {
              // Calculate recipe count
              const recipeCount = cat._count?.recipes || 0;

              // Resolve Icon
              const nameLower = cat.name.toLowerCase();
              let CategoryIcon = CookingPot;
              if (cat.icon && iconComponents[cat.icon]) {
                CategoryIcon = iconComponents[cat.icon];
              } else if (fallbackIconMap[nameLower]) {
                CategoryIcon = fallbackIconMap[nameLower];
              }

              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group/card relative flex flex-col bg-card/20 rounded-[32px] overflow-hidden border border-white/5 p-6 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 min-h-[220px]"
                >
                  {/* Glowing background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>

                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-muted-foreground group-hover/card:bg-primary/10 group-hover/card:border-primary/20 group-hover/card:text-primary transition-all duration-500 shadow-inner">
                      <CategoryIcon className="w-6 h-6 stroke-[1.5px] group-hover/card:scale-110 transition-transform" />
                    </div>
                    <span className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/5 text-[8px] font-black uppercase tracking-widest text-muted-foreground group-hover/card:bg-primary/10 group-hover/card:border-primary/20 group-hover/card:text-primary transition-all duration-500">
                      {recipeCount} {recipeCount === 1 ? 'Recipe' : 'Recipes'}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col relative z-10">
                    <h3 className="text-[14px] font-black text-white leading-tight mb-2 tracking-tight group-hover/card:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-medium mb-6 line-clamp-3">
                      {cat.description || `Explore our handpicked collection of delicious ${cat.name.toLowerCase()} recipes. Detailed with step-by-step guides.`}
                    </p>

                    <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-white uppercase tracking-wider group/btn mt-auto self-start">
                      <span className="border-b pb-0.5 border-primary">Explore Category</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/card:translate-x-0.5 transition-transform text-primary" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/10 rounded-[32px] border border-white/5 p-6">
            <Utensils className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-black text-white mb-2">No categories found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Please check back later or add categories via the administration settings panel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
