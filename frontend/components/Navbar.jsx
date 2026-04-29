"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { X, ChevronDown, Menu } from "lucide-react";
import { FaRegUser } from "react-icons/fa";
import { VscSearchSparkle } from "react-icons/vsc";
import { BsBagHeartFill } from "react-icons/bs";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { HiOutlineHome, HiHome } from "react-icons/hi2";
import { RiShoppingBag3Line, RiShoppingBag3Fill } from "react-icons/ri";
import { MdOutlineCollections, MdCollections } from "react-icons/md";
import { CgProfile } from "react-icons/cg";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const NAV_LINKS = [
  { label: "Home", sectionId: "home" },
  { label: "Categories", sectionId: "categories" },
  { label: "Shop", sectionId: "shop" },
  { label: "Collections", sectionId: "collections" },
];

const BOTTOM_TABS = [
  { label: "Home",        href: "/",           Icon: HiOutlineHome,      ActiveIcon: HiHome },
  { label: "Shop",        href: "/shop",        Icon: RiShoppingBag3Line, ActiveIcon: RiShoppingBag3Fill },
  { label: "Collections", href: "/collections", Icon: MdOutlineCollections, ActiveIcon: MdCollections },
  { label: "Account",     href: "/profile",     Icon: CgProfile,          ActiveIcon: CgProfile },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [hydrated, setHydrated]       = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [collOpen, setCollOpen]       = useState(false);
  const [searchVal, setSearchVal]     = useState("");
  const searchRef = useRef(null);
  const { cartItems } = useCart();
  const { wishlistCount } = useWishlist();
  const cartCount = cartItems?.reduce((sum, item) => sum + (item.qty || 0), 0) ?? 0;

  const overHero  = pathname === "/" && !scrolled;
  const navColor  = overHero ? "#f4e6ff" : "#3d0a0a";

  useEffect(() => {
    setHydrated(true);
  }, []);

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

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  };

  const handleSectionNav = (id) => {
    setMobileOpen(false);
    setCollOpen(false);
    if (pathname === "/") {
      const ok = scrollToSection(id);
      if (!ok) window.location.assign(`/#${id}`);
      return;
    }
    router.push(`/#${id}`);
  };

  useEffect(() => {
    if (pathname !== "/") return;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const id = hash?.startsWith("#") ? hash.slice(1) : "";
    if (!id) return;
    const t = window.setTimeout(() => scrollToSection(id), 50);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&display=swap');

        /* ── Desktop nav link ── */
        .nav-link {
          position: relative;
          padding-bottom: 2px;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          transition: color .25s ease;
        }
        .nav-link:hover { color: var(--hover-color); }
        .nav-link::after {
          content: '';
          position: absolute;
          left: 50%; bottom: -1px;
          width: 0; height: 1.5px;
          background: #d4891e;
          transition: width .3s cubic-bezier(.22,1,.36,1), left .3s cubic-bezier(.22,1,.36,1);
        }
        .nav-link:hover::after { width: 100%; left: 0; }

        /* ── Dropdown ── */
        .drop-panel {
          transform-origin: top center;
          transition: opacity .2s ease, transform .22s cubic-bezier(.22,1,.36,1);
        }
        .drop-panel.hide { opacity:0; transform:scaleY(.93) translateY(-5px); pointer-events:none; }
        .drop-panel.show { opacity:1; transform:scaleY(1) translateY(0); pointer-events:all; }

        /* ── Desktop search slide ── */
        .search-field {
          max-width: 0; opacity: 0; overflow: hidden;
          transition: max-width .35s cubic-bezier(.22,1,.36,1), opacity .25s;
        }
        .search-field.open { max-width: 200px; opacity: 1; }

        /* ── Mobile search — slides LEFT from the icon ── */
        .m-search-wrap {
          position: absolute;
          right: 44px; /* sits just left of the icon */
          top: 50%;
          transform: translateY(-50%);
          overflow: hidden;
          width: 0;
          opacity: 0;
          transition:
            width .4s cubic-bezier(.22,1,.36,1),
            opacity .3s cubic-bezier(.22,1,.36,1);
          pointer-events: none;
        }
        .m-search-wrap.open {
          width: min(220px, 58vw);
          opacity: 1;
          pointer-events: all;
        }
        .m-search-inner {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 999px;
          white-space: nowrap;
          /* glass pill */
          background: rgba(255,255,255,0.14);
          backdrop-filter: blur(18px) saturate(1.5);
          -webkit-backdrop-filter: blur(18px) saturate(1.5);
          border: 1px solid rgba(240,192,64,0.30);
        }
        .m-search-inner input {
          background: transparent;
          outline: none;
          border: none;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 0.92rem;
          letter-spacing: 0.03em;
          width: 100%;
          color: inherit;
        }
        .m-search-inner input::placeholder { opacity: 0.55; }

        /* ── Badge pop ── */
        @keyframes badgePop { 0%{transform:scale(1)} 50%{transform:scale(1.4)} 100%{transform:scale(1)} }
        .badge-pop { animation: badgePop .28s ease; }

        /* ── Mobile drawer ── */
        @keyframes drawerIn  { from{opacity:0;transform:translateX(100%)} to{opacity:1;transform:translateX(0)} }
        .drawer { animation: drawerIn .36s cubic-bezier(.22,1,.36,1) both; }
        @keyframes mlinkIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        .mlink { animation: mlinkIn .38s cubic-bezier(.22,1,.36,1) both; }
        .mlink:nth-child(1){animation-delay:.06s}
        .mlink:nth-child(2){animation-delay:.13s}
        .mlink:nth-child(3){animation-delay:.20s}
        .mlink:nth-child(4){animation-delay:.27s}
        .mlink:nth-child(5){animation-delay:.34s}

        /* ── Bottom tab bar ── */
        .btab-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 49;
          height: 64px;
          /* clean white frosted base */
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(24px) saturate(1.6);
          -webkit-backdrop-filter: blur(24px) saturate(1.6);
          border-top: 1px solid rgba(240,192,64,0.18);
          box-shadow: 0 -8px 28px rgba(42,5,5,0.14);
        }
        .btab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          cursor: pointer;
          position: relative;
          transition: color .2s;
          text-decoration: none;
        }
        .btab-label {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 0.58rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 600;
          line-height: 1;
        }
        /* Active gold pip above the tab */
        .btab-active-pip {
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 24px; height: 2px;
          border-radius: 0 0 4px 4px;
          background: linear-gradient(to right, #d4891e, #f0c040);
          opacity: 0;
          transition: opacity .25s, width .25s;
        }
        .btab.active .btab-active-pip { opacity: 1; }

        /* Cart tab special badge */
        .btab-cart-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
        .btab-badge {
          position: absolute;
          top: -6px; right: -8px;
          width: 16px; height: 16px;
          border-radius: 50%;
          font-size: 9px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg,#6b1a1a,#a02828);
          color: #fdf3e3;
          box-shadow: 0 2px 8px rgba(61,10,10,0.45);
        }

      `}</style>

      {/* ══ NAVBAR ══════════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 w-full z-50"
        style={{
          "--hover-color": overHero ? "#ffd7a6" : "#7a1f1f",
          transition: "background .45s ease, border-color .45s ease, box-shadow .45s ease, backdrop-filter .45s ease",
          background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(1.8)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.8)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(200,125,26,0.25)"
            : "1px solid transparent",
          boxShadow: scrolled ? "0 2px 28px rgba(61,10,10,0.10)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between" style={{ height: 68 }}>

            {/* ── LOGO ── */}
            <Link href="/" className="shrink-0 flex items-center gap-2.5 group">
              <div className="relative transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={overHero ? "/ruva_logo_tw.png" : "/ruva_logo_t.png"}
                  alt="Ruva"
                  // width={85}
                  width={55}
                  height={30}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* ── DESKTOP LINKS ── */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(({ label, sectionId }) => (
                <button
                  key={label}
                  type="button"
                  className="nav-link"
                  style={{ color: navColor, background: "transparent", border: "none" }}
                  onClick={() => handleSectionNav(sectionId)}
                >
                  <span className="text-lg">{label}</span>
                </button>
              ))}
            </div>

            {/* ── DESKTOP ICONS ── */}
            <div className="hidden md:flex items-center gap-10">
              <div className="flex items-center gap-2 relative">
                <div className={`search-field ${searchOpen ? "open" : ""}`}>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
                    style={{
                      background: overHero ? "rgba(236,204,255,0.12)" : "rgba(253,243,227,0.9)",
                      backdropFilter: "blur(12px)",
                      borderColor: overHero ? "rgba(242,218,255,0.34)" : "rgba(200,125,26,0.3)",
                      boxShadow: searchOpen ? "0 4px 20px rgba(0,0,0,0.08)" : "none",
                    }}>
                    <VscSearchSparkle size={16} style={{ color: navColor, opacity: 0.7 }} />
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchVal}
                      onChange={e => setSearchVal(e.target.value)}
                      onKeyDown={e => e.key === "Escape" && setSearchOpen(false)}
                      placeholder="Search sarees…"
                      className="bg-transparent outline-none w-full"
                      style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "0.9rem", color: navColor }}
                    />
                  </div>
                </div>
                <button onClick={() => { setSearchOpen(s => !s); if (searchOpen) setSearchVal(""); }}
                  className="transition-transform hover:scale-110" aria-label="Search" style={{ color: navColor }}>
                  {searchOpen ? <X size={19} /> : <VscSearchSparkle size={19} />}
                </button>
              </div>
              <Link href="/wishlist" className="relative transition-transform hover:scale-110" aria-label="Wishlist" style={{ color: navColor }}>
                <FaRegHeart size={18} />
                {hydrated && wishlistCount > 0 && (
                  <span key={wishlistCount} className="badge-pop absolute -top-2 -right-2 flex items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ width: 18, height: 18, background: "linear-gradient(135deg,#6b1a1a,#a02828)", color: "#fdf3e3", boxShadow: "0 2px 8px rgba(61,10,10,0.35)" }}>
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>
              <Link href="/profile" className="transition-transform hover:scale-110" aria-label="Account" style={{ color: navColor }}>
                <FaRegUser />
              </Link>
              <Link href="/cart" className="relative transition-transform hover:scale-110" aria-label="Cart" style={{ color: navColor }}>
                <BsBagHeartFill size={20} />
                {hydrated && cartCount > 0 && (
                  <span key={cartCount} className="badge-pop absolute -top-2 -right-2 flex items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ width: 18, height: 18, background: "linear-gradient(135deg,#6b1a1a,#a02828)", color: "#fdf3e3", boxShadow: "0 2px 8px rgba(61,10,10,0.35)" }}>
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* ══ MOBILE TOP BAR — right side ══ */}
            <div className="md:hidden flex items-center gap-1" style={{ position: "relative", height: 68 }}>

              {/* Search input pill — slides LEFT from icon */}
              <div className={`m-search-wrap ${searchOpen ? "open" : ""}`}
                style={{ color: overHero ? "#fdf3e3" : "#3d0a0a" }}>
                <div className="m-search-inner">
                  <VscSearchSparkle size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchVal}
                    onChange={e => setSearchVal(e.target.value)}
                    onKeyDown={e => { if (e.key === "Escape") { setSearchOpen(false); setSearchVal(""); } }}
                    placeholder="Search sarees…"
                    style={{ color: overHero ? "#fdf3e3" : "#3d0a0a" }}
                  />
                </div>
              </div>

              {/* Search icon button — always visible, top-right */}
              <button
                onClick={() => { setSearchOpen(s => !s); if (searchOpen) setSearchVal(""); }}
                aria-label="Search"
                style={{
                  color: overHero ? "#fdf3e3" : "#3d0a0a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 40, height: 40,
                  transition: "transform .2s",
                }}
              >
                {searchOpen
                  ? <X size={20} strokeWidth={1.8} />
                  : <VscSearchSparkle size={20} />
                }
              </button>
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                style={{
                  color: overHero ? "#fdf3e3" : "#3d0a0a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 40, height: 40, position: "relative",
                }}
              >
                <FaHeart size={17} />
                {hydrated && wishlistCount > 0 && (
                  <span className="badge-pop btab-badge" style={{ top: 4, right: 2, width: 14, height: 14, fontSize: 8 }}>
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>
            </div>

          </div>
        </div>
      </nav>

      {/* ══ MOBILE BOTTOM TAB BAR ══════════════════════════════ */}
      <div className="btab-bar sm:hidden md:hidden lg:hidden flex items-stretch">

        {BOTTOM_TABS.map(({ label, href, Icon, ActiveIcon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          const Ico = isActive ? ActiveIcon : Icon;
          return (
            <Link key={label} href={href} className={`btab ${isActive ? "active" : ""}`}
              style={{ color: isActive ? "#c9853c" : "rgba(90,42,26,0.52)" }}>
              <div className="btab-active-pip" />
              <Ico size={22} />
              <span className="btab-label">{label}</span>
            </Link>
          );
        })}

        {/* Cart tab — separate so badge works */}
        <Link href="/cart" className={`btab ${pathname === "/cart" ? "active" : ""}`}
          style={{ color: pathname === "/cart" ? "#c9853c" : "rgba(90,42,26,0.52)" }}>
          <div className="btab-active-pip" />
          <div className="btab-cart-wrap">
            <BsBagHeartFill size={20} />
            {hydrated && cartCount > 0 && (
              <span key={cartCount} className="badge-pop btab-badge">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </div>
          <span className="btab-label">Cart</span>
        </Link>

      </div>

      {/* ══ MOBILE DRAWER (triggered from Collections or a dedicated menu) ══ */}
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
          <div style={{ height: 3, background: "linear-gradient(to right,transparent,#d4891e 30%,#f0a830 50%,#d4891e 70%,transparent)", flexShrink: 0 }} />
          <div className="flex items-center justify-between px-6 pt-5 pb-2 relative z-10 shrink-0">
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
          <div className="mx-6 my-4 relative z-10" style={{ height: 1, background: "rgba(200,125,26,0.25)" }} />
          <div className="flex-1 flex flex-col justify-center px-8 gap-1 relative z-10">
            {[
              { label: "Home", sectionId: "home" },
              { label: "Shop", sectionId: "shop" },
              { label: "Collections", sectionId: "collections" },
              { label: "Account", href: "/profile" },
              { label: "Wishlist", href: "/wishlist" },
              { label: "Cart", href: "/cart" },
            ].map(({ label, href, sectionId }) => (
              <div key={label} className="mlink">
                <Link
                  href={href || "/"}
                  onClick={(e) => {
                    if (sectionId) {
                      e.preventDefault();
                      handleSectionNav(sectionId);
                      return;
                    }
                    setMobileOpen(false);
                  }}
                  className="flex items-center justify-between py-4 border-b group"
                  style={{ borderColor: "rgba(200,125,26,0.15)" }}>
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
          <div className="shrink-0 px-8 pb-10 relative z-10">
            <div style={{ height: 1, background: "rgba(200,125,26,0.2)", marginBottom: "1rem" }} />
            <p style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(61,10,10,0.42)" }}>Weaving stories since 1947</p>
          </div>
          <div className="absolute bottom-0 right-0 pointer-events-none select-none" style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: "20rem", fontWeight: 700, lineHeight: 1,
            color: "rgba(200,125,26,0.06)", letterSpacing: "-0.05em",
          }}>R</div>
        </div>
      )}
    </>
  );
}