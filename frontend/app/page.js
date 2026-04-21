import Link from "next/link";
import { ArrowRight, ShoppingBag, Star } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import MidPart from "@/components/MidPart";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <MidPart />
      
    </div>
  );
}