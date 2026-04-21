"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Crown, LogOut, ShoppingBag, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import api from "@/utils/api";

const panelIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true, amount: 0.25 },
};

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const { cartItems } = useCart();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.token) return;
      setOrdersLoading(true);
      try {
        const { data } = await api.get("/orders/my");
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [user?.token]);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden py-14 px-4 sm:px-6">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#f8f0ff_0%,#f5ecff_35%,#fff7eb_100%)]" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, rgba(162,108,38,0.12) 0, rgba(162,108,38,0.12) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(45deg, rgba(162,108,38,0.1) 0, rgba(162,108,38,0.1) 1px, transparent 1px, transparent 20px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl">
        <motion.div {...panelIn} className="mb-10 text-center">
          <p
            className="uppercase tracking-[0.28em] text-[0.66rem] text-[#7a4f1f]/80 mb-3"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Account Atelier
          </p>
          <h1
            className="text-4xl sm:text-5xl text-[#2f0f45] font-bold"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Your Ruva Profile
          </h1>
        </motion.div>

        <motion.div
          {...panelIn}
          transition={{ ...panelIn.transition, delay: 0.08 }}
          className="rounded-3xl border border-[#d9b06d]/35 bg-white/70 backdrop-blur-md p-7 sm:p-10 shadow-[0_20px_60px_rgba(54,19,73,0.12)]"
        >
          {loading ? (
            <p className="text-[#5d3a22]/70">Loading your profile...</p>
          ) : user ? (
            <>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-14 w-14 rounded-full bg-[linear-gradient(145deg,#5d247e,#8d4fb7)] text-[#fff1da] flex items-center justify-center">
                  <UserRound size={24} />
                </div>
                <div>
                  <p className="text-[#2a0c3f] text-xl font-semibold">{user.name || "Ruva Member"}</p>
                  <p className="text-[#6b4a2f]/75 text-sm">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="rounded-2xl border border-[#d9b06d]/35 bg-white/70 p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#6b4a2f]/70 mb-1">Tier</p>
                  <p className="text-[#2f0f45] font-semibold flex items-center gap-2">
                    <Crown size={16} className="text-[#c58a2a]" /> Heritage Member
                  </p>
                </div>
                <div className="rounded-2xl border border-[#d9b06d]/35 bg-white/70 p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#6b4a2f]/70 mb-1">Saved Cart</p>
                  <p className="text-[#2f0f45] font-semibold">{cartItems.length} items</p>
                </div>
                <div className="rounded-2xl border border-[#d9b06d]/35 bg-white/70 p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#6b4a2f]/70 mb-1">Status</p>
                  <p className="text-[#2f0f45] font-semibold">Active</p>
                </div>
                <div className="rounded-2xl border border-[#d9b06d]/35 bg-white/70 p-5 sm:col-span-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#6b4a2f]/70 mb-1">My Orders</p>
                  <p className="text-[#2f0f45] font-semibold">
                    {ordersLoading ? "Loading..." : `${orders.length} order${orders.length === 1 ? "" : "s"}`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/cart"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[#fff0d7] border border-[#f2d08a]/60 bg-[linear-gradient(135deg,#4d1f73,#7c3ea0)] hover:brightness-110 transition"
                >
                  <ShoppingBag size={16} /> Go to Cart
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[#5b2b12] border border-[#c6913b]/40 bg-white/80 hover:bg-white transition"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          ) : (
            <div>
              <p className="text-[#5d3a22]/80 mb-6">
                Sign in to view your profile, saved orders, and curated recommendations.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center rounded-full px-7 py-3 text-[#fff0d7] border border-[#f2d08a]/60 bg-[linear-gradient(135deg,#4d1f73,#7c3ea0)] hover:brightness-110 transition"
              >
                Continue to Login
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
