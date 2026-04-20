"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";

const SareeModel3D = dynamic(() => import("./SareeModel3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div style={{
        width: "2px",
        height: "60%",
        background: "linear-gradient(to bottom, transparent, rgba(212,160,23,0.6), transparent)",
        animation: "pulse 1.6s ease-in-out infinite",
      }}/>
    </div>
  ),
});

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  const fadeOut = Math.max(0, 1 - scrollY / 500);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');

        @keyframes heroFadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse {
          0%,100% { opacity:0.2; } 50% { opacity:1; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .gold-shimmer {
          background: linear-gradient(90deg, #b8860b, #f7d96a, #d4a017, #f7d96a, #b8860b);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .h1 { animation: heroFadeUp 1s cubic-bezier(.22,1,.36,1) .05s both; }
        .h2 { animation: heroFadeUp 1s cubic-bezier(.22,1,.36,1) .18s both; }
        .h3 { animation: heroFadeUp 1s cubic-bezier(.22,1,.36,1) .30s both; }
        .h4 { animation: heroFadeUp 1s cubic-bezier(.22,1,.36,1) .42s both; }
        .h5 { animation: heroFadeUp 1s cubic-bezier(.22,1,.36,1) .55s both; }
        .h6 { animation: heroFadeUp 1s cubic-bezier(.22,1,.36,1) .68s both; }
        .hcanvas { animation: heroFadeUp 1.1s cubic-bezier(.22,1,.36,1) .22s both; }
      `}</style>

      {/* ════════════ HERO ════════════ */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "100svh" }}>

        {/* BG */}
        <div className="absolute inset-0 z-0" style={{
          background: "radial-gradient(ellipse 100% 90% at 50% 30%, #1c0628 0%, #090011 55%, #000 100%)",
        }}/>

        {/* Brocade SVG */}
        <svg className="absolute inset-0 w-full h-full z-0" style={{ opacity: 0.065 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="brocade" x="0" y="0" width="44" height="44" patternUnits="userSpaceOnUse">
              <path d="M22 3 L25.5 12 L22 21 L18.5 12 Z" fill="#d4a017"/>
              <path d="M3 22 L12 18.5 L21 22 L12 25.5 Z" fill="#d4a017"/>
              <path d="M23 22 L32 18.5 L41 22 L32 25.5 Z" fill="#d4a017"/>
              <path d="M22 23 L25.5 32 L22 41 L18.5 32 Z" fill="#d4a017"/>
              <circle cx="22" cy="22" r="2" fill="#d4a017" opacity="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#brocade)"/>
        </svg>

        {/* Center glow */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 55% 60% at 50% 52%, rgba(139,26,74,0.25) 0%, rgba(212,160,23,0.07) 45%, transparent 70%)",
        }}/>

        {/* ── Main content — stacked center ── */}
        <div
          className="relative z-20 flex flex-col items-center justify-center text-center px-4"
          style={{ minHeight: "100svh", paddingTop: "88px", paddingBottom: "48px", opacity: fadeOut }}
        >

          {/* Eyebrow */}
          <div className="h1 flex items-center gap-3 mb-5">
            <span className="block h-px w-12" style={{ background: "linear-gradient(to right,transparent,#d4a017)" }}/>
            <span style={{
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "0.66rem", letterSpacing: "0.3em",
              textTransform: "uppercase", color: "#c9a84c", fontWeight: 600,
            }}>The Wedding Collection 2026</span>
            <span className="block h-px w-12" style={{ background: "linear-gradient(to left,transparent,#d4a017)" }}/>
          </div>

          {/* Headline */}
          <h1 className="h2" style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: "clamp(3rem,6.5vw,5.6rem)",
            fontWeight: 700, lineHeight: 1.07,
            color: "#fff", letterSpacing: "-0.01em",
            marginBottom: "0.2rem",
          }}>
            Elegance{" "}
            <span className="gold-shimmer" style={{ fontStyle:"italic" }}>Woven</span>
            <br/>In Every Thread
          </h1>

          {/* ── 3D Canvas — centre piece ── */}
          <div className="hcanvas relative" style={{
            width: "min(440px, 86vw)",
            height: "min(480px, 50vh)",
            flexShrink: 0,
            margin: "0 auto",
          }}>
            {/* Ellipse halos */}
            {[68, 84, 100].map((pct, i) => (
              <div key={i} className="absolute rounded-full pointer-events-none" style={{
                width: `${pct}%`, paddingBottom: `${pct * 0.32}%`,
                bottom: "5%", left: "50%", transform: "translateX(-50%)",
                border: `1px solid rgba(212,160,23,${0.22 - i*0.06})`,
              }}/>
            ))}
            {/* Spin ring */}
            <div className="absolute pointer-events-none" style={{
              width: "74%", paddingBottom: "74%",
              bottom: "1%", left: "50%", transform: "translateX(-50%)",
              animation: "spin-slow 22s linear infinite",
            }}>
              <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" style={{ opacity: 0.2 }}>
                <circle cx="100" cy="100" r="96" fill="none" stroke="#d4a017" strokeWidth="0.6" strokeDasharray="5 9"/>
                {/* {Array.from({length:12}).map((_,i)=>{
                  const a=(i/12)*Math.PI*2;
                  return <circle key={i} cx={100+96*Math.cos(a)} cy={100+96*Math.sin(a)} r="2.8" fill="#d4a017"/>;
                })} */}
                {Array.from({ length: 12 }).map((_, i) => {
  const a = (i / 12) * Math.PI * 2;

  const x = Number((100 + 96 * Math.cos(a)).toFixed(3));
  const y = Number((100 + 96 * Math.sin(a)).toFixed(3));

  return (
    <circle key={i} cx={x} cy={y} r="2.8" fill="#d4a017" />
  );
})}
              </svg>
            </div>
            {/* Ground shadow glow */}
            <div className="absolute pointer-events-none" style={{
              bottom:"3%", left:"50%", transform:"translateX(-50%)",
              width:"50%", height:"20px",
              background:"radial-gradient(ellipse at center,rgba(212,160,23,0.4) 0%,transparent 70%)",
              filter:"blur(10px)",
            }}/>

            {<SareeModel3D scrollY={scrollY}/>}
          </div>

          {/* Sub copy */}
          <p className="h3" style={{
            fontFamily: "'Lora',Georgia,serif",
            fontSize: "clamp(0.9rem,1.7vw,1.05rem)",
            color: "rgba(255,255,255,0.58)", lineHeight: 1.75,
            maxWidth: "440px", marginBottom: "2rem",
          }}>
            Exclusive Kanchipuram, Banarasi &amp; designer sarees,<br/>
            handcrafted for your most precious moments.
          </p>

          {/* CTAs */}
          <div className="h4 flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link href="/shop"
              className="group flex items-center justify-center gap-2 px-9 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
              style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                background: "linear-gradient(135deg,#c9a84c 0%,#f5e07a 50%,#c9a84c 100%)",
                backgroundSize: "200% auto",
                color: "#1a0808", fontSize: "1.02rem", letterSpacing: "0.06em",
                boxShadow: "0 0 40px rgba(212,160,23,0.28), 0 4px 20px rgba(0,0,0,0.35)",
              }}
            >
              Shop New Arrivals
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
            <Link href="/collections"
              className="flex items-center justify-center gap-2 px-9 py-4 rounded-full font-medium transition-all duration-300 hover:bg-white/10"
              style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                border: "1px solid rgba(212,160,23,0.38)",
                color: "rgba(255,255,255,0.82)", fontSize: "1.02rem", letterSpacing: "0.06em",
                backdropFilter: "blur(8px)",
              }}
            >
              View Lookbook
            </Link>
          </div>

          {/* Trust */}
          <div className="h5 flex items-center gap-6" style={{ opacity: 0.45 }}>
            {["10k+ Happy Brides","100% Pure Silk","Free Shipping"].map(t=>(
              <div key={t} className="flex items-center gap-1.5" style={{
                color: "#c9a84c", fontSize: "0.63rem",
                letterSpacing: "0.16em", textTransform: "uppercase",
                fontFamily: "'Cormorant Garamond',Georgia,serif",
              }}>
                <span style={{ fontSize:"0.45rem" }}>✦</span> {t}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll line */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5"
          style={{ animation: "heroFadeUp 1s ease 1.4s both" }}>
          <span style={{
            color:"rgba(212,160,23,0.38)", fontSize:"0.56rem",
            letterSpacing:"0.22em", textTransform:"uppercase",
            fontFamily:"'Cormorant Garamond',Georgia,serif",
          }}>Scroll to explore</span>
          <div style={{ width:"1px", height:"28px", background:"linear-gradient(to bottom,rgba(212,160,23,0.35),transparent)" }}/>
        </div>
      </section>

      {/* ════════════ ABOUT ════════════ */}
      <section className="relative w-full overflow-hidden" style={{
        background: "linear-gradient(170deg,#fdf7f0 0%,#fff9f4 50%,#fdf2e8 100%)",
        padding: "110px 0 100px",
      }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          opacity: 0.025,
          backgroundImage: "repeating-linear-gradient(-45deg,#8b1a4a 0,#8b1a4a 1px,transparent 0,transparent 50%)",
          backgroundSize: "28px 28px",
        }}/>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-20">
            <div className="flex items-center gap-4 mb-5">
              <span className="block h-px w-16" style={{ background:"linear-gradient(to right,transparent,#d4a017)" }}/>
              <svg width="11" height="11" viewBox="0 0 11 11"><path d="M5.5 0 L6.8 4.2 L11 5.5 L6.8 6.8 L5.5 11 L4.2 6.8 L0 5.5 L4.2 4.2 Z" fill="#d4a017"/></svg>
              <span className="block h-px w-16" style={{ background:"linear-gradient(to left,transparent,#d4a017)" }}/>
            </div>
            <h2 style={{
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"clamp(2.4rem,5vw,4rem)", fontWeight:700,
              lineHeight:1.1, color:"#1a0808", textAlign:"center", marginBottom:"0.3rem",
            }}>Where Heritage</h2>
            <h2 style={{
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"clamp(2.4rem,5vw,4rem)", fontWeight:700,
              lineHeight:1.1, fontStyle:"italic", color:"#8b1a4a",
              textAlign:"center", marginBottom:"1.6rem",
            }}>Meets Heirloom.</h2>
            <p style={{
              fontFamily:"'Lora',Georgia,serif", fontSize:"1.05rem",
              lineHeight:1.85, color:"#6a3a3a", maxWidth:"580px", textAlign:"center",
            }}>
              Born from a deep reverence for India's master weavers, we bridge
              centuries-old loom traditions with contemporary sensibilities — so
              that every saree you wear carries a living story.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px mb-20" style={{
            background:"rgba(212,160,23,0.15)",
            border:"1px solid rgba(212,160,23,0.15)",
            borderRadius:"20px", overflow:"hidden",
          }}>
            {[
              { num:"01", title:"Handpicked at Source", body:"We travel directly to Kanchipuram, Varanasi, and Dharmavaram to select only Grade-A silk — no middlemen, no compromises on craft." },
              { num:"02", title:"Living Craft Traditions", body:"Every saree is woven by artisans who've inherited their craft over generations. Your purchase sustains their families and their art." },
              { num:"03", title:"Yours for a Lifetime", body:"A saree is not a garment — it's an investment in memory. Each piece comes with a heritage certificate and personal care guide." },
            ].map(({ num, title, body }) => (
              <div key={num} className="flex flex-col p-10"
                style={{ background:"linear-gradient(135deg,#fffaf5 0%,#fff6ee 100%)" }}>
                <span style={{
                  fontFamily:"'Cormorant Garamond',Georgia,serif",
                  fontSize:"3.5rem", fontWeight:700,
                  color:"rgba(212,160,23,0.14)", lineHeight:1, marginBottom:"1.2rem",
                }}>{num}</span>
                <h3 style={{
                  fontFamily:"'Cormorant Garamond',Georgia,serif",
                  fontSize:"1.4rem", fontWeight:700, color:"#1a0808", marginBottom:"0.8rem",
                }}>{title}</h3>
                <p style={{
                  fontFamily:"'Lora',Georgia,serif", fontSize:"0.9rem",
                  lineHeight:1.82, color:"#6a3a3a",
                }}>{body}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 rounded-2xl overflow-hidden"
            style={{ border:"1px solid rgba(212,160,23,0.2)" }}>
            {[
              { n:"1947", label:"Year Founded" },
              { n:"300+", label:"Weaver Families" },
              { n:"10k+", label:"Happy Brides" },
              { n:"4.9★", label:"Average Rating" },
            ].map(({ n, label }, i) => (
              <div key={label} className="flex flex-col items-center justify-center py-10 px-4 text-center"
                style={{
                  borderRight: i<3 ? "1px solid rgba(212,160,23,0.14)" : "none",
                  background: i%2===0 ? "rgba(139,26,74,0.03)" : "rgba(212,160,23,0.03)",
                }}>
                <span style={{
                  fontFamily:"'Cormorant Garamond',Georgia,serif",
                  fontSize:"2.8rem", fontWeight:700, color:"#8b1a4a",
                  lineHeight:1, display:"block", marginBottom:"0.5rem",
                }}>{n}</span>
                <span style={{
                  fontSize:"0.64rem", letterSpacing:"0.18em",
                  textTransform:"uppercase", color:"#9a6060",
                  fontFamily:"'Lora',Georgia,serif",
                }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}