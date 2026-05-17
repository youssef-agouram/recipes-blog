'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Globe, BarChart2, ShieldCheck, Map, FileText, Sparkles, AlertCircle,
  Shuffle, Zap, Link2, AlertTriangle
} from 'lucide-react';

export default function SeoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { label: 'SEO Dashboard', href: '/admin/seo', icon: LayoutDashboard },
    { label: 'AI Assistant', href: '/admin/seo/ai-assistant', icon: Sparkles },
    { label: 'AI Optimizer', href: '/admin/seo/ai-optimizer', icon: Sparkles },
    { label: 'Linking AI', href: '/admin/seo/ai-linking', icon: Link2 },
    { label: 'SEO Audit AI', href: '/admin/seo/ai-audit', icon: ShieldCheck },
    { label: 'Keyword Gaps', href: '/admin/seo/ai-keywords', icon: BarChart2 },
    { label: 'Technical SEO', href: '/admin/seo/technical', icon: ShieldCheck },
    { label: 'Crawl Errors', href: '/admin/seo/crawl-errors', icon: AlertCircle },
    { label: 'Redirects', href: '/admin/seo/redirects', icon: Shuffle },
    { label: 'Performance', href: '/admin/seo/performance', icon: Zap },
    { label: 'Backlinks', href: '/admin/seo/backlinks', icon: Link2 },
    { label: 'SEO Warnings', href: '/admin/seo/warnings', icon: AlertTriangle },
    { label: 'Global SEO', href: '/admin/seo/global', icon: Globe },
    { label: 'Analytics', href: '/admin/seo/analytics', icon: BarChart2 },
    { label: 'Webmaster Tools', href: '/admin/seo/webmaster', icon: ShieldCheck },
    { label: 'Sitemap Manager', href: '/admin/seo/sitemap', icon: Map },
    { label: 'Robots.txt', href: '/admin/seo/robots', icon: FileText },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            SEO Management Center
            <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-[#5850ec]/20 text-[#7f79f4] border border-[#5850ec]/30 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#7f79f4] animate-pulse" />
              Pro Setup
            </span>
          </h1>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-1.5 uppercase tracking-widest">
            <Link href="/admin" className="hover:text-white transition-colors">Dashboard</Link>
            <span className="opacity-30">&gt;</span>
            <span className="text-white/60">SEO Panel</span>
          </div>
        </div>
      </div>

      {/* Shared SEO Navigation Bar */}
      <div className="bg-[#0a0b14]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-1.5 flex flex-wrap gap-1 shadow-2xl">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 border cursor-pointer ${
                isActive 
                  ? 'bg-[#5850ec] text-white shadow-lg shadow-[#5850ec]/25 border-[#5850ec]/50 translate-y-[-1px]' 
                  : 'text-muted-foreground/60 hover:text-white hover:bg-white/5 border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'text-white scale-110' : 'text-muted-foreground/60'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Render Subpage content */}
      <div className="animate-in fade-in duration-300">
        {children}
      </div>
    </div>
  );
}
