"use client";

import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

export default function LoginForm({ onToggleRegister, googleEnabled = true }) {
  const { login, googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await login(data.email, data.password);
    if (result.success) {
      toast.success("Welcome back!", {
        style: {
          background: "#1a0a2e",
          color: "#f8ebff",
          border: "1px solid rgba(236,198,255,0.2)",
        },
      });
      // Navigation is handled by AuthContext or the page
    } else {
      toast.error(result.error || "Login failed");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error("Google login failed");
      return;
    }

    setGoogleLoading(true);

    const result = await googleLogin(credentialResponse.credential);
    if (result.success) {
      toast.success("Signed in with Google!");
    } else {
      toast.error(result.error || "Google login failed");
    }
    setGoogleLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-[#2a0505] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Welcome Back
        </h2>
        <p className="text-[#5a2a1a]/60 text-sm italic font-medium">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="relative">
          <label className="text-xs font-bold text-[#6b1a1a] uppercase tracking-widest mb-2 block">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c87d1a]/60" />
            <input
              {...register("email", { required: "Email is required" })}
              type="email"
              placeholder="name@example.com"
              className="w-full bg-white/40 border border-[#c87d1a]/20 rounded-2xl py-3.5 pl-11 pr-4 text-[#2a0505] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c87d1a]/30 transition-all font-medium"
            />
          </div>
          {errors.email && <span className="text-red-600 text-[10px] uppercase font-bold mt-1 block tracking-wider">{errors.email.message}</span>}
        </div>

        <div className="relative">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-[#6b1a1a] uppercase tracking-widest block">Password</label>
            <button type="button" className="text-[10px] font-bold text-[#c87d1a] uppercase tracking-widest hover:text-[#b9781f] transition-all">
              Forgot?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c87d1a]/60" />
            <input
              {...register("password", { required: "Password is required" })}
              type="password"
              placeholder="••••••••"
              className="w-full bg-white/40 border border-[#c87d1a]/20 rounded-2xl py-3.5 pl-11 pr-4 text-[#2a0505] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c87d1a]/30 transition-all font-medium"
            />
          </div>
          {errors.password && <span className="text-red-600 text-[10px] uppercase font-bold mt-1 block tracking-wider">{errors.password.message}</span>}
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-gradient-to-r from-[#c87d1a] to-[#d4a017] hover:brightness-110 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group shadow-[0_10px_30px_rgba(200,125,26,0.25)]"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-[#c87d1a]/15" />
        <span className="text-[10px] text-[#6b1a1a]/50 font-bold uppercase tracking-[0.2em]">Or continue with</span>
        <div className="h-px flex-1 bg-[#c87d1a]/15" />
      </div>

      <div className="mt-8 flex justify-center">
        {!googleEnabled ? (
          <button
            disabled
            className="w-full bg-white/50 border border-[#c87d1a]/10 text-[#3d0a0a] font-bold py-3.5 rounded-2xl flex items-center justify-center gap-3 opacity-70"
          >
            <span className="text-xs uppercase tracking-widest">Google Sign-In Unavailable</span>
          </button>
        ) : googleLoading ? (
          <button
            disabled
            className="w-full bg-white/50 border border-[#c87d1a]/10 text-[#3d0a0a] font-bold py-3.5 rounded-2xl flex items-center justify-center gap-3 opacity-70"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs uppercase tracking-widest">Google Account</span>
          </button>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => toast.error("Google login failed")}
            theme="outline"
            text="continue_with"
            shape="pill"
            logo_alignment="left"
          />
        )}
      </div>

      <p className="mt-10 text-center text-[#5a2a1a]/60 text-xs font-medium">
        Don't have an account?{" "}
        <button
          onClick={onToggleRegister}
          className="text-[#c87d1a] font-bold hover:underline decoration-[#c87d1a]/30 underline-offset-4 ml-1"
        >
          Sign up for free
        </button>
      </p>
    </motion.div>
  );
}
