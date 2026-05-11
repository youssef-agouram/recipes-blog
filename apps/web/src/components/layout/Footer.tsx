import Link from "next/link";
import { Globe, Music, Send, Share2, Mail } from "lucide-react";

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
);
const YoutubeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.42 5.58a2.78 2.78 0 0 0 1.94 2c1.71.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.42-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
);
const TikTokIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
);

export function Footer() {
  return (
    <footer className="bg-[#05060b] pt-24 pb-12 text-foreground border-t border-white/5 font-body">
      <div className="container mx-auto px-6 max-w-[1536px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 lg:gap-12 mb-20">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative w-12 h-12 rounded-full bg-[#f59e0b] flex items-center justify-center text-black font-black text-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <span>T</span>
              </div>
              <span className="font-black text-3xl tracking-tighter text-white font-heading">Taste<span className="text-[#f59e0b]">ful</span></span>
            </Link>
            <p className="text-[15px] text-slate-400 max-w-sm leading-relaxed font-medium">
              Delicious recipes for everyone. Explore thousands of handpicked recipes from around the world and share your culinary journey.
            </p>
            <div className="flex items-center gap-3">
              {[FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-500 hover:text-white hover:bg-[#5850ec] transition-all border border-white/5 group shadow-lg">
                  <Icon />
                </a>
              ))}
            </div>
          </div>
          
          {/* Explore Links */}
          <div className="space-y-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white font-heading">Explore</h4>
            <ul className="space-y-4">
              {['All Recipes', 'Categories', 'Meal Plans', 'Popular Recipes', 'Latest Recipes'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-[14px] font-bold text-slate-500 hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information Links */}
          <div className="space-y-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white font-heading">Information</h4>
            <ul className="space-y-4">
              {['About Us', 'Contact Us', 'Privacy Policy', 'Terms of Service', 'FAQ'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-[14px] font-bold text-slate-500 hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white font-heading">Support</h4>
            <ul className="space-y-4">
              {['Help Center', 'Submit a Recipe', 'Community', 'Advertise with Us'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-[14px] font-bold text-slate-500 hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} Tasteful. All rights reserved.
          </p>
          <div className="flex items-center gap-10">
            <Link href="#" className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-[0.3em] transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-[0.3em] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
