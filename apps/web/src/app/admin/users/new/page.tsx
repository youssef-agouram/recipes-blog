'use client';

import { useState } from 'react';
import { 
  ArrowLeft, Upload, Eye, EyeOff, UserPlus, 
  X, ChevronDown, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function AddNewUserPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState('active');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Add New User</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
            <Link href="/admin/users" className="hover:text-white transition-colors">Users</Link>
            <span className="opacity-30">&gt;</span>
            <span className="text-white/60">Add New User</span>
          </div>
        </div>
        <Link 
          href="/admin/users"
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Users</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Information */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-1">User Information</h2>
              <p className="text-sm text-muted-foreground/60">Add the basic information for the new user.</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/90">Full Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="Enter full name"
                    className="w-full bg-background border border-white/5 rounded-xl px-5 py-3 text-sm font-medium text-white placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
                  />
                  <p className="text-[11px] text-muted-foreground/40 italic">Enter the complete name of the user.</p>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/90">Username <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="Enter username"
                    className="w-full bg-background border border-white/5 rounded-xl px-5 py-3 text-sm font-medium text-white placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
                  />
                  <p className="text-[11px] text-muted-foreground/40 italic">This will be used for login and cannot be changed later.</p>
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/90">Email Address <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  placeholder="Enter email address"
                  className="w-full bg-background border border-white/5 rounded-xl px-5 py-3 text-sm font-medium text-white placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
                />
                <p className="text-[11px] text-muted-foreground/40 italic">Enter a valid email address.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/90">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter password"
                      className="w-full bg-background border border-white/5 rounded-xl pl-5 pr-12 py-3 text-sm font-medium text-white placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground/40 italic">Minimum 8 characters. Use a strong password.</p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/90">Confirm Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Confirm password"
                      className="w-full bg-background border border-white/5 rounded-xl pl-5 pr-12 py-3 text-sm font-medium text-white placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground/40 italic">Re-enter the password to confirm.</p>
                </div>
              </div>

              {/* Profile Picture */}
              <div className="space-y-3 pt-4">
                <label className="text-sm font-bold text-white/90">Profile Picture</label>
                <div className="border-2 border-dashed border-white/5 rounded-3xl p-10 flex flex-col items-center justify-center bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer group">
                  <div className="w-16 h-16 rounded-2xl bg-[#5850ec]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-[#5850ec]" />
                  </div>
                  <p className="text-sm font-medium text-white mb-1">Drag & drop an image here or</p>
                  <button className="text-xs font-black text-[#5850ec] uppercase tracking-widest hover:underline">Choose Image</button>
                  <p className="text-[10px] text-muted-foreground/40 mt-4 font-bold uppercase tracking-widest">Recommended size: 300x300px. JPG, PNG or WebP.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Role, Status & Additional */}
        <div className="space-y-8">
          {/* Role & Permissions */}
          <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white mb-1">Role & Permissions</h2>
              <p className="text-xs text-muted-foreground/60">Assign a role to the user and manage permissions.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/90">Role <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select className="appearance-none w-full bg-background border border-white/5 rounded-xl px-5 py-3 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#5850ec] cursor-pointer">
                    <option>Select a role</option>
                    <option>Administrator</option>
                    <option>Editor</option>
                    <option>Author</option>
                    <option>Subscriber</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" />
                </div>
                <p className="text-[11px] text-muted-foreground/40 italic">Choose a role to define the user's permissions.</p>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-white/90">Status</label>
                <div className="space-y-3">
                  {[
                    { id: 'active', label: 'Active', desc: 'Active users can access the system.' },
                    { id: 'inactive', label: 'Inactive', desc: 'Inactive users cannot access the system.' },
                    { id: 'pending', label: 'Pending', desc: 'Pending users will be able to login after approval.' },
                  ].map((item) => (
                    <label key={item.id} className="flex items-start gap-3 p-3 rounded-2xl border border-white/5 hover:bg-white/5 cursor-pointer transition-colors group">
                      <div className="relative flex items-center justify-center mt-0.5">
                        <input 
                          type="radio" 
                          name="status" 
                          checked={status === item.id}
                          onChange={() => setStatus(item.id)}
                          className="sr-only" 
                        />
                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                          status === item.id ? 'border-[#5850ec] bg-[#5850ec]' : 'border-white/10'
                        }`}>
                          {status === item.id && <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold transition-colors ${status === item.id ? 'text-white' : 'text-slate-400'}`}>
                          {item.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground/40">{item.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white mb-1">Additional Information</h2>
              <p className="text-xs text-muted-foreground/60">Add any additional information about the user.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/90">Phone Number</label>
                <input 
                  type="text" 
                  placeholder="Enter phone number"
                  className="w-full bg-background border border-white/5 rounded-xl px-5 py-3 text-sm font-medium text-white placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all"
                />
                <p className="text-[11px] text-muted-foreground/40 italic">Enter the user's contact number.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-white/90">Bio</label>
                <textarea 
                  rows={4}
                  placeholder="Enter short bio about the user"
                  className="w-full bg-background border border-white/5 rounded-xl px-5 py-3 text-sm font-medium text-white placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-[#5850ec] transition-all resize-none"
                />
                <p className="text-[11px] text-muted-foreground/40 italic">Brief description about the user.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 lg:left-[260px] right-0 p-6 bg-[#0a0b14]/80 backdrop-blur-md border-t border-white/5 flex items-center justify-end gap-4 z-10">
        <button className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-all border border-white/10">
          Cancel
        </button>
        <button className="flex items-center gap-2 px-10 py-3 bg-[#5850ec] hover:bg-[#4d45d1] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#5850ec]/20 active:scale-95">
          <UserPlus className="w-4 h-4" />
          <span>Create User</span>
        </button>
      </div>
    </div>
  );
}
