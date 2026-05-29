import React from 'react';
import Link from 'next/link';

const FacebookIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const InstagramIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const TwitterIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
);
const YoutubeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.42 5.58a2.78 2.78 0 0 0 1.94 2c1.71.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.42-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
);

export function Footer() {
  const socialLinks = [
    { icon: FacebookIcon, href: "#", label: "Facebook" },
    { icon: InstagramIcon, href: "#", label: "Instagram" },
    { icon: TwitterIcon, href: "#", label: "Twitter" },
    { icon: YoutubeIcon, href: "#", label: "Youtube" },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-of-service' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
    { label: 'Disclaimer', href: '/disclaimer' },
  ];

  return (
    <footer className="w-full bg-[#030408] border-t border-white/5 py-10 sm:py-12 font-body print:hidden">
      <div className="container mx-auto px-6 max-w-[1536px]">
        
        {/* Fully responsive Grid layout supporting Mobile, Tablet, and Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 items-center gap-y-6 md:gap-y-8 lg:gap-y-0 gap-x-4">
          
          {/* Logo (Left column: span 1/2 on tablet, span 3/12 on desktop) */}
          <div className="col-span-1 md:col-span-1 lg:col-span-3 flex justify-center md:justify-start">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-black font-black text-base flex items-center justify-center shadow-lg shadow-primary/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/30">
                <span>T</span>
              </div>
              <span className="font-heading font-black text-xl tracking-tighter text-white transition-colors group-hover:text-primary">
                Taste<span className="text-[#f59e0b]">ful</span>
              </span>
            </Link>
          </div>

          {/* Legal Pages links (Center/Bottom row: span 2/2 on tablet, span 6/12 on desktop) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-6 flex flex-wrap justify-center items-center gap-x-4 gap-y-2 order-2 md:order-3 lg:order-2 md:mt-4 lg:mt-0">
            {legalLinks.map((link, idx) => (
              <React.Fragment key={link.href}>
                {idx > 0 && <span className="text-slate-600 text-[10px] select-none">/</span>}
                <Link 
                  href={link.href} 
                  className="text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors duration-200"
                >
                  {link.label}
                </Link>
              </React.Fragment>
            ))}
          </div>

          {/* Social Links & Copyright (Right column: span 1/2 on tablet, span 3/12 on desktop, stacked vertically) */}
          <div className="col-span-1 md:col-span-1 lg:col-span-3 flex flex-col items-center md:items-end gap-2 order-3 md:order-2 lg:order-3">
            {/* Social Media Links */}
            <div className="flex items-center gap-2.5">
              {socialLinks.map((item, i) => {
                const Icon = item.icon;
                return (
                  <a 
                    key={i} 
                    href={item.href} 
                    aria-label={item.label}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 hover:text-black hover:bg-[#f59e0b] hover:border-[#f59e0b] hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 shrink-0"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
            {/* Copyright */}
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center md:text-right">
              © {new Date().getFullYear()} Tasteful. All rights reserved.
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
}
