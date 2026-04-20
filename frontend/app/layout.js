"use client";

import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar.jsx";
import Footer from "@/components/Footer.jsx";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { usePathname } from "next/navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith("/admin");

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col transition-colors duration-300">
        <AuthProvider>
          <CartProvider>
            {!isAdminPath && <Navbar />}
            <main className={`flex-grow ${!isAdminPath ? "pt-16" : ""}`}>
              {children}
            </main>
            {!isAdminPath && <Footer />}
            <Toaster position="bottom-right" />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
