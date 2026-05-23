'use client';

import { Sparkles, X } from "lucide-react";
import { useGetSiteSettingsQuery } from '@/store/api/settingsApi';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import Image from 'next/image';

export function AnnouncementBar() {
  const { data: settings } = useGetSiteSettingsQuery();
  const [isVisible, setIsVisible] = useState(true);
  const [bottomAdIndex, setBottomAdIndex] = useState(0);

  const bottomBarUrls = (() => {
    const rawVal = settings?.adSettings?.bottomBarVideoUrls || settings?.adSettings?.bottomBarVideoUrl;
    if (Array.isArray(rawVal)) {
      return rawVal
        .map((item: any) => {
          if (typeof item === 'object' && item !== null && 'url' in item) {
            return item.enabled !== false ? item.url : null;
          }
          return String(item || '');
        })
        .filter(Boolean);
    }
    if (typeof rawVal === 'string') return rawVal.split(',').map((s: string) => s.trim()).filter(Boolean);
    return [];
  })();

  const activeBottomAdUrl = bottomBarUrls[bottomAdIndex] || '';

  const getYoutubeId = (url: string) => {
    return url?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
  };

  const youtubeIds = bottomBarUrls.map(getYoutubeId).filter(Boolean);

  useEffect(() => {
    if (bottomBarUrls.length <= 1) return;
    const isImage = activeBottomAdUrl && !getYoutubeId(activeBottomAdUrl) && !activeBottomAdUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i);
    if (isImage) {
      const timer = setTimeout(() => {
        setBottomAdIndex((prev) => (prev + 1) % bottomBarUrls.length);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [activeBottomAdUrl, bottomBarUrls, bottomAdIndex]);

  if (!isVisible) return null;

  const showBottomBarAd = settings?.adSettings?.showBottomBarAd;

  if (!showBottomBarAd || !activeBottomAdUrl) {
    return null;
  }

  const isYouTube = getYoutubeId(activeBottomAdUrl);
  const isVideo = activeBottomAdUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i);

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] bg-black border-t border-white/10 shadow-[0_-10px_50px_rgba(0,0,0,0.5)] print:hidden h-[60px] md:h-[80px]">
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="absolute top-2 left-4 z-10">
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/70 bg-black/60 px-2 py-1 rounded backdrop-blur-md border border-white/10">Sponsored</span>
      </div>
      <Link 
        href={activeBottomAdUrl || '#'} 
        target="_blank" 
        className="block w-full h-full relative overflow-hidden pointer-events-auto hover:opacity-95 transition-all duration-300"
      >
        {isYouTube ? (
          <iframe
            src={`https://www.youtube.com/embed/${isYouTube}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeIds.join(',')}&showinfo=0&modestbranding=1`}
            className="absolute inset-0 w-full h-[300%] -top-[100%] object-cover scale-100 pointer-events-none"
            allow="autoplay; encrypted-media"
          />
        ) : isVideo ? (
          <video 
            src={activeBottomAdUrl} 
            autoPlay 
            muted 
            playsInline 
            onEnded={() => setBottomAdIndex((prev) => (prev + 1) % bottomBarUrls.length)}
            className="absolute inset-0 w-full h-full object-cover" 
          />
        ) : (
          <Image src={activeBottomAdUrl} alt="Ad" fill sizes="100vw" className="object-cover" unoptimized />
        )}
      </Link>
    </div>
  );
}
