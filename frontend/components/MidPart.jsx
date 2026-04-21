"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Star, Sparkles } from "lucide-react";

/* ─── Shared Styles & Animation ────────────────────────────── */
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
  }
};

export default function MidPart() {
  return (
    <>
      <style>{`
        @keyframes subtleZoom {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }
        
        .category-card:hover img {
          animation: subtleZoom 10s linear infinite alternate;
        }

        .product-card {
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease;
        }
        
        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(61, 10, 10, 0.08);
        }

        .quick-add-btn {
          background: rgba(61, 10, 10, 0.9);
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(10px);
        }

        .product-card:hover .quick-add-btn {
          opacity: 1;
          transform: translateY(0);
        }

        .gold-gradient-text {
          background: linear-gradient(135deg, #3d0a0a 0%, #c87d1a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* ════════ CATEGORIES ════════ */}
      <section className="py-24 px-4 bg-[#fdf3e3]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4 opacity-70">
              <span className="h-px w-8 bg-[#6b1a1a]" />
              <span style={styles.label} className="text-[#6b1a1a]">Curated Collections</span>
              <span className="h-px w-8 bg-[#6b1a1a]" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-[#2a0505] mb-6" style={styles.sectionTitle}>
              Shop by <span className="italic">Category</span>
            </h2>
            <p className="max-w-xl mx-auto text-[#5a2a1a]/70" style={styles.body}>
              From the heavy silks of Kanchipuram to the ethereal drapes of Banaras, 
              discover a legacy tailored for your style.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              { 
                title: "Exquisite Sarees", 
                sub: "Heritage Silk & Zari",
                img: "https://images.unsplash.com/photo-1583391733958-692b1baecd11?q=80&w=1200" 
              },
              { 
                title: "Designer Blouses", 
                sub: "Ready-to-Wear Elegance",
                img: "https://images.unsplash.com/photo-1623091410901-00e2d268901e?q=80&w=1200" 
              },
            ].map((cat, i) => (
              <div key={i} className="category-card group relative h-[500px] rounded-3xl overflow-hidden cursor-pointer shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-[#2a0505]/90 via-transparent to-transparent z-10 transition-opacity group-hover:opacity-80" />
                <img 
                  src={cat.img} 
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s]" 
                />
                
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-12 px-6">
                  <span style={styles.label} className="text-white/60 mb-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    {cat.sub}
                  </span>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-6" style={styles.sectionTitle}>
                    {cat.title}
                  </h3>
                  <button className="px-8 py-3 rounded-full border border-white/30 text-white text-sm font-medium backdrop-blur-sm hover:bg-white hover:text-[#3d0a0a] transition-all">
                    Explore Collection
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ BESTSELLERS ════════ */}
      <section className="py-24 bg-[#fffaf3] relative overflow-hidden">
        {/* Subtle decorative element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c87d1a]/5 rounded-full blur-[100px] -mr-48 -mt-48" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <div style={styles.label} className="text-[#c87d1a] mb-3 flex items-center gap-2">
                <Sparkles size={14} /> The Gold Standard
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#2a0505]" style={styles.sectionTitle}>
                Our <span className="italic-shimmer">Bestsellers</span>
              </h2>
            </div>
            <Link href="/shop" className="group flex items-center gap-3 text-[#6b1a1a] font-bold tracking-widest text-xs uppercase transition-colors hover:text-[#c87d1a]">
              View All Masterpieces 
              <span className="p-2 rounded-full border border-[#6b1a1a]/20 group-hover:border-[#c87d1a]/40 group-hover:translate-x-1 transition-all">
                <ArrowRight size={14} />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="product-card group bg-white rounded-2xl overflow-hidden border border-[#c87d1a]/10">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <div className="absolute top-4 left-4 z-10 bg-[#3d0a0a] text-[#fdf3e3] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter">
                    Highly Coveted
                  </div>
                  <img 
                    src={`https://images.unsplash.com/photo-1610030469983-98e550d615ef?q=80&w=600&sig=${item}`}
                    alt="Saree" 
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" 
                  />
                  
                  <div className="absolute inset-x-0 bottom-0 p-4 z-20">
                    <button className="quick-add-btn w-full text-white py-4 flex justify-center items-center gap-2 rounded-xl text-sm font-semibold">
                      <ShoppingBag size={16} /> Quick Add to Bag
                    </button>
                  </div>
                </div>

                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-[#3d0a0a] mb-1" style={styles.sectionTitle}>
                    Royal Kanchipuram Silk
                  </h3>
                  <p className="text-xs text-[#5a2a1a]/60 uppercase tracking-widest mb-4" style={styles.body}>
                    Bridal Heritage
                  </p>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-[#6b1a1a]">₹14,999</span>
                      <span className="text-sm text-[#5a2a1a]/40 line-through">₹18,999</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#d4a017]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" />
                      ))}
                      <span className="text-[10px] text-[#3d0a0a]/60 ml-1 font-bold">(4.9)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}