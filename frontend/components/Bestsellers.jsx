"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
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
};

const BESTSELLERS = [
    { title: "Silk Cotton Checks", sub: "Classic Festive Drape", price: "₹12,999", img: "/sarees/silk_cotton_checks_saree3.jpeg", tag: "Bestseller" },
    { title: "Modal Silk Elegance", sub: "Evening Luxe", price: "₹10,499", img: "/sarees/modal_silk_saree.jpeg", tag: "Trending" },
    { title: "Jamdani Weave", sub: "Heirloom Craft", price: "₹14,299", img: "/sarees/jamdani_saree.jpeg", tag: "Limited" },
    { title: "Kanchipuram Heritage", sub: "Temple Border Classic", price: "₹15,999", img: "/sarees/kanchipuram_silk_saree.webp", tag: "Trending" },
];

const normalizeTagList = (p) =>
    Array.isArray(p?.tags) ? p.tags.map((t) => String(t).trim().toLowerCase()) : [];

const getTag = (p) => {
    const tags = normalizeTagList(p);
    if (p?.isBestseller) return "Bestseller";
    if (p?.isTrending) return "Trending";
    if (tags.includes("limited")) return "Limited";
    if (tags.includes("new")) return "New";
    return p?.tag || "New";
};

const TAG_STYLES = {
    Bestseller: { border: "rgba(240,201,122,0.45)", color: "#f0c97a" },
    Trending: { border: "rgba(196,181,240,0.45)", color: "#c4b5f0" },
    Limited: { border: "rgba(255,204,160,0.45)", color: "#ffcca0" },
    New: { border: "rgba(160,255,204,0.45)", color: "#a0ffd0" },
};

/* ── Gold border ── */
function GoldCard({ children, className = "", style = {} }) {
    const ref = useRef(null);
    const track = (e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    return (
        <div ref={ref} onMouseMove={track} className={`bs-gold-card ${className}`} style={style}>
            {children}
        </div>
    );
}

const formatPrice = (p) => {
    if (typeof p === "string" && p.includes("₹")) return p;
    return `₹${Number(p).toLocaleString("en-IN")}`;
};

/* ── Single product card - equal height via flex column ── */
function ProductCard({ p, index, onAdd }) {
    const [hovered, setHovered] = useState(false);
    const tag = getTag(p);
    const ts = TAG_STYLES[tag] || TAG_STYLES.New;
    const href = p._id ? `/products/${p._id}` : "#";

    return (
        <motion.div
            custom={index}
            variants={{
                hidden: { opacity: 0, y: 30 },
                show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.72, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-30px" }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            /* Equal height: each card stretches to match its sibling */
            className="flex flex-col"
        >
            <GoldCard
                className="rounded-xl overflow-hidden flex flex-col flex-1"
                style={{ background: "#fff" }}
            >
                {/* Image - fixed aspect ratio so all images are the same size */}
                <Link href={href} className="block shrink-0">
                    <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                        <motion.img
                            src={p.images?.[0]?.url || p.img}
                            alt={p.name || p.title}
                            className="w-full h-full object-cover"
                            animate={{ scale: hovered ? 1.06 : 1 }}
                            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                        />
                        {/* Single gradient */}
                        <div className="absolute inset-0"
                            style={{ background: "linear-gradient(to top, rgba(8,1,1,0.5) 0%, transparent 55%)" }} />

                        {/* Tag */}
                        <span className="bs-tag-pill absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(8,1,1,0.55)", backdropFilter: "blur(6px)", border: `1px solid ${ts.border}`, color: ts.color }}>
                            {tag}
                        </span>

                        {/* View details fade-in */}
                        <motion.div
                            className="absolute inset-x-0 bottom-0 flex justify-center pb-3"
                            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
                            transition={{ duration: 0.22 }}
                        >
                            <span className="bs-tag-pill px-3 py-1 rounded-full"
                                style={{ background: "rgba(255,245,220,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(240,201,122,0.4)", color: "#ffe8b0" }}>
                                View Details
                            </span>
                        </motion.div>
                    </div>
                </Link>

                {/* Info - flex-1 so all info blocks align to same bottom */}
                <div className="flex flex-col flex-1 px-3 py-3 sm:px-4 sm:py-3.5 text-center">
                    <h3 className="font-bold text-[#3d0a0a] leading-snug flex-1"
                        style={{ ...styles.display, fontSize: "clamp(0.85rem, 2vw, 1.05rem)" }}>
                        {p.name || p.title}
                    </h3>
                    <p className="mt-0.5 mb-2.5 line-clamp-1 text-[#5a2a1a]/50"
                        style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                        {p.category || p.sub}
                    </p>

                    {/* Price + Add - always at bottom */}
                    <div className="flex items-center justify-between mt-auto">
                        <span className="font-bold sp2-num" style={{ color: "#6b1a1a", fontSize: "clamp(0.9rem, 2.2vw, 1.1rem)" }}>
                            {formatPrice(p.discountPrice || p.price)}
                        </span>
                        <motion.button
                            type="button"
                            onClick={() => onAdd(index)}
                            whileTap={{ scale: 0.9 }}
                            className="flex items-center gap-1 rounded-full font-bold cursor-pointer"
                            style={{
                                fontFamily: "'Cormorant Garamond',Georgia,serif",
                                letterSpacing: "0.13em",
                                textTransform: "uppercase",
                                background: "linear-gradient(130deg,#6b1a1a,#9a2828)",
                                color: "#ffe8b0",
                                border: "none",
                                fontSize: "clamp(0.55rem, 1.3vw, 0.65rem)",
                                padding: "clamp(4px,1vw,6px) clamp(8px,2vw,14px)",
                            }}
                        >
                            <ShoppingBag size={10} /> Add
                        </motion.button>
                    </div>
                </div>
            </GoldCard>
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────── */

export default function Bestsellers() {
    const { addToCart } = useCart();
    const [bestsellers, setBestsellers] = useState([]);
    const [dotIndex, setDotIndex] = useState(0);
    const rowRef = useRef(null);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/products", {
                    params: { isBestseller: "true", pageSize: 8 }
                });
                const unique = [];
                const seen = new Set();
                for (const p of data.products || []) {
                    const key = (p.name || "").trim().toLowerCase();
                    if (!seen.has(key)) { seen.add(key); unique.push(p); }
                }
                if (unique.length > 0) setBestsellers(unique.slice(0, 4));
            } catch { /* fall through to static */ }
        })();
    }, []);

    const items = bestsellers.length > 0 ? bestsellers : BESTSELLERS;

    const cartItems = useMemo(() => {
        const toNum = (v) => typeof v === "number" ? v : Number(String(v || "").replace(/[^\d.]/g, "")) || 0;
        return items.map((p, i) =>
            p._id
                ? { _id: p._id, name: p.name, category: p.category, image: p.images?.[0]?.url, price: p.discountPrice || p.price }
                : { _id: `static-${i}`, name: p.title, category: "Sarees", image: p.img, price: toNum(p.price) }
        );
    }, [items]);

    const handleAdd = (i) => {
        addToCart(cartItems[i], 1, "Free Size");
        toast.success("Added to cart");
    };

    const handleScroll = () => {
        const el = rowRef.current;
        if (!el) return;
        const w = el.scrollWidth / items.length;
        setDotIndex(Math.round(el.scrollLeft / w));
    };

    return (
        <>
            <style>{`
        /* Gold border - clean single border, no extra drop shadows */
        .bs-gold-card { position: relative; isolation: isolate; }
        .bs-gold-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background:
            radial-gradient(240px circle at var(--mx,50%) var(--my,50%),
              rgba(255,232,176,0.88), rgba(201,133,60,0.3) 40%, transparent 65%),
            linear-gradient(135deg, rgba(201,133,60,0.38), rgba(255,232,176,0.7) 50%, rgba(201,133,60,0.35));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 30;
          transition: opacity 0.3s;
          opacity: 0.7;
        }
        .bs-gold-card:hover::before { opacity: 1; }

        .bs-tag-pill {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 700;
        }

        /* Mobile: horizontal scroll, each card = ~70vw so you see a peek of next */
        .bs-grid {
          display: grid;
          grid-template-columns: repeat(4, 70vw);
          gap: 10px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-bottom: 2px;
        }
        .bs-grid::-webkit-scrollbar { display: none; }
        .bs-grid > * { scroll-snap-align: start; }

        /* Desktop: 4-col grid, equal heights via align-items: stretch */
        @media (min-width: 640px) {
          .bs-grid {
            grid-template-columns: repeat(4, 1fr);
            overflow-x: visible;
            align-items: stretch;
          }
        }

        .shimmer-gold {
          background: linear-gradient(110deg, #c9853c 0%, #ffe8b0 42%, #c9853c 80%);
          background-size: 220%;
          animation: bs-shimmer 3.4s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes bs-shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }

        .scroll-dot {
          height: 4px;
          border-radius: 9999px;
          background: rgba(201,133,60,0.22);
          transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        .scroll-dot.on { background: #c9853c; }
      `}</style>

            <section id="shop" style={{ background: "#fffaf3" }} className="pt-14 pb-16 overflow-hidden">
                <div className="max-w-6xl mx-auto px-3 sm:px-5">

                    {/* Header */}
                    <motion.div
                        variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }}
                        initial="hidden" whileInView="show" viewport={{ once: true }}
                        className="flex items-end justify-between mb-6 sm:mb-10"
                    >
                        <div>
                            <p className="mb-1.5" style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", textTransform: "uppercase", letterSpacing: "0.22em", fontSize: "0.68rem", fontWeight: 700, color: "#c87d1a" }}>
                                The Gold Standard
                            </p>
                            <h2 className="font-bold text-[#2a0505] leading-none"
                                style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(1.8rem, 5vw, 3rem)" }}>
                                Our <span className="italic shimmer-gold">Bestsellers</span>
                            </h2>
                        </div>
                        <Link href="/shop"
                            className="flex items-center gap-1.5 text-[#6b1a1a] hover:text-[#c87d1a] transition-colors shrink-0"
                            style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.65rem", fontWeight: 700 }}>
                            View All <ArrowRight size={12} />
                        </Link>
                    </motion.div>

                    {/* Cards */}
                    <div className="bs-grid" ref={rowRef} onScroll={handleScroll}>
                        {items.map((p, i) => (
                            <ProductCard key={p._id || p.title} p={p} index={i} onAdd={handleAdd} />
                        ))}
                    </div>

                    {/* Mobile dots */}
                    <div className="flex justify-center gap-1.5 mt-5 sm:hidden">
                        {items.map((_, i) => (
                            <div key={i} className={`scroll-dot ${i === dotIndex ? "on" : ""}`}
                                style={{ width: i === dotIndex ? 20 : 5 }} />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}