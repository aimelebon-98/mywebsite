import { db } from "@/db";
import { products, type Product } from "@/db/schema";
import { eq, desc, and, isNotNull, gt, sql } from "drizzle-orm";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductScroller from "@/components/ProductScroller";
import SeedButton from "@/components/SeedButton";
import ReviewsSection from "@/components/ReviewsSection";
import RecentlyViewed from "@/components/RecentlyViewed";
import CountdownTimer from "@/components/CountdownTimer";
import {
  ArrowRight, Truck, Shield, RotateCcw, Headphones,
  Flame, Star, Clock, Zap, TrendingUp, Tag, Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

const categories = [
  { name: "Sneakers", slug: "sneakers", emoji: "👟", color: "from-blue-500 to-indigo-600", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
  { name: "Running", slug: "running", emoji: "🏃", color: "from-green-500 to-emerald-600", img: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80" },
  { name: "Formal", slug: "formal", emoji: "👞", color: "from-amber-500 to-orange-600", img: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&q=80" },
  { name: "Boots", slug: "boots", emoji: "🥾", color: "from-red-500 to-rose-600", img: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&q=80" },
  { name: "Sandals", slug: "sandals", emoji: "🩴", color: "from-purple-500 to-violet-600", img: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80" },
  { name: "Casual", slug: "casual", emoji: "👞", color: "from-teal-500 to-cyan-600", img: "https://images.unsplash.com/photo-1604671368394-2240d0b1bb6c?w=400&q=80" },
];

export default async function HomePage() {
  let featuredProducts: Product[] = [];
  let hotDeals: Product[] = [];
  let newArrivals: Product[] = [];
  let onSale: Product[] = [];
  let topRated: Product[] = [];
  let limitedTime: Product[] = [];
  let allProducts: Product[] = [];

  try {
    featuredProducts = await db.select().from(products)
      .where(and(eq(products.active, true), eq(products.featured, true)))
      .orderBy(desc(products.createdAt)).limit(8);

    hotDeals = await db.select().from(products)
      .where(and(eq(products.active, true), sql`${products.tags}::text LIKE '%hot-deal%'`))
      .orderBy(desc(products.reviewCount)).limit(8);

    newArrivals = await db.select().from(products)
      .where(and(eq(products.active, true), sql`${products.tags}::text LIKE '%new-arrival%'`))
      .orderBy(desc(products.createdAt)).limit(8);

    onSale = await db.select().from(products)
      .where(and(eq(products.active, true), isNotNull(products.comparePrice)))
      .orderBy(desc(products.createdAt)).limit(8);

    topRated = await db.select().from(products)
      .where(and(eq(products.active, true), gt(products.rating, "4.5")))
      .orderBy(desc(products.rating)).limit(8);

    limitedTime = await db.select().from(products)
      .where(and(eq(products.active, true), sql`${products.tags}::text LIKE '%limited%'`))
      .orderBy(desc(products.createdAt)).limit(6);

    allProducts = await db.select().from(products)
      .where(eq(products.active, true))
      .orderBy(desc(products.createdAt)).limit(50);
  } catch {
    // Tables might not exist yet
  }

  const hasProducts = allProducts.length > 0;

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
                <div className="relative rounded-[3rem] overflow-hidden aspect-square shadow-2xl">
                  <img
                    src="/images/hero-shoe.jpg"
                    alt="Featured Shoe"
                    className="w-full h-full object-cover"
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

      {/* ============ SEED BUTTON IF NO PRODUCTS ============ */}
      {!hasProducts && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gray-50 rounded-3xl p-12">
              <h3 className="text-2xl font-bold mb-4">No Products Yet</h3>
              <p className="text-gray-500 mb-6">Click below to add 50 sample products, or go to the admin dashboard to add your own.</p>
              <div className="flex justify-center gap-4 flex-wrap">
                <SeedButton />
                <Link href="/admin" className="px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:border-gray-900 transition">
                  Go to Admin
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ 🔥 HOT DEALS ============ */}
      {hotDeals.length > 0 && (
        <section className="py-14 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <Flame className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold">Hot Deals</h2>
                  <p className="text-gray-500 text-sm">Incredible prices, limited time only</p>
                </div>
              </div>
              <Link href="/shop" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:gap-2 transition-all">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductScroller products={hotDeals} badge="HOT" />
          </div>
        </section>
      )}

      {/* ============ CATEGORIES ============ */}
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
                <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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

      {/* ============ ⭐ FEATURED PRODUCTS ============ */}
      {featuredProducts.length > 0 && (
        <section className="py-14 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold">Featured Products</h2>
                  <p className="text-gray-500 text-sm">Hand-picked styles we love</p>
                </div>
              </div>
              <Link href="/shop" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:gap-2 transition-all">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ ⏰ LIMITED TIME OFFER BANNER ============ */}
      {limitedTime.length > 0 && (
        <section className="py-14 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white">
              <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />
              <div className="absolute inset-0 animate-shimmer pointer-events-none" />

              <div className="relative px-6 py-10 lg:px-12 lg:py-14">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-pink-400" />
                      <span className="text-sm font-semibold text-pink-300 uppercase tracking-wider">Limited Time Offer</span>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold mb-2">Flash Sale — Up to 40% Off</h2>
                    <p className="text-purple-200">Don&apos;t miss these exclusive deals before time runs out!</p>
                  </div>
                  <CountdownTimer />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {limitedTime.map((product) => (
                    <Link key={product.id} href={`/product/${product.id}`} className="group bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition">
                      <div className="aspect-square rounded-lg overflow-hidden mb-2">
                        <img src={product.imageUrl || ""} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <p className="text-xs font-semibold text-white truncate">{product.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-sm font-bold text-white">${parseFloat(product.price).toFixed(2)}</span>
                        {product.comparePrice && (
                          <span className="text-xs text-purple-300 line-through">${parseFloat(product.comparePrice).toFixed(2)}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ 🆕 NEW ARRIVALS ============ */}
      {newArrivals.length > 0 && (
        <section className="py-14 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold">New Arrivals</h2>
                  <p className="text-gray-500 text-sm">Fresh styles just dropped</p>
                </div>
              </div>
              <Link href="/shop" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:gap-2 transition-all">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductScroller products={newArrivals} badge="NEW" />
          </div>
        </section>
      )}

      {/* ============ 💰 ON SALE NOW ============ */}
      {onSale.length > 0 && (
        <section className="py-14 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold">On Sale Now</h2>
                  <p className="text-gray-500 text-sm">Great shoes, even better prices</p>
                </div>
              </div>
              <Link href="/shop" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:gap-2 transition-all">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductScroller products={onSale} badge="SALE" />
          </div>
        </section>
      )}

      {/* ============ ⭐ TOP RATED ============ */}
      {topRated.length > 0 && (
        <section className="py-14 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold">Top Rated</h2>
                  <p className="text-gray-500 text-sm">Loved by our customers</p>
                </div>
              </div>
              <Link href="/shop" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:gap-2 transition-all">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {topRated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ ⭐ CUSTOMER REVIEWS ============ */}
      <ReviewsSection />

      {/* ============ 🕐 RECENTLY VIEWED ============ */}
      <RecentlyViewed />

      {/* ============ CTA BANNER ============ */}
      <section className="py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 text-white p-10 lg:p-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">Get 20% Off Your First Order</h2>
                <p className="text-gray-300 mb-8 text-lg">Join thousands of happy customers. Shop the latest styles with free shipping on orders over $100.</p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-2xl font-semibold hover:bg-gray-100 transition"
                  >
                    Shop Now <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/cart"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-2xl font-semibold border border-white/20 hover:bg-white/20 transition"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
              <div className="hidden lg:flex justify-center">
                <div className="grid grid-cols-2 gap-3">
                  {allProducts.slice(0, 4).map((p, i) => (
                    <div key={p.id} className={`w-36 h-36 rounded-2xl overflow-hidden ${i === 1 ? "translate-y-6" : i === 3 ? "translate-y-6" : ""}`}>
                      <img src={p.imageUrl || ""} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
