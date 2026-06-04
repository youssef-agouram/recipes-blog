'use client';

import { useState, useEffect } from 'react';
import { 
  Save, Layout, ImageIcon, Type, Columns,
  Plus, Trash2, ChevronDown, Monitor, 
  Smartphone, Upload, X, Check, GripVertical,
  Globe, Share2, Mail, Link as LinkIcon, Loader2,
  ChevronUp, Eye, EyeOff
} from 'lucide-react';
import { Reorder } from 'framer-motion';
import Link from 'next/link';
import { 
  useGetSiteSettingsQuery, 
  useUpdateSiteSettingsMutation,
  useGetHeroSettingsQuery,
  useUpdateHeroSettingsMutation
} from '@/store/api/settingsApi';
import { useUploadImageMutation } from '@/store/api/recipeApi';
import { toast } from 'sonner';

export default function SiteIdentityPage() {
  const [activeSection, setActiveSection] = useState('navbar');
  const [mounted, setMounted] = useState(false);
  
  // Settings API hooks
  const { data: settings, isLoading: isLoadingSettings } = useGetSiteSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSiteSettingsMutation();
  const { data: heroSettings, isLoading: isLoadingHero } = useGetHeroSettingsQuery();
  const [updateHeroSettings, { isLoading: isUpdatingHero }] = useUpdateHeroSettingsMutation();
  const [uploadImage] = useUploadImageMutation();

  // Site Identity State
  const [formData, setFormData] = useState<any>({
    brandName: '',
    brandPart1: '',
    brandPart2: '',
    brandColor1: '',
    brandColor2: '',
    tagline: '',
    stickyNavbar: true,
    showSearchBar: true,
    showAuthButtons: true,
    showTopBar: true,
    logoUrl: '',
    faviconUrl: '',
    footerLogoUrl: '',
    menuItems: [],
    profileMenu: [],
    socialLinks: [],
    copyrightText: '',
    aboutText: '',
    adSettings: {
      showTopBarAd: false,
      showBottomBarAd: false,
      showPopupAd: false,
      topBarAdLink: '',
      bottomBarVideoLink: '',
      popupAdLink: '',
      topBarAdUrls: [],
      bottomBarVideoUrls: [],
      popupAdImageUrls: [],
    }
  });

  // Hero Section State
  const [heroFormData, setHeroFormData] = useState<any>({
    imageUrl: '',
    title: '',
    subtitle: '',
    ctaText: '',
    images: []
  });

  useEffect(() => {
    if (settings) {
      const rawAds = settings.adSettings || {};
      
      const parseAdList = (urls: any, fallbackUrl: string) => {
        let list: any[] = [];
        if (Array.isArray(urls)) {
          list = urls.map((item: any, i: number) => {
            if (typeof item === 'object' && item !== null && 'url' in item) {
              return {
                id: `ad-${i}-${Math.random().toString(36).substring(2, 9)}`,
                url: item.url || '',
                enabled: item.enabled !== false,
                clickUrl: item.clickUrl || ''
              };
            }
            return {
              id: `ad-${i}-${Math.random().toString(36).substring(2, 9)}`,
              url: String(item || ''),
              enabled: true,
              clickUrl: ''
            };
          });
        } else if (typeof urls === 'string' && urls.trim()) {
          list = urls.split(',').map((u, i) => ({
            id: `ad-${i}-${Math.random().toString(36).substring(2, 9)}`,
            url: u.trim(),
            enabled: true,
            clickUrl: ''
          }));
        }
        
        if (list.length === 0 && typeof fallbackUrl === 'string' && fallbackUrl.trim()) {
          list = [{
            id: `ad-0-${Math.random().toString(36).substring(2, 9)}`,
            url: fallbackUrl.trim(),
            enabled: true,
            clickUrl: ''
          }];
        }
        
        if (list.length === 0) {
          list = [{
            id: `ad-new-${Math.random().toString(36).substring(2, 9)}`,
            url: '',
            enabled: false,
            clickUrl: ''
          }];
        }
        
        return list;
      };

      setFormData({
        brandName: settings.brandName || 'Tasteful',
        brandPart1: settings.brandPart1 || settings.brandName?.substring(0, Math.max(0, settings.brandName.length - 3)) || 'Taste',
        brandPart2: settings.brandPart2 || settings.brandName?.substring(Math.max(0, settings.brandName.length - 3)) || 'ful',
        brandColor1: settings.brandColor1 || '#ffffff',
        brandColor2: settings.brandColor2 || '#f29e1f',
        tagline: settings.tagline || 'Delicious Recipes',
        stickyNavbar: settings.stickyNavbar ?? true,
        showSearchBar: settings.showSearchBar ?? true,
        showAuthButtons: settings.showAuthButtons ?? true,
        showTopBar: settings.showTopBar ?? true,
        logoUrl: settings.logoUrl || '',
        faviconUrl: settings.faviconUrl || '',
        footerLogoUrl: settings.footerLogoUrl || '',
        menuItems: (settings.menuItems || []).map((m: any, i: number) => ({ 
          ...m, 
          id: m.id || `menu-${i}-${Math.random().toString(36).substring(2, 11)}` 
        })),
        profileMenu: settings.profileMenu || [],
        socialLinks: settings.socialLinks || [],
        copyrightText: settings.copyrightText || '© {year} Tasteful. All rights reserved.',
        aboutText: settings.aboutText || '',
        adSettings: {
          showTopBarAd: rawAds.showTopBarAd ?? false,
          showBottomBarAd: rawAds.showBottomBarAd ?? false,
          showPopupAd: rawAds.showPopupAd ?? false,
          topBarAdLink: rawAds.topBarAdLink || '',
          bottomBarVideoLink: rawAds.bottomBarVideoLink || '',
          popupAdLink: rawAds.popupAdLink || '',
          topBarAdUrls: parseAdList(rawAds.topBarAdUrls, rawAds.topBarAdUrl),
          bottomBarVideoUrls: parseAdList(rawAds.bottomBarVideoUrls, rawAds.bottomBarVideoUrl),
          popupAdImageUrls: parseAdList(rawAds.popupAdImageUrls, rawAds.popupAdImageUrl),
        }
      });
    }
  }, [settings]);

  useEffect(() => {
    if (heroSettings) {
      const list = (heroSettings.images || []).map((imgUrl: string, idx: number) => ({
        id: `hero-${idx}-${Math.random().toString(36).substring(2, 9)}`,
        url: imgUrl
      }));
      
      if (list.length === 0 && heroSettings.imageUrl) {
        list.push({
          id: `hero-0-${Math.random().toString(36).substring(2, 9)}`,
          url: heroSettings.imageUrl
        });
      }

      if (list.length === 0) {
        list.push({
          id: `hero-new-${Math.random().toString(36).substring(2, 9)}`,
          url: ''
        });
      }

      setHeroFormData({
        imageUrl: heroSettings.imageUrl || '',
        title: heroSettings.title || '',
        subtitle: heroSettings.subtitle || '',
        ctaText: heroSettings.ctaText || '',
        images: list
      });
    }
  }, [heroSettings]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async () => {
    try {
      const serializedMenuItems = (formData.menuItems || []).map(({ id, ...rest }: any) => rest);
      
      const serializeAdList = (list: any[]) => {
        if (!Array.isArray(list)) return [];
        return list
          .filter(item => item?.url?.trim() !== '')
          .map(item => ({
            url: item?.url?.trim() || '',
            enabled: item?.enabled !== false,
            clickUrl: item?.clickUrl ? item.clickUrl.trim() : ''
          }));
      };

      const adSettings = formData.adSettings || {};

      const finalAdSettings = {
        showTopBarAd: !!adSettings.showTopBarAd,
        showBottomBarAd: !!adSettings.showBottomBarAd,
        showPopupAd: !!adSettings.showPopupAd,
        topBarAdLink: adSettings.topBarAdLink?.trim() || '',
        bottomBarVideoLink: adSettings.bottomBarVideoLink?.trim() || '',
        popupAdLink: adSettings.popupAdLink?.trim() || '',
        topBarAdUrls: serializeAdList(adSettings.topBarAdUrls),
        bottomBarVideoUrls: serializeAdList(adSettings.bottomBarVideoUrls),
        popupAdImageUrls: serializeAdList(adSettings.popupAdImageUrls),
        topBarAdUrl: serializeAdList(adSettings.topBarAdUrls).find(item => item.enabled)?.url || '',
        bottomBarVideoUrl: serializeAdList(adSettings.bottomBarVideoUrls).find(item => item.enabled)?.url || '',
        popupAdImageUrl: serializeAdList(adSettings.popupAdImageUrls).find(item => item.enabled)?.url || '',
      };

      const siteSettingsPayload = {
        ...formData,
        brandName: (formData.brandPart1 || '') + (formData.brandPart2 || ''),
        menuItems: serializedMenuItems,
        adSettings: finalAdSettings
      };

      const heroImagesArray = (heroFormData.images || [])
        .map((item: any) => item?.url?.trim() || '')
        .filter((url: string) => url !== '');

      const heroSettingsPayload = {
        title: heroFormData.title || '',
        subtitle: heroFormData.subtitle || '',
        ctaText: heroFormData.ctaText || '',
        imageUrl: heroImagesArray[0] || '',
        images: heroImagesArray
      };

      await Promise.all([
        updateSettings(siteSettingsPayload).unwrap(),
        updateHeroSettings(heroSettingsPayload).unwrap()
      ]);
      
      toast.success('Settings saved successfully!');
    } catch (err: any) {
      console.error('Failed to save settings:', err?.message || err);
      console.error(err?.stack);
      toast.error('Error saving settings: ' + (err?.message || JSON.stringify(err)));
    }
  };

  const handleAssetUpload = async (field: 'logoUrl' | 'faviconUrl' | 'footerLogoUrl', file: File) => {
    const data = new FormData();
    data.append('image', file);
    try {
      const result = await uploadImage(data).unwrap();
      setFormData((prev: any) => ({ ...prev, [field]: result.imageUrl }));
    } catch (err) {
      console.error(`Failed to upload ${field}:`, err);
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

  const removeMenuItem = (index: number) => {
    const newItems = formData.menuItems.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, menuItems: newItems });
  };

  // Hero Image Slider Handlers
  const addHeroImage = () => {
    setHeroFormData({
      ...heroFormData,
      images: [...heroFormData.images, { id: `hero-new-${Math.random().toString(36).substring(2, 9)}`, url: '' }]
    });
  };

  const removeHeroImage = (id: string) => {
    const filtered = heroFormData.images.filter((img: any) => img.id !== id);
    if (filtered.length === 0) {
      filtered.push({ id: `hero-new-${Math.random().toString(36).substring(2, 9)}`, url: '' });
    }
    setHeroFormData({ ...heroFormData, images: filtered });
  };

  const updateHeroImage = (id: string, value: string) => {
    const updated = heroFormData.images.map((img: any) => {
      if (img.id === id) return { ...img, url: value };
      return img;
    });
    setHeroFormData({ ...heroFormData, images: updated });
  };

  // Advertisements Playlist Handlers
  const addAdItem = (key: 'topBarAdUrls' | 'bottomBarVideoUrls' | 'popupAdImageUrls') => {
    const newList = [
      ...formData.adSettings[key],
      {
        id: `ad-new-${Math.random().toString(36).substring(2, 9)}`,
        url: '',
        enabled: false,
        clickUrl: ''
      }
    ];
    setFormData({
      ...formData,
      adSettings: {
        ...formData.adSettings,
        [key]: newList
      }
    });
  };

  const removeAdItem = (key: 'topBarAdUrls' | 'bottomBarVideoUrls' | 'popupAdImageUrls', id: string) => {
    const filtered = formData.adSettings[key].filter((item: any) => item.id !== id);
    if (filtered.length === 0) {
      filtered.push({
        id: `ad-new-${Math.random().toString(36).substring(2, 9)}`,
        url: '',
        enabled: false,
        clickUrl: ''
      });
    }
    setFormData({
      ...formData,
      adSettings: {
        ...formData.adSettings,
        [key]: filtered
      }
    });
  };

  const updateAdItem = (key: 'topBarAdUrls' | 'bottomBarVideoUrls' | 'popupAdImageUrls', id: string, field: 'url' | 'enabled' | 'clickUrl', value: any) => {
    const updated = formData.adSettings[key].map((item: any) => {
      if (item.id === id) {
        if (field === 'url' && !value.trim()) {
          return { ...item, [field]: value, enabled: false };
        }
        if (field === 'enabled' && value && !item.url.trim()) {
          return item; // Block enabling empty URLs
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    setFormData({
      ...formData,
      adSettings: {
        ...formData.adSettings,
        [key]: updated
      }
    });
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(`${id}-section`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sections = [
    { id: 'navbar', label: 'Navbar Settings', sub: 'Logo, menu, search & top bar', icon: Layout },
    { id: 'hero', label: 'Hero Slider', sub: 'Manage dynamic hero slider', icon: Type },
    { id: 'ads', label: 'Advertisements', sub: 'Top/bottom bars and popup ads', icon: Share2 },
    { id: 'footer', label: 'Footer Settings', sub: 'About description & copyright', icon: Columns },
  ];

  const renderUrlList = (label: string, urlsKey: 'topBarAdUrls' | 'bottomBarVideoUrls' | 'popupAdImageUrls') => {
    const list = formData.adSettings[urlsKey] || [];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-white/60 uppercase tracking-widest">{label}</label>
          <button 
            type="button"
            onClick={() => addAdItem(urlsKey)}
            className="flex items-center gap-1.5 text-xs font-black text-[#5850ec] uppercase tracking-widest hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            Add URL
          </button>
        </div>

        <div className="space-y-4">
          {list.map((item: any, idx: number) => {
            const isUrlEmpty = !item.url.trim();
            
            return (
              <div 
                key={item.id} 
                className={`flex flex-col gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl transition-all ${
                  !item.enabled ? 'opacity-50' : 'opacity-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    #{idx + 1}
                  </span>
                  
                  <input 
                    type="text" 
                    value={item.url} 
                    onChange={(e) => updateAdItem(urlsKey, item.id, 'url', e.target.value)}
                    placeholder="Enter Ad image or video URL (e.g. YouTube, mp4)"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]/50 transition-all" 
                  />

                  <button
                    type="button"
                    onClick={() => updateAdItem(urlsKey, item.id, 'enabled', !item.enabled)}
                    disabled={isUrlEmpty}
                    className={`p-2 rounded-lg border transition-all ${
                      item.enabled 
                        ? 'bg-[#5850ec]/20 border-[#5850ec]/30 text-white shadow-lg shadow-[#5850ec]/10' 
                        : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white disabled:opacity-30 disabled:hover:text-muted-foreground'
                    }`}
                    title={isUrlEmpty ? "Provide a URL first to enable" : (item.enabled ? "Disable this URL" : "Enable this URL")}
                  >
                    {item.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button 
                    type="button"
                    onClick={() => removeAdItem(urlsKey, item.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-all rounded-lg border border-red-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Target Click Link input */}
                <div className="flex items-center gap-3 pl-8">
                  <LinkIcon className="w-3.5 h-3.5 text-white/30" />
                  <input 
                    type="text" 
                    value={item.clickUrl || ''} 
                    onChange={(e) => updateAdItem(urlsKey, item.id, 'clickUrl', e.target.value)}
                    placeholder="Target click link (optional redirect URL)"
                    className="flex-1 bg-white/[0.01] border border-white/5 rounded-xl px-4 py-1.5 text-[11px] text-white/60 focus:outline-none focus:ring-1 focus:ring-[#5850ec]/30 transition-all" 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Sticky Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-16 z-10 py-4 bg-[#05060b]/80 backdrop-blur-md border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Site Identity</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
            <Link href="/admin/settings" className="hover:text-white transition-colors">Settings</Link>
            <span className="opacity-30">&gt;</span>
            <span className="text-white/60 text-[10px]">Site Identity</span>
          </div>
        </div>
      </div>
      
      {/* Floating Save Button */}
      <button 
        onClick={handleSave}
        disabled={isUpdating || isUpdatingHero}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-8 py-4 bg-[#5850ec] hover:bg-[#4d45d1] text-white text-sm font-bold rounded-full transition-all shadow-[0_8px_30px_rgba(88,80,236,0.4)] hover:shadow-[0_12px_40px_rgba(88,80,236,0.6)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {(isUpdating || isUpdatingHero) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        <span>{(isUpdating || isUpdatingHero) ? 'Saving...' : 'Save Changes'}</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-4 sticky top-40 z-0">
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
        <div className="lg:col-span-9 grid grid-cols-1 xl:grid-cols-2 gap-8 items-start space-y-0">
          {/* Left Column: Navbar and Hero */}
          <div className="space-y-8">
            {/* Navbar Settings Section */}
            <section id="navbar-section" className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-10 scroll-mt-36 transition-all duration-500 hover:border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Navbar Settings</h2>
                <p className="text-sm text-muted-foreground/60">Customize your website navigation bar — logo, menu, search, and auth buttons</p>
              </div>

              <div className="space-y-8">
                {/* Brand Assets Upload Grid */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                      { label: 'Navbar Logo', size: '200x200px PNG or SVG', key: 'logoUrl', logo: true },
                      { label: 'Favicon', size: '32x32px PNG', key: 'faviconUrl' },
                      { label: 'Site Logo (Footer)', size: '200x60px PNG', key: 'footerLogoUrl', logo: true },
                    ].map((logo) => (
                      <div key={logo.label} className="space-y-3">
                        <label className="text-xs font-black text-white/60 uppercase tracking-widest">{logo.label}</label>
                        <div className="aspect-video rounded-2xl bg-white border border-black/5 flex items-center justify-center p-4 relative group overflow-hidden">
                          {formData[logo.key] ? (
                            <img src={formData[logo.key]} alt={logo.label} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <div className="flex items-center gap-1">
                              <ChefHat className="w-5.5 h-5.5 text-black" />
                              {logo.logo && <span className="text-[15px] font-black text-black">{formData.brandName}</span>}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              type="button"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e: any) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleAssetUpload(logo.key as any, file);
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
                            type="button"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e: any) => {
                                const file = e.target.files?.[0];
                                if (file) handleAssetUpload(logo.key as any, file);
                              };
                              input.click();
                            }}
                            className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold rounded-lg border border-white/10 transition-all"
                          >
                            Change
                          </button>
                          <button 
                            type="button"
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

                {/* Brand Identity Config (Vertical Stack to prevent wrapping/overflow) */}
                <div className="space-y-6 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-primary" style={{ color: formData.brandColor2 || '#f29e1f' }} />
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Brand Style & Identity</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Part 1 */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-widest">BN-1&C</label>
                      <div className="flex gap-4 items-center">
                        <input 
                          type="text" 
                          value={formData.brandPart1} 
                          onChange={(e) => setFormData({...formData, brandPart1: e.target.value})}
                          placeholder="Part 1 (e.g. Taste)"
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50 transition-all" 
                        />
                        {/* Custom Color Selector with Code below */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="relative w-11 h-11 rounded-xl border border-white/10 overflow-hidden bg-white/5 hover:border-white/20 transition-all flex items-center justify-center cursor-pointer group" title="Choose color for Part 1">
                            <input 
                              type="color" 
                              value={formData.brandColor1 || '#ffffff'} 
                              onChange={(e) => setFormData({...formData, brandColor1: e.target.value})}
                              className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer opacity-0 z-20"
                            />
                            <div 
                              className="w-7.5 h-7.5 rounded-lg shadow-lg border border-white/10 transition-transform group-hover:scale-105" 
                              style={{ backgroundColor: formData.brandColor1 || '#ffffff' }}
                            />
                          </div>
                          <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-wider select-all">
                            {formData.brandColor1 || '#ffffff'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Part 2 */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-widest">BN-2&C</label>
                      <div className="flex gap-4 items-center">
                        <input 
                          type="text" 
                          value={formData.brandPart2} 
                          onChange={(e) => setFormData({...formData, brandPart2: e.target.value})}
                          placeholder="Part 2 (e.g. ful)"
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50 transition-all" 
                        />
                        {/* Custom Color Selector with Code below */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="relative w-11 h-11 rounded-xl border border-white/10 overflow-hidden bg-white/5 hover:border-white/20 transition-all flex items-center justify-center cursor-pointer group" title="Choose color for Part 2">
                            <input 
                              type="color" 
                              value={formData.brandColor2 || '#f29e1f'} 
                              onChange={(e) => setFormData({...formData, brandColor2: e.target.value})}
                              className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer opacity-0 z-20"
                            />
                            <div 
                              className="w-7.5 h-7.5 rounded-lg shadow-lg border border-white/10 transition-transform group-hover:scale-105" 
                              style={{ backgroundColor: formData.brandColor2 || '#f29e1f' }}
                            />
                          </div>
                          <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-wider select-all">
                            {formData.brandColor2 || '#f29e1f'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tagline */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-widest">Tagline</label>
                      <input 
                        type="text" 
                        value={formData.tagline} 
                        onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                        placeholder="e.g. Delicious Recipes"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50 transition-all" 
                      />
                    </div>
                  </div>

                  {/* Live Preview Display (Full Width in section) */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-[22px] p-5 space-y-3.5">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Live Branding Preview</span>
                    </div>
                    
                    <div className="flex items-center gap-3.5 p-4 bg-black/40 rounded-xl border border-white/5 shadow-inner">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/20 flex items-center justify-center bg-[#0a0b14] shadow-lg shrink-0">
                        <ChefHat className="w-5.5 h-5.5 text-primary" style={{ color: formData.brandColor2 || '#f29e1f' }} />
                      </div>
                      <div className="flex flex-col leading-[1.1] min-w-0">
                        <span className="font-black text-base sm:text-lg tracking-tighter font-heading truncate">
                          <span style={{ color: formData.brandColor1 || '#ffffff' }}>{formData.brandPart1 || 'Taste'}</span>
                          <span style={{ color: formData.brandColor2 || '#f29e1f' }}>{formData.brandPart2 || 'ful'}</span>
                        </span>
                        {formData.tagline && (
                          <span className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-[0.25em] ml-0.5 truncate">
                            {formData.tagline}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-muted-foreground/30 leading-relaxed font-medium">
                      Branding updates dynamically across the Header, Footer, Admin layouts, and Login screens.
                    </p>
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
              </div>
            </section>

            {/* Hero Slider Settings */}
            <section id="hero-section" className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-10 scroll-mt-36 transition-all duration-500 hover:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Hero Section Settings</h2>
                  <p className="text-sm text-muted-foreground/60">Manage dynamic hero images and videos</p>
                </div>
                <button 
                  onClick={addHeroImage}
                  className="flex items-center gap-1.5 text-xs font-black text-[#5850ec] uppercase tracking-widest hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Slider URL
                </button>
              </div>

              <div className="space-y-6">
                {/* Hero Fields */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-white/90">Hero Title</label>
                    <input 
                      type="text" 
                      value={heroFormData.title} 
                      onChange={(e) => setHeroFormData({...heroFormData, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50 transition-all" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-white/90">Hero Subtitle</label>
                    <input 
                      type="text" 
                      value={heroFormData.subtitle} 
                      onChange={(e) => setHeroFormData({...heroFormData, subtitle: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50 transition-all" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-white/90">CTA Button Text</label>
                    <input 
                      type="text" 
                      value={heroFormData.ctaText} 
                      onChange={(e) => setHeroFormData({...heroFormData, ctaText: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50 transition-all" 
                    />
                  </div>
                </div>

                {/* Slider Image List */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <label className="text-xs font-black text-white/60 uppercase tracking-widest">Slider Images & Videos</label>
                  <div className="space-y-4">
                    {heroFormData.images.map((img: any, idx: number) => {
                      const isYouTube = img.url?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
                      const isVideo = img.url?.match(/\.(mp4|webm|ogg)(\?.*)?$/i);
                      
                      return (
                        <div key={img.id} className="flex flex-col md:flex-row items-stretch gap-4 p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                          <div className="w-full md:w-32 aspect-video rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            {img.url ? (
                              isYouTube ? (
                                <div className="text-[10px] font-black text-red-500 uppercase tracking-widest">YouTube</div>
                              ) : isVideo ? (
                                <div className="text-[10px] font-black text-[#5850ec] uppercase tracking-widest">Video</div>
                              ) : (
                                <img src={img.url} alt="Slider Image" className="w-full h-full object-cover" />
                              )
                            ) : (
                              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Empty</div>
                            )}
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-between gap-3">
                            <input 
                              type="text" 
                              value={img.url}
                              onChange={(e) => updateHeroImage(img.id, e.target.value)}
                              placeholder="Image or Video URL"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]/50 transition-all" 
                            />
                            
                            <div className="flex items-center justify-between gap-4">
                              <input 
                                type="file" 
                                id={`hero-upload-${img.id}`} 
                                className="hidden" 
                                accept="image/*,video/mp4,video/webm"
                                onChange={async (e: any) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const data = new FormData();
                                  data.append('image', file);
                                  try {
                                    const res = await uploadImage(data).unwrap();
                                    updateHeroImage(img.id, res.imageUrl);
                                  } catch (err: any) {
                                    console.error('Upload failed:', err);
                                    alert('Upload failed: ' + (err.message || JSON.stringify(err)));
                                  }
                                }}
                              />
                              <button 
                                onClick={() => document.getElementById(`hero-upload-${img.id}`)?.click()}
                                className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold rounded-lg border border-white/10 transition-all"
                              >
                                Upload Image
                              </button>
                              
                              <button 
                                onClick={() => removeHeroImage(img.id)}
                                className="p-1.5 hover:bg-red-500/10 text-red-500 hover:scale-105 transition-all rounded-lg border border-red-500/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Logos and Advertisements */}
          <div className="space-y-8">


            {/* Advertisements Settings Section */}
            <section id="ads-section" className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-10 scroll-mt-36 transition-all duration-500 hover:border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Advertisements Settings</h2>
                <p className="text-sm text-muted-foreground/60">Configure dynamic video bar and popup advertisements</p>
              </div>

              <div className="space-y-8">
                {/* 1. Top Bar Ad */}
                <div className="space-y-4 p-5 bg-white/[0.01] border border-white/5 rounded-3xl">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">Top Bar Video Ad</span>
                      <span className="text-[10px] text-muted-foreground/40">Float a video banner at the top of the homepage</span>
                    </div>
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        adSettings: { ...formData.adSettings, showTopBarAd: !formData.adSettings.showTopBarAd }
                      })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData.adSettings.showTopBarAd ? 'bg-[#5850ec]' : 'bg-white/10'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.adSettings.showTopBarAd ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  
                  {renderUrlList("Top Bar Playlist", "topBarAdUrls")}
                  
                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Global Top Bar Redirect Link</label>
                    <input 
                      type="text" 
                      value={formData.adSettings.topBarAdLink}
                      onChange={(e) => setFormData({
                        ...formData,
                        adSettings: { ...formData.adSettings, topBarAdLink: e.target.value }
                      })}
                      placeholder="https://example.com/shop"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]/50 transition-all" 
                    />
                  </div>
                </div>

                {/* 2. Bottom Bar Ad */}
                <div className="space-y-4 p-5 bg-white/[0.01] border border-white/5 rounded-3xl">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">Bottom Bar Video Ad</span>
                      <span className="text-[10px] text-muted-foreground/40">Float a video banner at the bottom of the homepage</span>
                    </div>
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        adSettings: { ...formData.adSettings, showBottomBarAd: !formData.adSettings.showBottomBarAd }
                      })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData.adSettings.showBottomBarAd ? 'bg-[#5850ec]' : 'bg-white/10'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.adSettings.showBottomBarAd ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  
                  {renderUrlList("Bottom Bar Playlist", "bottomBarVideoUrls")}
                  
                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Global Bottom Bar Redirect Link</label>
                    <input 
                      type="text" 
                      value={formData.adSettings.bottomBarVideoLink}
                      onChange={(e) => setFormData({
                        ...formData,
                        adSettings: { ...formData.adSettings, bottomBarVideoLink: e.target.value }
                      })}
                      placeholder="https://example.com/learn-more"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]/50 transition-all" 
                    />
                  </div>
                </div>

                {/* 3. Popup Ad */}
                <div className="space-y-4 p-5 bg-white/[0.01] border border-white/5 rounded-3xl">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">Popup Sponsored Ad</span>
                      <span className="text-[10px] text-muted-foreground/40">Draggable sponsored card overlay on the client homepage</span>
                    </div>
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        adSettings: { ...formData.adSettings, showPopupAd: !formData.adSettings.showPopupAd }
                      })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData.adSettings.showPopupAd ? 'bg-[#5850ec]' : 'bg-white/10'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.adSettings.showPopupAd ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  
                  {renderUrlList("Popup Playlist", "popupAdImageUrls")}
                  
                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Global Popup Redirect Link</label>
                    <input 
                      type="text" 
                      value={formData.adSettings.popupAdLink}
                      onChange={(e) => setFormData({
                        ...formData,
                        adSettings: { ...formData.adSettings, popupAdLink: e.target.value }
                      })}
                      placeholder="https://example.com/promo"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]/50 transition-all" 
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Footer Settings Section */}
          <section id="footer-section" className="xl:col-span-2 bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-10 scroll-mt-36 transition-all duration-500 hover:border-white/10 pb-12">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Footer Settings</h2>
              <p className="text-sm text-muted-foreground/60">Manage footer content and copyright</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  rows={4} 
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
