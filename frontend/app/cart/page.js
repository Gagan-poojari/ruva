"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import toast from "react-hot-toast";

const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

const rise = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true, amount: 0.2 },
};

export default function CartPage() {
  const router = useRouter();
  const { cartItems, addToCart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [placing, setPlacing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [rzKey, setRzKey] = useState(RAZORPAY_KEY || "");
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
    email: "",
    phone: "",
  });

  const subtotal = cartItems.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    return sum + price * (item.qty || 1);
  }, 0);

  const DELIVERY_FEE = 49;
  const taxAmount = Math.round(subtotal * 0.02 * 100) / 100;
  const grandTotal = subtotal + DELIVERY_FEE + taxAmount;

  useEffect(() => {
    if (typeof window !== "undefined" && window.Razorpay) {
      setRazorpayLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!user?.token || rzKey) return;
    api.get("/orders/razorpay-key")
      .then(({ data }) => {
        if (data?.key) setRzKey(data.key);
      })
      .catch(() => {});
  }, [user, rzKey]);

  // ---------- Razorpay payment handler ----------
  const openRazorpayCheckout = useCallback(
    ({ razorpayOrder, dbOrder }) => {
      if (!window.Razorpay) {
        toast.error("Payment gateway failed to load. Please refresh and try again.");
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
          name: user?.name || "",
          email: shippingAddress.email || user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#4d1f73" },

        // -------- SUCCESS --------
        handler: async (response) => {
          try {
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: dbOrder._id,
            };

            await api.post("/orders/verify", verifyPayload);
            clearCart();
            toast.success("Payment successful! Your order is confirmed.");
            router.push("/profile");
          } catch (err) {
            console.error("Payment verification failed:", err);
            toast.error(
              err?.response?.data?.message ||
                "Payment verification failed. If money was deducted, it will be refunded automatically."
            );
          }
        },

        // -------- MODAL DISMISSED / PAYMENT FAILED --------
        modal: {
          ondismiss: () => {
            toast("Payment was not completed. You can retry from your orders.", {
              icon: "⚠️",
              duration: 5000,
            });
            // Don't clear cart — user might want to retry
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        console.error("Razorpay payment failed:", response.error);
        toast.error(
          response.error?.description || "Payment failed. Please try again."
        );
      });

      rzp.open();
    },
    [user, shippingAddress, clearCart, router, rzKey]
  );

  // ---------- Place order ----------
  const placeOrder = async () => {
    if (!user?.token) {
      toast.error("Please login first to continue checkout.");
      router.push("/login");
      return;
    }

    if (
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      toast.error("Please fill all required shipping fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!shippingAddress.email || !emailRegex.test(shippingAddress.email)) {
      toast.error("Please enter a valid Email Address for order updates.");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!shippingAddress.phone || !phoneRegex.test(shippingAddress.phone)) {
      toast.error("Please enter a valid 10-digit Phone Number.");
      return;
    }

    if (!cartItems.length) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!rzKey) {
      toast.error("Payment setup is incomplete. Please refresh and try again.");
      return;
    }

    if ((!razorpayLoaded && typeof window !== "undefined" && window.Razorpay)) {
      setRazorpayLoaded(true);
    }

    if (!window.Razorpay) {
      toast.error("Payment gateway is still loading. Please wait a moment.");
      return;
    }

    setPlacing(true);
    try {
      const payload = {
        orderItems: cartItems.map((item) => ({
          product: item.product,
          qty: item.qty || 1,
          price: Number(item.price) || 0,
          size: item.size || undefined,
        })),
        shippingAddress,
        paymentMethod: "Razorpay",
        itemsPrice: subtotal,
        taxPrice: taxAmount,
        shippingPrice: DELIVERY_FEE,
        totalPrice: grandTotal,
      };

      const { data } = await api.post("/orders", payload);

      if (!data?.razorpayOrder?.id || !data?.order?._id) {
        throw new Error("Invalid order response from server.");
      }

      // Open Razorpay checkout modal
      openRazorpayCheckout({
        razorpayOrder: data.razorpayOrder,
        dbOrder: data.order,
      });
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error(error?.response?.data?.message || "Failed to create order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      {/* Load Razorpay SDK script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => toast.error("Failed to load payment gateway.")}
      />

      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden py-14 px-4 sm:px-6">
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#f7efff_0%,#fff7eb_100%)]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, rgba(162,108,38,0.12) 0, rgba(162,108,38,0.12) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(45deg, rgba(162,108,38,0.1) 0, rgba(162,108,38,0.1) 1px, transparent 1px, transparent 20px)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl">
          <motion.div {...rise} className="mb-10">
            <p
              className="uppercase tracking-[0.28em] text-[0.66rem] text-[#7a4f1f]/80 mb-2"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Curated Checkout
            </p>
            <h1
              className="text-4xl sm:text-5xl text-[#2f0f45] font-bold"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Your Cart
            </h1>
          </motion.div>

          {cartItems.length === 0 ? (
            <motion.div
              {...rise}
              transition={{ ...rise.transition, delay: 0.08 }}
              className="rounded-3xl border border-[#d9b06d]/35 bg-white/75 backdrop-blur-md p-10 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[linear-gradient(145deg,#5d247e,#8d4fb7)] text-[#fff1da] flex items-center justify-center">
                <ShoppingBag size={28} />
              </div>
              <p className="text-[#5d3a22]/80 mb-6">Your cart is empty. Let&apos;s find something timeless.</p>
              <Link
                href="/shop"
                className="inline-flex items-center rounded-full px-7 py-3 text-[#fff0d7] border border-[#f2d08a]/60 bg-[linear-gradient(135deg,#4d1f73,#7c3ea0)] hover:brightness-110 transition"
              >
                Continue Shopping
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
              <motion.div {...rise} className="space-y-4">
                {cartItems.map((item) => (
                  (() => {
                    const imageSrc =
                      typeof item.image === "string" && item.image.trim()
                        ? item.image.trim()
                        : "/sarees/silk_cotton_saree.png";

                    return (
                  <div
                    key={`${item.product}-${item.size}`}
                    className="rounded-2xl border border-[#d9b06d]/35 bg-white/75 backdrop-blur-sm p-4 sm:p-5 flex gap-4"
                  >
                    <img
                      src={imageSrc}
                      alt={item.name || "Cart item"}
                      className="w-24 h-28 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <p className="text-[#2f0f45] font-semibold">{item.name || "Ruva Saree"}</p>
                      <p className="text-sm text-[#6b4a2f]/70 uppercase tracking-[0.12em] mt-1">
                        Size: {item.size || "Free Size"}
                      </p>
                      <p className="text-[#5c2b12] font-semibold mt-2">₹{Number(item.price) || 0}</p>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#d9b06d]/35 bg-white px-2 py-1">
                          <button
                            onClick={() => addToCart(item, Math.max(1, (item.qty || 1) - 1), item.size)}
                            className="p-1.5 rounded-full hover:bg-[#f8eddc] transition"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm min-w-5 text-center">{item.qty || 1}</span>
                          <button
                            onClick={() => addToCart(item, (item.qty || 1) + 1, item.size)}
                            className="p-1.5 rounded-full hover:bg-[#f8eddc] transition"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product)}
                          className="inline-flex items-center gap-1.5 text-sm text-[#8f3d2d] hover:text-[#6b1a1a] transition"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                    );
                  })()
                ))}
              </motion.div>

              <motion.aside
                {...rise}
                transition={{ ...rise.transition, delay: 0.1 }}
                className="rounded-3xl border border-[#d9b06d]/35 bg-white/80 backdrop-blur-md p-6 h-fit"
              >
                <p className="text-[#2f0f45] text-xl font-semibold mb-5">Order Summary</p>
                <div className="space-y-3 text-[#5d3a22]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₹{DELIVERY_FEE.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (2%)</span>
                    <span>₹{taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="h-px bg-[#d9b06d]/35 my-2" />
                  <div className="flex justify-between text-[#2f0f45] font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <input
                    id="shipping-street"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress((s) => ({ ...s, street: e.target.value }))}
                    placeholder="Street Address *"
                    className="w-full rounded-xl border border-[#d9b06d]/35 bg-white px-3 py-2 text-sm outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      id="shipping-city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress((s) => ({ ...s, city: e.target.value }))}
                      placeholder="City *"
                      className="w-full rounded-xl border border-[#d9b06d]/35 bg-white px-3 py-2 text-sm outline-none"
                    />
                    <input
                      id="shipping-state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress((s) => ({ ...s, state: e.target.value }))}
                      placeholder="State *"
                      className="w-full rounded-xl border border-[#d9b06d]/35 bg-white px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      id="shipping-pincode"
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress((s) => ({ ...s, pincode: e.target.value }))}
                      placeholder="Pincode *"
                      className="w-full rounded-xl border border-[#d9b06d]/35 bg-white px-3 py-2 text-sm outline-none"
                    />
                    <input
                      type="email"
                      id="shipping-email"
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress((s) => ({ ...s, email: e.target.value }))}
                      placeholder="Email Address *"
                      className="w-full rounded-xl border border-[#d9b06d]/35 bg-white px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="tel"
                      id="shipping-phone"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress((s) => ({ ...s, phone: e.target.value }))}
                      placeholder="Phone Number *"
                      maxLength={10}
                      className="w-full rounded-xl border border-[#d9b06d]/35 bg-white px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>

                <button
                  id="checkout-button"
                  onClick={placeOrder}
                  disabled={placing}
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
                      Pay ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              </motion.aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
