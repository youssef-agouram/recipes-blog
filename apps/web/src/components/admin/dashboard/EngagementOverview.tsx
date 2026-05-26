'use client';

import React from 'react';
import { Heart, Star, Share2, MessageCircle, Bookmark } from 'lucide-react';

const engagementData = [
  { label: 'Total Likes', value: '15,432', trend: '13.4%', trendUp: true, icon: Heart, color: '#ef4444', bg: 'bg-red-500/10' },
  { label: 'Total Favorites', value: '25,687', trend: '18.8%', trendUp: true, icon: Star, color: '#f59e0b', bg: 'bg-amber-500/10' },
  { label: 'Total Shares', value: '8,643', trend: '11.2%', trendUp: true, icon: Share2, color: '#3b82f6', bg: 'bg-blue-500/10' },
  { label: 'Total Comments', value: '1,268', trend: '11.2%', trendUp: false, icon: MessageCircle, color: '#10b981', bg: 'bg-emerald-500/10' },
  { label: 'Saved Recipes', value: '4,321', trend: '9.5%', trendUp: true, icon: Bookmark, color: '#a855f7', bg: 'bg-purple-500/10' },
];

export const EngagementOverview = () => {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 h-full">
      <h3 className="text-sm font-bold text-white mb-5">Engagement Overview</h3>

      <div className="flex items-center justify-around">
        {engagementData.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}>
                <Icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <p className="text-[9px] font-semibold text-slate-600 uppercase tracking-wider text-center leading-tight">
                {item.label}
              </p>
              <p className="text-lg font-black text-white">{item.value}</p>
              <span className={`text-[10px] font-bold ${item.trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {item.trendUp ? '↑' : '↓'} {item.trend}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
