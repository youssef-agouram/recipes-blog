'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface VitalMetric {
  label: string;
  value: string;
  unit: string;
  status: 'Good' | 'Needs Improvement' | 'Poor';
}

const vitals: VitalMetric[] = [
  { label: 'LCP', value: '1.2', unit: 's', status: 'Good' },
  { label: 'CLS', value: '0.05', unit: '', status: 'Good' },
  { label: 'TTFB', value: '0.4', unit: 's', status: 'Good' },
];

const statusColor = (s: string) => {
  if (s === 'Good') return 'text-emerald-400';
  if (s === 'Needs Improvement') return 'text-amber-400';
  return 'text-rose-400';
};

const statusBg = (s: string) => {
  if (s === 'Good') return 'bg-emerald-500/10 border-emerald-500/20';
  if (s === 'Needs Improvement') return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-rose-500/10 border-rose-500/20';
};

export const CoreWebVitals = () => {
  const score = 92;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-white">Performance (Core Web Vitals)</h3>
        <button className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:border-white/20 transition-all">
          View full report
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-6">
        {/* Page Speed Gauge */}
        <div className="relative shrink-0">
          <svg width="130" height="130" className="transform -rotate-90">
            <circle
              cx="65"
              cy="65"
              r="54"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="65"
              cy="65"
              r="54"
              stroke="#10b981"
              strokeWidth="10"
              strokeDasharray={circumference}
              style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-in-out' }}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Page Speed</span>
            <span className="text-3xl font-black text-white leading-none mt-1">{score}</span>
          </div>
        </div>

        {/* Vitals List */}
        <div className="flex-1 grid grid-cols-3 gap-3">
          {vitals.map((vital) => (
            <div key={vital.label} className={`rounded-xl border p-3 text-center ${statusBg(vital.status)}`}>
              <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">{vital.label}</p>
              <p className="text-xl font-black text-white">
                {vital.value}<span className="text-xs text-slate-500 font-medium">{vital.unit}</span>
              </p>
              <p className={`text-[10px] font-bold mt-1 ${statusColor(vital.status)}`}>{vital.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
