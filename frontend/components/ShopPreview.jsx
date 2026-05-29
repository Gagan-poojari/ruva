"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import toast from "react-hot-toast";

import { useCart } from "@/context/CartContext";
import api from "@/utils/api";

/* ─── design tokens (matches rest of site) ─── */
const F = {
  display: "'Cormorant Garamond', Georgia, serif",
  label:   "'Cormorant Garamond', Georgia, serif",
  body:    "'Lora', Georgia, serif",
};

/* ─── tag config ─── */
const getTag = (p) => {
  const tags = Array.isArray(p?.tags) ? p.tags.map(t => String(t).toLowerCase()) : [];
  if (p?.isBestseller)         return "Bestseller";
  if (p?.isTrending)           return "Trending";
  if (tags.includes("limited")) return "Limited";
  if (tags.includes("new"))    return "New";
  return "New";
};

const TAG_PALETTE = {
  Bestseller: { border: "rgba(240,201,122,0.5)", color: "#f0c97a"  },
  Trending:   { border: "rgba(196,181,240,0.5)", color: "#c4b5f0"  },
  Limited:    { border: "rgba(255,204,160,0.5)", color: "#ffcca0"  },
  New:        { border: "rgba(160,255,204,0.5)", color: "#a0ffd0"  },
};

const formatINR = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

/* ─── gold border card (mouse-tracked radial, matches Categories / Bestsellers) ─── */
function GoldCard({ children, className = "", style = {}, onClick }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onMouseMove={onMove} onClick={onClick}
      className={`sp2-gold ${className}`} style={style}>
      {children}
    </div>
  );
}

/* ─── 3-D tilt on desktop, flat on mobile ─── */
function TiltCard({ children, style = {}, className = "", onClick }) {
  const ref  = useRef(null);
  const mx   = useMotionValue(0);
  const my   = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [ 5,-5]), { stiffness:220, damping:24 });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness:220, damping:24 });
  const sc   = useSpring(1, { stiffness:220, damping:22 });

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <motion.div ref={ref} onClick={onClick}
      onMouseMove={(e) => {
        if (isMobile) return;
        const r = ref.current.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width  - 0.5);
        my.set((e.clientY - r.top)  / r.height - 0.5);
      }}
      onMouseEnter={() => { if (!isMobile) sc.set(1.03); }}
      onMouseLeave={() => { mx.set(0); my.set(0); sc.set(1); }}
      style={{ rotateX:rotX, rotateY:rotY, scale:sc, transformStyle:"preserve-3d", ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Product card ─── */
function ProductCard({ p, index, onAdd }) {
  const [hovered, setHovered] = useState(false);
  const tag  = getTag(p);
  const ts   = TAG_PALETTE[tag] || TAG_PALETTE.New;
  const href = `/products/${p._id}`;
  const img  = p.images?.[0]?.url || "/sarees/placeholder.jpg";
  const price = formatINR(p.discountPrice || p.price);
  const wasPrice = p.discountPrice && p.discountPrice < p.price ? formatINR(p.price) : null;

  return (
    <motion.div
      initial={{ opacity:0, y:32 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, margin:"-20px" }}
      transition={{ duration:0.68, delay: Math.min(index,5)*0.08, ease:[0.22,1,0.36,1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="sp2-card-wrap"
    >
      <TiltCard style={{ height:"100%", borderRadius:16, overflow:"hidden" }}>
        <GoldCard className="rounded-2xl overflow-hidden flex flex-col h-full"
          style={{ background:"#fff" }}>

          {/* ── image ── */}
          <Link href={href} className="block shrink-0">
            <div className="relative overflow-hidden" style={{ aspectRatio:"3/4" }}>
              <motion.img
                src={img} alt={p.name}
                className="w-full h-full object-cover"
                animate={{ scale: hovered ? 1.06 : 1 }}
                transition={{ duration:1.0, ease:[0.22,1,0.36,1] }}
              />

              {/* gradient */}
              <div className="absolute inset-0"
                style={{ background:"linear-gradient(to top,rgba(8,1,1,0.55) 0%,transparent 52%)" }} />

              {/* tag */}
              <span className="sp2-pill absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full"
                style={{ background:"rgba(8,1,1,0.58)", backdropFilter:"blur(6px)",
                  border:`1px solid ${ts.border}`, color:ts.color }}>
                {tag}
              </span>

              {/* hover CTA - slides up from bottom */}
              <motion.div
                className="absolute inset-x-0 bottom-0 flex justify-center pb-3"
                animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
                transition={{ duration:0.22 }}
              >
                <span className="sp2-pill px-3 py-1 rounded-full"
                  style={{ background:"rgba(255,245,220,0.12)", backdropFilter:"blur(10px)",
                    border:"1px solid rgba(240,201,122,0.42)", color:"#ffe8b0" }}>
                  View Piece
                </span>
              </motion.div>
            </div>
          </Link>

          {/* ── info ── */}
          <div className="flex flex-col flex-1 px-3 py-3 text-center">
            <h3 className="font-bold text-[#2a0505] leading-snug flex-1 line-clamp-2 mb-1"
              style={{ fontFamily:F.display, fontSize:"clamp(0.82rem,2.2vw,1rem)" }}>
              {p.name}
            </h3>
            <p className="mb-2.5 text-[#5a2a1a]/48 line-clamp-1"
              style={{ fontFamily:F.label, fontSize:"0.56rem", letterSpacing:"0.14em", textTransform:"uppercase" }}>
              {p.category}{p.fabric ? ` · ${p.fabric}` : ""}
            </p>

            {/* price + add */}
            <div className="flex items-center justify-between mt-auto gap-1">
              <div className="text-left">
                <span className="sp2-num font-bold text-[#6b1a1a]"
                  style={{ fontSize:"clamp(0.9rem,2.4vw,1.05rem)" }}>
                  {price}
                </span>
                {wasPrice && (
                  <span className="sp2-num block text-[#6b1a1a]/38 line-through"
                    style={{ fontSize:"0.58rem" }}>
                    {wasPrice}
                  </span>
                )}
              </div>
              <motion.button
                type="button"
                onClick={(e) => { e.preventDefault(); onAdd(); }}
                whileTap={{ scale:0.88 }}
                className="flex items-center gap-1 rounded-full font-bold cursor-pointer shrink-0"
                style={{
                  fontFamily:F.label, letterSpacing:"0.12em", textTransform:"uppercase",
                  background:"linear-gradient(130deg,#6b1a1a,#9a2828)",
                  color:"#ffe8b0", border:"none",
                  fontSize:"clamp(0.52rem,1.3vw,0.62rem)",
                  padding:"clamp(5px,1.2vw,7px) clamp(9px,2vw,14px)",
                  boxShadow:"0 3px 10px rgba(107,26,26,0.3)",
                }}
              >
                <ShoppingBag size={10} /> Add
              </motion.button>
            </div>
          </div>
        </GoldCard>
      </TiltCard>
    </motion.div>
  );
}

/* ─── View All end-card ─── */
function ViewAllCard() {
  return (
    <motion.div
      initial={{ opacity:0, x:24 }}
      whileInView={{ opacity:1, x:0 }}
      viewport={{ once:true }}
      transition={{ duration:0.62, ease:[0.22,1,0.36,1] }}
      className="sp2-card-wrap shrink-0"
    >
      <Link href="/shop" className="block h-full">
        <div className="h-full rounded-2xl flex flex-col items-center justify-center p-5 text-center group"
          style={{
            background:"radial-gradient(circle at 40% 35%,rgba(255,250,243,0.96),rgba(253,243,228,0.55))",
            border:"1px solid rgba(201,133,60,0.18)",
            boxShadow:"0 8px 28px rgba(107,26,26,0.07), inset 0 0 0 1px rgba(201,133,60,0.1)",
            minHeight:220,
          }}
        >
          {/* rotating halo */}
          <div className="relative mb-5">
            <motion.div
              animate={{ rotate:360 }}
              transition={{ duration:12, repeat:Infinity, ease:"linear" }}
              style={{
                position:"absolute", inset:-10, borderRadius:"50%",
                background:"conic-gradient(from 0deg, transparent 70%, rgba(201,133,60,0.35) 100%)",
              }}
            />
            <div className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background:"#fff",
                border:"1px solid rgba(201,133,60,0.28)",
                boxShadow:"0 4px 16px rgba(107,26,26,0.1)",
              }}
            >
              <motion.div
                animate={{ x:[0,3,0] }}
                transition={{ duration:1.8, repeat:Infinity, ease:"easeInOut" }}
              >
                <ArrowRight size={22} color="#6b1a1a" />
              </motion.div>
            </div>
          </div>

          <h3 className="font-bold text-[#2a0505] mb-2"
            style={{ fontFamily:F.display, fontSize:"clamp(1rem,3vw,1.2rem)" }}>
            Explore More
          </h3>
          <p style={{ fontFamily:F.body, fontSize:"0.75rem", color:"rgba(90,42,26,0.58)", lineHeight:1.6, maxWidth:160 }}>
            Discover our full collection of exquisite sarees, blouses &amp; jewellery.
          </p>
          <div className="mt-4 flex items-center gap-1.5"
            style={{ fontFamily:F.label, fontSize:"0.58rem", letterSpacing:"0.18em",
              textTransform:"uppercase", color:"#6b1a1a", fontWeight:700,
              borderBottom:"1px solid rgba(107,26,26,0.22)", paddingBottom:2 }}>
            Enter the Shop <ArrowRight size={9} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Skeleton card ─── */
function SkeletonCard() {
  return (
    <div className="sp2-card-wrap shrink-0">
      <div className="rounded-2xl overflow-hidden sp2-skeleton" style={{ aspectRatio:"3/4" }} />
      <div className="mt-2 px-1 space-y-1.5">
        <div className="sp2-skeleton rounded" style={{ height:12, width:"70%" }} />
        <div className="sp2-skeleton rounded" style={{ height:10, width:"45%" }} />
      </div>
    </div>
  );
}

/* ─── scroll arrow button ─── */
function Arrow({ dir, onClick, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key={dir}
          initial={{ opacity:0, x: dir === -1 ? -8 : 8 }}
          animate={{ opacity:1, x:0 }}
          exit={{ opacity:0, x: dir === -1 ? -8 : 8 }}
          whileHover={{ scale:1.1 }}
          whileTap={{ scale:0.9 }}
          onClick={onClick}
          className="sp2-arrow"
          style={{ [dir === -1 ? "left" : "right"]: 8 }}
          aria-label={dir === -1 ? "Scroll left" : "Scroll right"}
        >
          {dir === -1
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          }
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function ShopPreview() {
  const { addToCart }  = useCart();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);
  const [dotIdx, setDotIdx] = useState(0);
  const scrollRef = useRef(null);

  /* fetch */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/products", { params:{ pageSize:10 } });
        setProducts(data.products || []);
      } catch (e) {
        console.error("ShopPreview fetch failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* scroll tracking */
  const onScroll = useCallback(() => {
    const el = scrollRef.current; if (!el) return;
    setCanL(el.scrollLeft > 12);
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 12);
    const cardW = el.scrollWidth / (products.length + 1 || 1);
    setDotIdx(Math.round(el.scrollLeft / cardW));
  }, [products.length]);

  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    el.addEventListener("scroll", onScroll, { passive:true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll, products.length]);

  const scrollBy = (dir) => scrollRef.current?.scrollBy({ left: dir * 240, behavior:"smooth" });

  const handleAdd = (p) => {
    addToCart({
      _id: p._id, name: p.name, category: p.category,
      image: p.images?.[0]?.url,
      price: p.discountPrice || p.price,
    }, 1, p.category === "Blouses" ? "32" : "Free Size");
    toast.success(`${p.name} added!`, {
      style: { fontFamily:F.display, fontSize:"0.9rem", background:"#fffaf3", color:"#3d0a0a", border:"1px solid rgba(201,133,60,0.3)" },
      icon: "🛍️",
    });
  };

  const totalDots = products.length + 1; // +1 for view-all card

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lora:ital,wght@0,400;1,400&display=swap');

        /* gold border - same spec as Categories & Bestsellers */
        .sp2-gold { position:relative; isolation:isolate; }
        .sp2-gold::before {
          content:"";
          position:absolute; inset:0;
          border-radius:inherit;
          padding:1px;
          background:
            radial-gradient(240px circle at var(--mx,50%) var(--my,50%),
              rgba(255,232,176,0.9), rgba(201,133,60,0.32) 40%, transparent 66%),
            linear-gradient(135deg,rgba(201,133,60,0.38),rgba(255,232,176,0.72) 50%,rgba(201,133,60,0.36));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events:none; z-index:30;
          opacity:0.7; transition:opacity .3s;
        }
        .sp2-gold:hover::before { opacity:1; }

        /* pill label */
        .sp2-pill {
          font-family:'Cormorant Garamond',Georgia,serif;
          font-size:0.58rem; letter-spacing:0.15em;
          text-transform:uppercase; font-weight:700;
        }

        /* card slot - mobile: 72vw wide; desktop: flex item */
        .sp2-card-wrap {
          width:72vw; max-width:260px;
          flex-shrink:0;
          scroll-snap-align:start;
        }
        @media (min-width:640px) {
          .sp2-card-wrap { width:220px; }
        }
        @media (min-width:1024px) {
          .sp2-card-wrap { width:240px; }
        }

        /* scroll track */
        .sp2-track {
          display:flex; gap:14px;
          overflow-x:auto;
          scroll-snap-type:x mandatory;
          -webkit-overflow-scrolling:touch;
          scrollbar-width:none;
          padding:8px 20px 20px;
        }
        @media (min-width:640px) {
          .sp2-track { padding:10px 56px 24px; gap:16px; }
        }
        .sp2-track::-webkit-scrollbar { display:none; }

        /* scroll arrows */
        .sp2-arrow {
          position:absolute; top:42%; transform:translateY(-50%); z-index:10;
          width:38px; height:38px; border-radius:50%;
          background:rgba(255,255,255,0.9);
          border:1px solid rgba(201,133,60,0.28);
          color:#7a3a10;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer;
          box-shadow:0 4px 16px rgba(107,26,26,0.14);
          display:none;
        }
        @media (min-width:640px) { .sp2-arrow { display:flex; } }

        /* edge fade - narrow so cards aren't blocked */
        .sp2-fade-l {
          position:absolute; left:0; top:0; bottom:0; width:20px;
          background:linear-gradient(to right,rgba(255,252,249,0.85),transparent);
          pointer-events:none; z-index:5;
        }
        .sp2-fade-r {
          position:absolute; right:0; top:0; bottom:0; width:20px;
          background:linear-gradient(to left,rgba(255,252,249,0.85),transparent);
          pointer-events:none; z-index:5;
        }

        /* skeleton */
        .sp2-skeleton {
          background:linear-gradient(90deg,#f0e6d3 25%,#f7efe3 50%,#f0e6d3 75%);
          background-size:200% 100%;
          animation:sp2-sk 1.7s ease-in-out infinite;
        }
        @keyframes sp2-sk {
          0%   { background-position:200% 0; }
          100% { background-position:-200% 0; }
        }

        /* section bg silk crosshatch */
        .sp2-silk {
          background-image:
            repeating-linear-gradient(-52deg,rgba(176,118,32,0.07) 0,rgba(176,118,32,0.07) 1px,transparent 1px,transparent 20px),
            repeating-linear-gradient(38deg,rgba(176,118,32,0.05) 0,rgba(176,118,32,0.05) 1px,transparent 1px,transparent 20px);
        }

        /* shimmer heading text */
        .sp2-shimmer {
          background:linear-gradient(110deg,#c9853c 0%,#ffe8b0 42%,#c9853c 80%);
          background-size:220%;
          animation:sp2-shim 3.4s linear infinite;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
        }
        @keyframes sp2-shim {
          0%   { background-position:200% center; }
          100% { background-position:-200% center; }
        }

        /* Numeric figures - lining, tabular (font set globally via sp2-num class) */
        .sp2-dot {
          height:5px; border-radius:999px;
          background:rgba(201,133,60,0.22);
          transition:all .35s cubic-bezier(.22,1,.36,1);
        }
        .sp2-dot.active { background:#c9853c; }
      `}</style>

      <section className="relative overflow-hidden sp2-silk" id="shoppreview"
        style={{ background:"linear-gradient(168deg,#fffcf9 0%,#fff8f0 55%,#fffaf3 100%)",
          padding:"clamp(48px,8vw,80px) 0" }}>

        {/* ── ambient glows ── */}
        <div className="absolute pointer-events-none"
          style={{ top:"-80px", right:"-80px", width:320, height:320, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(255,232,176,0.28) 0%,transparent 70%)",
            filter:"blur(40px)" }} />
        <div className="absolute pointer-events-none"
          style={{ bottom:"-60px", left:"-60px", width:280, height:280, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(107,26,26,0.09) 0%,transparent 70%)",
            filter:"blur(40px)" }} />

        <div className="max-w-7xl mx-auto">

          {/* ── HEADER ── */}
          <motion.div
            initial={{ opacity:0, y:28 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.72, ease:[0.22,1,0.36,1] }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8"
            style={{ padding:"0 20px" }}
          >
            <div>
              {/* eyebrow */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <span style={{ height:1, width:24, background:"rgba(107,26,26,0.35)", display:"block" }} />
                <span style={{ fontFamily:F.label, fontSize:"0.63rem", letterSpacing:"0.24em",
                  textTransform:"uppercase", color:"rgba(107,26,26,0.62)", fontWeight:700 }}>
                  Curated Masterpieces
                </span>
              </div>

              {/* headline */}
              <h2 className="font-bold text-[#2a0505] leading-none"
                style={{ fontFamily:F.display, fontSize:"clamp(1.9rem,5.5vw,3rem)" }}>
                Explore Our{" "}
                <em className="sp2-shimmer" style={{ fontStyle:"italic" }}>Boutique</em>
              </h2>
            </div>

            <Link href="/shop"
              className="flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              style={{ fontFamily:F.label, fontSize:"0.62rem", letterSpacing:"0.2em",
                textTransform:"uppercase", fontWeight:700, color:"#6b1a1a" }}
            >
              View Full Shop <ArrowRight size={13} />
            </Link>
          </motion.div>

          {/* ── SCROLL STRIP ── */}
          {loading ? (
            /* skeleton row */
            <div className="sp2-track">
              {Array.from({ length:5 }).map((_,i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div style={{ position:"relative" }}>
              <Arrow dir={-1} onClick={() => scrollBy(-1)} visible={canL} />
              <Arrow dir={ 1} onClick={() => scrollBy( 1)} visible={canR} />

              {/* fades */}
              <div className="sp2-fade-l" />
              <div className="sp2-fade-r" />

              <div ref={scrollRef} className="sp2-track" onScroll={onScroll}>
                {products.map((p, i) => (
                  <ProductCard key={p._id} p={p} index={i} onAdd={() => handleAdd(p)} />
                ))}
                <ViewAllCard />
              </div>
            </div>
          )}

          {/* ── MOBILE DOTS ── */}
          {!loading && products.length > 0 && (
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="flex justify-center gap-1.5 mt-2 sm:hidden"
              style={{ padding:"0 20px" }}
            >
              {Array.from({ length: Math.min(totalDots, 8) }).map((_, i) => (
                <div key={i} className={`sp2-dot ${i === dotIdx ? "active" : ""}`}
                  style={{ width: i === dotIdx ? 20 : 5 }} />
              ))}
            </motion.div>
          )}

          {/* ── loading text ── */}
          {loading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 size={28} className="animate-spin" style={{ color:"#c9853c" }} />
              <span style={{ fontFamily:F.label, fontSize:"0.62rem", letterSpacing:"0.22em",
                textTransform:"uppercase", color:"rgba(90,42,26,0.5)", fontWeight:700 }}>
                Unveiling pieces…
              </span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}