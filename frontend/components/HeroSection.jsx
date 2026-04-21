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
        width: "2px", height: "60%",
        background: "linear-gradient(to bottom, transparent, rgba(107,26,26,0.6), transparent)",
        animation: "pulse 1.6s ease-in-out infinite",
      }} />
    </div>
  ),
});

/* ─── Brand palette extracted from logo ───────────────────────
   Saffron-amber bg:  #c87d1a  #d4891e  #e09830
   Deep maroon mark:  #3d0a0a  #6b1a1a  #7a1f1f
   Warm ivory light:  #fdf3e3  #fef8f0
   Gold highlight:    #d4a017  #f0c040
──────────────────────────────────────────────────────────────*/

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const fadeOut = Math.max(0, 1 - scrollY / 500);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');

        @keyframes heroFadeUp {
          from { opacity:0; transform:translateY(26px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse { 0%,100%{opacity:.2} 50%{opacity:1} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes spin-rev  { from{transform:rotate(360deg)} to{transform:rotate(0deg)} }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        /* Italic maroon shimmer — logo wordmark feel */
        .italic-shimmer {
          background: linear-gradient(90deg,#5a0f0f,#c0503a,#7a1f1f,#c0503a,#5a0f0f);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
          font-style: italic;
        }

        .h1  { animation: heroFadeUp 1s cubic-bezier(.22,1,.36,1) .05s both; }
        .h2  { animation: heroFadeUp 1s cubic-bezier(.22,1,.36,1) .18s both; }
        .h3  { animation: heroFadeUp 1s cubic-bezier(.22,1,.36,1) .30s both; }
        .h4  { animation: heroFadeUp 1s cubic-bezier(.22,1,.36,1) .42s both; }
        .h5  { animation: heroFadeUp 1s cubic-bezier(.22,1,.36,1) .55s both; }
        .hc  { animation: heroFadeUp 1.1s cubic-bezier(.22,1,.36,1) .22s both; }

        .cta-primary {
          background: linear-gradient(135deg, #3d0a0a 0%, #7a1f1f 50%, #3d0a0a 100%);
          background-size: 200% auto;
          color: #fdf3e3;
          box-shadow: 0 0 36px rgba(61,10,10,0.32), 0 4px 18px rgba(0,0,0,0.18);
          transition: background-position .4s, box-shadow .3s, transform .25s;
        }
        .cta-primary:hover {
          background-position: right center;
          box-shadow: 0 0 52px rgba(61,10,10,0.5), 0 6px 24px rgba(0,0,0,0.22);
          transform: scale(1.04);
        }
        .cta-secondary {
          border: 1.5px solid rgba(61,10,10,0.32);
          color: #3d0a0a;
          transition: background .3s, border-color .3s;
        }
        .cta-secondary:hover {
          background: rgba(61,10,10,0.07);
          border-color: rgba(61,10,10,0.55);
        }
      `}</style>

      {/* ════════ HERO ════════ */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "100svh" }}>

        {/* Saffron-to-deep-amber radial bg — exactly the logo's background hue */}
        <div className="absolute inset-0 z-0" style={{
          background: `radial-gradient(
            ellipse 120% 90% at 50% 15%,
            #f0a830 0%,
            #d4891e 28%,
            #b06010 55%,
            #6b2e04 78%,
            #3a1000 100%
          )`,
        }} />

        {/* Mandala tile brocade — references the logo's petal geometry */}
        <svg className="absolute inset-0 w-full h-full z-0" style={{ opacity: 0.08 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mp" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
              {/* vertical teardrop petal top */}
              <path d="M32 6  L34.5 18 L32 25 L29.5 18 Z" fill="#3d0a0a"/>
              {/* vertical teardrop petal bottom */}
              <path d="M32 39 L34.5 46 L32 58 L29.5 46 Z" fill="#3d0a0a"/>
              {/* horizontal petals */}
              <path d="M6 32  L18 29.5 L25 32 L18 34.5 Z" fill="#3d0a0a"/>
              <path d="M39 32 L46 29.5 L58 32 L46 34.5 Z" fill="#3d0a0a"/>
              {/* centre diamond */}
              <path d="M32 26 L36 32 L32 38 L28 32 Z" fill="#3d0a0a" opacity="0.9"/>
              {/* inner dots */}
              <circle cx="32" cy="32" r="2.2" fill="#3d0a0a" opacity="0.6"/>
              {/* diagonal small diamonds */}
              <path d="M17 17 L19 21 L17 25 L15 21 Z" fill="#3d0a0a" opacity="0.35"/>
              <path d="M47 17 L49 21 L47 25 L45 21 Z" fill="#3d0a0a" opacity="0.35"/>
              <path d="M17 39 L19 43 L17 47 L15 43 Z" fill="#3d0a0a" opacity="0.35"/>
              <path d="M47 39 L49 43 L47 47 L45 43 Z" fill="#3d0a0a" opacity="0.35"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mp)"/>
        </svg>

        {/* Radial vignette — darken edges so model pops */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 72% 68% at 50% 50%,
            transparent 38%, rgba(40,8,0,0.6) 100%)`,
        }}/>

        {/* Warm glow behind model */}
        <div className="absolute z-0 pointer-events-none" style={{
          width:"58vw", height:"62vh",
          left:"50%", top:"52%",
          transform:"translate(-50%,-50%)",
          background:"radial-gradient(ellipse at center,rgba(255,200,80,0.16) 0%,rgba(180,90,10,0.07) 45%,transparent 70%)",
          filter:"blur(28px)",
        }}/>

        {/* ── Main content ── */}
        <div
          className="relative z-20 flex flex-col items-center justify-center text-center px-4"
          style={{ minHeight:"100svh", paddingTop:"88px", paddingBottom:"48px", opacity: fadeOut }}
        >

          {/* Eyebrow */}
          <div className="h1 flex items-center gap-3 mb-5">
            <span className="block h-px w-12" style={{ background:"linear-gradient(to right,transparent,rgba(61,10,10,0.55))" }}/>
            <span style={{
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"0.66rem", letterSpacing:"0.3em",
              textTransform:"uppercase", color:"#3d0a0a",
              fontWeight:700, opacity:0.72,
            }}>The Wedding Collection 2026</span>
            <span className="block h-px w-12" style={{ background:"linear-gradient(to left,transparent,rgba(61,10,10,0.55))" }}/>
          </div>

          {/* Headline */}
          <h1 className="h2" style={{
            fontFamily:"'Cormorant Garamond',Georgia,serif",
            fontSize:"clamp(3rem,6.5vw,5.6rem)",
            fontWeight:700, lineHeight:1.07,
            color:"#2a0505",
            letterSpacing:"-0.01em",
          }}>
            Elegance{" "}
            <span className="italic-shimmer">Woven</span>
            <br/>In Every Thread
          </h1>

          {/* 3D Canvas */}
          <div className="hc relative" style={{
            width:"min(600px,100vw)", height:"min(600px,100vh)",
            flexShrink:0, margin:"0 auto",
          }}>
            {/* Halo ellipses */}
            {[68,84,100].map((pct,i) => (
              <div key={i} className="absolute rounded-full pointer-events-none" style={{
                width:`${pct}%`, paddingBottom:`${pct*.32}%`,
                bottom:"5%", left:"50%", transform:"translateX(-50%)",
                border:`1px solid rgba(61,10,10,${0.28-i*.08})`,
              }}/>
            ))}

            {/* Outer spin ring */}
            <div className="absolute pointer-events-none" style={{
              width:"74%", paddingBottom:"74%",
              bottom:"1%", left:"50%", transform:"translateX(-50%)",
              animation:"spin-slow 22s linear infinite",
            }}>
              <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" style={{ opacity:0.22 }}>
                <circle cx="100" cy="100" r="96" fill="none" stroke="#3d0a0a" strokeWidth="0.7" strokeDasharray="5 9"/>
                {Array.from({length:12}).map((_,i) => {
                  const a=(i/12)*Math.PI*2;
                  return <circle key={i} cx={+(100+96*Math.cos(a)).toFixed(2)} cy={+(100+96*Math.sin(a)).toFixed(2)} r="3" fill="#3d0a0a"/>;
                })}
              </svg>
            </div>

            {/* Inner counter-spin (logo mandala echo) */}
            <div className="absolute pointer-events-none" style={{
              width:"50%", paddingBottom:"50%",
              bottom:"10%", left:"50%", transform:"translateX(-50%)",
              animation:"spin-rev 34s linear infinite",
            }}>
              <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" style={{ opacity:0.13 }}>
                <circle cx="100" cy="100" r="90" fill="none" stroke="#6b1a1a" strokeWidth="0.5" strokeDasharray="3 12"/>
                {Array.from({length:8}).map((_,i) => {
                  const a=(i/8)*Math.PI*2;
                  const x=+(100+90*Math.cos(a)).toFixed(2);
                  const y=+(100+90*Math.sin(a)).toFixed(2);
                  const nx=+(Math.cos(a)*5).toFixed(2);
                  const ny=+(Math.sin(a)*5).toFixed(2);
                  return <path key={i} d={`M${x} ${y} L${x+ny} ${y-nx} L${x-nx*.5} ${y-ny*.5} L${x-ny} ${y+nx} Z`} fill="#6b1a1a"/>;
                })}
              </svg>
            </div>

            {/* Ground glow */}
            <div className="absolute pointer-events-none" style={{
              bottom:"3%", left:"50%", transform:"translateX(-50%)",
              width:"50%", height:"20px",
              background:"radial-gradient(ellipse at center,rgba(61,10,10,0.4) 0%,transparent 70%)",
              filter:"blur(10px)",
            }}/>

            {mounted && <SareeModel3D scrollY={scrollY} />}
          </div>

          {/* Sub copy */}
          <p className="h3" style={{
            fontFamily:"'Lora',Georgia,serif",
            fontSize:"clamp(0.9rem,1.7vw,1.05rem)",
            color:"rgba(42,5,5,0.68)", lineHeight:1.75,
            maxWidth:"440px", marginBottom:"2rem",
          }}>
            Exclusive Kanchipuram, Banarasi &amp; designer sarees,<br/>
            handcrafted for your most precious moments.
          </p>

          {/* CTAs */}
          <div className="h4 flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link href="/shop"
              className="cta-primary group flex items-center justify-center gap-2 px-9 py-4 rounded-full font-semibold"
              style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"1.02rem", letterSpacing:"0.06em" }}
            >
              Shop New Arrivals
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
            <Link href="/collections"
              className="cta-secondary flex items-center justify-center gap-2 px-9 py-4 rounded-full font-medium"
              style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"1.02rem", letterSpacing:"0.06em" }}
            >
              View Lookbook
            </Link>
          </div>

          {/* Trust bar */}
          <div className="h5 flex items-center gap-6" style={{ opacity:0.55 }}>
            {["10k+ Happy Brides","100% Pure Silk","Free Shipping"].map(t => (
              <div key={t} className="flex items-center gap-1.5" style={{
                color:"#3d0a0a", fontSize:"0.63rem",
                letterSpacing:"0.16em", textTransform:"uppercase",
                fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:600,
              }}>
                <span style={{ fontSize:"0.45rem" }}>✦</span> {t}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll line */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5"
          style={{ animation:"heroFadeUp 1s ease 1.4s both" }}>
          <span style={{
            color:"rgba(61,10,10,0.4)", fontSize:"0.56rem",
            letterSpacing:"0.22em", textTransform:"uppercase",
            fontFamily:"'Cormorant Garamond',Georgia,serif",
          }}>Scroll to explore</span>
          <div style={{ width:"1px", height:"28px", background:"linear-gradient(to bottom,rgba(61,10,10,0.4),transparent)" }}/>
        </div>
      </section>

      {/* ════════ ABOUT ════════ */}
      <section className="relative w-full overflow-hidden" style={{
        background:"linear-gradient(170deg,#fdf3e3 0%,#fef8f0 50%,#fdf0e0 100%)",
        padding:"110px 0 100px",
      }}>
        {/* Faint hatch */}
        <div className="absolute inset-0 pointer-events-none" style={{
          opacity:0.028,
          backgroundImage:"repeating-linear-gradient(-45deg,#6b1a1a 0,#6b1a1a 1px,transparent 0,transparent 50%)",
          backgroundSize:"28px 28px",
        }}/>

        {/* Amber top rule */}
        <div className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none" style={{
          background:"linear-gradient(to right,transparent,#c87d1a 30%,#e09830 50%,#c87d1a 70%,transparent)",
          opacity:0.65,
        }}/>

        <div className="max-w-6xl mx-auto px-6 relative z-10">

          {/* Header */}
          <div className="flex flex-col items-center mb-20">
            <div className="flex items-center gap-4 mb-5">
              <span className="block h-px w-16" style={{ background:"linear-gradient(to right,transparent,#c87d1a)" }}/>
              {/* Mini logo star */}
              <svg width="14" height="14" viewBox="0 0 14 14">
                <path d="M7 0 L8.3 5.2 L7 7 L5.7 5.2 Z" fill="#6b1a1a"/>
                <path d="M7 14 L8.3 8.8 L7 7 L5.7 8.8 Z" fill="#6b1a1a"/>
                <path d="M0 7 L5.2 5.7 L7 7 L5.2 8.3 Z" fill="#6b1a1a"/>
                <path d="M14 7 L8.8 5.7 L7 7 L8.8 8.3 Z" fill="#6b1a1a"/>
                <circle cx="7" cy="7" r="1.5" fill="#6b1a1a"/>
              </svg>
              <span className="block h-px w-16" style={{ background:"linear-gradient(to left,transparent,#c87d1a)" }}/>
            </div>
            <h2 style={{
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"clamp(2.4rem,5vw,4rem)", fontWeight:700,
              lineHeight:1.1, color:"#1a0505", textAlign:"center", marginBottom:"0.3rem",
            }}>Where Heritage</h2>
            <h2 style={{
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontSize:"clamp(2.4rem,5vw,4rem)", fontWeight:700,
              lineHeight:1.1, fontStyle:"italic", color:"#6b1a1a",
              textAlign:"center", marginBottom:"1.6rem",
            }}>Meets Heirloom.</h2>
            <p style={{
              fontFamily:"'Lora',Georgia,serif", fontSize:"1.05rem",
              lineHeight:1.85, color:"#5a2a1a", maxWidth:"580px", textAlign:"center",
            }}>
              Born from a deep reverence for India's master weavers, we bridge
              centuries-old loom traditions with contemporary sensibilities — so
              that every saree you wear carries a living story.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px mb-20" style={{
            background:"rgba(200,125,26,0.2)",
            border:"1px solid rgba(200,125,26,0.22)",
            borderRadius:"20px", overflow:"hidden",
          }}>
            {[
              { num:"01", title:"Handpicked at Source",   body:"We travel directly to Kanchipuram, Varanasi, and Dharmavaram to select only Grade-A silk — no middlemen, no compromises on craft." },
              { num:"02", title:"Living Craft Traditions", body:"Every saree is woven by artisans who've inherited their craft over generations. Your purchase sustains their families and their art." },
              { num:"03", title:"Yours for a Lifetime",   body:"A saree is not a garment — it's an investment in memory. Each piece comes with a heritage certificate and personal care guide." },
            ].map(({ num, title, body }) => (
              <div key={num} className="flex flex-col p-10"
                style={{ background:"linear-gradient(145deg,#fffaf3 0%,#fef5e6 100%)" }}>
                <span style={{
                  fontFamily:"'Cormorant Garamond',Georgia,serif",
                  fontSize:"3.5rem", fontWeight:700,
                  color:"rgba(200,125,26,0.18)", lineHeight:1, marginBottom:"1.2rem",
                }}>{num}</span>
                <h3 style={{
                  fontFamily:"'Cormorant Garamond',Georgia,serif",
                  fontSize:"1.4rem", fontWeight:700, color:"#3d0a0a", marginBottom:"0.8rem",
                }}>{title}</h3>
                <p style={{
                  fontFamily:"'Lora',Georgia,serif", fontSize:"0.9rem",
                  lineHeight:1.82, color:"#6a3018",
                }}>{body}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 rounded-2xl overflow-hidden"
            style={{ border:"1px solid rgba(200,125,26,0.22)" }}>
            {[
              { n:"1947", label:"Year Founded" },
              { n:"300+", label:"Weaver Families" },
              { n:"10k+", label:"Happy Brides" },
              { n:"4.9★", label:"Average Rating" },
            ].map(({ n, label }, i) => (
              <div key={label} className="flex flex-col items-center justify-center py-10 px-4 text-center"
                style={{
                  borderRight: i<3 ? "1px solid rgba(200,125,26,0.16)" : "none",
                  background: i%2===0 ? "rgba(107,26,26,0.04)" : "rgba(200,125,26,0.05)",
                }}>
                <span style={{
                  fontFamily:"'Cormorant Garamond',Georgia,serif",
                  fontSize:"2.8rem", fontWeight:700, color:"#6b1a1a",
                  lineHeight:1, display:"block", marginBottom:"0.5rem",
                }}>{n}</span>
                <span style={{
                  fontSize:"0.64rem", letterSpacing:"0.18em",
                  textTransform:"uppercase", color:"#8a4020",
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