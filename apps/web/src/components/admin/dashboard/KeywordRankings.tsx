'use client';

import React from 'react';

const rankings = [
  { keyword: 'easy cookie recipe', pos: 1, change: 0 },
  { keyword: 'homemade pizza', pos: 2, change: 1 },
  { keyword: 'pancake recipe', pos: 3, change: 2 },
  { keyword: 'chicken curry recipe', pos: 4, change: -1 },
  { keyword: 'best pasta recipe', pos: 5, change: 0 },
];

export const KeywordRankings = () => {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-3xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black text-white uppercase tracking-tight">Keyword Rankings</h3>
        <button className="text-orange-500 text-[10px] font-black uppercase hover:underline">View all</button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <th className="pb-3 font-bold">Keyword</th>
              <th className="pb-3 text-right font-bold">Pos</th>
              <th className="pb-3 text-right font-bold">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rankings.map((rank) => (
              <tr key={rank.keyword} className="group">
                <td className="py-4 text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{rank.keyword}</td>
                <td className="py-4 text-xs font-black text-white text-right">{rank.pos}</td>
                <td className={`py-4 text-[10px] font-black text-right ${rank.change > 0 ? 'text-emerald-500' : rank.change < 0 ? 'text-rose-500' : 'text-slate-600'}`}>
                  {rank.change > 0 ? `+${rank.change}` : rank.change === 0 ? '—' : rank.change}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
