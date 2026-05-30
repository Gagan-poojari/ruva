"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/utils/api";
import toast from "react-hot-toast";
import GuestTrackForm from "@/components/guest/GuestTrackForm";
import OrderDetailView from "@/components/guest/OrderDetailView";
import { getGuestOrderTracking } from "@/utils/guestOrderStorage";

const rise = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
};

export default function TrackOrderPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoTracked, setAutoTracked] = useState(false);

  useEffect(() => {
    const saved = getGuestOrderTracking();
    if (saved?.guest_email) setEmail(saved.guest_email);
    if (saved?.guest_order_token) setToken(saved.guest_order_token);
  }, []);

  const fetchOrder = async (emailValue, tokenValue) => {
    const trimmedEmail = emailValue.trim().toLowerCase();
    const trimmedToken = tokenValue.trim();

    if (!trimmedEmail || !trimmedToken) {
      toast.error("Enter your email and tracking number.");
      return;
    }

    setLoading(true);
    setOrder(null);
    try {
      const { data } = await api.get("/orders/track", {
        params: { email: trimmedEmail, token: trimmedToken },
      });
      setOrder(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Order not found. Check your details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoTracked || !email || !token) return;
    const saved = getGuestOrderTracking();
    if (
      saved?.guest_email === email.trim().toLowerCase() &&
      saved?.guest_order_token === token.trim()
    ) {
      setAutoTracked(true);
      fetchOrder(email, token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, token, autoTracked]);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden py-14 px-4 sm:px-6">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#f7efff_0%,#fff7eb_100%)]" />
      <div className="relative z-10 mx-auto max-w-2xl">
        <motion.div {...rise}>
          <p
            className="uppercase tracking-[0.28em] text-[0.66rem] text-[#7a4f1f]/80 mb-2"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Order tracking
          </p>
          <h1
            className="text-4xl text-[#2f0f45] font-bold mb-2"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Track your order
          </h1>
          <p className="text-sm text-[#6b4a2f]/75 mb-8">
            Use the email and tracking number from your confirmation email.
          </p>
        </motion.div>

        <motion.div {...rise} transition={{ delay: 0.08 }} className="space-y-6">
          <GuestTrackForm
            email={email}
            token={token}
            onEmailChange={setEmail}
            onTokenChange={setToken}
            onSubmit={() => fetchOrder(email, token)}
            loading={loading}
          />

          {order && <OrderDetailView order={order} />}

          <div className="rounded-3xl border border-[#d9b06d]/30 bg-white/70 p-6 text-center">
            <p className="text-[#2f0f45] font-semibold">Create an account to save your orders</p>
            <p className="text-sm text-[#6b4a2f]/70 mt-2 max-w-md mx-auto">
              Register with the same email you used at checkout and your guest orders will appear
              in your order history automatically.
            </p>
            <Link
              href={`/login?register=1&email=${encodeURIComponent(email.trim())}`}
              className="inline-flex mt-4 rounded-full px-6 py-2.5 text-sm font-semibold text-[#fff0d7] border border-[#f2d08a]/60 bg-[linear-gradient(135deg,#4d1f73,#7c3ea0)]"
            >
              Create account
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
