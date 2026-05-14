'use client';

import React from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { ExternalLink } from 'lucide-react';

const dummyData = [
  { value: 100 }, { value: 150 }, { value: 120 }, { value: 200 }, 
  { value: 180 }, { value: 250 }, { value: 220 }, { value: 300 }
];

export const AdSenseChart = () => {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-[32px] p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 bg-orange-500 rounded-sm rotate-45" />
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">AdSense Overview</h3>
        </div>
        <select className="bg-white/5 text-[10px] font-bold text-slate-400 px-2 py-1 rounded-lg border border-white/5 outline-none">
          <option>Last 30 days</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-4">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Estimated Earnings</p>
          <h4 className="text-xl font-black text-white">$1,248.75</h4>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Page RPM</p>
          <div className="flex items-center gap-2">
            <h4 className="text-xl font-black text-white">$8.65</h4>
            <span className="text-[10px] font-bold text-emerald-500">↑ 15.7%</span>
          </div>
        </div>
      </div>

      <div className="h-20 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dummyData}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto">
        <div className="bg-white/[0.02] rounded-2xl p-3">
          <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Impressions</p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white">144.2K</span>
            <span className="text-[9px] font-bold text-emerald-500">↑ 20.1%</span>
          </div>
        </div>
        <div className="bg-white/[0.02] rounded-2xl p-3">
          <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Clicks</p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white">12.3K</span>
            <span className="text-[9px] font-bold text-emerald-500">↑ 22.7%</span>
          </div>
        </div>
      </div>

      <button className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase hover:underline mt-6">
        View full AdSense report <ExternalLink className="w-3 h-3" />
      </button>
    </div>
  );
};
