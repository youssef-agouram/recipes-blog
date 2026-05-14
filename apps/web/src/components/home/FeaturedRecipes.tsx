'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock, Star, Heart, Bookmark, ChevronUp, Search } from 'lucide-react';
import { Recipe } from '@/lib/types';

interface FeaturedRecipesProps {
  recipes: Recipe[];
}

export default function FeaturedRecipes({ recipes }: FeaturedRecipesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredRecipes = [...recipes].filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.summary?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const getCategoryColor = (category?: string) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('dinner')) return 'bg-orange-600';
    if (cat.includes('breakfast')) return 'bg-amber-500';
    if (cat.includes('healthy')) return 'bg-primary';
    if (cat.includes('dessert')) return 'bg-purple-600';
    return 'bg-primary';
  };

  return (
    <section className="container mx-auto px-6 max-w-[1536px] py-6 border-t border-border">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-black text-white tracking-tighter mb-0.5 leading-none">Featured Recipes</h2>
          <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">Handpicked culinary masterpieces for you.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group/search">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-48 md:w-64 bg-white/[0.02] border border-white/10 rounded-lg pl-9 pr-4 text-[11px] font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
            />
          </div>

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-[8px] font-black text-primary hover:text-white uppercase tracking-[0.2em] group transition-colors"
          >
            {isExpanded ? 'Show less' : 'View all'}
            {isExpanded ? (
              <ChevronUp className="w-3 h-3 group-hover:-translate-y-1 transition-transform" />
            ) : (
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
            ? `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ${filteredRecipes.length > 10 ? 'max-h-[850px] overflow-y-auto pr-2 custom-scrollbar' : ''}` 
            : "flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          }
          style={isExpanded ? {} : { scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredRecipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.slug}`}
              className={`${
                isExpanded 
                  ? "w-full" 
                  : "min-w-[280px] md:min-w-[calc(20%-13px)] md:max-w-[calc(20%-13px)]"
              } snap-start group/card flex flex-col bg-card/50 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-border`}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <div className="absolute top-2.5 left-2.5 z-20">
                  <button className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-all">
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="absolute top-2.5 right-2.5 z-20">
                  <button className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-all">
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>
                <img
                  src={recipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-card:scale-105 transition-transform duration-[1.5s]"
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
          ))}

          {/* Placeholders */}
          {recipes.length < 5 && Array.from({ length: 5 - recipes.length }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className={`${
                isExpanded 
                  ? "w-full" 
                  : "min-w-[280px] md:min-w-[calc(20%-13px)]"
              } bg-card/30 rounded-xl flex flex-col border border-dashed border-border`}
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
