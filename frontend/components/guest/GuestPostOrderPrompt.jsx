"use client";

import Link from "next/link";
import { X } from "lucide-react";

/**
 * PIECE C — Soft prompt after a successful guest order.
 */
export default function GuestPostOrderPrompt({ open, guestEmail, onDismiss }) {
  if (!open) return null;

  const registerHref = `/login?register=1&email=${encodeURIComponent(guestEmail || "")}&from=guest`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2f0f45]/40 backdrop-blur-sm">
      <div
        role="dialog"
        aria-labelledby="guest-post-order-title"
        className="relative w-full max-w-md rounded-3xl border border-[#d9b06d]/40 bg-white p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-4 right-4 text-[#6b4a2f]/60 hover:text-[#2f0f45]"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
        <p
          id="guest-post-order-title"
          className="text-xl font-semibold text-[#2f0f45] pr-8"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Save your order history
        </p>
        <p className="text-sm text-[#6b4a2f]/80 mt-2">
          Create a free account to keep this order and future purchases in one place. We&apos;ll
          link this order to your email automatically.
        </p>
        {guestEmail && (
          <p className="mt-3 text-xs text-[#6b4a2f]/60">
            Registering as <span className="font-semibold text-[#2f0f45]">{guestEmail}</span>
          </p>
        )}
        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <Link
            href={registerHref}
            className="flex-1 text-center rounded-full px-4 py-2.5 text-sm font-semibold text-[#fff0d7] border border-[#f2d08a]/60 bg-[linear-gradient(135deg,#4d1f73,#7c3ea0)]"
          >
            Create free account
          </Link>
          <Link
            href="/track"
            className="flex-1 text-center rounded-full px-4 py-2.5 text-sm font-semibold text-[#4d1f73] border border-[#4d1f73]/25 bg-white"
          >
            Track order
          </Link>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-3 w-full text-center text-xs text-[#6b4a2f]/60 hover:text-[#2f0f45]"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
