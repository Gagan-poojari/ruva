"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, Star, ArrowRight,
  Loader2, X, ChevronDown, Sparkles, LayoutGrid, List, Heart, ShoppingCart,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

/* ─── helpers ─── */
function formatINR(v) {
  return `₹${Number(v || 0).toLocaleString("en-IN")}`;
}
function discount(price, disc) {
  const p = Number(price || 0), d = Number(disc || 0);
  if (!p || !d || d >= p) return null;
  return Math.round(((p - d) / p) * 100);
}
function primaryImg(product) {
  return product?.images?.[0]?.url || "https://via.placeholder.com/400x533?text=Ruva";
}

function getVariantPricing(product, variant) {
  if (!variant) return { price: product.price, discountPrice: product.discountPrice, stock: product.stock };
  return {
    price: Number(variant.price || 0) > 0 ? Number(variant.price) : product.price,
    discountPrice: Number(variant.discountPrice || 0) > 0 ? Number(variant.discountPrice) : product.discountPrice,
    stock: Number(variant.stock || 0),
  };
}

function ColorPalette({ product, selectedVariant, setSelectedVariant }) {
  const variants = Array.isArray(product.colorVariants) ? product.colorVariants : [];
  if (!variants.length) return null;

  return (
    <div className="absolute right-2 top-2 flex flex-col gap-2 z-10">
      {variants.map((variant, idx) => {
        const active = idx === selectedVariant;
        return (
          <button
            type="button"
            key={`${variant.colorName}-${idx}`}
            title={variant.colorName}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedVariant(idx);
            }}
            className="w-6 h-6 rounded-full border-2 transition"
            style={{
              backgroundColor: variant.colorHex || variant.colorName || "#cccccc",
              borderColor: active ? "#ffffff" : "rgba(255,255,255,0.55)",
              boxShadow: active ? "0 0 0 2px rgba(61,10,10,0.55)" : "0 2px 8px rgba(0,0,0,0.2)",
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── motion variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.72, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};
const listItem = {
  hidden: { opacity: 0, x: -18 },
  show: (i = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.58, delay: i * 0.055, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─────────────── GRID CARD ─────────────── */
function GridCard({ product, index }) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const variant = product?.colorVariants?.[selectedVariant];
  const { price, discountPrice, stock } = getVariantPricing(product, variant);
  const pct = discount(price, discountPrice);
  const effectivePrice = pct ? discountPrice : price;
  const inStock = (stock ?? 0) > 0;
  const displayImage = variant?.images?.[0]?.url || primaryImg(product);
  const liked = isInWishlist(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) {
      toast.error("This item is out of stock");
      return;
    }
    addToCart(
      {
        ...product,
        image: displayImage,
        price: effectivePrice,
        selectedColor: variant?.colorName || product?.colors?.[0] || "",
      },
      1,
      "Free Size"
    );
    toast.success("Added to cart");
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist({
      ...product,
      image: displayImage,
      price: effectivePrice,
      selectedColor: variant?.colorName || product?.colors?.[0] || "",
    });
    toast.success(added ? "Added to wishlist" : "Removed from wishlist");
  };

  return (
    <motion.div custom={index} variants={fadeUp} initial="hidden" animate="show">
      <Link
        href={`/products/${product._id}`}
        className="group relative block rounded-2xl overflow-hidden bg-white"
        style={{ boxShadow: "0 8px 32px rgba(42,5,5,0.09), 0 1px 4px rgba(201,133,60,0.08)" }}
      >
        {/* ── image ── */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-1100 group-hover:scale-[1.07]"
            loading="lazy"
          />
          <ColorPalette product={product} selectedVariant={selectedVariant} setSelectedVariant={setSelectedVariant} />

          {/* gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-[#140404]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {pct && (
              <span className="tag-pill bg-[#1e4d2b] text-[#a3f0b8] border border-[#a3f0b8]/20 px-2 py-0.5">
                {pct}% off
              </span>
            )}
            {!inStock && (
              <span className="tag-pill bg-black/60 text-white/80 border border-white/15 px-2 py-0.5 backdrop-blur-sm">
                Sold out
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-transform hover:scale-105"
            style={{
              background: liked ? "rgba(127,29,29,0.88)" : "rgba(255,255,255,0.75)",
              borderColor: liked ? "rgba(255,232,176,0.45)" : "rgba(61,10,10,0.2)",
              color: liked ? "#ffe8b0" : "#6b1a1a",
            }}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={14} fill={liked ? "currentColor" : "none"} />
          </button>

          {/* hover CTA */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] px-4 pb-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                className="w-full py-2.5 rounded-xl text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#ffe8b0] border border-[#f0c97a]/50 bg-[rgba(20,4,4,0.7)] backdrop-blur-md disabled:opacity-60 inline-flex items-center justify-center gap-1.5"
              >
                <ShoppingCart size={12} />
                Add
              </button>
              <button className="w-full py-2.5 rounded-xl text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#ffe8b0] border border-[#f0c97a]/50 bg-[rgba(20,4,4,0.55)] backdrop-blur-md">
                View
              </button>
            </div>
          </div>
        </div>

        {/* ── info ── */}
        <div className="px-3.5 pt-3 pb-4">
          <p className="text-[0.6rem] uppercase tracking-[0.2em] text-[#6b1a1a]/50 mb-0.5" style={{ fontFamily: "var(--font-label)" }}>
            {product.category}{product.fabric ? ` · ${product.fabric}` : ""}
          </p>
          <h3 className="text-[0.92rem] font-bold text-[#2a0505] leading-snug line-clamp-2" style={{ fontFamily: "var(--font-display)" }}>
            {product.name}
          </h3>
          {variant?.colorName && (
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[#6b1a1a]/55 mt-1">
              {variant.colorName}
            </p>
          )}

          <div className="mt-2.5 flex items-center justify-between">
            <div>
              <span className="text-base font-black text-[#6b1a1a]" style={{ fontFamily: "var(--font-display)" }}>
                {formatINR(effectivePrice)}
              </span>
              {pct && (
                <span className="ml-2 text-[0.68rem] text-[#6b1a1a]/40 line-through">
                  {formatINR(price)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 bg-[#f0faf4] border border-[#a3f0b8]/40 rounded-full px-2 py-0.5">
              <Star className="w-3 h-3 text-[#1e7d41] fill-[#1e7d41]" />
              <span className="text-[0.62rem] font-bold text-[#1e7d41]">4.6</span>
            </div>
          </div>
        </div>

        {/* gold border */}
        <div className="gold-border-inset" />
      </Link>
    </motion.div>
  );
}

/* ─────────────── LIST ROW (mobile flagship) ─────────────── */
function ListRow({ product, index }) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const variant = product?.colorVariants?.[selectedVariant];
  const { price, discountPrice, stock } = getVariantPricing(product, variant);
  const pct = discount(price, discountPrice);
  const effectivePrice = pct ? discountPrice : price;
  const inStock = (stock ?? 0) > 0;
  const displayImage = variant?.images?.[0]?.url || primaryImg(product);
  const liked = isInWishlist(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) {
      toast.error("This item is out of stock");
      return;
    }
    addToCart(
      {
        ...product,
        image: displayImage,
        price: effectivePrice,
        selectedColor: variant?.colorName || product?.colors?.[0] || "",
      },
      1,
      "Free Size"
    );
    toast.success("Added to cart");
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist({
      ...product,
      image: displayImage,
      price: effectivePrice,
      selectedColor: variant?.colorName || product?.colors?.[0] || "",
    });
    toast.success(added ? "Added to wishlist" : "Removed from wishlist");
  };

  return (
    <motion.div custom={index} variants={listItem} initial="hidden" animate="show">
      <Link
        href={`/products/${product._id}`}
        className="group flex gap-3.5 p-3 rounded-2xl bg-white active:scale-[0.985] transition-transform"
        style={{ boxShadow: "0 4px 20px rgba(42,5,5,0.07), 0 1px 3px rgba(201,133,60,0.07)" }}
      >
        {/* thumbnail */}
        <div className="relative w-[108px] h-[150px] rounded-xl overflow-hidden shrink-0 bg-[#f6efe5]">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-active:scale-[1.04]"
            loading="lazy"
          />
          <ColorPalette product={product} selectedVariant={selectedVariant} setSelectedVariant={setSelectedVariant} />
          {pct && (
            <span className="absolute top-1.5 left-1.5 tag-pill bg-[#1e4d2b] text-[#a3f0b8] border border-[#a3f0b8]/20 px-1.5 py-0.5">
              {pct}% off
            </span>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-[0.55rem] font-bold uppercase tracking-widest text-white">Sold out</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center border backdrop-blur-md"
            style={{
              background: liked ? "rgba(127,29,29,0.88)" : "rgba(255,255,255,0.8)",
              borderColor: liked ? "rgba(255,232,176,0.45)" : "rgba(61,10,10,0.2)",
              color: liked ? "#ffe8b0" : "#6b1a1a",
            }}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={13} fill={liked ? "currentColor" : "none"} />
          </button>
        </div>

        {/* details */}
        <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
          <div>
            <h3 className="text-[0.92rem] font-bold text-[#2a0505] leading-snug line-clamp-2" style={{ fontFamily: "var(--font-display)" }}>
              {product.name}
            </h3>
            <div className="mt-2 space-y-1 text-[0.62rem] text-[#5a2a1a]/70 uppercase tracking-[0.15em]">
              <p>Brand: Devika Textiles</p>
              <p>Category: {product.category || "Sarees"}</p>
              <p>Fabric: {product.fabric || "Fine Silk"}</p>
              <p>Color: {variant?.colorName || product.colors?.[0] || "Classic"}</p>
            </div>
          </div>

          <div className="mt-2 flex items-end justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[1.05rem] font-black text-[#6b1a1a]" style={{ fontFamily: "var(--font-display)" }}>
                  {formatINR(effectivePrice)}
                </span>
                {pct && (
                  <span className="text-[0.65rem] text-[#6b1a1a]/40 line-through">{formatINR(price)}</span>
                )}
              </div>
              <span
                className="text-[0.58rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border mt-1 inline-block"
                style={{
                  background: inStock ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                  borderColor: inStock ? "rgba(16,185,129,0.22)" : "rgba(239,68,68,0.22)",
                  color: inStock ? "#047857" : "#b91c1c",
                  fontFamily: "var(--font-label)",
                }}
              >
                {inStock ? `${stock} left` : "Sold out"}
              </span>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-1 bg-[#f0faf4] border border-[#a3f0b8]/40 rounded-full px-2 py-0.5">
                <Star className="w-3 h-3 text-[#1e7d41] fill-[#1e7d41]" />
                <span className="text-[0.6rem] font-bold text-[#1e7d41]">4.6</span>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                className="text-[0.58rem] font-black uppercase tracking-widest text-[#c87d1a] flex items-center gap-1 border border-[#c87d1a]/35 rounded-full px-2 py-1 disabled:opacity-50"
                style={{ fontFamily: "var(--font-label)" }}
              >
                <ShoppingCart size={10} />
                Add
              </button>
              <span className="text-[0.56rem] font-black uppercase tracking-widest text-[#8b5a1c] flex items-center gap-0.5" style={{ fontFamily: "var(--font-label)" }}>
                View <ArrowRight size={9} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─────────────── FILTER SHEET (bottom sheet on mobile) ─────────────── */
function FilterSheet({ open, onClose, category, setCategory, fabric, setFabric, sort, setSort, defaultCategory, onReset }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
            style={{
              background: "linear-gradient(175deg,#fdf8f0,#f9edda)",
              boxShadow: "0 -20px 60px rgba(42,5,5,0.18)",
              borderTop: "1px solid rgba(201,133,60,0.25)",
            }}
          >
            {/* handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#c87d1a]/30" />
            </div>

            <div className="px-5 pb-8 pt-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#2a0505]" style={{ fontFamily: "var(--font-display)" }}>
                  Filters & Sort
                </h3>
                <button onClick={onClose} className="p-2 rounded-full bg-[#f6ede0] border border-[#c87d1a]/15">
                  <X size={16} className="text-[#6b1a1a]" />
                </button>
              </div>

              {/* Sort */}
              <div className="mb-5">
                <p className="text-[0.65rem] uppercase tracking-[0.22em] font-bold text-[#6b1a1a]/60 mb-3" style={{ fontFamily: "var(--font-label)" }}>Sort by</p>
                <div className="grid grid-cols-3 gap-2">
                  {[["new","Newest"],["price_asc","Low → High"],["price_desc","High → Low"]].map(([v, label]) => (
                    <button
                      key={v}
                      onClick={() => setSort(v)}
                      className="py-2.5 rounded-xl text-[0.65rem] font-bold uppercase tracking-widest border transition-all"
                      style={{
                        fontFamily: "var(--font-label)",
                        background: sort === v ? "linear-gradient(130deg,#6b1a1a,#a03030)" : "rgba(255,255,255,0.7)",
                        borderColor: sort === v ? "transparent" : "rgba(201,133,60,0.2)",
                        color: sort === v ? "#ffe8b0" : "#3d0a0a",
                        boxShadow: sort === v ? "0 4px 14px rgba(107,26,26,0.28)" : "none",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="mb-5">
                <p className="text-[0.65rem] uppercase tracking-[0.22em] font-bold text-[#6b1a1a]/60 mb-3" style={{ fontFamily: "var(--font-label)" }}>Category</p>
                <div className="flex flex-wrap gap-2">
                  {["", "Sarees", "Blouse", "Dupatta"].map((c) => (
                    <button
                      key={c || "all"}
                      onClick={() => setCategory(c)}
                      className="px-4 py-2 rounded-full text-[0.65rem] font-bold uppercase tracking-widest border transition-all"
                      style={{
                        fontFamily: "var(--font-label)",
                        background: category === c ? "linear-gradient(130deg,#6b1a1a,#a03030)" : "rgba(255,255,255,0.7)",
                        borderColor: category === c ? "transparent" : "rgba(201,133,60,0.2)",
                        color: category === c ? "#ffe8b0" : "#3d0a0a",
                        boxShadow: category === c ? "0 4px 14px rgba(107,26,26,0.28)" : "none",
                      }}
                    >
                      {c || "All"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabric */}
              <div className="mb-6">
                <p className="text-[0.65rem] uppercase tracking-[0.22em] font-bold text-[#6b1a1a]/60 mb-3" style={{ fontFamily: "var(--font-label)" }}>Fabric</p>
                <input
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  placeholder="e.g. Banarasi, Silk Cotton…"
                  className="w-full px-4 py-3 rounded-xl bg-white/70 border border-[#c87d1a]/15 text-[#2a0505] font-semibold text-sm outline-none placeholder:text-[#6b1a1a]/35"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onReset}
                  className="flex-1 py-3 rounded-xl border border-[#c87d1a]/25 text-[#3d0a0a] font-bold text-xs uppercase tracking-widest bg-white/70"
                  style={{ fontFamily: "var(--font-label)" }}
                >
                  Reset
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-[#ffe8b0]"
                  style={{
                    fontFamily: "var(--font-label)",
                    background: "linear-gradient(130deg,#6b1a1a,#a03030)",
                    boxShadow: "0 6px 20px rgba(107,26,26,0.35)",
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────── MAIN PAGE ─────────────── */
function ProductListContent({ title = "Shop", defaultCategory = "" }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [fabric, setFabric] = useState("");
  const [sort, setSort] = useState("new");
  const [view, setView] = useState("list"); // "list" | "grid"
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilters = [category, fabric].filter(Boolean).length;

  const queryParams = useMemo(() => {
    const p = { pageNumber: 1 };
    if (keyword.trim()) p.keyword = keyword.trim();
    if (category) p.category = category;
    if (fabric) p.fabric = fabric;
    return p;
  }, [keyword, category, fabric]);

  const visibleProducts = useMemo(() => {
    const items = [...products];
    if (sort === "price_asc") items.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    if (sort === "price_desc") items.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    return items;
  }, [products, sort]);

  const fetchPage = async ({ pageNumber, append }) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      const { data } = await api.get("/products", { params: { ...queryParams, pageNumber } });
      const incoming = data?.products || [];
      setPage(data?.page || pageNumber);
      setPages(data?.pages || 1);
      setProducts((prev) => append ? [...prev, ...incoming] : incoming);
    } catch {
      toast.error("Failed to load products");
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage({ pageNumber: 1, append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  useEffect(() => {
    setCategory(defaultCategory || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCategory]);

  useEffect(() => {
    if (title !== "Shop" || pathname !== "/shop") return;
    const urlCategory = searchParams?.get("category") || "";
    const urlFabric = searchParams?.get("fabric") || "";
    const urlKeyword = searchParams?.get("q") || "";

    setCategory(urlCategory);
    setFabric(urlFabric);
    if (urlKeyword) setKeyword(urlKeyword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, pathname, title]);

  const handleReset = () => {
    setKeyword(""); setCategory(defaultCategory); setFabric(""); setSort("new");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lora:ital,wght@0,400;1,400&display=swap');

        :root {
          --font-display: 'Cormorant Garamond', Georgia, serif;
          --font-label: 'Cormorant Garamond', Georgia, serif;
          --gold-1: #c9853c;
          --gold-2: #f0c97a;
          --gold-3: #ffe8b0;
          --maroon: #6b1a1a;
          --dark: #2a0505;
        }

        .tag-pill {
          font-family: var(--font-label);
          font-size: 0.58rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          border-radius: 999px;
          font-weight: 700;
          display: inline-block;
        }

        /* silk cross-hatch */
        .silk-bg {
          background-color: #fdf8f0;
          background-image:
            repeating-linear-gradient(-52deg, rgba(176,118,32,0.09) 0, rgba(176,118,32,0.09) 1px, transparent 1px, transparent 18px),
            repeating-linear-gradient(38deg, rgba(176,118,32,0.06) 0, rgba(176,118,32,0.06) 1px, transparent 1px, transparent 18px);
        }

        /* inset gold border on product cards */
        .gold-border-inset {
          pointer-events: none;
          position: absolute;
          inset: 0;
          border-radius: inherit;
          border: 1px solid rgba(201,133,60,0.18);
          transition: border-color .3s;
        }
        a:hover .gold-border-inset {
          border-color: rgba(201,133,60,0.42);
        }

        /* shimmer */
        .shimmer-gold {
          background: linear-gradient(110deg, var(--gold-1) 0%, var(--gold-3) 42%, var(--gold-1) 80%);
          background-size: 220%;
          animation: shimmer 3.4s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }

        /* search bar glow on focus */
        .search-input:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(201,133,60,0.28);
        }

        /* load more pulse */
        @keyframes goldpulse {
          0%,100% { box-shadow: 0 6px 24px rgba(107,26,26,0.3); }
          50%      { box-shadow: 0 6px 32px rgba(200,125,26,0.5); }
        }
        .load-more-btn { animation: goldpulse 2.4s ease-in-out infinite; }
      `}</style>

      <div className="silk-bg min-h-screen">

        {/* ── ambient glows ── */}
        <div className="fixed top-0 left-0 w-[340px] h-[340px] rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(201,133,60,0.10)", zIndex: 0 }} />
        <div className="fixed bottom-0 right-0 w-[300px] h-[300px] rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(107,26,26,0.08)", zIndex: 0 }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-20">

          {/* ══ PAGE HEADER ══ */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-8">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="h-px w-6 bg-[#6b1a1a]/40" />
              <span className="text-[0.65rem] uppercase tracking-[0.24em] font-bold text-[#6b1a1a]/55" style={{ fontFamily: "var(--font-label)" }}>
                Ruva Boutique
              </span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-[#2a0505]" style={{ fontFamily: "var(--font-display)" }}>
                {title === "Shop" ? (
                  <>Our <span className="italic shimmer-gold">Collection</span></>
                ) : title}
              </h1>
              {visibleProducts.length > 0 && (
                <p className="text-sm text-[#6b1a1a]/50 font-bold shrink-0" style={{ fontFamily: "var(--font-label)" }}>
                  {visibleProducts.length} pieces
                </p>
              )}
            </div>

            {title === "Shop" && (category || fabric) && pathname === "/shop" && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className="tag-pill px-3 py-1 bg-white/70 border border-[#c87d1a]/20 text-[#6b1a1a]"
                  style={{ boxShadow: "0 4px 20px rgba(42,5,5,0.06)" }}
                >
                  Browsing: {[category, fabric].filter(Boolean).join(" · ")}
                </span>
                <Link
                  href="/shop"
                  className="tag-pill px-3 py-1 bg-white/70 border border-[#c87d1a]/20 text-[#3d0a0a] hover:bg-white transition"
                >
                  Browse our entire collection →
                </Link>
              </div>
            )}
          </motion.div>

          {/* ══ STICKY SEARCH + CONTROLS BAR ══ */}
          <div className="sticky top-[64px] z-30 mb-5">
            <motion.div
              variants={fadeUp} custom={1} initial="hidden" animate="show"
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(253,248,240,0.88)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(201,133,60,0.22)",
                boxShadow: "0 8px 32px rgba(42,5,5,0.10)",
              }}
            >
              <div className="flex items-center gap-2.5 p-3">
                {/* search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b1a1a]/45" />
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search sarees, blouses…"
                    className="search-input w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/60 border border-[#c87d1a]/15 text-sm font-semibold text-[#2a0505] placeholder:text-[#6b1a1a]/35 transition-shadow"
                    style={{ fontFamily: "var(--font-display)" }}
                  />
                  {keyword && (
                    <button onClick={() => setKeyword("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X size={13} className="text-[#6b1a1a]/50" />
                    </button>
                  )}
                </div>

                {/* filter btn */}
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
                  style={{
                    fontFamily: "var(--font-label)",
                    background: activeFilters ? "linear-gradient(130deg,#6b1a1a,#a03030)" : "rgba(255,255,255,0.7)",
                    borderColor: activeFilters ? "transparent" : "rgba(201,133,60,0.22)",
                    color: activeFilters ? "#ffe8b0" : "#3d0a0a",
                    boxShadow: activeFilters ? "0 4px 14px rgba(107,26,26,0.28)" : "none",
                  }}
                >
                  <SlidersHorizontal size={14} />
                  <span className="hidden sm:inline">Filter</span>
                  {activeFilters > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#f0c97a] text-[#2a0505] text-[0.55rem] font-black flex items-center justify-center">
                      {activeFilters}
                    </span>
                  )}
                </button>

                {/* view toggle */}
                <div className="flex items-center rounded-xl border border-[#c87d1a]/18 overflow-hidden bg-white/60">
                  {[["list", List], ["grid", LayoutGrid]].map(([v, Icon]) => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className="px-2.5 py-2.5 transition-colors"
                      style={{
                        background: view === v ? "rgba(201,133,60,0.18)" : "transparent",
                        color: view === v ? "#6b1a1a" : "#6b1a1a60",
                      }}
                    >
                      <Icon size={15} />
                    </button>
                  ))}
                </div>
              </div>

              {/* active filter chips */}
              {(category || fabric) && (
                <div className="px-3 pb-3 flex flex-wrap gap-1.5">
                  {category && (
                    <span className="flex items-center gap-1 tag-pill px-2.5 py-1 bg-[#fdf3e3] border border-[#c87d1a]/20 text-[#6b1a1a]">
                      {category}
                      <button onClick={() => setCategory("")}><X size={9} /></button>
                    </span>
                  )}
                  {fabric && (
                    <span className="flex items-center gap-1 tag-pill px-2.5 py-1 bg-[#fdf3e3] border border-[#c87d1a]/20 text-[#6b1a1a]">
                      {fabric}
                      <button onClick={() => setFabric("")}><X size={9} /></button>
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* ══ PRODUCT GRID / LIST ══ */}
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4 text-[#6b1a1a]/60">
              <Loader2 className="w-7 h-7 animate-spin" style={{ color: "var(--gold-1)" }} />
              <span className="text-xs font-bold uppercase tracking-[0.22em]" style={{ fontFamily: "var(--font-label)" }}>
                Curating for you…
              </span>
            </div>
          ) : visibleProducts.length === 0 ? (
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="py-20 text-center">
              <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white/70 border border-[#c87d1a]/18 text-[#3d0a0a] mb-3"
                style={{ boxShadow: "0 4px 20px rgba(42,5,5,0.07)" }}>
                <Sparkles size={15} className="text-[#c87d1a]" />
                <span className="font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>No pieces found</span>
              </div>
              <p className="text-sm text-[#5a2a1a]/60" style={{ fontFamily: "var(--font-display)" }}>
                Try adjusting your filters or search term.
              </p>
            </motion.div>
          ) : (
            <>
              {/* List view (default on mobile) */}
              <AnimatePresence mode="wait">
                {view === "list" ? (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col gap-3"
                  >
                    {visibleProducts.map((p, i) => (
                      <ListRow key={p._id} product={p} index={i} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                  >
                    {visibleProducts.map((p, i) => (
                      <GridCard key={p._id} product={p} index={i} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Load more */}
              <div className="mt-12 flex justify-center">
                {page < pages ? (
                  <button
                    onClick={() => fetchPage({ pageNumber: page + 1, append: true })}
                    disabled={loadingMore}
                    className="load-more-btn flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] text-[#ffe8b0] disabled:opacity-60"
                    style={{
                      fontFamily: "var(--font-label)",
                      background: "linear-gradient(130deg,#6b1a1a,#a03030)",
                    }}
                  >
                    {loadingMore ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={13} />}
                    {loadingMore ? "Loading…" : "Load More"}
                  </button>
                ) : visibleProducts.length > 0 ? (
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#6b1a1a]/40" style={{ fontFamily: "var(--font-label)" }}>
                    — End of Collection —
                  </p>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══ MOBILE FILTER BOTTOM SHEET ══ */}
      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        category={category} setCategory={setCategory}
        fabric={fabric} setFabric={setFabric}
        sort={sort} setSort={setSort}
        defaultCategory={defaultCategory}
        onReset={handleReset}
      />
    </>
  );
}

export default function ProductListPage(props) {
  return (
    <Suspense fallback={
      <div className="silk-bg min-h-screen py-20 flex flex-col items-center justify-center gap-4 text-[#6b1a1a]/60">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9853c]" />
        <span className="text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
          Loading Collection...
        </span>
      </div>
    }>
      <ProductListContent {...props} />
    </Suspense>
  );
}