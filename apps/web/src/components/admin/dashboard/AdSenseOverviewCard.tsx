'use client';

import React from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { ChevronDown, TrendingUp } from 'lucide-react';

const earningsData = [
  { date: 'May 14', value: 38 },
  { date: 'May 15', value: 42 },
  { date: 'May 16', value: 35 },
  { date: 'May 17', value: 48 },
  { date: 'May 18', value: 52 },
  { date: 'May 19', value: 45 },
  { date: 'May 20', value: 58 },
];

const metrics = [
  { label: 'Estimated Earnings', value: '$318.45', trend: '20.8%', trendUp: true },
  { label: 'Page RPM', value: '$4.32', trend: '15.3%', trendUp: true },
  { label: 'CPC', value: '$0.21', trend: '8.7%', trendUp: true },
  { label: 'CTR', value: '2.31%', trend: '12.5%', trendUp: true },
];

export const AdSenseOverviewCard = () => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-white">AdSense Overview</h3>
        <button className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:border-white/20 transition-all">
          View full report
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {metrics.map((metric) => (
          <div key={metric.label} className="text-center">
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{metric.label}</p>
            <p className="text-base font-black text-white">{metric.value}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingUp className={`w-3 h-3 ${metric.trendUp ? 'text-emerald-400' : 'text-rose-400'}`} />
              <span className={`text-[10px] font-bold ${metric.trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {metric.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="flex-1 h-[100px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={earningsData}>
              <defs>
                <linearGradient id="gradEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0a0e1a] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
                        <p className="text-[11px] font-bold text-white">${payload[0].value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#gradEarnings)"
                dot={false}
                activeDot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#0F172A' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-slate-900/10 animate-pulse rounded-lg" />
        )}
      </div>
    </div>
  );
};
