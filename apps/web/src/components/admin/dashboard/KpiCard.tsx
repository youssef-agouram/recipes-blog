'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  trendLabel?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export const KpiCard = ({
  label,
  value,
  trend,
  trendUp,
  trendLabel = 'from last 7 days',
  icon: Icon,
  iconColor,
  iconBg,
}: KpiCardProps) => {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300 group relative overflow-hidden">
      {/* Subtle glow on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${iconBg} blur-3xl`} style={{ opacity: 0 }} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
        
        <p className="text-slate-300 text-[11px] font-semibold uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-2xl font-black text-white mb-1.5">{value}</h3>
        
        <div className="flex items-center gap-1.5">
          <span className={`text-[11px] font-bold ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
          <span className="text-slate-400 text-[10px]">{trendLabel}</span>
        </div>
      </div>
    </div>
  );
};
