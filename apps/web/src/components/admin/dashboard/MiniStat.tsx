'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MiniStatProps {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: LucideIcon;
  color: string;
}

export const MiniStat = ({ label, value, trend, trendUp, icon: Icon, color }: MiniStatProps) => {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-xl p-3 flex items-center justify-between group hover:border-white/10 transition-all">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{label}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white">{value}</span>
            {trend && (
              <span className={`text-[10px] font-bold ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {trendUp ? '↑' : '↓'} {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
