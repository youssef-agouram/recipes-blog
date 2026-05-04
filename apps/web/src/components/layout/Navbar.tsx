import Link from "next/link";
import { Search, Bell, User, Globe, ChevronDown, Plus } from "lucide-react";

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
  const SocialIcon = ({ name, icon: Icon }: { name: string, icon: any }) => (
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
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-white transition-colors">English</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground/60 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>

      {/* 2. Main Navbar */}
      <header className="w-full bg-background/95 sticky top-0 z-50 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 max-w-[1536px] h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-2xl group-hover:scale-105 transition-transform">
               <span className="translate-y-[-1px]">T</span>
            </div>
            <div className="flex flex-col leading-[1.1]">
              <span className="font-black text-2xl tracking-tighter text-white font-heading">Taste<span className="text-primary">ful</span></span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] ml-0.5">Delicious Recipes</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {[
              { label: 'Home', href: '/' },
              { label: 'Recipes', href: '/recipes' },
              { label: 'Categories', href: '/categories' },
              { label: 'Meal Plans', href: '/meal-plans' },
              { label: 'Blog', href: '/blog' },
              { label: 'About Us', href: '/about' }
            ].map((item) => (
              <Link 
                key={item.label} 
                href={item.href} 
                className="group relative py-2"
              >
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-white transition-colors">
                  {item.label}
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full rounded-full"></span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-all border border-border group">
              <Search className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
            </button>
            
            <Link 
              href="/admin/recipes/new" 
              className="hidden md:flex items-center gap-2.5 bg-primary text-primary-foreground px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-2xl hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              Submit Recipe
            </Link>

            <div className="flex items-center gap-4 ml-2 pl-6 border-l border-border">
              <button className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 text-muted-foreground hover:text-white transition-all group">
                <Bell className="w-4.5 h-4.5 group-hover:animate-swing" />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary rounded-full border-[3px] border-background"></span>
              </button>
              
              <div className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-border hover:ring-primary/50 transition-all cursor-pointer p-0.5">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
