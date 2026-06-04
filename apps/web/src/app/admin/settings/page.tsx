'use client';

import { useGetHeroSettingsQuery, useUpdateHeroSettingsMutation } from '@/store/api/settingsApi';
import { 
  Save, Image as ImageIcon, Check, Loader2, 
  Settings, Globe, Mail, Share2, Wrench, 
  Database, Trash2, ChevronDown, RefreshCw, BookOpen
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const settingsNav = [
  { id: 'general', label: 'General', sub: 'Basic site settings and preferences', icon: Settings },
  { id: 'identity', label: 'Site Identity', sub: 'Logo, title and site information', icon: Globe },
  { id: 'pages', label: 'Pages Control', sub: 'Configure titles and descriptions of pages', icon: BookOpen },
  { id: 'email', label: 'Email Settings', sub: 'Configure email preferences', icon: Mail },
  { id: 'social', label: 'Social Profiles', sub: 'Social media links', icon: Share2 },
  { id: 'advanced', label: 'Advanced', sub: 'Custom code and advanced settings', icon: Wrench },
  { id: 'backup', label: 'Backup & Restore', sub: 'Backup or restore your data', icon: Database },
];

export default function SettingsPage() {
  const pathname = usePathname();
  const { data: heroSettings, isLoading } = useGetHeroSettingsQuery();
  const [updateHero, { isLoading: isUpdating }] = useUpdateHeroSettingsMutation();
  const [activeTab, setActiveTab] = useState('general');
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    email: 'hello@tastyrecipes.com',
    language: 'English (US)',
    timezone: '(UTC+05:30) Asia/Kolkata',
    dateFormat: 'May 31, 2024',
    footerText: '© 2024 Tasty Recipes. All rights reserved.',
    allowRegistration: true,
    enableComments: true,
    showPrepTime: true,
    enableNotifications: true,
    showNutrition: true,
    maintenanceMode: false
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (heroSettings) {
      setFormData(prev => ({
        ...prev,
        title: heroSettings.title,
        subtitle: heroSettings.subtitle,
      }));
    }
  }, [heroSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateHero({
        title: formData.title,
        subtitle: formData.subtitle,
        ctaText: heroSettings?.ctaText || 'Explore Recipes',
        imageUrl: heroSettings?.imageUrl || ''
      }).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-muted-foreground animate-pulse">Loading settings...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground/60 mt-1">Manage your website settings and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-xl transition-all">
            <RefreshCw className="w-4 h-4" />
            <span>Clear Cache</span>
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isUpdating}
            className="flex items-center gap-2 px-8 py-2.5 bg-[#5850ec] hover:bg-[#4d45d1] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#5850ec]/20 active:scale-95 disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-4 shadow-2xl">
            <div className="px-4 py-4 border-b border-white/5 mb-2">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Settings</h3>
            </div>
            <div className="space-y-1">
              {settingsNav.map((item) => {
                const href = item.id === 'general' ? '/admin/settings' : `/admin/settings/${item.id}`;
                const isActive = (item.id === 'general' && pathname === '/admin/settings') || (item.id !== 'general' && pathname.includes(item.id));
                
                return (
                  <Link
                    key={item.id}
                    href={href}
                    className={`w-full flex items-center gap-4 rounded-2xl px-4 py-4 transition-all duration-300 text-left group ${
                      isActive 
                        ? 'bg-[#5850ec]/10 text-white border border-[#5850ec]/20 shadow-[0_0_20px_rgba(88,80,236,0.1)]' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl transition-colors ${
                      isActive ? 'bg-[#5850ec] text-white shadow-lg shadow-[#5850ec]/40' : 'bg-white/5 text-slate-400 group-hover:text-white'
                    }`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{item.label}</span>
                      <span className="text-[10px] opacity-40 font-medium line-clamp-1">{item.sub}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 lg:p-10 shadow-2xl space-y-10">
            {/* General Settings Section */}
            <section className="space-y-8">
              <div>
                <h2 className="text-2xl font-black text-white mb-1">General Settings</h2>
                <p className="text-sm text-muted-foreground/60">Manage basic settings of your recipe website.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Site Title */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/90">Site Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-background border border-white/5 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
                  />
                  <p className="text-[11px] text-muted-foreground/40 italic">The name of your website.</p>
                </div>

                {/* Site Email */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/90">Site Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-background border border-white/5 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
                  />
                  <p className="text-[11px] text-muted-foreground/40 italic">This email will be used for important notifications.</p>
                </div>

                {/* Tagline */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/90">Tagline</label>
                  <input 
                    type="text" 
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    className="w-full bg-background border border-white/5 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
                  />
                  <p className="text-[11px] text-muted-foreground/40 italic">A short description of your website.</p>
                </div>

                {/* Site Language */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/90">Site Language</label>
                  <div className="relative">
                    <select className="appearance-none w-full bg-background border border-white/5 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] cursor-pointer">
                      <option>English (US)</option>
                      <option>Arabic</option>
                      <option>French</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-muted-foreground/40 italic">Select your website language.</p>
                </div>

                {/* Timezone */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/90">Timezone</label>
                  <div className="relative">
                    <select className="appearance-none w-full bg-background border border-white/5 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] cursor-pointer">
                      <option>(UTC+05:30) Asia/Kolkata</option>
                      <option>(UTC+00:00) Casablanca</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-muted-foreground/40 italic">Select your website timezone.</p>
                </div>

                {/* Date Format */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/90">Date Format</label>
                  <div className="relative">
                    <select className="appearance-none w-full bg-background border border-white/5 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] cursor-pointer">
                      <option>May 31, 2024</option>
                      <option>31/05/2024</option>
                      <option>2024-05-31</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-muted-foreground/40 italic">Select the date format.</p>
                </div>
              </div>
            </section>

            {/* Other Preferences Section */}
            <section className="space-y-8 pt-6 border-t border-white/5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Other Preferences</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                {[
                  { id: 'allowRegistration', label: 'Allow User Registration', desc: 'Allow new users to register on your website.' },
                  { id: 'enableNotifications', label: 'Enable Email Notifications', desc: 'Receive email notifications for important activities.' },
                  { id: 'enableComments', label: 'Enable Comments', desc: 'Allow users to comment on recipes.' },
                  { id: 'showNutrition', label: 'Show Nutrition Information', desc: 'Display nutrition facts on recipes.' },
                  { id: 'showPrepTime', label: 'Show Preparation Time', desc: 'Display preparation time on recipes.' },
                  { id: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Put your website in maintenance mode.' },
                ].map((pref) => (
                  <div key={pref.id} className="flex items-center justify-between group">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[14px] font-bold text-white/90 group-hover:text-white transition-colors">{pref.label}</span>
                      <span className="text-[11px] text-muted-foreground/40">{pref.desc}</span>
                    </div>
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, [pref.id]: !prev[pref.id as keyof typeof prev] }))}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData[pref.id as keyof typeof formData] ? 'bg-[#5850ec]' : 'bg-white/10'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData[pref.id as keyof typeof formData] ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Site Footer Text Section */}
            <section className="space-y-4 pt-6 border-t border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Site Footer Text</h2>
                <p className="text-[11px] text-muted-foreground/40 italic">This text will appear in the footer of your website.</p>
              </div>
              <textarea 
                rows={3}
                value={formData.footerText}
                onChange={(e) => setFormData({...formData, footerText: e.target.value})}
                className="w-full bg-background border border-white/5 rounded-xl p-5 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all resize-none"
              />
            </section>

            {/* Saved Notification */}
            {saved && (
              <div className="flex items-center gap-2 text-xs font-bold text-green-500 animate-bounce">
                <Check className="w-4 h-4" />
                <span>All changes saved successfully!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
