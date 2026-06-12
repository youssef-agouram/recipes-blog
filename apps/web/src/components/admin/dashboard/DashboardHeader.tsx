'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Download, ChevronDown } from 'lucide-react';

interface DashboardHeaderProps {
  userName?: string;
  activeUsers?: number;
  filter: '24h' | '7d' | '30d';
  onFilterChange: (filter: '24h' | '7d' | '30d') => void;
}

export const DashboardHeader = ({ 
  userName = 'Admin', 
  activeUsers = 126,
  filter,
  onFilterChange
}: DashboardHeaderProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const today = new Date();
  const getStartDate = () => {
    const start = new Date(today);
    if (filter === '24h') {
      start.setDate(today.getDate() - 1);
    } else if (filter === '30d') {
      start.setDate(today.getDate() - 29);
    } else {
      start.setDate(today.getDate() - 6);
    }
    return start;
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const filterLabels = {
    '24h': 'Last 24 hours',
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      {/* Left: Title */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-[#5850ec] to-[#a855f7]" />
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-black text-white tracking-tight">Analytics Dashboard</h1>
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{activeUsers} online</span>
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Welcome back, {userName}! Here&apos;s what&apos;s happening with your website.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Date Range */}
        <div className="flex items-center gap-2 bg-[#0F172A] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(getStartDate())} - {formatDate(today)}</span>
        </div>

        {/* Compare / Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-[#0F172A] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-300 hover:border-white/20 transition-all cursor-pointer select-none"
          >
            <span>Compare: {filterLabels[filter]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0F172A] border border-white/10 shadow-2xl z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
              {(['24h', '7d', '30d'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onFilterChange(opt);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-white/5 transition-colors cursor-pointer ${
                    filter === opt ? 'text-[#5850ec]' : 'text-slate-300'
                  }`}
                >
                  {filterLabels[opt]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export */}
        <button className="flex items-center gap-2 bg-[#5850ec] hover:bg-[#4a43d4] rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-lg shadow-[#5850ec]/20 cursor-pointer">
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};
