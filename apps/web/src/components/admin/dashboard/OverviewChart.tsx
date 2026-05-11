'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const data = [
  { name: 'May 15', recipes: 600, users: 400, comments: 150 },
  { name: 'May 16', recipes: 850, users: 550, comments: 250 },
  { name: 'May 17', recipes: 750, users: 450, comments: 200 },
  { name: 'May 18', recipes: 900, users: 650, comments: 300 },
  { name: 'May 19', recipes: 800, users: 500, comments: 220 },
  { name: 'May 20', recipes: 1000, users: 700, comments: 350 },
  { name: 'May 21', recipes: 950, users: 600, comments: 280 },
];

export const OverviewChart = () => {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold text-white">Overview</h3>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-[#1E293B] text-slate-300 text-xs font-medium px-3 py-1.5 rounded-lg border border-white/5 outline-none">
            <option>This Week</option>
            <option>Last Week</option>
          </select>
        </div>
      </div>
      
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ fontSize: '12px' }}
            />
            <Legend 
              verticalAlign="top" 
              align="left" 
              iconType="circle"
              wrapperStyle={{ paddingTop: '0px', paddingBottom: '30px' }}
            />
            <Line 
              type="monotone" 
              dataKey="recipes" 
              stroke="#f97316" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#0f172a' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="#0ea5e9" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#0f172a' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line 
              type="monotone" 
              dataKey="comments" 
              stroke="#a855f7" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#a855f7', strokeWidth: 2, stroke: '#0f172a' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
