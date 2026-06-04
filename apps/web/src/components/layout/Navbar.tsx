'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Logo } from './Logo';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { useGetSiteSettingsQuery } from '@/store/api/settingsApi';
import { useGetSavedRecipesQuery, useGetFavoritedRecipesQuery, useSearchRecipesQuery } from '@/store/api/recipeApi';
import { useGetSavedArticlesQuery, useGetFavoritedArticlesQuery } from '@/store/api/articleApi';
import { apiService } from '@/store/api/apiService';
import { cn } from '@/lib/utils';
import {
  Search, Bell, User, Globe, ChevronDown, Plus,
  Menu, X, LogIn, UserPlus, Settings, LogOut,
  BookOpen, Heart, ChefHat, Bookmark, Sparkles
} from 'lucide-react';

const FacebookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const InstagramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const TwitterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
);
const YoutubeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.42 5.58a2.78 2.78 0 0 0 1.94 2c1.71.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.42-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
);



export function Navbar() {
  const { data: settings, isLoading: isLoadingSettings } = useGetSiteSettingsQuery();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTopAd, setShowTopAd] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownMobileRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const [topAdIndex, setTopAdIndex] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchSuggestionsData, isFetching: isSearching } = useSearchRecipesQuery(
    { search: debouncedSearchQuery, limit: 5 },
    { skip: !debouncedSearchQuery.trim() }
  );

  const suggestions = searchSuggestionsData?.data || [];

  const topBarUrls = (() => {
    const rawVal = settings?.adSettings?.topBarAdUrls || settings?.adSettings?.topBarAdUrl;
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

  const activeTopAdUrl = topBarUrls[topAdIndex] || '';

  const getYoutubeId = (url: string) => {
    return url?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
  };

  const youtubeIds = topBarUrls.map(getYoutubeId).filter(Boolean);

  useEffect(() => {
    if (topBarUrls.length <= 1) return;
    const isImage = activeTopAdUrl && !getYoutubeId(activeTopAdUrl) && !activeTopAdUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i);
    if (isImage) {
      const timer = setTimeout(() => {
        setTopAdIndex((prev) => (prev + 1) % topBarUrls.length);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [activeTopAdUrl, topBarUrls, topAdIndex]);
  const { isAuthenticated, user, isHydrating } = useSelector(
    (state: RootState) => state.auth
  );

  const { data: savedRecipes } = useGetSavedRecipesQuery(undefined, { skip: !isAuthenticated });
  const { data: favoritedRecipes } = useGetFavoritedRecipesQuery(undefined, { skip: !isAuthenticated });
  const { data: savedArticles } = useGetSavedArticlesQuery(undefined, { skip: !isAuthenticated });
  const { data: favoritedArticles } = useGetFavoritedArticlesQuery(undefined, { skip: !isAuthenticated });

  const totalSaved = (savedRecipes?.length || 0) + (savedArticles?.length || 0);
  const totalFavorited = (favoritedRecipes?.length || 0) + (favoritedArticles?.length || 0);

  // Dynamic values from settings
  const brandName = settings?.brandName;
  const tagline = settings?.tagline;
  const logoUrl = settings?.logoUrl;
  const navLinks = settings?.menuItems?.length > 0
    ? settings.menuItems.filter((m: any) => m.visible !== false)
    : []; // Remove default links completely if not in settings

  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
      if (
        profileDropdownMobileRef.current &&
        !profileDropdownMobileRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (settings?.adSettings?.showTopBarAd && settings?.adSettings?.topBarAdUrl) {
      setShowTopAd(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const shouldShow = currentScrollY > 200;

      setShowTopAd((prev) => {
        if (prev !== shouldShow) {
          return shouldShow;
        }
        return prev;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [settings]);

  const handleLogout = (e?: React.MouseEvent) => {
    // Prevent any event bubbling that could interfere
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // 1. Clear local/session storage FIRST
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.clear();
      sessionStorage.clear();
    } catch (err) {
      // Silent fail
    }

    // 2. Dispatch Redux logout
    try {
      dispatch(logout());
      dispatch(apiService.util.resetApiState());
    } catch (err) {
      // Silent fail
    }

    // 3. Force full page reload after a micro-delay to ensure storage is flushed
    setTimeout(() => {
      window.location.href = '/';
    }, 50);
  };

  const SocialIcon = ({ name, icon: Icon }: { name: string; icon: any }) => (
    <div className="w-4 h-4 flex items-center justify-center text-white/50 hover:text-[#f29e1f] cursor-pointer transition-all hover:scale-110">
      <Icon />
    </div>
  );

  // We no longer block the entire Navbar render. 
  // Instead, we use inline skeletons for specific parts.

  return (
    <>
      {/* Mobile Menu Backdrop and Drawer (outside stacking context for z-index safety) */}
      {/* Backdrop overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/65 z-[99999] lg:hidden transition-opacity duration-300",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Drawer content */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 w-[290px] sm:w-[320px] bg-[#0c1021] border-r border-white/10 z-[100000] transition-transform duration-300 ease-in-out transform lg:hidden shadow-2xl flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div onClick={() => setMobileMenuOpen(false)}>
            <Logo />
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-all border border-white/10"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-between">
          {/* Mobile Nav Links */}
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((item: any, idx: number) => {
              const href = item.url || item.href;
              const isActive = pathname === href;
              return (
                <Link
                  key={item.label}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4.5 py-3.5 rounded-2xl transition-all duration-300 group border",
                    isActive
                      ? "bg-primary/10 border-primary/20 text-primary shadow-lg shadow-primary/5"
                      : "border-transparent text-muted-foreground hover:text-white hover:bg-white/5"
                  )}
                >
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    isActive
                      ? "bg-primary scale-125 shadow-[0_0_8px_var(--color-primary)]"
                      : "bg-muted-foreground/30 group-hover:bg-primary"
                  )} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Profile if logged in / Sign in if not logged in */}
          <div className="mt-auto pt-6 border-t border-white/5">
            {mounted && !isHydrating && (
              <>
                {isAuthenticated ? (
                  <div className="flex flex-col gap-4">
                    {(user?.role === 'Administrator' || user?.role === 'Editor') && (
                      <Link
                        href="/admin/recipes/new"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/15 hover:-translate-y-0.5"
                      >
                        <Plus className="w-4 h-4 stroke-[3px]" />
                        Submit Recipe
                      </Link>
                    )}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border shadow-md">
                      <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/20 p-0.5">
                        {user?.avatar ? (
                          <Image
                            src={user.avatar}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="w-full h-full object-cover rounded-lg"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-bold text-white truncate">
                          {user?.name || 'User'}
                        </span>
                        <span className="text-[11px] text-muted-foreground/60 truncate">
                          {user?.email}
                        </span>
                      </div>
                      <button
                        onMouseDown={handleLogout}
                        className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shrink-0"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  settings?.showAuthButtons !== false && (
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/15 hover:-translate-y-0.5"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </Link>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Top Ad Bar - Appears when navbar is hidden */}
      {settings?.adSettings?.showTopBarAd && activeTopAdUrl && (
        <div className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 w-[32%] min-w-[320px] z-[999999] transition-all duration-500 ease-out pointer-events-auto print:hidden",
          showTopAd ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-12 pointer-events-none"
        )}>
          <Link href={activeTopAdUrl || '#'} target="_blank" className="block relative w-full h-16 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] group hover:scale-[1.02] transition-transform border border-white/20">
            {getYoutubeId(activeTopAdUrl) ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYoutubeId(activeTopAdUrl)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeIds.join(',')}&showinfo=0&modestbranding=1`}
                className="absolute inset-0 w-full h-[300%] -top-[100%] object-cover pointer-events-none"
                allow="autoplay; encrypted-media"
              />
            ) : activeTopAdUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i) ? (
              <video
                src={activeTopAdUrl}
                autoPlay
                muted
                playsInline
                onEnded={() => setTopAdIndex((prev) => (prev + 1) % topBarUrls.length)}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <Image src={activeTopAdUrl} alt="Ad" fill sizes="100vw" className="object-cover" unoptimized />
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-500"></div>
            <div className="absolute inset-y-0 right-4 flex items-center">
              <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-white/20 shadow-xl group-hover:bg-white group-hover:text-black transition-all">
                Visit Link
              </span>
            </div>
            <div className="absolute top-2 left-4">
              <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/70 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">Sponsored</span>
            </div>
          </Link>
        </div>
      )}

      <div className={cn(
        "w-full flex flex-col transition-all duration-500 ease-in-out print:hidden"
      )}>
        {/* 1. Top Bar */}
        {settings?.showTopBar !== false && (
          <div className="w-full bg-background border-b border-border py-2">
            <div className="container mx-auto px-6 max-w-[1536px] flex items-center justify-between">
              <div className="flex items-center gap-5">
                <SocialIcon name="Facebook" icon={FacebookIcon} />
                <SocialIcon name="Instagram" icon={InstagramIcon} />
                <SocialIcon name="Twitter" icon={TwitterIcon} />
                <SocialIcon name="Youtube" icon={YoutubeIcon} />
              </div>

              <div className="hidden md:flex items-center gap-2">
                <p className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">
                  Get 30% Off on Premium Meal Plans — Limited Time Offer! ✨
                </p>
              </div>

              <div className="flex items-center gap-2 cursor-pointer group">
                <Globe className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-white transition-colors">
                  English
                </span>
                <ChevronDown className="w-3 h-3 text-muted-foreground/60 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        )}

        {/* 2. Main Navbar */}
        <header className={`w-full bg-background/95 z-50 backdrop-blur-xl border-b border-border ${settings?.stickyNavbar !== false ? 'sticky top-0' : ''}`}>
          {/* Desktop Header */}
          <div className="hidden lg:flex container mx-auto px-4 sm:px-6 max-w-[1536px] h-16 sm:h-20 items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <Logo />

            {/* Navigation — Desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              {isLoadingSettings ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-16 h-2.5 bg-white/10 animate-pulse rounded-full" />
                  ))}
                </>
              ) : (
                navLinks.map((item: any) => (
                  <Link
                    key={item.label}
                    href={item.url || item.href}
                    className="group relative py-2"
                  >
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-white transition-colors">
                      {item.label}
                    </span>
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
                  </Link>
                ))
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search Bar - Desktop */}
              <div className="hidden lg:flex items-center relative mr-1">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchFocused(false);
                    }
                  }}
                  className="relative flex items-center bg-white/5 border border-border hover:border-white/10 rounded-2xl px-3.5 py-2 w-44 focus-within:w-60 focus-within:bg-white/10 focus-within:border-primary/50 transition-all duration-300 group"
                >
                  <Search className="w-4 h-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    placeholder="Search recipes..."
                    className="bg-transparent border-0 outline-none text-[11px] text-white placeholder:text-muted-foreground/45 w-full font-bold uppercase tracking-wider"
                  />
                </form>

                {/* Suggestions Dropdown */}
                {searchFocused && searchQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c1021]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] w-60 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="p-2 flex flex-col gap-1">
                      {isSearching && (
                        <div className="p-3 text-xs text-muted-foreground flex items-center gap-2">
                          <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Searching...</span>
                        </div>
                      )}

                      {!isSearching && suggestions.length === 0 && (
                        <div className="p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          No recipes found
                        </div>
                      )}

                      {!isSearching && suggestions.map((recipe: any) => (
                        <button
                          key={recipe.id}
                          onMouseDown={() => {
                            router.push(`/recipes/${recipe.slug}`);
                            setSearchQuery('');
                            setSearchFocused(false);
                          }}
                          className="w-full text-left flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-all text-xs text-white group"
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 relative">
                            {recipe.imageUrl ? (
                              <Image
                                src={recipe.imageUrl}
                                alt={recipe.title}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <ChefHat className="w-4 h-4 text-primary absolute inset-0 m-auto" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold truncate text-[11px] leading-snug group-hover:text-primary transition-colors">{recipe.title}</p>
                            <p className="text-[9px] text-muted-foreground truncate leading-normal">
                              {recipe.summary || 'Delicious recipe'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Auth Area */}
              {(!mounted || isHydrating) ? (
                <div className="hidden sm:flex h-[36px] w-[88px] bg-white/5 animate-pulse rounded-[18px] ml-1 pl-4 border-l border-border" />
              ) : (
                <>
                  {isAuthenticated && (
                    <>
                      {/* Submit Recipe */}
                      {(user?.role === 'Administrator' || user?.role === 'Editor') && (
                        <Link
                          href="/admin/recipes/new"
                          id="navbar-submit-recipe"
                          className="hidden md:flex items-center gap-2.5 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-2xl hover:-translate-y-0.5 hover:shadow-primary/30"
                        >
                          <Plus className="w-4 h-4 stroke-[3px]" />
                          Submit Recipe
                        </Link>
                      )}

                      <div className="flex items-center gap-2 sm:gap-3 ml-0.5 sm:ml-1 pl-3 sm:pl-4 border-l border-border">
                        {/* Notifications */}
                        <button
                          id="navbar-notifications"
                          className="relative w-8.5 h-8.5 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl sm:rounded-[22px] bg-white/5 text-muted-foreground hover:text-white transition-all group border border-border hover:border-white/10"
                        >
                          <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:animate-swing" />
                          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full border-[2px] sm:border-[3px] border-background animate-pulse" />
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileDropdownRef}>
                          <button
                            id="navbar-profile-toggle"
                            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                            className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer"
                          >
                            <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl sm:rounded-[22px] overflow-hidden ring-2 ring-border hover:ring-primary/50 transition-all p-0.5 group-hover:ring-primary/60">
                              {user?.avatar ? (
                                <Image
                                  src={user.avatar}
                                  alt="Profile"
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover rounded-[10px] sm:rounded-[22px]"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-full h-full rounded-[10px] sm:rounded-[22px] bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                                  <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-primary" />
                                </div>
                              )}
                            </div>
                            <div className="hidden md:flex flex-col items-start">
                              <span className="text-xs font-bold text-white leading-tight">
                                {user?.name || 'User'}
                              </span>
                              <span className="text-[10px] text-muted-foreground/60 leading-tight">
                                {user?.role || 'Member'}
                              </span>
                            </div>
                            <ChevronDown
                              className={`hidden md:block w-3.5 h-3.5 text-muted-foreground/50 transition-transform duration-300 ${profileDropdownOpen ? 'rotate-180' : ''
                                }`}
                            />
                          </button>

                          {/* Dropdown Menu */}
                          {profileDropdownOpen && (
                            <div className="absolute right-0 top-full mt-3 w-64 bg-[#0c1021]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                              {/* User Info Header */}
                              <div className="p-5 border-b border-white/5 bg-gradient-to-r from-primary/5 to-transparent">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-primary/20 p-0.5">
                                    {user?.avatar ? (
                                      <Image
                                        src={user.avatar}
                                        alt="Profile"
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover rounded-[12px]"
                                        unoptimized
                                      />
                                    ) : (
                                      <div className="w-full h-full rounded-[12px] bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                                        <User className="w-5 h-5 text-primary" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">
                                      {user?.name || 'User'}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground/60">
                                      {user?.email || 'user@example.com'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Menu Items */}
                              <div className="p-2">
                                {[
                                  {
                                    icon: Heart,
                                    label: 'Favorites',
                                    href: '/favorites',
                                    count: totalFavorited,
                                    color: 'text-rose-400'
                                  },
                                  {
                                    icon: Bookmark,
                                    label: 'Saved',
                                    href: '/saved',
                                    count: totalSaved,
                                    color: 'text-primary'
                                  },
                                  { icon: Settings, label: 'Settings', href: '/settings' },
                                ].map((item) => (
                                  <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setProfileDropdownOpen(false)}
                                    className="flex items-center justify-between px-4 py-3 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <item.icon className={cn("w-4 h-4 transition-colors", item.color || "group-hover:text-primary")} />
                                      <span className="text-[13px] font-semibold">
                                        {item.label}
                                      </span>
                                    </div>
                                    {item.count !== undefined && (
                                      <span className={cn(
                                        "text-[10px] font-black px-2 py-0.5 rounded-lg bg-white/5",
                                        item.count > 0 ? "text-white" : "text-white/20"
                                      )}>
                                        {item.count}
                                      </span>
                                    )}
                                  </Link>
                                ))}
                              </div>

                              {/* Logout */}
                              <div className="p-2 border-t border-white/5">
                                <button
                                  id="navbar-logout"
                                  onMouseDown={handleLogout}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all group"
                                >
                                  <LogOut className="w-4 h-4" />
                                  <span className="text-[13px] font-semibold">
                                    Sign Out
                                  </span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {!isAuthenticated && settings?.showAuthButtons !== false && (
                    <div className="hidden sm:flex items-center gap-3 ml-1 pl-4 border-l border-border">
                      <Link
                        href="/login"
                        id="navbar-login"
                        className="flex items-center gap-1.5 px-4.5 py-2 text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-primary/30"
                        style={{ borderRadius: '18px' }}
                      >
                        <LogIn className="w-3 h-3" />
                        <span>Sign In</span>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Mobile Header */}
          <div className="flex lg:hidden container mx-auto px-4 h-16 items-center justify-between gap-2 relative">
            {/* Left: Menu Icon + Logo */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Toggle */}
              <button
                id="navbar-mobile-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-muted-foreground hover:text-white transition-all border border-border"
              >
                {mobileMenuOpen ? (
                  <X className="w-4.5 h-4.5" />
                ) : (
                  <Menu className="w-4.5 h-4.5" />
                )}
              </button>

              <Logo />
            </div>

            {/* Right: Search Icon + User Badge */}
            <div className="flex items-center gap-3">
              {/* Search Icon */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-muted-foreground hover:text-white transition-all border border-border"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {/* User Badge */}
              {mounted && !isHydrating && isAuthenticated && (
                <div className="relative" ref={profileDropdownMobileRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-border hover:ring-primary/50 transition-all p-0.5"
                  >
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        alt="Profile"
                        width={36}
                        height={36}
                        className="w-full h-full object-cover rounded-lg"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                        <User className="w-4.5 h-4.5 text-primary" />
                      </div>
                    )}
                  </button>
                  {/* Dropdown Menu on Mobile */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#0c1021]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-3.5 border-b border-white/5 bg-gradient-to-r from-primary/5 to-transparent">
                        <span className="text-xs font-bold text-white block truncate">{user?.name || 'User'}</span>
                        <span className="text-[10px] text-muted-foreground/60 block truncate">{user?.email}</span>
                      </div>
                      <div className="p-1">
                        <Link
                          href="/favorites"
                          onClick={() => { setProfileDropdownOpen(false); setMobileMenuOpen(false); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Heart className="w-3.5 h-3.5 text-rose-400" /> Favorites
                        </Link>
                        <Link
                          href="/saved"
                          onClick={() => { setProfileDropdownOpen(false); setMobileMenuOpen(false); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-primary" /> Saved
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => { setProfileDropdownOpen(false); setMobileMenuOpen(false); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Settings className="w-3.5 h-3.5" /> Settings
                        </Link>
                      </div>
                      <div className="p-1 border-t border-white/5">
                        <button
                          onMouseDown={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-all text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Search Overlay */}
            {searchOpen && (
              <div className="absolute inset-x-0 top-0 bg-[#020617] z-50 flex flex-col px-4 py-3 animate-in fade-in duration-200 border-b border-white/10 shadow-2xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchOpen(false);
                    }
                  }}
                  className="flex items-center gap-2 w-full"
                >
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search recipes..."
                    className="flex-1 bg-transparent border-0 outline-none text-sm text-white placeholder:text-muted-foreground/40 py-1.5"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white px-2 py-1"
                  >
                    Cancel
                  </button>
                </form>

                {/* Suggestions List - Mobile */}
                {searchQuery.trim() && (
                  <div className="mt-2 flex flex-col gap-1 border-t border-white/5 pt-2 max-h-[300px] overflow-y-auto">
                    {isSearching && (
                      <div className="p-2 text-xs text-muted-foreground flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Searching...</span>
                      </div>
                    )}

                    {!isSearching && suggestions.length === 0 && (
                      <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        No recipes found
                      </div>
                    )}

                    {!isSearching && suggestions.map((recipe: any) => (
                      <button
                        key={recipe.id}
                        onMouseDown={() => {
                          router.push(`/recipes/${recipe.slug}`);
                          setSearchQuery('');
                          setSearchOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-all text-xs text-white group"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 relative">
                          {recipe.imageUrl ? (
                            <Image
                              src={recipe.imageUrl}
                              alt={recipe.title}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <ChefHat className="w-4 h-4 text-primary absolute inset-0 m-auto" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate text-[11px] leading-snug group-hover:text-primary transition-colors">{recipe.title}</p>
                          <p className="text-[9px] text-muted-foreground truncate leading-normal">
                            {recipe.summary || 'Delicious recipe'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>


        </header>
      </div>
    </>
  );
}
