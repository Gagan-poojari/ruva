"use client";

import Link from "next/link";
import { UserCircle, UserPlus } from "lucide-react";

/**
 * PIECE A — Guest checkout gate (logged-out users only).
 * Shown before the shipping form on /cart when the user is not authenticated.
 */
export default function GuestCheckoutGate({
  checkoutMode,
  onSelectGuest,
  onSelectAccount,
  guestEmail,
  guestPhone,
  onGuestEmailChange,
  onGuestPhoneChange,
}) {
  return (
    <div className="mb-5 rounded-2xl border border-[#d9b06d]/40 bg-[#fffaf2]/90 p-4">
      <p className="text-[#2f0f45] text-sm font-semibold mb-3">How would you like to checkout?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onSelectGuest}
          className={`rounded-xl border px-3 py-3 text-left transition ${
            checkoutMode === "guest"
              ? "border-[#4d1f73] bg-[#f3ebff] ring-1 ring-[#4d1f73]/30"
              : "border-[#d9b06d]/35 bg-white hover:bg-[#faf5ff]"
          }`}
        >
          <span className="flex items-center gap-2 text-[#2f0f45] text-sm font-semibold">
            <UserCircle size={16} />
            Continue as guest
          </span>
          <span className="block text-xs text-[#6b4a2f]/70 mt-1">No account needed</span>
        </button>
        <Link
          href="/login"
          onClick={onSelectAccount}
          className={`rounded-xl border px-3 py-3 text-left transition ${
            checkoutMode === "account"
              ? "border-[#4d1f73] bg-[#f3ebff] ring-1 ring-[#4d1f73]/30"
              : "border-[#d9b06d]/35 bg-white hover:bg-[#faf5ff]"
          }`}
        >
          <span className="flex items-center gap-2 text-[#2f0f45] text-sm font-semibold">
            <UserPlus size={16} />
            Sign in / Create account
          </span>
          <span className="block text-xs text-[#6b4a2f]/70 mt-1">Save orders to your profile</span>
        </Link>
      </div>

      {checkoutMode === "guest" && (
        <div className="mt-4 grid grid-cols-1 gap-2 border-t border-[#d9b06d]/25 pt-4">
          <input
            type="email"
            id="guest-checkout-email"
            value={guestEmail}
            onChange={(e) => onGuestEmailChange(e.target.value)}
            placeholder="Guest email for order updates *"
            className="w-full rounded-xl border border-[#d9b06d]/35 bg-white px-3 py-2 text-sm outline-none"
            autoComplete="email"
          />
          <input
            type="tel"
            id="guest-checkout-phone"
            value={guestPhone}
            onChange={(e) => onGuestPhoneChange(e.target.value)}
            placeholder="Guest phone number *"
            maxLength={10}
            className="w-full rounded-xl border border-[#d9b06d]/35 bg-white px-3 py-2 text-sm outline-none"
            autoComplete="tel"
          />
        </div>
      )}
    </div>
  );
}
