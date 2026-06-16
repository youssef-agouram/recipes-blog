'use client';

import { useState, useEffect } from 'react';
import {
  Save, Layout, Type, Columns, Plus, Trash2, ChevronDown, ChevronUp,
  Monitor, Upload, GripVertical, Share2, Link as LinkIcon, Loader2,
  Eye, EyeOff, Sparkles, ChevronRight, Image as ImageIcon,
  Play, ShieldCheck, LayoutGrid, Palette, Zap, Bell, Users, Heart
} from 'lucide-react';
import { Reorder } from 'framer-motion';
import Link from 'next/link';
import {
  useGetSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
  useGetHeroSettingsQuery,
  useUpdateHeroSettingsMutation,
} from '@/store/api/settingsApi';
import { useUploadImageMutation } from '@/store/api/recipeApi';
import { toast } from 'sonner';

// ─── tiny helpers ────────────────────────────────────────────────────────────
function ChefHat(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21h-10a2 2 0 0 1 -2 -2v-9a5 5 0 0 1 10 0v9a2 2 0 0 1 -2 2z" />
      <path d="M5 10c0 -3 3 -3 3 -3a3 3 0 0 1 6 0s3 0 3 3" />
      <path d="M12 21v-4" />
    </svg>
  );
}

/** Tiny heading for sub-groups within a section */
function GroupLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/5 text-white/40">
        {icon}
      </div>
      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.22em]">{label}</span>
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  );
}

/** Styled text input */
function Field({
  label, value, onChange, placeholder, type = 'text', textarea = false, rows = 3
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; textarea?: boolean; rows?: number;
}) {
  const cls = `w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white
    placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10
    transition-all duration-200`;
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-white/35">{label}</label>
      {textarea
        ? <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`${cls} resize-none`} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
    </div>
  );
}

/** Premium iOS-style toggle */
function Toggle({ checked, onChange, accentColor = '#5850ec' }: { checked: boolean; onChange: () => void; accentColor?: string }) {
  return (
    <button type="button" onClick={onChange}
      className="relative shrink-0 inline-flex h-7 w-13 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 focus:outline-none"
      style={{ backgroundColor: checked ? accentColor : 'rgba(255,255,255,0.1)', width: '52px' }}>
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out mt-0.5 ${checked ? 'translate-x-6' : 'translate-x-0.5'}`}
        style={{ boxShadow: checked ? `0 2px 8px ${accentColor}60` : '0 2px 4px rgba(0,0,0,0.4)' }} />
    </button>
  );
}

/** Toggle row with label and description */
function ToggleRow({ label, desc, checked, onChange, accentColor }: {
  label: string; desc: string; checked: boolean; onChange: () => void; accentColor?: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/[0.025] rounded-2xl border border-white/[0.06] hover:border-white/10 transition-all group">
      <div>
        <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{label}</p>
        <p className="text-[10px] text-white/30 mt-0.5">{desc}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} accentColor={accentColor} />
    </div>
  );
}

/** Color picker pill */
function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-white/35">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-xl border border-white/10 overflow-hidden cursor-pointer group hover:border-white/25 transition-all shrink-0">
          <input type="color" value={value || '#ffffff'} onChange={e => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          <div className="absolute inset-1.5 rounded-lg shadow-md" style={{ backgroundColor: value || '#ffffff' }} />
        </div>
        <div className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2">
          <span className="text-xs font-mono text-white/50">{(value || '#ffffff').toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}

/** Brand name + color picker row */
function BrandField({ label, textValue, onTextChange, colorValue, onColorChange, placeholder }: {
  label: string; textValue: string; onTextChange: (v: string) => void;
  colorValue: string; onColorChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-white/35">{label}</label>
      <div className="flex gap-3 items-center">
        <input type="text" value={textValue} onChange={e => onTextChange(e.target.value)} placeholder={placeholder}
          className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all" />
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="relative w-12 h-12 rounded-xl border border-white/10 overflow-hidden cursor-pointer group hover:border-white/25 transition-all">
            <input type="color" value={colorValue || '#ffffff'} onChange={e => onColorChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className="absolute inset-1.5 rounded-lg shadow-md transition-transform group-hover:scale-105" style={{ backgroundColor: colorValue || '#ffffff' }} />
          </div>
          <span className="text-[8px] font-mono text-white/25">{(colorValue || '#fff').toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}

/** Asset upload card */
function AssetCard({ label, size, imageUrl, showBrand, brandText, brandColor, onUpload, onDelete }: {
  label: string; size: string; imageUrl: string; showBrand: boolean;
  brandText: string; brandColor: string; onUpload: (f: File) => void; onDelete: () => void;
}) {
  const triggerUpload = () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = (e: any) => { const f = e.target.files?.[0]; if (f) onUpload(f); };
    inp.click();
  };
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-widest text-white/35">{label}</label>
      <div className="relative aspect-video rounded-2xl bg-white border border-black/5 overflow-hidden group flex items-center justify-center">
        {imageUrl
          ? <img src={imageUrl} alt={label} className="max-w-full max-h-full object-contain" />
          : (
            <div className="flex flex-col items-center gap-1.5 text-black/30">
              {showBrand
                ? (<div className="flex items-center gap-1"><ChefHat className="w-5 h-5" /><span className="text-sm font-black" style={{ color: brandColor || '#f29e1f' }}>{brandText || 'Brand'}</span></div>)
                : (<ImageIcon className="w-6 h-6" />)
              }
            </div>
          )
        }
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button type="button" onClick={triggerUpload} className="p-2.5 bg-white text-black rounded-xl shadow-xl hover:scale-105 transition-transform">
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={triggerUpload}
          className="flex-1 py-2 text-[11px] font-bold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
          Change
        </button>
        <button type="button" onClick={onDelete}
          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-[9px] text-white/20 italic">Recommended: {size}</p>
    </div>
  );
}

/** Section wrapper with gradient header */
function SectionPanel({ id, gradient, bgGlow, icon, title, desc, children }: {
  id: string; gradient: string; bgGlow: string; icon: React.ReactNode;
  title: string; desc: string; children: React.ReactNode;
}) {
  return (
    <section id={`${id}-section`} className="scroll-mt-36 rounded-3xl overflow-hidden border border-white/[0.07] bg-[#08090f] shadow-2xl">
      {/* Header */}
      <div className={`relative p-6 bg-gradient-to-br ${gradient} border-b border-white/[0.07] overflow-hidden`}>
        <div className={`absolute -right-10 -top-10 w-44 h-44 ${bgGlow} rounded-full blur-3xl`} />
        <div className="absolute right-24 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
            {icon}
          </div>
          <div>
            <h2 className="text-base font-black text-white tracking-tight">{title}</h2>
            <p className="text-[11px] text-white/50 mt-0.5">{desc}</p>
          </div>
        </div>
      </div>
      {/* Body */}
      <div className="p-7 space-y-8">{children}</div>
    </section>
  );
}

/** Ad playlist item */
function AdItem({ item, urlsKey, idx, updateAdItem, removeAdItem }: any) {
  const isEmpty = !item.url.trim();
  return (
    <div className={`space-y-3 p-4 rounded-2xl border transition-all ${!item.enabled ? 'opacity-50 border-white/5 bg-white/[0.01]' : 'border-white/10 bg-white/[0.03]'}`}>
      <div className="flex items-center gap-3">
        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest w-5 shrink-0">#{idx + 1}</span>
        <input type="text" value={item.url} onChange={e => updateAdItem(urlsKey, item.id, 'url', e.target.value)}
          placeholder="Image / video URL (YouTube, mp4…)"
          className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" />
        <button type="button" onClick={() => updateAdItem(urlsKey, item.id, 'enabled', !item.enabled)} disabled={isEmpty}
          className={`p-2 rounded-xl border transition-all ${item.enabled ? 'bg-[#5850ec]/20 border-[#5850ec]/40 text-white' : 'bg-white/5 border-white/10 text-white/30 hover:text-white disabled:opacity-30'}`}>
          {item.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
        <button type="button" onClick={() => removeAdItem(urlsKey, item.id)}
          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-2 pl-8">
        <LinkIcon className="w-3 h-3 text-white/25 shrink-0" />
        <input type="text" value={item.clickUrl || ''} onChange={e => updateAdItem(urlsKey, item.id, 'clickUrl', e.target.value)}
          placeholder="Click redirect URL (optional)"
          className="flex-1 bg-black/20 border border-white/5 rounded-xl px-3 py-1.5 text-[11px] text-white/50 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-all" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SiteIdentityPage() {
  const [activeSection, setActiveSection] = useState('navbar');
  const [mounted, setMounted] = useState(false);

  const { data: settings, isLoading: isLoadingSettings } = useGetSiteSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSiteSettingsMutation();
  const { data: heroSettings, isLoading: isLoadingHero } = useGetHeroSettingsQuery();
  const [updateHeroSettings, { isLoading: isUpdatingHero }] = useUpdateHeroSettingsMutation();
  const [uploadImage] = useUploadImageMutation();

  const [formData, setFormData] = useState<any>({
    brandName: '', brandPart1: '', brandPart2: '', brandColor1: '', brandColor2: '',
    tagline: '', stickyNavbar: true, showSearchBar: true, showAuthButtons: true, showTopBar: true,
    logoUrl: '', faviconUrl: '', footerLogoUrl: '',
    menuItems: [], profileMenu: [], socialLinks: [],
    copyrightText: '', aboutText: '',
    adSettings: {
      showTopBarAd: false, showBottomBarAd: false, showPopupAd: false,
      topBarAdLink: '', bottomBarVideoLink: '', popupAdLink: '',
      topBarAdUrls: [], bottomBarVideoUrls: [], popupAdImageUrls: [],
    },
    homePageSettings: {
      whyChooseTitle: 'Why Choose Tasteful?',
      featureCards: [
        { icon: 'Sparkles', title: 'Handpicked Recipes', desc: 'Only the best recipes.' },
        { icon: 'Heart', title: 'Healthy & Delicious', desc: 'Nutritious & tasty.' },
        { icon: 'ShieldCheck', title: 'Easy to Follow', desc: 'Step-by-step results.' },
        { icon: 'Users', title: 'Community Loved', desc: 'Join our food lovers.' },
      ],
      promoBanner: {
        imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
        badgeText: 'SPONSORED PROMOTION', titlePart1: 'Culinary Masterclass ',
        titlePart2: 'With Michelin-Star Chefs',
        description: 'Transform your cooking skills with 150+ ultra-HD video masterclasses.',
        exclusiveLabel: 'EXCLUSIVE PASS',
        benefits: [
          { icon: 'Play', title: '150+ HD Video Lessons', desc: 'Watch on any device, anytime' },
          { icon: 'Sparkles', title: 'Michelin Pro Secrets', desc: 'Expert techniques made simple' },
          { icon: 'ShieldCheck', title: '30-Day Cooking Guarantee', desc: 'Unlock elite skills or full refund' },
        ],
      },
    },
  });

  const [heroFormData, setHeroFormData] = useState<any>({
    imageUrl: '', title: '', titlePart1: '', titlePart2: '',
    titleColor1: '', titleColor2: '', subtitle: '', ctaText: '', images: [],
  });

  useEffect(() => {
    if (settings) {
      const rawAds = settings.adSettings || {};
      const parseAdList = (urls: any, fallbackUrl: string) => {
        let list: any[] = [];
        if (Array.isArray(urls)) {
          list = urls.map((item: any, i: number) => {
            if (typeof item === 'object' && item !== null && 'url' in item)
              return { id: `ad-${i}-${Math.random().toString(36).substring(2, 9)}`, url: item.url || '', enabled: item.enabled !== false, clickUrl: item.clickUrl || '' };
            return { id: `ad-${i}-${Math.random().toString(36).substring(2, 9)}`, url: String(item || ''), enabled: true, clickUrl: '' };
          });
        } else if (typeof urls === 'string' && urls.trim()) {
          list = urls.split(',').map((u, i) => ({ id: `ad-${i}-${Math.random().toString(36).substring(2, 9)}`, url: u.trim(), enabled: true, clickUrl: '' }));
        }
        if (list.length === 0 && typeof fallbackUrl === 'string' && fallbackUrl.trim())
          list = [{ id: `ad-0-${Math.random().toString(36).substring(2, 9)}`, url: fallbackUrl.trim(), enabled: true, clickUrl: '' }];
        if (list.length === 0)
          list = [{ id: `ad-new-${Math.random().toString(36).substring(2, 9)}`, url: '', enabled: false, clickUrl: '' }];
        return list;
      };

      const savedHomePage = (settings as any).homePageSettings || {};
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
        menuItems: (settings.menuItems || []).map((m: any, i: number) => ({ ...m, id: m.id || `menu-${i}-${Math.random().toString(36).substring(2, 11)}` })),
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
        },
        homePageSettings: {
          whyChooseTitle: savedHomePage.whyChooseTitle || 'Why Choose Tasteful?',
          featureCards: savedHomePage.featureCards || [
            { icon: 'Sparkles', title: 'Handpicked Recipes', desc: 'Only the best recipes.' },
            { icon: 'Heart', title: 'Healthy & Delicious', desc: 'Nutritious & tasty.' },
            { icon: 'ShieldCheck', title: 'Easy to Follow', desc: 'Step-by-step results.' },
            { icon: 'Users', title: 'Community Loved', desc: 'Join our food lovers.' },
          ],
          promoBanner: {
            imageUrl: savedHomePage.promoBanner?.imageUrl || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
            badgeText: savedHomePage.promoBanner?.badgeText || 'SPONSORED PROMOTION',
            titlePart1: savedHomePage.promoBanner?.titlePart1 || 'Culinary Masterclass ',
            titlePart2: savedHomePage.promoBanner?.titlePart2 || 'With Michelin-Star Chefs',
            description: savedHomePage.promoBanner?.description || 'Transform your cooking skills with 150+ ultra-HD video masterclasses. Learn professional culinary secrets, plating techniques, and recipe composition from legendary chefs.',
            exclusiveLabel: savedHomePage.promoBanner?.exclusiveLabel || 'EXCLUSIVE PASS',
            benefits: savedHomePage.promoBanner?.benefits || [
              { icon: 'Play', title: '150+ HD Video Lessons', desc: 'Watch on any device, anytime' },
              { icon: 'Sparkles', title: 'Michelin Pro Secrets', desc: 'Expert techniques made simple' },
              { icon: 'ShieldCheck', title: '30-Day Cooking Guarantee', desc: 'Unlock elite skills or full refund' },
            ],
          },
        },
      });
    }
  }, [settings]);

  useEffect(() => {
    if (heroSettings) {
      const list = (heroSettings.images || []).map((imgUrl: string, idx: number) => ({
        id: `hero-${idx}-${Math.random().toString(36).substring(2, 9)}`, url: imgUrl,
      }));
      if (list.length === 0 && heroSettings.imageUrl)
        list.push({ id: `hero-0-${Math.random().toString(36).substring(2, 9)}`, url: heroSettings.imageUrl });
      if (list.length === 0)
        list.push({ id: `hero-new-${Math.random().toString(36).substring(2, 9)}`, url: '' });
      const hasComma = heroSettings.title && heroSettings.title.includes(',');
      setHeroFormData({
        imageUrl: heroSettings.imageUrl || '',
        title: heroSettings.title || '',
        titlePart1: heroSettings.titlePart1 || (hasComma ? heroSettings.title.substring(0, heroSettings.title.indexOf(',') + 1) : heroSettings.title || ''),
        titlePart2: heroSettings.titlePart2 || (hasComma ? heroSettings.title.substring(heroSettings.title.indexOf(',') + 1).trim() : ''),
        titleColor1: heroSettings.titleColor1 || '#ffffff',
        titleColor2: heroSettings.titleColor2 || '#f29e1f',
        subtitle: heroSettings.subtitle || '',
        ctaText: heroSettings.ctaText || '',
        images: list,
      });
    }
  }, [heroSettings]);

  useEffect(() => { setMounted(true); }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      const serializedMenuItems = (formData.menuItems || []).map(({ id, ...rest }: any) => rest);
      const serializeAdList = (list: any[]) => {
        if (!Array.isArray(list)) return [];
        return list.filter(i => i?.url?.trim() !== '').map(i => ({ url: i?.url?.trim() || '', enabled: i?.enabled !== false, clickUrl: i?.clickUrl ? i.clickUrl.trim() : '' }));
      };
      const adSettings = formData.adSettings || {};
      const finalAdSettings = {
        showTopBarAd: !!adSettings.showTopBarAd, showBottomBarAd: !!adSettings.showBottomBarAd, showPopupAd: !!adSettings.showPopupAd,
        topBarAdLink: adSettings.topBarAdLink?.trim() || '', bottomBarVideoLink: adSettings.bottomBarVideoLink?.trim() || '', popupAdLink: adSettings.popupAdLink?.trim() || '',
        topBarAdUrls: serializeAdList(adSettings.topBarAdUrls), bottomBarVideoUrls: serializeAdList(adSettings.bottomBarVideoUrls), popupAdImageUrls: serializeAdList(adSettings.popupAdImageUrls),
        topBarAdUrl: serializeAdList(adSettings.topBarAdUrls).find((i: any) => i.enabled)?.url || '',
        bottomBarVideoUrl: serializeAdList(adSettings.bottomBarVideoUrls).find((i: any) => i.enabled)?.url || '',
        popupAdImageUrl: serializeAdList(adSettings.popupAdImageUrls).find((i: any) => i.enabled)?.url || '',
      };
      const heroImagesArray = (heroFormData.images || []).map((item: any) => item?.url?.trim() || '').filter((url: string) => url !== '');
      await Promise.all([
        updateSettings({ ...formData, brandName: (formData.brandPart1 || '') + (formData.brandPart2 || ''), menuItems: serializedMenuItems, adSettings: finalAdSettings, homePageSettings: formData.homePageSettings }).unwrap(),
        updateHeroSettings({ title: `${heroFormData.titlePart1 || ''}${heroFormData.titlePart2 || ''}`.trim() || heroFormData.title || '', titlePart1: heroFormData.titlePart1 || '', titlePart2: heroFormData.titlePart2 || '', titleColor1: heroFormData.titleColor1 || '#ffffff', titleColor2: heroFormData.titleColor2 || '#f29e1f', subtitle: heroFormData.subtitle || '', ctaText: '', imageUrl: heroImagesArray[0] || '', images: heroImagesArray }).unwrap(),
      ]);
      toast.success('Settings saved successfully!');
    } catch (err: any) {
      toast.error('Error saving settings: ' + (err?.message || JSON.stringify(err)));
    }
  };

  const handleAssetUpload = async (field: 'logoUrl' | 'faviconUrl' | 'footerLogoUrl', file: File) => {
    const data = new FormData(); data.append('image', file);
    try { const result = await uploadImage(data).unwrap(); setFormData((prev: any) => ({ ...prev, [field]: result.imageUrl })); }
    catch (err) { console.error(`Failed to upload ${field}:`, err); }
  };

  const updateMenuItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.menuItems]; newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, menuItems: newItems });
  };
  const addMenuItem = () => setFormData({ ...formData, menuItems: [...formData.menuItems, { id: `menu-new-${Math.random().toString(36).substring(2, 11)}`, label: 'New Link', url: '#', visible: true }] });
  const removeMenuItem = (index: number) => setFormData({ ...formData, menuItems: formData.menuItems.filter((_: any, i: number) => i !== index) });

  const addHeroImage = () => setHeroFormData({ ...heroFormData, images: [...heroFormData.images, { id: `hero-new-${Math.random().toString(36).substring(2, 9)}`, url: '' }] });
  const removeHeroImage = (id: string) => {
    let filtered = heroFormData.images.filter((img: any) => img.id !== id);
    if (filtered.length === 0) filtered.push({ id: `hero-new-${Math.random().toString(36).substring(2, 9)}`, url: '' });
    setHeroFormData({ ...heroFormData, images: filtered });
  };
  const updateHeroImage = (id: string, value: string) => setHeroFormData({ ...heroFormData, images: heroFormData.images.map((img: any) => img.id === id ? { ...img, url: value } : img) });
  const moveHeroImageUp = (index: number) => {
    if (index === 0) return;
    const list = [...heroFormData.images];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    setHeroFormData({ ...heroFormData, images: list });
  };
  const moveHeroImageDown = (index: number) => {
    if (index === heroFormData.images.length - 1) return;
    const list = [...heroFormData.images];
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    setHeroFormData({ ...heroFormData, images: list });
  };

  const addAdItem = (key: 'topBarAdUrls' | 'bottomBarVideoUrls' | 'popupAdImageUrls') =>
    setFormData({ ...formData, adSettings: { ...formData.adSettings, [key]: [...formData.adSettings[key], { id: `ad-new-${Math.random().toString(36).substring(2, 9)}`, url: '', enabled: false, clickUrl: '' }] } });

  const removeAdItem = (key: 'topBarAdUrls' | 'bottomBarVideoUrls' | 'popupAdImageUrls', id: string) => {
    let filtered = formData.adSettings[key].filter((item: any) => item.id !== id);
    if (filtered.length === 0) filtered.push({ id: `ad-new-${Math.random().toString(36).substring(2, 9)}`, url: '', enabled: false, clickUrl: '' });
    setFormData({ ...formData, adSettings: { ...formData.adSettings, [key]: filtered } });
  };

  const updateAdItem = (key: 'topBarAdUrls' | 'bottomBarVideoUrls' | 'popupAdImageUrls', id: string, field: 'url' | 'enabled' | 'clickUrl', value: any) => {
    const updated = formData.adSettings[key].map((item: any) => {
      if (item.id !== id) return item;
      if (field === 'url' && !value.trim()) return { ...item, [field]: value, enabled: false };
      if (field === 'enabled' && value && !item.url.trim()) return item;
      return { ...item, [field]: value };
    });
    setFormData({ ...formData, adSettings: { ...formData.adSettings, [key]: updated } });
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
  };

  const sections = [
    { id: 'navbar', label: 'Navbar', sub: 'Logo & brand', icon: Layout, gradient: 'from-indigo-500/25 via-indigo-500/10 to-transparent', glow: 'bg-indigo-500/20', accent: '#5850ec' },
    { id: 'hero', label: 'Hero Slider', sub: 'Title & images', icon: Type, gradient: 'from-blue-500/25 via-blue-500/10 to-transparent', glow: 'bg-blue-500/20', accent: '#3b82f6' },
    { id: 'homepage', label: 'Home Page', sub: 'Features & promo', icon: Monitor, gradient: 'from-emerald-500/25 via-emerald-500/10 to-transparent', glow: 'bg-emerald-500/20', accent: '#10b981' },
    { id: 'ads', label: 'Advertisements', sub: 'Ad placements', icon: Share2, gradient: 'from-amber-500/25 via-amber-500/10 to-transparent', glow: 'bg-amber-500/20', accent: '#f59e0b' },
    { id: 'footer', label: 'Footer', sub: 'About & copyright', icon: Columns, gradient: 'from-rose-500/25 via-rose-500/10 to-transparent', glow: 'bg-rose-500/20', accent: '#f43f5e' },
  ];

  if (!mounted) return null;

  if (isLoadingSettings || isLoadingHero) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-[#5850ec]/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#5850ec]" />
          </div>
        </div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading settings...</p>
      </div>
    );
  }

  // ── Ad playlist renderer ──────────────────────────────────────────────────
  const renderPlaylist = (title: string, key: 'topBarAdUrls' | 'bottomBarVideoUrls' | 'popupAdImageUrls', accent: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/35">{title}</span>
        <button type="button" onClick={() => addAdItem(key)} className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all"
          style={{ color: accent, borderColor: `${accent}30`, background: `${accent}10` }}>
          <Plus className="w-3.5 h-3.5" /> Add URL
        </button>
      </div>
      <div className="space-y-2">
        {(formData.adSettings[key] || []).map((item: any, idx: number) => (
          <AdItem key={item.id} item={item} urlsKey={key} idx={idx} updateAdItem={updateAdItem} removeAdItem={removeAdItem} />
        ))}
      </div>
    </div>
  );

  // ── STATUS STATS ─────────────────────────────────────────────────────────
  const stats = [
    { label: 'Brand', value: `${formData.brandPart1}${formData.brandPart2}` || '—', ok: !!formData.brandPart1 },
    { label: 'Navbar Logo', value: formData.logoUrl ? 'Set' : 'Not set', ok: !!formData.logoUrl },
    { label: 'Hero Images', value: `${heroFormData.images.filter((i: any) => i.url).length}`, ok: heroFormData.images.some((i: any) => i.url) },
    { label: 'Menu Items', value: `${formData.menuItems.length}`, ok: formData.menuItems.length > 0 },
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ══════════════ STICKY HEADER ══════════════ */}
      <div className="sticky top-16 z-20 -mx-6 px-6 py-4 bg-[#05060b]/90 backdrop-blur-2xl border-b border-white/[0.06] flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-[0.18em] mb-1">
            <Link href="/admin/settings" className="hover:text-white/60 transition-colors">Settings</Link>
            <ChevronRight className="w-3 h-3 opacity-40" />
            <span className="text-white/50">Site Identity</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Site Identity</h1>
        </div>
      </div>

      {/* ══════════════ MAIN GRID ══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">

        {/* ═══ SIDEBAR ═══ */}
        <aside className="lg:col-span-3 sticky top-36 space-y-4 z-0">

          {/* Navigation card */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-3xl overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-white/[0.06]">
              <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/25">Sections</p>
            </div>
            <div className="p-2 space-y-0.5">
              {sections.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button key={item.id} onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center gap-3.5 rounded-2xl px-3.5 py-3 transition-all duration-200 text-left group relative
                      ${isActive
                        ? 'bg-white/[0.06] text-white border border-white/[0.1]'
                        : 'text-slate-400 hover:bg-white/[0.03] hover:text-white border border-transparent'
                      }`}>
                    {/* Active left bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{ backgroundColor: item.accent }} />
                    )}

                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all
                      ${isActive ? 'shadow-lg' : 'bg-white/[0.05] group-hover:bg-white/10'}`}
                      style={isActive ? { background: `linear-gradient(135deg, ${item.accent}90, ${item.accent}50)`, boxShadow: `0 4px 12px ${item.accent}40` } : {}}>
                      <item.icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-bold leading-tight truncate">{item.label}</div>
                      <div className="text-[9px] text-white/30 mt-0.5 truncate">{item.sub}</div>
                    </div>

                    {isActive && <ChevronRight className="w-3 h-3 shrink-0" style={{ color: item.accent }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status card */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/20 pb-2 border-b border-white/[0.05]">Status</p>
            {stats.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-[11px] text-white/35">{s.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-emerald-400' : 'bg-white/15'}`} />
                  <span className={`text-[11px] font-semibold truncate max-w-[80px] ${s.ok ? 'text-white/65' : 'text-white/25'}`}>{s.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Live brand preview mini-card */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/20 pb-2 border-b border-white/[0.05]">Brand Preview</p>
            <div className="flex items-center gap-2.5 p-3 bg-black/30 rounded-xl border border-white/[0.05]">
              <div className="w-8 h-8 rounded-xl bg-[#0a0b14] border border-white/10 flex items-center justify-center shrink-0">
                <ChefHat className="w-4 h-4" style={{ color: formData.brandColor2 || '#f29e1f' }} />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-black tracking-tight">
                  <span style={{ color: formData.brandColor1 || '#ffffff' }}>{formData.brandPart1 || 'Taste'}</span>
                  <span style={{ color: formData.brandColor2 || '#f29e1f' }}>{formData.brandPart2 || 'ful'}</span>
                </div>
                {formData.tagline && <div className="text-[8px] font-bold text-white/25 uppercase tracking-widest">{formData.tagline}</div>}
              </div>
            </div>
          </div>
        </aside>

        {/* ═══ CONTENT ═══ */}
        <div className="lg:col-span-9 space-y-6">

          {activeSection === 'navbar' && (
            <SectionPanel id="navbar" gradient="from-indigo-500/20 via-indigo-500/5 to-transparent" bgGlow="bg-indigo-500/15"
              icon={<Layout className="w-5 h-5 text-white" />}
              title="Navbar Settings" desc="Brand assets, visibility controls, identity & navigation">

            {/* Brand Assets */}
            <div className="space-y-5">
              <GroupLabel icon={<ImageIcon className="w-3 h-3" />} label="Brand Assets" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { label: 'Navbar Logo', size: '200×200 PNG / SVG', key: 'logoUrl', showBrand: true },
                ].map((asset) => (
                  <AssetCard key={asset.key} label={asset.label} size={asset.size}
                    imageUrl={formData[asset.key]} showBrand={asset.showBrand}
                    brandText={`${formData.brandPart1}${formData.brandPart2}`}
                    brandColor={formData.brandColor2 || '#f29e1f'}
                    onUpload={(file) => handleAssetUpload(asset.key as any, file)}
                    onDelete={() => setFormData({ ...formData, [asset.key]: '' })} />
                ))}
              </div>
            </div>

            {/* Visibility Controls */}
            <div className="space-y-4">
              <GroupLabel icon={<Eye className="w-3 h-3" />} label="Visibility Controls" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: 'Sticky Navbar', desc: 'Fix navbar to top on scroll', key: 'stickyNavbar' },
                  { label: 'Search Bar', desc: 'Show search input in header', key: 'showSearchBar' },
                  { label: 'Auth Buttons', desc: 'Login & Register buttons', key: 'showAuthButtons' },
                  { label: 'Top Bar', desc: 'Announcement top bar', key: 'showTopBar' },
                ].map((t) => (
                  <ToggleRow key={t.key} label={t.label} desc={t.desc}
                    checked={formData[t.key]} onChange={() => setFormData({ ...formData, [t.key]: !formData[t.key] })}
                    accentColor="#5850ec" />
                ))}
              </div>
            </div>

            {/* Brand Identity */}
            <div className="space-y-5">
              <GroupLabel icon={<Palette className="w-3 h-3" />} label="Brand Identity" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <BrandField label="BN-1 & Color" textValue={formData.brandPart1} onTextChange={v => setFormData({ ...formData, brandPart1: v })}
                  colorValue={formData.brandColor1} onColorChange={v => setFormData({ ...formData, brandColor1: v })} placeholder="e.g. Taste" />
                <BrandField label="BN-2 & Color" textValue={formData.brandPart2} onTextChange={v => setFormData({ ...formData, brandPart2: v })}
                  colorValue={formData.brandColor2} onColorChange={v => setFormData({ ...formData, brandColor2: v })} placeholder="e.g. ful" />
              </div>
              <Field label="Tagline" value={formData.tagline} onChange={v => setFormData({ ...formData, tagline: v })} placeholder="e.g. Delicious Recipes" />
            </div>

            {/* Menu Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <GroupLabel icon={<LayoutGrid className="w-3 h-3" />} label="Menu Items" />
                <button onClick={addMenuItem} className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>
              <div className="border border-white/[0.07] rounded-2xl overflow-hidden">
                <Reorder.Group axis="y" values={formData.menuItems} onReorder={(newOrder) => setFormData({ ...formData, menuItems: newOrder })} className="divide-y divide-white/[0.05]">
                  {formData.menuItems.map((item: any, idx: number) => (
                    <Reorder.Item key={item.id} value={item}
                      className="flex items-center gap-3 p-3.5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors cursor-grab active:cursor-grabbing group">
                      <GripVertical className="w-4 h-4 text-white/15 group-hover:text-white/40 shrink-0" />
                      <div className="flex-1 flex flex-col sm:flex-row gap-2">
                        <input type="text" value={item.label} onChange={e => updateMenuItem(idx, 'label', e.target.value)}
                          className="bg-transparent outline-none text-[13px] font-semibold text-white/70 hover:text-white transition-colors min-w-[100px]" />
                        <input type="text" value={item.url} onChange={e => updateMenuItem(idx, 'url', e.target.value)}
                          className="bg-transparent outline-none text-[11px] text-white/30 flex-1" />
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <select value={item.visible ? 'Visible' : 'Hidden'} onChange={e => updateMenuItem(idx, 'visible', e.target.value === 'Visible')}
                          className="appearance-none bg-transparent text-[10px] font-bold text-white/40 hover:text-white focus:outline-none cursor-pointer">
                          <option>Visible</option><option>Hidden</option>
                        </select>
                        <button onClick={() => removeMenuItem(idx)} className="p-1.5 hover:bg-red-500/10 text-white/20 hover:text-red-400 rounded-lg transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
                {formData.menuItems.length === 0 && (
                  <div className="py-8 text-center text-white/20 text-sm">No menu items yet</div>
                )}
              </div>
            </div>
          </SectionPanel>
          )}



          {activeSection === 'hero' && (
            <SectionPanel id="hero" gradient="from-blue-500/20 via-blue-500/5 to-transparent" bgGlow="bg-blue-500/15"
              icon={<Type className="w-5 h-5 text-white" />}
              title="Hero Slider" desc="Configure titles, subtitles, and image playlist.">

            <div className="space-y-6">
              {/* Grid: 60% Left (Title & Text), 40% Right (Live Preview) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Column (col-span-7) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {/* Title & Text Card */}
                  <div className="bg-white/[0.01] border border-white/[0.06] rounded-[24px] p-6 space-y-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-[0.15em] mb-4">Title & Text</h3>
                      
                      <div className="space-y-5">
                        {/* Title & Color 1 */}
                        <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/35">Title & Color</label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="text" 
                              value={heroFormData.titlePart1} 
                              onChange={e => setHeroFormData({ ...heroFormData, titlePart1: e.target.value })}
                              placeholder="e.g. Good Food, " 
                              className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" 
                            />
                            <div className="flex flex-col items-center">
                              <div className="relative w-11 h-10 rounded-xl overflow-hidden border border-white/10 cursor-pointer">
                                <input 
                                  type="color" 
                                  value={heroFormData.titleColor1 || '#ffffff'} 
                                  onChange={e => setHeroFormData({ ...heroFormData, titleColor1: e.target.value })}
                                  className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer" 
                                />
                              </div>
                              <span className="text-[8px] font-mono text-white/30 mt-1 uppercase">{heroFormData.titleColor1 || '#ffffff'}</span>
                            </div>
                          </div>
                          {/* Part 1 Bullet Preview */}
                          <div className="flex items-center gap-2 pl-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: heroFormData.titleColor1 || '#ffffff' }} />
                            <span className="text-[11px] font-bold" style={{ color: heroFormData.titleColor1 || '#ffffff' }}>
                              {heroFormData.titlePart1 || 'Good Food, '}
                            </span>
                          </div>
                        </div>

                        {/* HN-2 & Color */}
                        <div className="space-y-2.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/35">HN-2 & Color</label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="text" 
                              value={heroFormData.titlePart2} 
                              onChange={e => setHeroFormData({ ...heroFormData, titlePart2: e.target.value })}
                              placeholder="e.g. Good Mood" 
                              className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" 
                            />
                            <div className="flex flex-col items-center">
                              <div className="relative w-11 h-10 rounded-xl overflow-hidden border border-white/10 cursor-pointer">
                                <input 
                                  type="color" 
                                  value={heroFormData.titleColor2 || '#f29e1f'} 
                                  onChange={e => setHeroFormData({ ...heroFormData, titleColor2: e.target.value })}
                                  className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer" 
                                />
                              </div>
                              <span className="text-[8px] font-mono text-white/30 mt-1 uppercase">{heroFormData.titleColor2 || '#f29e1f'}</span>
                            </div>
                          </div>
                          {/* Part 2 Combined Preview */}
                          <div className="flex items-center gap-2 pl-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: heroFormData.titleColor2 || '#f29e1f' }} />
                            <span className="text-[11px] font-bold">
                              <span style={{ color: heroFormData.titleColor1 || '#ffffff' }}>{heroFormData.titlePart1 || 'Good Food, '}</span>
                              <span style={{ color: heroFormData.titleColor2 || '#f29e1f' }}>{heroFormData.titlePart2 || 'Good Mood'}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hero Subtitle */}
                    <div className="space-y-2.5 pt-4 border-t border-white/[0.05]">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/35">
                        <span>Hero Subtitle</span>
                        <span>{heroFormData.subtitle?.length || 0} character counts</span>
                      </div>
                      <textarea 
                        value={heroFormData.subtitle} 
                        onChange={e => setHeroFormData({ ...heroFormData, subtitle: e.target.value })}
                        placeholder="Explore thousands of handpicked recipes from around the world." 
                        rows={3}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column (col-span-5) */}
                <div className="lg:col-span-5 flex flex-col">
                  {/* Live Hero Preview Card */}
                  <div className="bg-white/[0.01] border border-white/[0.06] rounded-[24px] p-6 space-y-4 flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-white uppercase tracking-[0.15em]">Live Hero Preview</h3>
                    
                    {/* Browser Mockup */}
                    <div className="flex-1 border border-white/10 rounded-2xl overflow-hidden bg-black/40 flex flex-col min-h-[280px]">
                      {/* Browser Top Bar */}
                      <div className="bg-white/[0.03] border-b border-white/10 px-4 py-2 flex items-center justify-between shrink-0">
                        <div className="flex gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                        </div>
                        <div className="bg-white/5 rounded-md border border-white/10 text-[8px] text-white/30 px-6 py-0.5 truncate text-center w-36 select-none font-mono">
                          www.website.com
                        </div>
                        <div className="w-8" />
                      </div>
                      
                      {/* Viewport content */}
                      <div className="relative flex-1 bg-slate-900 flex flex-col items-start justify-start text-left p-4 overflow-hidden pt-6">
                        {/* Background slider image */}
                        <div className="absolute inset-0 z-0 select-none pointer-events-none">
                          {heroFormData.images[0]?.url ? (
                            <img src={heroFormData.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <img src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80" alt="" className="w-full h-full object-cover" />
                          )}
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-transparent" />
                        </div>
                        
                        {/* Content Overlay */}
                        <div className="relative z-10 max-w-[95%] pointer-events-none flex flex-col items-start text-left space-y-1">
                          {/* Title */}
                          <h4 className="text-[11px] sm:text-xs font-black tracking-tight leading-tight drop-shadow-[0_1px_5px_rgba(0,0,0,0.6)]">
                            <span style={{ color: heroFormData.titleColor1 || '#ffffff' }}>{heroFormData.titlePart1 || 'Good Food, '}</span>
                            <span style={{ color: heroFormData.titleColor2 || '#f29e1f' }}>{heroFormData.titlePart2 || 'Good Mood'}</span>
                          </h4>
                          {/* Subtitle */}
                          {heroFormData.subtitle && (
                            <p className="text-[7px] sm:text-[8px] text-white/80 font-medium leading-normal drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] line-clamp-3">
                              {heroFormData.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Slider indicator dots */}
                        <div className="absolute bottom-2 flex justify-center gap-1 z-10">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <span key={i} className={`w-1 h-1 rounded-full transition-all ${i === 1 ? 'w-2.5 bg-[#f29e1f]' : 'bg-white/30'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slider Media Manager Section (Full Width Card) */}
              <div className="bg-white/[0.01] border border-white/[0.06] rounded-[24px] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-[0.15em]">Slider Media Manager</h3>
                  <button onClick={addHeroImage} className="flex items-center gap-1.5 text-[10px] font-black px-3.5 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all uppercase tracking-wider">
                    <Plus className="w-3.5 h-3.5" /> Add Slide
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {heroFormData.images.map((img: any, idx: number) => {
                    const isYT = img.url?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
                    const isVid = img.url?.match(/\.(mp4|webm|ogg)(\?.*)?$/i);
                    
                    return (
                      <div key={img.id} className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-black/40 group hover:border-white/20 transition-all flex flex-col justify-between">
                        {/* Thumbnail background image */}
                        <div className="absolute inset-0 z-0">
                          {img.url ? (
                            isYT ? (
                              <div className="w-full h-full bg-red-950/20 flex items-center justify-center text-[8px] font-black text-red-400 uppercase tracking-widest">YouTube</div>
                            ) : isVid ? (
                              <div className="w-full h-full bg-blue-950/20 flex items-center justify-center text-[8px] font-black text-blue-400 uppercase tracking-widest">Video</div>
                            ) : (
                              <img src={img.url} alt="" className="w-full h-full object-cover" />
                            )
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/10 gap-1">
                              <ImageIcon className="w-5 h-5" />
                              <span className="text-[8px] font-bold uppercase tracking-wider">Empty</span>
                            </div>
                          )}
                        </div>

                        {/* Number tag overlay */}
                        <span className="absolute top-2.5 left-2.5 z-10 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[9px] font-black w-6 h-6 rounded-lg flex items-center justify-center select-none">
                          #{idx + 1}
                        </span>

                        {/* Actions overlay panel */}
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-black/85 backdrop-blur-md border border-white/10 rounded-xl p-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                          <button onClick={() => moveHeroImageUp(idx)} disabled={idx === 0} className="p-1 hover:bg-white/10 text-white/60 hover:text-white rounded disabled:opacity-35 transition-colors">
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => moveHeroImageDown(idx)} disabled={idx === heroFormData.images.length - 1} className="p-1 hover:bg-white/10 text-white/60 hover:text-white rounded disabled:opacity-35 transition-colors">
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => {
                            const url = prompt("Enter Image/Video URL:", img.url);
                            if (url !== null) updateHeroImage(img.id, url);
                          }} className="p-1 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors">
                            <LinkIcon className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => removeHeroImage(img.id)} className="p-1 hover:bg-red-500/10 text-red-400 rounded transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Hidden file input */}
                        <input type="file" id={`hero-upload-${img.id}`} className="hidden" accept="image/*,video/mp4,video/webm"
                          onChange={async (e: any) => {
                            const file = e.target.files?.[0]; if (!file) return;
                            const data = new FormData(); data.append('image', file);
                            try { const res = await uploadImage(data).unwrap(); updateHeroImage(img.id, res.imageUrl); }
                            catch (err: any) { toast.error('Upload failed: ' + (err.message || JSON.stringify(err))); }
                          }} />

                        {/* Click to upload overlay */}
                        <div onClick={() => document.getElementById(`hero-upload-${img.id}`)?.click()} 
                          className="absolute inset-0 z-5 bg-black/35 hover:bg-black/60 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white/70 hover:text-white">
                          <Plus className="w-5 h-5 mb-0.5" />
                          <span className="text-[8px] font-black uppercase tracking-wider">Upload File</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Slide Card */}
                  <button onClick={addHeroImage} 
                    className="relative aspect-video rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center gap-1.5 text-white/30 hover:text-white/60 group">
                    <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Add Slide</span>
                  </button>
                </div>
              </div>
            </div>
          </SectionPanel>
          )}

          {activeSection === 'homepage' && (
            <SectionPanel id="homepage" gradient="from-emerald-500/20 via-emerald-500/5 to-transparent" bgGlow="bg-emerald-500/15"
              icon={<Monitor className="w-5 h-5 text-white" />}
              title="Home Page Content" desc="Why Choose feature cards and the Sponsored Promo Banner">

            {/* Why Choose */}
            <div className="space-y-4">
              <GroupLabel icon={<Sparkles className="w-3 h-3" />} label="Why Choose Section" />
              <Field label="Section Title" value={formData.homePageSettings.whyChooseTitle}
                onChange={v => setFormData({ ...formData, homePageSettings: { ...formData.homePageSettings, whyChooseTitle: v } })}
                placeholder="Why Choose Tasteful?" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(formData.homePageSettings.featureCards || []).map((card: any, idx: number) => (
                  <div key={idx} className="p-4 bg-white/[0.025] border border-white/[0.06] rounded-2xl space-y-3 hover:border-white/10 transition-all">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
                        style={{ color: '#10b981', borderColor: '#10b98130', background: '#10b98110' }}>Card {idx + 1}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-white/30">Title</label>
                        <input type="text" value={card.title} onChange={e => {
                          const updated = [...formData.homePageSettings.featureCards];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          setFormData({ ...formData, homePageSettings: { ...formData.homePageSettings, featureCards: updated } });
                        }} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-white/30">Description</label>
                        <input type="text" value={card.desc} onChange={e => {
                          const updated = [...formData.homePageSettings.featureCards];
                          updated[idx] = { ...updated[idx], desc: e.target.value };
                          setFormData({ ...formData, homePageSettings: { ...formData.homePageSettings, featureCards: updated } });
                        }} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 transition-all" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Banner */}
            <div className="space-y-5">
              <GroupLabel icon={<Share2 className="w-3 h-3" />} label="Promo Banner" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/35">Banner Image URL</label>
                    <input type="text" value={formData.homePageSettings.promoBanner.imageUrl}
                      onChange={e => setFormData({ ...formData, homePageSettings: { ...formData.homePageSettings, promoBanner: { ...formData.homePageSettings.promoBanner, imageUrl: e.target.value } } })}
                      placeholder="https://..." className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" />
                    {formData.homePageSettings.promoBanner.imageUrl && (
                      <div className="w-full h-24 rounded-xl overflow-hidden border border-white/10 mt-2">
                        <img src={formData.homePageSettings.promoBanner.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <Field label="Exclusive Label" value={formData.homePageSettings.promoBanner.exclusiveLabel} placeholder="EXCLUSIVE PASS"
                    onChange={v => setFormData({ ...formData, homePageSettings: { ...formData.homePageSettings, promoBanner: { ...formData.homePageSettings.promoBanner, exclusiveLabel: v } } })} />
                  <Field label="Badge Text" value={formData.homePageSettings.promoBanner.badgeText} placeholder="SPONSORED PROMOTION"
                    onChange={v => setFormData({ ...formData, homePageSettings: { ...formData.homePageSettings, promoBanner: { ...formData.homePageSettings.promoBanner, badgeText: v } } })} />
                  <Field label="Title Part 1 (Normal)" value={formData.homePageSettings.promoBanner.titlePart1} placeholder="Culinary Masterclass "
                    onChange={v => setFormData({ ...formData, homePageSettings: { ...formData.homePageSettings, promoBanner: { ...formData.homePageSettings.promoBanner, titlePart1: v } } })} />
                  <Field label="Title Part 2 (Highlighted)" value={formData.homePageSettings.promoBanner.titlePart2} placeholder="With Michelin-Star Chefs"
                    onChange={v => setFormData({ ...formData, homePageSettings: { ...formData.homePageSettings, promoBanner: { ...formData.homePageSettings.promoBanner, titlePart2: v } } })} />
                  <Field label="Description" value={formData.homePageSettings.promoBanner.description} textarea rows={3}
                    onChange={v => setFormData({ ...formData, homePageSettings: { ...formData.homePageSettings, promoBanner: { ...formData.homePageSettings.promoBanner, description: v } } })} />
                </div>
                {/* Right — 3 benefit items */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/35">Benefit Items</label>
                  {(formData.homePageSettings.promoBanner.benefits || []).map((benefit: any, idx: number) => (
                    <div key={idx} className="p-4 bg-white/[0.025] border border-white/[0.06] rounded-2xl space-y-3 hover:border-white/10 transition-all">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
                        style={{ color: '#f59e0b', borderColor: '#f59e0b30', background: '#f59e0b10' }}>Benefit {idx + 1}</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-white/30">Title</label>
                          <input type="text" value={benefit.title} onChange={e => {
                            const updated = [...formData.homePageSettings.promoBanner.benefits];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setFormData({ ...formData, homePageSettings: { ...formData.homePageSettings, promoBanner: { ...formData.homePageSettings.promoBanner, benefits: updated } } });
                          }} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 transition-all" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-white/30">Description</label>
                          <input type="text" value={benefit.desc} onChange={e => {
                            const updated = [...formData.homePageSettings.promoBanner.benefits];
                            updated[idx] = { ...updated[idx], desc: e.target.value };
                            setFormData({ ...formData, homePageSettings: { ...formData.homePageSettings, promoBanner: { ...formData.homePageSettings.promoBanner, benefits: updated } } });
                          }} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 transition-all" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Live preview */}
                  <div className="p-4 bg-black/30 border border-amber-500/10 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-[9px] font-black text-white/25 uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Live Preview
                    </div>
                    <p className="text-sm font-black text-white tracking-tight leading-snug">
                      {formData.homePageSettings.promoBanner.titlePart1}
                      <span className="text-amber-400">{formData.homePageSettings.promoBanner.titlePart2}</span>
                    </p>
                    <p className="text-[10px] text-white/30 leading-relaxed line-clamp-2">{formData.homePageSettings.promoBanner.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </SectionPanel>
          )}

          {activeSection === 'ads' && (
            <SectionPanel id="ads" gradient="from-amber-500/20 via-amber-500/5 to-transparent" bgGlow="bg-amber-500/15"
              icon={<Bell className="w-5 h-5 text-white" />}
              title="Advertisements" desc="Configure top bar, bottom bar, and popup ad playlists">

            {/* Top Bar Ad */}
            <div className="space-y-5 p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <p className="text-sm font-semibold text-white">Top Bar Video Ad</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Float a video banner at the top of the homepage</p>
                </div>
                <Toggle checked={formData.adSettings.showTopBarAd}
                  onChange={() => setFormData({ ...formData, adSettings: { ...formData.adSettings, showTopBarAd: !formData.adSettings.showTopBarAd } })}
                  accentColor="#f59e0b" />
              </div>
              {renderPlaylist('Top Bar Playlist', 'topBarAdUrls', '#f59e0b')}
              <Field label="Global Top Bar Redirect URL" value={formData.adSettings.topBarAdLink} placeholder="https://example.com/shop"
                onChange={v => setFormData({ ...formData, adSettings: { ...formData.adSettings, topBarAdLink: v } })} />
            </div>

            {/* Bottom Bar Ad */}
            <div className="space-y-5 p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <p className="text-sm font-semibold text-white">Bottom Bar Video Ad</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Float a video banner at the bottom of the homepage</p>
                </div>
                <Toggle checked={formData.adSettings.showBottomBarAd}
                  onChange={() => setFormData({ ...formData, adSettings: { ...formData.adSettings, showBottomBarAd: !formData.adSettings.showBottomBarAd } })}
                  accentColor="#f59e0b" />
              </div>
              {renderPlaylist('Bottom Bar Playlist', 'bottomBarVideoUrls', '#f59e0b')}
              <Field label="Global Bottom Bar Redirect URL" value={formData.adSettings.bottomBarVideoLink} placeholder="https://example.com/learn-more"
                onChange={v => setFormData({ ...formData, adSettings: { ...formData.adSettings, bottomBarVideoLink: v } })} />
            </div>

            {/* Popup Ad */}
            <div className="space-y-5 p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <p className="text-sm font-semibold text-white">Popup Sponsored Ad</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Draggable sponsored overlay on the client homepage</p>
                </div>
                <Toggle checked={formData.adSettings.showPopupAd}
                  onChange={() => setFormData({ ...formData, adSettings: { ...formData.adSettings, showPopupAd: !formData.adSettings.showPopupAd } })}
                  accentColor="#f59e0b" />
              </div>
              {renderPlaylist('Popup Playlist', 'popupAdImageUrls', '#f59e0b')}
              <Field label="Global Popup Redirect URL" value={formData.adSettings.popupAdLink} placeholder="https://example.com/promo"
                onChange={v => setFormData({ ...formData, adSettings: { ...formData.adSettings, popupAdLink: v } })} />
            </div>
          </SectionPanel>
          )}

          {activeSection === 'footer' && (
            <SectionPanel id="footer" gradient="from-rose-500/20 via-rose-500/5 to-transparent" bgGlow="bg-rose-500/15"
              icon={<Columns className="w-5 h-5 text-white" />}
              title="Footer Settings" desc="About description and copyright text displayed in the site footer">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="About Text (Footer)" value={formData.aboutText} textarea rows={5} placeholder="Tell something about your site…"
                onChange={v => setFormData({ ...formData, aboutText: v })} />
              <Field label="Copyright Text" value={formData.copyrightText} textarea rows={5} placeholder="© {year} Tasteful. All rights reserved."
                onChange={v => setFormData({ ...formData, copyrightText: v })} />
            </div>
          </SectionPanel>
          )}

        </div>{/* end content col */}
      </div>{/* end main grid */}

      {/* Floating Save Button */}
      <button 
        onClick={handleSave}
        disabled={isUpdating || isUpdatingHero}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-8 py-4 bg-[#5850ec] hover:bg-[#4d45d1] text-white text-sm font-bold rounded-full transition-all shadow-[0_8px_30px_rgba(88,80,236,0.4)] hover:shadow-[0_12px_40px_rgba(88,80,236,0.6)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {(isUpdating || isUpdatingHero) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        <span>{(isUpdating || isUpdatingHero) ? 'Saving...' : 'Save Changes'}</span>
      </button>

    </div>
  );
}
