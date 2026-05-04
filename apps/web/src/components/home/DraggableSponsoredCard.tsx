'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function DraggableSponsoredCard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
      className="w-full max-w-[280px] bg-card/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-grab relative z-50"
    >
      <div className="flex items-center justify-between mb-3 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
          <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/70">Sponsored</span>
        </div>
        <div className="flex gap-1">
          <span className="w-1 h-1 rounded-full bg-white/20"></span>
          <span className="w-1 h-1 rounded-full bg-white/20"></span>
          <span className="w-1 h-1 rounded-full bg-white/20"></span>
        </div>
      </div>
      <div className="relative rounded-xl overflow-hidden mb-3 group aspect-video shadow-lg pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=400&q=80" 
          alt="Product" 
          className="w-full h-full object-cover" 
        />
      </div>
      <h4 className="font-black text-[12px] text-white mb-2 tracking-tight pointer-events-none">Cookware Pro Essentials</h4>
      <button className="w-full bg-white text-background py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all">
        Shop Collection
      </button>
    </motion.div>
  );
}
