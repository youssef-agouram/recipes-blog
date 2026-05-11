'use client';

import { useState } from 'react';
import { 
  Save, Globe, Camera, Bird, PlayCircle, 
  Link2, Plus, Trash2, GripVertical, 
  ChevronDown, Info, Share2
} from 'lucide-react';
import Link from 'next/link';

export default function SocialProfilesPage() {
  const [shapeStyle, setShapeStyle] = useState('rounded');
  const [openIn, setOpenIn] = useState('new_tab');

  const socialPlatforms = [
    { id: 'fb', name: 'Facebook', url: 'https://facebook.com/tastyrecipes', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10', active: true },
    { id: 'ig', name: 'Instagram', url: 'https://instagram.com/tastyrecipes', icon: Camera, color: 'text-pink-500', bg: 'bg-pink-500/10', active: true },
    { id: 'tw', name: 'Twitter', url: 'https://twitter.com/tastyrecipes', icon: Bird, color: 'text-blue-400', bg: 'bg-blue-400/10', active: true },
    { id: 'pin', name: 'Pinterest', url: 'https://pinterest.com/tastyrecipes', icon: Share2, color: 'text-red-500', bg: 'bg-red-500/10', active: true },
    { id: 'yt', name: 'YouTube', url: 'https://youtube.com/@tastyrecipes', icon: PlayCircle, color: 'text-red-600', bg: 'bg-red-600/10', active: true },
    { id: 'li', name: 'LinkedIn', url: 'https://linkedin.com/company/tastyrecipes', icon: Link2, color: 'text-blue-700', bg: 'bg-blue-700/10', active: false },
    { id: 'tk', name: 'TikTok', url: 'https://tiktok.com/@tastyrecipes', icon: Globe, color: 'text-slate-200', bg: 'bg-white/10', active: false },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 py-4 bg-[#05060b]/80 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Social Profiles</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
            <Link href="/admin/settings" className="hover:text-white transition-colors">Settings</Link>
            <span className="opacity-30">&gt;</span>
            <span className="text-white/60 text-[10px]">Social Profiles</span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-8 py-2.5 bg-[#5850ec] hover:bg-[#4d45d1] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#5850ec]/40 active:scale-95">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: About & Tips */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">About Social Profiles</h2>
              <p className="text-sm text-muted-foreground/60 leading-relaxed">
                Add and manage your social media profiles. These links will be shown in the footer and other areas of your website.
              </p>
            </div>
            
            {/* Illustration Placeholder */}
            <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-[#5850ec]/20 to-transparent border border-white/10 flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <Share2 className="w-24 h-24 text-white" />
               </div>
               <div className="flex gap-3 relative z-10">
                  {[Globe, Camera, Bird, PlayCircle].map((Icon, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-6 bg-[#5850ec]/5 border border-[#5850ec]/10 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-[#5850ec]">
                <Info className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Tips</span>
              </div>
              <p className="text-[12px] text-slate-400 leading-relaxed font-medium">
                Add your active social media profiles to increase your reach and engage with your audience.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: List & Settings */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Social Profiles List */}
          <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-6 transition-all duration-500 hover:border-white/10">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Social Profiles List</h2>
              <p className="text-sm text-muted-foreground/60">Add your social media links and display them on your website.</p>
            </div>

            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-4 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-2">
                <div className="col-span-1"></div>
                <div className="col-span-3">Platform</div>
                <div className="col-span-4">URL</div>
                <div className="col-span-2">Icon</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              {socialPlatforms.map((social) => (
                <div key={social.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-all">
                  <div className="col-span-1 flex justify-center">
                    <GripVertical className="w-4 h-4 text-muted-foreground/20 group-hover:text-muted-foreground/60 cursor-grab" />
                  </div>
                  <div className="col-span-3 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${social.bg} flex items-center justify-center`}>
                      <social.icon className={`w-4 h-4 ${social.color}`} />
                    </div>
                    <span className="text-sm font-bold text-white">{social.name}</span>
                  </div>
                  <div className="col-span-4">
                    <input 
                      type="text" 
                      defaultValue={social.url}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-medium text-white/80 focus:outline-none focus:ring-1 focus:ring-[#5850ec]/50"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="relative">
                      <div className="flex items-center gap-2 p-2 bg-white/5 border border-white/10 rounded-xl cursor-pointer">
                        <social.icon className={`w-4 h-4 ${social.color}`} />
                        <ChevronDown className="w-3 h-3 text-muted-foreground/40" />
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${social.active ? 'bg-[#5850ec]' : 'bg-white/10'}`}>
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${social.active ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all border border-red-500/20">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <button className="w-full py-4 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl text-[11px] font-black text-[#5850ec] uppercase tracking-widest hover:bg-[#5850ec]/5 transition-all mt-4 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Profile
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Display Settings */}
            <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-8 transition-all duration-500 hover:border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Display Settings</h2>
                <p className="text-sm text-muted-foreground/60">Configure how social profiles are displayed.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-white/60 uppercase tracking-widest">Shape Style</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['rounded', 'circle', 'square'].map((style) => (
                      <button 
                        key={style}
                        onClick={() => setShapeStyle(style)}
                        className={`py-3 px-4 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${
                          shapeStyle === style 
                            ? 'bg-[#5850ec]/10 border-[#5850ec] text-white shadow-[0_0_15px_rgba(88,80,236,0.2)]' 
                            : 'bg-white/5 border-white/10 text-muted-foreground/60 hover:border-white/20'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-white/60 uppercase tracking-widest">Size</label>
                  <div className="relative">
                    <select 
                      defaultValue="Medium"
                      className="appearance-none w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] cursor-pointer"
                    >
                      <option>Small</option>
                      <option>Medium</option>
                      <option>Large</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-white/60 uppercase tracking-widest">Open Links In</label>
                  <div className="flex gap-6">
                    <button 
                      onClick={() => setOpenIn('new_tab')}
                      className="flex items-center gap-3 group cursor-pointer"
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${openIn === 'new_tab' ? 'border-[#5850ec]' : 'border-white/10 group-hover:border-white/20'}`}>
                        {openIn === 'new_tab' && <div className="w-2.5 h-2.5 rounded-full bg-[#5850ec]" />}
                      </div>
                      <span className={`text-[13px] font-bold ${openIn === 'new_tab' ? 'text-white' : 'text-muted-foreground/60'}`}>New Tab</span>
                    </button>
                    <button 
                      onClick={() => setOpenIn('same_tab')}
                      className="flex items-center gap-3 group cursor-pointer"
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${openIn === 'same_tab' ? 'border-[#5850ec]' : 'border-white/10 group-hover:border-white/20'}`}>
                        {openIn === 'same_tab' && <div className="w-2.5 h-2.5 rounded-full bg-[#5850ec]" />}
                      </div>
                      <span className={`text-[13px] font-bold ${openIn === 'same_tab' ? 'text-white' : 'text-muted-foreground/60'}`}>Same Tab</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Preview Section */}
            <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-8 transition-all duration-500 hover:border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Preview</h2>
                <p className="text-sm text-muted-foreground/60">This is how your social profiles will appear.</p>
              </div>

              <div className="flex flex-wrap gap-4 items-center justify-center py-6">
                {socialPlatforms.filter(s => s.active).map((social) => (
                  <div 
                    key={social.id}
                    className={`w-12 h-12 flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-lg ${
                      shapeStyle === 'rounded' ? 'rounded-2xl' : shapeStyle === 'circle' ? 'rounded-full' : 'rounded-none'
                    } ${social.bg} ${social.color} border border-white/10`}
                  >
                    <social.icon className="w-5 h-5" />
                  </div>
                ))}
              </div>

              <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-amber-500" />
                 </div>
                 <div className="space-y-1">
                    <span className="text-[12px] font-black text-amber-500 uppercase tracking-widest">Note</span>
                    <p className="text-[11px] text-amber-500/60 font-medium leading-relaxed">
                       Changes you make here will be reflected on your website after saving.
                    </p>
                 </div>
              </div>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}
