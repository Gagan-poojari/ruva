"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Collections() {
  const styles = {
    label: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      textTransform: "uppercase",
      letterSpacing: "0.22em",
      fontSize: "0.7rem",
      fontWeight: 700,
    },
  };

  const preview = [
    { name: "Banarasi", image: "/collections/banarasi.webp" },
    { name: "Kanjivaram", image: "/collections/kanchipuram.jpg" },
    { name: "Mysore Silk", image: "/collections/mysore.webp" },
    { name: "Patola", image: "/collections/patola.webp" },
    { name: "Chanderi", image: "/collections/chanderi.jpg" },
    { name: "Bandhani", image: "/collections/bandhani.webp" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lora:ital,wght@0,400;1,400&display=swap');
        :root {
          --font-display: 'Cormorant Garamond', Georgia, serif;
          --font-body: 'Lora', Georgia, serif;
          --gold-1: #c9853c;
          --gold-2: #f0c97a;
          --gold-3: #ffe8b0;
          --maroon: #6b1a1a;
          --dark: #2a0505;
        }
        .silk-bg {
          background-color: #fdf8f0;
          // background-image:
          //   repeating-linear-gradient(-52deg, rgba(176,118,32,0.08) 0, rgba(176,118,32,0.08) 1px, transparent 1px, transparent 18px),
          //   repeating-linear-gradient(38deg, rgba(176,118,32,0.05) 0, rgba(176,118,32,0.05) 1px, transparent 1px, transparent 18px);
        }
        .tag-pill {
          font-family: var(--font-display);
          font-size: 0.58rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          border-radius: 999px;
          font-weight: 700;
          display: inline-block;
        }
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
      `}</style>

      <section id="collections" className="silk-bg relative overflow-hidden py-20">
        {/* ambient glows */}
        {/* <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(201,133,60,0.12)" }} /> */}
        {/* <div className="absolute -bottom-32 -right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(107,26,26,0.09)" }} /> */}

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-10">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="h-px w-6 bg-[#6b1a1a]/40" />
              <span className="text-[0.65rem] uppercase tracking-[0.24em] font-bold text-[#6b1a1a]/55" style={{ fontFamily: "var(--font-display)" }}>
                Signature Weaves
              </span>
            </div>

            <div className="flex items-end justify-between gap-4 flex-wrap">
              <h2 className="text-4xl sm:text-5xl font-bold text-[#2a0505]" style={{ fontFamily: "var(--font-display)" }}>
                Our{" "}
                <span className="italic shimmer-gold">Collections</span>
              </h2>
              <Link
                href="/collections"
                className="flex items-center gap-2 text-[0.65rem] font-bold tracking-widest uppercase text-[#6b1a1a] hover:text-[#c87d1a] transition-colors shrink-0"
                style={styles.label}
              >
                View All
                <ArrowRight size={12} />
              </Link>
            </div>

            <p className="mt-4 text-sm text-[#5a2a1a]/60 max-w-2xl" style={{ fontFamily: "var(--font-body)" }}>
              A quick preview of our most-loved weaves — tap a collection to filter the shop instantly.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {preview.map((c, i) => (
              <motion.div key={c.name} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <Link
                  href={`/shop?category=${encodeURIComponent("Sarees")}&fabric=${encodeURIComponent(c.name)}`}
                  className="group block rounded-2xl overflow-hidden bg-white/70 border border-[#c87d1a]/18"
                  style={{ boxShadow: "0 10px 26px rgba(42,5,5,0.08)" }}
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover transition-transform duration-1100 group-hover:scale-[1.07]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#140404]/75 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="inline-flex items-center gap-2 tag-pill px-2.5 py-1 bg-[rgba(20,4,4,0.55)] border border-[#f0c97a]/35 text-[#ffe8b0] backdrop-blur-md">
                        <Sparkles size={12} />
                        {c.name}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

