'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import {
  Search, Bell, User, Globe, ChevronDown, Plus,
  Menu, X, LogIn, UserPlus, Settings, LogOut,
  BookOpen, Heart, ChefHat, Bookmark
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

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Recipes', href: '/recipes' },
  { label: 'Categories', href: '/categories' },
  { label: 'Meal Plans', href: '/meal-plans' },
  { label: 'Blog', href: '/blog' },
  { label: 'About Us', href: '/about' },
];

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch();
  const { isAuthenticated, user, isHydrating } = useSelector(
    (state: RootState) => state.auth
  );

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

  const handleLogout = () => {
    dispatch(logout());
    setProfileDropdownOpen(false);
  };

  const SocialIcon = ({ name, icon: Icon }: { name: string; icon: any }) => (
    <div className="w-4 h-4 flex items-center justify-center text-white/50 hover:text-[#f29e1f] cursor-pointer transition-all hover:scale-110">
      <Icon />
    </div>
  );

  return (
    <div className="w-full flex flex-col">
      {/* 1. Top Bar */}
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

      {/* 2. Main Navbar */}
      <header className="w-full bg-background/95 sticky top-0 z-50 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 max-w-[1536px] h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-2xl group-hover:scale-105 transition-transform ring-2 ring-primary/20 group-hover:ring-primary/40">
              <Image
                src="/logo.png"
                alt="Tasteful Logo"
                width={44}
                height={44}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="flex flex-col leading-[1.1]">
              <span className="font-black text-2xl tracking-tighter text-white font-heading">
                Taste<span className="text-primary">ful</span>
              </span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] ml-0.5">
                Delicious Recipes
              </span>
            </div>
          </Link>

          {/* Navigation — Desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group relative py-2"
              >
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-white transition-colors">
                  {item.label}
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex items-center">
              <div
                className={`
                  flex items-center overflow-hidden transition-all duration-500 ease-in-out
                  ${searchOpen
                    ? 'w-[260px] bg-white/5 border border-white/10 rounded-2xl px-4 shadow-lg shadow-primary/5'
                    : 'w-10'
                  }
                `}
              >
                <button
                  id="navbar-search-toggle"
                  onClick={() => {
                    setSearchOpen(!searchOpen);
                    if (searchOpen) setSearchQuery('');
                  }}
                  className={`
                    flex items-center justify-center shrink-0 transition-all group
                    ${searchOpen
                      ? 'w-8 h-10 text-primary'
                      : 'w-10 h-10 rounded-2xl bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 border border-border'
                    }
                  `}
                >
                  {searchOpen ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Search className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                  )}
                </button>
                {searchOpen && (
                  <input
                    ref={searchInputRef}
                    id="navbar-search-input"
                    type="text"
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }
                    }}
                    className="w-full bg-transparent text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none py-2.5 ml-1"
                  />
                )}
              </div>
            </div>

            {/* Auth Area */}
            {mounted && !isHydrating && (
              <>
                {isAuthenticated ? (
                  /* ──── Logged In State ──── */
                  <>
                    {/* Submit Recipe */}
                    {user?.role === 'Administrator' && (
                      <Link
                        href="/admin/recipes/new"
                        id="navbar-submit-recipe"
                        className="hidden md:flex items-center gap-2.5 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-2xl hover:-translate-y-0.5 hover:shadow-primary/30"
                      >
                        <Plus className="w-4 h-4 stroke-[3px]" />
                        Submit Recipe
                      </Link>
                    )}

                    <div className="flex items-center gap-3 ml-1 pl-4 border-l border-border">
                      {/* Notifications */}
                      <button
                        id="navbar-notifications"
                        className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 text-muted-foreground hover:text-white transition-all group border border-border hover:border-white/10"
                      >
                        <Bell className="w-4.5 h-4.5 group-hover:animate-swing" />
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-[3px] border-background animate-pulse" />
                      </button>

                      {/* Profile Dropdown */}
                      <div className="relative" ref={profileDropdownRef}>
                        <button
                          id="navbar-profile-toggle"
                          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                          className="flex items-center gap-2.5 group cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-border hover:ring-primary/50 transition-all p-0.5 group-hover:ring-primary/60">
                            {user?.avatar ? (
                              <img
                                src={user.avatar}
                                alt="Profile"
                                className="w-full h-full object-cover rounded-[14px]"
                              />
                            ) : (
                              <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                                <User className="w-4.5 h-4.5 text-primary" />
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
                            className={`hidden md:block w-3.5 h-3.5 text-muted-foreground/50 transition-transform duration-300 ${
                              profileDropdownOpen ? 'rotate-180' : ''
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
                                    <img
                                      src={user.avatar}
                                      alt="Profile"
                                      className="w-full h-full object-cover rounded-[12px]"
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
                                { icon: BookOpen, label: 'My Recipes', href: '/my-recipes' },
                                { icon: Heart, label: 'Favorites', href: '/favorites' },
                                { icon: Bookmark, label: 'Saved', href: '/saved' },
                                { icon: Settings, label: 'Settings', href: '/settings' },
                              ].map((item) => (
                                <Link
                                  key={item.label}
                                  href={item.href}
                                  onClick={() => setProfileDropdownOpen(false)}
                                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all group"
                                >
                                  <item.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                                  <span className="text-[13px] font-semibold">
                                    {item.label}
                                  </span>
                                </Link>
                              ))}
                            </div>

                            {/* Logout */}
                            <div className="p-2 border-t border-white/5">
                              <button
                                id="navbar-logout"
                                onClick={handleLogout}
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
                ) : (
                  /* ──── Logged Out State ──── */
                  <div className="flex items-center gap-3 ml-1 pl-4 border-l border-border">
                    <Link
                      href="/login"
                      id="navbar-login"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/80 hover:text-white bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Login</span>
                    </Link>
                    <Link
                      href="/register"
                      id="navbar-register"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-primary/30"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Register</span>
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              id="navbar-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-all border border-border ml-1"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`
            lg:hidden overflow-hidden transition-all duration-500 ease-in-out border-t border-border/50
            ${mobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 border-t-transparent'}
          `}
        >
          <div className="container mx-auto px-6 max-w-[1536px] py-6">
            {/* Mobile Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <input
                id="navbar-mobile-search"
                type="text"
                placeholder="Search recipes, categories..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
              />
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-1 mb-6">
              {navLinks.map((item, idx) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all group"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/30 transition-all" />
                  <span className="text-[13px] font-bold uppercase tracking-wider">
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Mobile Auth Buttons */}
            {mounted && !isHydrating && !isAuthenticated && (
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white/80 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Profile if logged in */}
            {mounted && !isHydrating && isAuthenticated && (
              <div className="pt-4 border-t border-white/5">
                {user?.role === 'Administrator' && (
                  <Link
                    href="/admin/recipes/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-all mb-3"
                  >
                    <Plus className="w-4 h-4 stroke-[3px]" />
                    Submit Recipe
                  </Link>
                )}
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/20 p-0.5">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-bold text-white">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-[11px] text-muted-foreground/60">
                      {user?.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
