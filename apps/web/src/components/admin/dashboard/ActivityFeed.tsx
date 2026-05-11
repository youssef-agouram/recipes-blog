'use client';

import React from 'react';
import { Plus, UserPlus, Check, MessageSquare } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'recipe_added',
    text: 'New recipe "Grilled Chicken Salad" added',
    time: '2 min ago',
    icon: Plus,
    color: 'bg-orange-500'
  },
  {
    id: 2,
    type: 'user_registered',
    text: 'New user "David Wilson" registered',
    time: '1 hour ago',
    icon: UserPlus,
    color: 'bg-purple-500'
  },
  {
    id: 3,
    type: 'recipe_published',
    text: 'Recipe "Beef Stir Fry" published',
    time: '3 hours ago',
    icon: Check,
    color: 'bg-emerald-500'
  },
  {
    id: 4,
    type: 'comment_added',
    text: 'New comment on "Lemon Garlic Shrimp"',
    time: '5 hours ago',
    icon: MessageSquare,
    color: 'bg-rose-500'
  },
];

export const ActivityFeed = () => {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Activity Overview</h3>
        <button className="text-orange-500 text-xs font-bold hover:underline">View all</button>
      </div>
      
      <div className="space-y-6 flex-1">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full ${activity.color} flex items-center justify-center flex-shrink-0`}>
              <activity.icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-300 text-xs font-medium truncate">{activity.text}</p>
            </div>
            <div className="text-slate-500 text-[10px] font-medium whitespace-nowrap">
              {activity.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
