'use client';

import { useState, useEffect } from 'react';
import { 
  useSendOtpMutation, 
  useCheckEmailMutation, 
  useRegisterPasswordlessMutation 
} from '@/store/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Users, ClipboardList, Shield, Mail, Loader2, ArrowLeft, Key, User } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const [checkEmail, { isLoading: isCheckingEmail }] = useCheckEmailMutation();
  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [registerPasswordless, { isLoading: isRegistering }] = useRegisterPasswordlessMutation();

  const [step, setStep] = useState<'email' | 'register'>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [codeError, setCodeError] = useState('');
  
  // Timer for resending code
  const [countdown, setCountdown] = useState(0);
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmail = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Email address is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid email address';
    }
    if (!trimmed.toLowerCase().endsWith('@gmail.com') && !trimmed.toLowerCase().endsWith('@googlemail.com')) {
      return 'Only Gmail addresses are allowed';
    }
    return '';
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError('');

    try {
      const emailVal = email.trim().toLowerCase();
      const checkRes = await checkEmail({ email: emailVal }).unwrap();
      
      if (checkRes.exists) {
        // User exists -> logged in directly by the backend!
        dispatch(setCredentials({ token: checkRes.token!, user: checkRes.user! }));
        toast.success('Successfully logged in!');
        router.push('/');
      } else {
        // User does not exist -> OTP has been sent by the backend automatically
        toast.success('Verification code sent to your Gmail');
        setStep('register');
        setCountdown(60);
        setCodeError('');
        setNameError('');
      }
    } catch (err: any) {
      console.error('Failed logging in:', err);
      const errMsg = err?.data?.error || 'Failed to sign in. Please try again.';
      setEmailError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!code || code.length !== 6) {
      setCodeError('Please enter a 6-digit verification code');
      valid = false;
    } else {
      setCodeError('');
    }

    if (!valid) return;

    try {
      const result = await registerPasswordless({
        email: email.trim().toLowerCase(),
        code: code.trim(),
      }).unwrap();

      dispatch(setCredentials(result));
      toast.success('Account successfully created!');
      router.push('/');
    } catch (err: any) {
      console.error('Failed to register:', err);
      const errMsg = err?.data?.error || 'Failed to register. Please check your verification code.';
      setCodeError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await sendOtp({ email: email.trim().toLowerCase() }).unwrap();
      toast.success('A new verification code has been sent');
      setCountdown(60);
      setCodeError('');
    } catch (err: any) {
      const errMsg = err?.data?.error || 'Failed to resend code';
      toast.error(errMsg);
    }
  };

  const features = [
    { icon: BookOpen, label: 'Save Your Favorites', desc: 'Keep all your favorite recipes in one place.', color: 'text-primary' },
    { icon: ClipboardList, label: 'Your Personal Cookbook', desc: 'Organize recipes, create collections and access anywhere.', color: 'text-emerald-400' },
    { icon: Users, label: 'Join the Community', desc: 'Share recipes, tips and connect with food lovers.', color: 'text-rose-400' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[1100px] flex flex-col lg:flex-row rounded-[2rem] overflow-hidden bg-[#0c1021]/80 backdrop-blur-xl border border-white/10 shadow-2xl lg:min-h-[720px]">
        
        {/* Left Panel */}
        <div className="hidden lg:flex w-full lg:w-[400px] xl:w-[440px] flex-col relative bg-gradient-to-br from-[#0c1021] via-[#0f172a] to-[#0c1021] border-r border-white/5">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          
          <div className="flex flex-col h-full p-10 relative z-10">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group mb-12">
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-primary/20">
                <Image src="/logo.png" alt="Tasteful" width={44} height={44} className="w-full h-full object-cover" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-white font-heading">
                Taste<span className="text-primary">ful</span>
              </span>
            </Link>

            {/* Welcome Text */}
            <div className="mb-10">
              <h1 className="text-[34px] font-black text-white leading-[1.1] tracking-tight mb-4 flex items-center gap-2">
                Welcome Back! <span className="text-primary">♡</span>
              </h1>
              <p className="text-[15px] text-muted-foreground/70 leading-relaxed max-w-[300px]">
                Log in to your account and continue your delicious journey with <span className="text-primary font-semibold">Tasteful</span>.
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
            <div className="mt-8 -mx-10 -mb-10 relative h-[240px]">
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
        <div className="flex-1 flex flex-col p-6 sm:p-10 lg:p-12 xl:p-16 relative">
          <div className="max-w-[440px] w-full mx-auto flex flex-col h-full justify-center">
            
            {/* Mobile Header (Shows only on small screens) */}
            <div className="lg:hidden flex flex-col items-center mb-8">
               <Link href="/" className="flex items-center gap-3 group mb-4">
                 <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-2xl ring-2 ring-primary/20">
                   <Image src="/logo.png" alt="Tasteful" width={40} height={40} className="w-full h-full object-cover" />
                 </div>
                 <span className="font-black text-xl tracking-tighter text-white font-heading">
                   Taste<span className="text-primary">ful</span>
                 </span>
               </Link>
               <h2 className="text-[26px] sm:text-[28px] font-black text-white tracking-tight mb-2 text-center">
                 {step === 'email' ? 'Sign In / Register' : 'Verify & Register'}
               </h2>
               <p className="text-[14px] text-muted-foreground text-center">
                 {step === 'email' 
                   ? 'Access your account using your Gmail' 
                   : `Verification code sent to ${email}`}
               </p>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-[28px] font-black text-white tracking-tight mb-2">
                {step === 'email' ? 'Sign In / Register' : 'Verify & Register'}
              </h2>
              <p className="text-[15px] text-muted-foreground">
                {step === 'email' 
                  ? 'Access your account using your Gmail address' 
                  : `Create your account. A 6-digit code was sent to ${email}`}
              </p>
            </div>

            {step === 'email' && (
              /* Step 1: Email Form */
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="text-sm font-bold text-white/80">Gmail Address</label>
                  <div className="relative">
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError(validateEmail(e.target.value));
                      }}
                      placeholder="username@gmail.com"
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 pr-11 text-sm text-white placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                    />
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/30" />
                  </div>
                  {emailError && <p className="text-xs text-red-400 font-medium">{emailError}</p>}
                  <p className="text-xs text-muted-foreground/40 leading-normal pt-1">
                    First time registering? We will verify your Gmail with a 6-digit OTP code. If you are already registered, you will sign in instantly.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isCheckingEmail || isSendingOtp}
                  className="w-full h-12 mt-2 bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isCheckingEmail || isSendingOtp ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Continue</span>
                  )}
                </button>
              </form>
            )}

            {step === 'register' && (
              /* Step 2 (New Users): Register with OTP code */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Use a different email address</span>
                </button>

                {/* Verification Code Input */}
                <div className="space-y-1.5">
                  <label htmlFor="otp-code" className="text-xs font-bold text-white/80">6-Digit Verification Code</label>
                  <div className="relative">
                    <input
                      id="otp-code"
                      type="text"
                      maxLength={6}
                      value={code}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setCode(val);
                        if (codeError) setCodeError('');
                      }}
                      placeholder="123456"
                      className="w-full h-11 bg-white/5 border border-white/10 rounded-2xl px-4 pr-11 text-center tracking-[0.4em] font-black text-base text-white placeholder:text-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                    />
                    <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                  </div>
                  {codeError && <p className="text-xs text-red-400 font-medium">{codeError}</p>}
                  
                  {/* Resend actions */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-muted-foreground/50">Didn&apos;t receive a code?</span>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={countdown > 0}
                      className="font-bold text-primary hover:underline disabled:text-muted-foreground/45 disabled:no-underline"
                    >
                      {countdown > 0 ? `Resend (${countdown}s)` : 'Resend Code'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full h-12 mt-4 bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Register & Log In</span>
                  )}
                </button>
              </form>
            )}

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 mx-auto w-full max-w-[360px] mt-10">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <p className="text-[14px] font-bold text-white/90">Your account is secure</p>
                <p className="text-[12px] text-muted-foreground/50 leading-tight">We verify Gmail addresses using secure<br className="hidden sm:block"/>one-time passwords.</p>
              </div>
            </div>
            
          </div>
        </div>

      </div>
      
      {/* Footer */}
      <div className="fixed bottom-6 w-full text-center text-[12px] font-medium text-muted-foreground/40 z-0">
        © 2026 Tasteful. All rights reserved.
      </div>
    </div>
  );
}
