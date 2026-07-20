import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeProducts from "@/components/HomeProducts";
import { ArrowRight, Truck, Shield, RotateCcw, Headphones, Star } from "lucide-react";

const categories = [
  { name: "Sneakers", slug: "sneakers", emoji: "👟", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
  { name: "Running", slug: "running", emoji: "🏃", img: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80" },
  { name: "Formal", slug: "formal", emoji: "👞", img: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&q=80" },
  { name: "Boots", slug: "boots", emoji: "🥾", img: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&q=80" },
  { name: "Sandals", slug: "sandals", emoji: "👡", img: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80" },
  { name: "Casual", slug: "casual", emoji: "👞", img: "https://images.unsplash.com/photo-1604671368394-2240d0b1bb6c?w=400&q=80" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* ============ HERO SECTION ============ */}
      <section className="relative pt-20 lg:pt-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <span className="inline-block px-4 py-2 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-full mb-6">
                🔥 New Collection 2025
              </span>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
                Walk the <br />
                <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
                  Future
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-md mb-8 leading-relaxed">
                Discover premium footwear crafted for comfort, style, and performance.
                Over 50 styles to choose from. Every step matters.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 transition-all hover:gap-3 shadow-lg shadow-gray-900/20"
                >
                  Shop Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/shop?category=sneakers"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-2xl font-semibold border-2 border-gray-200 hover:border-gray-900 transition-all"
                >
                  Explore Sneakers
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-10">
                <div className="flex -space-x-2">
                  {["bg-blue-500","bg-pink-500","bg-green-500","bg-purple-500"].map((c, i) => (
                    <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 border-white flex items-center justify-center`}>
                      <span className="text-white text-[10px] font-bold">{["JW","SC","MT","EP"][i]}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">2,400+ happy customers</p>
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in-up animation-delay-200">
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-200 via-brand-100 to-brand-50 rounded-[3rem] rotate-6" />
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 via-gray-100 to-white rounded-[3rem] -rotate-3" />
                <div className="relative rounded-[3rem] overflow-hidden aspect-square shadow-2xl bg-gradient-to-br from-brand-100 to-brand-50">
                  <img
                    src="https://images.unsplash.com/photo-1588361861040-ac9b1018f6d5?w=800&q=80"
                    alt="Featured Shoe"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="absolute -bottom-3 -left-3 bg-white rounded-2xl p-3 shadow-xl animate-float">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Truck className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Free Shipping</p>
                      <p className="text-[10px] text-gray-400">Orders $100+</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 bg-white rounded-2xl p-3 shadow-xl animate-float animation-delay-300">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Top Rated</p>
                      <p className="text-[10px] text-gray-400">4.8/5 Stars</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES BAR ============ */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders over $100" },
              { icon: Shield, title: "Secure Payment", desc: "100% protected" },
              { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
              { icon: Headphones, title: "24/7 Support", desc: "Via WhatsApp" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES (always visible) ============ */}
      <section className="py-14 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">Shop by Category</h2>
            <p className="text-gray-500 max-w-md mx-auto">Find the perfect pair for every occasion</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl aspect-square hover:-translate-y-1 transition-all duration-300 shadow-sm"
              >
                <img src={cat.img} alt={cat.name} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-2xl mb-1 block">{cat.emoji}</span>
                  <h3 className="font-bold text-white text-sm">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DYNAMIC PRODUCT SECTIONS (client-side loaded) ============ */}
      <HomeProducts />

      <Footer />
    </main>
  );
}
