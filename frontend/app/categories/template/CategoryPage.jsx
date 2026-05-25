"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, SlidersHorizontal, X, ShoppingBag, Clock, Loader2 } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import api from "@/utils/api";

/* ─── Design tokens ─────────────────────────────────────── */
const D = {
  display: { fontFamily: "'Cormorant Garamond', Georgia, serif" },
  label: { fontFamily: "'Cormorant Garamond', Georgia, serif", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.68rem", fontWeight: 700 },
  body: { fontFamily: "'Lora', Georgia, serif" },
};

const fadeUp = (i = 0) => ({
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.72, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] } },
});

/* ─── Countdown ──────────────────────────────────────────── */
function Countdown() {
  const [t, setT] = useState({ h: 11, m: 42, s: 7 });
  useEffect(() => {
    const id = setInterval(() => setT(p => {
      let { h, m, s } = p; s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 23; m = 59; s = 59; }
      return { h, m, s };
    }), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = n => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-2">
      {[pad(t.h), pad(t.m), pad(t.s)].map((v, i) => (
        <React.Fragment key={i}>
          <div className="text-center">
            <motion.div key={v} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="font-bold text-[#ffe8b0] tabular-nums" style={{ ...D.display, fontSize: "clamp(1.1rem,4vw,1.6rem)" }}>
              {v}
            </motion.div>
            <div style={{ ...D.label, fontSize: "0.4rem", color: "rgba(240,201,122,0.55)" }}>
              {["hrs", "min", "sec"][i]}
            </div>
          </div>
          {i < 2 && <span className="font-bold text-[#f0c97a]/40 mb-3" style={D.display}>:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── Gold border card ───────────────────────────────────── */
function GoldCard({ children, className = "", style = {} }) {
  const ref = useRef(null);
  const track = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return <div ref={ref} onMouseMove={track} className={`cp-gold ${className}`} style={style}>{children}</div>;
}

/* ─── Filter drawer ──────────────────────────────────────── */
function FilterDrawer({ open, onClose, filters, active, onToggle }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl overflow-hidden"
            style={{ background: "#fdf6ec", maxHeight: "80vh" }}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#e8d9c0]">
              <h3 style={{ ...D.display, fontSize: "1.25rem", color: "#2a0505", fontWeight: 700 }}>Filter & Sort</h3>
              <button onClick={onClose} className="p-1.5 rounded-full" style={{ background: "rgba(107,26,26,0.08)" }}>
                <X size={16} color="#6b1a1a" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4 space-y-5" style={{ maxHeight: "calc(80vh - 64px)" }}>
              {filters.map(group => (
                <div key={group.label}>
                  <p style={{ ...D.label, color: "#6b1a1a", marginBottom: "10px" }}>{group.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map(opt => {
                      const isOn = active[group.key]?.includes(opt);
                      return (
                        <button key={opt} onClick={() => onToggle(group.key, opt)}
                          className="px-3 py-1.5 rounded-full text-sm transition-all"
                          style={{
                            fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 600, fontSize: "0.78rem",
                            border: isOn ? "1px solid #c9853c" : "1px solid rgba(107,26,26,0.2)",
                            background: isOn ? "rgba(201,133,60,0.12)" : "transparent",
                            color: isOn ? "#8a4a10" : "#5a2a1a",
                          }}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 pb-6 pt-3">
              <button onClick={onClose} className="w-full py-3 rounded-full font-bold"
                style={{ ...D.label, background: "linear-gradient(130deg,#6b1a1a,#9a2828)", color: "#ffe8b0", border: "none", cursor: "pointer" }}>
                Show Results
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Skeleton card ──────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="bg-gray-100" style={{ aspectRatio: "3/4" }} />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto" />
        <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
        <div className="h-4 bg-gray-100 rounded w-1/3 mx-auto" />
      </div>
    </div>
  );
}

/* ─── Product card ───────────────────────────────────────── */
function ProductCard({ product, index, onAdd }) {
  const [hov, setHov] = useState(false);
  const price = product.discountPrice > 0
    ? `₹${Number(product.discountPrice).toLocaleString("en-IN")}`
    : `₹${Number(product.price).toLocaleString("en-IN")}`;

  const tag = product.isBestseller ? "Bestseller"
    : product.isTrending ? "Trending"
    : product.tags?.includes("new") ? "New"
    : product.tags?.includes("limited") ? "Limited"
    : null;

  return (
    <motion.div variants={fadeUp(index % 6)} initial="hidden" whileInView="show"
      viewport={{ once: true, margin: "-20px" }}
      onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
      className="flex flex-col">
      <GoldCard className="rounded-xl overflow-hidden flex flex-col flex-1" style={{ background: "#fff" }}>
        <Link href={`/products/${product._id}`} className="block shrink-0">
          <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
            <motion.img
              src={product.images?.[0]?.url || "https://via.placeholder.com/300x400"}
              alt={product.name}
              className="w-full h-full object-cover"
              animate={{ scale: hov ? 1.06 : 1 }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,1,1,0.45) 0%, transparent 55%)" }} />
            {tag && (
              <span className="cp-tag-pill absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full"
                style={{ background: "rgba(8,1,1,0.52)", backdropFilter: "blur(6px)", border: "1px solid rgba(240,201,122,0.38)", color: "#f0c97a" }}>
                {tag}
              </span>
            )}
            <motion.div className="absolute inset-x-0 bottom-0 flex justify-center pb-3"
              animate={{ opacity: hov ? 1 : 0, y: hov ? 0 : 8 }} transition={{ duration: 0.22 }}>
              <span className="cp-tag-pill px-3 py-1 rounded-full"
                style={{ background: "rgba(255,245,220,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(240,201,122,0.4)", color: "#ffe8b0" }}>
                View Details
              </span>
            </motion.div>
          </div>
        </Link>
        <div className="flex flex-col flex-1 px-3 py-3 sm:px-4 sm:py-3.5 text-center">
          <h3 className="font-bold text-[#3d0a0a] leading-snug flex-1"
            style={{ ...D.display, fontSize: "clamp(0.85rem, 2vw, 1rem)" }}>
            {product.name}
          </h3>
          {product.category && (
            <p className="mt-0.5 mb-2 line-clamp-1 text-[#5a2a1a]/45"
              style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {product.fabric || product.category}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto pt-2">
            <span className="font-bold" style={{ ...D.display, color: "#6b1a1a", fontSize: "clamp(0.88rem, 2vw, 1.05rem)" }}>
              {price}
            </span>
            <motion.button type="button" onClick={() => onAdd(product)} whileTap={{ scale: 0.88 }}
              className="flex items-center gap-1 rounded-full font-bold cursor-pointer"
              style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif", letterSpacing: "0.13em", textTransform: "uppercase",
                background: "linear-gradient(130deg,#6b1a1a,#9a2828)", color: "#ffe8b0", border: "none",
                fontSize: "clamp(0.54rem, 1.3vw, 0.64rem)", padding: "clamp(4px,1vw,6px) clamp(8px,2vw,12px)",
              }}>
              <ShoppingBag size={9} /> Add
            </motion.button>
          </div>
        </div>
      </GoldCard>
    </motion.div>
  );
}

/* ─── Hero banner ────────────────────────────────────────── */
function Hero({ config }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);

  return (
    <div ref={ref} className="relative overflow-hidden" style={{ height: "clamp(280px, 52vw, 480px)" }}>
      <motion.div className="absolute inset-0" style={{ y: imgY }}>
        <img src={config.heroImg} alt={config.title} className="w-full h-full object-cover"
          style={{ objectPosition: config.heroFocus || "center 35%", transform: "scale(1.15)", transformOrigin: "center" }} />
      </motion.div>
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, rgba(8,1,1,0.82) 0%, rgba(8,1,1,0.42) 52%, rgba(8,1,1,0.18) 100%)" }} />
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-1.5">
        <Link href="/" className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
          style={{ ...D.label, color: "#f0c97a", fontSize: "0.58rem" }}>
          <ArrowLeft size={10} /> Home
        </Link>
        <span style={{ ...D.label, color: "rgba(240,201,122,0.35)", fontSize: "0.58rem" }}>/</span>
        <span style={{ ...D.label, color: "rgba(240,201,122,0.7)", fontSize: "0.58rem" }}>{config.title}</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-9">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }}>
          <p style={{ ...D.label, color: "rgba(240,201,122,0.7)", fontSize: "0.62rem", marginBottom: "6px" }}>{config.sub}</p>
          <h1 className="font-bold text-[#fff5dd] leading-none" style={{ ...D.display, fontSize: "clamp(2rem, 7vw, 3.8rem)" }}>
            {config.title}
          </h1>
          <p className="mt-2 max-w-sm opacity-75" style={{ ...D.body, color: "#fdf6ec", fontSize: "clamp(0.78rem, 2vw, 0.9rem)", lineHeight: 1.65 }}>
            {config.desc}
          </p>
          {config.isLimited && (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1.5 opacity-75" style={{ ...D.label, color: "#f0c97a", fontSize: "0.58rem" }}>
                <Clock size={10} /> Offer ends in
              </div>
              <Countdown />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Main CategoryPage ───────────────────────────────────── */
export default function CategoryPage({ config }) {
  const sentinelRef = useRef(null);
  const { addToCart } = useCart();
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [sort, setSort] = useState("featured");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 12;

  const fetchProducts = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ pageSize: PAGE_SIZE, pageNumber: pageNum });

      // Category mapping
      if (config.isLimited) {
        params.set("isFeatured", "true");
      } else {
        params.set("category", config.categoryKey || config.title);
      }

      // Active filter mapping
      if (activeFilters.fabric?.length) params.set("fabric", activeFilters.fabric[0]);
      if (activeFilters.isBestseller?.length) params.set("isBestseller", "true");
      if (activeFilters.isTrending?.length) params.set("isTrending", "true");

      const { data } = await api.get(`/products?${params}`);
      const fetched = data.products || [];

      setProducts(prev => append ? [...prev, ...fetched] : fetched);
      setHasMore(pageNum < (data.pages || 1));
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [config.categoryKey, config.title, config.isLimited, activeFilters]);

  // Reset and refetch when filters change
  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [activeFilters, config.categoryKey]);

  useEffect(() => {
  if (!sentinelRef.current) return;
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore();
      }
    },
    { rootMargin: "200px" }
  );
  observer.observe(sentinelRef.current);
  return () => observer.disconnect();
}, [hasMore, loading, page]);


  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  const toggleFilter = (key, val) => {
    setActiveFilters(prev => {
      const arr = prev[key] || [];
      return { ...prev, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
    });
  };

  const clearFilters = () => setActiveFilters({});
  const activeCount = Object.values(activeFilters).flat().length;

  // Client-side sort only (backend already handles featured default)
  const sorted = [...products].sort((a, b) => {
    if (sort === "price-asc") return (a.discountPrice || a.price) - (b.discountPrice || b.price);
    if (sort === "price-desc") return (b.discountPrice || b.price) - (a.discountPrice || a.price);
    return 0;
  });

  const handleAdd = (product) => {
    addToCart({
      _id: product._id,
      name: product.name,
      image: product.images?.[0]?.url,
      price: product.discountPrice || product.price,
    }, 1, "Free Size");
    toast.success("Added to cart");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lora:ital,wght@0,400;1,400&display=swap');
        :root{--gold-1:#c9853c;--gold-2:#f0c97a;--gold-3:#ffe8b0;--maroon:#6b1a1a;--cream:#fdf6ec;}
        .shimmer-gold{background:linear-gradient(110deg,var(--gold-1) 0%,var(--gold-3) 42%,var(--gold-1) 80%);background-size:220%;animation:sg 3.4s linear infinite;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        @keyframes sg{0%{background-position:200% center}100%{background-position:-200% center}}
        .cp-gold{position:relative;isolation:isolate;}
        .cp-gold::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;background:radial-gradient(240px circle at var(--mx,50%) var(--my,50%),rgba(255,232,176,0.88),rgba(201,133,60,0.3) 40%,transparent 65%),linear-gradient(135deg,rgba(201,133,60,0.38),rgba(255,232,176,0.7) 50%,rgba(201,133,60,0.35));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;z-index:30;transition:opacity 0.3s;opacity:0.65;}
        .cp-gold:hover::before{opacity:1;}
        .cp-tag-pill{font-family:'Cormorant Garamond',Georgia,serif;font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;font-weight:700;}
        .cp-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;align-items:stretch;}
        @media(min-width:640px){.cp-grid{grid-template-columns:repeat(3,1fr);gap:14px;}}
        @media(min-width:1024px){.cp-grid{grid-template-columns:repeat(4,1fr);gap:16px;}}
        .cp-sort select{appearance:none;background:transparent;border:none;outline:none;cursor:pointer;font-family:'Cormorant Garamond',Georgia,serif;font-weight:700;font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:#6b1a1a;}
        .cp-silk{background-image:repeating-linear-gradient(-52deg,rgba(176,118,32,0.07) 0px,rgba(176,118,32,0.07) 1px,transparent 1px,transparent 22px),repeating-linear-gradient(38deg,rgba(176,118,32,0.05) 0px,rgba(176,118,32,0.05) 1px,transparent 1px,transparent 22px);}
      `}</style>

      <div style={{ background: "linear-gradient(180deg,#fdf8f0 0%,#fffaf3 100%)", minHeight: "100vh" }}>
        <Hero config={config} />

        {/* Sticky toolbar */}
        <div className="sticky top-0 z-30 cp-silk"
          style={{ background: "rgba(253,246,236,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(201,133,60,0.18)" }}>
          <div className="max-w-6xl mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">
            <button onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full transition-all active:scale-95"
              style={{ border: "1px solid rgba(107,26,26,0.22)", background: activeCount ? "rgba(201,133,60,0.1)" : "transparent" }}>
              <SlidersHorizontal size={13} color="#6b1a1a" />
              <span style={{ ...D.label, color: "#6b1a1a", fontSize: "0.62rem" }}>
                Filter {activeCount > 0 && `(${activeCount})`}
              </span>
            </button>

            <div className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              {Object.entries(activeFilters).flatMap(([k, vals]) =>
                vals.map(v => (
                  <button key={`${k}-${v}`} onClick={() => toggleFilter(k, v)}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(201,133,60,0.12)", border: "1px solid rgba(201,133,60,0.35)" }}>
                    <span style={{ ...D.label, color: "#8a4a10", fontSize: "0.55rem" }}>{v}</span>
                    <X size={8} color="#8a4a10" />
                  </button>
                ))
              )}
              {activeCount > 0 && (
                <button onClick={clearFilters} style={{ ...D.label, color: "rgba(107,26,26,0.5)", fontSize: "0.55rem", whiteSpace: "nowrap" }}>
                  Clear all
                </button>
              )}
            </div>

            <div className="cp-sort shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full"
              style={{ border: "1px solid rgba(107,26,26,0.18)" }}>
              <select value={sort} onChange={e => setSort(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
              </select>
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="max-w-6xl mx-auto px-3 sm:px-5 pt-5 pb-2">
          <p style={{ ...D.label, color: "rgba(107,26,26,0.45)", fontSize: "0.6rem" }}>
            {loading && products.length === 0 ? "Loading..." : `${products.length} items`}
          </p>
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto px-3 sm:px-5 pb-16">
          <div className="cp-grid">
            {loading && products.length === 0
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : sorted.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} onAdd={handleAdd} />
                ))}
          </div>

          {/* Load more */}
          {!loading && hasMore && sorted.length > 0 && (
            <div ref={sentinelRef} className="flex justify-center mt-10 h-10">
  {loading && products.length > 0 && (
    <Loader2 size={22} className="animate-spin" style={{ color: "#c9853c" }} />
  )}
</div>
          )}

          {loading && products.length > 0 && (
            <div className="flex justify-center mt-8">
              <Loader2 size={24} className="animate-spin" style={{ color: "#c9853c" }} />
            </div>
          )}

          {!loading && sorted.length === 0 && (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(201,133,60,0.1)" }}>
                <ShoppingBag size={22} color="#c9853c" />
              </div>
              <h3 style={{ ...D.display, fontSize: "1.4rem", color: "#2a0505", fontWeight: 700 }}>No items found</h3>
              <p className="mt-1.5" style={{ ...D.body, color: "rgba(90,42,26,0.55)", fontSize: "0.85rem" }}>Try adjusting your filters</p>
              <button onClick={clearFilters} className="mt-4 px-5 py-2 rounded-full"
                style={{ ...D.label, background: "linear-gradient(130deg,#6b1a1a,#9a2828)", color: "#ffe8b0", border: "none", cursor: "pointer" }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>

        <FilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)}
          filters={config.filters || []} active={activeFilters} onToggle={toggleFilter} />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   CATEGORY CONFIGS — only UI/hero metadata, no product data
══════════════════════════════════════════════════════════ */

export const SAREES_CONFIG = {
  title: "Sarees",
  categoryKey: "Sarees",
  sub: "Heritage Silk & Zari",
  desc: "Handpicked from the finest looms of India - each saree a story woven in silk, zari, and tradition.",
  heroImg: "/sarees/mainbg.jpg",
  heroFocus: "center 30%",
  filters: [
    { label: "Fabric", key: "fabric", options: ["Silk", "Cotton", "Modal", "Chanderi", "Banarasi"] },
    { label: "Occasion", key: "occasion", options: ["Festive", "Wedding", "Casual", "Party"] },
    { label: "Price Range", key: "price", options: ["Under ₹10,000", "₹10,000-₹15,000", "Above ₹15,000"] },
  ],
};

export const BLOUSES_CONFIG = {
  title: "Blouses",
  categoryKey: "Blouses",
  sub: "Ready-to-Wear Elegance",
  desc: "Perfectly crafted to complement your saree - from bridal zardosi to minimalist silk readymades.",
  heroImg: "/blouses/b2.jpeg",
  heroFocus: "center 25%",
  filters: [
    { label: "Style", key: "style", options: ["Sleeveless", "Full Sleeve", "Puff Sleeve", "Halter", "Backless"] },
    { label: "Occasion", key: "occasion", options: ["Bridal", "Festive", "Casual"] },
    { label: "Price Range", key: "price", options: ["Under ₹2,000", "₹2,000–₹3,500", "Above ₹3,500"] },
  ],
};

export const SILVER_CONFIG = {
  title: "Silver Jewelry",
  categoryKey: "Silver Jewelry",
  sub: "Artisan Silvercraft",
  desc: "Each piece shaped by master karigars - oxidised, filigree, and temple jewellery rooted in centuries of craft.",
  heroImg: "/silver-jewelries/mainbg.webp",
  heroFocus: "center 40%",
  filters: [
    { label: "Type", key: "type", options: ["Necklace", "Earrings", "Bangles", "Anklets", "Maang Tikka"] },
    { label: "Finish", key: "finish", options: ["Oxidised", "Polish", "Filigree", "Temple"] },
    { label: "Price Range", key: "price", options: ["Under ₹1,000", "₹1,000-₹2,500", "Above ₹2,500"] },
  ],
};

export const CRYSTAL_CONFIG = {
  title: "Crystal Bracelets",
  categoryKey: "Crystal Bracelets",
  sub: "Healing Gems & Energy",
  desc: "Ethically sourced crystals, each carrying ancient energies - wear intention, wear beauty.",
  heroImg: "/crystal-bracelets/mainbg.webp",
  heroFocus: "center 50%",
  filters: [
    { label: "Crystal", key: "crystal", options: ["Rose Quartz", "Amethyst", "Black Tourmaline", "Citrine", "Lapis"] },
    { label: "Intent", key: "intent", options: ["Love", "Protection", "Clarity", "Abundance", "Healing"] },
    { label: "Price Range", key: "price", options: ["Under ₹900", "₹900-₹1,200", "Above ₹1,200"] },
  ],
};

export const SHAWLS_CONFIG = {
  title: "Shawls",
  categoryKey: "Shawls",
  sub: "Kashmiri Pashmina & More",
  desc: "From needle-worked Sozni to richly woven Kani - warmth that carries the soul of Kashmir.",
  heroImg: "/shawls/mainbg.avif",
  heroFocus: "center 40%",
  filters: [
    { label: "Type", key: "type", options: ["Pashmina", "Kani", "Jamawar", "Sozni", "Stole"] },
    { label: "Material", key: "material", options: ["Pure Wool", "Silk Blend", "Merino"] },
    { label: "Price Range", key: "price", options: ["Under ₹6,000", "₹6,000–₹10,000", "Above ₹10,000"] },
  ],
};

export const LIMITED_CONFIG = {
  title: "Limited Offers",
  categoryKey: null,
  isLimited: true,
  sub: "Exclusive & Time-Bound",
  desc: "Once they're gone, they're gone - curated bundles and flash deals on our finest pieces.",
  heroImg: "/limited-time/lt.jpg",
  heroFocus: "center 30%",
  filters: [
    { label: "Category", key: "category", options: ["Sarees", "Blouses", "Jewelry", "Shawls", "Crystals"] },
    { label: "Deal Type", key: "deal", options: ["Flash Sale", "Bundle", "48 hr Deal"] },
    { label: "Price Range", key: "price", options: ["Under ₹5,000", "₹5,000–₹15,000", "Above ₹15,000"] },
  ],
};