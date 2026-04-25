"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (item) => {
    addToCart(item, 1, item.size || "Free Size");
    toast.success("Added to cart");
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden py-14 px-4 sm:px-6">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#fff4f4_0%,#fff7eb_100%)]" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p
            className="uppercase tracking-[0.28em] text-[0.66rem] text-[#7a4f1f]/80 mb-2"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Saved Favourites
          </p>
          <h1
            className="text-4xl sm:text-5xl text-[#2f0f45] font-bold"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Your Wishlist
          </h1>
        </motion.div>

        {wishlistItems.length === 0 ? (
          <div className="rounded-3xl border border-[#d9b06d]/35 bg-white/75 backdrop-blur-md p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[linear-gradient(145deg,#7a1f1f,#b03b3b)] text-[#fff1da] flex items-center justify-center">
              <Heart size={28} />
            </div>
            <p className="text-[#5d3a22]/80 mb-6">You have not liked any items yet.</p>
            <Link
              href="/shop"
              className="inline-flex items-center rounded-full px-7 py-3 text-[#fff0d7] border border-[#f2d08a]/60 bg-[linear-gradient(135deg,#7a1f1f,#b03b3b)] hover:brightness-110 transition"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {wishlistItems.map((item) => (
              <div
                key={item.product || item._id}
                className="rounded-2xl border border-[#d9b06d]/35 bg-white/80 backdrop-blur-sm overflow-hidden"
              >
                <Link href={`/products/${item.product || item._id}`} className="block">
                  <img
                    src={item.image || item.images?.[0]?.url || "/sarees/silk_cotton_saree.png"}
                    alt={item.name || "Wishlist item"}
                    className="w-full h-72 object-cover"
                  />
                </Link>
                <div className="p-4">
                  <p className="text-[#2f0f45] font-semibold line-clamp-2">{item.name || "Ruva Saree"}</p>
                  <p className="text-[#5c2b12] font-semibold mt-1">₹{Number(item.price || 0).toLocaleString("en-IN")}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(item)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[#fff0d7] border border-[#f2d08a]/60 bg-[linear-gradient(135deg,#4d1f73,#7c3ea0)] hover:brightness-110 transition text-xs font-bold uppercase tracking-widest"
                    >
                      <ShoppingBag size={14} />
                      Add to cart
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item.product || item._id)}
                      className="inline-flex items-center justify-center rounded-xl px-3 py-2.5 text-[#8f3d2d] border border-[#d9b06d]/40 bg-white hover:bg-[#fff4e8] transition"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
