'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Utensils, Coffee, Pizza, Sandwich, Cake, Leaf,
  Apple, Fish, Croissant, Carrot, Soup, CupSoda,
  Flame, Star, Heart, Clock, Tag, LayoutGrid,
  CookingPot, Salad, WheatOff, Timer
} from 'lucide-react';

interface Category {
  id: string | number;
  name: string;
  slug: string;
  icon?: string;
}

interface CategoriesSliderProps {
  categories: Category[];
}

const availableIcons: Record<string, any> = {
  Utensils, Coffee, Pizza, Sandwich, Cake, Leaf,
  Apple, Fish, Croissant, Carrot, Soup, CupSoda,
  Flame, Star, Heart, Clock, Tag, LayoutGrid,
  CookingPot, Salad, WheatOff, Timer
};

const fallbackIconMap: Record<string, any> = {
  'breakfast': Coffee,
  'lunch': Utensils,
  'dinner': CookingPot,
  'desserts': Cake,
  'vegan': Leaf,
  'gluten free': WheatOff,
  'quick & easy': Timer,
  'drinks': CupSoda,
  'salads': Salad,
  'soup': Soup,
};

function getCategoryIcon(name: string, iconName?: string) {
  const nameLower = name.toLowerCase();
  let Icon = CookingPot;
  const matchedIconKey = iconName ? Object.keys(availableIcons).find(
    key => key.toLowerCase() === iconName.toLowerCase()
  ) : null;

  if (matchedIconKey && availableIcons[matchedIconKey]) {
    Icon = availableIcons[matchedIconKey];
  } else if (fallbackIconMap[nameLower]) {
    Icon = fallbackIconMap[nameLower];
  }
  return Icon;
}

export default function CategoriesSlider({ categories }: CategoriesSliderProps) {
  const N = categories.length;
  const extendedCategories = [...categories, ...categories, ...categories];

  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // Determine initial state values safely on the client side
  const getInitialValues = () => {
    if (typeof window === 'undefined') {
      return { isMobile: true, centerOffset: 0 };
    }
    const mobile = window.innerWidth < 768;
    const cardWidth = mobile ? 95 : 120;
    const gap = 12;
    const containerWidth = mobile 
      ? window.innerWidth - 24 
      : Math.min(window.innerWidth, 1536) - 48;
    const centerOffset = (containerWidth / 2) - (cardWidth / 2);
    return { isMobile: mobile, centerOffset };
  };

  const initialValues = getInitialValues();
  const [activeIndex, setActiveIndex] = useState(N);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [centerOffset, setCenterOffset] = useState(initialValues.centerOffset);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle responsive behavior & client-side activation using window matchMedia & event listeners
  useEffect(() => {
    setIsMounted(true);
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateMode = () => {
      const mobile = mediaQuery.matches;
      setIsMobile(mobile);
      if (!mobile && containerRef.current) {
        const cardW = 120;
        const containerWidth = containerRef.current.getBoundingClientRect().width;
        setCenterOffset((containerWidth / 2) - (cardW / 2));
      }
    };

    updateMode();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateMode);
    } else {
      mediaQuery.addListener(updateMode);
    }

    const handleResize = () => {
      if (!mediaQuery.matches && containerRef.current) {
        const cardW = 120;
        const containerWidth = containerRef.current.getBoundingClientRect().width;
        setCenterOffset((containerWidth / 2) - (cardW / 2));
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateMode);
      } else {
        mediaQuery.removeListener(updateMode);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const cardWidth = isMobile ? 95 : 120;
  const gap = 12;
  const step = cardWidth + gap;

  // Reset animation flag on next render frame
  useEffect(() => {
    if (!shouldAnimate) {
      const raf = requestAnimationFrame(() => {
        setShouldAnimate(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [shouldAnimate]);

  // Auto-slide effect every 3 seconds (disabled on mobile)
  useEffect(() => {
    if (!isMounted || N <= 1 || isMobile) return;
    const interval = setInterval(() => {
      setShouldAnimate(true);
      setActiveIndex((prev) => (prev + 1) % extendedCategories.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [N, activeIndex, isMounted, isMobile]);

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 15;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    let indexChange = 0;
    if (offset < -swipeThreshold || velocity < -400) {
      indexChange = 1;
    } else if (offset > swipeThreshold || velocity > 400) {
      indexChange = -1;
    }

    setShouldAnimate(true);
    let nextIndex = activeIndex + indexChange;
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= extendedCategories.length) nextIndex = extendedCategories.length - 1;

    setActiveIndex(nextIndex);
  };

  const nextSlide = () => {
    setShouldAnimate(true);
    setActiveIndex((prev) => (prev + 1) % extendedCategories.length);
  };

  const prevSlide = () => {
    setShouldAnimate(true);
    setActiveIndex((prev) => (prev - 1 + extendedCategories.length) % extendedCategories.length);
  };

  // Warp back to middle set seamlessly after animation ends
  const handleAnimationComplete = () => {
    if (activeIndex < N) {
      setShouldAnimate(false);
      setActiveIndex(activeIndex + N);
    } else if (activeIndex >= 2 * N) {
      setShouldAnimate(false);
      setActiveIndex(activeIndex - N);
    }
  };

  const translateX = centerOffset - (activeIndex * step);

  if (!categories || N === 0) return null;

  // SSR / Hydration Fallback: Static row matching design
  if (!isMounted) {
    return (
      <div className="w-full overflow-x-auto py-1 scrollbar-hide">
        <div className="flex gap-3 px-4 justify-start md:justify-center">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.name, cat.icon);
            return (
              <div key={cat.slug} className="shrink-0 w-[95px] md:w-[120px]">
                <div className="flex flex-col items-center justify-center gap-1 rounded-2xl px-2 h-[68px] md:h-[84px] bg-[#0F172A]/40 border border-white/5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-primary/70">
                    <Icon className="w-4 h-4 stroke-[1.8px]" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.06em] text-white/80 leading-none truncate w-full px-1 text-center">
                    {cat.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="relative w-full py-1">
        {/* Left edge fade overlay */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
        
        {/* Right edge fade overlay */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="w-full overflow-x-auto py-2 scrollbar-hide scroll-smooth snap-x snap-mandatory flex gap-3 px-6">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.name, cat.icon);
            return (
              <div key={cat.slug} className="shrink-0 w-[95px] snap-center">
                <Link
                  href={`/category/${cat.slug}`}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 rounded-2xl px-2 h-[72px]",
                    "border transition-all duration-300 bg-card/40 border-white/5 hover:border-primary/20 active:scale-95 shadow-md"
                  )}
                >
                  {/* Icon Wrapper */}
                  <div className="w-8.5 h-8.5 rounded-full flex items-center justify-center bg-white/5 text-primary/80 transition-colors border border-white/5">
                    <Icon className="w-4 h-4 stroke-[1.8px]" />
                  </div>

                  {/* Name */}
                  <div className="flex flex-col items-center text-center min-w-0 w-full">
                    <span className="text-[9px] font-black uppercase tracking-[0.06em] text-white/80 leading-none truncate w-full px-1">
                      {cat.name}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden py-1 select-none touch-pan-y">
      {/* Left Navigation Arrow */}
      {N > 1 && (
        <button
          onClick={prevSlide}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full border border-white/10 bg-[#0F172A]/70 items-center justify-center text-white hover:text-primary hover:border-primary/50 hover:bg-[#0F172A] transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Slider Viewport */}
      <div className="w-full flex justify-start">
        <LazyMotion features={domAnimation}>
        <m.div
          drag="x"
          dragConstraints={{
            left: centerOffset - ((extendedCategories.length - 1) * step),
            right: centerOffset
          }}
          animate={{ x: translateX }}
          transition={
            shouldAnimate 
              ? (isMobile 
                  ? { type: 'tween', ease: 'easeOut', duration: 0.25 }
                  : { type: 'spring', stiffness: 260, damping: 26 })
              : { duration: 0 }
          }
          onDragEnd={handleDragEnd}
          onAnimationComplete={handleAnimationComplete}
          className="flex gap-3 cursor-grab active:cursor-grabbing px-0 py-1"
          style={{ width: `${extendedCategories.length * step}px` }}
        >
          {extendedCategories.map((cat, index) => {
            const Icon = getCategoryIcon(cat.name, cat.icon);
            const isActive = index === activeIndex;

            const diff = index - activeIndex;
            const absDiff = Math.abs(diff);

            // Coverflow parameters: scale down and fade side items
            const scale = isActive ? 1.1 : Math.max(0.9 - absDiff * 0.05, 0.78);
            // Disable 3D rotations on mobile for performance optimization
            const rotateY = isMobile ? 0 : (diff === 0 ? 0 : diff > 0 ? -20 : 20);
            const opacity = isActive ? 1 : Math.max(0.85 - absDiff * 0.1, 0.6);
            const zIndex = 10 - absDiff;

            return (
              <m.div
                key={`${cat.slug}-${index}`}
                animate={{
                  scale,
                  rotateY,
                  opacity,
                  zIndex,
                  y: isActive ? 0 : (isMobile ? 0 : 1)
                }}
                transition={
                  shouldAnimate 
                    ? (isMobile 
                        ? { type: 'tween', ease: 'easeOut', duration: 0.25 }
                        : { type: 'spring', stiffness: 260, damping: 26 })
                    : { duration: 0 }
                }
                style={{
                  width: `${cardWidth}px`,
                  transformStyle: isMobile ? 'flat' : 'preserve-3d',
                  perspective: isMobile ? undefined : '600px',
                  willChange: 'transform, opacity'
                }}
                className="shrink-0"
              >
                <Link
                  href={`/category/${cat.slug}`}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 h-[68px] md:h-[84px]",
                    "border transition-all duration-500",
                    isActive
                      ? "bg-gradient-to-b from-[#0F172A] to-[#1E293B] border-primary/40 shadow-lg shadow-primary/10"
                      : "bg-[#0F172A]/40 border-white/5 hover:border-white/10"
                  )}
                >
                  {/* Icon Wrapper */}
                  <div className={cn(
                    "w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-500 shrink-0",
                    isActive ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-primary/70"
                  )}>
                    <Icon className="w-4 h-4 md:w-4.5 md:h-4.5 stroke-[1.8px]" />
                  </div>

                  {/* Name */}
                  <div className="flex flex-col items-center gap-0.5 text-center min-w-0 w-full">
                    <span className={cn(
                      "text-[9px] md:text-[10px] font-black uppercase tracking-[0.06em] transition-colors leading-none truncate w-full px-1",
                      isActive ? "text-primary" : "text-white/80"
                    )}>
                      {cat.name}
                    </span>
                  </div>
                </Link>
              </m.div>
            );
          })}
        </m.div>
        </LazyMotion>
      </div>

      {/* Right Navigation Arrow */}
      {N > 1 && (
        <button
          onClick={nextSlide}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full border border-white/10 bg-[#0F172A]/70 items-center justify-center text-white hover:text-primary hover:border-primary/50 hover:bg-[#0F172A] transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
