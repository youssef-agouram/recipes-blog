'use client';

import { Sparkles } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] bg-white/10 backdrop-blur-2xl border-t border-border py-8 overflow-hidden shadow-[0_-10px_50px_rgba(0,0,0,0.5)] print:hidden">
      <div className="flex whitespace-nowrap animate-marquee items-center gap-20">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="flex items-center gap-6">
            <span className="text-[14px] font-black text-white uppercase tracking-[0.4em]">
              NEW HEALTHY RECIPES EVERY WEEK • JOIN 10,000+ FOOD LOVERS • GET 20% OFF PREMIUM COOKWARE • PREMIUM CULINARY GUIDES NOW AVAILABLE •
            </span>
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
