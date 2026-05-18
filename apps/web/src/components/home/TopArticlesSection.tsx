'use client';

import { useRef, useState } from 'react';
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
  const scrollRef = useRef<HTMLDivElement>(null);

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
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="container mx-auto px-6 max-w-[1536px] py-6 border-t border-border">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-black text-white tracking-tighter mb-0.5 leading-none">{title}</h2>
          <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">{subtitle}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group/search">
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
        {!isExpanded && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-card/90 backdrop-blur-md border border-border flex items-center justify-center text-white hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100 shadow-2xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div
          ref={scrollRef}
          className={isExpanded 
            ? `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ${filteredItems.length > 10 ? 'max-h-[850px] overflow-y-auto pr-2 custom-scrollbar' : ''}` 
            : "flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          }
          style={isExpanded ? {} : { scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredItems.map((item, idx) => {
            const isRecipe = 'prepTime' in item || 'totalTime' in item;
            const url = isRecipe ? `/recipes/${item.slug}` : `/blog/${item.slug}`;
            const category = isRecipe ? (item.categories?.[0]?.name || 'Recipe') : (item.category || 'Article');
            const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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

            const isSaved = localSaved[key] ?? isSavedFromStore ?? item.isSaved;
            const isFavorited = localFavorited[key] ?? isFavoritedFromStore ?? item.isFavorited;

            return (
              <Link
                key={item.id || idx}
                href={url}
                className={`${
                  isExpanded 
                    ? "w-full" 
                    : "min-w-[280px] md:min-w-[calc(20%-13px)] md:max-w-[calc(20%-13px)]"
                } snap-start group/card flex flex-col bg-card/50 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-border`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <div className="absolute top-2 left-2 z-20">
                    <span className={`px-1.5 py-0.5 rounded text-[6px] font-black uppercase tracking-wider text-white ${isRecipe ? 'bg-blue-500' : 'bg-primary'}`}>
                      {category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    <button
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
                    <button
                      onClick={(e) => handleFavoriteToggle(e, item, isRecipe)}
                      className={cn(
                        "w-9 h-9 rounded-xl backdrop-blur-md flex items-center justify-center transition-all duration-300",
                        isFavorited
                          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                          : "bg-black/40 text-white hover:bg-rose-500 hover:text-white"
                      )}
                    >
                      <Heart className={cn("w-4.5 h-4.5", isFavorited && "fill-current")} />
                    </button>
                  </div>
                  <img
                    src={item.imageUrl || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s]"
                  />
                </div>

                <div className="p-3.5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[7px] font-black uppercase tracking-wider ${isRecipe ? 'text-blue-400' : 'text-primary'}`}>{category}</span>
                    <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-wider">{date}</span>
                  </div>
                  <h3 className="text-[12px] font-black text-white leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-[9px] text-muted-foreground font-medium leading-relaxed mb-2 line-clamp-3 h-[42px]">
                    {item.summary || (isRecipe ? "Master this delicious dish with our step-by-step guide." : "Expert guides and nutritional insights.")}
                  </p>
                  <button className="flex items-center gap-1 text-[7px] font-black text-white uppercase tracking-wider group/btn mt-auto">
                    <span className={`border-b pb-0.5 ${isRecipe ? 'border-blue-400' : 'border-primary'}`}>
                      {isRecipe ? 'View Recipe' : 'Read Story'}
                    </span>
                    <ArrowRight className={`w-2.5 h-2.5 group-hover/btn:translate-x-0.5 transition-transform ${isRecipe ? 'text-blue-400' : 'text-primary'}`} />
                  </button>
                </div>
              </Link>
            );
          })}

          {items.length === 0 && Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className={`${
                isExpanded 
                  ? "w-full" 
                  : "min-w-[280px] md:min-w-[calc(20%-13px)]"
              } animate-pulse bg-card rounded-xl h-[260px] border border-border`}
            />
          ))}
        </div>

        {!isExpanded && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-card/90 backdrop-blur-md border border-border flex items-center justify-center text-white hover:bg-primary hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100 shadow-2xl"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </section>
  );
}
