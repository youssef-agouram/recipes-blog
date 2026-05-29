'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Home, Heart, Bookmark, User, Search, Plus, LogIn, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useGetSavedRecipesQuery } from '@/store/api/recipeApi';
import { useGetSavedArticlesQuery } from '@/store/api/articleApi';

export function BottomNavigation() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  // Read saved recipes and articles using standard RTK Query hooks
  const { data: savedRecipes } = useGetSavedRecipesQuery(undefined, { skip: !isAuthenticated });
  const { data: savedArticles } = useGetSavedArticlesQuery(undefined, { skip: !isAuthenticated });
  const totalSaved = (savedRecipes?.length || 0) + (savedArticles?.length || 0);

  // Tabs configured to match the user's reference image
  const tabs = [
    {
      href: '/',
      icon: Home,
      active: pathname === '/',
      label: 'Home',
    },
    {
      href: '/categories',
      icon: LayoutGrid,
      active: pathname === '/categories',
      label: 'Categories',
    },
    ...(isAuthenticated && (user?.role === 'Administrator' || user?.role === 'Editor') ? [{
      href: '/admin/recipes/new',
      icon: Plus,
      active: pathname === '/admin/recipes/new',
      label: 'New',
    }] : []),
    {
      href: isAuthenticated ? '/saved' : '/login',
      icon: Bookmark,
      active: pathname === '/saved' || pathname === '/favorites',
      badge: totalSaved > 0, // Show red dot if user has saved items
      label: 'Saved',
    },
    {
      href: isAuthenticated ? ((user?.role === 'Administrator' || user?.role === 'Editor') ? '/admin' : '/settings') : '/login',
      icon: isAuthenticated ? User : LogIn,
      active: pathname.startsWith('/admin') || pathname === '/settings' || pathname === '/login',
      isProfile: isAuthenticated,
      label: isAuthenticated ? 'Profile' : 'Login',
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#090d1a] border-t border-white/10 shadow-[0_-8px_30px_rgb(0,0,0,0.6)] print:hidden">
      <nav className="w-full h-[70px] flex items-center justify-around px-2 pb-[safe-area-inset-bottom]">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          return (
            <Link
              key={index}
              href={tab.href}
              className="flex-1 h-full flex flex-col items-center justify-center relative select-none gap-1"
            >
              <div className="relative">
                {tab.isProfile && user?.avatar ? (
                  <div className={cn(
                    "w-5 h-5 rounded-full overflow-hidden border transition-all",
                    tab.active ? "border-white scale-110" : "border-white/20"
                  )}>
                    <Image
                      src={user.avatar}
                      alt="Avatar"
                      width={20}
                      height={20}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <Icon 
                    className={cn(
                      "w-[22px] h-[22px] transition-all duration-200 stroke-[2px]", 
                      tab.active 
                        ? "text-white scale-110" 
                        : "text-white/50 hover:text-white"
                    )} 
                  />
                )}

                {/* Red Badge (exactly like the message bubble red notification dot) */}
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-[#090d1a] shadow-sm animate-pulse" />
                )}
              </div>

              {/* Label */}
              <span className={cn(
                "text-[9px] font-black uppercase tracking-[0.05em] transition-colors duration-200",
                tab.active ? "text-white" : "text-white/40"
              )}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
