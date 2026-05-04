'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DraggableSidebarAd() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isVisible) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
      style={{
        position: 'fixed',
        top: 80,
        right: 24,
        width: 280,
        zIndex: 9999,
      }}
      className="rounded-[24px] overflow-hidden border border-border/50 group shadow-2xl cursor-grab bg-card aspect-[4/3]"
    >
      <div className="pointer-events-none w-full h-full absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          alt="Premium Cookware"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="px-2.5 py-1 rounded bg-black/40 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-white/80 border border-white/10 flex items-center gap-1.5">
              <div className="w-1 h-1 bg-primary rounded-full"></div> Sponsored
            </span>
            <button
              className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-primary transition-colors pointer-events-auto cursor-pointer"
              onClick={() => setIsVisible(false)}
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div>
            <h4 className="font-black text-lg text-white tracking-tight mb-1">Premium Cookware</h4>
            <p className="text-[10px] text-white/70 font-medium mb-3">Built for passion. Designed to last.</p>
            <button className="bg-white text-background px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors pointer-events-auto cursor-pointer">
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
