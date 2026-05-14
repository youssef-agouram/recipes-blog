'use client';

import React from 'react';

interface GaugeChartProps {
  value: number;
  max?: number;
  label?: string;
  subLabel?: string;
  color?: string;
  size?: number;
}

export const GaugeChart = ({ 
  value, 
  max = 100, 
  label, 
  subLabel, 
  color = '#10b981', 
  size = 200 
}: GaugeChartProps) => {
  const percentage = (value / max) * 100;
  const strokeWidth = size * 0.12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-in-out' }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-black text-white">{value}</span>
        {subLabel && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{subLabel}</span>}
      </div>
    </div>
  );
};
