'use client';

import { useState, useEffect, useRef } from 'react';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface HeroSliderProps {
  images: string[];
  fallbackImage?: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function YouTubePlayer({ videoId, onEnded }: { videoId: string, onEnded: () => void }) {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (playerRef.current) return;
      playerRef.current = new window.YT.Player(`yt-${videoId}`, {
        events: {
          'onStateChange': (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              onEnded();
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        initPlayer();
      };
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, onEnded]);

  return (
    <iframe
      id={`yt-${videoId}`}
      src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&mute=1&controls=0&loop=0&showinfo=0&modestbranding=1`}
      className="w-full h-full object-cover pointer-events-none scale-150"
      allow="autoplay; encrypted-media"
      allowFullScreen
    />
  );
}

export function HeroSlider({ images, fallbackImage }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const displayImages = images.length > 0 
    ? images 
    : [fallbackImage || "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1920&q=80"];

  useEffect(() => {
    if (displayImages.length <= 1) return;

    const currentUrl = displayImages[currentIndex];
    const isRawVideo = currentUrl?.match(/\.(mp4|webm|ogg)(\?.*)?$/i);
    const isYouTube = currentUrl?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);

    let timeoutId: NodeJS.Timeout;

    if (!isRawVideo && !isYouTube) {
      timeoutId = setTimeout(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % displayImages.length);
      }, 5000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [displayImages, currentIndex]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = displayImages.length - 1;
      if (next >= displayImages.length) next = 0;
      return next;
    });
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 1.05,
      filter: "blur(10px)"
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.8 },
        scale: { duration: 0.8, ease: "easeOut" as const },
        filter: { duration: 0.8 }
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
      filter: "blur(10px)",
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.8 },
        scale: { duration: 0.8, ease: "easeIn" as const },
        filter: { duration: 0.8 }
      }
    })
  };

  return (
    <div className="relative w-full h-full group overflow-hidden">
      {/* Static Background Layer for LCP Optimization */}
      {displayImages[0] && !displayImages[0].match(/\.(mp4|webm|ogg)(\?.*)?$/i) && !displayImages[0].match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i) && (
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src={displayImages[0]}
            alt="Hero Banner LCP Placeholder"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        </div>
      )}

      <LazyMotion features={domAnimation}>
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <m.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full z-10"
        >
          {(() => {
            const url = displayImages[currentIndex];
            const ytMatch = url?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
            
            if (ytMatch) {
              return <YouTubePlayer videoId={ytMatch[1]} onEnded={() => paginate(1)} />;
            }
            if (url?.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
              return (
                <video
                  src={url}
                  autoPlay
                  muted
                  playsInline
                  onEnded={() => paginate(1)}
                  onError={() => paginate(1)}
                  className="w-full h-full object-cover"
                />
              );
            }
            return (
              <Image
                src={url}
                alt={`Hero Banner ${currentIndex + 1}`}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            );
          })()}
          {/* Elegant Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        </m.div>
      </AnimatePresence>
      </LazyMotion>

      {/* Navigation Controls */}
      {displayImages.length > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            className="absolute left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:border-primary hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:border-primary hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {displayImages.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > currentIndex ? 1 : -1);
                  setCurrentIndex(i);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  currentIndex === i 
                    ? 'w-8 bg-primary shadow-lg shadow-primary/40' 
                    : 'bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Progress Bar for Auto-play */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-0 left-0 h-1 bg-primary/30 z-20 w-full">
          <LazyMotion features={domAnimation}><m.div
            key={currentIndex}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 5, ease: "linear" }}
            className="h-full bg-primary"
          /></LazyMotion>
        </div>
      )}
    </div>
  );
}
