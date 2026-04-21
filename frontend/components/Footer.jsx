"use client";

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full overflow-hidden bg-[#1a0505] text-[#fdf3e3]">
      {/* ─── Aesthetic Overlays ─── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')" }} />

      {/* Top Border Shimmer (Matching the MidPart style) */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#c87d1a]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">

          {/* Brand Pillar */}
          <div className="lg:col-span-4">
            {/* <Link href="/" className="inline-block mb-6">
              <span className="text-4xl font-bold tracking-tighter" 
                    style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.1em" }}>
                RUVA
              </span>
            </Link> */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2.5 group">
              {/* Logo mark */}
              <div className="relative transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/ruva_logo_tw.png"
                  alt="Ruva"
                  width={85}
                  height={30}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <p className="text-[#fdf3e3]/60 mb-8 max-w-sm leading-relaxed italic"
              style={{ fontFamily: "'Lora', serif" }}>
              "Every thread holds a story, every drape carries a legacy. Weaving the soul of India into the heart of the modern woman."
            </p>
            <div className="flex space-x-5">
              {[
                { icon: <FaFacebookF size={18} />, href: "#" },
                { icon: <FaInstagram size={18} />, href: "#" },
                { icon: <FaXTwitter size={18} />, href: "#" }
              ].map((social, i) => (
                <a key={i} href={social.href}
                  className="w-10 h-10 rounded-full border border-[#fdf3e3]/20 flex items-center justify-center hover:bg-[#c87d1a] hover:border-[#c87d1a] hover:text-[#1a0505] transition-all duration-300">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-[#c87d1a] font-bold uppercase tracking-widest text-[10px] mb-6"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}>Collections</h4>
              <ul className="space-y-4 text-sm" style={{ fontFamily: "'Lora', serif" }}>
                <li><Link href="/shop" className="hover:text-[#c87d1a] transition-colors">The Wedding Edit</Link></li>
                <li><Link href="/collections" className="hover:text-[#c87d1a] transition-colors">Banarasi Masterpieces</Link></li>
                <li><Link href="/collections" className="hover:text-[#c87d1a] transition-colors">Pure Kanchipuram</Link></li>
                <li><Link href="/about" className="hover:text-[#c87d1a] transition-colors">The Weaver's Story</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#c87d1a] font-bold uppercase tracking-widest text-[10px] mb-6"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}>Concierge</h4>
              <ul className="space-y-4 text-sm" style={{ fontFamily: "'Lora', serif" }}>
                <li><Link href="/track" className="hover:text-[#c87d1a] transition-colors">Shipping & Delivery</Link></li>
                <li><Link href="/returns" className="hover:text-[#c87d1a] transition-colors">Exchanges</Link></li>
                <li><Link href="/faq" className="hover:text-[#c87d1a] transition-colors">Saree Care Guide</Link></li>
                <li><Link href="/contact" className="hover:text-[#c87d1a] transition-colors">Contact Expert</Link></li>
              </ul>
            </div>
          </div>

          {/* Newsletter Pillar */}
          <div className="lg:col-span-3">
            <h4 className="text-[#c87d1a] font-bold uppercase tracking-widest text-[10px] mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>Join the Inner Circle</h4>
            <p className="text-xs text-[#fdf3e3]/50 mb-6 leading-relaxed">
              Sign up for early access to new looms and heritage collection previews.
            </p>
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-transparent border-b border-[#fdf3e3]/20 py-3 text-sm focus:outline-none focus:border-[#c87d1a] transition-colors placeholder:text-[#fdf3e3]/20"
              />
              <button
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#c87d1a] hover:text-[#fdf3e3] transition-colors font-bold text-xs uppercase tracking-widest"
              >
                Join
              </button>
            </form>

            <div className="mt-8 space-y-3 text-[11px] text-[#fdf3e3]/40" style={{ fontFamily: "'Lora', serif" }}>
              <div className="flex items-center gap-3"><MapPin size={14} className="text-[#c87d1a]" /> Varanasi • Kanchipuram • Bengaluru</div>
              <div className="flex items-center gap-3"><Phone size={14} className="text-[#c87d1a]" /> +91 (800) 123 4567</div>
              <div className="flex items-center gap-3"><Mail size={14} className="text-[#c87d1a]" /> concierge@ruva.com</div>
            </div>
          </div>
        </div>

        {/* ─── Bottom Bar ─── */}
        <div className="pt-10 border-t border-[#fdf3e3]/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] tracking-widest uppercase text-[#fdf3e3]/30">
            &copy; {currentYear} RUVA Heritage. Handcrafted in India.
          </p>

          {/* Payment Icons / Trust */}
          <div className="flex items-center gap-6 opacity-30 grayscale contrast-125">
            <span className="text-[10px] tracking-tighter border border-current px-2 py-0.5">SILK MARK</span>
            <span className="text-[10px] tracking-tighter border border-current px-2 py-0.5">VISA</span>
            <span className="text-[10px] tracking-tighter border border-current px-2 py-0.5">AMEX</span>
          </div>

          <div className="flex space-x-8 text-[10px] tracking-widest uppercase text-[#fdf3e3]/40 font-medium">
            <Link href="/privacy" className="hover:text-[#c87d1a] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#c87d1a] transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}