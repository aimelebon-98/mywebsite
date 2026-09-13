"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Package,
  Zap,
  Percent,
  Flame,
  Footprints,
  ShoppingBag,
  Truck,
  CreditCard,
  Building2,
  Tv,
  Heart,
  Plane,
  Dumbbell,
  Gamepad2,
} from "lucide-react";

const SLIDES = [
  {
    id: 1,
    bg: "bg-gradient-to-r from-[#f5e6c8] via-[#f0d4a8] to-[#ed017f]",
    brand: "Feel at home",
    title: "FLASH SALE",
    subtitle: "live better. walk better",
    saveBadge: "SAVE 20%",
    priceOld: "NGN 89,000",
    priceNew: "NGN 71,200",
    productLabel: "PREMIUM SNEAKERS",
    slogan: "Every Step Matters.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80",
    cta: "/shop",
  },
  {
    id: 2,
    bg: "bg-gradient-to-r from-zinc-950 via-zinc-900 to-[#8B2A1E]",
    brand: "Brand Day",
    title: "BUILT FOR EASY PERFORMANCE",
    subtitle: "premium footwear for streets & trails",
    saveBadge: "UP TO 40% OFF",
    priceOld: "NGN 65,000",
    priceNew: "NGN 39,000",
    productLabel: "RUNNING COLLECTION",
    slogan: "Walk The Future.",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&auto=format&fit=crop&q=80",
    cta: "/shop?category=running",
  },
  {
    id: 3,
    bg: "bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
    brand: "New Collection",
    title: "FORMAL ESSENTIALS",
    subtitle: "crafted leather. timeless style",
    saveBadge: "SAVE 25%",
    priceOld: "NGN 55,000",
    priceNew: "NGN 41,250",
    productLabel: "OXFORDS & LOAFERS",
    slogan: "Dress To Impress.",
    image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=900&auto=format&fit=crop&q=80",
    cta: "/shop?category=formal",
  },
  {
    id: 4,
    bg: "bg-gradient-to-r from-[#2d1b00] via-[#5c3d1e] to-[#CA3F2E]",
    brand: "Hot Drop",
    title: "BOOTS SEASON",
    subtitle: "rugged soles. all-day comfort",
    saveBadge: "FLAT 30% OFF",
    priceOld: "NGN 78,000",
    priceNew: "NGN 54,600",
    productLabel: "ANKLE & COMBAT BOOTS",
    slogan: "Step Into Adventure.",
    image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=900&auto=format&fit=crop&q=80",
    cta: "/shop?category=boots",
  },
];

const CATEGORY_BADGES = [
  { name: "Verified Best Prices", badgeText: "VERIFIED", bgClass: "bg-gradient-to-b from-red-50 to-pink-100 border-2 border-pink-400", icon: ShieldCheck, iconColor: "text-red-600" },
  { name: "Bulk Price Drops", badgeText: "PRICE DROPS", bgClass: "bg-amber-900", icon: Package, iconColor: "text-amber-300" },
  { name: "NDZ Now", badgeText: "SAME DAY", bgClass: "bg-zinc-900", icon: Zap, iconColor: "text-pink-500" },
  { name: "Buy More. Save More", badgeText: "BUY MORE", bgClass: "bg-black", icon: Percent, iconColor: "text-yellow-400" },
  { name: "Flash Sales Reloaded", badgeText: "RELOADED", bgClass: "bg-gradient-to-br from-yellow-400 to-amber-700", icon: Flame, iconColor: "text-black" },
  { name: "Home Essentials", badgeText: "ESSENTIALS", bgClass: "bg-slate-200", icon: Footprints, iconColor: "text-slate-700" },
  { name: "Groceries", badgeText: "FRESH", bgClass: "bg-orange-50 border border-orange-200", icon: ShoppingBag, iconColor: "text-orange-600" },
  { name: "Hot Deals", badgeText: "HOT", bgClass: "bg-gradient-to-br from-orange-600 via-red-600 to-black", icon: Flame, iconColor: "text-yellow-300" },
  { name: "Sports & Fitness", badgeText: "ACTIVE", bgClass: "bg-emerald-900", icon: Dumbbell, iconColor: "text-emerald-400" },
  { name: "Gaming", badgeText: "HYPE", bgClass: "bg-purple-950 border border-purple-800", icon: Gamepad2, iconColor: "text-purple-400" },
];

const SERVICE_STRIP = [
  { label: "TRAVEL", icon: Plane, color: "text-orange-500" },
  { label: "NDZPay", icon: CreditCard, color: "text-pink-600" },
  { label: "NDZ Corporate", icon: Building2, color: "text-amber-500" },
  { label: "NDZ Health", icon: Heart, color: "text-red-500" },
  { label: "LOGISTICS", icon: Truck, color: "text-pink-500" },
  { label: "GROCERIES", icon: ShoppingBag, color: "text-pink-500" },
  { label: "NDZ TV", icon: Tv, color: "text-pink-600" },
  { label: "NDZ NOW", icon: Zap, color: "text-orange-500" },
];

function SideSkin() {
  return (
    <div className="h-full min-h-[520px] w-full bg-black text-white flex flex-col items-center justify-between py-8 px-3 select-none">
      <div className="flex flex-col items-center gap-6 w-full">
        <span className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-none">
          NDZ
        </span>
        <span className="bg-white text-[#ed017f] text-sm font-black px-4 py-1.5 rounded-sm tracking-wide">
          Brand Day
        </span>
        <p className="text-center text-base md:text-lg font-extrabold leading-snug text-zinc-100 max-w-[140px]">
          Built for Easy Performance
        </p>
      </div>
      <div className="w-full bg-[#ed017f] text-white font-black text-center py-2.5 px-2 text-sm uppercase tracking-wider">
        UP TO 40% OFF
      </div>
    </div>
  );
}

export default function KongaHero() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    setActiveSlide((idx + SLIDES.length) % SLIDES.length);
  }, []);

  const next = useCallback(() => goTo(activeSlide + 1), [activeSlide, goTo]);
  const prev = useCallback(() => goTo(activeSlide - 1), [activeSlide, goTo]);

  // Auto-slide every 4.5s
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setActiveSlide((s) => (s + 1) % SLIDES.length);
    }, 4500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, activeSlide]);

  const handleBadgeScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  const cur = SLIDES[activeSlide];

  return (
    <section className="w-full max-w-full overflow-x-hidden bg-[#e8e8e8] relative">
      {/* OUTER 3-COLUMN LAYOUT: LEFT SKIN | CENTER | RIGHT SKIN */}
      <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-[160px_minmax(0,1fr)_160px] 2xl:grid-cols-[180px_minmax(0,1fr)_180px]">
        
        {/* LEFT SIDE SKIN */}
        <div className="hidden xl:block sticky top-0 h-fit">
          <Link href="/shop" className="block h-full">
            <SideSkin />
          </Link>
        </div>

        {/* CENTER CONTENT */}
        <div className="min-w-0 max-w-full bg-[#f2f2f2] px-2 sm:px-3 pt-3 pb-3">
          
          {/* TOP: MAIN SLIDER + 2x2 CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch max-w-full">
            
            {/* MAIN SLIDER (8 cols) */}
            <div
              className="lg:col-span-8 relative rounded-xl overflow-hidden shadow-sm min-h-[340px] sm:min-h-[380px] lg:min-h-[410px] min-w-0"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {SLIDES.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    idx === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  } ${slide.bg}`}
                >
                  <div className="relative w-full h-full flex flex-col md:flex-row text-white p-5 sm:p-7">
                    {/* Left copy */}
                    <div className="flex-1 flex flex-col justify-between z-10 min-w-0 md:pr-4">
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-white/90 mb-1">
                          {slide.brand}
                        </p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.05] tracking-tight mb-2 drop-shadow-sm">
                          {slide.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-white/80 font-medium mb-4">
                          {slide.subtitle}
                        </p>

                        {/* Save badge */}
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ed017f] border-4 border-white/40 text-white text-center shadow-lg mb-4 transform -rotate-6">
                          <span className="text-[10px] sm:text-xs font-black leading-tight px-1">
                            {slide.saveBadge}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 mt-auto">
                        <Link
                          href={slide.cta}
                          className="bg-[#ed017f] hover:bg-[#c80062] text-white text-xs font-black px-5 py-2.5 rounded-full shadow-md transition-transform hover:scale-105"
                        >
                          Shop Now
                        </Link>
                        <div className="flex items-center gap-1.5 bg-white text-zinc-900 text-[9px] sm:text-[10px] font-extrabold px-2.5 py-1.5 rounded-full shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ed017f] animate-pulse" />
                          SAME DAY ON
                          <span className="bg-[#ed017f] text-white px-1.5 py-0.5 rounded text-[8px]">NDZ NOW</span>
                        </div>
                      </div>
                    </div>

                    {/* Right product visual */}
                    <div className="flex-1 relative flex flex-col items-center justify-center min-w-0 mt-4 md:mt-0">
                      <p className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-white/70 mb-2 text-center">
                        {slide.productLabel}
                      </p>
                      <div className="relative w-full max-w-[280px] h-40 sm:h-52">
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          fill
                          className="object-contain drop-shadow-2xl"
                          priority={idx === 0}
                          sizes="(max-width: 768px) 80vw, 280px"
                        />
                      </div>

                      {/* Price pill */}
                      <div className="mt-3 bg-[#ed017f] text-white rounded-xl px-4 py-2 text-center shadow-lg border border-white/20">
                        <p className="text-[10px] line-through opacity-70">{slide.priceOld}</p>
                        <p className="text-lg sm:text-xl font-black leading-none">{slide.priceNew}</p>
                      </div>

                      {/* Genuine badge */}
                      <div className="absolute bottom-2 right-2 w-14 h-14 rounded-full bg-pink-500 border-2 border-white text-white flex flex-col items-center justify-center text-[7px] font-black leading-tight text-center shadow-lg">
                        <span>GENUINE</span>
                        <span>PRODUCTS</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Slider arrows */}
              <button
                type="button"
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dots + slogan */}
              <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-between px-5">
                <div className="flex items-center gap-1.5">
                  {SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => goTo(idx)}
                      className={`h-2 rounded-full transition-all ${
                        activeSlide === idx
                          ? "w-7 bg-white"
                          : "w-2 bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
                <span className="hidden sm:block font-serif italic text-white/90 text-sm font-semibold drop-shadow">
                  {cur.slogan}
                </span>
              </div>
            </div>

            {/* RIGHT 2x2 PROMO GRID (4 cols) */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-2.5 min-w-0 max-w-full">
              {/* Starlink black */}
              <Link
                href="/shop"
                className="bg-black rounded-xl p-3.5 flex flex-col justify-between text-white min-h-[185px] shadow-xs hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-1 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="font-extrabold">NewDeal</span>
                  <span className="text-zinc-500">|</span>
                  <span className="text-zinc-400 font-mono text-[9px] tracking-widest">STARLINK</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Official</p>
                  <p className="text-sm font-extrabold leading-tight">Premium Seller Network</p>
                </div>
                <span className="text-[10px] font-bold text-orange-400 group-hover:underline">Explore &gt;</span>
              </Link>

              {/* Green Xclusive */}
              <Link
                href="/shop?sort=discount"
                className="bg-[#005c30] rounded-xl p-3.5 flex flex-col justify-between text-white min-h-[185px] shadow-xs hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="text-[9px] font-extrabold uppercase text-emerald-300 tracking-wider mb-1">
                    XclusivePlus by NDZ
                  </p>
                  <p className="text-[11px] font-bold text-white/90">GET UP TO</p>
                  <h3 className="text-xl font-black text-amber-300 leading-none my-1">₦1,000</h3>
                  <p className="text-[10px] text-white/80">off your shopping cart</p>
                </div>
                <span className="inline-block bg-amber-400 text-zinc-900 text-[10px] font-extrabold px-3 py-1 rounded w-fit">
                  Sign Up &gt;
                </span>
              </Link>

              {/* Magenta Shop Now */}
              <Link
                href="/shop"
                className="bg-gradient-to-br from-[#9b0054] via-[#6b003a] to-[#3a0020] rounded-xl p-3.5 flex flex-col items-center justify-center min-h-[185px] shadow-xs hover:shadow-md transition-shadow group"
              >
                <span className="bg-[#ed017f] text-white text-xs font-black px-5 py-2.5 rounded-full shadow-md group-hover:scale-105 transition-transform">
                  Shop Now
                </span>
              </Link>

              {/* Black product card */}
              <Link
                href="/shop/sneakers"
                className="bg-zinc-950 rounded-xl p-3 flex flex-col justify-between min-h-[185px] shadow-xs hover:shadow-md transition-shadow border border-zinc-800 group overflow-hidden relative"
              >
                <div className="relative z-10">
                  <p className="text-[9px] font-extrabold text-pink-400 uppercase tracking-wider">Featured</p>
                  <p className="text-xs font-bold text-white leading-snug">Sneaker Drop</p>
                </div>
                <div className="relative w-full h-20 my-1">
                  <Image
                    src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&auto=format&fit=crop&q=80"
                    alt="Sneaker"
                    fill
                    className="object-contain group-hover:scale-110 transition-transform duration-300"
                    sizes="150px"
                  />
                </div>
                <span className="relative z-10 bg-[#ed017f] text-white text-[10px] font-black px-3 py-1.5 rounded-full w-fit mx-auto">
                  Shop Now
                </span>
              </Link>
            </div>
          </div>

          {/* CATEGORY BADGES SLIDER */}
          <div className="relative mt-3">
            <button
              type="button"
              onClick={() => handleBadgeScroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-20 w-8 h-8 rounded-full bg-white text-zinc-800 shadow-md border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
              aria-label="Scroll categories left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleBadgeScroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-20 w-8 h-8 rounded-full bg-white text-zinc-800 shadow-md border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
              aria-label="Scroll categories right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div
              ref={scrollRef}
              className="flex items-center gap-3 overflow-x-auto pb-2 px-6 scrollbar-none snap-x scroll-smooth max-w-full"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {CATEGORY_BADGES.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={i}
                    href="/shop"
                    className="flex flex-col items-center gap-1.5 min-w-[100px] sm:min-w-[115px] snap-start group text-center shrink-0"
                  >
                    <div
                      className={`w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-2xl ${item.bgClass} flex flex-col items-center justify-center shadow-sm group-hover:-translate-y-0.5 transition-transform duration-300 p-2`}
                    >
                      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 mb-0.5 ${item.iconColor}`} />
                      <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter leading-none text-current opacity-90">
                        {item.badgeText}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-zinc-800 leading-tight line-clamp-2">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* SERVICES STRIP */}
          <div className="mt-2.5 bg-white rounded-xl border border-zinc-200 p-2.5 shadow-sm overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex items-center justify-between min-w-[720px] px-2 gap-3">
              {SERVICE_STRIP.map((srv, idx) => {
                const SrvIcon = srv.icon;
                return (
                  <Link
                    key={idx}
                    href="/shop"
                    className="flex items-center gap-1.5 text-zinc-700 hover:text-zinc-900 transition-colors group shrink-0"
                  >
                    <SrvIcon className={`w-3.5 h-3.5 ${srv.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-tight text-zinc-800">
                      {srv.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE SKIN */}
        <div className="hidden xl:block sticky top-0 h-fit">
          <Link href="/shop" className="block h-full">
            <SideSkin />
          </Link>
        </div>
      </div>

      {/* Mobile-only mini side promo bar */}
      <div className="xl:hidden w-full bg-black text-white flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black tracking-tighter">NDZ</span>
          <span className="bg-white text-[#ed017f] text-[10px] font-black px-2 py-0.5 rounded-sm">
            Brand Day
          </span>
        </div>
        <span className="bg-[#ed017f] text-white text-[10px] font-black px-3 py-1 uppercase">
          UP TO 40% OFF
        </span>
      </div>
    </section>
  );
}