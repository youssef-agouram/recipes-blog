'use client';

import { useState, useEffect } from 'react';
import { 
  Save, Zap, Shield, Search, Code, 
  BarChart3, FileQuestion, Power, 
  Download, Upload, ChevronDown, Check, 
  AlertCircle, ExternalLink, Settings,
  Cpu, Lock, Globe, Share2, Wrench, 
  FileText, History, Trash2, Layout,
  Image as ImageIcon, Eye, EyeOff, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { 
  useGetSiteSettingsQuery, 
  useUpdateSiteSettingsMutation,
  useTestCloudinarySettingsMutation
} from '@/store/api/settingsApi';
import {
  useGetAnalyticsSettingsQuery,
  useUpdateAnalyticsSettingsMutation
} from '@/store/api/seoApi';

export default function AdvancedSettingsPage() {
  const [activeTab, setActiveTab] = useState('cloudinary');

  // Cloudinary Settings Hooks & State
  const { data: settings, isLoading: isLoadingSettings } = useGetSiteSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSiteSettingsMutation();
  const [testCloudinary, { isLoading: isTesting }] = useTestCloudinarySettingsMutation();

  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('');
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState('');
  const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Google Analytics Settings Hooks & State
  const { data: analyticsSettings, isLoading: isLoadingAnalytics } = useGetAnalyticsSettingsQuery();
  const [updateAnalytics, { isLoading: isUpdatingAnalytics }] = useUpdateAnalyticsSettingsMutation();

  const [ga4Id, setGa4Id] = useState('');
  const [gtmId, setGtmId] = useState('');
  const [ga4PropertyId, setGa4PropertyId] = useState('');
  const [ga4ServiceAccount, setGa4ServiceAccount] = useState('');
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [customScriptsCode, setCustomScriptsCode] = useState('');

  useEffect(() => {
    if (settings) {
      setCloudinaryCloudName(settings.cloudinaryCloudName || '');
      setCloudinaryApiKey(settings.cloudinaryApiKey || '');
      setCloudinaryApiSecret(settings.cloudinaryApiSecret || '');
    }
  }, [settings]);

  useEffect(() => {
    if (analyticsSettings) {
      setGa4Id(analyticsSettings.ga4Id || analyticsSettings.googleAnalyticsId || '');
      setGtmId(analyticsSettings.gtmId || '');
      setGa4PropertyId(analyticsSettings.ga4PropertyId || '');
      setGa4ServiceAccount(analyticsSettings.ga4ServiceAccount || '');
      setAnalyticsEnabled(analyticsSettings.analyticsEnabled ?? true);
      setDebugMode(analyticsSettings.debugMode ?? false);
      setCustomScriptsCode(analyticsSettings.customScriptsCode || '');
    }
  }, [analyticsSettings]);

  const handleSave = async () => {
    try {
      if (activeTab === 'cloudinary') {
        await updateSettings({
          ...settings,
          cloudinaryCloudName,
          cloudinaryApiKey,
          cloudinaryApiSecret
        }).unwrap();
      } else if (activeTab === 'analytics') {
        await updateAnalytics({
          googleAnalyticsId: ga4Id,
          ga4Id,
          gtmId,
          ga4PropertyId,
          ga4ServiceAccount,
          analyticsEnabled,
          debugMode,
          customScriptsCode
        }).unwrap();
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save advanced settings:', err);
    }
  };

  const handleTestConnection = async () => {
    setTestResult(null);
    if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
      setTestResult({ success: false, message: 'Please fill in all Cloudinary fields first.' });
      return;
    }
    try {
      const res = await testCloudinary({
        cloudName: cloudinaryCloudName,
        apiKey: cloudinaryApiKey,
        apiSecret: cloudinaryApiSecret
      }).unwrap();
      setTestResult({ success: true, message: res.message || 'Connection successful!' });
    } catch (err: any) {
      console.error('Connection test failed:', err);
      setTestResult({ success: false, message: err.data?.error || 'Connection failed. Please check credentials.' });
    }
  };

  const tabs = [
    { id: 'cloudinary', label: 'Cloudinary Settings', icon: ImageIcon, sub: 'Cloud media storage' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, sub: 'Tracking codes' },
    { id: 'performance', label: 'Performance', icon: Zap, sub: 'Optimize speed' },
    { id: 'security', label: 'Security', icon: Shield, sub: 'Site protection' },
    { id: 'maintenance', label: 'Maintenance', icon: Power, sub: 'Mode toggle' },
  ];

  const [toggles, setToggles] = useState({
    caching: true,
    minify_css: true,
    minify_js: true,
    lazy_load: true,
    preload: false,
    force_https: true,
    security_headers: true,
    disable_editing: true,
    limit_login: true,
  });

  const handleToggle = (id: string) => {
    setToggles(prev => ({ ...prev, [id]: !prev[id as keyof typeof prev] }));
  };

  if (isLoadingSettings || isLoadingAnalytics) {
    return <div className="p-10 text-center text-muted-foreground animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 py-4 bg-[#05060b]/80 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Advanced Settings</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
            <Link href="/admin/settings" className="hover:text-white transition-colors">Settings</Link>
            <span className="opacity-30">&gt;</span>
            <span className="text-white/60 text-[10px]">Advanced</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-2 text-xs font-bold text-green-500 animate-bounce">
              <Check className="w-4 h-4" />
              <span>Changes Saved!</span>
            </div>
          )}
          {['cloudinary', 'analytics'].includes(activeTab) && (
            <button 
              onClick={handleSave}
              disabled={isUpdating || isUpdatingAnalytics}
              className="flex items-center gap-2 px-8 py-2.5 bg-[#5850ec] hover:bg-[#4d45d1] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#5850ec]/40 active:scale-95 disabled:opacity-50"
            >
              {(isUpdating || isUpdatingAnalytics) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{(isUpdating || isUpdatingAnalytics) ? 'Saving...' : 'Save Changes'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Tabs */}
        <div className="lg:col-span-3 space-y-4 sticky top-28">
           <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-4 shadow-2xl">
              <div className="px-4 py-4 border-b border-white/5 mb-2">
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Advanced Menu</h3>
              </div>
              <div className="space-y-1">
                 {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-4 rounded-2xl px-4 py-4 transition-all duration-300 text-left group ${
                        activeTab === tab.id 
                          ? 'bg-[#5850ec]/10 text-white border border-[#5850ec]/20 shadow-[0_0_20px_rgba(88,80,236,0.1)]' 
                          : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl transition-colors ${
                        activeTab === tab.id ? 'bg-[#5850ec] text-white shadow-lg shadow-[#5850ec]/40' : 'bg-white/5 text-slate-400 group-hover:text-white'
                      }`}>
                        <tab.icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{tab.label}</span>
                        <span className="text-[10px] opacity-40 font-medium line-clamp-1">{tab.sub}</span>
                      </div>
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-8">
           
           {/* Cloudinary Settings Section */}
           {activeTab === 'cloudinary' && (
              <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-8 transition-all duration-500 hover:border-white/10 w-full animate-in fade-in duration-300">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#5850ec]/10 flex items-center justify-center border border-[#5850ec]/20">
                       <ImageIcon className="w-6 h-6 text-[#5850ec]" />
                    </div>
                    <div>
                       <h2 className="text-xl font-bold text-white mb-0.5">Cloudinary Media Storage</h2>
                       <p className="text-[12px] text-muted-foreground/40 leading-tight italic">Configure Cloudinary credentials for recipe image and video uploads.</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-white/90">Cloud Name</label>
                       <input 
                         type="text" 
                         value={cloudinaryCloudName} 
                         onChange={(e) => setCloudinaryCloudName(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]" 
                         placeholder="e.g. dpwkmt5kr"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-bold text-white/90">API Key</label>
                       <input 
                         type="text" 
                         value={cloudinaryApiKey} 
                         onChange={(e) => setCloudinaryApiKey(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]" 
                         placeholder="e.g. 588574244871288"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-bold text-white/90">API Secret</label>
                       <div className="relative">
                         <input 
                           type={showSecret ? "text" : "password"} 
                           value={cloudinaryApiSecret} 
                           onChange={(e) => setCloudinaryApiSecret(e.target.value)}
                           className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 pr-12 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]" 
                           placeholder="e.g. iIBcQz592b1VO0rCkiDndG8FoLM"
                         />
                         <button 
                           type="button"
                           onClick={() => setShowSecret(!showSecret)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-white"
                         >
                           {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                         </button>
                       </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center gap-4">
                       <button 
                         type="button"
                         onClick={handleTestConnection}
                         disabled={isTesting}
                         className="w-full sm:w-auto px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-white/10 disabled:opacity-50 flex items-center justify-center gap-2"
                       >
                         {isTesting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                         <span>Test Connection</span>
                       </button>

                       {testResult && (
                         <div className={`text-xs font-bold ${testResult.success ? 'text-green-500' : 'text-red-500'} flex items-center gap-2`}>
                           {testResult.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                           <span>{testResult.message}</span>
                         </div>
                       )}
                    </div>
                 </div>
              </section>
           )}

           {/* Analytics Settings Section */}
           {activeTab === 'analytics' && (
              <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-8 transition-all duration-500 hover:border-white/10 w-full animate-in fade-in duration-300">
                 <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-[#5850ec]/10 flex items-center justify-center border border-[#5850ec]/20">
                          <BarChart3 className="w-6 h-6 text-[#5850ec]" />
                       </div>
                       <div>
                          <h2 className="text-xl font-bold text-white mb-0.5">Google Analytics (GA4)</h2>
                          <p className="text-[12px] text-muted-foreground/40 leading-tight italic">Configure global website tracking codes and analytics engines.</p>
                       </div>
                    </div>
                    
                    {/* Master Switch Toggle */}
                    <button 
                      type="button"
                      onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        analyticsEnabled 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      {analyticsEnabled ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-400" />
                          Analytics Active
                        </>
                      ) : (
                        <>
                          <Power className="h-4 w-4 text-slate-500" />
                          Analytics Suspended
                        </>
                      )}
                    </button>
                 </div>

                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-white/90">GA4 Measurement ID</label>
                          <input 
                            type="text" 
                            value={ga4Id} 
                            onChange={(e) => setGa4Id(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]" 
                            placeholder="e.g. G-R2BCX12345"
                          />
                          <p className="text-[10px] text-muted-foreground/40">The primary measurement identifier for Google Analytics 4 tracking.</p>
                       </div>

                       <div className="space-y-2">
                          <label className="text-sm font-bold text-white/90">Google Tag Manager ID (Optional)</label>
                          <input 
                            type="text" 
                            value={gtmId} 
                            onChange={(e) => setGtmId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]" 
                            placeholder="e.g. GTM-XXXXXXX"
                          />
                          <p className="text-[10px] text-muted-foreground/40">Provide to boot Tag Manager tags concurrently alongside Google Analytics.</p>
                       </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                        <div className="space-y-2">
                           <label className="text-sm font-bold text-white/90">GA4 Property ID (For Dashboard API)</label>
                           <input 
                             type="text" 
                             value={ga4PropertyId} 
                             onChange={(e) => setGa4PropertyId(e.target.value)}
                             className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]" 
                             placeholder="e.g. 312345678"
                           />
                           <p className="text-[10px] text-muted-foreground/40">The numeric property identifier to query the GA4 Reporting API.</p>
                        </div>

                        <div className="space-y-2">
                           <label className="text-sm font-bold text-white/90">Google Cloud Service Account JSON Key</label>
                           <textarea 
                             rows={3}
                             value={ga4ServiceAccount} 
                             onChange={(e) => setGa4ServiceAccount(e.target.value)}
                             className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-[11px] text-indigo-300 font-mono focus:outline-none focus:ring-1 focus:ring-[#5850ec] resize-none" 
                             placeholder='e.g. { "type": "service_account", ... }'
                           />
                           <p className="text-[10px] text-muted-foreground/40">Provide the JSON credentials file content for authenticated Google Analytics Data API queries.</p>
                        </div>
                     </div>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl">
                       <div className="space-y-1">
                          <p className="text-xs font-bold text-white flex items-center gap-2">
                             Enable GA4 Debug Mode
                          </p>
                          <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                             Sends pageviews and custom interaction events with debug directives, visible instantly inside GA4's Realtime DebugView.
                          </p>
                       </div>
                       <button 
                         type="button"
                         onClick={() => setDebugMode(!debugMode)}
                         className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                           debugMode ? 'bg-[#5850ec]' : 'bg-white/10'
                         }`}
                       >
                         <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                           debugMode ? 'translate-x-5' : 'translate-x-0'
                         }`} />
                       </button>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/5">
                       <label className="text-xs font-black text-white/60 uppercase tracking-widest">Custom Tracking/Verification Scripts</label>
                       <textarea 
                         rows={4}
                         value={customScriptsCode}
                         onChange={(e) => setCustomScriptsCode(e.target.value)}
                         placeholder="e.g. <!-- Custom scripts here -->"
                         className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-[12px] font-mono text-indigo-400 focus:outline-none focus:ring-1 focus:ring-[#5850ec] resize-none leading-relaxed"
                       />
                       <p className="text-[10px] text-muted-foreground/40">Inject auxiliary HTML scripts (like Pinterest pixel or custom verification tags) directly into the head element.</p>
                    </div>
                 </div>
              </section>
           )}

           {/* Performance & Cache */}
           {activeTab === 'performance' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full animate-in fade-in duration-300">
                 {/* Performance Settings */}
                 <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-8 transition-all duration-500 hover:border-white/10">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-[#5850ec]/10 flex items-center justify-center border border-[#5850ec]/20">
                          <Zap className="w-6 h-6 text-[#5850ec]" />
                       </div>
                       <div>
                          <h2 className="text-xl font-bold text-white mb-0.5">Performance Settings</h2>
                          <p className="text-[12px] text-muted-foreground/40 leading-tight italic">Optimize your website performance and loading speed.</p>
                       </div>
                    </div>

                    <div className="space-y-5">
                       {[
                         { id: 'caching', label: 'Enable Caching', desc: 'Store static files and pages in cache to reduce server load.' },
                         { id: 'minify_css', label: 'Minify CSS Files', desc: 'Minify CSS files to reduce file size.' },
                         { id: 'minify_js', label: 'Minify JavaScript Files', desc: 'Minify JavaScript files to improve loading speed.' },
                         { id: 'lazy_load', label: 'Lazy Load Images', desc: 'Load images only when they appear in the viewport.' },
                         { id: 'preload', label: 'Preload Key Requests', desc: 'Preload important resources to improve perceived performance.' },
                       ].map((item) => (
                         <div key={item.id} className="flex items-center justify-between group">
                            <div className="flex flex-col gap-0.5 max-w-[80%]">
                               <span className="text-[13px] font-bold text-white/90 group-hover:text-white transition-colors">{item.label}</span>
                               <span className="text-[10px] text-muted-foreground/40 leading-relaxed font-medium">{item.desc}</span>
                            </div>
                            <button 
                              onClick={() => handleToggle(item.id)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${toggles[item.id as keyof typeof toggles] ? 'bg-[#5850ec]' : 'bg-white/10'}`}
                            >
                              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${toggles[item.id as keyof typeof toggles] ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                         </div>
                       ))}
                    </div>
                 </section>

                 {/* Cache Settings */}
                 <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-8 transition-all duration-500 hover:border-white/10">
                    <div>
                       <h2 className="text-xl font-bold text-white mb-1">Cache Settings</h2>
                       <p className="text-sm text-muted-foreground/60">Configure cache behavior.</p>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-white/90">Cache TTL</label>
                          <div className="relative">
                             <select defaultValue="24 Hours" className="appearance-none w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] cursor-pointer">
                                <option>1 Hour</option>
                                <option>12 Hours</option>
                                <option>24 Hours</option>
                                <option>7 Days</option>
                             </select>
                             <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" />
                          </div>
                          <p className="text-[10px] text-muted-foreground/40 italic mt-1">Time to live for cached data.</p>
                       </div>

                       <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                          <div className="flex flex-col">
                             <span className="text-sm font-bold text-white">Clear Cache</span>
                             <span className="text-[10px] text-muted-foreground/40">Clear all cached files and data.</span>
                          </div>
                          <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-red-500/20">
                             <Trash2 className="w-3.5 h-3.5" />
                             <span>Clear</span>
                          </button>
                       </div>

                       <div className="space-y-2">
                          <label className="text-sm font-bold text-white/90">Cache Exclusions</label>
                          <textarea 
                            rows={3}
                            defaultValue="/wp-admin/*, /cart/*, /checkout/*"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] resize-none"
                          />
                          <p className="text-[10px] text-muted-foreground/40 italic">Separate multiple patterns with commas.</p>
                       </div>
                    </div>
                 </section>
              </div>
           )}

           {/* Security & Other Settings */}
           {activeTab === 'security' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full animate-in fade-in duration-300">
                 {/* Security Settings */}
                 <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-8 transition-all duration-500 hover:border-white/10">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-[#5850ec]/10 flex items-center justify-center border border-[#5850ec]/20">
                          <Shield className="w-6 h-6 text-[#5850ec]" />
                       </div>
                       <div>
                          <h2 className="text-xl font-bold text-white mb-0.5">Security Settings</h2>
                          <p className="text-[12px] text-muted-foreground/40 leading-tight italic">Enhance your website security and protect from common threats.</p>
                       </div>
                    </div>

                    <div className="space-y-5">
                       {[
                         { id: 'force_https', label: 'Force HTTPS', desc: 'Redirect all requests to HTTPS.' },
                         { id: 'security_headers', label: 'Enable Security Headers', desc: 'Add security headers to protect your website.' },
                         { id: 'disable_editing', label: 'Disable File Editing', desc: 'Disallow file editing from dashboard.' },
                         { id: 'limit_login', label: 'Limit Login Attempts', desc: 'Limit the number of login attempts to prevent brute force attacks.' },
                       ].map((item) => (
                         <div key={item.id} className="flex items-center justify-between group">
                            <div className="flex flex-col gap-0.5 max-w-[80%]">
                               <span className="text-[13px] font-bold text-white/90 group-hover:text-white transition-colors">{item.label}</span>
                               <span className="text-[10px] text-muted-foreground/40 leading-relaxed font-medium">{item.desc}</span>
                            </div>
                            <button 
                              onClick={() => handleToggle(item.id)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${toggles[item.id as keyof typeof toggles] ? 'bg-[#5850ec]' : 'bg-white/10'}`}
                            >
                              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${toggles[item.id as keyof typeof toggles] ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                         </div>
                       ))}
                    </div>
                 </section>

                 {/* Other Advanced Settings */}
                 <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-8 transition-all duration-500 hover:border-white/10">
                    <div>
                       <h2 className="text-xl font-bold text-white mb-1">Other Settings</h2>
                       <p className="text-sm text-muted-foreground/60">Additional advanced settings for your website.</p>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-white/90">Session Lifetime</label>
                          <div className="relative">
                             <input type="number" defaultValue="48" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]" />
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/40 uppercase">Hours</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground/40 italic mt-1">Set how long user sessions should last.</p>
                       </div>

                       <div className="space-y-2">
                          <label className="text-sm font-bold text-white/90">Heartbeat Interval</label>
                          <div className="relative">
                             <input type="number" defaultValue="60" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]" />
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/40 uppercase">Seconds</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground/40 italic mt-1">Control website heartbeat API interval.</p>
                       </div>

                       <div className="space-y-2">
                          <label className="text-sm font-bold text-white/90">Excerpt Length</label>
                          <div className="relative">
                             <input type="number" defaultValue="30" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]" />
                          </div>
                          <p className="text-[10px] text-muted-foreground/40 italic mt-1">Default excerpt length for your website.</p>
                       </div>
                    </div>
                 </section>
              </div>
           )}

           {/* Placeholder for Maintenance */}
           {activeTab === 'maintenance' && (
              <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-10 shadow-2xl flex flex-col items-center justify-center text-center space-y-4 w-full min-h-[300px] animate-in fade-in duration-300">
                 <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <Wrench className="w-8 h-8 text-muted-foreground/40" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                       Maintenance Window
                    </h3>
                    <p className="text-sm text-muted-foreground/40 max-w-md mx-auto mt-2 leading-relaxed">
                       Maintenance mode configurations and landing templates can be configured inside the main site controls.
                    </p>
                 </div>
              </section>
           )}

        </div>
      </div>
    </div>
  );
}

function RefreshCw(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M3 21v-5h5"/>
    </svg>
  );
}
