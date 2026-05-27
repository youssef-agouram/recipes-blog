'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ChevronDown } from 'lucide-react';

const trafficData = [
  { name: 'May 14', visitors: 22100, pageViews: 28500 },
  { name: 'May 15', visitors: 18900, pageViews: 24200 },
  { name: 'May 16', visitors: 25300, pageViews: 32100 },
  { name: 'May 17', visitors: 13540, pageViews: 20300 },
  { name: 'May 18', visitors: 28700, pageViews: 35400 },
  { name: 'May 19', visitors: 35100, pageViews: 41200 },
  { name: 'May 20', visitors: 31800, pageViews: 38700 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0a0e1a] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-xs font-semibold text-slate-400 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[11px] text-slate-400">{entry.name}:</span>
            <span className="text-[11px] font-bold text-white">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const TrafficOverviewChart = ({ data }: { data?: any[] }) => {
  const chartData = data && data.length > 0 ? data : trafficData;

  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-white">Traffic Overview</h3>
        <button className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:border-white/20 transition-all">
          Last 7 days
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 rounded-full bg-[#5850ec]" />
          <span className="text-[11px] text-slate-300 font-medium">Visitors</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 rounded-full bg-[#22d3ee]" />
          <span className="text-[11px] text-slate-300 font-medium">Page Views</span>
        </div>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5850ec" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#5850ec" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPageViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="visitors"
              name="Visitors"
              stroke="#5850ec"
              strokeWidth={2.5}
              fill="url(#gradVisitors)"
              dot={false}
              activeDot={{ r: 5, stroke: '#5850ec', strokeWidth: 2, fill: '#0F172A' }}
            />
            <Area
              type="monotone"
              dataKey="pageViews"
              name="Page Views"
              stroke="#22d3ee"
              strokeWidth={2.5}
              fill="url(#gradPageViews)"
              dot={false}
              activeDot={{ r: 5, stroke: '#22d3ee', strokeWidth: 2, fill: '#0F172A' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
