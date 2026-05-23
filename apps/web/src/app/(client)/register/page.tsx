'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRegisterMutation } from '@/store/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, BookOpen, Users, ClipboardList, Shield, Camera, User, Mail, Star, CheckCircle2, Loader2 } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [registerApi, { isLoading, error }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: async (values) => {
      const result = registerSchema.safeParse(values);
      if (result.success) {
        return { values: result.data, errors: {} };
      }
      return {
        values: {},
        errors: result.error.issues.reduce((acc: any, issue) => {
          const path = issue.path[0] as string;
          if (!acc[path]) {
            acc[path] = { type: issue.code, message: issue.message };
          }
          return acc;
        }, {}),
      };
    },
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    }
  });

  const watchPassword = watch('password', '');

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const result = await registerApi({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
      }).unwrap();
      dispatch(setCredentials(result));
      router.push('/');
    } catch (err) {
      console.error('Failed to register:', err);
    }
  };

  const features = [
    { icon: BookOpen, label: 'Save Your Favorites', desc: 'Bookmark your favorite recipes and access them anytime.', color: 'text-primary' },
    { icon: ClipboardList, label: 'Your Personal Cookbook', desc: 'Create collections and organize recipes your way.', color: 'text-emerald-400' },
    { icon: Users, label: 'Join the Community', desc: 'Share recipes, tips and connect with food lovers.', color: 'text-rose-400' },
    { icon: Star, label: 'Get Inspired', desc: 'Discover new recipes and cooking ideas every day.', color: 'text-amber-400' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      <div className="w-full max-w-[1100px] flex flex-col lg:flex-row rounded-[2rem] overflow-hidden bg-[#0c1021]/80 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10 lg:min-h-[850px]">
        
        {/* Left Panel */}
        <div className="hidden lg:flex w-full lg:w-[400px] xl:w-[440px] flex-col relative bg-gradient-to-br from-[#0c1021] via-[#0f172a] to-[#0c1021] border-r border-white/5">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

          <div className="flex flex-col h-full p-10 relative z-10">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group mb-10">
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-primary/20">
                <Image src="/logo.png" alt="Tasteful" width={44} height={44} className="w-full h-full object-cover" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-white font-heading">
                Taste<span className="text-primary">ful</span>
              </span>
            </Link>

            {/* Welcome Text */}
            <div className="mb-10">
              <h1 className="text-[34px] font-black text-white leading-[1.1] tracking-tight mb-4 flex flex-col gap-1">
                <span>Create Your</span>
                <span className="flex items-center gap-2">Account <span className="text-primary">♡</span></span>
              </h1>
              <p className="text-[15px] text-muted-foreground/70 leading-relaxed max-w-[300px]">
                Join <span className="text-primary font-semibold">Tasteful</span> and start your delicious journey today. Save recipes, create your cookbook and connect.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6 mb-auto">
              {features.map((f) => (
                <div key={f.label} className="flex items-start gap-4 group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-white/5 border border-white/5 group-hover:border-primary/20 transition-colors`}>
                    <f.icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-white mb-1">{f.label}</h3>
                    <p className="text-[13px] text-muted-foreground/50 leading-relaxed pr-4">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Food Image */}
            <div className="mt-8 -mx-10 -mb-10 relative h-[280px]">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1021] via-transparent to-transparent z-10" />
              <Image
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                alt="Delicious food"
                fill
                sizes="400px"
                className="object-cover rounded-tr-[80px]"
              />
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col p-6 sm:p-10 lg:p-12 relative overflow-y-auto max-h-[85vh] lg:max-h-none">
          <div className="max-w-[460px] w-full mx-auto flex flex-col h-full py-2 lg:py-4">
            
            {/* Mobile Header */}
            <div className="lg:hidden flex flex-col items-center mb-8">
               <Link href="/" className="flex items-center gap-3 group mb-4">
                 <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-2xl ring-2 ring-primary/20">
                   <Image src="/logo.png" alt="Tasteful" width={40} height={40} className="w-full h-full object-cover" />
                 </div>
                 <span className="font-black text-xl tracking-tighter text-white font-heading">
                   Taste<span className="text-primary">ful</span>
                 </span>
               </Link>
               <h2 className="text-[26px] sm:text-[28px] font-black text-white tracking-tight mb-2 text-center">Create account</h2>
               <p className="text-[14px] text-muted-foreground text-center">
                 Already have an account?{' '}
                 <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
               </p>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-[28px] font-black text-white tracking-tight mb-2">Create your account</h2>
              <p className="text-[15px] text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
              </p>
            </div>

            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="w-full text-left mb-3">
                <span className="text-sm font-bold text-white/80">Profile Picture</span>
              </div>
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden group-hover:border-primary/50 transition-colors">
                  <User className="w-12 h-12 text-muted-foreground/30" />
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full border-2 border-[#0c1021] flex items-center justify-center text-primary-foreground shadow-lg">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-[13px] text-muted-foreground/70">Upload a profile picture</p>
                <p className="text-[11px] text-muted-foreground/40">JPG, PNG or GIF. Max size 5MB.</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* First Name */}
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-bold text-white/80">First Name</label>
                  <div className="relative">
                    <input
                      {...register('firstName')}
                      type="text"
                      autoComplete="off"
                      placeholder="First name"
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 pl-10 text-sm text-white placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                    />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/30" />
                  </div>
                  {errors.firstName && <p className="text-xs text-red-400 font-medium">{errors.firstName.message}</p>}
                </div>

                {/* Last Name */}
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-bold text-white/80">Last Name</label>
                  <div className="relative">
                    <input
                      {...register('lastName')}
                      type="text"
                      autoComplete="off"
                      placeholder="Last name"
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 pl-10 text-sm text-white placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                    />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/30" />
                  </div>
                  {errors.lastName && <p className="text-xs text-red-400 font-medium">{errors.lastName.message}</p>}
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/80">Username</label>
                <div className="relative">
                  <input
                    {...register('username')}
                    type="text"
                    autoComplete="off"
                    placeholder="Choose a username"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 pl-10 text-sm text-white placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/30" />
                </div>
                {errors.username && <p className="text-xs text-red-400 font-medium">{errors.username.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/80">Email Address</label>
                <div className="relative">
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="off"
                    placeholder="Enter your email"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 pr-11 text-sm text-white placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/30" />
                </div>
                {errors.email && <p className="text-xs text-red-400 font-medium">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/80">Password</label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 pr-11 text-sm text-white placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicators */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-[11px] sm:text-[12px] font-medium">
                  <div className={`flex items-center gap-1 ${watchPassword.length >= 8 ? 'text-emerald-400' : 'text-muted-foreground/50'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1 ${/[0-9]/.test(watchPassword) ? 'text-emerald-400' : 'text-muted-foreground/50'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>One number</span>
                  </div>
                  <div className={`flex items-center gap-1 ${/[^a-zA-Z0-9]/.test(watchPassword) ? 'text-emerald-400' : 'text-muted-foreground/50'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>One special character</span>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/80">Confirm Password</label>
                <div className="relative">
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 pr-11 text-sm text-white placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-white transition-colors">
                    {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-400 font-medium">{errors.confirmPassword.message}</p>}
              </div>

              {/* Agree Terms */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      {...register('agreeTerms')}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-md border-2 border-white/20 peer-checked:bg-primary peer-checked:border-primary group-hover:border-white/40 transition-all flex items-center justify-center shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#020617" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 peer-checked:opacity-100 transition-opacity"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  </div>
                  <span className="text-[13px] font-medium text-muted-foreground group-hover:text-white transition-colors leading-snug">
                    I agree to the <Link href="#" className="font-bold text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="font-bold text-primary hover:underline">Privacy Policy</Link>.
                  </span>
                </label>
                {errors.agreeTerms && <p className="text-xs text-red-400 font-medium mt-1 ml-8">{errors.agreeTerms.message}</p>}
              </div>

              {/* Error from API */}
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mt-2">
                  <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                    <span className="text-red-400 text-sm">!</span>
                  </div>
                  <p className="text-sm text-red-400 font-medium">
                    {'data' in error ? (error.data as any).error : 'Failed to create account. Please try again.'}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-4 bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Social Login */}
            <div className="space-y-3 mb-6">
              <button className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl border border-white/10 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-all">
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Sign up with Google
              </button>
              <button className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl border border-white/10 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                Sign up with Apple
              </button>
            </div>

            {/* Security Badge */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 mx-auto w-full max-w-[380px] mt-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="flex flex-col text-center sm:text-left">
                <p className="text-[13px] sm:text-[14px] font-bold text-white/90">Your data is safe with us</p>
                <p className="text-[11px] sm:text-[12px] text-muted-foreground/50 leading-tight">We use industry-standard security to<br className="hidden sm:block"/>protect your personal information.</p>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
