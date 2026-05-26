'use client';

import React from 'react';
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

const seoMetrics = [
  { label: 'Total Clicks', value: '24,301', trend: '12.5%', trendUp: true, color: '#5850ec' },
  { label: 'Total Impressions', value: '512K', trend: '18.7%', trendUp: true, color: '#a855f7' },
  { label: 'Average CTR', value: '4.74%', trend: '3.8%', trendUp: true, color: '#22d3ee' },
  { label: 'Avg. Position', value: '12.6', trend: '2.1', trendUp: true, color: '#10b981' },
];

const keywords = [
  { keyword: 'chocolate cake recipe', clicks: 1482, impressions: 24301, ctr: '6.09%', position: 8.7 },
  { keyword: 'easy pasta recipes', clicks: 1128, impressions: 18732, ctr: '6.02%', position: 7.3 },
  { keyword: 'homemade pizza', clicks: 982, impressions: 15843, ctr: '6.20%', position: 9.1 },
  { keyword: 'chicken curry recipe', clicks: 872, impressions: 14231, ctr: '6.13%', position: 10.2 },
  { keyword: 'pancake recipe easy', clicks: 654, impressions: 11302, ctr: '5.78%', position: 11.5 },
];

export const SeoAnalytics = () => {
  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-white">SEO Analytics</h3>
        <button className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:border-white/20 transition-all">
          View full report
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {seoMetrics.map((metric) => (
          <div key={metric.label} className="text-center">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{metric.label}</p>
            <p className="text-lg font-black text-white">{metric.value}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              {metric.trendUp ? (
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-rose-400" />
              )}
              <span className={`text-[10px] font-bold ${metric.trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {metric.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-white/5 mb-4" />

      {/* Top Keywords Label */}
      <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-3">Top Keywords</p>

      {/* Keywords Table */}
      <div className="flex-1">
        {/* Header */}
        <div className="grid grid-cols-[1fr_60px_90px_55px_65px] gap-2 mb-2 px-1">
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Keyword</span>
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider text-right">Clicks</span>
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider text-right">Impressions</span>
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider text-right">CTR</span>
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider text-right">Position</span>
        </div>

        {/* Rows */}
        <div className="space-y-0.5">
          {keywords.map((kw) => (
            <div
              key={kw.keyword}
              className="grid grid-cols-[1fr_60px_90px_55px_65px] gap-2 items-center px-1 py-2 rounded-lg hover:bg-white/[0.03] transition-colors"
            >
              <span className="text-xs text-slate-300 font-medium truncate">{kw.keyword}</span>
              <span className="text-xs font-semibold text-white text-right">{kw.clicks.toLocaleString()}</span>
              <span className="text-xs text-slate-300 text-right">{kw.impressions.toLocaleString()}</span>
              <span className="text-xs text-slate-300 text-right">{kw.ctr}</span>
              <span className="text-xs text-slate-300 text-right">{kw.position}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
