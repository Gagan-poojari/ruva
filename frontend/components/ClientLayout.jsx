"use client";

import { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith("/admin");
  const isHome = pathname === "/";

  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          {!isAdminPath && <Navbar />}
          <main className={`grow ${!isAdminPath && !isHome ? "pt-16" : ""}`}>
            {children}
          </main>
          {!isAdminPath && <Footer />}
          <Toaster position="bottom-right" />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
