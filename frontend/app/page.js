import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient/image placeholder */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-800/80 z-10" />
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610030469983-98e550d615ef?q=80&w=2000')] bg-cover bg-center"
        />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-16 animate-fade-in-up">
          <span className="text-accent-gold-light uppercase tracking-widest text-sm font-semibold mb-4 block">
            The Wedding Collection 2026
          </span>
          <h1 className="heading-fancy text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Elegance <span className="italic text-accent-gold">Woven</span> In <br/> Every Thread
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-light">
            Discover our exclusive collection of traditional Kanchipuram, Banarasi, and designer sarees crafted for your most precious moments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="group bg-accent-gold hover:bg-white text-primary-900 hover:text-primary-900 px-8 py-4 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 shadow-lg"
            >
              Shop New Arrivals
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/collections"
              className="glass px-8 py-4 rounded-full font-medium text-white hover:bg-white/20 transition-all duration-300"
            >
              View Lookbook
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="heading-fancy text-3xl md:text-5xl font-bold mb-4 text-gradient">
            Shop by Category
          </h2>
          <p className="text-foreground/60 max-w-xl mx-auto">
            Traditional heirlooms or contemporary chic. Find the perfect drape for your unique style.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Banarasi Silk",
              img: "https://images.unsplash.com/photo-1583391733958-692b1baecd11?q=80&w=800",
            },
            {
              title: "Kanchipuram",
              img: "https://images.unsplash.com/photo-1623091410901-00e2d268901e?q=80&w=800",
            },
            {
              title: "Wedding Wear",
              img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800",
            },
          ].map((cat, i) => (
            <div key={i} className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10 duration-500" />
              <img
                src={cat.img}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-8">
                <h3 className="heading-fancy text-2xl font-bold text-white mb-2">{cat.title}</h3>
                <span className="text-white/80 uppercase tracking-widest text-xs opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  Explore
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="py-20 bg-primary-50 dark:bg-slate-900/50 w-full">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="heading-fancy text-3xl md:text-4xl font-bold mb-2">Our Bestsellers</h2>
              <p className="text-foreground/60">Loved by brides and connoisseurs alike</p>
            </div>
            <Link href="/shop" className="hidden md:flex text-primary-600 hover:text-primary-700 font-medium items-center gap-2 group">
              View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-border group">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <div className="absolute top-3 left-3 z-10 bg-white/90 dark:bg-black/50 backdrop-blur block px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-md text-primary-600">
                    Bestseller
                  </div>
                  <img
                    src={`https://images.unsplash.com/photo-1610030469983-98e550d615ef?q=80&w=400&auto=format&fit=crop&sig=${item}`}
                    alt="Saree"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Quick Add Button */}
                  <div className="absolute bottom-0 inset-x-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button className="w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur text-foreground font-semibold py-3 flex justify-center items-center gap-2 rounded-lg hover:bg-primary-600 hover:text-white transition-colors">
                      <ShoppingBag size={18} /> Quick Add
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg hover:text-primary-600 transition-colors line-clamp-1">
                        Royal Kanchipuram Silk Saree
                      </h3>
                      <p className="text-sm text-foreground/60">Bridal Wear</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-primary-700 dark:text-primary-400">₹14,999</span>
                      <span className="text-sm text-foreground/40 line-through">₹18,999</span>
                    </div>
                    <div className="flex text-accent-gold">
                      <Star size={16} fill="currentColor" />
                      <span className="text-sm text-foreground/80 ml-1">4.9</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
