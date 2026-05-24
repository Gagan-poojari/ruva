"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

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

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.78, delay: i * 0.11, ease: [0.22, 1, 0.36, 1] },
  }),
};

const CATEGORIES = [
  {
    title: "Sarees",
    sub: "Heritage Silk & Zari",
    img: "/sarees/saree.avif",
    href: "/categories/sarees",
    badge: "200+ Styles",
    accent: "rgba(107,26,26,0.88)",
    size: "large",
  },
  {
    title: "Blouses",
    sub: "Ready-to-Wear Elegance",
    img: "/blouses/b1.jpeg",
    href: "/categories/blouses",
    badge: "New Arrivals",
    accent: "rgba(60,40,107,0.88)",
    size: "small",
  },
  {
    title: "Silver Jewelries",
    sub: "Artisan Silvercraft",
    img: "/silver-jewelries/silver-jewelry.jpg",
    href: "/categories/silver-jewelry",
    badge: "Handcrafted",
    accent: "rgba(40,80,107,0.88)",
    size: "small",
  },
  {
    title: "Crystal Bracelets",
    sub: "Healing Gems & Energy",
    img: "/crystal-bracelets/crystal-bracelet.webp",
    href: "/categories/crystal-bracelets",
    badge: "Curated",
    accent: "rgba(60,107,80,0.88)",
    size: "small",
  },
  {
    title: "Shawls",
    sub: "Kashmiri Pashmina & More",
    img: "/shawls/shawl.jpg",
    href: "/categories/shawls",
    badge: "Winter Edit",
    accent: "rgba(107,75,26,0.88)",
    size: "small",
  },
  {
    title: "Limited Offers",
    sub: "Exclusive & Time-Bound",
    img: "/limited-time/lt.jpg",
    href: "/categories/limited-offers",
    badge: "Ends Soon",
    accent: "rgba(139,26,26,0.95)",
    size: "large",
    isLimited: true,
  },
];

/* ── Gold border card ── */
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
    <div ref={ref} onMouseMove={track} className={`gold-card ${className}`} style={style}>
      {children}
    </div>
  );
}

/* ── Countdown Timer ── */
function CountdownTimer() {
  const [time, setTime] = useState({ h: 11, m: 42, s: 7 });
  React.useEffect(() => {
    const id = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const pad = n => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-2 mt-2.5">
      {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center min-w-8">
            <motion.span
              key={v}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-bold text-[#ffe8b0] tabular-nums leading-none"
              style={{ ...styles.display, fontSize: "clamp(1rem, 3vw, 1.5rem)" }}
            >
              {v}
            </motion.span>
            <span className="text-[#f0c97a]/50 mt-0.5" style={{ ...styles.label, fontSize: "0.42rem" }}>
              {["hrs", "min", "sec"][i]}
            </span>
          </div>
          {i < 2 && <span className="text-[#f0c97a]/50 font-bold mb-2" style={styles.display}>:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── Large hero card (full width row) ── */
function LargeCard({ cat, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <Link href={cat.href}>
        <GoldCard className="rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer">
          <div className="relative overflow-hidden" style={{ aspectRatio: "21/8" }}>
            <motion.img
              src={cat.img}
              alt={cat.title}
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 38%" }}
              animate={{ scale: hovered ? 1.05 : 1 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* Single clean gradient — no double overlays */}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(100deg, rgba(8,1,1,0.85) 0%, rgba(8,1,1,0.32) 55%, rgba(8,1,1,0.08) 100%)" }}
            />

            {/* Badge */}
            <div className="absolute top-3 left-3 sm:top-5 sm:left-5 flex items-center gap-1.5">
              {cat.isLimited && <Clock size={10} color="#f0c97a" />}
              <span className="tag-pill px-2.5 py-0.5 rounded-full"
                style={{ background: "rgba(8,1,1,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(240,201,122,0.4)", color: "#f0c97a" }}>
                {cat.badge}
              </span>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-[#f0c97a]/65 mb-1" style={{ ...styles.label, fontSize: "0.58rem" }}>{cat.sub}</p>
                <h3 className="font-bold text-[#fff5dd] leading-none"
                  style={{ ...styles.display, fontSize: "clamp(1.5rem, 4vw, 2.8rem)" }}>
                  {cat.title}
                </h3>
                {cat.isLimited && <CountdownTimer />}
              </div>
              <motion.span
                animate={{ x: hovered ? 5 : 0, opacity: hovered ? 1 : 0.65 }}
                transition={{ duration: 0.28 }}
                className="shrink-0 flex items-center gap-1.5 rounded-full"
                style={{
                  padding: "clamp(6px,1.5vw,10px) clamp(12px,2.5vw,22px)",
                  background: "rgba(255,245,220,0.1)",
                  border: "1px solid rgba(240,201,122,0.45)",
                  color: "#ffe8b0",
                  fontFamily: "'Cormorant Garamond',Georgia,serif",
                  letterSpacing: "0.15em",
                  fontSize: "clamp(0.55rem, 1.2vw, 0.7rem)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  backdropFilter: "blur(8px)",
                  whiteSpace: "nowrap",
                }}
              >
                Explore <ArrowRight size={11} />
              </motion.span>
            </div>
          </div>
        </GoldCard>
      </Link>
    </motion.div>
  );
}

/* ── Small card ── */
function SmallCard({ cat, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <Link href={cat.href}>
        <GoldCard className="rounded-xl overflow-hidden cursor-pointer">
          <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
            <motion.img
              src={cat.img}
              alt={cat.title}
              className="w-full h-full object-cover"
              animate={{ scale: hovered ? 1.07 : 1 }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* Single gradient, transitions accent on hover */}
            <motion.div
              className="absolute inset-0"
              animate={{
                background: hovered
                  ? `linear-gradient(to top, ${cat.accent} 0%, rgba(8,1,1,0.4) 60%, transparent 100%)`
                  : "linear-gradient(to top, rgba(8,1,1,0.85) 0%, rgba(8,1,1,0.2) 60%, transparent 100%)",
              }}
              transition={{ duration: 0.45 }}
            />

            {/* Badge */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
              <span className="tag-pill px-2 py-0.5 rounded-full"
                style={{ background: "rgba(8,1,1,0.5)", backdropFilter: "blur(6px)", border: "1px solid rgba(240,201,122,0.38)", color: "#f0c97a" }}>
                {cat.badge}
              </span>
            </div>

            {/* Title */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-center z-10">
              <h3 className="font-bold text-[#fff5dd] leading-tight"
                style={{ ...styles.display, fontSize: "clamp(0.9rem, 2.5vw, 1.2rem)" }}>
                {cat.title}
              </h3>
              <motion.div
                animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 7 }}
                transition={{ duration: 0.25 }}
                className="mt-1.5 flex justify-center items-center gap-1"
                style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "#ffe8b0" }}
              >
                Shop Now <ArrowRight size={8} />
              </motion.div>
            </div>
          </div>
        </GoldCard>
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────── */

export default function Categories() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  const largeFirst = CATEGORIES[0];
  const smalls = CATEGORIES.slice(1, 5);
  const largeLast = CATEGORIES[5];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lora:ital,wght@0,400;1,400&display=swap');

        :root {
          --gold-1: #c9853c;
          --gold-2: #f0c97a;
          --gold-3: #ffe8b0;
          --text-soft: rgba(90,42,26,0.65);
        }

        .shimmer-gold {
          background: linear-gradient(110deg, var(--gold-1) 0%, var(--gold-3) 42%, var(--gold-1) 80%);
          background-size: 220%;
          animation: shimmer-anim 3.4s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes shimmer-anim {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }

        /* Gold border — single, clean */
        .gold-card { position: relative; isolation: isolate; }
        .gold-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background:
            radial-gradient(240px circle at var(--mx,50%) var(--my,50%),
              rgba(255,232,176,0.9), rgba(201,133,60,0.35) 40%, transparent 65%),
            linear-gradient(135deg, rgba(201,133,60,0.4), rgba(255,232,176,0.75) 50%, rgba(201,133,60,0.38));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 30;
          transition: opacity 0.3s;
          opacity: 0.8;
        }
        .gold-card:hover::before { opacity: 1; }

        .silk-bg {
          background-image:
            repeating-linear-gradient(-52deg, rgba(176,118,32,0.08) 0px, rgba(176,118,32,0.08) 1px, transparent 1px, transparent 20px),
            repeating-linear-gradient(38deg, rgba(176,118,32,0.05) 0px, rgba(176,118,32,0.05) 1px, transparent 1px, transparent 20px);
        }

        .tag-pill {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 700;
        }

        /* 4-col grid on desktop, 2-col on mobile */
        .smalls-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (min-width: 640px) {
          .smalls-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; }
        }
      `}</style>

      <section
        id="categories"
        ref={sectionRef}
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(168deg,#fdf8f0 0%,#f9edda 55%,#fdf5e8 100%)" }}
      >
        <motion.div className="absolute inset-0 silk-bg pointer-events-none" style={{ y: bgY, opacity: 0.5 }} />

        {/* Header */}
        <div className="relative z-10 pt-14 pb-8 px-4 sm:px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-2.5" style={{ opacity: 0.72 }}>
              <span className="h-px w-6 bg-[#6b1a1a]" />
              <span style={{ ...styles.label, color: "#6b1a1a" }}>Curated Collections</span>
              <span className="h-px w-6 bg-[#6b1a1a]" />
            </div>
            <h2 className="font-bold text-[#2a0505] leading-[1.07] mb-3"
              style={{ ...styles.display, fontSize: "clamp(2rem, 6vw, 3.2rem)" }}>
              Shop by <span className="italic shimmer-gold">Category</span>
            </h2>
            <p className="max-w-104 text-sm leading-relaxed"
              style={{ ...styles.body, color: "var(--text-soft)", fontSize: "clamp(0.8rem, 2vw, 0.9rem)" }}>
              From heavy Kanchipuram silks to artisan silvercraft - a legacy tailored for you.
            </p>
          </motion.div>
        </div>

        {/* Layout */}
        <div className="relative z-10 px-3 sm:px-5 pb-14 max-w-6xl mx-auto space-y-2.5 sm:space-y-4">
          {/* Sarees — full width */}
          <LargeCard cat={largeFirst} index={0} />

          {/* 4 small cards */}
          <div className="smalls-grid">
            {smalls.map((cat, i) => (
              <SmallCard key={cat.title} cat={cat} index={i + 1} />
            ))}
          </div>

          {/* Limited Offers — full width */}
          <LargeCard cat={largeLast} index={5} />
        </div>
      </section>
    </>
  );
}