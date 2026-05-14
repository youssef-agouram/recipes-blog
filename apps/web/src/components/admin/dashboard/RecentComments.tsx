'use client';

import React from 'react';
import Image from 'next/image';

const comments = [
  {
    id: 1,
    user: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    time: '2 min ago',
    text: 'This recipe is absolutely amazing! 😍',
  },
  {
    id: 2,
    user: 'Michael Brown',
    avatar: 'https://i.pravatar.cc/150?u=michael',
    time: '1 hour ago',
    text: 'Can I use chicken instead of beef?',
  },
  {
    id: 3,
    user: 'Emily Davis',
    avatar: 'https://i.pravatar.cc/150?u=emily',
    time: '3 hours ago',
    text: 'Great recipe, thank you! 👏',
  },
];

export const RecentComments = ({ comments = [] }: { comments?: any[] }) => {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Recent Comments</h3>
        <button className="text-orange-500 text-xs font-bold hover:underline">View all</button>
      </div>
      
      <div className="space-y-6 flex-1">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/10 relative">
              <Image 
                src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${comment.user?.name || 'U'}&background=random`} 
                alt={comment.user?.name || 'User'} 
                fill 
                className="object-cover" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-white text-sm font-bold">{comment.user?.name || 'Guest'}</h4>
                <span className="text-slate-500 text-[10px] font-medium">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-400 text-xs line-clamp-2">{comment.text}</p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 self-center" />
          </div>
        ))}
        {comments.length === 0 && <p className="text-slate-500 text-xs italic text-center py-10">No recent comments</p>}
      </div>
    </div>
  );
};
