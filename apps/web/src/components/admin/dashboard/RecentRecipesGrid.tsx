'use client';

import React from 'react';
import { Star, Clock, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import { Recipe } from '@/lib/types';
import Link from 'next/link';

interface RecentRecipesGridProps {
  recipes?: Recipe[];
  isLoading?: boolean;
}

export const RecentRecipesGrid = ({ recipes, isLoading }: RecentRecipesGridProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-7 w-32 bg-white/5 animate-pulse rounded-lg"></div>
          <div className="h-4 w-16 bg-white/5 animate-pulse rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#0F172A] border border-white/5 rounded-2xl overflow-hidden h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Recent Recipes</h3>
        </div>
        <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-10 text-center">
          <p className="text-slate-400">No recipes found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Recent Recipes</h3>
        <Link href="/admin/recipes" className="text-orange-500 text-xs font-bold hover:underline">View all</Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-[#0F172A] border border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-all duration-300">
            <div className="relative h-40">
              <Image 
                src={recipe.imageUrl || '/placeholder-recipe.jpg'} 
                alt={recipe.title} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              <div className="absolute top-3 left-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                  recipe.status === 'PUBLISHED' ? 'bg-emerald-500 text-white' : 'bg-purple-500 text-white'
                }`}>
                  {recipe.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                </span>
              </div>
              <button className="absolute top-3 right-3 p-1.5 bg-black/20 backdrop-blur-md rounded-lg text-white hover:bg-black/40 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4">
              <h4 className="text-white text-sm font-bold mb-2 truncate" title={recipe.title}>{recipe.title}</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                  <span className="text-xs font-bold text-white">4.8</span>
                  <span className="text-[10px] text-slate-500 font-medium">(120)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-medium">{recipe.prepTime || '20 min'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

