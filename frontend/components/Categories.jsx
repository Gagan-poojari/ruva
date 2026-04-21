"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const styles = {
  sectionTitle: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    letterSpacing: "-0.01em",
  },
  label: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    textTransform: "uppercase",
    letterSpacing: "0.2em",
    fontSize: "0.75rem",
    fontWeight: 700,
  },
  body: {
    fontFamily: "'Lora', Georgia, serif",
  },
};

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 80 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const cardHover = {
  hidden: { opacity: 0, y: 80, scale: 1 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
  rest: { y: 0, scale: 1 },
  hover: {
    y: -7,
    scale: 1.01,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const ctaReveal = {
  rest: { y: 80, opacity: 0 },
  hover: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Categories() {
  const bestsellers = [
    {
      title: "Silk Cotton Checks",
      sub: "Classic Festive Drape",
      price: "₹12,999",
      img: "/sarees/silk_cotton_checks_saree3.jpeg",
    },
    {
      title: "Modal Silk Elegance",
      sub: "Evening Luxe",
      price: "₹10,499",
      img: "/sarees/modal_silk_saree.jpeg",
    },
    {
      title: "Jamdani Weave",
      sub: "Heirloom Craft",
      price: "₹14,299",
      img: "/sarees/jamdani_saree.jpeg",
    },
    {
      title: "Blouse Edit",
      sub: "Ready-To-Wear",
      price: "₹3,299",
      img: "/blouses/b3.jpeg",
    },
  ];

  return (
    <>
      <style>{`
        .shimmer {
          background: linear-gradient(120deg, #c87d1a, #fff3c4, #c87d1a);
          background-size: 200%;
          animation: shimmer 3s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @keyframes shimmer {
          0% { background-position: 200%; }
          100% { background-position: -200%; }
        }
        .card-shell {
          position: relative;
          isolation: isolate;
        }
        .card-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 1.5rem;
          padding: 2px;
          background:
            radial-gradient(280px circle at var(--x, 50%) var(--y, 50%), rgba(255, 236, 178, 1), rgba(255, 220, 133, 0.56) 30%, rgba(255, 220, 133, 0.05) 66%),
            linear-gradient(130deg, rgba(166, 109, 25, 0.4), rgba(255, 240, 196, 0.95), rgba(166, 109, 25, 0.45));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.95;
          transition: opacity .3s ease, filter .3s ease;
          filter: drop-shadow(0 0 8px rgba(246, 200, 106, 0.55));
          pointer-events: none;
          z-index: 40;
        }
        .card-shell:hover::before {
          opacity: 1;
          filter: drop-shadow(0 0 14px rgba(246, 200, 106, 0.8));
        }
        .card-shell::after {
          content: "";
          position: absolute;
          inset: 2px;
          border-radius: calc(1.5rem - 2px);
          border: 1px solid rgba(255, 226, 160, 0.33);
          pointer-events: none;
          z-index: 39;
        }
      `}</style>

      {/* ================= CATEGORIES ================= */}
      <section className="relative py-28 px-4 overflow-hidden">
        {/* Texture + pattern background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(175deg,#fdf8ef_0%,#f8eddc_54%,#fdf5e8_100%)]" />
          <div
            className="absolute inset-0"
            style={{
              opacity: 0.36,
              backgroundImage: "repeating-linear-gradient(-45deg, rgba(176,118,32,0.17) 0, rgba(176,118,32,0.17) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(45deg, rgba(176,118,32,0.12) 0, rgba(176,118,32,0.12) 1px, transparent 1px, transparent 20px)",
            }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(165deg, rgba(255,245,220,0) 0%, rgba(186,126,41,0.08) 50%, rgba(255,245,220,0) 100%)" }} />
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl bg-[#d9a354]/20" />
          <div className="absolute -bottom-28 -right-20 w-96 h-96 rounded-full blur-3xl bg-[#b9781f]/15" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-3 mb-4 opacity-70">
              <span className="h-px w-8 bg-[#6b1a1a]" />
              <span style={styles.label} className="text-[#6b1a1a]">
                Curated Collections
              </span>
              <span className="h-px w-8 bg-[#6b1a1a]" />
            </div>

            <h2
              className="text-4xl md:text-6xl font-bold text-[#2a0505] mb-6"
              style={styles.sectionTitle}
            >
              Shop by <span className="italic shimmer">Category</span>
            </h2>

            <p
              className="max-w-xl mx-auto text-[#5a2a1a]/70"
              style={styles.body}
            >
              From the heavy silks of Kanchipuram to the ethereal drapes of
              Banaras, discover a legacy tailored for your style.
            </p>
          </div>

          {/* Cards */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-10"
          >
            <motion.div
              initial="rest"
              animate="rest"
              whileHover="hover"
              whileFocus="hover"
              variants={cardHover}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                e.currentTarget.style.setProperty("--x", `${x}px`);
                e.currentTarget.style.setProperty("--y", `${y}px`);
              }}
              className="card-shell group relative h-[520px] rounded-3xl overflow-hidden cursor-pointer shadow-[0_20px_50px_rgba(42,5,5,0.18)]"
            >
              <motion.img
                src="/sarees/silk_cotton_checks_saree.jpeg"
                alt="Exquisite Sarees"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: "center 42%" }}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 1.2 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1d0706]/90 via-[#1d0706]/35 to-transparent z-10" />
              <div
                className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition duration-500"
                style={{
                  background:
                    "radial-gradient(circle at var(--x) var(--y), rgba(255, 220, 133, 0.24), rgba(255, 220, 133, 0.08) 26%, rgba(0, 0, 0, 0.12) 52%, transparent 72%)",
                }}
              />
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-end pb-14 px-6 text-center">
                <span className="text-[#f6dfb5]/85 uppercase tracking-[0.2em] text-xs mb-2">
                  Heritage Silk &amp; Zari
                </span>
                <h3
                  className="text-4xl font-bold text-[#fff5dd] mb-6 drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
                  style={styles.sectionTitle}
                >
                  Exquisite Sarees
                </h3>
                <motion.button
                  variants={ctaReveal}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3 rounded-full border border-[#f2d08a]/65 text-[#fff0cf] bg-[rgba(28,10,9,0.35)] backdrop-blur-sm transition-all"
                >
                  Explore Collection
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial="rest"
              animate="rest"
              whileHover="hover"
              whileFocus="hover"
              variants={cardHover}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                e.currentTarget.style.setProperty("--x", `${x}px`);
                e.currentTarget.style.setProperty("--y", `${y}px`);
              }}
              className="card-shell group relative h-[520px] rounded-3xl overflow-hidden cursor-pointer shadow-[0_20px_50px_rgba(42,5,5,0.18)]"
            >
              <motion.img
                src="/blouses/b2.jpeg"
                alt="Designer Blouses"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: "center center" }}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 1.2 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1d0706]/90 via-[#1d0706]/35 to-transparent z-10" />
              <div
                className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition duration-500"
                style={{
                  background:
                    "radial-gradient(circle at var(--x) var(--y), rgba(255, 220, 133, 0.24), rgba(255, 220, 133, 0.08) 26%, rgba(0, 0, 0, 0.12) 52%, transparent 72%)",
                }}
              />
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-end pb-14 px-6 text-center">
                <span className="text-[#f6dfb5]/85 uppercase tracking-[0.2em] text-xs mb-2">
                  Ready-to-Wear Elegance
                </span>
                <h3
                  className="text-4xl font-bold text-[#fff5dd] mb-6 drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
                  style={styles.sectionTitle}
                >
                  Designer Blouses
                </h3>
                <motion.button
                  variants={ctaReveal}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3 rounded-full border border-[#f2d08a]/65 text-[#fff0cf] bg-[rgba(28,10,9,0.35)] backdrop-blur-sm transition-all"
                >
                  Explore Collection
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================= BESTSELLERS ================= */}
      <section className="py-24 bg-[#fffaf3]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <div style={styles.label} className="text-[#c87d1a] mb-3 flex items-center gap-2">
                <Sparkles size={14} /> The Gold Standard
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-[#2a0505]" style={styles.sectionTitle}>
                Our <span className="shimmer italic">Bestsellers</span>
              </h2>
            </div>

            <Link href="/shop" className="group flex items-center gap-3 text-[#6b1a1a] font-bold tracking-widest text-xs uppercase hover:text-[#c87d1a]">
              View All
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestsellers.map((product) => (
              <motion.div
                key={product.title}
                whileHover={{ y: -10, scale: 1.01 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-2xl overflow-hidden border border-[#c87d1a]/15 shadow-[0_10px_26px_rgba(42,5,5,0.08)]"
              >
                <img
                  src={product.img}
                  alt={product.title}
                  className="w-full h-[300px] object-cover"
                />

                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-[#3d0a0a]">
                    {product.title}
                  </h3>
                  <p className="text-xs text-[#5a2a1a]/60 uppercase tracking-widest mb-4">
                    {product.sub}
                  </p>

                  <span className="text-xl font-bold text-[#6b1a1a]">
                    {product.price}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}