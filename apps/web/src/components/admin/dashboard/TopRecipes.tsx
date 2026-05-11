'use client';

import React from 'react';
import { Star, Eye } from 'lucide-react';
import Image from 'next/image';

const topRecipes = [
  {
    id: 1,
    title: 'Creamy Garlic Parmesan Chicken Pasta',
    rating: 4.8,
    reviews: 320,
    views: '12.5K',
    image: 'https://images.unsplash.com/photo-1645112481338-3560e9bcad5a?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Classic Margherita Pizza',
    rating: 4.7,
    reviews: 250,
    views: '9.8K',
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'Chocolate Lava Cake',
    rating: 4.9,
    reviews: 180,
    views: '7.2K',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 4,
    title: 'Quinoa Avocado Salad',
    rating: 4.6,
    reviews: 120,
    views: '6.1K',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 5,
    title: 'Lemon Garlic Shrimp',
    rating: 4.8,
    reviews: 210,
    views: '5.7K',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=200&auto=format&fit=crop'
  }
];

export const TopRecipes = () => {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Top Recipes</h3>
        <button className="text-orange-500 text-xs font-bold hover:underline">View all</button>
      </div>
      
      <div className="space-y-5 flex-1">
        {topRecipes.map((recipe, index) => (
          <div key={recipe.id} className="flex items-center gap-4 group">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-white/5 relative">
                <Image 
                  src={recipe.image} 
                  alt={recipe.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-[#0F172A]
                ${index === 0 ? 'bg-orange-500' : index === 1 ? 'bg-purple-500' : index === 2 ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                {index + 1}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-white text-sm font-bold truncate group-hover:text-orange-500 transition-colors">{recipe.title}</h4>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                  <span className="text-xs font-bold text-white">{recipe.rating}</span>
                  <span className="text-[10px] text-slate-500 font-medium">({recipe.reviews})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-slate-500" />
                  <span className="text-[10px] text-slate-500 font-medium">{recipe.views}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
