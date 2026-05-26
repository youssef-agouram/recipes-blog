'use client';

import React from 'react';
import Image from 'next/image';
import { Eye, Clock, Heart, MessageCircle } from 'lucide-react';

interface TopRecipeItem {
  id: number;
  title: string;
  category: string;
  views: string;
  avgTime: string;
  favorites: string;
  comments: number;
  imageUrl?: string;
}

const mockRecipes: TopRecipeItem[] = [
  { id: 1, title: 'Classic Chocolate Cake', category: 'Desserts', views: '12,458', avgTime: '4m 32s', favorites: '1,234', comments: 86, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=80&h=80&fit=crop' },
  { id: 2, title: 'Creamy Garlic Parmesan Pasta', category: 'Dinner', views: '9,847', avgTime: '3m 21s', favorites: '987', comments: 45, imageUrl: 'https://images.unsplash.com/photo-1645112481338-3560e9bcad5a?w=80&h=80&fit=crop' },
  { id: 3, title: 'Homemade Margherita Pizza', category: 'Dinner', views: '7,654', avgTime: '3m 47s', favorites: '765', comments: 33, imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=80&h=80&fit=crop' },
  { id: 4, title: 'Easy Chicken Curry', category: 'Dinner', views: '6,421', avgTime: '4m 15s', favorites: '652', comments: 29, imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=80&h=80&fit=crop' },
  { id: 5, title: 'Fluffy Pancakes', category: 'Breakfast', views: '5,321', avgTime: '2m 34s', favorites: '543', comments: 25, imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&h=80&fit=crop' },
];

export const TopRecipesTable = () => {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-white">Top Recipes</h3>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[24px_1fr_80px_70px_80px_70px] gap-2 mb-3 px-2">
        <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">#</span>
        <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Recipe</span>
        <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider text-right">Views</span>
        <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider text-right">Avg. Time</span>
        <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider text-right">Favorites</span>
        <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider text-right">Comments</span>
      </div>

      {/* Table Body */}
      <div className="flex-1 space-y-1">
        {mockRecipes.map((recipe, index) => (
          <div
            key={recipe.id}
            className="grid grid-cols-[24px_1fr_80px_70px_80px_70px] gap-2 items-center px-2 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors group"
          >
            <span className="text-xs font-bold text-slate-600">{index + 1}</span>
            
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-800 shrink-0 relative">
                <Image 
                  src={recipe.imageUrl || ''} 
                  alt={recipe.title} 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate group-hover:text-[#5850ec] transition-colors">
                  {recipe.title}
                </p>
                <p className="text-[10px] text-slate-600">{recipe.category}</p>
              </div>
            </div>

            <span className="text-xs font-semibold text-slate-300 text-right">{recipe.views}</span>
            <span className="text-xs text-slate-500 text-right">{recipe.avgTime}</span>
            <span className="text-xs text-slate-500 text-right">{recipe.favorites}</span>
            <span className="text-xs text-slate-500 text-right">{recipe.comments}</span>
          </div>
        ))}
      </div>

      <button className="mt-4 w-full py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
        View all recipes
      </button>
    </div>
  );
};
