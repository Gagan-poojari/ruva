"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Star, Sparkles } from "lucide-react";
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

export default function Categories() {
  const categories = [
    {
      title: "Exquisite Sarees",
      sub: "Heritage Silk & Zari",
      img: "/sarees/silk_cotton_checks_saree.jpeg",
    },
    {
      title: "Designer Blouses",
      sub: "Ready-to-Wear Elegance",
      img: "/blouses/b1.jpeg",
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
      `}</style>

      {/* ================= CATEGORIES ================= */}
      <section className="relative py-28 px-4 overflow-hidden">
        {/* Texture Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/textures/silk.jpg"
            alt="texture"
            className="w-full h-full object-cover opacity-[0.15] mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-[#fdf3e3]/90 backdrop-blur-[2px]" />
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
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                variants={item}
                whileHover="hover"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  e.currentTarget.style.setProperty("--x", `${x}px`);
                  e.currentTarget.style.setProperty("--y", `${y}px`);
                }}
                className="group relative h-[520px] rounded-3xl overflow-hidden cursor-pointer shadow-2xl"
              >
                {/* Image */}
                <motion.img
                  src={cat.img}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  whileHover={{ scale: 1.12 }}
                  transition={{ duration: 1.2 }}
                />

                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2a0505]/90 via-transparent to-transparent z-10" />

                {/* Cursor Glow */}
                <div
                  className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition duration-500"
                  style={{
                    background:
                      "radial-gradient(circle at var(--x) var(--y), rgba(0, 0, 0, 0.35), transparent 60%)",
                  }}
                />

                {/* Shine Sweep */}
                {/* <motion.div
                  className="absolute top-0 left-[-100%] w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent z-20"
                  whileHover={{ left: "100%" }}
                  transition={{ duration: 1 }}
                /> */}

                {/* Content */}
                <motion.div
                  className="absolute inset-0 z-30 flex flex-col items-center justify-end pb-14 px-6 text-center"
                  initial={{ y: 50, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-white/60 uppercase tracking-[0.2em] text-xs mb-2">
                    {cat.sub}
                  </span>

                  <h3
                    className="text-4xl font-bold text-white mb-6"
                    style={styles.sectionTitle}
                  >
                    {cat.title}
                  </h3>

                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 rounded-full border border-white/30 text-white hover:bg-white hover:text-[#3d0a0a] transition-all"
                  >
                    Explore Collection
                  </motion.button>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================= BESTSELLERS (UNCHANGED BUT SMOOTH) ================= */}
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
            {[1, 2, 3, 4].map((item) => (
              <motion.div
                key={item}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl overflow-hidden border border-[#c87d1a]/10"
              >
                <img
                  src={`https://images.unsplash.com/photo-1610030469983-98e550d615ef?q=80&w=600&sig=${item}`}
                  className="w-full h-[300px] object-cover"
                />

                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-[#3d0a0a]">
                    Royal Kanchipuram Silk
                  </h3>
                  <p className="text-xs text-[#5a2a1a]/60 uppercase tracking-widest mb-4">
                    Bridal Heritage
                  </p>

                  <span className="text-xl font-bold text-[#6b1a1a]">
                    ₹14,999
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