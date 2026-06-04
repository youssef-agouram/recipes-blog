'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChefHat } from 'lucide-react';
import { useGetSiteSettingsQuery } from '@/store/api/settingsApi';
import { useState, useEffect } from 'react';

export function Logo() {
  const { data: settings } = useGetSiteSettingsQuery();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoUrl = settings?.logoUrl;
  const brandName = settings?.brandName || 'Tasteful';
  const tagline = settings?.tagline || 'Delicious Recipes';

  const brandPart1 = settings?.brandPart1 || brandName.substring(0, Math.max(0, brandName.length - 3));
  const brandPart2 = settings?.brandPart2 || brandName.substring(Math.max(0, brandName.length - 3));
  const brandColor1 = settings?.brandColor1 || '#ffffff';
  const brandColor2 = settings?.brandColor2 || '#f29e1f';

  return (
    <Link href="/" className="flex items-center gap-2.5 group shrink-0">
      <div className="relative w-9.5 h-9.5 rounded-xl overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 flex items-center justify-center bg-card shadow-lg transition-all duration-300 group-hover:scale-105">
        {mounted && logoUrl ? (
          <Image
            src={logoUrl}
            alt={`${brandName} Logo`}
            width={38}
            height={38}
            className="w-full h-full object-cover"
            priority
          />
        ) : (
          <ChefHat className="w-5.5 h-5.5 text-primary" style={{ color: brandColor2 }} />
        )}
      </div>
      <div className="flex flex-col leading-[1.1]">
        <span className="font-black text-[15px] sm:text-base tracking-tighter font-heading">
          <span style={{ color: brandColor1 }}>{brandPart1}</span>
          <span style={{ color: brandColor2 }}>{brandPart2}</span>
        </span>
        {tagline && (
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.25em] ml-0.5 group-hover:text-white/60 transition-colors">
            {tagline}
          </span>
        )}
      </div>
    </Link>
  );
}
