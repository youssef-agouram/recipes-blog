'use client';

import React from 'react';
import { Star, Clock, MoreVertical } from 'lucide-react';
import Image from 'next/image';

const recipes = [
  {
    id: 1,
    title: 'Honey Glazed Salmon',
    status: 'Published',
    rating: 4.8,
    reviews: 320,
    time: '25 min',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Spaghetti Carbonara',
    status: 'Published',
    rating: 4.7,
    reviews: 280,
    time: '30 min',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'Stuffed Bell Peppers',
    status: 'Draft',
    rating: 4.6,
    reviews: 190,
    time: '45 min',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 4,
    title: 'Blueberry Pancakes',
    status: 'Published',
    rating: 4.9,
    reviews: 150,
    time: '20 min',
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=300&auto=format&fit=crop'
  }
];

export const RecentRecipesGrid = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Recent Recipes</h3>
        <button className="text-orange-500 text-xs font-bold hover:underline">View all</button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-[#0F172A] border border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-all duration-300">
            <div className="relative h-40">
              <Image src={recipe.image} alt={recipe.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute top-3 left-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                  recipe.status === 'Published' ? 'bg-emerald-500 text-white' : 'bg-purple-500 text-white'
                }`}>
                  {recipe.status}
                </span>
              </div>
              <button className="absolute top-3 right-3 p-1.5 bg-black/20 backdrop-blur-md rounded-lg text-white hover:bg-black/40 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4">
              <h4 className="text-white text-sm font-bold mb-2 truncate">{recipe.title}</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                  <span className="text-xs font-bold text-white">{recipe.rating}</span>
                  <span className="text-[10px] text-slate-500 font-medium">({recipe.reviews})</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-medium">{recipe.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
