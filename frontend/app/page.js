import HeroSection from "@/components/HeroSection";
import About from "@/components/About";
import Footer from "@/components/Footer";
import Categories from "@/components/Categories";
import Reviews from "@/components/Reviews";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <Categories />
      <Reviews />
      <About />
      {/* <Footer /> */}
    </div>
  );
}