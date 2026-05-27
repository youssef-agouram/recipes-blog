'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

const countries = [
  { name: 'Morocco', value: 14782, percentage: '17.2%', color: '#5850ec' },
  { name: 'United States', value: 12540, percentage: '14.6%', color: '#22d3ee' },
  { name: 'France', value: 6782, percentage: '7.9%', color: '#a855f7' },
  { name: 'Algeria', value: 5432, percentage: '6.3%', color: '#10b981' },
  { name: 'Canada', value: 4321, percentage: '5.0%', color: '#f59e0b' },
];

// Simplified world map SVG path
const WorldMapSVG = () => (
  <svg viewBox="0 0 1000 500" className="w-full h-full opacity-20">
    <path
      d="M170,120 L180,100 L200,95 L215,100 L225,90 L240,95 L250,85 L270,90 L280,100 L290,95 L300,105 L310,100 L320,110 L330,105 L340,115 L335,130 L340,140 L330,150 L325,165 L315,175 L300,180 L290,185 L280,195 L265,200 L250,195 L240,200 L225,195 L215,200 L200,210 L190,205 L180,210 L170,200 L160,195 L155,180 L160,165 L155,150 L160,140 L165,130 Z
      M470,60 L490,55 L510,50 L530,55 L550,60 L570,55 L590,65 L610,60 L625,70 L630,85 L640,95 L650,105 L660,115 L665,130 L660,140 L650,150 L640,155 L625,160 L610,165 L595,170 L580,165 L565,170 L550,175 L535,170 L520,175 L510,180 L500,175 L490,165 L480,155 L475,140 L470,125 L465,110 L460,95 L465,80 Z
      M700,80 L720,75 L740,80 L760,85 L780,80 L800,90 L820,95 L830,110 L840,125 L835,140 L830,155 L820,170 L805,180 L790,185 L775,190 L760,195 L745,200 L730,195 L720,200 L710,210 L695,220 L680,225 L670,220 L660,210 L655,195 L650,180 L655,165 L660,150 L670,135 L680,120 L690,105 L695,90 Z
      M460,250 L480,245 L500,250 L520,260 L540,270 L555,280 L565,295 L560,310 L550,325 L535,335 L520,340 L505,345 L490,350 L475,355 L460,360 L445,355 L435,345 L430,330 L435,315 L440,300 L445,285 L450,270 Z
      M200,260 L220,255 L240,260 L255,270 L265,280 L270,295 L265,310 L255,320 L240,330 L225,340 L210,345 L195,340 L185,330 L180,315 L185,300 L190,285 Z
      M750,240 L770,235 L790,240 L810,250 L825,260 L835,275 L840,290 L835,305 L825,320 L810,330 L795,340 L780,345 L765,350 L750,345 L740,340 L730,330 L725,315 L720,300 L725,285 L730,270 L740,255 Z"
      fill="none"
      stroke="#5850ec"
      strokeWidth="1.5"
    />
    {/* Dot markers for top countries */}
    <circle cx="475" cy="130" r="6" fill="#5850ec" opacity="0.8">
      <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="250" cy="150" r="5" fill="#22d3ee" opacity="0.7">
      <animate attributeName="r" values="3;6;3" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="510" cy="115" r="4" fill="#a855f7" opacity="0.7">
      <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="490" cy="140" r="4" fill="#10b981" opacity="0.6">
      <animate attributeName="r" values="2;5;2" dur="2.3s" repeatCount="indefinite" />
    </circle>
    <circle cx="230" cy="140" r="4" fill="#f59e0b" opacity="0.6">
      <animate attributeName="r" values="2;5;2" dur="2.1s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const TopCountries = ({ countries: dynamicCountries }: { countries?: { name: string; value: number; percentage: string; color: string }[] }) => {
  const displayCountries = dynamicCountries && dynamicCountries.length > 0 ? dynamicCountries : countries;

  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-white">Top Countries</h3>
        <button className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:border-white/20 transition-all">
          View full report
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* World Map */}
      <div className="h-[160px] w-full mb-5">
        <WorldMapSVG />
      </div>

      {/* Country List */}
      <div className="flex-1 space-y-3">
        {displayCountries.map((country) => (
          <div key={country.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: country.color }} />
              <span className="text-xs font-medium text-slate-300">{country.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white">{country.value.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400">({country.percentage})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
