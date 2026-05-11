'use client';

import { useState, useEffect } from 'react';
import { 
  Save, Layout, ImageIcon, Type, Columns, 
  Plus, Trash2, ChevronDown, Monitor, 
  Smartphone, Upload, X, Check, GripVertical,
  Globe, Share2, Mail, Link as LinkIcon
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function SiteIdentityPage() {
  const [activeSection, setActiveSection] = useState('navbar');
  const [stickyNavbar, setStickyNavbar] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(`${id}-section`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sections = [
    { id: 'navbar', label: 'Navbar', sub: 'Manage logo, menu and navigation', icon: Layout },
    { id: 'logos', label: 'Logos', sub: 'Manage all site logos and icons', icon: ImageIcon },
    { id: 'hero', label: 'Hero Section', sub: 'Manage hero content on homepage', icon: Type },
    { id: 'footer', label: 'Footer', sub: 'Manage footer content and widgets', icon: Columns },
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 py-4 bg-[#05060b]/80 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Site Identity</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
            <Link href="/admin/settings" className="hover:text-white transition-colors">Settings</Link>
            <span className="opacity-30">&gt;</span>
            <span className="text-white/60 text-[10px]">Site Identity</span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-8 py-2.5 bg-[#5850ec] hover:bg-[#4d45d1] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#5850ec]/40 active:scale-95">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-4 sticky top-28">
          <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-4 shadow-2xl">
            <div className="px-4 py-4 border-b border-white/5 mb-2">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Navigation</h3>
              <p className="text-[10px] text-muted-foreground/40 mt-1">Quick access to sections</p>
            </div>
            <div className="space-y-1">
              {sections.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full flex items-center gap-4 rounded-2xl px-4 py-4 transition-all duration-300 text-left group ${
                    activeSection === item.id 
                      ? 'bg-[#5850ec]/10 text-white border border-[#5850ec]/20 shadow-[0_0_20px_rgba(88,80,236,0.1)]' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl transition-colors ${
                    activeSection === item.id ? 'bg-[#5850ec] text-white shadow-lg shadow-[#5850ec]/40' : 'bg-white/5 text-slate-400 group-hover:text-white'
                  }`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{item.label}</span>
                    <span className="text-[10px] opacity-40 font-medium line-clamp-1">{item.sub}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-12">
          {/* Navbar Settings Section */}
          <section id="navbar-section" className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-10 scroll-mt-32 transition-all duration-500 hover:border-white/10">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Navbar Settings</h2>
              <p className="text-sm text-muted-foreground/60">Customize your website navigation bar</p>
            </div>

            <div className="space-y-8">
              {/* Sticky Navbar */}
              <div className="flex items-center justify-between group py-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">Sticky Navbar</span>
                  <span className="text-[11px] text-muted-foreground/40 italic">Enable sticky navigation on scroll</span>
                </div>
                <button 
                  onClick={() => setStickyNavbar(!stickyNavbar)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    stickyNavbar ? 'bg-[#5850ec]' : 'bg-white/10'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    stickyNavbar ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Menu Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white/90">Menu Items</label>
                  <button className="flex items-center gap-1.5 text-xs font-black text-[#5850ec] uppercase tracking-widest hover:underline">
                    <Plus className="w-3.5 h-3.5" />
                    Add Menu Item
                  </button>
                </div>
                <div className="border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                  {['Home', 'Recipes', 'Categories', 'About Us', 'Contact'].map((item) => (
                    <div key={item} className="flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group">
                      <div className="flex items-center gap-4">
                        <GripVertical className="w-4 h-4 text-muted-foreground/20 group-hover:text-muted-foreground/60 cursor-grab" />
                        <span className="text-[13px] font-bold text-white/80 group-hover:text-white transition-colors">{item}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <select className="appearance-none bg-transparent text-[11px] font-bold text-muted-foreground/60 hover:text-white focus:outline-none cursor-pointer pr-5">
                            <option>Visible</option>
                            <option>Hidden</option>
                          </select>
                          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                        </div>
                        <button className="p-1.5 hover:bg-red-500/10 text-muted-foreground/20 hover:text-red-500 transition-all rounded-md">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Logos Settings Section */}
          <section id="logos-section" className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-10 scroll-mt-32 transition-all duration-500 hover:border-white/10">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Logos & Icons</h2>
              <p className="text-sm text-muted-foreground/60">Manage your brand assets and touch icons</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { label: 'Favicon', size: '32x32px PNG' },
                { label: 'Apple Touch Icon', size: '180x180px PNG' },
                { label: 'Site Logo (Footer)', size: '200x60px PNG', logo: true },
              ].map((logo) => (
                <div key={logo.label} className="space-y-3">
                  <label className="text-xs font-black text-white/60 uppercase tracking-widest">{logo.label}</label>
                  <div className={`aspect-video rounded-2xl bg-white border border-black/5 flex items-center justify-center p-4 relative group overflow-hidden`}>
                    <div className="flex items-center gap-1">
                      <ChefHat className="w-5 h-5 text-black" />
                      {logo.logo && <span className="text-[15px] font-black text-black">Tasty<span className="text-[#f59e0b]">Recipes</span></span>}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button className="p-2 bg-white text-black rounded-lg shadow-xl"><Upload className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold rounded-lg border border-white/10 transition-all">
                      Change
                    </button>
                    <button className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all border border-red-500/20">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/40 italic">Recommended: {logo.size}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Hero Section Settings */}
          <section id="hero-section" className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-10 scroll-mt-32 transition-all duration-500 hover:border-white/10">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Hero Section</h2>
              <p className="text-sm text-muted-foreground/60">Customize the main hero area of your homepage</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-white/90">Main Title</label>
                  <input 
                    type="text" 
                    defaultValue="Delicious recipes for everyone"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-white/90">Accent Text</label>
                  <input 
                    type="text" 
                    defaultValue="Explore thousands of recipes"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50 transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-bold text-white/90">Description</label>
                <textarea 
                  rows={4}
                  defaultValue="Explore thousands of handpicked recipes from around the world and share your culinary journey."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50 transition-all resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-white/90">Background Image</label>
                <div className="w-full h-48 bg-white/5 border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center gap-3 hover:border-[#5850ec]/50 hover:bg-[#5850ec]/5 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-slate-400" />
                  </div>
                  <span className="text-xs font-bold text-white/60">Click to upload hero background</span>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Settings Section */}
          <section id="footer-section" className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-10 scroll-mt-32 transition-all duration-500 hover:border-white/10 pb-12">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Footer Settings</h2>
              <p className="text-sm text-muted-foreground/60">Manage footer content and widgets</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* About Text */}
              <div className="lg:col-span-1 space-y-4">
                 <label className="text-xs font-black text-white/60 uppercase tracking-widest">About Text</label>
                 <textarea rows={6} className="w-full bg-background border border-white/5 rounded-xl p-4 text-[12px] font-medium text-muted-foreground leading-relaxed focus:ring-1 focus:ring-[#5850ec] resize-none" defaultValue="Tasty Recipes is your go-to place for discovering and sharing delicious homemade recipes." />
              </div>

              {/* Column 1: Explore */}
              <div className="space-y-4">
                 <label className="text-xs font-black text-[#5850ec] uppercase tracking-widest">Explore Links</label>
                 <div className="space-y-2">
                    {['All Recipes', 'Categories', 'Meal Plans', 'Popular Recipes', 'Latest Recipes'].map(link => (
                      <div key={link} className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg border border-white/5 group">
                        <span className="text-[11px] font-bold text-white/70 group-hover:text-white transition-colors">{link}</span>
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground/20 hover:text-red-500 cursor-pointer transition-colors" />
                      </div>
                    ))}
                    <button className="flex items-center gap-1 text-[10px] font-black text-[#5850ec] uppercase tracking-widest pt-2 hover:underline">+ Add Link</button>
                 </div>
              </div>

              {/* Column 2: Information */}
              <div className="space-y-4">
                 <label className="text-xs font-black text-[#5850ec] uppercase tracking-widest">Information Links</label>
                 <div className="space-y-2">
                    {['About Us', 'Contact Us', 'Privacy Policy', 'Terms & Conditions', 'FAQ'].map(link => (
                      <div key={link} className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg border border-white/5 group">
                        <span className="text-[11px] font-bold text-white/70 group-hover:text-white transition-colors">{link}</span>
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground/20 hover:text-red-500 cursor-pointer transition-colors" />
                      </div>
                    ))}
                    <button className="flex items-center gap-1 text-[10px] font-black text-[#5850ec] uppercase tracking-widest pt-2 hover:underline">+ Add Link</button>
                 </div>
              </div>

              {/* Column 3: Support */}
              <div className="space-y-4">
                 <label className="text-xs font-black text-[#5850ec] uppercase tracking-widest">Support Links</label>
                 <div className="space-y-2">
                    {['Help Center', 'Submit a Recipe', 'Community', 'Advertise with Us'].map(link => (
                      <div key={link} className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg border border-white/5 group">
                        <span className="text-[11px] font-bold text-white/70 group-hover:text-white transition-colors">{link}</span>
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground/20 hover:text-red-500 cursor-pointer transition-colors" />
                      </div>
                    ))}
                    <button className="flex items-center gap-1 text-[10px] font-black text-[#5850ec] uppercase tracking-widest pt-2 hover:underline">+ Add Link</button>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
              {/* Social Links */}
              <div className="space-y-4">
                 <label className="text-xs font-black text-white/60 uppercase tracking-widest">Social Links</label>
                 <div className="flex flex-wrap gap-4">
                    {[
                      { name: 'Facebook', icon: Globe, color: 'text-blue-500' },
                      { name: 'Instagram', icon: Share2, color: 'text-pink-500' },
                      { name: 'Pinterest', icon: Mail, color: 'text-red-500' },
                      { name: 'YouTube', icon: LinkIcon, color: 'text-red-600' },
                    ].map(social => (
                      <div key={social.name} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 group hover:border-[#5850ec]/30 transition-all">
                        <social.icon className={`w-4 h-4 ${social.color}`} />
                        <span className="text-[11px] font-bold text-white/70 group-hover:text-white transition-colors">{social.name}</span>
                        <X className="w-3 h-3 text-muted-foreground/20 hover:text-red-500 cursor-pointer transition-colors" />
                      </div>
                    ))}
                    <button className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-dashed border-white/10 rounded-2xl text-[10px] font-black text-[#5850ec] uppercase tracking-widest hover:bg-[#5850ec]/5 transition-all">
                      <Plus className="w-3 h-3" />
                      Add Social Link
                    </button>
                 </div>
              </div>

              {/* Copyright */}
              <div className="space-y-4">
                 <label className="text-xs font-black text-white/60 uppercase tracking-widest">Copyright Text</label>
                 <textarea rows={4} className="w-full bg-background border border-white/5 rounded-xl p-4 text-[12px] font-medium text-muted-foreground leading-relaxed focus:ring-1 focus:ring-[#5850ec] resize-none" defaultValue="© {year} Tasty Recipes. All rights reserved." />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ChefHat(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M17 21h-10a2 2 0 0 1 -2 -2v-9a5 5 0 0 1 10 0v9a2 2 0 0 1 -2 2z"/>
      <path d="M5 10c0 -3 3 -3 3 -3a3 3 0 0 1 6 0s3 0 3 3"/>
      <path d="M12 21v-4"/>
    </svg>
  );
}
