'use client';

import React from 'react';
import {
  LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const dummyData = [
  { name: 'May 19', clicks: 400, impressions: 2400 },
  { name: 'May 26', clicks: 600, impressions: 3500 },
  { name: 'Jun 2', clicks: 500, impressions: 3000 },
  { name: 'Jun 9', clicks: 800, impressions: 4500 },
  { name: 'Jun 16', clicks: 700, impressions: 4000 },
];

export const SearchConsoleChart = () => {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-[32px] p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Google Search Console</h3>
        <select className="bg-white/5 text-[10px] font-bold text-slate-400 px-2 py-1 rounded-lg border border-white/5 outline-none">
          <option>Last 28 days</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: 'Total Clicks', val: '15.6K', trend: '+21.3%', up: true },
          { label: 'Total Impressions', val: '1.24M', trend: '+17.6%', up: true },
          { label: 'Average CTR', val: '1.25%', trend: '+3.5%', up: true },
          { label: 'Average Position', val: '12.4', trend: '+2.1', up: true },
        ].map(item => (
          <div key={item.label} className="bg-white/[0.02] border border-white/5 rounded-2xl p-3">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight mb-1">{item.label}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-white">{item.val}</span>
              <span className={`text-[9px] font-bold ${item.up ? 'text-emerald-500' : 'text-rose-500'}`}>{item.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dummyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" hide />
            <Tooltip 
               contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
            />
            <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="impressions" stroke="#a855f7" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-[9px] font-bold text-slate-500 uppercase">Clicks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          <span className="text-[9px] font-bold text-slate-500 uppercase">Impressions</span>
        </div>
      </div>
    </div>
  );
};
