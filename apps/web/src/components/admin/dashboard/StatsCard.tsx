'use client';

import React from 'react';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend: {
    value: string;
    isUp: boolean;
  };
  period: string;
  data: { value: number }[];
  color: string;
}

export const StatsCard = ({ title, value, trend, period, data, color }: StatsCardProps) => {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-white/10 transition-all duration-300">
      <div className="relative z-10">
        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-3">{title}</p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-white mb-1">{value}</h3>
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-black ${trend.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {trend.isUp ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-slate-600 text-[10px] font-bold">{period}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Sparkline */}
      <div className="absolute inset-x-0 bottom-0 h-12 opacity-50">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${color})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
