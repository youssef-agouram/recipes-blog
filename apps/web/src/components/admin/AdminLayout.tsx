'use client';

import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Utensils, 
  Tags, 
  MessageSquare, 
  ImageIcon, 
  Settings,
  LogOut,
  Menu,
  Search,
  Bell,
  ChevronDown,
  ChefHat
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import Link from 'next/link';
import { useState } from 'react';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/recipes', label: 'Recipes', icon: Utensils },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { href: '/admin/media', label: 'Media', icon: ImageIcon },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen w-[240px] bg-[#0f1117] border-r border-[#272a35] transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex h-16 items-center px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <ChefHat className="h-7 w-7 text-[#f29e1f]" />
            <span className="text-xl font-bold tracking-tight text-[#f29e1f]">RecipeHub</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="px-3 py-4 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-[#1a1d26] text-[#e4e6eb]' 
                    : 'text-[#8b929d] hover:bg-[#1a1d26]/50 hover:text-[#e4e6eb]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-[#f29e1f]" />
                )}
                <Icon className="h-[18px] w-[18px]" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Card */}
        <div className="absolute bottom-0 w-full px-3 pb-4">
          <div className="flex items-center gap-3 rounded-lg bg-[#1a1d26] p-3 border border-[#272a35]">
            <div className="h-9 w-9 rounded-full overflow-hidden bg-muted shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name || 'User'} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-[#272a35] flex items-center justify-center text-xs font-bold text-[#8b929d]">
                  {user?.name?.charAt(0).toUpperCase() || 'J'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#e4e6eb] truncate">{user?.name || 'John Doe'}</p>
              <p className="text-xs text-[#8b929d]">{user?.role || 'Administrator'}</p>
            </div>
            <button onClick={handleLogout} className="text-[#8b929d] hover:text-[#e4e6eb] transition-colors shrink-0">
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
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
      <div className="flex flex-1 flex-col lg:pl-[240px]">
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
