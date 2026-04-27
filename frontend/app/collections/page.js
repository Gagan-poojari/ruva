"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function CollectionsPage() {
  const collections = [
    { name: "Banarasi", image: "/collections/banarasi.webp", desc: "Opulent brocades, rich zari, and timeless ceremony drapes." },
    { name: "Kanjivaram", image: "/collections/kanchipuram.jpg", desc: "Pure silk grandeur with bold borders and heritage motifs." },
    { name: "Mysore Silk", image: "/collections/mysore.webp", desc: "Minimal, lustrous elegance — soft sheen and effortless fall." },
    { name: "Patola", image: "/collections/patola.webp", desc: "Double-ikat artistry with geometric storytelling in every thread." },
    { name: "Chanderi", image: "/collections/chanderi.jpg", desc: "Featherlight weaves — glossy, airy, and perfectly festive." },
    { name: "Maheshwari", image: "/collections/maheshwari.webp", desc: "Classic stripes and checks with a refined, breathable finish." },
    { name: "Tant", image: "/collections/tant.avif", desc: "Crisp cotton drapes made for warm days and daily grace." },
    { name: "Khadi", image: "/collections/khadi.webp", desc: "Handspun heritage — earthy textures with quiet luxury." },
    { name: "Organza", image: "/collections/organza.webp", desc: "Sheer, structured silhouettes with a modern couture edge." },
    { name: "Georgette", image: "/collections/georgette.webp", desc: "Fluid drapes and easy movement for effortless glam." },
    { name: "Net", image: "/collections/net.webp", desc: "Statement-ready shimmer and embroidery with a bold finish." },
    { name: "Ruffle", image: "/collections/ruffle.jpg", desc: "Playful volume and runway flair — made to stand out." },
    { name: "Bandhani", image: "/collections/bandhani.webp", desc: "Tie-dye traditions — vibrant dots, festive energy, pure joy." },
    { name: "Paithani", image: "/collections/paithani.avif", desc: "Maharashtrian heirloom weave with iconic peacock pallu." },
    { name: "Leheriya", image: "/collections/lahariya.webp", desc: "Wave-dyed brilliance — lightweight, bright, and celebratory." },
    { name: "Kasavu", image: "/collections/kasavu.jpg", desc: "Kerala’s classic gold border — minimal, radiant, revered." },
    { name: "Sambalpuri", image: "/collections/sambalpuri.webp", desc: "Odisha’s ikat legacy with intricate borders and motifs." },
    { name: "Baluchari", image: "/collections/baluchari.webp", desc: "Storytelling pallus with woven scenes and regal charm." },
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
          background-image:
            repeating-linear-gradient(-52deg, rgba(176,118,32,0.09) 0, rgba(176,118,32,0.09) 1px, transparent 1px, transparent 18px),
            repeating-linear-gradient(38deg, rgba(176,118,32,0.06) 0, rgba(176,118,32,0.06) 1px, transparent 1px, transparent 18px);
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

      <div className="silk-bg min-h-screen">
        {/* ambient glows */}
        <div className="fixed top-0 left-0 w-[340px] h-[340px] rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(201,133,60,0.10)", zIndex: 0 }} />
        <div className="fixed bottom-0 right-0 w-[300px] h-[300px] rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(107,26,26,0.08)", zIndex: 0 }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-20">
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-10">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="h-px w-6 bg-[#6b1a1a]/40" />
              <span className="text-[0.65rem] uppercase tracking-[0.24em] font-bold text-[#6b1a1a]/55" style={{ fontFamily: "var(--font-display)" }}>
                Curated by RUVA
              </span>
            </div>

            <div className="flex items-end justify-between gap-4 flex-wrap">
              <h1 className="text-4xl sm:text-5xl font-bold text-[#2a0505]" style={{ fontFamily: "var(--font-display)" }}>
                Browse our{" "}
                <span className="italic shimmer-gold">Collections</span>
              </h1>
              <Link
                href="/shop"
                className="tag-pill px-4 py-2 bg-white/70 border border-[#c87d1a]/20 text-[#3d0a0a] hover:bg-white transition"
                style={{ boxShadow: "0 4px 20px rgba(42,5,5,0.06)" }}
              >
                Browse our entire collection →
              </Link>
            </div>

            <p className="mt-4 text-sm text-[#5a2a1a]/60 max-w-2xl" style={{ fontFamily: "var(--font-body)" }}>
              These are saree-forward collections. Pick a weave to filter the shop instantly.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((col, idx) => (
              <motion.div key={col.name} custom={idx} variants={fadeUp} initial="hidden" animate="show">
                <Link
                  href={`/shop?category=${encodeURIComponent("Sarees")}&fabric=${encodeURIComponent(col.name)}`}
                  className="group block rounded-3xl overflow-hidden bg-white/70 backdrop-blur-md border border-[#c87d1a]/18"
                  style={{ boxShadow: "0 10px 30px rgba(42,5,5,0.09)" }}
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                    <img
                      src={col.image}
                      alt={col.name}
                      className="w-full h-full object-cover transition-transform duration-1100 group-hover:scale-[1.07]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#140404]/75 via-transparent to-transparent" />
                    <span className="tag-pill absolute top-3 left-3 px-2.5 py-1 bg-[rgba(20,4,4,0.55)] border border-[#f0c97a]/35 text-[#f0c97a] backdrop-blur-md">
                      Collection
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-2xl font-bold text-[#fff5dd]" style={{ fontFamily: "var(--font-display)" }}>
                        {col.name}
                      </h3>
                      <p className="mt-1 text-[0.86rem] text-white/75" style={{ fontFamily: "var(--font-body)" }}>
                        {col.desc}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-2 tag-pill px-3 py-1.5 bg-white/10 border border-[#f0c97a]/35 text-[#ffe8b0] backdrop-blur-md">
                        <Sparkles size={12} />
                        Explore
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
