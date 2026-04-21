'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, Sparkles } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Redirect if already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin/login', { email, password });
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data));
      toast.success('Welcome back, Admin!');
      router.push('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md px-6 z-10">
        <div className="bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/5 p-10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)]">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white mb-6 shadow-[0_0_40px_rgba(255,255,255,0.15)] transform rotate-12">
              <Sparkles className="text-black" size={36} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tighter">Ruva Admin</h1>
            <p className="text-white/40 text-xs uppercase tracking-[0.3em] font-medium">Internal Management Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Identity</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-all duration-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ruva.com"
                  className="w-full bg-white/[0.03] border border-white/5 text-white rounded-2xl py-4.5 pl-14 pr-6 outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-500 placeholder:text-white/10 text-sm tracking-wide"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Access Key</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-all duration-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/5 text-white rounded-2xl py-4.5 pl-14 pr-6 outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-500 placeholder:text-white/10 text-sm tracking-wide"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-white/90 text-black font-black py-5 rounded-2xl shadow-[0_20px_40px_rgba(255,255,255,0.1)] transform hover:-translate-y-1 active:translate-y-0 transition-all duration-500 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:hover:translate-y-0 uppercase tracking-widest text-xs"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Verify & Enter
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-white/20 text-[9px] uppercase tracking-[0.3em] font-medium leading-loose">
              Ruva Enterprise Control • v1.0.2
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
