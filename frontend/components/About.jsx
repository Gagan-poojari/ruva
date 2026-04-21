"use client";

import React from "react";

/**
 * Ruva - About Section
 * Theme: Heritage & Luxury
 * Colors: Deep Mahogany (#3d0a0a), Royal Amber (#d4891e), Warm Cream (#fdf3e3)
 */
export default function About() {
  return (
    <section 
      className="relative w-full overflow-hidden" 
      style={{
        /* Matching the deep, moody vibe of the Hero's base */
        background: "radial-gradient(circle at 50% 0%, #d4891e 0%, #8b4513 35%, #3d0a0a 100%)",
        padding: "120px 0 100px",
      }}
    >
      {/* Subtle Texture Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          opacity: 0.05,
          backgroundImage: "repeating-linear-gradient(-45deg, #fdf3e3 0, #fdf3e3 1px, transparent 0, transparent 50%)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Gold Accent Rule */}
      <div 
        className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none" 
        style={{
          background: "linear-gradient(to right, transparent, #f0c040 50%, transparent)",
          opacity: 0.4,
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* ─── HEADER ─── */}
        <div className="flex flex-col items-center mb-24">
          <div className="flex items-center gap-6 mb-6">
            <span className="block h-px w-20" style={{ background: "linear-gradient(to right, transparent, #f0c040)" }} />
            {/* The Ruva Crest/Star Symbol */}
            <svg width="18" height="18" viewBox="0 0 14 14">
              <path d="M7 0 L8.3 5.2 L7 7 L5.7 5.2 Z" fill="#f0c040"/>
              <path d="M7 14 L8.3 8.8 L7 7 L5.7 8.8 Z" fill="#f0c040"/>
              <path d="M0 7 L5.2 5.7 L7 7 L5.2 8.3 Z" fill="#f0c040"/>
              <path d="M14 7 L8.8 5.7 L7 7 L8.8 8.3 Z" fill="#f0c040"/>
              <circle cx="7" cy="7" r="1.5" fill="#fdf3e3"/>
            </svg>
            <span className="block h-px w-20" style={{ background: "linear-gradient(to left, transparent, #f0c040)" }} />
          </div>

          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2.8rem, 6vw, 4.5rem)", 
            fontWeight: 700,
            lineHeight: 1.1, 
            color: "#fdf3e3", 
            textAlign: "center",
          }}>
            Where Heritage <br />
            <span style={{ fontStyle: "italic", color: "#f0c040", fontWeight: 400 }}>Meets Heirloom.</span>
          </h2>

          <p style={{
            fontFamily: "'Lora', serif", 
            fontSize: "1.1rem",
            lineHeight: 1.9, 
            color: "rgba(253, 243, 227, 0.8)", 
            maxWidth: "620px", 
            textAlign: "center",
            marginTop: "2rem"
          }}>
            Born from a deep reverence for India’s master weavers, we bridge
            centuries-old loom traditions with contemporary sensibilities — so
            that every saree you wear carries a living story.
          </p>
        </div>

        {/* ─── PILLARS ─── */}
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-px mb-20" 
          style={{
            background: "rgba(240, 192, 64, 0.15)",
            border: "1px solid rgba(240, 192, 64, 0.2)",
            borderRadius: "24px", 
            overflow: "hidden",
            backdropFilter: "blur(10px)"
          }}
        >
          {[
            { num: "01", title: "Handpicked at Source", body: "We travel directly to Kanchipuram, Varanasi, and Dharmavaram to select only Grade-A silk — no middlemen, no compromises on craft." },
            { num: "02", title: "Living Craft Traditions", body: "Every saree is woven by artisans who've inherited their craft over generations. Your purchase sustains their families and their art." },
            { num: "03", title: "Yours for a Lifetime", body: "A saree is not a garment — it's an investment in memory. Each piece comes with a heritage certificate and personal care guide." },
          ].map(({ num, title, body }) => (
            <div 
              key={num} 
              className="flex flex-col p-12 transition-colors duration-500 hover:bg-white/5"
              style={{ background: "rgba(61, 10, 10, 0.4)" }}
            >
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "3.8rem", 
                fontWeight: 700,
                color: "rgba(240, 192, 64, 0.12)", 
                lineHeight: 1, 
                marginBottom: "1.5rem",
              }}>{num}</span>
              
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.6rem", 
                fontWeight: 600, 
                color: "#f0c040", 
                marginBottom: "1rem",
              }}>{title}</h3>
              
              <p style={{
                fontFamily: "'Lora', serif", 
                fontSize: "0.95rem",
                lineHeight: 1.8, 
                color: "rgba(253, 243, 227, 0.7)",
              }}>{body}</p>
            </div>
          ))}
        </div>

        {/* ─── STATS ─── */}
        <div 
          className="grid grid-cols-2 md:grid-cols-4 gap-0 rounded-2xl overflow-hidden shadow-2xl"
          style={{ border: "1px solid rgba(240, 192, 64, 0.2)" }}
        >
          {[
            { n: "1947", label: "Year Founded" },
            { n: "300+", label: "Weaver Families" },
            { n: "10k+", label: "Happy Brides" },
            { n: "4.9★", label: "Average Rating" },
          ].map(({ n, label }, i) => (
            <div 
              key={label} 
              className="flex flex-col items-center justify-center py-12 px-4 text-center"
              style={{
                borderRight: i < 3 ? "1px solid rgba(240, 192, 64, 0.1)" : "none",
                background: i % 2 === 0 ? "rgba(240, 192, 64, 0.03)" : "rgba(255, 255, 255, 0.02)",
              }}
            >
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "3rem", 
                fontWeight: 700, 
                color: "#fdf3e3",
                lineHeight: 1, 
                display: "block", 
                marginBottom: "0.6rem",
              }}>{n}</span>
              
              <span style={{
                fontSize: "0.7rem", 
                letterSpacing: "0.2em",
                textTransform: "uppercase", 
                color: "#f0c040",
                fontFamily: "'Lora', serif",
                fontWeight: 500
              }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}