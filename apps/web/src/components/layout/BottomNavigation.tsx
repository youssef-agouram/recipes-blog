'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Home, Heart, Bookmark, User, Search, Plus, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNavigation() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  // Read saved recipes from Redux to show red badge
  const { data: savedRecipes } = useSelector((state: any) => state.api?.queries?.['getSavedRecipes(undefined)'] || {});
  const { data: savedArticles } = useSelector((state: any) => state.api?.queries?.['getSavedArticles(undefined)'] || {});
  const totalSaved = (savedRecipes?.length || 0) + (savedArticles?.length || 0);

  // Tabs configured to match the user's reference image
  const tabs = [
    {
      href: '/',
      icon: Home,
      active: pathname === '/',
    },
    {
      href: '/search',
      icon: Search,
      active: pathname === '/search',
    },
    ...(isAuthenticated && (user?.role === 'Administrator' || user?.role === 'Editor') ? [{
      href: '/admin/recipes/new',
      icon: Plus,
      active: pathname === '/admin/recipes/new',
    }] : []),
    {
      href: isAuthenticated ? '/saved' : '/login',
      icon: Bookmark,
      active: pathname === '/saved' || pathname === '/favorites',
      badge: totalSaved > 0, // Show red dot if user has saved items
    },
    {
      href: isAuthenticated ? ((user?.role === 'Administrator' || user?.role === 'Editor') ? '/admin' : '/settings') : '/login',
      icon: isAuthenticated ? User : LogIn,
      active: pathname.startsWith('/admin') || pathname === '/settings' || pathname === '/login',
      isProfile: isAuthenticated,
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#090d1a] border-t border-white/10 shadow-[0_-8px_30px_rgb(0,0,0,0.6)] print:hidden">
      <nav className="w-full h-16 flex items-center justify-around px-2 pb-[safe-area-inset-bottom]">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          return (
            <Link
              key={index}
              href={tab.href}
              className="flex items-center justify-center w-12 h-12 relative select-none"
            >
              {tab.isProfile && user?.avatar ? (
                <div className={cn(
                  "w-6 h-6 rounded-full overflow-hidden border transition-all",
                  tab.active ? "border-white scale-110" : "border-white/20"
                )}>
                  <Image
                    src={user.avatar}
                    alt="Avatar"
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <Icon 
                  className={cn(
                    "w-6 h-6 transition-all duration-200 stroke-[2px]", 
                    tab.active 
                      ? "text-white scale-110" 
                      : "text-white/50 hover:text-white"
                  )} 
                />
              )}

              {/* Red Badge (exactly like the message bubble red notification dot) */}
              {tab.badge && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-[#090d1a] shadow-sm animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
