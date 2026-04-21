"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { FaRegUser } from "react-icons/fa";
import { PiUserCircleGearBold } from "react-icons/pi";
import { VscSearchSparkle } from "react-icons/vsc";
import { BsBagHeartFill } from "react-icons/bs";

/* ─── Safe cart hook ─── */
function useCartCount() {
  try {
    const { useCart } = require("@/context/CartContext");
    const ctx = useCart();
    return ctx?.items?.reduce((s, i) => s + (i.quantity || 0), 0) ?? 0;
  } catch {
    return 0;
  }
}

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  {
    label: "Collections", href: "/collections", dropdown: [
      { label: "Banarasi Silk", href: "/collections/banarasi" },
      { label: "Kanchipuram", href: "/collections/kanchipuram" },
      { label: "Wedding Wear", href: "/collections/wedding" },
      { label: "Designer Edit", href: "/collections/designer" },
    ]
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collOpen, setCollOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const searchRef = useRef(null);
  const cartCount = useCartCount();

  const overHero = pathname === "/" && !scrolled;
  const navColor = overHero ? "#f4e6ff" : "#3d0a0a";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 28);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&display=swap');

        .nav-link {
          position: relative;
          padding-bottom: 2px;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          transition: color .25s ease;
        }
        .nav-link:hover {
          color: var(--hover-color);
        }
        .nav-link::after {
          content: '';
          position: absolute;
          left: 50%; bottom: -1px;
          width: 0; height: 1.5px;
          background: #d4891e;
          transition: width .3s cubic-bezier(.22,1,.36,1), left .3s cubic-bezier(.22,1,.36,1);
        }
        .nav-link:hover::after { width: 100%; left: 0; }

        /* Dropdown */
        .drop-panel {
          transform-origin: top center;
          transition: opacity .2s ease, transform .22s cubic-bezier(.22,1,.36,1);
        }
        .drop-panel.hide { opacity:0; transform:scaleY(.93) translateY(-5px); pointer-events:none; }
        .drop-panel.show { opacity:1; transform:scaleY(1) translateY(0); pointer-events:all; }

        /* Search slide */
        .search-field {
          max-width: 0; opacity: 0; overflow: hidden;
          transition: max-width .35s cubic-bezier(.22,1,.36,1), opacity .25s;
        }
        .search-field.open { max-width: 200px; opacity: 1; }

        /* Badge pop */
        @keyframes badgePop { 0%{transform:scale(1)} 50%{transform:scale(1.4)} 100%{transform:scale(1)} }
        .badge-pop { animation: badgePop .28s ease; }

        /* Mobile drawer */
        @keyframes drawerIn  { from{opacity:0;transform:translateX(100%)} to{opacity:1;transform:translateX(0)} }
        .drawer { animation: drawerIn .36s cubic-bezier(.22,1,.36,1) both; }

        @keyframes mlinkIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        .mlink { animation: mlinkIn .38s cubic-bezier(.22,1,.36,1) both; }
        .mlink:nth-child(1){animation-delay:.06s}
        .mlink:nth-child(2){animation-delay:.13s}
        .mlink:nth-child(3){animation-delay:.20s}
        .mlink:nth-child(4){animation-delay:.27s}
        .mlink:nth-child(5){animation-delay:.34s}
      `}</style>

      {/* ══ NAVBAR ══════════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 w-full z-50"
        style={{
          "--hover-color": overHero ? "#ffd7a6" : "#7a1f1f",
          transition: "background .45s ease, border-color .45s ease, box-shadow .45s ease, backdrop-filter .45s ease",
          background: scrolled
            ? "rgba(255, 255, 255, 0.95)"
            : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(1.8)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.8)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(200,125,26,0.25)"
            : "1px solid transparent",
          boxShadow: scrolled
            ? "0 2px 28px rgba(61,10,10,0.10)"
            : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between" style={{ height: 68 }}>

            {/* ── LOGO ── */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2.5 group">
              {/* Logo mark */}
              <div className="relative transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={overHero ? "/ruva_logo_tw.png" : "/ruva_logo_t.png"}
                  alt="Ruva"
                  width={85}
                  height={30}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* ── DESKTOP LINKS ── */}
            <div className="hidden md:flex items-center gap-8 ">
              {NAV_LINKS.map(({ label, href, dropdown }) =>
                dropdown ? (
                  <div key={label} className="relative"
                    onMouseEnter={() => setCollOpen(true)}
                    onMouseLeave={() => setCollOpen(false)}
                  >
                    <button className="nav-link flex items-center gap-1 text-xl" style={{ color: navColor }}>
                      <span className="text-lg">{label}</span>
                      <ChevronDown size={16} style={{
                        color: "#d4891e",
                        transition: "transform .22s",
                        transform: collOpen ? "rotate(-180deg)" : "rotate(0deg)",
                      }} />
                    </button>
                    <div className={`drop-panel ${collOpen ? "show" : "hide"} absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-52 rounded-xl overflow-hidden`}
                      style={{
                        background: "rgba(253,243,227,0.97)",
                        backdropFilter: "blur(18px)",
                        border: "1px solid rgba(200,125,26,0.22)",
                        boxShadow: "0 16px 40px rgba(61,10,10,0.13)",
                      }}
                    >
                      <div style={{ height: 2, background: "linear-gradient(to right,transparent,#d4891e,transparent)" }} />
                      <div className="py-2">
                        {dropdown.map(({ label: l, href: h }) => (
                          <Link key={l} href={h} onClick={() => setCollOpen(false)}
                            className="block px-5 py-2.5 transition-colors hover:bg-orange-50"
                            style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "0.95rem", fontWeight: 600, color: "#3d0a0a", letterSpacing: "0.02em" }}
                          >{l}</Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link key={label} href={href} className="nav-link" style={{ color: navColor }}><span className="text-lg">{label}</span></Link>
                )
              )}
            </div>

            {/* ── ICONS ── */}
            <div className="hidden md:flex items-center gap-10">
              {/* Search */}
              <div className="flex items-center gap-2 relative">
                {/* Glass search box */}
                <div className={`search-field ${searchOpen ? "open" : ""}`}>
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
                    style={{
                      background: overHero
                        ? "rgba(236,204,255,0.12)"
                        : "rgba(253,243,227,0.9)",
                      backdropFilter: "blur(12px)",
                      borderColor: overHero ? "rgba(242,218,255,0.34)" : "rgba(200,125,26,0.3)",
                      boxShadow: searchOpen
                        ? "0 4px 20px rgba(0,0,0,0.08)"
                        : "none",
                    }}
                  >
                    <VscSearchSparkle size={16} style={{ color: navColor, opacity: 0.7 }} />

                    <input
                      ref={searchRef}
                      type="text"
                      value={searchVal}
                      onChange={e => setSearchVal(e.target.value)}
                      onKeyDown={e => e.key === "Escape" && setSearchOpen(false)}
                      placeholder="Search sarees…"
                      className="bg-transparent outline-none w-full"
                      style={{
                        fontFamily: "'Cormorant Garamond',Georgia,serif",
                        fontSize: "0.9rem",
                        color: navColor,
                      }}
                    />
                  </div>
                </div>

                {/* Toggle button */}
                <button
                  onClick={() => {
                    setSearchOpen(s => !s);
                    if (searchOpen) setSearchVal("");
                  }}
                  className="transition-transform hover:scale-110"
                  aria-label="Search"
                  style={{ color: navColor }}
                >
                  {searchOpen ? <X size={19} /> : <VscSearchSparkle size={19} />}
                </button>
              </div>

              {/* Account */}
              <Link href="/profile" className="transition-transform hover:scale-110" aria-label="Account" style={{ color: navColor }}>
                <FaRegUser/>
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative transition-transform hover:scale-110" aria-label="Cart" style={{ color: navColor }}>
                <BsBagHeartFill size={20} />
                {cartCount > 0 && (
                  <span key={cartCount} className="badge-pop absolute -top-2 -right-2 flex items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ width: 18, height: 18, background: "linear-gradient(135deg,#6b1a1a,#a02828)", color: "#fdf3e3", boxShadow: "0 2px 8px rgba(61,10,10,0.35)" }}>
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* ── MOBILE RIGHT ── */}
            <div className="md:hidden flex items-center gap-4">
              <Link href="/cart" className="relative" style={{ color: navColor }}>
                <BsBagHeartFill size={20} />
                {cartCount > 0 && (
                  <span className="badge-pop absolute -top-2 -right-2 flex items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ width: 18, height: 18, background: "linear-gradient(135deg,#6b1a1a,#a02828)", color: "#fdf3e3" }}>
                    {cartCount}
                  </span>
                )}
              </Link>
              <button onClick={() => setMobileOpen(o => !o)} style={{ color: navColor }} aria-label="Menu">
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ══ MOBILE DRAWER ════════════════════════════════════════ */}
      {mobileOpen && (
        <div className="drawer fixed inset-0 z-40 md:hidden flex flex-col overflow-hidden"
          style={{ background: "linear-gradient(155deg,#fdf3e3 0%,#fef0cc 45%,#f5d88a 100%)" }}>
          {/* Brocade */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: .07 }}>
            <defs>
              <pattern id="dm" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M32 6 L34.5 18 L32 25 L29.5 18 Z" fill="#3d0a0a" />
                <path d="M32 39 L34.5 46 L32 58 L29.5 46 Z" fill="#3d0a0a" />
                <path d="M6 32 L18 29.5 L25 32 L18 34.5 Z" fill="#3d0a0a" />
                <path d="M39 32 L46 29.5 L58 32 L46 34.5 Z" fill="#3d0a0a" />
                <path d="M32 26 L36 32 L32 38 L28 32 Z" fill="#3d0a0a" opacity=".9" />
                <circle cx="32" cy="32" r="2" fill="#3d0a0a" opacity=".5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dm)" />
          </svg>

          {/* Amber top stripe */}
          <div style={{ height: 3, background: "linear-gradient(to right,transparent,#d4891e 30%,#f0a830 50%,#d4891e 70%,transparent)", flexShrink: 0 }} />

          {/* Top bar */}
          <div className="flex items-center justify-between px-6 pt-5 pb-2 relative z-10 flex-shrink-0">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
              <div className="relative" style={{ width: 32, height: 32 }}>
                <Image src="/RUVA_LOGO.png" alt="Ruva" fill className="object-contain" />
              </div>
              <div className="flex flex-col leading-none">
                <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "1.3rem", fontWeight: 700, color: "#3d0a0a" }}>Ruva</span>
                <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "0.46rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#6b1a1a", opacity: .7 }}>Handlooms</span>
              </div>
            </Link>
            <button onClick={() => setMobileOpen(false)} style={{ color: "#3d0a0a" }}><X size={26} /></button>
          </div>

          {/* Divider */}
          <div className="mx-6 my-4 relative z-10" style={{ height: 1, background: "rgba(200,125,26,0.25)" }} />

          {/* Links */}
          <div className="flex-1 flex flex-col justify-center px-8 gap-1 relative z-10">
            {[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/shop" },
              { label: "Collections", href: "/collections" },
              { label: "Account", href: "/profile" },
              { label: "Cart", href: "/cart" },
            ].map(({ label, href }) => (
              <div key={label} className="mlink">
                <Link href={href} onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-4 border-b group"
                  style={{ borderColor: "rgba(200,125,26,0.15)" }}
                >
                  <span className="group-hover:text-[#7a1f1f] transition-colors" style={{
                    fontFamily: "'Cormorant Garamond',Georgia,serif",
                    fontSize: "clamp(2rem,6vw,2.6rem)", fontWeight: 700,
                    color: "#3d0a0a", letterSpacing: "-0.01em",
                  }}>{label}</span>
                  <span className="group-hover:translate-x-1 transition-transform" style={{ color: "#d4891e", opacity: .65 }}>→</span>
                </Link>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-8 pb-10 relative z-10">
            <div style={{ height: 1, background: "rgba(200,125,26,0.2)", marginBottom: "1rem" }} />
            <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(61,10,10,0.42)" }}>Weaving stories since 1947</p>
          </div>

          {/* Decorative R watermark */}
          <div className="absolute bottom-0 right-0 pointer-events-none select-none" style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: "20rem", fontWeight: 700, lineHeight: 1,
            color: "rgba(200,125,26,0.06)",
            letterSpacing: "-0.05em",
          }}>R</div>
        </div>
      )}
    </>
  );
}