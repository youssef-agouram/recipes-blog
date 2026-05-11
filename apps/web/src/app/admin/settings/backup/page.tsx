'use client';

import { useState } from 'react';
import { 
  Save, Database, Clock, Calendar, Download, 
  Trash2, ShieldCheck, RefreshCw, Plus, 
  ChevronDown, AlertTriangle, Upload, FileText,
  Info, Check, History, HardDrive
} from 'lucide-react';
import Link from 'next/link';

export default function BackupRestorePage() {
  const [scheduledEnabled, setScheduledEnabled] = useState(true);

  const backupHistory = [
    { name: 'backup-2024-05-31-1030.zip', type: 'Manual', size: '128.4 MB', date: 'May 31, 2024 10:30 AM' },
    { name: 'backup-2024-05-30-1030.zip', type: 'Scheduled', size: '126.7 MB', date: 'May 30, 2024 10:30 AM' },
    { name: 'backup-2024-05-29-1030.zip', type: 'Scheduled', size: '125.1 MB', date: 'May 29, 2024 10:30 AM' },
    { name: 'backup-2024-05-28-1030.zip', type: 'Scheduled', size: '123.8 MB', date: 'May 28, 2024 10:30 AM' },
    { name: 'backup-2024-05-27-1030.zip', type: 'Scheduled', size: '122.3 MB', date: 'May 27, 2024 10:30 AM' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 py-4 bg-[#05060b]/80 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Backup & Restore</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
            <Link href="/admin/settings" className="hover:text-white transition-colors">Settings</Link>
            <span className="opacity-30">&gt;</span>
            <span className="text-white/60 text-[10px]">Backup & Restore</span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-8 py-2.5 bg-[#5850ec] hover:bg-[#4d45d1] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#5850ec]/40 active:scale-95">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Top Info Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-[#5850ec]/10 border border-[#5850ec]/20 rounded-[32px] p-8 flex items-center gap-6">
           <div className="w-16 h-16 rounded-[24px] bg-[#5850ec]/20 flex items-center justify-center border border-[#5850ec]/30 shadow-2xl">
             <ShieldCheck className="w-8 h-8 text-[#5850ec]" />
           </div>
           <div className="space-y-1">
             <h3 className="text-xl font-bold text-white">Protect Your Data</h3>
             <p className="text-sm text-slate-400 leading-relaxed">
               Regularly backup your website data to prevent data loss. You can also restore your website to any previous backup.
             </p>
           </div>
        </div>
        
        <div className="lg:col-span-3 bg-card/40 border border-white/5 rounded-[32px] p-6 flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
             <Clock className="w-6 h-6 text-muted-foreground/60" />
           </div>
           <div>
             <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Last Backup</p>
             <p className="text-sm font-bold text-white mt-0.5">May 31, 2024</p>
             <p className="text-[10px] text-muted-foreground/40">Manual Backup</p>
           </div>
        </div>

        <div className="lg:col-span-3 bg-card/40 border border-white/5 rounded-[32px] p-6 flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-[#5850ec]/10 flex items-center justify-center">
             <Calendar className="w-6 h-6 text-[#5850ec]" />
           </div>
           <div>
             <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Next Backup</p>
             <p className="text-sm font-bold text-white mt-0.5">June 1, 2024</p>
             <p className="text-[10px] text-green-500 font-bold uppercase tracking-tighter">Daily Schedule</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Create New Backup */}
          <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Create New Backup</h2>
              <p className="text-sm text-muted-foreground/60">Choose what you want to include in the backup and create a new backup file.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-black text-white/60 uppercase tracking-widest">Backup Content</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'db', label: 'Database (Required)', desc: 'All database tables and data', checked: true },
                    { id: 'files', label: 'Files', desc: 'Theme, plugins, and core files', checked: true },
                    { id: 'media', label: 'Media Files', desc: 'All uploaded images and videos', checked: true },
                    { id: 'settings', label: 'Other Settings', desc: 'Site configuration and logs', checked: true },
                  ].map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-all cursor-pointer">
                       <div className="mt-1">
                         <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${item.checked ? 'bg-[#5850ec] border-[#5850ec]' : 'border-white/10'}`}>
                           {item.checked && <Check className="w-3.5 h-3.5 text-white" />}
                         </div>
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[13px] font-bold text-white">{item.label}</span>
                         <span className="text-[11px] text-muted-foreground/40">{item.desc}</span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-white/60 uppercase tracking-widest">Backup Note (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Before updating theme"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50"
                />
              </div>

              <button className="flex items-center gap-2 px-8 py-3.5 bg-[#5850ec] hover:bg-[#4d45d1] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#5850ec]/40 active:scale-95">
                <RefreshCw className="w-4 h-4" />
                <span>Create Backup Now</span>
              </button>
            </div>
          </section>

          {/* Backup History */}
          <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Backup History</h2>
              <p className="text-sm text-muted-foreground/60">Manage and download your website backups.</p>
            </div>

            <div className="space-y-3">
               {backupHistory.map((backup, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-muted-foreground/40" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-white">{backup.name}</span>
                          <div className="flex items-center gap-3 mt-0.5">
                             <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${backup.type === 'Manual' ? 'bg-purple-500/10 text-purple-500' : 'bg-green-500/10 text-green-500'}`}>
                               {backup.type}
                             </span>
                             <span className="text-[10px] text-muted-foreground/40 font-bold">{backup.size}</span>
                             <span className="text-[10px] text-muted-foreground/20">•</span>
                             <span className="text-[10px] text-muted-foreground/40 font-bold">{backup.date}</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button className="p-2.5 bg-white/5 hover:bg-[#5850ec] text-slate-400 hover:text-white rounded-xl border border-white/10 transition-all">
                          <Download className="w-4 h-4" />
                       </button>
                       <button className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
               ))}
               <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all mt-4">
                 View All Backups
               </button>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Automatic Backup Schedule */}
          <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-0.5">Automatic Schedule</h2>
                <p className="text-sm text-muted-foreground/60">Keep your data safe automatically.</p>
              </div>
              <button 
                onClick={() => setScheduledEnabled(!scheduledEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${scheduledEnabled ? 'bg-[#5850ec]' : 'bg-white/10'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${scheduledEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className={`space-y-6 transition-opacity duration-300 ${scheduledEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
               <div className="space-y-2">
                 <label className="text-sm font-bold text-white/90">Schedule Frequency</label>
                 <div className="relative">
                   <select className="appearance-none w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] cursor-pointer">
                     <option>Daily</option>
                     <option>Weekly</option>
                     <option>Monthly</option>
                   </select>
                   <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-white/90">Backup Time</label>
                   <div className="relative">
                      <input type="time" defaultValue="10:30" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]" />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-white/90">Retention (Days)</label>
                   <div className="relative">
                      <input type="number" defaultValue="7" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec]" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/40 uppercase">Days</span>
                   </div>
                 </div>
               </div>

               <div className="p-4 bg-[#5850ec]/5 border border-[#5850ec]/10 rounded-2xl flex gap-3">
                  <Info className="w-4 h-4 text-[#5850ec] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    Scheduled backups will be stored on your server. Make sure you have enough disk space.
                  </p>
               </div>
            </div>
          </section>

          {/* Restore Backup */}
          <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Restore Backup</h2>
              <p className="text-sm text-muted-foreground/60">Upload a backup file and restore your website.</p>
            </div>

            <div className="space-y-6">
               <div className="w-full h-48 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-[#5850ec]/50 hover:bg-[#5850ec]/5 transition-all cursor-pointer group">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform shadow-xl">
                    <Upload className="w-7 h-7 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-bold text-white">Drag & drop your backup file here</p>
                    <p className="text-[10px] text-muted-foreground/40 mt-1 uppercase font-bold tracking-widest">or click to browse files</p>
                  </div>
                  <button className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all">
                    Choose File
                  </button>
               </div>

               <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-2xl flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                 </div>
                 <div className="space-y-1">
                    <span className="text-[12px] font-black text-red-500 uppercase tracking-widest">Warning</span>
                    <p className="text-[11px] text-red-500/60 font-medium leading-relaxed">
                       Restoring your website will replace all current data. This action cannot be undone.
                    </p>
                 </div>
              </div>

              <button disabled className="w-full py-3.5 bg-white/5 text-muted-foreground/20 text-xs font-black uppercase tracking-widest rounded-xl border border-white/5 cursor-not-allowed">
                Restore Now
              </button>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
