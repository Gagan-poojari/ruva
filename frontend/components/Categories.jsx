"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import toast from "react-hot-toast";

import { useCart } from "@/context/CartContext";
import api from "@/utils/api";

const styles = {
  display: { fontFamily: "'Cormorant Garamond', Georgia, serif" },
  label: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    textTransform: "uppercase",
    letterSpacing: "0.22em",
    fontSize: "0.7rem",
    fontWeight: 700,
  },
  body: { fontFamily: "'Lora', Georgia, serif" },
};

/* ── animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 44 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.82, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.93 },
  show: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.78, delay: i * 0.16, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─────────────────────────────────────────────────────────────── */

const CATEGORIES = [
  {
    title: "Exquisite Sarees",
    sub: "Heritage Silk & Zari",
    img: "/sarees/silk_cotton_checks_saree.jpeg",
    href: "/shop/sarees",
    badge: "200+ Styles",
  },
  {
    title: "Designer Blouses",
    sub: "Ready-to-Wear Elegance",
    img: "/blouses/b2.jpeg",
    href: "/shop/blouses",
    badge: "New Arrivals",
  },
];

const BESTSELLERS = [
  {
    title: "Silk Cotton Checks",
    sub: "Classic Festive Drape",
    price: "₹12,999",
    img: "/sarees/silk_cotton_checks_saree3.jpeg",
    tag: "Bestseller",
  },
  {
    title: "Modal Silk Elegance",
    sub: "Evening Luxe",
    price: "₹10,499",
    img: "/sarees/modal_silk_saree.jpeg",
    tag: "Trending",
  },
  {
    title: "Jamdani Weave",
    sub: "Heirloom Craft",
    price: "₹14,299",
    img: "/sarees/jamdani_saree.jpeg",
    tag: "Limited",
  },
  {
    title: "Kanchipuram Heritage",
    sub: "Temple Border Classic",
    price: "₹15,999",
    img: "/sarees/saree1.jpeg",
    tag: "Trending",
  },
];

const normalizeTagList = (product) =>
  Array.isArray(product?.tags)
    ? product.tags.map((tag) => String(tag).trim().toLowerCase())
    : [];

const getBestsellerTag = (product) => {
  const tags = normalizeTagList(product);
  if (product?.isBestseller) return "Bestseller";
  if (product?.isTrending) return "Trending";
  if (tags.includes("limited")) return "Limited";
  if (tags.includes("new")) return "New";
  return product?.tag || "New";
};

/* ── Gold card border via CSS custom property mouse tracking ── */
function GoldCard({ children, className = "", href }) {
  const ref = useRef(null);

  const track = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const inner = (
    <div ref={ref} onMouseMove={track} className={`gold-card ${className}`}>
      {children}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

/* ─────────────────────────────────────────────────────────────── */

export default function Categories() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const { addToCart } = useCart();
  const [bestsellers, setBestsellers] = useState([]);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const { data } = await api.get('/products', {
          params: { pageSize: 50 }
        });
        
        // Only show sarees marked for this showcase.
        const bs = data.products.filter((p) => {
          const isSaree = String(p.category || "").toLowerCase() === "sarees";
          const tags = normalizeTagList(p);
          return isSaree && (p.isBestseller || p.isTrending || tags.includes("new") || tags.includes("limited"));
        });
        setBestsellers(bs.length > 0 ? bs.slice(0, 4) : []);
      } catch (error) {
        console.error("Failed to fetch home products", error);
      }
    };
    fetchHomeProducts();
  }, []);

  const formatPrice = (p) => {
    if (typeof p === 'string' && p.includes('₹')) return p;
    return `₹${Number(p).toLocaleString('en-IN')}`;
  };

  const bestsellersForCart = useMemo(() => {
    const itemsToMap = bestsellers.length > 0 ? bestsellers : BESTSELLERS;
    const toNumber = (v) => typeof v === 'number' ? v : Number(String(v || "").replace(/[^\d.]/g, "")) || 0;
    
    return itemsToMap.map((p, idx) => {
      if (p._id) {
        return {
          _id: p._id,
          name: p.name,
          category: p.category,
          image: p.images?.[0]?.url,
          price: p.discountPrice || p.price,
        };
      }
      // Fallback for static items
      return {
        _id: `static-bs-${idx}`,
        name: p.title,
        category: p.title?.toLowerCase().includes("blouse") ? "Blouse" : "Sarees",
        image: p.img,
        price: toNumber(p.price),
      };
    });
  }, [bestsellers]);

  return (
    <>
      {/* ── Global styles ───────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lora:ital,wght@0,400;1,400&display=swap');

        :root {
          --gold-1: #c9853c;
          --gold-2: #f0c97a;
          --gold-3: #ffe8b0;
          --cream: #fdf6ec;
          --dark: #1e0808;
          --maroon: #6b1a1a;
          --text-soft: rgba(90,42,26,0.68);
        }

        /* shimmer text */
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

        /* gold border card */
        .gold-card {
          position: relative;
          isolation: isolate;
        }
        .gold-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.5px;
          background:
            radial-gradient(260px circle at var(--mx,50%) var(--my,50%),
              rgba(255,232,176,0.95),
              rgba(201,133,60,0.45) 38%,
              transparent 68%),
            linear-gradient(135deg,
              rgba(201,133,60,0.55),
              rgba(255,232,176,0.9) 50%,
              rgba(201,133,60,0.5));
          -webkit-mask: linear-gradient(#000 0 0) content-box,
                        linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 30;
          transition: filter .3s;
          filter: drop-shadow(0 0 6px rgba(240,201,122,0.4));
        }
        .gold-card:hover::before {
          filter: drop-shadow(0 0 12px rgba(240,201,122,0.75));
        }

        /* subtle silk texture */
        .silk-texture {
          background-image:
            repeating-linear-gradient(
              -52deg,
              rgba(176,118,32,0.10) 0px,
              rgba(176,118,32,0.10) 1px,
              transparent 1px,
              transparent 18px
            ),
            repeating-linear-gradient(
              38deg,
              rgba(176,118,32,0.07) 0px,
              rgba(176,118,32,0.07) 1px,
              transparent 1px,
              transparent 18px
            );
        }

        /* scrollable row on mobile */
        .scroll-row {
          display: grid;
          grid-template-columns: repeat(4, 72vw);
          gap: 14px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 6px;
          scrollbar-width: none;
        }
        .scroll-row::-webkit-scrollbar { display: none; }
        .scroll-row > * { scroll-snap-align: start; }

        @media (min-width: 640px) {
          .scroll-row {
            grid-template-columns: repeat(4, 1fr);
            overflow-x: visible;
          }
        }

        /* pill tag */
        .tag-pill {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 0.62rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
      `}</style>

      {/* ════════════════════════════════════════════════
          SECTION 1 — CATEGORIES
      ════════════════════════════════════════════════ */}
      <section
        id="categories"
        ref={sectionRef}
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(168deg,#fdf8f0 0%,#f9edda 55%,#fdf5e8 100%)" }}
      >
        {/* Parallax silk texture overlay */}
        <motion.div
          className="absolute inset-0 silk-texture pointer-events-none"
          style={{ y: bgY, opacity: 0.45 }}
        />

        {/* Ambient glows */}
        {/* <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(201,133,60,0.15)" }} />
        <div className="absolute -bottom-32 -right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(107,26,26,0.10)" }} /> */}

        {/* ── Section header ── */}
        <div className="relative z-10 pt-16 pb-10 px-5">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="flex flex-col items-center text-center"
          >
            <div className="flex items-center gap-3 mb-3" style={{ opacity: 0.75 }}>
              <span className="h-px w-7 bg-[#6b1a1a]" />
              <span style={styles.label} className="text-[#6b1a1a]">Curated Collections</span>
              <span className="h-px w-7 bg-[#6b1a1a]" />
            </div>

            <h2
              className="text-[2.6rem] sm:text-5xl font-bold text-[#2a0505] leading-[1.07] mb-4"
              style={styles.display}
            >
              Shop by{" "}
              <span className="italic shimmer-gold">Category</span>
            </h2>

            <p className="max-w-xs text-sm leading-relaxed" style={{ ...styles.body, color: "var(--text-soft)" }}>
              From the heavy silks of Kanchipuram to the ethereal drapes of Banaras — a legacy tailored for you.
            </p>
          </motion.div>
        </div>

        {/* ── 2-column cards (side-by-side on mobile too) ── */}
        <div className="relative z-10 px-4 pb-16 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.title}
                custom={i}
                variants={scaleIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, transition: { duration: 0.38 } }}
              >
                <GoldCard
                  href={cat.href}
                  className="block rounded-lg sm:rounded-xl overflow-hidden cursor-pointer"
                  style={{
                    boxShadow: "0 18px 48px rgba(30,8,8,0.16), 0 4px 12px rgba(201,133,60,0.10)",
                  }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden"
                    style={{ aspectRatio: "3/4", borderRadius: "inherit" }}>
                    <img
                      src={cat.img}
                      alt={cat.title}
                      className="w-full h-full object-cover transition-transform duration-1200ms ease-out hover:scale-[1.07]"
                      style={{ objectPosition: "center 38%" }}
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0"
                      style={{
                        background: "linear-gradient(to top, rgba(20,4,4,0.92) 0%, rgba(20,4,4,0.3) 46%, transparent 75%)"
                      }}
                    />

                    {/* Badge */}
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                      <span
                        className="tag-pill px-2.5 py-1 rounded-full"
                        style={{
                          background: "rgba(30,8,8,0.55)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid rgba(240,201,122,0.5)",
                          color: "#f0c97a",
                        }}
                      >
                        {cat.badge}
                      </span>
                    </div>

                    {/* Text at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 text-center z-20">
                      {/* <p
                        className="text-[0.58rem]  mb-1 sm:mb-2"
                        style={{
                          ...styles.label,
                          color: "rgba(246,223,181,0.8)",
                          letterSpacing: "0.18em",
                        }}
                      >
                        {cat.sub}
                      </p> */}
                      <h3
                        className="text-lg sm:text-3xl font-bold text-[#fff5dd] leading-tight mb-3 sm:mb-5"
                        style={{ ...styles.display, textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
                      >
                        {cat.title}
                      </h3>

                      {/* CTA pill */}
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2 rounded-full text-[0.6rem] sm:text-xs font-semibold tracking-widest uppercase"
                        style={{
                          background: "rgba(255,245,220,0.12)",
                          border: "1px solid rgba(240,201,122,0.55)",
                          color: "#ffe8b0",
                          backdropFilter: "blur(10px)",
                          fontFamily: "'Cormorant Garamond',Georgia,serif",
                          letterSpacing: "0.15em",
                        }}
                      >
                        Explore
                        <ArrowRight size={10} />
                      </span>
                    </div>
                  </div>
                </GoldCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          SECTION 2 — BESTSELLERS
      ════════════════════════════════════════════════ */}
      <section id="shop" style={{ background: "#fffaf3" }} className="pt-16 pb-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">

          {/* Header row */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="flex items-end justify-between mb-8 sm:mb-12"
          >
            <div>
              <div className="flex items-center gap-2 mb-2" style={{ ...styles.label, color: "#c87d1a" }}>
                The Gold Standard
              </div>
              <h2
                className="text-[2.2rem] sm:text-5xl font-bold text-[#2a0505] leading-none"
                style={styles.display}
              >
                Our{" "}
                <span className="italic shimmer-gold">Bestsellers</span>
              </h2>
            </div>

            <Link
              href="/shop"
              className="flex items-center gap-2 text-[0.65rem] font-bold tracking-widest uppercase text-[#6b1a1a] hover:text-[#c87d1a] transition-colors shrink-0"
              style={styles.label}
            >
              View All
              <ArrowRight size={12} />
            </Link>
          </motion.div>

          {/* Horizontal scroll on mobile, 4-col grid on desktop */}
          <div className="scroll-row">
            {(bestsellers.length > 0 ? bestsellers : BESTSELLERS).map((p, i) => (
              <motion.div
                key={p._id || p.title}
                custom={i}
                variants={scaleIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.32 } }}
                className="min-w-0"
              >
                <GoldCard className="rounded-2xl overflow-hidden h-full"
                  style={{
                    background: "#fff",
                    boxShadow: "0 8px 28px rgba(42,5,5,0.09), 0 2px 8px rgba(201,133,60,0.08)",
                  }}
                >
                  <Link href={p._id ? `/products/${p._id}` : '#'}>
                    {/* Image */}
                    <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                      <img
                        src={p.images?.[0]?.url || p.img}
                        alt={p.name || p.title}
                        className="w-full h-full object-cover transition-transform duration-1100ms hover:scale-[1.06]"
                      />

                      {/* Tag */}
                      <span
                        className="tag-pill absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(20,4,4,0.6)",
                          backdropFilter: "blur(6px)",
                          border: "1px solid rgba(240,201,122,0.45)",
                          color: "#f0c97a",
                        }}
                      >
                        {getBestsellerTag(p)}
                      </span>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="px-3.5 py-3.5 sm:px-5 sm:py-4 text-center">
                    <h3
                      className="text-base sm:text-lg font-bold text-[#3d0a0a] leading-snug"
                      style={styles.display}
                    >
                      {p.name || p.title}
                    </h3>
                    <p
                      className="text-[0.58rem] text-[#5a2a1a]/55 uppercase tracking-widest mb-3 mt-0.5 line-clamp-1"
                      style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", letterSpacing: "0.16em" }}
                    >
                      {p.category || p.sub}
                    </p>

                    <div className="flex items-center justify-between">
                      <span
                        className="text-base sm:text-lg font-bold"
                        style={{ ...styles.display, color: "#6b1a1a" }}
                      >
                        {formatPrice(p.discountPrice || p.price)}
                      </span>

                      {/* Quick add button */}
                      <button
                        type="button"
                        onClick={() => {
                          const cartItem = bestsellersForCart[i];
                          addToCart(cartItem, 1, "Free Size");
                          toast.success("Added to cart");
                        }}
                        className="text-[0.58rem] sm:text-[0.65rem] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full font-bold uppercase tracking-widest transition-all active:scale-95"
                        style={{
                          fontFamily: "'Cormorant Garamond',Georgia,serif",
                          letterSpacing: "0.14em",
                          background: "linear-gradient(130deg,#6b1a1a,#a03030)",
                          color: "#ffe8b0",
                          border: "none",
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </GoldCard>
              </motion.div>
            ))}
          </div>

          {/* Mobile scroll hint dots */}
          <div className="flex justify-center gap-1.5 mt-5 sm:hidden">
            {(bestsellers.length > 0 ? bestsellers : BESTSELLERS).map((_, i) => (
              <span
                key={i}
                className="block rounded-full transition-all"
                style={{
                  width: i === 0 ? 18 : 5,
                  height: 5,
                  background: i === 0 ? "var(--gold-1)" : "rgba(201,133,60,0.28)",
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}