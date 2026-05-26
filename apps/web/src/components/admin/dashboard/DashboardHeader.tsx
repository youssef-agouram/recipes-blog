'use client';

import React from 'react';
import { Calendar, Download, ChevronDown } from 'lucide-react';

interface DashboardHeaderProps {
  userName?: string;
}

export const DashboardHeader = ({ userName = 'Admin' }: DashboardHeaderProps) => {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      {/* Left: Title */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-[#5850ec] to-[#a855f7]" />
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Analytics Dashboard</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Welcome back, {userName}! Here&apos;s what&apos;s happening with your website.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Date Range */}
        <button className="flex items-center gap-2 bg-[#0F172A] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-300 hover:border-white/20 transition-all">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(weekAgo)} - {formatDate(today)}</span>
        </button>

        {/* Compare */}
        <button className="flex items-center gap-2 bg-[#0F172A] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-300 hover:border-white/20 transition-all">
          <span>Compare: Previous 7 days</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Export */}
        <button className="flex items-center gap-2 bg-[#5850ec] hover:bg-[#4a43d4] rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-lg shadow-[#5850ec]/20">
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};
