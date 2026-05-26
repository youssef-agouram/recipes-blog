'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Monitor, Smartphone, Tablet, ChevronDown } from 'lucide-react';

const data = [
  { name: 'Mobile', value: 62307, percentage: '72.6%', color: '#5850ec', icon: Smartphone },
  { name: 'Desktop', value: 19806, percentage: '23.1%', color: '#22d3ee', icon: Monitor },
  { name: 'Tablet', value: 3633, percentage: '4.3%', color: '#f59e0b', icon: Tablet },
];

export const DeviceAnalyticsChart = () => {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-white">Device Analytics</h3>
        <button className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:border-white/20 transition-all">
          View full report
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="relative w-[160px] h-[160px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
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
                        <p className="text-[10px] text-slate-400">{d.percentage}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
              <Monitor className="w-6 h-6 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-4">
          {data.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-400 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white">{item.percentage}</span>
                  <span className="text-[10px] text-slate-600">{item.value.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
