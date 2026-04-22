import Link from 'next/link';

export default function CollectionsPage() {
  const collections = [
    { 
      name: 'Bridal', 
      image: 'https://images.unsplash.com/photo-1615886753866-79396abc446e?q=80&w=800', 
      desc: 'Exquisite designs for your special day. Intricate zari work and rich fabrics.' 
    },
    { 
      name: 'Kanjivaram', 
      image: 'https://images.unsplash.com/photo-1583391733958-d25e07fac0fa?q=80&w=800', 
      desc: 'Classic, pure silk sarees from South India featuring traditional motifs.' 
    },
    { 
      name: 'Ready Made Blouses', 
      image: 'https://images.unsplash.com/photo-1601058223632-15962804b9c1?q=80&w=800', 
      desc: 'Perfectly tailored ready-to-wear blouses in various contemporary styles.' 
    },
    { 
      name: 'Banarasi', 
      image: 'https://images.unsplash.com/photo-1610189013511-37b51bc5e902?q=80&w=800', 
      desc: 'Opulent silk sarees with elaborate gold and silver brocade.' 
    },
    { 
      name: 'Party Wear', 
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800', 
      desc: 'Modern, lightweight and glamorous sarees for evening events.' 
    },
    { 
      name: 'Cotton', 
      image: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=800', 
      desc: 'Breathable, comfortable and elegant handloom cotton sarees for daily wear.' 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Collections</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">Discover our carefully curated selection of fine sarees, crafted with tradition and modern elegance.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((col, idx) => (
            <Link href={`/shop?category=${encodeURIComponent(col.name)}`} key={idx} className="group cursor-pointer">
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                <div className="h-64 overflow-hidden bg-gray-200 relative">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                  <img src={col.image} alt={col.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">{col.name}</h3>
                  <p className="text-gray-500 leading-relaxed">{col.desc}</p>
                  <div className="mt-auto pt-6 text-[#1a0a2e] font-medium flex items-center gap-1 group-hover:gap-3 transition-all">
                    Explore Collection <span className="text-xl">→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
