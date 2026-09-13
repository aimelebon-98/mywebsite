"use client";

import React, { useState, useRef } from "react";
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
  Sparkles,
  Dumbbell,
  Gamepad2,
} from "lucide-react";

export default function KongaHero() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      id: 1,
      tag: "NDZ | PREMIUM",
      title: "Enjoy 2 months FREE express shipping on all Footwear Purchase",
      subtext: "and Free delivery when you buy 2 & Above for Premium Sneakers, Formal Shoes & Boots",
      badgeText: "FEEL THE STYLE",
      slogan: "Every Step Matters.",
      image1: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
      image2: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80",
      cta: "/shop",
    },
    {
      id: 2,
      tag: "BRAND DAY | ASUS x NDZ",
      title: "Built for Easy Performance & Maximum Comfort",
      subtext: "Discover top-tier Y2K running shoes, CORDURA tactical footwear, and street staples",
      badgeText: "UP TO 40% OFF",
      slogan: "Walk The Future.",
      image1: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
      image2: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
      cta: "/shop?category=sneakers",
    },
  ];

  const categoryBadges = [
    {
      name: "Verified Best Prices",
      badgeText: "VERIFIED",
      bgClass: "bg-gradient-to-b from-red-100 to-pink-100 border-2 border-pink-400",
      icon: ShieldCheck,
      iconColor: "text-red-600",
    },
    {
      name: "Bulk Price Drops",
      badgeText: "PRICE DROPS",
      bgClass: "bg-amber-900 text-amber-200",
      icon: Package,
      iconColor: "text-amber-400",
    },
    {
      name: "NDZ Now",
      badgeText: "SAME DAY",
      bgClass: "bg-zinc-900 text-white",
      icon: Zap,
      iconColor: "text-pink-500",
    },
    {
      name: "Buy More. Save More",
      badgeText: "BUY MORE",
      bgClass: "bg-black text-white",
      icon: Percent,
      iconColor: "text-yellow-400",
    },
    {
      name: "Flash Sales Reloaded",
      badgeText: "RELOADED",
      bgClass: "bg-gradient-to-br from-yellow-400 to-amber-600 text-black",
      icon: Flame,
      iconColor: "text-black",
    },
    {
      name: "Care Essentials",
      badgeText: "ESSENTIALS",
      bgClass: "bg-slate-200 text-slate-800",
      icon: Footprints,
      iconColor: "text-slate-700",
    },
    {
      name: "Bundles & Gifts",
      badgeText: "BUNDLES",
      bgClass: "bg-red-50 border border-red-200 text-red-900",
      icon: ShoppingBag,
      iconColor: "text-red-600",
    },
    {
      name: "Hot Deals",
      badgeText: "HOT",
      bgClass: "bg-gradient-to-br from-orange-600 via-red-600 to-black text-white",
      icon: Flame,
      iconColor: "text-yellow-300",
    },
    {
      name: "Sports & Fitness",
      badgeText: "ACTIVE",
      bgClass: "bg-emerald-900 text-white",
      icon: Dumbbell,
      iconColor: "text-emerald-400",
    },
    {
      name: "Hype Releases",
      badgeText: "GAMING",
      bgClass: "bg-purple-950 text-purple-200 border border-purple-800",
      icon: Gamepad2,
      iconColor: "text-purple-400",
    },
  ];

  const serviceStrip = [
    { label: "TRAVEL", icon: Plane, color: "text-orange-500" },
    { label: "NDZPay", icon: CreditCard, color: "text-pink-600" },
    { label: "NDZ Corporate", icon: Building2, color: "text-amber-500" },
    { label: "NDZ Health", icon: Heart, color: "text-red-500" },
    { label: "LOGISTICS", icon: Truck, color: "text-pink-500" },
    { label: "GROCERIES", icon: ShoppingBag, color: "text-pink-500" },
    { label: "NDZ TV", icon: Tv, color: "text-pink-600" },
    { label: "NDZ NOW", icon: Zap, color: "text-orange-500" },
  ];

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const cur = slides[activeSlide];

  return (
    <section className="w-full max-w-full overflow-x-hidden bg-[#e0e0e0] py-0 text-zinc-900 relative">
      
      {/* SIDE SKIN BANNERS (Widescreen gutter view matching Konga) */}
      <div className="hidden xl:block absolute left-0 top-0 bottom-0 w-[calc((100vw-1320px)/2)] bg-zinc-950 text-white overflow-hidden pointer-events-none border-r border-zinc-800">
        <div className="p-6 flex flex-col justify-between h-full">
          <div>
            <span className="text-3xl font-black tracking-tighter text-white block mb-6">NDZ</span>
            <span className="bg-[#ed017f] text-white text-xs font-black px-3 py-1 rounded inline-block mb-4">
              Brand Day
            </span>
            <h4 className="text-xl font-extrabold leading-tight text-zinc-200">
              Built for Easy<br />Performance
            </h4>
          </div>
          <div className="bg-[#ed017f] text-white font-black text-center py-2 px-3 rounded text-sm uppercase tracking-wider">
            UP TO 40% OFF
          </div>
        </div>
      </div>

      <div className="hidden xl:block absolute right-0 top-0 bottom-0 w-[calc((100vw-1320px)/2)] bg-zinc-950 text-white overflow-hidden pointer-events-none border-l border-zinc-800">
        <div className="p-6 flex flex-col justify-between h-full text-right">
          <div>
            <span className="text-3xl font-black tracking-tighter text-white block mb-6">NDZ</span>
            <span className="bg-[#ed017f] text-white text-xs font-black px-3 py-1 rounded inline-block mb-4">
              Brand Day
            </span>
            <h4 className="text-xl font-extrabold leading-tight text-zinc-200">
              Built for Easy<br />Performance
            </h4>
          </div>
          <div className="bg-[#ed017f] text-white font-black text-center py-2 px-3 rounded text-sm uppercase tracking-wider">
            UP TO 40% OFF
          </div>
        </div>
      </div>

      {/* MAIN CENTERED HERO CONTAINER */}
      <div className="container mx-auto px-2 sm:px-4 max-w-[1320px] bg-[#f2f2f2] pt-3 pb-3">
        
        {/* TOP GRID: MAIN HERO + 2x2 RIGHT CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 max-w-full items-stretch">
          
          {/* LEFT MAIN CAROUSEL BANNER (8 COLS) */}
          <div className="lg:col-span-8 relative bg-gradient-to-r from-zinc-950 via-zinc-900 to-emerald-950 rounded-xl overflow-hidden shadow-sm min-h-[380px] lg:min-h-[410px] flex flex-col justify-between text-white p-6 md:p-8 min-w-0">
            
            {/* Top Brand Pill Header */}
            <div className="flex items-center gap-3 relative z-10">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#ed017f]" />
                NewDeal
              </span>
              <span className="text-zinc-500 font-light">|</span>
              <span className="text-xs font-black tracking-widest text-zinc-300 uppercase bg-white/10 px-2.5 py-1 rounded border border-white/20">
                {cur.tag}
              </span>
            </div>

            {/* Banner Center Content */}
            <div className="grid md:grid-cols-12 gap-4 items-center relative z-10 my-auto pt-4">
              <div className="md:col-span-7">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-3 text-white">
                  {cur.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed mb-6">
                  {cur.subtext}
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={cur.cta}
                    className="bg-[#ed017f] hover:bg-[#c80062] text-white text-xs font-black px-6 py-2.5 rounded-md shadow-md transition-transform hover:scale-105"
                  >
                    Shop Now
                  </Link>

                  <div className="flex items-center gap-2 bg-white text-zinc-900 text-[10px] font-extrabold px-3 py-2 rounded-md shadow-xs">
                    <span className="text-[#ed017f] font-black">SAME DAY DELIVERY ON</span>
                    <span className="bg-[#ed017f] text-white px-1.5 py-0.5 rounded text-[9px]">NDZ NOW</span>
                  </div>
                </div>
              </div>

              {/* Right Side Visual with Product Shots + Badge */}
              <div className="md:col-span-5 relative flex flex-col items-center justify-center">
                <div className="relative w-full h-44 sm:h-52 flex items-center justify-center gap-2">
                  <div className="relative w-28 h-36 rounded-lg overflow-hidden border-2 border-white/20 shadow-xl transform -rotate-6">
                    <Image
                      src={cur.image1}
                      alt="Product 1"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative w-32 h-40 rounded-lg overflow-hidden border-2 border-white/30 shadow-2xl z-10">
                    <Image
                      src={cur.image2}
                      alt="Product 2"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Circular Badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 rounded-full bg-[#ed017f] border-2 border-white text-white flex flex-col items-center justify-center text-[9px] font-black text-center shadow-2xl tracking-tighter transform rotate-12">
                  <span>{cur.badgeText}</span>
                </div>
              </div>
            </div>

            {/* Banner Bottom Footer */}
            <div className="flex items-center justify-between relative z-10 pt-2 border-t border-white/10 text-xs text-zinc-400">
              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      activeSlide === idx ? "w-7 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <span className="font-serif italic text-white/90 text-sm font-semibold">
                {cur.slogan}
              </span>
            </div>
          </div>

          {/* RIGHT 2x2 PROMO CARDS (4 COLS) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-2.5 min-w-0 max-w-full">
            
            {/* Card 1: Black Starlink Style Card */}
            <Link
              href="/shop"
              className="bg-black rounded-xl p-4 flex flex-col justify-between text-white overflow-hidden group shadow-xs min-h-[185px] hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-1 text-xs font-bold tracking-tight">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="font-extrabold text-white">NewDeal</span>
                <span className="text-zinc-500">|</span>
                <span className="text-zinc-300 font-mono text-[10px] tracking-widest uppercase">STARLINK</span>
              </div>

              <div className="my-auto py-2">
                <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">OFFICIAL STORE</p>
                <p className="text-sm font-extrabold text-white leading-tight">Fast Satellite Footwear Shipping</p>
              </div>

              <div className="text-[10px] font-bold text-orange-400 flex items-center justify-between">
                <span>Explore Store</span>
                <span>&gt;</span>
              </div>
            </Link>

            {/* Card 2: Green Xclusive Card */}
            <Link
              href="/shop?sort=discount"
              className="bg-[#005c30] rounded-xl p-3.5 flex flex-col justify-between text-white overflow-hidden group shadow-xs min-h-[185px] hover:shadow-md transition-shadow"
            >
              <div>
                <p className="text-[9px] font-extrabold uppercase text-emerald-300 tracking-wider mb-1">
                  XclusivePlus by NDZ
                </p>
                <p className="text-[11px] font-bold text-white/90">GET UP TO</p>
                <h3 className="text-xl font-black text-amber-300 leading-none my-1">
                  ₦1,000
                </h3>
                <p className="text-[10px] text-white/80 font-medium">
                  off your shopping cart
                </p>
              </div>

              <div className="pt-2">
                <span className="inline-block bg-amber-400 text-zinc-900 text-[10px] font-extrabold px-3 py-1 rounded shadow-xs group-hover:bg-amber-300 transition-colors">
                  Sign Up &gt;
                </span>
              </div>
            </Link>

            {/* Card 3: Deep Magenta Glow Card */}
            <Link
              href="/shop"
              className="bg-gradient-to-br from-[#800040] via-[#5c002e] to-[#3a0020] rounded-xl p-3.5 flex flex-col items-center justify-center text-center overflow-hidden group shadow-xs min-h-[185px] hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col items-center">
                <span className="bg-[#ed017f] hover:bg-[#c80062] text-white text-xs font-black px-5 py-2.5 rounded-full shadow-md transition-transform group-hover:scale-105">
                  Shop Now
                </span>
              </div>
            </Link>

            {/* Card 4: Pure Black Card */}
            <Link
              href="/shop/sneakers"
              className="bg-black rounded-xl p-3.5 flex flex-col items-center justify-center text-center overflow-hidden group shadow-xs min-h-[185px] hover:shadow-md transition-shadow border border-zinc-800"
            >
              <div className="flex flex-col items-center">
                <span className="bg-[#ed017f] hover:bg-[#c80062] text-white text-xs font-black px-5 py-2.5 rounded-full shadow-md transition-transform group-hover:scale-105">
                  Shop Now
                </span>
              </div>
            </Link>

          </div>
        </div>

        {/* MIDDLE ROW: CATEGORY / FEATURE BADGES SLIDER */}
        <div className="relative mt-3 pt-1">
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 w-8 h-8 rounded-full bg-white text-zinc-800 shadow-md border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleScroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 w-8 h-8 rounded-full bg-white text-zinc-800 shadow-md border border-zinc-200 flex items-center justify-center hover:bg-zinc-50"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div
            ref={scrollRef}
            className="flex items-center gap-3 overflow-x-auto pb-2 px-1 scrollbar-none snap-x scroll-smooth max-w-full"
          >
            {categoryBadges.map((item, i) => {
              const Icon = item.icon;
              return (
                <Link
                  key={i}
                  href="/shop"
                  className="flex flex-col items-center gap-1.5 min-w-[105px] sm:min-w-[120px] snap-start group text-center"
                >
                  <div
                    className={`w-20 h-20 rounded-2xl ${item.bgClass} flex flex-col items-center justify-center shadow-xs group-hover:-translate-y-0.5 transition-transform duration-300 relative overflow-hidden p-2`}
                  >
                    <Icon className={`w-7 h-7 mb-1 ${item.iconColor}`} />
                    <span className="text-[8px] font-black uppercase tracking-tighter leading-none opacity-90">
                      {item.badgeText}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-zinc-800 leading-tight line-clamp-2">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* BOTTOM ROW: SERVICES STRIP BAR */}
        <div className="mt-3 bg-white rounded-xl border border-zinc-200 p-2.5 shadow-2xs overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-between min-w-[750px] px-2 gap-4">
            {serviceStrip.map((srv, idx) => {
              const SrvIcon = srv.icon;
              return (
                <Link
                  key={idx}
                  href="/shop"
                  className="flex items-center gap-1.5 text-zinc-700 hover:text-zinc-900 transition-colors group"
                >
                  <SrvIcon className={`w-4 h-4 ${srv.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-[11px] font-extrabold uppercase tracking-tight text-zinc-800">
                    {srv.label}
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