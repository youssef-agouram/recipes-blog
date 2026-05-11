'use client';

import { useState } from 'react';
import { 
  Save, Mail, Server, Send, Bell, FileText, 
  ChevronDown, Eye, EyeOff, Check, UserPlus, 
  BookOpen, MessageCircle, Key, Trash2, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function EmailSettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);

  const notificationToggles = [
    { id: 'user_reg', label: 'New User Registration', desc: 'Receive an email when a new user registers.', icon: UserPlus, color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'recipe_sub', label: 'New Recipe Submission', desc: 'Receive an email when a new recipe is submitted.', icon: BookOpen, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'comment', label: 'New Comment', desc: 'Receive an email when a new comment is posted.', icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'contact', label: 'Contact Form Messages', desc: 'Receive an email when someone sends a message.', icon: Mail, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'pass_reset', label: 'Password Reset Request', desc: 'Receive an email when a password reset is requested.', icon: Key, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'newsletter', label: 'Weekly Newsletter', desc: 'Receive weekly newsletter summary.', icon: Send, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 py-4 bg-[#05060b]/80 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Email Settings</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
            <Link href="/admin/settings" className="hover:text-white transition-colors">Settings</Link>
            <span className="opacity-30">&gt;</span>
            <span className="text-white/60 text-[10px]">Email Settings</span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-8 py-2.5 bg-[#5850ec] hover:bg-[#4d45d1] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#5850ec]/40 active:scale-95">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Configuration & Templates */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Email Configuration */}
          <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-8 transition-all duration-500 hover:border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#5850ec]/10 flex items-center justify-center border border-[#5850ec]/20">
                <Server className="w-6 h-6 text-[#5850ec]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-0.5">Email Configuration</h2>
                <p className="text-sm text-muted-foreground/60">Configure your email service to send emails from your website.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/90">Mail Driver</label>
                <div className="relative">
                  <select className="appearance-none w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50 cursor-pointer">
                    <option>SMTP</option>
                    <option>Mailgun</option>
                    <option>Postmark</option>
                    <option>SES</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" />
                </div>
                <p className="text-[11px] text-muted-foreground/40 italic">Select the mail driver to send emails.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-white/90">Host</label>
                  <input type="text" defaultValue="smtp.gmail.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50" />
                  <p className="text-[11px] text-muted-foreground/40 italic">SMTP server host.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/90">Port</label>
                  <input type="text" defaultValue="587" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50" />
                  <p className="text-[11px] text-muted-foreground/40 italic">SMTP server port.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/90">Encryption</label>
                  <div className="relative">
                    <select className="appearance-none w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50 cursor-pointer">
                      <option>TLS</option>
                      <option>SSL</option>
                      <option>None</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 mt-6">
                   <div className="flex flex-col">
                     <span className="text-sm font-bold text-white">Authentication</span>
                     <span className="text-[10px] text-muted-foreground/60 italic">Enable SMTP authentication</span>
                   </div>
                   <button className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-[#5850ec]">
                     <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/90">Username</label>
                  <input type="text" defaultValue="your-email@gmail.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50" />
                  <p className="text-[11px] text-muted-foreground/40 italic">SMTP username or email address.</p>
                </div>
                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-white/90">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      defaultValue="••••••••••••••••" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50 pr-12" 
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground/40 italic">SMTP account password.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/90">From Email Address</label>
                  <input type="email" defaultValue="noreply@tastyrecipes.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50" />
                  <p className="text-[11px] text-muted-foreground/40 italic">This email address will be used as the sender.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/90">From Name</label>
                  <input type="text" defaultValue="Tasty Recipes" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50" />
                  <p className="text-[11px] text-muted-foreground/40 italic">This name will appear as the sender name.</p>
                </div>
              </div>

              <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 group">
                <Send className="w-4 h-4 text-[#5850ec] group-hover:translate-x-1 transition-transform" />
                <span>Send Test Email</span>
              </button>
            </div>
          </section>

          {/* Email Templates */}
          <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-8 transition-all duration-500 hover:border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#5850ec]/10 flex items-center justify-center border border-[#5850ec]/20">
                <FileText className="w-6 h-6 text-[#5850ec]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-0.5">Email Templates</h2>
                <p className="text-sm text-muted-foreground/60">Manage and customize your email templates.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Welcome Email', desc: 'Sent to new users when they register.', icon: UserPlus, color: 'text-green-500', bg: 'bg-green-500/10' },
                { label: 'Password Reset Email', desc: 'Sent to users when they request password reset.', icon: Key, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { label: 'Email Verification', desc: 'Sent to users to verify their email address.', icon: Check, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'New Comment Email', desc: 'Sent when a new comment is posted.', icon: MessageCircle, color: 'text-purple-500', bg: 'bg-purple-500/10' },
              ].map((template) => (
                <div key={template.label} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-white/10 hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${template.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <template.icon className={`w-5 h-5 ${template.color}`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-white">{template.label}</span>
                      <span className="text-[11px] text-muted-foreground/40">{template.desc}</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white/5 hover:bg-[#5850ec] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5 hover:border-[#5850ec] shadow-lg">
                    Edit Template
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Notifications, Test, Log */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Email Notifications */}
          <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-8 transition-all duration-500 hover:border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#5850ec]/10 flex items-center justify-center border border-[#5850ec]/20">
                <Bell className="w-6 h-6 text-[#5850ec]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-0.5">Email Notifications</h2>
                <p className="text-sm text-muted-foreground/60">Choose which email notifications you want to enable.</p>
              </div>
            </div>

            <div className="space-y-4">
              {notificationToggles.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-white">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground/40 line-clamp-1">{item.desc}</span>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-[#5850ec]">
                    <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Test Email */}
          <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-6 transition-all duration-500 hover:border-white/10">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Test Email</h2>
              <p className="text-sm text-muted-foreground/60">Send a test email to make sure your email configuration is working.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/90">Send To</label>
                <div className="flex gap-3">
                  <input type="email" defaultValue="admin@tastyrecipes.com" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50" />
                  <button 
                    onClick={() => {
                      setTestEmailSent(true);
                      setTimeout(() => setTestEmailSent(false), 5000);
                    }}
                    className="flex items-center gap-2 px-6 bg-[#5850ec] hover:bg-[#4d45d1] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#5850ec]/40 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>

              {testEmailSent && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 animate-in zoom-in duration-300">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-green-500">Last Test Email</span>
                    <span className="text-[10px] text-green-500/60 font-medium">Test email sent successfully to admin@tastyrecipes.com</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Email Log */}
          <section className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl space-y-6 transition-all duration-500 hover:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-0.5">Email Log</h2>
                <p className="text-sm text-muted-foreground/60">View the recent email activity and delivery status.</p>
              </div>
              <button className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 rounded-xl transition-all">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { recipient: 'user@example.com', subject: 'Welcome to Tasty Recipes', status: 'Delivered', date: 'May 31, 2024 10:30 AM' },
                { recipient: 'john.doe@gmail.com', subject: 'Password Reset Request', status: 'Delivered', date: 'May 30, 2024 02:15 PM' },
                { recipient: 'chef.mary@outlook.com', subject: 'New Comment Notification', status: 'Failed', date: 'May 30, 2024 11:45 AM' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] font-bold text-white">{log.recipient}</span>
                    <span className="text-[10px] text-muted-foreground/40 font-medium">{log.subject}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      log.status === 'Delivered' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {log.status}
                    </span>
                    <span className="text-[9px] text-muted-foreground/20 font-bold">{log.date}</span>
                  </div>
                </div>
              ))}
              <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-xl border border-white/5 transition-all mt-2">
                View All Logs
              </button>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
