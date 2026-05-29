"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

const IMAGES = [
  { src: "/herosec/img1.jpeg", label: "Hand Embroidered" },
  { src: "/herosec/img2.jpeg", label: "Loom Woven" },
  { src: "/herosec/img3.jpeg", label: "Loom to Love" },
  { src: "/herosec/img4.jpeg", label: "South Silk" },
  { src: "/herosec/img5.jpeg", label: "Colour Stories" },
];

/* ─────────────────────────────────────────────────────────────
   AMOEBA CURSOR
   – SVG blob whose control points are driven by velocity
   – Grows when mouse moves fast, shrinks back at rest
   – Shows "Open" label when hovering a card
   – Entirely position:fixed, tracks raw clientX/Y with no lag
──────────────────────────────────────────────────────────────*/
function AmoebaCursor({ hovering }) {
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const pos = useRef({ x: -300, y: -300 });
  const vel = useRef({ x: 0, y: 0 });
  const prevPos = useRef({ x: -300, y: -300 });
  const phase = useRef(0);
  const raf = useRef(null);
  const SIZE_BASE = 28;
  const SIZE_MAX = 80;

  useEffect(() => {
    const onMove = (e) => {
      vel.current.x = e.clientX - prevPos.current.x;
      vel.current.y = e.clientY - prevPos.current.y;
      prevPos.current = { x: e.clientX, y: e.clientY };
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const tick = () => {
      phase.current += 0.032;
      const speed = Math.min(Math.sqrt(vel.current.x ** 2 + vel.current.y ** 2), 60);
      vel.current.x *= 0.78;
      vel.current.y *= 0.78;

      const targetR = SIZE_BASE + (speed / 60) * (SIZE_MAX - SIZE_BASE);
      const numPts = 8;
      const pts = [];
      for (let i = 0; i < numPts; i++) {
        const angle = (i / numPts) * Math.PI * 2;
        const noise = Math.sin(phase.current * 1.7 + i * 1.3) * 0.22
          + Math.sin(phase.current * 2.3 + i * 2.1) * 0.12;
        // squish along velocity direction
        const vAngle = Math.atan2(vel.current.y, vel.current.x);
        const squish = 1 + (speed / 60) * 0.55 * Math.cos(angle - vAngle);
        const r = targetR * (1 + noise) * squish;
        pts.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
      }

      // smooth catmull-rom-ish blob path
      let d = "";
      for (let i = 0; i < numPts; i++) {
        const p0 = pts[(i - 1 + numPts) % numPts];
        const p1 = pts[i];
        const p2 = pts[(i + 1) % numPts];
        const p3 = pts[(i + 2) % numPts];
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        if (i === 0) d += `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} `;
        d += `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} `;
      }
      d += "Z";

      if (svgRef.current) {
        svgRef.current.style.transform =
          `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }
      if (pathRef.current) {
        pathRef.current.setAttribute("d", d);
      }

      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: `${SIZE_MAX * 2.4}px`,
        height: `${SIZE_MAX * 2.4}px`,
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "visible",
        willChange: "transform",
        transform: "translate(-300px,-300px)",
        marginLeft: `-${SIZE_MAX * 1.2}px`,
        marginTop: `-${SIZE_MAX * 1.2}px`,
      }}
      viewBox={`${-SIZE_MAX * 1.2} ${-SIZE_MAX * 1.2} ${SIZE_MAX * 2.4} ${SIZE_MAX * 2.4}`}
    >
      <defs>
        <radialGradient id="blobGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={hovering ? "rgba(255,200,100,0.85)" : "rgba(240,200,100,0.92)"} />
          <stop offset="60%" stopColor={hovering ? "rgba(220,140,60,0.70)" : "rgba(200,140,40,0.80)"} />
          <stop offset="100%" stopColor={hovering ? "rgba(180,80,20,0.40)" : "rgba(160,100,10,0.50)"} />
        </radialGradient>
      </defs>
      <path
        ref={pathRef}
        fill="url(#blobGrad)"
        stroke={hovering ? "rgba(255,220,140,0.55)" : "rgba(255,230,140,0.30)"}
        strokeWidth={hovering ? "1.5" : "0.8"}
      />
      {hovering && (
        <text
          x="0" y="4"
          textAnchor="middle"
          fill="#1a0a2e"
          fontSize="9"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontWeight="700"
          letterSpacing="1.5"
          style={{ textTransform: "uppercase", userSelect: "none" }}
        >OPEN</text>
      )}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   LIGHTBOX  – cinematic image reveal on card click
──────────────────────────────────────────────────────────────*/
function Lightbox({ img, onClose }) {
  const [phase, setPhase] = useState("entering"); // entering | open | closing

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("open"), 20);
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t1); window.removeEventListener("keydown", onKey); };
  }, []);

  const close = () => {
    setPhase("closing");
    setTimeout(onClose, 520);
  };

  const entering = phase === "entering";
  const closing = phase === "closing";
  const out = entering || closing;

  return (
    <div
      onClick={close}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: out ? "rgba(6,2,18,0)" : "rgba(6,2,18,0.92)",
        backdropFilter: out ? "blur(0px)" : "blur(18px)",
        transition: "background 0.5s ease, backdrop-filter 0.5s ease",
        cursor: "none",
      }}
    >
      {/* Cinematic bars top/bottom */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: out ? "0px" : "52px",
        background: "rgba(6,2,18,0.95)",
        transition: "height 0.45s cubic-bezier(.22,1,.36,1)",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: out ? "0px" : "52px",
        background: "rgba(6,2,18,0.95)",
        transition: "height 0.45s cubic-bezier(.22,1,.36,1)",
      }} />

      {/* Image frame */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "min(88vw, 900px)",
          maxHeight: "min(82vh, 700px)",
          borderRadius: "4px",
          overflow: "hidden",
          transform: out
            ? "scale(0.88) translateY(24px)"
            : "scale(1) translateY(0)",
          opacity: out ? 0 : 1,
          transition: "transform 0.52s cubic-bezier(.22,1,.36,1), opacity 0.42s ease",
          boxShadow: "0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(240,200,100,0.2)",
        }}
      >
        <img
          src={img.src}
          alt={img.label}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            maxHeight: "min(82vh, 700px)",
          }}
        />
        {/* Label bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "32px 24px 18px",
          background: "linear-gradient(to top, rgba(6,2,18,0.9), transparent)",
          transform: out ? "translateY(12px)" : "translateY(0)",
          opacity: out ? 0 : 1,
          transition: "all 0.4s ease 0.18s",
        }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "0.8rem", letterSpacing: "0.26em",
            textTransform: "uppercase", color: "#f0c890",
            margin: 0,
          }}>{img.label}</p>
        </div>
      </div>

      {/* Close hint */}
      <div style={{
        position: "absolute", top: "14px", right: "24px",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: "0.58rem", letterSpacing: "0.22em",
        textTransform: "uppercase", color: "rgba(240,200,140,0.5)",
        opacity: out ? 0 : 1,
        transition: "opacity 0.3s ease 0.3s",
      }}>ESC to close</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DESKTOP SCATTERED GALLERY  (cursor:none + amoeba + lightbox)
──────────────────────────────────────────────────────────────*/
function DesktopGallery({ onOpenImage }) {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });
  const raf = useRef(null);
  const [active, setActive] = useState(null);
  const [hovering, setHovering] = useState(false);

  const layout = [
    { x: 2, y: 10, r: -6, z: 2, s: 1.00, w: 240, h: 310 },
    { x: 24, y: 2, r: 3, z: 3, s: 1.05, w: 280, h: 200 },
    { x: 54, y: 6, r: -3, z: 4, s: 1.00, w: 220, h: 300 },
    { x: 30, y: 44, r: 5, z: 2, s: 1.00, w: 260, h: 190 },
    { x: 64, y: 42, r: -4, z: 3, s: 1.02, w: 200, h: 280 },
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    container.addEventListener("mousemove", onMove, { passive: true });

    const tick = () => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const lay = layout[i];
        const cardRect = card.getBoundingClientRect();
        const contRect = containerRef.current?.getBoundingClientRect();
        if (!contRect) return;
        const cx = cardRect.left - contRect.left + cardRect.width / 2;
        const cy = cardRect.top - contRect.top + cardRect.height / 2;
        const dx = (mouse.current.x - cx) / contRect.width;
        const dy = (mouse.current.y - cy) / contRect.height;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const strength = Math.max(0, 1 - dist * 2.4);
        const tiltX = dy * 16 * strength;
        const tiltY = -dx * 16 * strength;
        const lift = strength * 20;

        card.style.transform = `
          translate(${dx * strength * 14}px, ${dy * strength * 14}px)
          rotate(${lay.r + dx * 3}deg)
          rotateX(${tiltX}deg)
          rotateY(${tiltY}deg)
          translateZ(${lift}px)
          scale(${lay.s + strength * 0.07})
        `;
        const glow = card.querySelector(".card-glow");
        if (glow) {
          glow.style.opacity = String(strength * 0.75);
          glow.style.background = `radial-gradient(circle at ${50 + dx * 60}% ${50 + dy * 60}%, rgba(255,200,120,0.55) 0%, transparent 65%)`;
        }
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      container.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative", width: "100%", height: "520px",
        perspective: "900px", perspectiveOrigin: "50% 50%",
        cursor: "none",
      }}
    >
      {IMAGES.map((img, i) => {
        const lay = layout[i];
        return (
          <div
            key={i}
            ref={el => cardsRef.current[i] = el}
            onMouseEnter={() => { setActive(i); setHovering(true); }}
            onMouseLeave={() => { setActive(null); setHovering(false); }}
            onClick={() => onOpenImage(img)}
            style={{
              position: "absolute",
              left: `${lay.x}%`, top: `${lay.y}%`,
              width: `${lay.w}px`, height: `${lay.h}px`,
              zIndex: active === i ? 10 : lay.z,
              cursor: "none",
              transform: `rotate(${lay.r}deg) scale(${lay.s})`,
              transformOrigin: "center center",
              transformStyle: "preserve-3d",
              transition: "box-shadow 0.3s ease",
              willChange: "transform",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: active === i
                ? "0 32px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(240,192,64,0.32)"
                : "0 12px 36px rgba(0,0,0,0.55)",
            }}
          >
            <div className="card-glow" style={{
              position: "absolute", inset: 0, zIndex: 3,
              opacity: 0, pointerEvents: "none", borderRadius: "14px",
            }} />
            <img
              src={img.src} alt={img.label}
              draggable={false}
              style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
                transform: active === i ? "scale(1.07)" : "scale(1)",
                transition: "transform 0.6s cubic-bezier(.22,1,.36,1)",
              }}
            />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 4,
              padding: "28px 14px 14px",
              background: "linear-gradient(to top, rgba(10,4,22,0.88) 0%, transparent 100%)",
              transform: active === i ? "translateY(0)" : "translateY(8px)",
              opacity: active === i ? 1 : 0,
              transition: "all 0.32s ease",
            }}>
              <p style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "0.75rem", letterSpacing: "0.22em",
                textTransform: "uppercase", color: "#f0c890", margin: 0,
              }}>{img.label}</p>
            </div>
            <div style={{
              position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none",
              borderRadius: "14px",
              border: "1px solid rgba(240,200,120,0.18)",
            }} />
          </div>
        );
      })}

      {/* Amoeba lives here - rendered fixed so it's always on top */}
      {/* <AmoebaCursor hovering={hovering} /> */}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MOBILE STACKED CAROUSEL
──────────────────────────────────────────────────────────────*/
function MobileCarousel({ onOpenImage }) {
  const [current, setCurrent] = useState(0);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [touching, setTouching] = useState(false);

  const goTo = (idx) => setCurrent((idx + IMAGES.length) % IMAGES.length);

  const onTouchStart = (e) => { setStartX(e.touches[0].clientX); setTouching(true); setOffsetX(0); };
  const onTouchMove = (e) => { if (!touching) return; setOffsetX(e.touches[0].clientX - startX); };
  const onTouchEnd = () => {
    setTouching(false);
    if (offsetX < -50) goTo(current + 1);
    else if (offsetX > 50) goTo(current - 1);
    setOffsetX(0);
  };

  const getStyle = (idx) => {
    const total = IMAGES.length;
    let rel = ((idx - current) % total + total) % total;
    if (rel > total / 2) rel -= total;
    const base = {
      position: "absolute", borderRadius: "18px", overflow: "hidden",
      transition: touching ? "none" : "all 0.58s cubic-bezier(.22,1,.36,1)",
      boxShadow: rel === 0
        ? "0 28px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(240,192,64,0.22)"
        : "0 10px 30px rgba(0,0,0,0.5)",
    };
    if (rel === 0) return {
      ...base,
      width: "66vw", height: "72vw", maxWidth: "280px", maxHeight: "300px",
      left: "50%", top: "50%",
      transform: `translate(-50%,-50%) translateX(${offsetX * 0.3}px) rotate(${offsetX * 0.03}deg) scale(1)`,
      zIndex: 5, filter: "brightness(1)", cursor: "pointer",
    };
    if (Math.abs(rel) === 1) return {
      ...base,
      width: "55vw", height: "60vw", maxWidth: "230px", maxHeight: "250px",
      left: rel === 1 ? "72%" : "28%", top: "52%",
      transform: `translate(-50%,-50%) rotate(${rel * 5}deg) scale(0.88)`,
      zIndex: 3, filter: "brightness(0.6) saturate(0.7)", cursor: "pointer",
    };
    return {
      ...base,
      width: "44vw", height: "48vw", maxWidth: "180px", maxHeight: "200px",
      left: rel > 0 ? "88%" : "12%", top: "54%",
      transform: `translate(-50%,-50%) rotate(${rel * 7}deg) scale(0.72)`,
      zIndex: 1, filter: "brightness(0.35) saturate(0.4)",
    };
  };

  return (
    <div
      style={{ position: "relative", width: "100%", height: "min(380px,82vw)", perspective: "700px" }}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
    >
      {IMAGES.map((img, i) => {
        const total = IMAGES.length;
        let rel = ((i - current) % total + total) % total;
        if (rel > total / 2) rel -= total;
        return (
          <div
            key={i}
            style={getStyle(i)}
            onClick={() => {
              if (rel === 0) onOpenImage(img);
              else goTo(i);
            }}
          >
            <img src={img.src} alt={img.label} draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", userSelect: "none" }}
            />
            {rel === 0 && (
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "24px 14px 12px",
                background: "linear-gradient(to top, rgba(10,4,22,0.9), transparent)",
                animation: "mfadeIn 0.5s ease",
              }}>
                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "0.65rem", letterSpacing: "0.24em",
                  textTransform: "uppercase", color: "#f0c890", margin: 0,
                }}>{img.label}</p>
              </div>
            )}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", borderRadius: "18px",
              border: rel === 0 ? "1px solid rgba(240,200,120,0.35)" : "none",
            }} />
          </div>
        );
      })}
      <div style={{
        position: "absolute", bottom: "0px", left: "50%",
        transform: "translateX(-50%)", display: "flex", gap: "7px", zIndex: 10,
      }}>
        {IMAGES.map((_, i) => (
          <div key={i} onClick={() => goTo(i)} style={{
            width: i === current ? "22px" : "6px", height: "6px",
            borderRadius: "3px",
            background: i === current ? "#f0c060" : "rgba(255,255,255,0.2)",
            transition: "all 0.4s cubic-bezier(.22,1,.36,1)", cursor: "pointer",
          }} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN HERO
──────────────────────────────────────────────────────────────*/
export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const openImage = useCallback((img) => setLightboxImg(img), []);
  const closeImage = useCallback(() => setLightboxImg(null), []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');

        @keyframes heroFadeUp  { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mfadeIn     { from{opacity:0} to{opacity:1} }
        @keyframes shimmer     { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes floatUpAnim { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes revealLine  { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes tagFadeIn   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glowPulse   { 0%,100%{opacity:.4} 50%{opacity:.85} }
        @keyframes wanderA     { 0%,100%{transform:translate(0,0) rotate(0deg)} 33%{transform:translate(12px,-8px) rotate(2deg)} 66%{transform:translate(-8px,6px) rotate(-1deg)} }
        @keyframes wanderB     { 0%,100%{transform:translate(0,0) rotate(0deg)} 40%{transform:translate(-10px,10px) rotate(-3deg)} 70%{transform:translate(8px,-6px) rotate(2deg)} }
        @keyframes wanderC     { 0%,100%{transform:translate(0,0) rotate(0deg)} 25%{transform:translate(6px,12px) rotate(1.5deg)} 75%{transform:translate(-12px,-4px) rotate(-2deg)} }

        .italic-shimmer {
          background: linear-gradient(90deg,#ffd8ff,#ff9fd6,#ffd7a6,#ff9fd6,#ffd8ff);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
          font-style: italic;
        }
        .h1  { animation: heroFadeUp 1s cubic-bezier(.22,1,.36,1) .05s both }
        .h2  { animation: heroFadeUp 1s cubic-bezier(.22,1,.36,1) .18s both }
        .h3  { animation: heroFadeUp 1s cubic-bezier(.22,1,.36,1) .38s both }
        .h4  { animation: heroFadeUp 1s cubic-bezier(.22,1,.36,1) .52s both }
        .hgal{ animation: heroFadeUp 1.1s cubic-bezier(.22,1,.36,1) .28s both }
        * { -webkit-tap-highlight-color: transparent }
      `}</style>

      {/* Lightbox portal */}
      {lightboxImg && <Lightbox img={lightboxImg} onClose={closeImage} />}

      <section id="home" className="relative w-full overflow-hidden" style={{ minHeight: "100svh" }}>

        <div className="absolute inset-0 z-0" style={{ background: "#0e0620" }} />

        <svg className="absolute inset-0 w-full h-full z-0" style={{ opacity: 0.11 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mp" x="0" y="0" width="42" height="42" patternUnits="userSpaceOnUse">
              <path d="M21 4 L22.8 11.8 L21 16.5 L19.2 11.8 Z" fill="#f1c86a" />
              <path d="M21 25.5 L22.8 30.2 L21 38 L19.2 30.2 Z" fill="#f1c86a" />
              <path d="M4 21 L11.8 19.2 L16.5 21 L11.8 22.8 Z" fill="#f1c86a" />
              <path d="M25.5 21 L30.2 19.2 L38 21 L30.2 22.8 Z" fill="#f1c86a" />
              <path d="M21 17 L24 21 L21 25 L18 21 Z" fill="#ffd88f" opacity="0.84" />
              <circle cx="21" cy="21" r="1.45" fill="#ffe7b8" opacity="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mp)" />
        </svg>

        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 75% at 50% 50%, transparent 30%, rgba(6,2,16,0.88) 100%)",
        }} />

        <div className="absolute z-0 pointer-events-none" style={{
          width: "60vw", height: "50vh", left: "20%", top: "20%",
          background: "radial-gradient(ellipse, rgba(180,80,240,0.12) 0%, transparent 70%)",
          filter: "blur(40px)", animation: "glowPulse 6s ease-in-out infinite",
        }} />
        <div className="absolute z-0 pointer-events-none" style={{
          width: "40vw", height: "40vh", right: "10%", bottom: "15%",
          background: "radial-gradient(ellipse, rgba(255,160,60,0.10) 0%, transparent 70%)",
          filter: "blur(30px)", animation: "glowPulse 8s ease-in-out infinite 2s",
        }} />

        {/* ════ DESKTOP ════ */}
        <div className="relative z-20 hidden lg:flex items-center" style={{ minHeight: "100svh", paddingTop: "88px", paddingBottom: "32px" }}>

          {/* Text column */}
          <div className="flex flex-col justify-center px-12" style={{ width: "42%", flexShrink: 0 }}>

            <div className="h1 flex items-center gap-3 mb-6">
              <span style={{ display: "block", height: "1px", width: "36px", background: "linear-gradient(to right,transparent,rgba(240,192,100,0.8))", transformOrigin: "left", animation: "revealLine 0.8s ease 0.1s both" }} />
              <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "0.62rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "#ddb87a", fontWeight: 700, opacity: 0.9 }}>
                The Everyday Collection {new Date().getFullYear()}
              </span>
            </div>

            <h1 className="h2" style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(2.8rem,4.2vw,5rem)", fontWeight: 700, lineHeight: 1.05, color: "#f6e8ff", letterSpacing: "-0.02em", margin: "0 0 1.5rem" }}>
              Elegance <span className="italic-shimmer">Woven</span>
              <br />In Every Thread
            </h1>

            <p className="h3" style={{ fontFamily: "'Lora',Georgia,serif", fontSize: "0.93rem", color: "rgba(230,210,255,0.62)", lineHeight: 1.75, maxWidth: "340px", marginBottom: "2.2rem" }}>
              Each weave carries centuries of craft - from the artisan's hand to yours. Pure silk. Living colour. Stories in thread.
            </p>

            <div className="h4 flex items-center gap-4">
              {/* <Link href="#collections" style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"0.7rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"#0e0620", background:"linear-gradient(135deg,#f0c040,#e09830)", border:"none", padding:"14px 32px", borderRadius:"2px", cursor:"pointer", fontWeight:700, boxShadow:"0 8px 28px rgba(224,152,48,0.35)", textDecoration:"none", display:"inline-block" }}>Explore Collection</Link> */}
              <button
                onClick={() => {
                  document
                    .getElementById("shoppreview")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  fontFamily: "'Cormorant Garamond',Georgia,serif",
                  fontSize: "0.66rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#0e0620",
                  background: "linear-gradient(135deg,#f0c040,#e09830)",
                  border: "none",
                  padding: "13px 28px",
                  borderRadius: "2px",
                  cursor: "pointer",
                  fontWeight: 700,
                  boxShadow: "0 6px 22px rgba(224,152,48,0.32)",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Explore Collection
              </button>
              <Link href="/shop" style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(240,208,160,0.8)", background: "transparent", border: "1px solid rgba(240,192,100,0.28)", padding: "14px 24px", borderRadius: "2px", cursor: "pointer", textDecoration: "none", display: "inline-block" }}>Our Shop</Link>
            </div>

            <div className="h4 flex gap-8 mt-10" style={{ opacity: 0, animation: "heroFadeUp 1s cubic-bezier(.22,1,.36,1) 0.7s both" }}>
              {[["12+", "Weave Traditions"], ["500+", "Saree Designs"], ["100%", "Handcrafted"]].map(([n, l]) => (
                <div key={l}>
                  <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "1.7rem", fontWeight: 700, color: "#f0c060", margin: "0 0 2px", lineHeight: 1 }}>{n}</p>
                  <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(220,190,255,0.45)", margin: 0 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery column */}
          <div className="hgal flex-1" style={{ position: "relative", height: "calc(100svh - 88px)", minHeight: "520px" }}>
            <DesktopGallery onOpenImage={openImage} />
          </div>
        </div>

        {/* ════ MOBILE ════ */}
        <div className="relative z-20 flex flex-col items-center text-center lg:hidden px-5" style={{ paddingTop: "88px", paddingBottom: "32px" }}>

          <div className="h1 flex items-center gap-3 mb-4">
            <span style={{ display: "block", height: "1px", width: "28px", background: "linear-gradient(to right,transparent,rgba(240,192,100,0.7))" }} />
            <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "0.58rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#ddb87a", fontWeight: 700, opacity: 0.85 }}>
              The Everyday Collection {new Date().getFullYear()}
            </span>
            <span style={{ display: "block", height: "1px", width: "28px", background: "linear-gradient(to left,transparent,rgba(240,192,100,0.7))" }} />
          </div>

          <h1 className="h2" style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(2.4rem,10vw,3.6rem)", fontWeight: 700, lineHeight: 1.06, color: "#f6e8ff", letterSpacing: "-0.01em", marginBottom: "1.2rem" }}>
            Elegance <span className="italic-shimmer">Woven</span>
            <br />In Every Thread
          </h1>

          <div className="hgal" style={{ width: "100%", maxWidth: "420px", marginBottom: "1.6rem" }}>
            <MobileCarousel onOpenImage={openImage} />
          </div>

          <p className="h3" style={{ fontFamily: "'Lora',Georgia,serif", fontSize: "0.87rem", color: "rgba(220,195,255,0.55)", lineHeight: 1.72, maxWidth: "300px", marginBottom: "1.8rem" }}>
            From artisan loom to your wardrobe - pure silk, living colour, stories in thread.
          </p>

          <div className="h4 flex flex-wrap items-center justify-center gap-2 mb-6">
            {["Pure Silk", "Handwoven", "Bridal Edit"].map((tag, i) => (
              <span key={tag} style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(248,232,255,0.85)", border: "1px solid rgba(239,205,138,0.3)", background: "rgba(20,8,40,0.3)", backdropFilter: "blur(6px)", padding: "8px 16px", borderRadius: "2px", animation: `tagFadeIn 0.7s cubic-bezier(.22,1,.36,1) ${0.55 + i * 0.1}s both` }}>{tag}</span>
            ))}
          </div>

          <div className="h4" style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            {/* <Link href="#collections" style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:"0.66rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"#0e0620", background:"linear-gradient(135deg,#f0c040,#e09830)", border:"none", padding:"13px 28px", borderRadius:"2px", cursor:"pointer", fontWeight:700, boxShadow:"0 6px 22px rgba(224,152,48,0.32)", textDecoration:"none", display:"inline-block" }}>Explore Collection</Link> */}
            <button
              onClick={() => {
                document
                  .getElementById("shoppreview")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                fontSize: "0.66rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#0e0620",
                background: "linear-gradient(135deg,#f0c040,#e09830)",
                border: "none",
                padding: "13px 28px",
                borderRadius: "2px",
                cursor: "pointer",
                fontWeight: 700,
                boxShadow: "0 6px 22px rgba(224,152,48,0.32)",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Explore Collection
            </button>
            <Link href="/shop" style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "0.66rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(240,208,160,0.75)", background: "transparent", border: "1px solid rgba(240,192,100,0.25)", padding: "13px 22px", borderRadius: "2px", cursor: "pointer", textDecoration: "none", display: "inline-block" }}>Our Shop</Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)", zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", opacity: scrollY > 60 ? 0 : 1, transition: "opacity 0.4s" }}>
          <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "0.55rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(220,180,255,0.4)" }}>Scroll</span>
          <div style={{ width: "1px", height: "28px", background: "linear-gradient(to bottom,rgba(240,192,100,0.6),transparent)", animation: "floatUpAnim 2.2s ease-in-out infinite" }} />
        </div>

      </section>
    </>
  );
}