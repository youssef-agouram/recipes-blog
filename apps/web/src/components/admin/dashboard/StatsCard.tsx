'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend: {
    value: string;
    isUp: boolean;
  };
  data: { value: number }[];
  color: string;
}

export const StatsCard = ({ title, value, icon: Icon, trend, data, color }: StatsCardProps) => {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div className="h-10 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={color.includes('orange') ? '#f97316' : color.includes('purple') ? '#a855f7' : color.includes('emerald') ? '#10b981' : '#f43f5e'}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-bold ${trend.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend.isUp ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-slate-500 text-xs font-medium">vs last week</span>
        </div>
      </div>
    </div>
  );
};
