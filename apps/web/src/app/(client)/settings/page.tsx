'use client';

import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { useUpdateUserDetailsMutation } from '@/store/api/userApi';
import { useUploadImageMutation } from '@/store/api/recipeApi';
import { updateUser } from '@/store/slices/authSlice';
import { toast } from 'sonner';
import { ArrowLeft, User, Mail, Upload, Camera, Loader2, Settings, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { LazyMotion, domAnimation, m } from 'framer-motion';

export default function AccountSettingsPage() {
  const { isAuthenticated, isHydrating, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  console.log('[SettingsPage] Render:', { isHydrating, isAuthenticated, user });

  const [updateUserDetails, { isLoading: isUpdating }] = useUpdateUserDetailsMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('[SettingsPage] Mount / State Change:', { isHydrating, isAuthenticated, userExists: !!user });
    if (isHydrating) return;

    if (!isAuthenticated) {
      console.log('[SettingsPage] Redirecting to /login because isAuthenticated is false');
      router.push('/login?redirect=/settings');
    } else if (user) {
      console.log('[SettingsPage] Initializing form with user details:', { email: user.email, name: user.name, avatar: user.avatar });
      setEmail(user.email || '');
      setName(user.name || '');
      setAvatar(user.avatar || null);
    }
  }, [isAuthenticated, isHydrating, user, router]);

  if (isHydrating) {
    console.log('[SettingsPage] Rendering Loading Spinner (isHydrating is true)');
    return (
      <div className="container mx-auto px-6 max-w-[1536px] py-12 min-h-[75vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('[SettingsPage] Returning null: isAuthenticated is false or user is null', { isAuthenticated, userExists: !!user });
    return null;
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File is too large. Please upload an image under 10MB.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await uploadImage(formData).unwrap();
      setAvatar(response.imageUrl);
      toast.success('Avatar uploaded successfully!');
    } catch (err: any) {
      console.error('Failed to upload avatar:', err);
      toast.error(err?.data?.error || 'Failed to upload avatar. Please try again.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const updated = await updateUserDetails({
        id: user.id,
        name: name.trim() || null as any,
        email: email.trim(),
        avatar: avatar,
      }).unwrap();

      // Update Redux state and localStorage
      dispatch(updateUser({
        name: updated.name || undefined,
        email: updated.email,
        avatar: updated.avatar || undefined,
      }));

      toast.success('Account settings saved successfully!');
    } catch (err: any) {
      console.error('Failed to update details:', err);
      toast.error(err?.data?.error || 'Failed to update account details.');
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="container mx-auto px-6 max-w-[1536px] py-12 min-h-[75vh]">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/10">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <Link href="/" className="flex items-center gap-2 text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to home
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2 font-heading">
            Account <span className="text-primary">Settings</span>
          </h1>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
            Manage your credentials and profile information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Area */}
          <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-card/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
            
            <form onSubmit={handleSave} className="space-y-8 relative">
              {/* Profile Avatar Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
                <div 
                  onClick={handleAvatarClick}
                  className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-4 ring-white/10 hover:ring-primary/50 transition-all duration-300 cursor-pointer shadow-xl shrink-0"
                >
                  {avatar ? (
                    <Image 
                      src={avatar} 
                      alt="Avatar Preview" 
                      fill 
                      sizes="112px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                      <User className="w-10 h-10 text-white/30 group-hover:text-primary transition-colors" />
                    </div>
                  )}
                  
                  {/* Upload overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-black uppercase tracking-wider transition-opacity duration-300">
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : (
                      <>
                        <Camera className="w-5 h-5 mb-1.5 text-primary" />
                        Change Photo
                      </>
                    )}
                  </div>
                </div>

                <div className="text-center sm:text-left">
                  <h3 className="text-sm font-black text-white mb-1 uppercase tracking-wider">Profile Avatar</h3>
                  <p className="text-[10px] text-muted-foreground max-w-sm leading-relaxed mb-3">
                    Upload a high-quality picture to be displayed across the website. Supports PNG, JPG, or WebP. Max 10MB.
                  </p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/10 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        Upload Image
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.15em] text-white/50">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.15em] text-white/50">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
                    <input
                      type="email"
                      placeholder="e.g. john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all font-bold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating || isUploading}
                  className="relative px-8 py-4 bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </m.div>

          {/* Account Info Sidebar */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col gap-6"
          >
            {/* Status Panel */}
            <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Account Security</h3>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-white uppercase tracking-wider block">Status: Verified</span>
                  <p className="text-[9px] text-muted-foreground leading-relaxed mt-1 font-medium">
                    Your email address is verified and active. You are registered as a <span className="text-primary font-bold">{user.role}</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl">
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-3">Settings Guide</h3>
              <ul className="space-y-3.5 text-[9px] text-muted-foreground leading-relaxed font-semibold">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Changing your email will update your login credentials and notification channel.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>For security reasons, roles can only be updated by a site administrator.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>If your avatar fallback persists, clear your browser cache to update the local memory.</span>
                </li>
              </ul>
            </div>
          </m.div>
        </div>
      </div>
    </LazyMotion>
  );
}
