'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronDown } from 'lucide-react';

const data = [
  { name: 'Google Search', value: 39874, percentage: '46.5%', color: '#5850ec' },
  { name: 'Pinterest', value: 17422, percentage: '20.3%', color: '#ec4899' },
  { name: 'Direct', value: 13476, percentage: '15.7%', color: '#22d3ee' },
  { name: 'Facebook', value: 8661, percentage: '10.1%', color: '#3b82f6' },
  { name: 'YouTube', value: 3944, percentage: '4.6%', color: '#ef4444' },
  { name: 'Instagram', value: 2369, percentage: '2.8%', color: '#f59e0b' },
];

const total = data.reduce((sum, d) => sum + d.value, 0);

export const TrafficSourcesChart = ({ sources }: { sources?: { name: string; value: number; percentage: string; color: string }[] }) => {
  const chartData = sources || [];
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 h-full flex flex-col min-h-[240px]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-white">Traffic Sources</h3>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center text-slate-400 gap-1.5 border border-dashed border-white/5 rounded-xl py-8">
          <span className="text-xs font-semibold text-slate-300">No traffic sources yet</span>
          <span className="text-[10px] text-slate-500">Live referrers will appear as visitors arrive</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-white">Traffic Sources</h3>
        <button className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:border-white/20 transition-all">
          View full report
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="relative w-[180px] h-[180px] shrink-0">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
                          <p className="text-[11px] font-bold text-white">{d.name}</p>
                          <p className="text-[10px] text-slate-400">{d.value.toLocaleString()} visits</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full rounded-full border-4 border-dashed border-slate-700 animate-spin" />
          )}
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-white">{total.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 font-medium">Total</span>
          </div>
        </div>
 
        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-300 font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-white">{item.percentage}</span>
                <span className="text-[10px] text-slate-400">({item.value.toLocaleString()})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
