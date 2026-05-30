"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/** Post-login / post-register destination for order history (profile orders tab). */
export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?redirect=/orders");
      return;
    }
    router.replace("/profile?tab=orders");
  }, [user, loading, router]);

  return null;
}
