'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2 } from 'lucide-react';
import {
  HiOutlineEye,
  HiOutlineEyeOff,
} from 'react-icons/hi';

import Image from 'next/image';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import {
  isAdminSessionValid,
  setAdminSession,
} from '@/utils/adminAuth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (isAdminSessionValid()) {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const { data } = await api.post('/auth/admin/login', {
        email,
        password,
      });

      setAdminSession(data, rememberMe);

      toast.success('Welcome back');

      router.replace('/admin/dashboard');
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Invalid admin credentials'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0b0b] flex items-center justify-center px-6 py-10">
      
      {/* BACKGROUND */}
      <div className="absolute inset-0">
        
        {/* soft glow */}
        <div className="absolute top-[-10%] left-[10%] h-105 w-105 rounded-full bg-white/3 blur-[120px]" />

        <div className="absolute bottom-[-15%] right-[5%] h-105 w-105 rounded-full bg-white/2.5 blur-[140px]" />

        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />

        {/* vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.72)_100%)]" />
      </div>

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-4xl border border-white/6 bg-[#111111]/90 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.65)] overflow-hidden">
          
          {/* top accent line */}
          <div className="h-px w-full bg-linear-to-r from-transparent via-white/20 to-transparent" />

          <div className="px-8 py-10 md:px-10">
            
            {/* HEADER */}
            <div className="flex flex-col items-center text-center">
              
              {/* logo */}
              <div className="mb-2 flex items-center justify-center rounded-xl border border-white/8">
                <Image
                  src="/ruva_logo.png"
                  alt="Ruva"
                  width={54}
                  height={54}
                  className="object-contain"
                  priority
                />
              </div>

              <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-white">
                Admin Access
              </h1>

              <p className="mt-2 max-w-65 text-sm leading-relaxed text-white/45">
                Secure access for Ruva internal management and operations.
              </p>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleLogin}
              className="mt-10 space-y-5"
            >
              
              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">
                  Email
                </label>

                <div className="group relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 transition-colors duration-300 group-focus-within:text-white/60"
                  />

                  <input
                    type="email"
                    placeholder="admin@ruva.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="h-14 w-full rounded-2xl border border-white/[0.07] bg-white/2.5 pl-12 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/15 focus:border-white/15 focus:bg-white/4"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">
                  Password
                </label>

                <div className="group relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 transition-colors duration-300 group-focus-within:text-white/60"
                  />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="h-14 w-full rounded-2xl border border-white/[0.07] bg-white/2.5 pl-12 pr-12 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/15 focus:border-white/15 focus:bg-white/4"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white/70"
                  >
                    {showPassword ? (
                      <HiOutlineEyeOff size={20} />
                    ) : (
                      <HiOutlineEye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* OPTIONS */}
              <div className="flex items-center justify-between pt-1">
                
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() =>
                        setRememberMe(!rememberMe)
                      }
                      className="peer sr-only"
                    />

                    <div className="h-4 w-4 rounded border border-white/15 bg-white/3 transition-all duration-300 peer-checked:bg-white" />

                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-black opacity-0 transition peer-checked:opacity-100">
                      ✓
                    </div>
                  </div>

                  <span className="text-xs text-white/40">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  className="text-xs text-white/35 transition hover:text-white/65"
                >
                  Forgot password?
                </button>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-white text-xs font-semibold uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-white/90 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Authenticating
                  </>
                ) : (
                  'Enter Dashboard'
                )}
              </button>
            </form>

            {/* FOOTER */}
            <div className="mt-8 border-t border-white/5 pt-6 text-center">
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/20">
                Ruva Enterprise Control
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}