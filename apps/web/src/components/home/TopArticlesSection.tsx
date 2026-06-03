'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Star, 
  Heart, 
  Bookmark, 
  ChevronUp, 
  ArrowRight, 
  Search 
} from 'lucide-react';
import { LazyMotion, domAnimation, m, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Recipe } from '@/lib/types';
import { 
  useSaveRecipeMutation, 
  useUnsaveRecipeMutation, 
  useFavoriteRecipeMutation, 
  useUnfavoriteRecipeMutation,
  useGetSavedRecipesQuery,
  useGetFavoritedRecipesQuery
} from '@/store/api/recipeApi';
import { 
  useSaveArticleMutation, 
  useUnsaveArticleMutation,
  useFavoriteArticleMutation,
  useUnfavoriteArticleMutation,
  useGetSavedArticlesQuery,
  useGetFavoritedArticlesQuery
} from '@/store/api/articleApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface TopArticlesSectionProps {
  items: any[];
  title: string;
  subtitle: string;
}

export default function TopArticlesSection({ items, title, subtitle }: TopArticlesSectionProps) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [saveRecipe] = useSaveRecipeMutation();
  const [unsaveRecipe] = useUnsaveRecipeMutation();
  const [favoriteRecipe] = useFavoriteRecipeMutation();
  const [unfavoriteRecipe] = useUnfavoriteRecipeMutation();
  const [saveArticle] = useSaveArticleMutation();
  const [unsaveArticle] = useUnsaveArticleMutation();
  const [favoriteArticle] = useFavoriteArticleMutation();
  const [unfavoriteArticle] = useUnfavoriteArticleMutation();
  
  const { data: savedRecipes } = useGetSavedRecipesQuery(undefined, { skip: !isAuthenticated });
  const { data: favoritedRecipes } = useGetFavoritedRecipesQuery(undefined, { skip: !isAuthenticated });
  const { data: savedArticles } = useGetSavedArticlesQuery(undefined, { skip: !isAuthenticated });
  const { data: favoritedArticles } = useGetFavoritedArticlesQuery(undefined, { skip: !isAuthenticated });

  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localSaved, setLocalSaved] = useState<Record<string, boolean>>({});
  const [localFavorited, setLocalFavorited] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStableDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
  };

  const getCategoryColor = (categoryName?: string) => {
    const cat = categoryName?.toLowerCase() || '';
    if (cat.includes('dinner')) return 'bg-orange-600 text-white';
    if (cat.includes('breakfast')) return 'bg-amber-500 text-black';
    if (cat.includes('healthy')) return 'bg-emerald-600 text-white';
    if (cat.includes('dessert')) return 'bg-purple-600 text-white';
    if (cat.includes('recipe')) return 'bg-blue-600 text-white';
    if (cat.includes('article') || cat.includes('lifestyle') || cat.includes('nutrition')) return 'bg-zinc-700 text-white';
    return 'bg-primary text-primary-foreground';
  };
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerWidthRef = useRef<number>(0);

  useEffect(() => {
    if (!scrollRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        containerWidthRef.current = entry.contentRect.width;
      }
    });
    observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSaveToggle = async (e: React.MouseEvent, item: any, isRecipe: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to save");
      router.push("/login");
      return;
    }

    const key = `${isRecipe ? 'recipe' : 'article'}-${item.id}`;
    const isSaved = localSaved[key] ?? item.isSaved;

    try {
      if (isRecipe) {
        if (isSaved) {
          setLocalSaved(prev => ({ ...prev, [key]: false }));
          await unsaveRecipe(item.id).unwrap();
          toast.success("Recipe removed from saved collection");
        } else {
          setLocalSaved(prev => ({ ...prev, [key]: true }));
          await saveRecipe(item.id).unwrap();
          toast.success("Recipe added to saved collection");
        }
      } else {
        if (isSaved) {
          setLocalSaved(prev => ({ ...prev, [key]: false }));
          await unsaveArticle(item.id).unwrap();
          toast.success("Article removed from saved collection");
        } else {
          setLocalSaved(prev => ({ ...prev, [key]: true }));
          await saveArticle(item.id).unwrap();
          toast.success("Article added to saved collection");
        }
      }
    } catch (error) {
      setLocalSaved(prev => ({ ...prev, [key]: isSaved })); // revert
      toast.error("Something went wrong");
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent, item: any, isRecipe: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to favorite items");
      router.push("/login");
      return;
    }

    const key = `${isRecipe ? 'recipe' : 'article'}-${item.id}`;
    const isFavorited = localFavorited[key] ?? item.isFavorited;

    try {
      if (isRecipe) {
        if (isFavorited) {
          setLocalFavorited(prev => ({ ...prev, [key]: false }));
          await unfavoriteRecipe(item.id).unwrap();
          toast.success("Recipe removed from favorites");
        } else {
          setLocalFavorited(prev => ({ ...prev, [key]: true }));
          await favoriteRecipe(item.id).unwrap();
          toast.success("Recipe added to favorites");
        }
      } else {
        if (isFavorited) {
          setLocalFavorited(prev => ({ ...prev, [key]: false }));
          await unfavoriteArticle(item.id).unwrap();
          toast.success("Article removed from favorites");
        } else {
          setLocalFavorited(prev => ({ ...prev, [key]: true }));
          await favoriteArticle(item.id).unwrap();
          toast.success("Article added to favorites");
        }
      }
    } catch (error) {
      setLocalFavorited(prev => ({ ...prev, [key]: isFavorited })); // revert
      toast.error("Something went wrong");
    }
  };

  const filteredItems = [...items].filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    const q = searchQuery.toLowerCase();
    const aTitleMatch = a.title.toLowerCase().includes(q);
    const bTitleMatch = b.title.toLowerCase().includes(q);
    if (aTitleMatch && !bTitleMatch) return -1;
    if (!aTitleMatch && bTitleMatch) return 1;
    return 0;
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const width = containerWidthRef.current || scrollRef.current.clientWidth || 300;
      const delta = direction === 'left' ? -width : width;
      scrollRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  return (
    <LazyMotion features={domAnimation}>
    <LayoutGroup id="top-articles-group">
      <section className="container mx-auto px-3 sm:px-6 max-w-[1536px] py-8 sm:py-6 border-t border-border">
        <div className="flex items-center justify-between mb-6 gap-2">
          <div>
            <h2 className="text-sm xs:text-base sm:text-3xl font-black text-white tracking-tight leading-none font-heading mb-1">{title}</h2>
            <p className="text-muted-foreground text-[8px] sm:text-[10px] font-medium uppercase tracking-wider">{subtitle}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative group/search hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-48 md:w-64 bg-white/[0.02] border border-white/10 rounded-lg pl-10 pr-4 text-xs font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
              />
            </div>

            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 text-[9px] sm:text-xs font-black text-primary uppercase tracking-wider sm:tracking-[0.2em] group hover:text-white transition-colors shrink-0"
            >
              <span>{isExpanded ? 'Show less' : 'View all'}</span>
              {isExpanded ? (
                <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-y-1 transition-transform" />
              ) : (
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </div>
        </div>

        <div className="relative group">
          <AnimatePresence>
            {!isExpanded && (
              <m.button
                initial={{ opacity: 0, scale: 0.8, y: "-50%", x: -10 }}
                animate={{ opacity: 0.9, scale: 1, y: "-50%", x: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: "-50%", x: -10 }}
                whileHover={{ scale: 1.1, opacity: 1 }}
                onClick={() => scroll('left')}
                className="hidden md:flex absolute -left-4 top-1/2 z-30 w-10 h-10 rounded-full bg-card/90 backdrop-blur-md border border-border items-center justify-center text-white hover:bg-primary hover:text-primary-foreground transition-all shadow-2xl"
              >
                <ChevronLeft className="w-5 h-5" />
              </m.button>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!isExpanded ? (
              <m.div
                key="carousel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredItems.map((item, idx) => {
                  const isRecipe = 'prepTime' in item || 'totalTime' in item;
                  const url = isRecipe ? `/recipes/${item.slug}` : `/blog/${item.slug}`;
                  const category = isRecipe ? (item.categories?.[0]?.name || 'Recipe') : (item.category || 'Article');
                  const date = getStableDate(item.createdAt);

                  const key = `${isRecipe ? 'recipe' : 'article'}-${item.id}`;
                  
                  // Hydrate from global state if available
                  let isSavedFromStore = false;
                  let isFavoritedFromStore = false;
                  
                  if (isRecipe) {
                    isSavedFromStore = savedRecipes?.some((r: any) => r.id === item.id) ?? false;
                    isFavoritedFromStore = favoritedRecipes?.some((r: any) => r.id === item.id) ?? false;
                  } else {
                    isSavedFromStore = savedArticles?.some((a: any) => a.id === item.id) ?? false;
                    isFavoritedFromStore = favoritedArticles?.some((a: any) => a.id === item.id) ?? false;
                  }

                  const isSaved = mounted ? (localSaved[key] ?? isSavedFromStore ?? item.isSaved) : (item.isSaved ?? false);
                  const isFavorited = mounted ? (localFavorited[key] ?? isFavoritedFromStore ?? item.isFavorited) : (item.isFavorited ?? false);

                  return (
                    <m.div
                      key={item.id || idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="group/card flex flex-col bg-card/50 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-border min-w-[280px] md:min-w-[calc(20%-13px)] md:max-w-[calc(20%-13px)] snap-start"
                    >
                      <Link
                        href={url}
                        className="flex flex-col flex-1"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden">
                          <div className="absolute top-4 left-4 z-20">
                            <span className={cn(
                              "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider shadow-lg shadow-black/50 border border-white/10",
                              getCategoryColor(category)
                            )}>
                              {category}
                            </span>
                          </div>
                          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                            <button
                              suppressHydrationWarning
                              onClick={(e) => handleSaveToggle(e, item, isRecipe)}
                              className={cn(
                                "w-9 h-9 rounded-xl backdrop-blur-md flex items-center justify-center transition-all duration-300",
                                isSaved
                                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                  : "bg-black/40 text-white hover:bg-primary"
                              )}
                            >
                              <Bookmark className={cn("w-4.5 h-4.5", isSaved && "fill-current")} />
                            </button>
                          </div>
                          <Image
                            src={item.imageUrl || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80"}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 100vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-[1.5s]"
                          />
                        </div>

                        <div className="p-3.5 flex flex-col flex-1">

                          <h3 className="text-[12px] font-black text-white leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-[9px] text-muted-foreground font-medium leading-relaxed mb-4 line-clamp-3 h-[42px]">
                            {item.summary || (isRecipe ? "Master this delicious dish with our step-by-step guide." : "Expert guides and nutritional insights.")}
                          </p>
                          {!isRecipe && (
                            <button className="flex items-center gap-1 text-[7px] font-black text-white uppercase tracking-wider group/btn mb-4 mt-auto">
                              <span className="border-b pb-0.5 border-primary">
                                Read Story
                              </span>
                              <ArrowRight className="w-2.5 h-2.5 group-hover/btn:translate-x-0.5 transition-transform text-primary" />
                            </button>
                          )}
                          <div className={cn("flex items-center justify-between pt-2.5 border-t border-border", isRecipe ? "mt-auto" : "")}>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground">
                              <Clock className="w-3 h-3 text-primary" />
                              <span>{isRecipe ? (item.totalTime || item.prepTime || '30m') : '5m'}</span>
                            </div>
                            <button
                              suppressHydrationWarning
                              onClick={(e) => handleFavoriteToggle(e, item, isRecipe)}
                              className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0",
                                isFavorited
                                  ? "text-rose-500 bg-rose-500/10 shadow-sm"
                                  : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5"
                              )}
                            >
                              <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
                            </button>
                          </div>
                        </div>
                      </Link>
                    </m.div>
                  );
                })}

                {items.length === 0 && Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={`placeholder-${i}`}
                    className="animate-pulse bg-card rounded-xl h-[260px] border border-border min-w-[280px] md:min-w-[calc(20%-13px)]"
                  />
                ))}
              </m.div>
            ) : (
              <m.div
                key="grid"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={cn(
                  "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4",
                  filteredItems.length > 10 ? 'max-h-[850px] overflow-y-auto pr-2 custom-scrollbar' : ''
                )}
              >
                {filteredItems.map((item, idx) => {
                  const isRecipe = 'prepTime' in item || 'totalTime' in item;
                  const url = isRecipe ? `/recipes/${item.slug}` : `/blog/${item.slug}`;
                  const category = isRecipe ? (item.categories?.[0]?.name || 'Recipe') : (item.category || 'Article');
                  const date = getStableDate(item.createdAt);

                  const key = `${isRecipe ? 'recipe' : 'article'}-${item.id}`;
                  
                  // Hydrate from global state if available
                  let isSavedFromStore = false;
                  let isFavoritedFromStore = false;
                  
                  if (isRecipe) {
                    isSavedFromStore = savedRecipes?.some((r: any) => r.id === item.id) ?? false;
                    isFavoritedFromStore = favoritedRecipes?.some((r: any) => r.id === item.id) ?? false;
                  } else {
                    isSavedFromStore = savedArticles?.some((a: any) => a.id === item.id) ?? false;
                    isFavoritedFromStore = favoritedArticles?.some((a: any) => a.id === item.id) ?? false;
                  }

                  const isSaved = mounted ? (localSaved[key] ?? isSavedFromStore ?? item.isSaved) : (item.isSaved ?? false);
                  const isFavorited = mounted ? (localFavorited[key] ?? isFavoritedFromStore ?? item.isFavorited) : (item.isFavorited ?? false);

                  return (
                    <m.div
                      key={item.id || idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="group/card flex flex-col bg-card/50 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-border w-full"
                    >
                      <Link
                        href={url}
                        className="flex flex-col flex-1"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden">
                          <div className="absolute top-4 left-4 z-20">
                            <span className={cn(
                              "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider shadow-lg shadow-black/50 border border-white/10",
                              getCategoryColor(category)
                            )}>
                              {category}
                            </span>
                          </div>
                          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                            <button
                              suppressHydrationWarning
                              onClick={(e) => handleSaveToggle(e, item, isRecipe)}
                              className={cn(
                                "w-9 h-9 rounded-xl backdrop-blur-md flex items-center justify-center transition-all duration-300",
                                isSaved
                                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                  : "bg-black/40 text-white hover:bg-primary"
                              )}
                            >
                              <Bookmark className={cn("w-4.5 h-4.5", isSaved && "fill-current")} />
                            </button>
                          </div>
                          <Image
                            src={item.imageUrl || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80"}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 100vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-[1.5s]"
                          />
                        </div>

                        <div className="p-3.5 flex flex-col flex-1">

                          <h3 className="text-[12px] font-black text-white leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-[9px] text-muted-foreground font-medium leading-relaxed mb-4 line-clamp-3 h-[42px]">
                            {item.summary || (isRecipe ? "Master this delicious dish with our step-by-step guide." : "Expert guides and nutritional insights.")}
                          </p>
                          {!isRecipe && (
                            <button className="flex items-center gap-1 text-[7px] font-black text-white uppercase tracking-wider group/btn mb-4 mt-auto">
                              <span className="border-b pb-0.5 border-primary">
                                Read Story
                              </span>
                              <ArrowRight className="w-2.5 h-2.5 group-hover/btn:translate-x-0.5 transition-transform text-primary" />
                            </button>
                          )}
                          <div className={cn("flex items-center justify-between pt-2.5 border-t border-border", isRecipe ? "mt-auto" : "")}>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground">
                              <Clock className="w-3 h-3 text-primary" />
                              <span>{isRecipe ? (item.totalTime || item.prepTime || '30m') : '5m'}</span>
                            </div>
                            <button
                              suppressHydrationWarning
                              onClick={(e) => handleFavoriteToggle(e, item, isRecipe)}
                              className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0",
                                isFavorited
                                  ? "text-rose-500 bg-rose-500/10 shadow-sm"
                                  : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5"
                              )}
                            >
                              <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
                            </button>
                          </div>
                        </div>
                      </Link>
                    </m.div>
                  );
                })}

                {items.length === 0 && Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={`placeholder-${i}`}
                    className="animate-pulse bg-card rounded-xl h-[260px] border border-border w-full"
                  />
                ))}
              </m.div>
            )}
          </AnimatePresence>

        <AnimatePresence>
          {!isExpanded && (
            <m.button
              initial={{ opacity: 0, scale: 0.8, y: "-50%", x: 10 }}
              animate={{ opacity: 0.9, scale: 1, y: "-50%", x: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: "-50%", x: 10 }}
              whileHover={{ scale: 1.1, opacity: 1 }}
              onClick={() => scroll('right')}
              className="hidden md:flex absolute -right-4 top-1/2 z-30 w-10 h-10 rounded-full bg-card/90 backdrop-blur-md border border-border items-center justify-center text-white hover:bg-primary hover:text-primary-foreground transition-all shadow-2xl"
            >
              <ChevronRight className="w-5 h-5" />
            </m.button>
          )}
        </AnimatePresence>
      </div>
    </section>
  </LayoutGroup>
    </LazyMotion>
  );
}
