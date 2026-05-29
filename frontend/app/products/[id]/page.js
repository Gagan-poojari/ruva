"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { ChevronLeft, Heart, Loader2, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

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

// ─── Razorpay loader (idempotent) ────────────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const id = params?.id;

  const [product, setProduct] = useState(null);

  const [related, setRelated] = useState([]);
  const [relatedPage, setRelatedPage] = useState(1);
  const [relatedPages, setRelatedPages] = useState(1);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedLoadingMore, setRelatedLoadingMore] = useState(false);
  const relatedSentinelRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [buyingNow, setBuyingNow] = useState(false);

  const currentVariant = useMemo(
    () => (Array.isArray(product?.colorVariants) ? product.colorVariants[selectedVariant] : null),
    [product, selectedVariant]
  );

  const availableSizes = useMemo(() => {
    if (!product) return [];
    if (currentVariant && Array.isArray(currentVariant.sizes) && currentVariant.sizes.length > 0) {
      return currentVariant.sizes;
    }
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes;
    }
    return [];
  }, [product, currentVariant]);

  const currentStock = useMemo(() => {
    if (!product) return 0;
    if (selectedSize) {
      const sizeObj = availableSizes.find((s) => s.label === selectedSize);
      if (sizeObj) {
        return Number(sizeObj.stock || 0);
      }
    }
    const variantStock = Number(currentVariant?.stock || 0);
    const productStock = Number(product?.stock || 0);
    return variantStock > 0 ? variantStock : productStock;
  }, [product, currentVariant, selectedSize, availableSizes]);

  const inStock = useMemo(() => currentStock > 0, [currentStock]);

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
    if (availableSizes.length > 0) {
      const firstInStock = availableSizes.find((s) => Number(s.stock || 0) > 0);
      const defaultSize = firstInStock?.label || availableSizes[0]?.label || "";
      if (!selectedSize || !availableSizes.some((s) => s.label === selectedSize)) {
        setSelectedSize(defaultSize);
      }
    } else {
      setSelectedSize("");
    }
  }, [availableSizes, selectedSize]);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (e) {
        toast.error("Failed to load product");
        router.push("/shop");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, router]);

  useEffect(() => {
    if (!product?._id || !product?.category) return;
    const load = async (pageNum, append) => {
      try {
        append ? setRelatedLoadingMore(true) : setRelatedLoading(true);
        const { data } = await api.get("/products", {
          params: { category: product.category, pageSize: 8, pageNumber: pageNum },
        });
        const items = (data?.products || []).filter((item) => item._id !== product._id);
        setRelated((prev) => append ? [...prev, ...items] : items);
        setRelatedPage(data?.page || pageNum);
        setRelatedPages(data?.pages || 1);
      } catch {
        // silently fail
      } finally {
        append ? setRelatedLoadingMore(false) : setRelatedLoading(false);
      }
    };
    load(1, false);
  }, [product?._id, product?.category]);

  // Infinite scroll for related
  useEffect(() => {
    if (!relatedSentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && relatedPage < relatedPages && !relatedLoadingMore && !relatedLoading) {
          const load = async () => {
            try {
              setRelatedLoadingMore(true);
              const nextPage = relatedPage + 1;
              const { data } = await api.get("/products", {
                params: { category: product.category, pageSize: 8, pageNumber: nextPage },
              });
              const items = (data?.products || []).filter((item) => item._id !== product._id);
              setRelated((prev) => [...prev, ...items]);
              setRelatedPage(data?.page || nextPage);
              setRelatedPages(data?.pages || 1);
            } catch {
              // silently fail
            } finally {
              setRelatedLoadingMore(false);
            }
          };
          load();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(relatedSentinelRef.current);
    return () => observer.disconnect();
  }, [relatedPage, relatedPages, relatedLoadingMore, relatedLoading, product?.category, product?._id]);

  const displayImages = useMemo(() => {
    const variantImgs = Array.isArray(currentVariant?.images) ? currentVariant.images : [];
    const baseImgs = Array.isArray(product?.images) ? product.images : [];
    const merged = variantImgs.length > 0 ? variantImgs : baseImgs;
    const safe = merged.filter((img) => img?.url);
    if (safe.length > 0) return safe;
    return [{ url: "https://via.placeholder.com/600x800?text=Ruva" }];
  }, [currentVariant, product]);

  const primaryImg = displayImages[0]?.url;
  const maxQty = Math.max(1, currentStock || 1);
  const liked = isInWishlist(product?._id);

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
        price: effectivePrice,
        image: primaryImg,
        selectedColor: currentVariant?.colorName || product?.colors?.[0] || "",
      },
      qty,
      sizeToUse
    );
    toast.success("Added to cart");
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    const added = toggleWishlist({
      ...product,
      image: primaryImg,
      price: effectivePrice,
      selectedColor: currentVariant?.colorName || product?.colors?.[0] || "",
    });
    toast.success(added ? "Added to wishlist" : "Removed from wishlist");
  };

 
  const handleBuyNow = useCallback(async () => {
    if (!product) return;
    if (!inStock) {
      toast.error("This product is out of stock");
      return;
    }
    const sizeToUse = selectedSize || "Free Size";
    addToCart(
      {
        ...product,
        price: effectivePrice,
        image: primaryImg,
        selectedColor: currentVariant?.colorName || product?.colors?.[0] || "",
      },
      qty,
      sizeToUse
    );
    router.push("/cart");
  })

  // ─── Render ───────────────────────────────────────────────────────────────
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
          {/* ── Image gallery ── */}
          <div className="flex flex-row lg:flex-col gap-4 lg:gap-6 overflow-x-auto lg:overflow-visible snap-x snap-mandatory pb-4 lg:pb-0 no-scrollbar">
            {displayImages.map((img, idx) => (
              <div
                key={`${img.url}-${idx}`}
                className="min-w-[85%] sm:min-w-[70%] lg:min-w-full snap-center rounded-3xl overflow-hidden border border-[#c87d1a]/15 bg-white/60"
              >
                <div className="relative aspect-3/4 bg-[#f6efe5] overflow-hidden">
                  <img
                    src={img.url}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 && discountPercent ? (
                    <div className="absolute top-4 left-4">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-full bg-emerald-600 text-white shadow">
                        {discountPercent}% off
                      </span>
                    </div>
                  ) : null}
                  {idx === 0 && !inStock ? (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-[10px] tracking-widest uppercase font-bold text-white px-3 py-1.5 rounded-full bg-black/50 border border-white/20">
                        Out of stock
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {/* ── Product info panel ── */}
          <div className="lg:sticky lg:top-8 self-start rounded-3xl border border-[#c87d1a]/15 bg-white/70 backdrop-blur-md p-6 lg:p-8">
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

            {/* Colour variants */}
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

            {/* Price */}
            <div className="mt-5 flex items-end gap-3">
              <div className="text-2xl font-black text-[#6b1a1a] sp2-num">{formatINR(effectivePrice)}</div>
              {discountPercent ? (
                <>
                  <div className="text-sm font-semibold text-[#6b1a1a]/60 line-through sp2-num">
                    {formatINR(currentVariant?.price > 0 ? currentVariant.price : product.price)}
                  </div>
                  <div className="text-sm font-extrabold text-emerald-700">{discountPercent}% off</div>
                </>
              ) : null}
            </div>

            <div className="mt-4 text-sm text-[#5a2a1a]/80 leading-relaxed">
              {product.description}
            </div>

            {/* Sizes */}
            {Array.isArray(availableSizes) && availableSizes.length > 0 && (
              <div className="mt-6">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b1a1a]/60 mb-2">
                  Size
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((s) => {
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

            {/* Quantity */}
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
              {(!inStock || currentStock <= 10) && (
                <div className="mt-2 text-[11px] text-[#6b1a1a]/55">
                  {inStock ? "Only few left" : "Currently unavailable"}
                </div>
              )}
            </div>

            {/* ── CTA buttons ── */}
            <div className="mt-7 flex flex-col gap-3">
              {/* Row 1: Add to cart + auxiliary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 bg-linear-to-r from-[#c87d1a] to-[#d4a017] text-white font-extrabold uppercase tracking-widest text-xs disabled:opacity-60"
                  style={{ boxShadow: "0 14px 34px rgba(200,125,26,0.25)" }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to cart
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/cart"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 bg-white/80 border border-[#c87d1a]/20 text-[#3d0a0a] font-extrabold uppercase tracking-widest text-xs hover:bg-white transition"
                  >
                    Go to cart
                  </Link>
                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 bg-white/80 border border-[#c87d1a]/20 text-[#3d0a0a] font-extrabold uppercase tracking-widest text-xs hover:bg-white transition"
                  >
                    <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
                    {liked ? "Liked" : "Like"}
                  </button>
                </div>
              </div>

              {/* Row 2: Buy Now - full width */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!inStock || buyingNow}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-extrabold uppercase tracking-widest text-xs transition disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #3d0a0a 0%, #6b1a1a 100%)",
                  color: "#fffaf3",
                  boxShadow: "0 14px 34px rgba(61,10,10,0.30)",
                }}
              >
                {buyingNow ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    {/* <Zap className="w-4 h-4" /> */}
                    Buy Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Related sarees ── */}
        {/* ── Related / You May Also Like ── */}
        <div className="mt-16">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#c87d1a]/15" />
            <h2 className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-[#6b1a1a]/60"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              You May Also Like
            </h2>
            <span className="h-px flex-1 bg-[#c87d1a]/15" />
          </div>

          {relatedLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-3/4 bg-[#f0e8da]" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-[#f0e8da] rounded w-3/4" />
                    <div className="h-3 bg-[#f0e8da] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : related.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {related.map((item) => {
                  const image = item?.colorVariants?.[0]?.images?.[0]?.url || item?.images?.[0]?.url || "https://via.placeholder.com/400x533?text=Ruva";
                  const itemPrice = item?.discountPrice > 0 && item?.discountPrice < item?.price ? item.discountPrice : item.price;
                  const pct = item?.discountPrice > 0 && item?.price > 0
                    ? Math.round(((item.price - item.discountPrice) / item.price) * 100)
                    : null;
                  return (
                    <Link
                      key={item._id}
                      href={`/products/${item._id}`}
                      className="group rounded-2xl overflow-hidden border border-[#c87d1a]/15 bg-white hover:shadow-lg transition-shadow"
                    >
                      <div className="relative aspect-3/4 bg-[#f6efe5] overflow-hidden">
                        <img
                          src={image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                          loading="lazy"
                        />
                        {pct && (
                          <span className="absolute top-2 left-2 text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-[#1e4d2b] text-[#a3f0b8]">
                            {pct}% off
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="text-[9px] uppercase tracking-widest text-[#6b1a1a]/50 mb-0.5">
                          {item.category}{item.fabric ? ` · ${item.fabric}` : ""}
                        </div>
                        <div className="text-[0.82rem] font-bold text-[#2a0505] line-clamp-2 leading-snug"
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                          {item.name}
                        </div>
                        <div className="mt-2 flex items-baseline gap-1.5">
                          <span className="text-[0.88rem] font-extrabold text-[#6b1a1a] sp2-num">
                            ₹{Number(itemPrice).toLocaleString("en-IN")}
                          </span>
                          {pct && (
                            <span className="text-[0.72rem] text-[#6b1a1a]/60 line-through sp2-num">
                              ₹{Number(item.price).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Infinite scroll sentinel */}
              <div ref={relatedSentinelRef} className="mt-8 flex justify-center h-10">
                {relatedLoadingMore && (
                  <div className="flex items-center gap-2 text-[#6b1a1a]/40">
                    <Loader2 size={16} className="animate-spin text-[#c9853c]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      Loading more…
                    </span>
                  </div>
                )}
                {!relatedLoadingMore && relatedPage >= relatedPages && related.length > 0 && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b1a1a]/30"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    - End of Collection -
                  </p>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}