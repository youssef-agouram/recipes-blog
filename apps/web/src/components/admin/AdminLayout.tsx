'use client';

import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Folder, 
  Users, 
  MessageCircle, 
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  Search,
  Bell,
  ChevronDown,
  ChefHat,
  ShieldCheck,
  Camera,
  Upload,
  FileText
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { apiService } from '@/store/api/apiService';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/recipes', label: 'Recipes', icon: BookOpen },
  { href: '/admin/categories', label: 'Categories', icon: Folder },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/comments', label: 'Comments', icon: MessageCircle },
  { href: '/admin/seo', label: 'SEO', icon: TrendingUp },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const settingSubLinks = [
  { label: 'General', href: '/admin/settings' },
  { label: 'Site Identity', href: '/admin/settings/identity' },
  { label: 'Email Settings', href: '/admin/settings/email' },
  { label: 'Social Profiles', href: '/admin/settings/social' },
  { label: 'Advanced', href: '/admin/settings/advanced' },
  { label: 'Backup & Restore', href: '/admin/settings/backup' },
];


export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = (e?: React.MouseEvent) => {
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

    // 3. Force full page reload after a micro-delay
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 50);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#05060b]">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen w-[260px] bg-[#0a0b14] border-r border-white/5 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 overflow-y-auto scrollbar-hide`}>
        {/* Logo Section */}
        <div className="pt-8 pb-10 px-6">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
               <ChefHat className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white leading-none tracking-tight">
                Tasty<span className="text-[#f59e0b]">Recipes</span>
              </span>
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mt-1.5">
                Admin Panel
              </span>
            </div>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="px-4 space-y-1.5">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 text-[14px] font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#5850ec] text-white shadow-lg shadow-[#5850ec]/30 scale-[1.02]' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Settings Hierarchical Section */}
        <div className="mt-10 px-8 pb-10">
          <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.25em] mb-6">
            Settings
          </div>
          
          <div className="relative space-y-1">
            {/* Vertical Line Connector */}
            <div className="absolute left-[3px] top-2 bottom-4 w-[1.5px] bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
            
            {settingSubLinks.map((sub, i) => {
              const isSubActive = pathname === sub.href;
              return (
                <Link 
                  key={sub.label} 
                  href={sub.href}
                  className="relative pl-7 py-2 group block"
                >
                  {/* Dot Connector */}
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full border transition-all z-10 ${
                    isSubActive ? 'border-[#5850ec] bg-[#5850ec] shadow-[0_0_8px_#5850ec]' : 'border-white/20 bg-[#0a0b14] group-hover:border-[#5850ec]'
                  }`} />
                  
                  <span className={`text-[13px] font-bold transition-colors ${
                    isSubActive ? 'text-white' : 'text-slate-500 group-hover:text-white'
                  }`}>
                    {sub.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-auto px-4 pb-8">
          <button
            onMouseDown={handleLogout}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-[14px] font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-[260px]">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#272a35] bg-[#0f1117]/95 px-6 backdrop-blur">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#8b929d] hover:text-[#e4e6eb] transition-colors lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Search Bar */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b929d]" />
              <input 
                type="text"
                placeholder="Search recipes, categories..."
                className="h-9 w-[320px] rounded-md border border-[#272a35] bg-[#141821] pl-9 pr-4 text-sm text-[#e4e6eb] placeholder:text-[#8b929d] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f29e1f]/50"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-[#8b929d] hover:text-[#e4e6eb] transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#f29e1f]" />
            </button>
            
            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full overflow-hidden bg-muted shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name || 'User'} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-[#272a35] flex items-center justify-center text-xs font-bold text-[#8b929d]">
                    {user?.name?.charAt(0).toUpperCase() || 'J'}
                  </div>
                )}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-[#e4e6eb]">{user?.name || 'John Doe'}</p>
                <p className="text-xs text-[#8b929d]">{user?.role || 'Administrator'}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-[#8b929d] hidden md:block" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
