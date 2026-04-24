"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { ChevronLeft, Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

function formatINR(value) {
  const num = Number(value || 0);
  return `₹${num.toLocaleString("en-IN")}`;
}

function getDiscountPercent(price, discountPrice) {
  const p = Number(price || 0);
  const d = Number(discountPrice || 0);
  if (!p || !d || d >= p) return null;
  return Math.round(((p - d) / p) * 100);
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const id = params?.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(0);

  const currentVariant = useMemo(
    () => (Array.isArray(product?.colorVariants) ? product.colorVariants[selectedVariant] : null),
    [product, selectedVariant]
  );

  const inStock = useMemo(() => {
    if (currentVariant) return (currentVariant.stock ?? 0) > 0;
    return (product?.stock ?? 0) > 0;
  }, [product, currentVariant]);

  const effectivePrice = useMemo(() => {
    if (!product) return 0;
    const basePrice = currentVariant?.price > 0 ? currentVariant.price : product.price;
    const baseDiscount =
      currentVariant?.discountPrice > 0 ? currentVariant.discountPrice : product.discountPrice;
    return baseDiscount && baseDiscount > 0 && baseDiscount < basePrice ? baseDiscount : basePrice;
  }, [product, currentVariant]);

  const discountPercent = useMemo(() => {
    if (!product) return null;
    const basePrice = currentVariant?.price > 0 ? currentVariant.price : product.price;
    const baseDiscount =
      currentVariant?.discountPrice > 0 ? currentVariant.discountPrice : product.discountPrice;
    return getDiscountPercent(basePrice, baseDiscount);
  }, [product, currentVariant]);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        const firstSize = Array.isArray(data?.sizes) && data.sizes.length > 0 ? data.sizes[0]?.label : "";
        setSelectedSize(firstSize || "");
      } catch (e) {
        toast.error("Failed to load product");
        router.push("/shop");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, router]);

  const primaryImg =
    currentVariant?.images?.[0]?.url ||
    product?.images?.[0]?.url ||
    "https://via.placeholder.com/600x800?text=Ruva";

  const maxQty = Math.max(1, Number(currentVariant?.stock || product?.stock || 1));

  const handleAddToCart = () => {
    if (!product) return;
    if (!inStock) {
      toast.error("This product is out of stock");
      return;
    }
    const sizeToUse = selectedSize || "Free Size";
    addToCart(
      {
        ...product,
        image: primaryImg,
        selectedColor: currentVariant?.colorName || product?.colors?.[0] || "",
      },
      qty,
      sizeToUse
    );
    toast.success("Added to cart");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#fdf8ef]">
        <div className="flex items-center gap-2 text-[#6b1a1a]/70">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-bold tracking-widest uppercase text-xs">Loading…</span>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#fdf8ef]">
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-16">
        <div className="mb-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-[#6b1a1a] font-extrabold uppercase tracking-widest text-[11px]"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to shop
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-3xl overflow-hidden border border-[#c87d1a]/15 bg-white/60">
            <div className="relative aspect-[3/4] bg-[#f6efe5] overflow-hidden">
              <img src={primaryImg} alt={product.name} className="w-full h-full object-cover" />
              {discountPercent ? (
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-full bg-emerald-600 text-white shadow">
                    {discountPercent}% off
                  </span>
                </div>
              ) : null}
              {!inStock ? (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-white px-3 py-1.5 rounded-full bg-black/50 border border-white/20">
                    Out of stock
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-[#c87d1a]/15 bg-white/70 backdrop-blur-md p-6 lg:p-8">
            <div
              className="text-3xl lg:text-4xl font-black text-[#2a0505]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {product.name}
            </div>
            <div className="mt-2 text-[11px] text-[#6b1a1a]/60 uppercase tracking-widest">
              {product.category}
              {product.fabric ? ` • ${product.fabric}` : ""}
            </div>
            {Array.isArray(product.colorVariants) && product.colorVariants.length > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b1a1a]/60">
                  Colour
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colorVariants.map((variant, idx) => {
                    const active = idx === selectedVariant;
                    return (
                      <button
                        key={`${variant.colorName}-${idx}`}
                        type="button"
                        title={variant.colorName}
                        onClick={() => setSelectedVariant(idx)}
                        className="w-7 h-7 rounded-full border-2"
                        style={{
                          backgroundColor: variant.colorHex || variant.colorName || "#cccccc",
                          borderColor: active ? "#3d0a0a" : "rgba(61,10,10,0.2)",
                        }}
                      />
                    );
                  })}
                </div>
                <span className="text-xs text-[#6b1a1a]/70 font-semibold">
                  {currentVariant?.colorName || product.colors?.[0] || "Default"}
                </span>
              </div>
            )}

            <div className="mt-5 flex items-end gap-3">
              <div className="text-2xl font-black text-[#6b1a1a]">{formatINR(effectivePrice)}</div>
              {discountPercent ? (
                <>
                  <div className="text-sm font-bold text-[#6b1a1a]/45 line-through">
                    {formatINR(currentVariant?.price > 0 ? currentVariant.price : product.price)}
                  </div>
                  <div className="text-sm font-extrabold text-emerald-700">{discountPercent}% off</div>
                </>
              ) : null}
            </div>

            <div className="mt-4 text-sm text-[#5a2a1a]/80 leading-relaxed">
              {product.description}
            </div>

            {Array.isArray(product.sizes) && product.sizes.length > 0 && (
              <div className="mt-6">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b1a1a]/60 mb-2">
                  Size
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => {
                    const disabled = (s.stock ?? 0) <= 0;
                    const active = selectedSize === s.label;
                    return (
                      <button
                        key={s.label}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedSize(s.label)}
                        className="px-3 py-2 rounded-xl text-xs font-extrabold uppercase tracking-widest border transition disabled:opacity-50"
                        style={{
                          background: active ? "#3d0a0a" : "rgba(255,255,255,0.7)",
                          color: active ? "#fffaf3" : "#3d0a0a",
                          borderColor: "rgba(200,125,26,0.22)",
                        }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b1a1a]/60 mb-2">
                Quantity
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-[#c87d1a]/20 bg-white/70 px-2 py-2">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-2 rounded-xl hover:bg-[#fdf3e3] transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="min-w-10 text-center font-extrabold text-[#2a0505]">{qty}</div>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  className="p-2 rounded-xl hover:bg-[#fdf3e3] transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 text-[11px] text-[#6b1a1a]/55">
                {inStock ? `${currentVariant?.stock ?? product.stock} available` : "Currently unavailable"}
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 bg-gradient-to-r from-[#c87d1a] to-[#d4a017] text-white font-extrabold uppercase tracking-widest text-xs disabled:opacity-60"
                style={{ boxShadow: "0 14px 34px rgba(200,125,26,0.25)" }}
              >
                <ShoppingBag className="w-4 h-4" />
                Add to cart
              </button>
              <Link
                href="/cart"
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 bg-white/80 border border-[#c87d1a]/20 text-[#3d0a0a] font-extrabold uppercase tracking-widest text-xs hover:bg-white transition"
              >
                Go to cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

