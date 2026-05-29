'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Sparkles, Shield, Scroll, Eye, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, subtitle, lastUpdated, children }: LegalLayoutProps) {
  const pathname = usePathname();

  const links = [
    { label: 'Privacy Policy', href: '/privacy-policy', icon: Eye },
    { label: 'Terms of Service', href: '/terms-of-service', icon: Scroll },
    { label: 'Cookie Policy', href: '/cookie-policy', icon: Shield },
    { label: 'Disclaimer', href: '/disclaimer', icon: AlertTriangle },
  ];

  return (
    <div className="w-full bg-background text-foreground pb-24 min-h-screen">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-card/30 via-card/10 to-transparent border-b border-white/5 py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(242,158,31,0.03),transparent_60%)]"></div>
        
        <div className="container mx-auto px-6 max-w-[1536px] relative z-10 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.25em] text-primary hover:text-white mb-6 sm:mb-8 transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Legal Center
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter leading-none font-heading mb-4">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 max-w-[1536px] mt-12 sm:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Sticky Navigation */}
          <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-6">
            <div className="bg-card/25 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
              <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 px-3">
                Legal Documents
              </span>
              <nav className="flex flex-col gap-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group border text-xs font-semibold",
                        isActive
                          ? "bg-primary/10 border-primary/20 text-primary shadow-lg shadow-primary/5"
                          : "border-transparent text-muted-foreground hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"
                      )} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Last Updated Card */}
            <div className="bg-card/10 rounded-2xl p-5 border border-white/5 text-[10px] text-muted-foreground font-medium flex flex-col gap-2">
              <span className="font-black uppercase tracking-[0.1em] text-white/40">Last Updated</span>
              <span className="text-white/80 font-bold uppercase tracking-wider">{lastUpdated}</span>
              <p className="leading-relaxed mt-1 text-slate-400">
                These documents apply to all visitors, home cooks, and contributors.
              </p>
            </div>
          </div>

          {/* Right Column: Content Body */}
          <div className="lg:col-span-9 bg-card/20 rounded-[32px] p-6 sm:p-10 border border-white/5 shadow-xl backdrop-blur-sm">
            <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-p:leading-relaxed prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-li:text-slate-300 prose-strong:text-white">
              {children}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
