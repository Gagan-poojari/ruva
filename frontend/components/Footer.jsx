"use client";

import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const handleJoin = (e) => {
    e.preventDefault();
    if (email) { setJoined(true); setEmail(""); }
  };

  return (
    <footer className="relative w-full overflow-hidden" style={{
      background: "linear-gradient(180deg, #060208 0%, #07030d 50%, #040108 100%)",
      color: "#fdf3e3",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Lora:ital,wght@0,400;0,500&display=swap');

        @keyframes goldShimmer {
          0%  { background-position:-200% center; }
          100%{ background-position: 200% center; }
        }
        .footer-link {
          color: rgba(253,243,227,0.45);
          font-family: 'Lora', Georgia, serif;
          font-size: 0.88rem;
          transition: color .22s;
          line-height: 1;
        }
        .footer-link:hover { color: #d4a017; }

        .social-btn {
          width:40px; height:40px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          border: 1px solid rgba(212,160,23,0.2);
          color: rgba(253,243,227,0.5);
          transition: background .25s, border-color .25s, color .25s, transform .2s;
        }
        .social-btn:hover {
          background: #d4a017;
          border-color: #d4a017;
          color: #1a0800;
          transform: translateY(-2px);
        }

        .newsletter-input {
          width:100%; background:transparent;
          border-bottom: 1px solid rgba(212,160,23,0.2);
          padding-bottom:10px; font-size:0.88rem;
          color:#fdf3e3; outline:none;
          font-family:'Lora',Georgia,serif;
          transition:border-color .25s;
        }
        .newsletter-input::placeholder { color:rgba(253,243,227,0.2); }
        .newsletter-input:focus { border-color:rgba(212,160,23,0.6); }

        .join-btn {
          color:#d4a017; font-size:0.65rem; letter-spacing:.18em;
          text-transform:uppercase; font-weight:600;
          font-family:'Cormorant Garamond',Georgia,serif;
          transition:color .2s;
        }
        .join-btn:hover { color:#f5d060; }

        .payment-badge {
          font-size:0.6rem; letter-spacing:.12em; text-transform:uppercase;
          border:1px solid rgba(253,243,227,0.15);
          padding:3px 8px; border-radius:3px;
          color:rgba(253,243,227,0.28);
        }
      `}</style>

      {/* ── Brocade overlay ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity:.04 }}>
        <defs>
          <pattern id="fp" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M32 5  L35 17 L32 24 L29 17 Z"  fill="#d4a017"/>
            <path d="M32 40 L35 47 L32 59 L29 47 Z"  fill="#d4a017"/>
            <path d="M5 32  L17 29 L24 32 L17 35 Z"  fill="#d4a017"/>
            <path d="M40 32 L47 29 L59 32 L47 35 Z"  fill="#d4a017"/>
            <path d="M32 26 L37 32 L32 38 L27 32 Z"  fill="#d4a017" opacity=".9"/>
            <circle cx="32" cy="32" r="2" fill="#d4a017" opacity=".45"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#fp)"/>
      </svg>

      {/* ── Ambient radial glow ── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background:"radial-gradient(ellipse 80% 40% at 50% 0%, rgba(212,160,23,0.055) 0%, transparent 60%)",
      }}/>

      {/* ── Gold top rule ── */}
      <div style={{
        height:1,
        background:"linear-gradient(to right, transparent, rgba(212,160,23,0.45) 25%, rgba(212,160,23,0.75) 50%, rgba(212,160,23,0.45) 75%, transparent)",
      }}/>

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 mb-16">

          {/* ── Brand pillar ── */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3 group w-fit">
                <Image src="/ruva_logo_tw.png" width={85} height={25} alt="Ruva Handlooms" className="object-contain" priority/>
              
            </Link>

            {/* Pull quote */}
            <blockquote style={{
              fontFamily:"'Lora',Georgia,serif",
              fontSize:"0.9rem", lineHeight:1.85,
              color:"rgba(253,243,227,0.42)", fontStyle:"italic",
              borderLeft:"2px solid rgba(212,160,23,0.25)",
              paddingLeft:"1rem", maxWidth:"320px",
            }}>
              "Every thread holds a story, every drape carries a legacy — weaving the soul of India into the heart of the modern woman."
            </blockquote>

            {/* Socials */}
            <div className="flex gap-3">
              {[
                { icon:<FaFacebookF size={16}/>, href:"#", label:"Facebook" },
                { icon:<FaInstagram size={16}/>, href:"#", label:"Instagram" },
                { icon:<FaXTwitter  size={16}/>, href:"#", label:"X" },
              ].map(({ icon, href, label }) => (
                <a key={label} href={href} aria-label={label} className="social-btn">{icon}</a>
              ))}
            </div>
          </div>

          {/* ── Navigation ── */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-10">

            <div>
              <h4 style={{
                fontFamily:"'Cormorant Garamond',Georgia,serif",
                fontSize:"0.62rem", fontWeight:700,
                letterSpacing:"0.28em", textTransform:"uppercase",
                color:"rgba(212,160,23,0.65)", marginBottom:"1.5rem",
              }}>Collections</h4>
              <ul className="flex flex-col gap-4">
                {[
                  { label:"The Wedding Edit",      href:"/shop" },
                  { label:"Banarasi Masterpieces", href:"/collections" },
                  { label:"Pure Kanchipuram",      href:"/collections" },
                  { label:"The Weaver's Story",    href:"/about" },
                ].map(({ label, href }) => (
                  <li key={label}><Link href={href} className="footer-link">{label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{
                fontFamily:"'Cormorant Garamond',Georgia,serif",
                fontSize:"0.62rem", fontWeight:700,
                letterSpacing:"0.28em", textTransform:"uppercase",
                color:"rgba(212,160,23,0.65)", marginBottom:"1.5rem",
              }}>Concierge</h4>
              <ul className="flex flex-col gap-4">
                {[
                  { label:"Shipping & Delivery", href:"/track" },
                  { label:"Returns & Exchange",  href:"/returns" },
                  { label:"Saree Care Guide",    href:"/faq" },
                  { label:"Contact an Expert",   href:"/contact" },
                ].map(({ label, href }) => (
                  <li key={label}><Link href={href} className="footer-link">{label}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Newsletter + Contact ── */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            <div>
              <h4 style={{
                fontFamily:"'Cormorant Garamond',Georgia,serif",
                fontSize:"0.62rem", fontWeight:700,
                letterSpacing:"0.28em", textTransform:"uppercase",
                color:"rgba(212,160,23,0.65)", marginBottom:"0.75rem",
              }}>Join the Inner Circle</h4>
              <p style={{
                fontFamily:"'Lora',Georgia,serif", fontSize:"0.8rem",
                color:"rgba(253,243,227,0.32)", lineHeight:1.65, marginBottom:"1.2rem",
              }}>Early access to new looms and heritage collection previews.</p>

              {joined ? (
                <p style={{
                  fontFamily:"'Cormorant Garamond',Georgia,serif",
                  fontSize:"0.9rem", color:"rgba(212,160,23,0.75)",
                  fontStyle:"italic",
                }}>Welcome to the circle. ✦</p>
              ) : (
                <form className="relative" onSubmit={handleJoin}>
                  <input
                    type="email"
                    value={email}
                    onChange={e=>setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="newsletter-input"
                  />
                  <button type="submit" className="join-btn absolute right-0 top-1/2 -translate-y-1/2">
                    Join →
                  </button>
                </form>
              )}
            </div>

            {/* Contact details */}
            <div className="flex flex-col gap-3">
              {[
                { icon:<MapPin size={13}/>,  text:"Varanasi · Kanchipuram · Bengaluru" },
                { icon:<Phone size={13}/>,   text:"+91 (800) 123 4567" },
                { icon:<Mail size={13}/>,    text:"concierge@ruva.com" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3" style={{
                  fontFamily:"'Lora',Georgia,serif", fontSize:"0.78rem",
                  color:"rgba(253,243,227,0.32)",
                }}>
                  <span style={{ color:"rgba(212,160,23,0.55)", flexShrink:0 }}>{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{ height:1, background:"linear-gradient(to right,transparent,rgba(212,160,23,0.12) 30%,rgba(212,160,23,0.12) 70%,transparent)", marginBottom:"2rem" }}/>

        <div className="flex flex-col md:flex-row items-center justify-between gap-5">

          <p style={{
            fontFamily:"'Lora',Georgia,serif",
            fontSize:"0.65rem", letterSpacing:"0.14em",
            textTransform:"uppercase", color:"rgba(253,243,227,0.22)",
          }}>&copy; {year} RUVA Heritage. Handcrafted in India.</p>

          {/* Trust badges */}
          <div className="flex items-center gap-3 opacity-50">
            <span className="payment-badge">Silk Mark</span>
            <span className="payment-badge">Visa</span>
            <span className="payment-badge">Mastercard</span>
            <span className="payment-badge">UPI</span>
          </div>

          {/* Legal */}
          <div className="flex gap-6">
            {[
              { label:"Privacy", href:"/privacy" },
              { label:"Terms",   href:"/terms" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} style={{
                fontFamily:"'Cormorant Garamond',Georgia,serif",
                fontSize:"0.65rem", letterSpacing:"0.16em",
                textTransform:"uppercase", color:"rgba(253,243,227,0.24)",
                transition:"color .2s",
              }}
              className="hover:text-[#d4a017]">{label}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Decorative R watermark ── */}
      <div className="absolute bottom-0 right-0 pointer-events-none select-none overflow-hidden" style={{
        fontFamily:"'Cormorant Garamond',Georgia,serif",
        fontSize:"22rem", fontWeight:700, lineHeight:0.85,
        color:"rgba(212,160,23,0.025)",
        letterSpacing:"-0.05em",
      }}>R</div>
    </footer>
  );
}