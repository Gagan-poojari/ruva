"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, ShieldCheck, Loader2, Lock } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import toast from "react-hot-toast";
import ShippingAddressFields from "@/components/checkout/ShippingAddressFields";
import GuestPostOrderPrompt from "@/components/guest/GuestPostOrderPrompt";
import { saveGuestOrderTracking } from "@/utils/guestOrderStorage";
import {
  emptyShippingForm,
  formatShippingForOrder,
  isShippingLocationComplete,
} from "@/utils/shippingAddress";

const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

export default function CartPage() {
  const { cartItems, addToCart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();

  const [placing, setPlacing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [rzKey, setRzKey] = useState(RAZORPAY_KEY || "");
  const [shippingAddress, setShippingAddress] = useState(emptyShippingForm);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [showGuestPostOrderPrompt, setShowGuestPostOrderPrompt] = useState(false);
  const [postOrderGuestEmail, setPostOrderGuestEmail] = useState("");

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (item.qty || 1),
    0
  );
  const DELIVERY_FEE = 49;
  const taxAmount = 0;
  const grandTotal = subtotal + DELIVERY_FEE;

  /* ── Razorpay script ── */
  useEffect(() => {
    if (typeof window !== "undefined" && window.Razorpay) setRazorpayLoaded(true);
  }, []);

  useEffect(() => {
    if (rzKey) return;
    api
      .get("/orders/razorpay-key")
      .then(({ data }) => { if (data?.key) setRzKey(data.key); })
      .catch(() => {});
  }, [rzKey]);

  /* ── Validation helpers ── */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  const validateContact = (email, phone) => {
    if (!email || !emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address."); return false;
    }
    if (!phone || !phoneRegex.test(phone.replace(/\s/g, ""))) {
      toast.error("Please enter a valid 10-digit phone number."); return false;
    }
    return true;
  };

  const validateDelivery = (addr) => {
    if (!addr.firstName?.trim()) { toast.error("Please enter your first name."); return false; }
    if (!addr.lastName?.trim())  { toast.error("Please enter your last name."); return false; }
    if (!addr.address?.trim())   { toast.error("Please enter your street address."); return false; }
    if (!addr.city?.trim())      { toast.error("Please enter your city."); return false; }
    if (!addr.state?.trim())     { toast.error("Please select your state."); return false; }
    if (addr.pincode?.length !== 6) { toast.error("Please enter a valid 6-digit PIN code."); return false; }
    if (!addr.locationConfirmed) { toast.error("Please confirm your delivery area."); return false; }
    return true;
  };

  const ensureRazorpayReady = () => {
    if (!rzKey) {
      toast.error("Payment setup is incomplete. Please refresh and try again.");
      return false;
    }
    if (!window.Razorpay) {
      toast.error("Payment gateway is still loading. Please wait a moment.");
      return false;
    }
    return true;
  };

  /* ── Authenticated Razorpay ── */
  const openRazorpayCheckout = useCallback(
    ({ razorpayOrder, dbOrder }) => {
      if (!window.Razorpay) {
        toast.error("Payment gateway failed to load. Please refresh.");
        return;
      }
      const options = {
        key: rzKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "RUVA",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        prefill: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim() || user?.name || "",
          email: shippingAddress.email || user?.email || "",
          contact: shippingAddress.phone || user?.phone || "",
        },
        theme: { color: "#4d1f73" },
        handler: async (response) => {
          try {
            await api.post("/orders/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: dbOrder._id,
            });
            clearCart();
            toast.success("Payment successful! Your order is confirmed.");
            window.location.href = "/profile";
          } catch (err) {
            toast.error(err?.response?.data?.message || "Payment verification failed. Any deducted amount will be refunded.");
          }
        },
        modal: { ondismiss: () => toast("Payment not completed. You can retry from your orders.", { icon: "⚠️", duration: 5000 }) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => toast.error(r.error?.description || "Payment failed."));
      rzp.open();
    },
    [clearCart, rzKey, shippingAddress, user]
  );

  /* ── Guest Razorpay ── */
  const openGuestRazorpayCheckout = useCallback(
    ({ razorpayOrder, dbOrder, guest_order_token, guest_email }) => {
      if (!window.Razorpay) {
        toast.error("Payment gateway failed to load. Please refresh.");
        return;
      }
      const options = {
        key: rzKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "RUVA",
        description: "Guest Order Payment",
        order_id: razorpayOrder.id,
        prefill: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
          email: guest_email,
          contact: guestPhone,
        },
        theme: { color: "#4d1f73" },
        handler: async (response) => {
          try {
            await api.post("/orders/guest/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: dbOrder._id,
              guest_email,
              guest_order_token,
            });
            saveGuestOrderTracking({ order_id: dbOrder._id, guest_order_token, guest_email });
            clearCart();
            toast.success("Payment successful! Your order is confirmed.");
            setPostOrderGuestEmail(guest_email);
            setShowGuestPostOrderPrompt(true);
          } catch (err) {
            toast.error(err?.response?.data?.message || "Payment verification failed. Any deducted amount will be refunded.");
          }
        },
        modal: { ondismiss: () => toast("Payment not completed. You can complete payment via your tracking link.", { icon: "⚠️", duration: 5000 }) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => toast.error(r.error?.description || "Payment failed."));
      rzp.open();
    },
    [clearCart, guestPhone, rzKey, shippingAddress]
  );

  /* ── Place order (authenticated) ── */
  const placeOrder = async () => {
    if (!user?.token) {
      toast.error("Please login to continue."); window.location.href = "/login"; return;
    }
    if (!validateContact(shippingAddress.email, shippingAddress.phone)) return;
    if (!validateDelivery(shippingAddress)) return;
    if (!cartItems.length) { toast.error("Your cart is empty."); return; }
    if (!ensureRazorpayReady()) return;

    setPlacing(true);
    try {
      const { data } = await api.post("/orders", {
        orderItems: cartItems.map((i) => ({
          product: i.product, qty: i.qty || 1,
          price: Number(i.price) || 0, size: i.size || "Free Size",
          color: i.selectedColor || undefined,
        })),
        shippingAddress: formatShippingForOrder(shippingAddress),
        paymentMethod: "Razorpay",
        itemsPrice: subtotal, taxPrice: taxAmount,
        shippingPrice: DELIVERY_FEE, totalPrice: grandTotal,
      });
      if (!data?.razorpayOrder?.id || !data?.order?._id) throw new Error("Invalid order response.");
      openRazorpayCheckout({ razorpayOrder: data.razorpayOrder, dbOrder: data.order });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  /* ── Place order (guest) ── */
  const placeGuestOrder = async () => {
    const email = guestEmail.trim().toLowerCase();
    const phone = guestPhone.trim();
    if (!validateContact(email, phone)) return;
    if (!validateDelivery(shippingAddress)) return;
    if (!cartItems.length) { toast.error("Your cart is empty."); return; }
    if (!ensureRazorpayReady()) return;

    const shippingPayload = { ...formatShippingForOrder(shippingAddress), email, phone };
    setPlacing(true);
    try {
      const { data } = await api.post("/orders/guest", {
        orderItems: cartItems.map((i) => ({
          product: i.product, qty: i.qty || 1,
          price: Number(i.price) || 0, size: i.size || "Free Size",
          color: i.selectedColor || undefined,
        })),
        shippingAddress: shippingPayload,
        paymentMethod: "Razorpay",
        itemsPrice: subtotal, taxPrice: taxAmount,
        shippingPrice: DELIVERY_FEE, totalPrice: grandTotal,
        guest_email: email, guest_phone: phone,
      });
      if (!data?.razorpayOrder?.id || !data?.order?._id || !data?.guest_order_token)
        throw new Error("Invalid guest order response from server.");
      saveGuestOrderTracking({
        order_id: data.order._id,
        guest_order_token: data.guest_order_token,
        guest_email: email,
      });
      openGuestRazorpayCheckout({
        razorpayOrder: data.razorpayOrder, dbOrder: data.order,
        guest_order_token: data.guest_order_token, guest_email: email,
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const handlePay = () => (user?.token ? placeOrder() : placeGuestOrder());

  /* ═══════════════════════════════════════════════════════════
      RENDER
  ═══════════════════════════════════════════════════════════ */
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf7f4] flex flex-col items-center justify-center gap-5 px-4">
        <div className="w-16 h-16 rounded-full bg-[#4d1f73]/10 flex items-center justify-center">
          <ShoppingBag size={28} className="text-[#4d1f73]" />
        </div>
        <p className="text-lg font-medium text-gray-700">Your cart is empty</p>
        <Link
          href="/shop"
          className="rounded-full bg-[#4d1f73] px-8 py-3 text-sm font-semibold text-white hover:bg-[#7c3ea0] transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => toast.error("Failed to load payment gateway.")}
      />

      <GuestPostOrderPrompt
        open={showGuestPostOrderPrompt}
        guestEmail={postOrderGuestEmail}
        onDismiss={() => setShowGuestPostOrderPrompt(false)}
      />

      <div className="min-h-screen bg-[#faf7f4]">
        {/* ── Top bar ── */}
        {/* <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/ruva_logo.png" alt="Ruva" className="h-8 w-auto" />
          </Link>
        </div> */}

        <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-0 lg:gap-12">

            {/* ══════════════════════════════════════════
                LEFT — Contact + Delivery Form
            ══════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="order-2 lg:order-1"
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">

                {/* Contact section (guest only) */}
                {!user?.token && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-base font-semibold text-gray-800">Contact</h2>
                      <Link href="/login" className="text-xs text-[#4d1f73] font-medium hover:underline">
                        Sign in
                      </Link>
                    </div>
                    <div className="space-y-3">
                      <input
                        id="guest-email"
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="Email"
                        autoComplete="email"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-[#4d1f73] focus:ring-1 focus:ring-[#4d1f73]/20 transition"
                      />
                      <input
                        id="guest-phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="Phone number"
                        autoComplete="tel"
                        className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-[#4d1f73] focus:ring-1 focus:ring-[#4d1f73]/20 transition"
                      />
                    </div>
                    <div className="h-px bg-gray-100 mt-6 mb-0" />
                  </div>
                )}

                {/* Authenticated email/phone in shipping form */}
                <ShippingAddressFields
                  shippingAddress={shippingAddress}
                  setShippingAddress={setShippingAddress}
                  includeContactFields={Boolean(user?.token)}
                />

                {/* Terms note */}
                <p className="mt-5 text-[11px] text-gray-400 leading-relaxed">
                  By placing this order you agree to our{" "}
                  <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
                </p>

                {/* Pay button (mobile — shown below form) */}
                <button
                  onClick={handlePay}
                  disabled={placing}
                  className="mt-6 w-full rounded-xl py-4 font-semibold text-white bg-[#4d1f73] hover:bg-[#7c3ea0] transition disabled:opacity-70 flex items-center justify-center gap-2 lg:hidden"
                >
                  {placing ? (
                    <><Loader2 size={17} className="animate-spin" /> Processing...</>
                  ) : (
                    <><Lock size={15} /> Pay ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</>
                  )}
                </button>
              </div>

              {/* Footer links */}
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 justify-center text-xs text-gray-400">
                <Link href="/privacy" className="hover:text-gray-600">Privacy policy</Link>
                <Link href="/terms" className="hover:text-gray-600">Terms of service</Link>
                <Link href="/shop" className="hover:text-gray-600">Continue shopping</Link>
              </div>
            </motion.div>

            {/* ══════════════════════════════════════════
                RIGHT — Order Summary
            ══════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="order-1 lg:order-2"
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">

                {/* Cart items */}
                <div className="space-y-4 mb-5">
                  {cartItems.map((item) => {
                    const imgSrc =
                      typeof item.image === "string" && item.image.trim()
                        ? item.image.trim()
                        : "/sarees/silk_cotton_saree.png";
                    return (
                      <div
                        key={`${item.product}-${item.size}-${item.selectedColor || ""}`}
                        className="flex items-start gap-3"
                      >
                        {/* Product image with qty badge */}
                        <div className="relative shrink-0">
                          <img
                            src={imgSrc}
                            alt={item.name || "Cart item"}
                            className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                          />
                          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 text-[10px] font-bold text-white">
                            {item.qty || 1}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {item.name || "Ruva Saree"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Size: {item.size || "Free Size"}
                            {item.selectedColor ? ` · ${item.selectedColor}` : ""}
                          </p>
                          {/* Qty controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => addToCart(item, Math.max(1, (item.qty || 1) - 1), item.size)}
                              className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#4d1f73] transition text-gray-500"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="text-xs font-medium w-4 text-center">{item.qty || 1}</span>
                            <button
                              onClick={() => addToCart(item, (item.qty || 1) + 1, item.size)}
                              className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#4d1f73] transition text-gray-500"
                            >
                              <Plus size={11} />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.product, item.size, item.selectedColor)}
                              className="ml-1 text-gray-300 hover:text-red-400 transition"
                              title="Remove"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <p className="shrink-0 text-sm font-semibold text-gray-800">
                          ₹{(Number(item.price) * (item.qty || 1)).toLocaleString("en-IN")}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="h-px bg-gray-100 mb-4" />

                {/* Pricing */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-800">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-medium text-gray-800">
                      ₹{DELIVERY_FEE.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="h-px bg-gray-100 my-2" />
                  <div className="flex justify-between text-base font-bold text-gray-900">
                    <span>Total</span>
                    <span>
                      <span className="text-xs font-normal text-gray-400 mr-1">INR</span>
                      ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Pay button (desktop) */}
                <button
                  onClick={handlePay}
                  disabled={placing}
                  className="mt-6 w-full rounded-xl py-4 font-semibold text-white bg-[#4d1f73] hover:bg-[#7c3ea0] transition disabled:opacity-70 hidden lg:flex items-center justify-center gap-2"
                >
                  {placing ? (
                    <><Loader2 size={17} className="animate-spin" /> Processing...</>
                  ) : (
                    <><Lock size={15} /> Pay ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</>
                  )}
                </button>

                {/* Security badge */}
                <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                  <ShieldCheck size={12} />
                  <span>Secured by Razorpay · 100% Safe</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </>
  );
}
