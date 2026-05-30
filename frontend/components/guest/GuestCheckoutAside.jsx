"use client";

import Link from "next/link";
import { ShieldCheck, Loader2 } from "lucide-react";
import GuestCheckoutGate from "./GuestCheckoutGate";

/**
 * PIECE A — Logged-out checkout sidebar (guest flow only).
 */
export default function GuestCheckoutAside({
  subtotal,
  DELIVERY_FEE,
  grandTotal,
  shippingAddress,
  setShippingAddress,
  checkoutMode,
  onSelectGuest,
  onSelectAccount,
  guestEmail,
  guestPhone,
  onGuestEmailChange,
  onGuestPhoneChange,
  placing,
  onPlaceGuestOrder,
}) {
  const canPay = checkoutMode === "guest";

  return (
    <aside className="rounded-3xl border border-[#d9b06d]/35 bg-white/80 backdrop-blur-md p-6 h-fit">
      <p className="text-[#2f0f45] text-xl font-semibold mb-5">Order Summary</p>
      <div className="space-y-3 text-[#5d3a22]">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="sp2-num">₹{subtotal.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Fee</span>
          <span className="sp2-num">₹{DELIVERY_FEE.toLocaleString("en-IN")}</span>
        </div>
        <div className="h-px bg-[#d9b06d]/35 my-2" />
        <div className="flex justify-between text-[#2f0f45] font-semibold text-lg">
          <span>Total</span>
          <span className="sp2-num">
            ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <GuestCheckoutGate
        checkoutMode={checkoutMode}
        onSelectGuest={onSelectGuest}
        onSelectAccount={onSelectAccount}
        guestEmail={guestEmail}
        guestPhone={guestPhone}
        onGuestEmailChange={onGuestEmailChange}
        onGuestPhoneChange={onGuestPhoneChange}
      />

      <div className="space-y-2">
        <input
          value={shippingAddress.street}
          onChange={(e) => setShippingAddress((s) => ({ ...s, street: e.target.value }))}
          placeholder="Street Address *"
          className="w-full rounded-xl border border-[#d9b06d]/35 bg-white px-3 py-2 text-sm outline-none"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            value={shippingAddress.city}
            onChange={(e) => setShippingAddress((s) => ({ ...s, city: e.target.value }))}
            placeholder="City *"
            className="w-full rounded-xl border border-[#d9b06d]/35 bg-white px-3 py-2 text-sm outline-none"
          />
          <input
            value={shippingAddress.state}
            onChange={(e) => setShippingAddress((s) => ({ ...s, state: e.target.value }))}
            placeholder="State *"
            className="w-full rounded-xl border border-[#d9b06d]/35 bg-white px-3 py-2 text-sm outline-none"
          />
        </div>
        <input
          value={shippingAddress.pincode}
          onChange={(e) => setShippingAddress((s) => ({ ...s, pincode: e.target.value }))}
          placeholder="Pincode *"
          className="w-full rounded-xl border border-[#d9b06d]/35 bg-white px-3 py-2 text-sm outline-none"
        />
      </div>

      <button
        type="button"
        onClick={onPlaceGuestOrder}
        disabled={placing || !canPay}
        className="mt-6 w-full rounded-full px-6 py-3 text-[#fff0d7] border border-[#f2d08a]/60 bg-[linear-gradient(135deg,#4d1f73,#7c3ea0)] hover:brightness-110 transition disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {placing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Creating Order...
          </>
        ) : (
          <>
            <ShieldCheck size={16} />
            {canPay ? (
              <>
                Pay{" "}
                <span className="sp2-num">
                  ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </>
            ) : (
              "Choose guest checkout to continue"
            )}
          </>
        )}
      </button>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#6b4a2f]/60">
        <ShieldCheck size={12} />
        <span>Secured by Razorpay · 100% Safe</span>
      </div>

      <Link
        href="/shop"
        className="mt-3 block text-center text-sm text-[#6b4a2f] hover:text-[#2f0f45] transition"
      >
        Continue Shopping
      </Link>
    </aside>
  );
}
