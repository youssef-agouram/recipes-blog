'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Published', value: 820, color: '#f97316' },
  { name: 'Draft', value: 280, color: '#a855f7' },
  { name: 'Pending Review', value: 148, color: '#0ea5e9' },
];

export const StatusChart = () => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 h-[400px] flex flex-col">
      <h3 className="text-xl font-bold text-white mb-6">Recipe Status</h3>
      
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="w-full h-full max-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-6">
          <span className="text-2xl font-bold text-white">{total.toLocaleString()}</span>
          <span className="text-slate-500 text-xs font-medium">Recipes</span>
        </div>

        <div className="w-full mt-8 space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 text-sm font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-bold">{item.value}</span>
                <span className="text-slate-500 text-xs">({((item.value / total) * 100).toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
