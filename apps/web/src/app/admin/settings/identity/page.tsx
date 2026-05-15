'use client';

import { useState, useEffect } from 'react';
import { 
  Save, Layout, ImageIcon, Type, Columns, 
  Plus, Trash2, ChevronDown, Monitor, 
  Smartphone, Upload, X, Check, GripVertical,
  Globe, Share2, Mail, Link as LinkIcon, Loader2,
  ChevronUp
} from 'lucide-react';
import { Reorder } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  useGetSiteSettingsQuery, 
  useUpdateSiteSettingsMutation,
  useGetHeroSettingsQuery,
  useUpdateHeroSettingsMutation
} from '@/store/api/settingsApi';
import { useUploadImageMutation } from '@/store/api/recipeApi';

export default function SiteIdentityPage() {
  const [activeSection, setActiveSection] = useState('navbar');
  const [mounted, setMounted] = useState(false);
  
  // Site Settings state
  const { data: settings, isLoading: isLoadingSettings } = useGetSiteSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSiteSettingsMutation();
  const { data: heroSettings, isLoading: isLoadingHero } = useGetHeroSettingsQuery();
  const [updateHeroSettings, { isLoading: isUpdatingHero }] = useUpdateHeroSettingsMutation();
  const [uploadImage] = useUploadImageMutation();

  const [formData, setFormData] = useState<any>({
    brandName: '',
    tagline: '',
    stickyNavbar: true,
    showSearchBar: true,
    showAuthButtons: true,
    showTopBar: true,
    logoUrl: '',
    menuItems: [],
    profileMenu: [],
    socialLinks: [],
    copyrightText: '',
    aboutText: '',
    aboutText: '',
  });

  const [heroFormData, setHeroFormData] = useState<any>({
    imageUrl: '',
    title: '',
    subtitle: '',
    ctaText: ''
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        brandName: settings.brandName || 'Tasteful',
        tagline: settings.tagline || 'Delicious Recipes',
        stickyNavbar: settings.stickyNavbar ?? true,
        showSearchBar: settings.showSearchBar ?? true,
        showAuthButtons: settings.showAuthButtons ?? true,
        showTopBar: settings.showTopBar ?? true,
        logoUrl: settings.logoUrl || '',
        menuItems: (settings.menuItems || []).map((m: any, i: number) => ({ 
          ...m, 
          id: m.id || `menu-${i}-${Math.random().toString(36).substring(2, 11)}` 
        })),
        profileMenu: settings.profileMenu || [],
        socialLinks: settings.socialLinks || [],
        copyrightText: settings.copyrightText || '© {year} Tasteful. All rights reserved.',
        aboutText: settings.aboutText || '',
      });
    }
  }, [settings]);

  useEffect(() => {
    if (heroSettings) {
      setHeroFormData({
        imageUrl: heroSettings.imageUrl || '',
        title: heroSettings.title || '',
        subtitle: heroSettings.subtitle || '',
        ctaText: heroSettings.ctaText || ''
      });
    }
  }, [heroSettings]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async () => {
    try {
      // Remove temporary IDs before saving
      const dataToSave = {
        ...formData,
        menuItems: formData.menuItems.map(({ id, ...rest }: any) => rest)
      };
      await Promise.all([
        updateSettings(dataToSave).unwrap(),
        updateHeroSettings(heroFormData).unwrap()
      ]);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);
    try {
      const result = await uploadImage(data).unwrap();
      setFormData({ ...formData, logoUrl: result.imageUrl });
    } catch (err) {
      console.error('Failed to upload logo:', err);
    }
  };

  const updateMenuItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.menuItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, menuItems: newItems });
  };

  const addMenuItem = () => {
    setFormData({
      ...formData,
      menuItems: [...formData.menuItems, { 
        id: `menu-new-${Math.random().toString(36).substring(2, 11)}`, 
        label: 'New Link', 
        url: '#', 
        visible: true 
      }]
    });
  };

  const moveMenuItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...formData.menuItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setFormData({ ...formData, menuItems: newItems });
  };

  const removeMenuItem = (index: number) => {
    const newItems = formData.menuItems.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, menuItems: newItems });
  };

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
        <button 
          onClick={handleSave}
          disabled={isUpdating || isUpdatingHero}
          className="flex items-center gap-2 px-8 py-2.5 bg-[#5850ec] hover:bg-[#4d45d1] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#5850ec]/40 active:scale-95 disabled:opacity-50"
        >
          {(isUpdating || isUpdatingHero) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{(isUpdating || isUpdatingHero) ? 'Saving...' : 'Save Changes'}</span>
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
              <p className="text-sm text-muted-foreground/60">Customize your website navigation bar — logo, menu, search, and auth buttons</p>
            </div>

            <div className="space-y-8">
              {/* Logo Upload */}
              <div className="space-y-4">
                <label className="text-xs font-black text-white/60 uppercase tracking-widest">Navbar Logo</label>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden group hover:border-[#5850ec]/50 transition-all cursor-pointer relative">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="text-muted-foreground/20 font-black text-2xl uppercase">Logo</div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      id="logo-upload"
                      className="hidden"
                      onChange={handleLogoUpload}
                      accept="image/*"
                    />
                    <button 
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold rounded-lg border border-white/10 transition-all"
                    >
                      Change Logo
                    </button>
                    <p className="text-[10px] text-muted-foreground/40 italic">Recommended: 200×200px PNG or SVG</p>
                  </div>
                </div>
              </div>

              {/* Toggle Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Sticky Navbar', desc: 'Keep navbar fixed on scroll', state: formData.stickyNavbar, toggle: () => setFormData({...formData, stickyNavbar: !formData.stickyNavbar}) },
                  { label: 'Search Bar', desc: 'Show search input in navbar', state: formData.showSearchBar, toggle: () => setFormData({...formData, showSearchBar: !formData.showSearchBar}) },
                  { label: 'Auth Buttons', desc: 'Show Login & Register buttons', state: formData.showAuthButtons, toggle: () => setFormData({...formData, showAuthButtons: !formData.showAuthButtons}) },
                  { label: 'Top Bar', desc: 'Show the announcement top bar', state: formData.showTopBar, toggle: () => setFormData({...formData, showTopBar: !formData.showTopBar}) },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground/40">{item.desc}</span>
                    </div>
                    <button
                      onClick={item.toggle}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        item.state ? 'bg-[#5850ec]' : 'bg-white/10'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        item.state ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Brand Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-white/90">Brand Name</label>
                  <input 
                    type="text" 
                    value={formData.brandName} 
                    onChange={(e) => setFormData({...formData, brandName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50 transition-all" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-white/90">Tagline</label>
                  <input 
                    type="text" 
                    value={formData.tagline} 
                    onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50 transition-all" 
                  />
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white/90">Menu Items</label>
                  <button 
                    onClick={addMenuItem}
                    className="flex items-center gap-1.5 text-xs font-black text-[#5850ec] uppercase tracking-widest hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Menu Item
                  </button>
                </div>
                <div className="border border-white/5 rounded-2xl overflow-hidden">
                  <Reorder.Group 
                    axis="y" 
                    values={formData.menuItems} 
                    onReorder={(newOrder) => setFormData({ ...formData, menuItems: newOrder })}
                    className="divide-y divide-white/5"
                  >
                    {formData.menuItems.map((item: any, idx: number) => (
                      <Reorder.Item 
                        key={item.id} 
                        value={item}
                        className="flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <GripVertical className="w-4 h-4 text-muted-foreground/20 group-hover:text-muted-foreground/60" />
                          <div className="flex flex-col sm:flex-row gap-3 flex-1">
                            <input 
                              type="text" 
                              value={item.label} 
                              onChange={(e) => updateMenuItem(idx, 'label', e.target.value)}
                              className="bg-transparent border-none outline-none text-[13px] font-bold text-white/80 group-hover:text-white transition-colors min-w-[120px]" 
                            />
                            <input 
                              type="text" 
                              value={item.url} 
                              onChange={(e) => updateMenuItem(idx, 'url', e.target.value)}
                              className="bg-transparent border-none outline-none text-[11px] text-muted-foreground/40 font-medium" 
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="relative">
                            <select 
                              value={item.visible ? 'Visible' : 'Hidden'}
                              onChange={(e) => updateMenuItem(idx, 'visible', e.target.value === 'Visible')}
                              className="appearance-none bg-transparent text-[11px] font-bold text-muted-foreground/60 hover:text-white focus:outline-none cursor-pointer pr-5"
                            >
                              <option value="Visible">Visible</option>
                              <option value="Hidden">Hidden</option>
                            </select>
                            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                          </div>
                          <button 
                            onClick={() => removeMenuItem(idx)}
                            className="p-1.5 hover:bg-red-500/10 text-muted-foreground/20 hover:text-red-500 transition-all rounded-md"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </div>
              </div>

              {/* Profile Dropdown Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white/90">Profile Dropdown Items</label>
                  <button className="flex items-center gap-1.5 text-xs font-black text-[#5850ec] uppercase tracking-widest hover:underline">
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                  </button>
                </div>
                <div className="border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                  {['My Recipes', 'Favorites', 'Saved', 'Settings'].map((item) => (
                    <div key={item} className="flex items-center justify-between p-4 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group">
                      <div className="flex items-center gap-4">
                        <GripVertical className="w-4 h-4 text-muted-foreground/20 group-hover:text-muted-foreground/60 cursor-grab" />
                        <span className="text-[13px] font-bold text-white/80 group-hover:text-white transition-colors">{item}</span>
                      </div>
                      <button className="p-1.5 hover:bg-red-500/10 text-muted-foreground/20 hover:text-red-500 transition-all rounded-md">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
                { label: 'Favicon', size: '32x32px PNG', key: 'faviconUrl' },
                { label: 'Site Logo (Footer)', size: '200x60px PNG', key: 'footerLogoUrl', logo: true },
              ].map((logo) => (
                <div key={logo.label} className="space-y-3">
                  <label className="text-xs font-black text-white/60 uppercase tracking-widest">{logo.label}</label>
                  <div className={`aspect-video rounded-2xl bg-white border border-black/5 flex items-center justify-center p-4 relative group overflow-hidden`}>
                    {formData[logo.key] ? (
                      <img src={formData[logo.key]} alt={logo.label} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <div className="flex items-center gap-1">
                        <ChefHat className="w-5 h-5 text-black" />
                        {logo.logo && <span className="text-[15px] font-black text-black">{formData.brandName}</span>}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = async (e: any) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const data = new FormData();
                              data.append('image', file);
                              const res = await uploadImage(data).unwrap();
                              setFormData({ ...formData, [logo.key]: res.imageUrl });
                            };
                            input.click();
                          }}
                          className="p-2 bg-white text-black rounded-lg shadow-xl"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = async (e: any) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const data = new FormData();
                          data.append('image', file);
                          const res = await uploadImage(data).unwrap();
                          setFormData({ ...formData, [logo.key]: res.imageUrl });
                        };
                        input.click();
                      }}
                      className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold rounded-lg border border-white/10 transition-all"
                    >
                      Change
                    </button>
                    <button 
                      onClick={() => setFormData({ ...formData, [logo.key]: '' })}
                      className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                    >
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
              <h2 className="text-xl font-bold text-white mb-1">Hero Section Settings</h2>
              <p className="text-sm text-muted-foreground/60">Manage the hero banner image displayed on the homepage</p>
            </div>

            <div className="space-y-6">
              {/* Banner Upload / URL */}
              <div className="space-y-4">
                <label className="text-xs font-black text-white/60 uppercase tracking-widest">Hero Banner Image</label>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="w-full md:w-1/2 aspect-[21/9] rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden group hover:border-[#5850ec]/50 transition-all cursor-pointer relative">
                    {heroFormData.imageUrl ? (
                      <img src={heroFormData.imageUrl} alt="Hero Banner" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = async (e: any) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const data = new FormData();
                            data.append('image', file);
                            const res = await uploadImage(data).unwrap();
                            setHeroFormData({ ...heroFormData, imageUrl: res.imageUrl });
                          };
                          input.click();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black text-[11px] font-bold rounded-lg shadow-xl"
                      >
                        <Upload className="w-4 h-4" /> Upload New
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Or provide an image URL</label>
                      <input 
                        type="text" 
                        value={heroFormData.imageUrl}
                        onChange={(e) => setHeroFormData({ ...heroFormData, imageUrl: e.target.value })}
                        placeholder="https://example.com/banner.jpg"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50 transition-all" 
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-[#5850ec]/10 text-[#5850ec] border border-[#5850ec]/20 rounded text-[10px] font-black tracking-widest">
                        1920px × 500px
                      </span>
                      <span className="text-[10px] text-muted-foreground/40 italic">
                        Recommended Resolution
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Footer Settings Section */}
          <section id="footer-section" className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-10 scroll-mt-32 transition-all duration-500 hover:border-white/10 pb-12">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Footer Settings</h2>
              <p className="text-sm text-muted-foreground/60">Manage footer content and copyright</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                 <label className="text-xs font-black text-white/60 uppercase tracking-widest">About Text (Footer)</label>
                 <textarea 
                  rows={4} 
                  value={formData.aboutText}
                  onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                  className="w-full bg-background border border-white/5 rounded-xl p-4 text-[12px] font-medium text-muted-foreground leading-relaxed focus:ring-1 focus:ring-[#5850ec] resize-none" 
                  placeholder="Tell something about your site..."
                />
              </div>

              <div className="space-y-4">
                 <label className="text-xs font-black text-white/60 uppercase tracking-widest">Copyright Text</label>
                 <textarea 
                  rows={2} 
                  value={formData.copyrightText}
                  onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
                  className="w-full bg-background border border-white/5 rounded-xl p-4 text-[12px] font-medium text-muted-foreground leading-relaxed focus:ring-1 focus:ring-[#5850ec] resize-none" 
                />
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
