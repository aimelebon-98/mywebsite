import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Star, Package, Plane, DollarSign, TrendingUp, Home, Percent, Sparkles, Footprints } from "lucide-react";

export default function KongaHero() {
  const t = useTranslations("Index");

  const quickLinks = [
    { name: "Verified Best", color: "bg-blue-100", textColor: "text-blue-600", icon: Star },
    { name: "Bulk Drops", color: "bg-purple-100", textColor: "text-purple-600", icon: Package },
    { name: "Fast Delivery", color: "bg-orange-100", textColor: "text-orange-600", icon: Plane },
    { name: "Buy More", color: "bg-pink-100", textColor: "text-pink-600", icon: DollarSign },
    { name: "Flash Sales", color: "bg-yellow-100", textColor: "text-yellow-600", icon: TrendingUp },
    { name: "Essentials", color: "bg-zinc-200", textColor: "text-zinc-600", icon: Home },
    { name: "Hot Deals", color: "bg-red-100", textColor: "text-red-600", icon: Percent },
    { name: "Arrivals", color: "bg-emerald-100", textColor: "text-emerald-600", icon: Sparkles }
  ];

  return (
    <section className="w-full max-w-full overflow-x-hidden bg-zinc-50 pt-4 pb-8">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">
        {/* Top Grid Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-full">

          {/* Main Banner - Left (Spans 8 cols) */}
          <div className="lg:col-span-8 relative bg-zinc-900 rounded-xl overflow-hidden min-h-[350px] lg:min-h-[440px] flex items-center w-full min-w-0 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-[#CA3F2E] to-[#8B2A1E]"></div>
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-black/10 skew-x-12 transform translate-x-20"></div>

            <div className="relative z-10 p-8 md:p-12 text-white w-full md:w-3/4 min-w-0">
              <span className="inline-block px-3 py-1 bg-white text-[#CA3F2E] text-xs font-extrabold uppercase tracking-widest rounded mb-6 shadow-sm">
                Brand Day
              </span>
              <h2 className="text-4xl md:text-6xl font-bold mb-4 font-playfair leading-[1.1]">
                Built for Easy<br />Performance
              </h2>
              <div className="bg-zinc-900 text-white font-bold text-xl md:text-2xl px-5 py-2 inline-block mb-8 transform -skew-x-12 shadow-lg">
                <span className="block transform skew-x-12">UP TO 40% OFF</span>
              </div>
              <div>
                <Link href="/shop" className="inline-block bg-white text-zinc-900 hover:bg-zinc-100 px-8 py-3.5 rounded-full font-bold transition-colors shadow-md">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

          {/* Right Grid - 4 small banners (Spans 4 cols) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-4 w-full min-w-0 max-w-full">
            {/* Block 1 */}
            <Link href="/shop/sneakers" className="relative bg-zinc-900 rounded-xl overflow-hidden flex flex-col items-center justify-center group aspect-square min-w-0 shadow-sm">
              <div className="absolute inset-0 bg-zinc-800 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10 text-center px-4 flex flex-col items-center">
                <span className="inline-flex w-12 h-12 bg-white rounded-full mb-3 shadow-md items-center justify-center text-zinc-900">
                  <Footprints className="w-6 h-6" />
                </span>
                <h3 className="text-white font-bold text-base md:text-lg mb-1">Sneakers</h3>
                <span className="text-[#CA3F2E] text-xs font-bold uppercase tracking-wider">Shop Now &gt;</span>
              </div>
            </Link>

            {/* Block 2 */}
            <Link href="/shop?sort=discount" className="relative bg-[#00472f] rounded-xl overflow-hidden flex flex-col items-center justify-center group aspect-square min-w-0 shadow-sm">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-300 to-transparent"></div>
              <div className="relative z-10 text-center px-2">
                <p className="text-emerald-300 text-[10px] md:text-xs font-bold uppercase mb-1 tracking-wider">Xclusive Deals</p>
                <h3 className="text-white font-black text-xl md:text-2xl mb-1 leading-none">EXTRA</h3>
                <h3 className="text-yellow-400 font-black text-2xl md:text-3xl mb-3">10% OFF</h3>
                <span className="bg-yellow-400 text-zinc-900 text-[11px] md:text-xs font-bold py-1.5 px-3 md:px-4 rounded shadow-sm">Apply Code</span>
              </div>
            </Link>

            {/* Block 3 */}
            <Link href="/shop/running" className="relative bg-[#ffe5d9] rounded-xl overflow-hidden flex flex-col items-center justify-center group aspect-square min-w-0 shadow-sm">
              <div className="relative z-10 text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 mx-auto bg-pink-500 rounded-full flex items-center justify-center mb-3 shadow-md transform group-hover:rotate-12 transition-transform duration-300">
                   <span className="text-white font-black text-[9px] md:text-[10px] text-center leading-[1.1] tracking-wider">GENUINE<br/>PRODUCTS</span>
                </div>
                <h3 className="text-zinc-900 font-bold text-sm md:text-base">Quality Assured</h3>
              </div>
            </Link>

            {/* Block 4 */}
            <Link href="/shop/formal" className="relative bg-zinc-950 rounded-xl overflow-hidden flex flex-col items-center justify-center group aspect-square min-w-0 shadow-sm">
              <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-700 to-zinc-950 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10 text-center px-4">
                <h3 className="text-white font-bold text-base md:text-lg mb-3">Premium<br/>Formal</h3>
                <span className="bg-[#CA3F2E] text-white text-xs font-bold py-1.5 px-4 rounded-full shadow-sm">Explore</span>
              </div>
            </Link>
          </div>

        </div>

        {/* Bottom Quick Links Row - Mobile Overflow Safe */}
        <div className="mt-6 md:mt-8 -mx-4 px-4 sm:mx-0 sm:px-0 max-w-full">
          <div className="flex overflow-x-auto gap-3 md:gap-5 pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] max-w-full">
            {quickLinks.map((item, i) => {
              const Icon = item.icon;
              return (
                <Link key={i} href="/shop" className="flex flex-col items-center gap-2 md:gap-3 min-w-[85px] md:min-w-[110px] snap-start group">
                  <div className={`w-16 h-16 md:w-20 md:h-20 ${item.color} rounded-2xl flex items-center justify-center shadow-sm group-hover:-translate-y-1 transition-transform duration-300`}>
                    <div className="transform group-hover:scale-110 transition-transform duration-300">
                      <Icon className={`w-7 h-7 md:w-9 md:h-9 ${item.textColor}`} />
                    </div>
                  </div>
                  <span className="text-[11px] md:text-sm font-bold text-center text-zinc-700 leading-tight">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}