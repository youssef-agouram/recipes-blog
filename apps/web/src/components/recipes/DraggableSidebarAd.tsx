'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function DraggableSidebarAd() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if mobile viewport
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Track scroll position to show strip after scrolling past header
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!mounted || !isVisible) return null;

  if (isMobile) {
    return (
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ y: -64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -64, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-50 bg-[#090d1a]/95 backdrop-blur-xl border-b border-primary/20 py-2.5 px-4 flex items-center justify-between gap-3 shadow-lg print:hidden"
          >
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <span className="shrink-0 px-1.5 py-0.5 rounded bg-primary/20 border border-primary/30 text-[7px] font-black uppercase tracking-widest text-primary leading-none">
                Ad
              </span>
              <span className="text-[10px] xs:text-xs font-bold text-white truncate">
                Premium Kitchenware: Get 30% Off Today!
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => window.open('https://kitchen-shop.example.com', '_blank')}
                className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md active:scale-95"
              >
                Shop
              </button>
              <button
                className="w-5 h-5 rounded-full bg-white/5 text-muted-foreground flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"
                onClick={() => setIsVisible(false)}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Desktop view - original draggable floating card
  return (
    <motion.div
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
      style={{
        position: 'fixed',
        top: 120,
        right: 24,
        width: 280,
        zIndex: 9999999,
      }}
      className="rounded-[24px] overflow-hidden border border-border/50 group shadow-2xl cursor-grab bg-card aspect-[4/3] print:hidden hidden md:block"
    >
      <div className="pointer-events-none w-full h-full absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80"
          fill
          sizes="280px"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
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
