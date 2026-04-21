"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/Auth/LoginForm";
import RegisterForm from "@/components/Auth/RegisterForm";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) return null;

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#fdf8ef]">
      {/* Texture + pattern background — matching Categories section */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(175deg,#fdf8ef_0%,#f8eddc_54%,#fdf5e8_100%)]" />
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.25,
            backgroundImage: "repeating-linear-gradient(-45deg, rgba(176,118,32,0.17) 0, rgba(176,118,32,0.17) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(45deg, rgba(176,118,32,0.12) 0, rgba(176,118,32,0.12) 1px, transparent 1px, transparent 20px)",
          }}
        />
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-orange-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 flex flex-col items-center">
        {/* Logo/Home link */}
        <Link 
          href="/" 
          className="mb-8 flex items-center gap-2 text-[#6b1a1a]/70 hover:text-[#6b1a1a] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs uppercase tracking-widest font-bold">Back to collection</span>
        </Link>

        {/* Auth Glass Card */}
        <div className="w-full max-w-md p-8 md:p-10 rounded-[2.5rem] bg-white/60 backdrop-blur-xl border border-[#c87d1a]/20 shadow-[0_20px_50px_rgba(42,5,5,0.12)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c87d1a]/40 to-transparent" />
          
          {googleClientId ? (
            <GoogleOAuthProvider clientId={googleClientId}>
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <LoginForm
                    key="login"
                    googleEnabled
                    onToggleRegister={() => setIsLogin(false)}
                  />
                ) : (
                  <RegisterForm
                    key="register"
                    googleEnabled
                    onToggleLogin={() => setIsLogin(true)}
                  />
                )}
              </AnimatePresence>
            </GoogleOAuthProvider>
          ) : (
            <AnimatePresence mode="wait">
              {isLogin ? (
                <LoginForm
                  key="login"
                  googleEnabled={false}
                  onToggleRegister={() => setIsLogin(false)}
                />
              ) : (
                <RegisterForm
                  key="register"
                  googleEnabled={false}
                  onToggleLogin={() => setIsLogin(true)}
                />
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Footer info */}
        <p className="mt-8 text-[#6b1a1a]/40 text-[10px] tracking-[0.3em] uppercase font-bold">
          Ruva Boutique — Est. 2024
        </p>
      </div>
    </div>
  );
}
