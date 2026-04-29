"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const SareeModel3D = dynamic(() => import("./SareeModel3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div style={{
        width: "2px", height: "60%",
        background: "linear-gradient(to bottom, transparent, rgba(233,188,255,0.65), transparent)",
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

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

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
          background: linear-gradient(90deg,#ffd8ff,#ff9fd6,#ffd7a6,#ff9fd6,#ffd8ff);
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
      `}</style>

      {/* ════════ HERO ════════ */}
      <section id="home" className="relative w-full overflow-hidden" style={{ minHeight: "100svh" }}>

        {/* Deep jewel-toned indigo-plum background */}
        <div className="absolute inset-0 z-0" style={{
          background: "#1a0a2e",
        }} />

        {/* Mandala tile brocade — references the logo's petal geometry */}
        <svg className="absolute inset-0 w-full h-full z-0" style={{ opacity: 0.14 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mp" x="0" y="0" width="42" height="42" patternUnits="userSpaceOnUse">
              {/* vertical teardrop petal top */}
              <path d="M21 4  L22.8 11.8 L21 16.5 L19.2 11.8 Z" fill="#f1c86a" />
              {/* vertical teardrop petal bottom */}
              <path d="M21 25.5 L22.8 30.2 L21 38 L19.2 30.2 Z" fill="#f1c86a" />
              {/* horizontal petals */}
              <path d="M4 21  L11.8 19.2 L16.5 21 L11.8 22.8 Z" fill="#f1c86a" />
              <path d="M25.5 21 L30.2 19.2 L38 21 L30.2 22.8 Z" fill="#f1c86a" />
              {/* centre diamond */}
              <path d="M21 17 L24 21 L21 25 L18 21 Z" fill="#ffd88f" opacity="0.84" />
              {/* inner dots */}
              <circle cx="21" cy="21" r="1.45" fill="#ffe7b8" opacity="0.8" />
              {/* diagonal small diamonds */}
              <path d="M11 11 L12.4 13.8 L11 16.6 L9.6 13.8 Z" fill="#e7b54f" opacity="0.55" />
              <path d="M31 11 L32.4 13.8 L31 16.6 L29.6 13.8 Z" fill="#e7b54f" opacity="0.55" />
              <path d="M11 25.4 L12.4 28.2 L11 31 L9.6 28.2 Z" fill="#e7b54f" opacity="0.55" />
              <path d="M31 25.4 L32.4 28.2 L31 31 L29.6 28.2 Z" fill="#e7b54f" opacity="0.55" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mp)" />
        </svg>

        {/* Radial vignette — darken edges so model pops */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 72% 68% at 50% 50%,
            transparent 34%, rgba(8,3,18,0.72) 100%)`,
        }} />

        {/* Warm glow behind model */}
        <div className="absolute z-0 pointer-events-none" style={{
          width: "58vw", height: "62vh",
          left: "50%", top: "52%",
          transform: "translate(-50%,-50%)",
          background: "radial-gradient(ellipse at center,rgba(255,117,212,0.24) 0%,rgba(187,106,255,0.14) 42%,transparent 72%)",
          filter: "blur(28px)",
        }} />

        {/* Side fill for widescreens */}
        <div className="absolute inset-y-0 left-0 z-0 pointer-events-none hidden lg:block" style={{
          width: "24vw",
          background: "linear-gradient(to right, rgba(248,215,152,0.09) 0%, rgba(248,215,152,0.03) 40%, transparent 100%)",
        }} />
        <div className="absolute inset-y-0 right-0 z-0 pointer-events-none hidden lg:block" style={{
          width: "24vw",
          background: "linear-gradient(to left, rgba(216,180,255,0.1) 0%, rgba(216,180,255,0.03) 42%, transparent 100%)",
        }} />

        {/* Bottom light bed so mobile doesn't feel empty */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-10vh] z-0 pointer-events-none" style={{
          width: "120vw",
          height: "34vh",
          background: "radial-gradient(ellipse at center, rgba(255,220,150,0.20) 0%, rgba(189,121,255,0.16) 35%, rgba(26,10,46,0) 72%)",
          filter: "blur(6px)",
        }} />

        {/* ── Main content ── */}
        <div
          className="relative z-20 flex flex-col items-center justify-center text-center px-4"
          style={{ minHeight: "100svh", paddingTop: "88px", paddingBottom: "26px" }}
        >

          {/* Eyebrow */}
          <div className="h1 flex items-center gap-3 mb-5">
            <span className="block h-px w-12" style={{ background: "linear-gradient(to right,transparent,rgba(242,218,255,0.72))" }} />
            <span style={{
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "0.66rem", letterSpacing: "0.3em",
              textTransform: "uppercase", color: "#edd6ff",
              fontWeight: 700, opacity: 0.72,
            }}>The Wedding Collection 2026</span>
            <span className="block h-px w-12" style={{ background: "linear-gradient(to left,transparent,rgba(242,218,255,0.72))" }} />
          </div>

          {/* Headline */}
          <h1 className="h2" style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: "clamp(3rem,6.5vw,5.6rem)",
            fontWeight: 700, lineHeight: 1.07,
            color: "#f8ebff",
            letterSpacing: "-0.01em",
          }}>
            Elegance{" "}
            <span className="italic-shimmer">Woven</span>
            <br />In Every Thread
          </h1>

          {/* 3D Canvas */}
          <div className="hc relative" style={{
            width: "min(600px,100vw)", height: "min(600px,100vh)",
            flexShrink: 0, margin: "0 auto",
          }}>
            {/* Halo ellipses */}
            {[68, 84, 100].map((pct, i) => (
              <div key={i} className="absolute rounded-full pointer-events-none" style={{
                width: `${pct}%`, paddingBottom: `${pct * .32}%`,
                bottom: "5%", left: "50%", transform: "translateX(-50%)",
                border: `1px solid rgba(236,198,255,${0.42 - i * .1})`,
              }} />
            ))}

            {/* Outer spin ring */}
            <div className="absolute pointer-events-none" style={{
              width: "74%", paddingBottom: "74%",
              bottom: "1%", left: "50%", transform: "translateX(-50%)",
              animation: "spin-slow 22s linear infinite",
            }}>
              <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" style={{ opacity: 0.22 }}>
                <circle cx="100" cy="100" r="96" fill="none" stroke="#e5c6ff" strokeWidth="0.7" strokeDasharray="5 9" />
                {Array.from({ length: 12 }).map((_, i) => {
                  const a = (i / 12) * Math.PI * 2;
                  return <circle key={i} cx={+(100 + 96 * Math.cos(a)).toFixed(2)} cy={+(100 + 96 * Math.sin(a)).toFixed(2)} r="3" fill="#ffd7a6" />;
                })}
              </svg>
            </div>

            {/* Inner counter-spin (logo mandala echo) */}
            <div className="absolute pointer-events-none" style={{
              width: "50%", paddingBottom: "50%",
              bottom: "10%", left: "50%", transform: "translateX(-50%)",
              animation: "spin-rev 34s linear infinite",
            }}>
              <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" style={{ opacity: 0.13 }}>
                <circle cx="100" cy="100" r="90" fill="none" stroke="#cc98ff" strokeWidth="0.5" strokeDasharray="3 12" />
                {Array.from({ length: 8 }).map((_, i) => {
                  const a = (i / 8) * Math.PI * 2;
                  const x = +(100 + 90 * Math.cos(a)).toFixed(2);
                  const y = +(100 + 90 * Math.sin(a)).toFixed(2);
                  const nx = +(Math.cos(a) * 5).toFixed(2);
                  const ny = +(Math.sin(a) * 5).toFixed(2);
                  return <path key={i} d={`M${x} ${y} L${x + ny} ${y - nx} L${x - nx * .5} ${y - ny * .5} L${x - ny} ${y + nx} Z`} fill="#d8b4ff" />;
                })}
              </svg>
            </div>

            {/* Ground glow */}
            <div className="absolute pointer-events-none" style={{
              bottom: "3%", left: "50%", transform: "translateX(-50%)",
              width: "50%", height: "20px",
              background: "radial-gradient(ellipse at center,rgba(239,116,206,0.45) 0%,transparent 70%)",
              filter: "blur(10px)",
            }} />

            <SareeModel3D scrollY={scrollY} />
          </div>

          {/* Bottom fill content */}
          <div className="h3 mt-1 sm:mt-3 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {["Pure Silk", "Handwoven", "Bridal Edit"].map((tag) => (
              <span
                key={tag}
                className="px-3.5 py-1.5 rounded-full"
                style={{
                  fontFamily: "'Cormorant Garamond',Georgia,serif",
                  fontSize: "0.68rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(248,232,255,0.9)",
                  border: "1px solid rgba(239,205,138,0.38)",
                  background: "rgba(25,9,45,0.34)",
                  backdropFilter: "blur(6px)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>


    </>
  );
}