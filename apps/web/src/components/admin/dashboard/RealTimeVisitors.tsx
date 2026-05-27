'use client';

import React from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';

const topPages = [
  { path: '/', users: 42 },
  { path: '/recipes/chocolate-cake', users: 28 },
  { path: '/recipes/pasta', users: 18 },
  { path: '/about-us', users: 12 },
  { path: '/contact', users: 8 },
];

const liveData = [
  { time: '14:00', users: 85 },
  { time: '14:05', users: 102 },
  { time: '14:10', users: 98 },
  { time: '14:15', users: 115 },
  { time: '14:20', users: 108 },
  { time: '14:25', users: 126 },
  { time: '14:30', users: 120 },
  { time: '14:35', users: 132 },
  { time: '14:40', users: 118 },
  { time: '14:45', users: 126 },
];

export const RealTimeVisitors = ({ activeUsers }: { activeUsers?: { total: number; pages: { path: string; users: number }[] } }) => {
  const displayTotal = activeUsers?.total ?? 126;
  const displayPages = activeUsers?.pages ?? topPages;

  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 h-full flex flex-col">
      <h3 className="text-sm font-bold text-white mb-4">Real-Time Visitors</h3>

      <div className="flex items-start gap-6 mb-4">
        {/* Active Users Count */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-3xl font-black text-white">{displayTotal}</span>
          </div>
          <p className="text-xs text-slate-400">Active Users</p>
        </div>

        {/* Top Active Pages */}
        <div className="flex-1">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Top Active Pages</p>
          <div className="space-y-1.5">
            {displayPages.map((page) => (
              <div key={page.path} className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300 font-medium truncate max-w-[160px]">{page.path}</span>
                <span className="text-[11px] font-bold text-white">{page.users}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mini Bar Chart */}
      <div className="flex-1 h-[80px] mt-auto">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={liveData}>
            <XAxis dataKey="time" hide />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
                      <p className="text-[11px] font-bold text-white">{payload[0].value} users</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="users"
              fill="#5850ec"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <button className="mt-3 w-full py-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
        View live
      </button>
    </div>
  );
};
