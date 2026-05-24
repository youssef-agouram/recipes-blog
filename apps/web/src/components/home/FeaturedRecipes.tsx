'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock, Star, Heart, Bookmark, ChevronUp, Search } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Recipe } from '@/lib/types';
import {
  useSaveRecipeMutation,
  useUnsaveRecipeMutation,
  useFavoriteRecipeMutation,
  useUnfavoriteRecipeMutation,
  useGetSavedRecipesQuery,
  useGetFavoritedRecipesQuery
} from '@/store/api/recipeApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface FeaturedRecipesProps {
  recipes: Recipe[];
  selectedCategoryId?: string;
}

export default function FeaturedRecipes({ recipes, selectedCategoryId }: FeaturedRecipesProps) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [saveRecipe] = useSaveRecipeMutation();
  const [unsaveRecipe] = useUnsaveRecipeMutation();
  const [favoriteRecipe] = useFavoriteRecipeMutation();
  const [unfavoriteRecipe] = useUnfavoriteRecipeMutation();

  const { data: savedRecipes } = useGetSavedRecipesQuery(undefined, { skip: !isAuthenticated });
  const { data: favoritedRecipes } = useGetFavoritedRecipesQuery(undefined, { skip: !isAuthenticated });



  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localSaved, setLocalSaved] = useState<Record<number, boolean>>({});
  const [localFavorited, setLocalFavorited] = useState<Record<number, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSaveToggle = async (e: React.MouseEvent, recipe: Recipe) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to save recipes");
      router.push("/login");
      return;
    }

    const isSaved = localSaved[recipe.id] ?? recipe.isSaved;

    try {
      if (isSaved) {
        setLocalSaved(prev => ({ ...prev, [recipe.id]: false }));
        await unsaveRecipe(recipe.id).unwrap();
        toast.success("Recipe removed from saved collection");
      } else {
        setLocalSaved(prev => ({ ...prev, [recipe.id]: true }));
        await saveRecipe(recipe.id).unwrap();
        toast.success("Recipe added to saved collection");
      }
    } catch (error) {
      setLocalSaved(prev => ({ ...prev, [recipe.id]: isSaved })); // revert on error
      toast.error("Something went wrong");
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent, recipe: Recipe) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to favorite recipes");
      router.push("/login");
      return;
    }

    const isFavorited = localFavorited[recipe.id] ?? recipe.isFavorited;

    try {
      if (isFavorited) {
        setLocalFavorited(prev => ({ ...prev, [recipe.id]: false }));
        await unfavoriteRecipe(recipe.id).unwrap();
        toast.success("Recipe removed from favorites");
      } else {
        setLocalFavorited(prev => ({ ...prev, [recipe.id]: true }));
        await favoriteRecipe(recipe.id).unwrap();
        toast.success("Recipe added to favorites");
      }
    } catch (error) {
      setLocalFavorited(prev => ({ ...prev, [recipe.id]: isFavorited })); // revert on error
      toast.error("Something went wrong");
    }
  };

  const featuredRecipes = recipes.filter(r => r.isFeatured);
  const recipesToDisplay = featuredRecipes.length > 0 ? featuredRecipes : recipes;

  const filteredRecipes = [...recipesToDisplay].filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
    const q = searchQuery.toLowerCase();
    const aTitleMatch = a.title.toLowerCase().includes(q);
    const bTitleMatch = b.title.toLowerCase().includes(q);
    if (aTitleMatch && !bTitleMatch) return -1;
    if (!aTitleMatch && bTitleMatch) return 1;
    return 0;
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const getCategoryColor = (category?: string) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('dinner')) return 'bg-orange-600';
    if (cat.includes('breakfast')) return 'bg-amber-500';
    if (cat.includes('healthy')) return 'bg-primary';
    if (cat.includes('dessert')) return 'bg-purple-600';
    return 'bg-primary';
  };



  return (
    <LayoutGroup id="featured-recipes-group">
      <section className="container mx-auto px-3 sm:px-6 max-w-[1536px] py-6 border-t border-border">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div className="flex-1">
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tighter mb-0.5 leading-none font-heading">
              Featured Recipes
            </h2>
            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
              Handpicked culinary masterpieces for you.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">

            <div className="relative group/search">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-48 md:w-64 bg-white/[0.02] border border-white/10 rounded-lg pl-10 pr-4 text-xs font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
              />
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-xs font-black text-primary hover:text-white uppercase tracking-[0.2em] group transition-colors"
            >
              {isExpanded ? 'Show less' : 'View all'}
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
              ) : (
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </div>
        </div>

        <div className="relative group">
          <AnimatePresence>
            {!isExpanded && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: "-50%", x: -10 }}
                animate={{ opacity: 0.9, scale: 1, y: "-50%", x: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: "-50%", x: -10 }}
                whileHover={{ scale: 1.1, opacity: 1 }}
                onClick={() => scroll('left')}
                className="hidden md:flex absolute -left-4 top-1/2 z-30 w-10 h-10 rounded-full bg-card/90 backdrop-blur-md border border-border items-center justify-center text-white hover:bg-primary hover:text-primary-foreground transition-all shadow-2xl"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!isExpanded ? (
              <motion.div
                key="carousel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredRecipes.map((recipe) => {
                  const isSavedFromStore = savedRecipes?.some(r => r.id === recipe.id) ?? false;
                  const isFavoritedFromStore = favoritedRecipes?.some(r => r.id === recipe.id) ?? false;

                  const isSaved = localSaved[recipe.id] ?? isSavedFromStore ?? recipe.isSaved;
                  const isFavorited = localFavorited[recipe.id] ?? isFavoritedFromStore ?? recipe.isFavorited;

                  return (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="group/card flex flex-col bg-card/50 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-border min-w-[280px] md:min-w-[calc(20%-13px)] md:max-w-[calc(20%-13px)] snap-start"
                    >
                      <Link
                        href={`/recipes/${recipe.slug}`}
                        className="flex flex-col flex-1"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden">
                          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                            <button
                              onClick={(e) => handleSaveToggle(e, recipe)}
                              className={cn(
                                "w-10 h-10 rounded-2xl backdrop-blur-md flex items-center justify-center transition-all duration-300",
                                isSaved
                                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                  : "bg-black/40 text-white hover:bg-primary"
                              )}
                            >
                              <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
                            </button>
                            <button
                              onClick={(e) => handleFavoriteToggle(e, recipe)}
                              className={cn(
                                "w-10 h-10 rounded-2xl backdrop-blur-md flex items-center justify-center transition-all duration-300",
                                isFavorited
                                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                                  : "bg-black/40 text-white hover:bg-rose-500 hover:text-white"
                              )}
                            >
                              <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
                            </button>
                          </div>
                          <Image
                            src={recipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"}
                            alt={recipe.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 100vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-cover group-hover/card:scale-105 transition-transform duration-[1.5s]"
                          />
                          <div className="absolute bottom-2.5 left-2.5 z-20">
                            <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-wider text-white ${getCategoryColor(recipe.categories?.[0]?.name)}`}>
                              {recipe.categories?.[0]?.name || 'Recipe'}
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 flex flex-col flex-1">
                          <h3 className="text-[13px] font-black text-white leading-tight mb-1.5 group-hover/card:text-primary transition-colors line-clamp-1">
                            {recipe.title}
                          </h3>
                          <p className="text-[10px] text-muted-foreground font-medium leading-relaxed mb-4 line-clamp-3 h-[46px]">
                            {recipe.summary || "Master this delicious dish with our step-by-step guide and expert culinary tips."}
                          </p>
                          <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-border">
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground">
                              <Clock className="w-3 h-3 text-primary" />
                              <span>{recipe.totalTime || recipe.prepTime || '30m'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-primary text-primary" />
                              <span className="text-[9px] font-black text-white">4.9</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Placeholders */}
                {recipes.length < 5 && Array.from({ length: 5 - recipes.length }).map((_, i) => (
                  <div
                    key={`placeholder-${i}`}
                    className="bg-card/30 rounded-xl flex flex-col border border-dashed border-border min-w-[280px] md:min-w-[calc(20%-13px)]"
                  >
                    <div className="aspect-[4/3] w-full bg-white/[0.03] rounded-t-xl" />
                    <div className="p-3.5 space-y-2">
                      <div className="h-3 w-3/4 bg-white/5 rounded" />
                      <div className="h-10 w-full bg-white/5 rounded" />
                      <div className="flex justify-between pt-2">
                        <div className="h-2 w-1/4 bg-white/5 rounded" />
                        <div className="h-2 w-1/4 bg-white/5 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={cn(
                  "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4",
                  filteredRecipes.length > 10 ? 'max-h-[850px] overflow-y-auto pr-2 custom-scrollbar' : ''
                )}
              >
                {filteredRecipes.map((recipe) => {
                  const isSavedFromStore = savedRecipes?.some(r => r.id === recipe.id) ?? false;
                  const isFavoritedFromStore = favoritedRecipes?.some(r => r.id === recipe.id) ?? false;

                  const isSaved = localSaved[recipe.id] ?? isSavedFromStore ?? recipe.isSaved;
                  const isFavorited = localFavorited[recipe.id] ?? isFavoritedFromStore ?? recipe.isFavorited;

                  return (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="group/card flex flex-col bg-card/50 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-border w-full"
                    >
                      <Link
                        href={`/recipes/${recipe.slug}`}
                        className="flex flex-col flex-1"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden">
                          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                            <button
                              onClick={(e) => handleSaveToggle(e, recipe)}
                              className={cn(
                                "w-10 h-10 rounded-2xl backdrop-blur-md flex items-center justify-center transition-all duration-300",
                                isSaved
                                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                  : "bg-black/40 text-white hover:bg-primary"
                              )}
                            >
                              <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
                            </button>
                            <button
                              onClick={(e) => handleFavoriteToggle(e, recipe)}
                              className={cn(
                                "w-10 h-10 rounded-2xl backdrop-blur-md flex items-center justify-center transition-all duration-300",
                                isFavorited
                                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                                  : "bg-black/40 text-white hover:bg-rose-500 hover:text-white"
                              )}
                            >
                              <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
                            </button>
                          </div>
                          <Image
                            src={recipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"}
                            alt={recipe.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 100vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-cover group-hover/card:scale-105 transition-transform duration-[1.5s]"
                          />
                          <div className="absolute bottom-2.5 left-2.5 z-20">
                            <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-wider text-white ${getCategoryColor(recipe.categories?.[0]?.name)}`}>
                              {recipe.categories?.[0]?.name || 'Recipe'}
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 flex flex-col flex-1">
                          <h3 className="text-[13px] font-black text-white leading-tight mb-1.5 group-hover/card:text-primary transition-colors line-clamp-1">
                            {recipe.title}
                          </h3>
                          <p className="text-[10px] text-muted-foreground font-medium leading-relaxed mb-4 line-clamp-3 h-[46px]">
                            {recipe.summary || "Master this delicious dish with our step-by-step guide and expert culinary tips."}
                          </p>
                          <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-border">
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground">
                              <Clock className="w-3 h-3 text-primary" />
                              <span>{recipe.totalTime || recipe.prepTime || '30m'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-primary text-primary" />
                              <span className="text-[9px] font-black text-white">4.9</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Placeholders */}
                {recipes.length < 5 && Array.from({ length: 5 - recipes.length }).map((_, i) => (
                  <div
                    key={`placeholder-${i}`}
                    className="bg-card/30 rounded-xl flex flex-col border border-dashed border-border w-full"
                  >
                    <div className="aspect-[4/3] w-full bg-white/[0.03] rounded-t-xl" />
                    <div className="p-3.5 space-y-2">
                      <div className="h-3 w-3/4 bg-white/5 rounded" />
                      <div className="h-10 w-full bg-white/5 rounded" />
                      <div className="flex justify-between pt-2">
                        <div className="h-2 w-1/4 bg-white/5 rounded" />
                        <div className="h-2 w-1/4 bg-white/5 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        <AnimatePresence>
          {!isExpanded && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: "-50%", x: 10 }}
              animate={{ opacity: 0.9, scale: 1, y: "-50%", x: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: "-50%", x: 10 }}
              whileHover={{ scale: 1.1, opacity: 1 }}
              onClick={() => scroll('right')}
              className="hidden md:flex absolute -right-4 top-1/2 z-30 w-10 h-10 rounded-full bg-card/90 backdrop-blur-md border border-border items-center justify-center text-white hover:bg-primary hover:text-primary-foreground transition-all shadow-2xl"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </section>
  </LayoutGroup>
  );
}
