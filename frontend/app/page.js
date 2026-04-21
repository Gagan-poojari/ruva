import HeroSection from "@/components/HeroSection";
import About from "@/components/About";
import Footer from "@/components/Footer";
import Categories from "@/components/Categories";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <Categories />
      <About />
      <Footer />
    </div>
  );
}