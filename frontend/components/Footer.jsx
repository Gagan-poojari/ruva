"use client"
import Link from "next/link";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-slate-800 pb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-3xl font-bold heading-fancy text-primary-500 mb-4 inline-block">
              RUVA
            </Link>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Weaving traditions into contemporary elegance. Authentic handloom sarees for your special moments.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-primary-500 transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary-500 transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary-500 transition-colors">
                <FaXTwitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4 text-slate-100">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-slate-400 hover:text-white transition-colors">Shop All</Link></li>
              <li><Link href="/collections" className="text-slate-400 hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4 text-slate-100">Customer Care</h4>
            <ul className="space-y-3">
              <li><Link href="/track" className="text-slate-400 hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/shipping" className="text-slate-400 hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link href="/returns" className="text-slate-400 hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/faq" className="text-slate-400 hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-slate-100">Newsletter</h4>
            <p className="text-slate-400 mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-slate-800 text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary-500 w-full"
              />
              <button 
                type="submit"
                className="bg-primary-600 hover:bg-primary-500 px-4 py-2 rounded-r-md transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} RUVA. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
