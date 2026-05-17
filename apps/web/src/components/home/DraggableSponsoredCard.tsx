'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useGetSiteSettingsQuery } from '@/store/api/settingsApi';
import Link from 'next/link';

export default function DraggableSponsoredCard() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { data: settings } = useGetSiteSettingsQuery();
  const [popupAdIndex, setPopupAdIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ads = settings?.adSettings;

  const popupUrls = (() => {
    const rawVal = ads?.popupAdImageUrls || ads?.popupAdImageUrl;
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

  const activePopupUrl = popupUrls[popupAdIndex] || '';

  const getYoutubeId = (url: string) => {
    return url?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
  };

  const youtubeIds = popupUrls.map(getYoutubeId).filter(Boolean);

  useEffect(() => {
    if (popupUrls.length <= 1) return;
    const isImage = activePopupUrl && !getYoutubeId(activePopupUrl) && !activePopupUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i);
    if (isImage) {
      const timer = setTimeout(() => {
        setPopupAdIndex((prev) => (prev + 1) % popupUrls.length);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [activePopupUrl, popupUrls, popupAdIndex]);

  if (!mounted || !isVisible) return null;
  if (!ads || ads.showPopupAd === false || !activePopupUrl) return null;

  const targetLink = ads?.popupAdLink || '#';
  const isYouTube = getYoutubeId(activePopupUrl);
  const isVideo = activePopupUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i);

  return (
    <motion.div
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
      style={{
        position: 'fixed',
        top: '180px',
        right: '48px',
        zIndex: 9999999,
      }}
      className="w-full max-w-[280px] bg-card/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-grab print:hidden"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 pointer-events-none">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
          <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/70">Sponsored</span>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <Link 
        href={activePopupUrl || '#'} 
        target="_blank" 
        className="block relative rounded-xl overflow-hidden mb-3 group aspect-video shadow-lg pointer-events-auto hover:scale-[1.02] transition-transform duration-300"
      >
        {isYouTube ? (
          <iframe
            src={`https://www.youtube.com/embed/${isYouTube}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeIds.join(',')}&showinfo=0&modestbranding=1`}
            className="w-full h-full object-cover scale-150 pointer-events-none"
            allow="autoplay; encrypted-media"
          />
        ) : isVideo ? (
          <video 
            src={activePopupUrl} 
            autoPlay 
            muted 
            playsInline 
            onEnded={() => setPopupAdIndex((prev) => (prev + 1) % popupUrls.length)}
            className="w-full h-full object-cover" 
          />
        ) : (
          <img src={activePopupUrl} alt="Ad" className="w-full h-full object-cover" />
        )}
      </Link>
      <Link href={targetLink} target="_blank" className="block w-full">
        <button className="w-full bg-white text-background py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-lg hover:-translate-y-0.5">
          Visit Link
        </button>
      </Link>
    </motion.div>
  );
}
