'use client';

import { useGetFeaturedRecipesQuery } from '@/store/api/recipeApi';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock, Users, Star } from 'lucide-react';
import { useState } from 'react';

export function FeaturedRecipesSlider() {
  const { data, isLoading } = useGetFeaturedRecipesQuery();
  const [currentIndex, setCurrentIndex] = useState(0);

  const featured = data?.data ?? [];
  const VISIBLE = 2; // cards shown at once

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(featured.length - VISIBLE, i + 1));

  const canPrev = currentIndex > 0;
  const canNext = currentIndex < featured.length - VISIBLE;

  if (isLoading) {
    return (
      <section className="container mx-auto px-6 max-w-7xl pb-16">
        <div className="flex items-end justify-between mb-8 border-b border-gray-300 pb-4">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-brand-dark">Featured Recipes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 h-96 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (featured.length === 0) {
    return null; // hide section when no featured recipes
  }

  const visibleRecipes = featured.slice(currentIndex, currentIndex + VISIBLE);

  return (
    <section className="container mx-auto px-6 max-w-7xl pb-16">
      <div className="flex items-end justify-between mb-8 border-b border-gray-300 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-brand-dark">Featured Recipes</h2>
          <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={prev}
            disabled={!canPrev}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            disabled={!canNext}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {visibleRecipes.map((recipe, i) => (
          <Link
            href={`/recipes/${recipe.slug}`}
            key={recipe.id}
            className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col group cursor-pointer hover:shadow-md transition-shadow relative"
          >
            {/* Featured star badge */}
            <div className="absolute top-4 left-4 z-10 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <Star className="w-5 h-5 fill-white text-white" />
            </div>

            {i === 1 && featured.length > 1 && (
              <div className="absolute top-4 right-4 z-10 w-12 h-12 bg-brand-green rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg transform rotate-12">
                NEW
              </div>
            )}
            <div className="relative h-64 overflow-hidden">
              <img
                src={
                  recipe.imageUrl
                    ? recipe.imageUrl.startsWith('/')
                      ? `http://localhost:3000${recipe.imageUrl}`
                      : recipe.imageUrl
                    : 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                }
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-3 tracking-tight line-clamp-1">{recipe.title}</h3>
              <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">
                {recipe.summary || 'No description available.'}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 40 Min</span>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> 4 Servings</span>
                </div>
                <button className="border border-brand-dark text-brand-dark px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-brand-dark hover:text-white transition-colors">
                  View Recipe
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Dot indicators */}
      {featured.length > VISIBLE && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: featured.length - VISIBLE + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-brand-dark' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
