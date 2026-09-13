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

interface Slide {
  id: number;
  bg: string;
  brandTag: string;
  title: string;
  subtitle: string;
  badge: string;
  priceOld?: string;
  priceNew?: string;
  image: string;
  cta: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    bg: "bg-gradient-to-r from-[#200112] via-[#800040] to-[#200112]",
    brandTag: "NDZ | LG & HISENSE",
    title: "Enjoy 2 months FREE express shipping on all Purchases",
    subtitle: "and Free Delivery when you buy 2 & Above for Premium Footwear & Lifestyle items",
    badge: "FEEL THE GAME",
    priceOld: "NGN 85,000",
    priceNew: "NGN 61,200",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80",
    cta: "/shop",
  },
  {
    id: 2,
    bg: "bg-gradient-to-r from-[#fef08a] via-[#fcd34d] to-[#0284c7]",
    brandTag: "NDZ CARE",
    title: "SUN CARE YOU WANT TO WEAR",
    subtitle: "BLOCKS UV DAMAGE & STRENGTHENS SKIN BARRIER - CERAVE & CARE COLLECTION",
    badge: "50+ SPF",
    priceOld: "NGN 25,000",
    priceNew: "NGN 18,500",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&auto=format&fit=crop&q=80",
    cta: "/shop?category=casual",
  },
  {
    id: 3,
    bg: "bg-gradient-to-r from-zinc-950 via-zinc-900 to-[#8B2A1E]",
    brandTag: "BRAND DAY | ASUS x NDZ",
    title: "Built for Easy Performance & Street Dominance",
    subtitle: "UP TO 40% OFF ON Y2K RUNNING, CORDURA TACTICAL & SNEAKER ESSENTIALS",
    badge: "40% OFF",
    priceOld: "NGN 95,000",
    priceNew: "₦57,000",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&auto=format&fit=crop&q=80",
    cta: "/shop?category=sneakers",
  },
];

const CATEGORY_BADGES = [
  { name: "Verified Best Prices", badgeText: "VERIFIED", bgClass: "bg-gradient-to-b from-red-50 to-pink-100 border-2 border-pink-400", icon: ShieldCheck, iconColor: "text-red-600" },
  { name: "Bulk Price Drops", badgeText: "PRICE DROPS", bgClass: "bg-amber-900 text-white", icon: Package, iconColor: "text-amber-300" },
  { name: "NDZ Now", badgeText: "SAME DAY", bgClass: "bg-zinc-900 text-white", icon: Zap, iconColor: "text-pink-500" },
  { name: "Buy More. Save More", badgeText: "BUY MORE", bgClass: "bg-black text-white", icon: Percent, iconColor: "text-yellow-400" },
  { name: "Flash Sales Reloaded", badgeText: "RELOADED", bgClass: "bg-gradient-to-br from-yellow-400 to-amber-700 text-black", icon: Flame, iconColor: "text-black" },
  { name: "Home Essentials", badgeText: "ESSENTIALS", bgClass: "bg-slate-200 text-slate-900", icon: Footprints, iconColor: "text-slate-700" },
  { name: "Groceries", badgeText: "FRESH", bgClass: "bg-orange-50 border border-orange-200 text-orange-900", icon: ShoppingBag, iconColor: "text-orange-600" },
  { name: "Hot Deals", badgeText: "HOT", bgClass: "bg-gradient-to-br from-orange-600 via-red-600 to-black text-white", icon: Flame, iconColor: "text-yellow-300" },
  { name: "Sports & Fitness", badgeText: "ACTIVE", bgClass: "bg-emerald-900 text-white", icon: Dumbbell, iconColor: "text-emerald-400" },
  { name: "Gaming", badgeText: "HYPE", bgClass: "bg-purple-950 text-purple-200 border border-purple-800", icon: Gamepad2, iconColor: "text-purple-400" },
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

function SideBannerSkin() {
  return (
    <div className="w-full h-full min-h-[500px] bg-black text-white flex flex-col justify-between items-center py-8 px-2 select-none border-x border-zinc-800">
      <div className="flex flex-col items-center gap-6 w-full text-center">
        <span className="text-4xl md:text-5xl font-black tracking-tighter text-white font-sans">
          ASUS
        </span>
        <div className="bg-white text-[#ed017f] font-black text-base md:text-lg px-4 py-1.5 rounded shadow-md border border-zinc-200 tracking-tight">
          Brand Day
        </div>
        <p className="text-lg md:text-2xl font-extrabold text-white leading-tight font-sans tracking-tight max-w-[150px]">
          Built for Easy Performance
        </p>
      </div>
      <div className="w-full bg-[#ed017f] text-white font-black text-xs md:text-sm py-2.5 text-center uppercase tracking-wider">
        UP TO <span className="text-base">40%</span> OFF
      </div>
    </div>
  );
}

export default function KongaHero() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback((idx: number) => {
    setActiveSlide((idx + SLIDES.length) % SLIDES.length);
  }, []);

  const next = useCallback(() => goTo(activeSlide + 1), [activeSlide, goTo]);
  const prev = useCallback(() => goTo(activeSlide - 1), [activeSlide, goTo]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((s) => (s + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
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
    <div className="w-full max-w-full overflow-x-hidden bg-[#e0e0e0]">
      {/* 3-COLUMN LAYOUT: LEFT SIDE SKIN | CENTER | RIGHT SIDE SKIN */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-[minmax(140px,1fr)_minmax(0,1240px)_minmax(140px,1fr)] max-w-full">
        
        {/* LEFT SIDE SKIN (Desktop Only) */}
        <div className="hidden xl:block bg-black text-white relative">
          <div className="sticky top-0 h-screen max-h-[580px] w-full">
            <Link href="/shop" className="block h-full w-full">
              <SideBannerSkin />
            </Link>
          </div>
        </div>

        {/* CENTER MAIN CONTENT */}
        <div className="w-full min-w-0 px-2 sm:px-3 py-3 bg-[#f2f2f2]">
          
          {/* TOP: MAIN SLIDER + 2x2 PROMO GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch max-w-full">
            
            {/* MAIN SLIDER (Spans 8 columns) */}
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
                    <div className="flex-1 flex flex-col justify-between z-10 min-w-0 md:pr-4">
                      <div>
                        <p className="text-xs sm:text-sm font-black tracking-widest text-white/90 mb-1 uppercase">
                          {slide.brandTag}
                        </p>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight mb-2 drop-shadow-sm">
                          {slide.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-white/80 font-medium mb-4">
                          {slide.subtitle}
                        </p>
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ed017f] border-4 border-white/40 text-white text-center shadow-lg mb-4 transform -rotate-6">
                          <span className="text-[10px] sm:text-xs font-black leading-tight px-1">
                            {slide.badge}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 mt-auto">
                        <Link
                          href={slide.cta}
                          className="bg-[#ed017f] hover:bg-[#c80062] text-white text-xs font-black px-5 py-2.5 rounded-full shadow-md transition-transform hover:scale-105"
                        >
                          SHOP NOW &gt;
                        </Link>
                        <div className="flex items-center gap-1.5 bg-white text-zinc-900 text-[9px] sm:text-[10px] font-extrabold px-2.5 py-1.5 rounded-full shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ed017f] animate-pulse" />
                          SAME DAY ON
                          <span className="bg-[#ed017f] text-white px-1.5 py-0.5 rounded text-[8px]">NDZ NOW</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 relative flex flex-col items-center justify-center min-w-0 mt-4 md:mt-0">
                      <div className="relative w-full max-w-[260px] h-36 sm:h-48">
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          fill
                          className="object-contain drop-shadow-2xl"
                          priority={idx === 0}
                          sizes="260px"
                        />
                      </div>
                      {slide.priceNew && (
                        <div className="mt-2 bg-[#ed017f] text-white rounded-xl px-4 py-1.5 text-center shadow-lg border border-white/20">
                          <p className="text-[10px] line-through opacity-70">{slide.priceOld}</p>
                          <p className="text-base sm:text-lg font-black leading-none">{slide.priceNew}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* SLIDER ARROWS */}
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

              {/* SLIDER DOTS */}
              <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-1.5 px-5">
                {SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => goTo(idx)}
                    className={`h-2 rounded-full transition-all ${
                      activeSlide === idx ? "w-7 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT 2x2 PROMO CARDS (Spans 4 columns) */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-2.5 min-w-0 max-w-full">
              {/* Card 1: Starlink */}
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
                  <p className="text-sm font-extrabold leading-tight">Premium Seller Store</p>
                </div>
                <span className="text-[10px] font-bold text-orange-400 group-hover:underline">Explore &gt;</span>
              </Link>

              {/* Card 2: Green Xclusive */}
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

              {/* Card 3: Deep Magenta */}
              <Link
                href="/shop"
                className="bg-gradient-to-br from-[#9b0054] via-[#6b003a] to-[#3a0020] rounded-xl p-3.5 flex flex-col items-center justify-center min-h-[185px] shadow-xs hover:shadow-md transition-shadow group"
              >
                <span className="bg-[#ed017f] text-white text-xs font-black px-5 py-2.5 rounded-full shadow-md group-hover:scale-105 transition-transform">
                  Shop Now
                </span>
              </Link>

              {/* Card 4: Black Sneakers */}
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
                <span className="relative z-10 bg-[#ed017f] text-white text-[10px] font-black px-3 py-1 rounded-full w-fit mx-auto">
                  Shop Now
                </span>
              </Link>
            </div>
          </div>

          {/* CATEGORY BADGES ROW */}
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
                      <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter leading-none opacity-90">
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
          <div
            className="mt-2.5 bg-white rounded-xl border border-zinc-200 p-2.5 shadow-sm overflow-x-auto"
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

        {/* RIGHT SIDE SKIN (Desktop Only) */}
        <div className="hidden xl:block bg-black text-white relative">
          <div className="sticky top-0 h-screen max-h-[580px] w-full">
            <Link href="/shop" className="block h-full w-full">
              <SideBannerSkin />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}