"use client";

import { Loader2, Search } from "lucide-react";

/**
 * PIECE B — Track form (email + order tracking token).
 */
export default function GuestTrackForm({
  email,
  token,
  onEmailChange,
  onTokenChange,
  onSubmit,
  loading,
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-3xl border border-[#d9b06d]/35 bg-white/85 backdrop-blur-md p-6 space-y-4"
    >
      <div>
        <label htmlFor="track-email" className="block text-xs font-bold uppercase tracking-widest text-[#6b4a2f]/70 mb-1.5">
          Email address
        </label>
        <input
          id="track-email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-[#d9b06d]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4d1f73]/40"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label htmlFor="track-token" className="block text-xs font-bold uppercase tracking-widest text-[#6b4a2f]/70 mb-1.5">
          Order tracking number
        </label>
        <input
          id="track-token"
          type="text"
          value={token}
          onChange={(e) => onTokenChange(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
          placeholder="From your confirmation email"
          maxLength={12}
          className="w-full rounded-xl border border-[#d9b06d]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4d1f73]/40 font-mono tracking-wide"
          required
        />
        <p className="text-xs text-[#6b4a2f]/55 mt-1.5">
          This is the tracking code from your order email (not the order ID).
        </p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full px-6 py-3 text-[#fff0d7] border border-[#f2d08a]/60 bg-[linear-gradient(135deg,#4d1f73,#7c3ea0)] hover:brightness-110 transition disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Looking up order…
          </>
        ) : (
          <>
            <Search size={16} />
            Track order
          </>
        )}
      </button>
    </form>
  );
}
