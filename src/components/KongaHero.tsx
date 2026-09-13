"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface KongaHeroProps {
  locale: string;
}

export default function KongaHero({ locale }: KongaHeroProps) {
  const isFr = locale === "fr";
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      tag: isFr ? "OFFRE SP\u00c9CIALE 2025" : "SPECIAL OFFER 2025",
      title: isFr ? "Confort Ultime & Style Performance" : "Better Comfort, Better Tech",
      subtitle: isFr ? "Jusqu'a 40% de r\u00e9duction sur la nouvelle collection" : "Up to 40% off top authentic footwear & tech drops",
      buttonText: isFr ? "Acheter Maintenant" : "Shop Now",
      buttonLink: "/shop",
      bgGradient: "from-amber-700 via-rose-900 to-slate-950",
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1000&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      tag: "SMZ BOT PRO v4.2",
      title: isFr ? "Bot de Trading IA S\u00e9curis\u00e9" : "Automated AI Trading Signals",
      subtitle: isFr ? "87.4% de taux de r\u00e9ussite - Signaux Telegram 24/7" : "87.4% win rate delivered instantly to Telegram 24/7",
      buttonText: isFr ? "S'abonner Maintenant" : "Subscribe Now",
      buttonLink: "/product/smz-ai-trading-bot-pro",
      bgGradient: "from-emerald-900 via-slate-900 to-slate-950",
      image: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1000&auto=format&fit=crop&q=80",
    },
    {
      id: 3,
      tag: isFr ? "EXCLUSIVIT\u00c9 FOOTWEAR" : "AUTHENTIC FOOTWEAR",
      title: isFr ? "Livraison Express & Produit V\u00e9rifi\u00e9" : "Verified Authentic Sneaker Drops",
      subtitle: isFr ? "Exp\u00e9di\u00e9 sous 24h depuis nos entrep\u00f4ts" : "Fast delivery direct from Lom\u00e9 and Abuja hubs",
      buttonText: isFr ? "D\u00e9couvrir" : "Explore Collection",
      buttonLink: "/shop",
      bgGradient: "from-blue-900 via-slate-900 to-indigo-950",
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1000&auto=format&fit=crop&q=80",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 min-w-0">
      {/* Upper Grid: Slider + Right 2x2 Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-full">
        {/* Left/Center Main Slider (lg:col-span-8) */}
        <div className="lg:col-span-8 relative min-w-0 w-full overflow-hidden rounded-2xl bg-slate-900 shadow-md min-h-[340px] sm:min-h-[380px] lg:min-h-[410px] flex flex-col justify-between p-6 sm:p-8 text-white">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              fill
              className="object-cover object-center opacity-40 transition-opacity duration-700 ease-in-out"
              priority
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].bgGradient} opacity-85`} />
          </div>

          {/* Slide Content */}
          <div className="relative z-10 space-y-4 max-w-xl">
            <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-xs font-bold tracking-wider text-amber-300 uppercase border border-white/20">
              {slides[currentSlide].tag}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
              {slides[currentSlide].title}
            </h1>
            <p className="text-sm sm:text-base text-gray-200 font-medium leading-relaxed">
              {slides[currentSlide].subtitle}
            </p>

            <div className="pt-2">
              <Link
                href={`/${locale}${slides[currentSlide].buttonLink}`}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-rose-700 transition-all hover:scale-105"
              >
                {slides[currentSlide].buttonText}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Carousel Navigation Dots */}
          <div className="relative z-10 flex items-center gap-2 pt-4">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  currentSlide === idx ? "w-8 bg-rose-500" : "w-2.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Side 2x2 Grid Banners (lg:col-span-4) */}
        <div className="lg:col-span-4 min-w-0 w-full grid grid-cols-2 lg:grid-cols-1 gap-3">
          {/* Card 1: SMZ Bot promo */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-emerald-950 p-4 text-white flex flex-col justify-between shadow-sm min-h-[190px]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {isFr ? "PROMO BROKER" : "PROMO BONUS"}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold">$20 Deposit</span>
              </div>
              <h3 className="mt-2 text-sm font-bold text-white leading-snug">
                {isFr ? "1 Mois SMZ Bot Gratuit" : "Get 1 Month SMZ Bot Free"}
              </h3>
              <p className="mt-1 text-[11px] text-gray-300">
                {isFr ? "D\u00e9posez $20 chez notre broker partenaire" : "Deposit $20 on partner broker"}
              </p>
            </div>
            <Link
              href={`/${locale}/broker-promo`}
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition-colors w-full"
            >
              {isFr ? "Profiter de l'Offre" : "Claim $20 Promo"}
            </Link>
          </div>

          {/* Card 2: Free Express Shipping */}
          <div className="rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-500 via-amber-600 to-rose-600 p-4 text-white flex flex-col justify-between shadow-sm min-h-[190px]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-white/20 px-2 py-0.5 rounded border border-white/30">
                {isFr ? "GARANTIE NDZ" : "AUTHENTICITY"}
              </span>
              <h3 className="mt-2 text-sm font-bold text-white leading-snug">
                {isFr ? "Produits 100% Authentiques" : "100% Genuine Guaranteed"}
              </h3>
              <p className="mt-1 text-[11px] text-amber-100">
                {isFr ? "Inspect\u00e9s avant exp\u00e9dition" : "Verified & tested before dispatch"}
              </p>
            </div>
            <Link
              href={`/${locale}/shop`}
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-50 transition-colors w-full shadow"
            >
              {isFr ? "Voir la Boutique" : "Shop Collection"}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Category Badges (Konga Quick Shortcut Bar) */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 min-w-0">
        <Link
          href={`/${locale}/shop?sort=best-selling`}
          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm hover:shadow-md hover:border-rose-200 transition-all"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 font-extrabold text-lg">
            &#9733;
          </div>
          <div className="min-w-0 truncate">
            <p className="text-xs font-bold text-gray-900 truncate">{isFr ? "Meilleures Ventes" : "Best Sellers"}</p>
            <p className="text-[10px] text-gray-500 truncate">{isFr ? "Prix v\u00e9rifi\u00e9s" : "Verified prices"}</p>
          </div>
        </Link>

        <Link
          href={`/${locale}/product/smz-ai-trading-bot-pro`}
          className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-3 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 font-extrabold text-lg">
            &#9889;
          </div>
          <div className="min-w-0 truncate">
            <p className="text-xs font-bold text-gray-900 truncate">SMZ Bot Pro</p>
            <p className="text-[10px] text-gray-500 truncate">{isFr ? "Signaux IA 24/7" : "24/7 AI Signals"}</p>
          </div>
        </Link>

        <Link
          href={`/${locale}/broker-promo`}
          className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-3 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-extrabold text-lg">
            &#127873;
          </div>
          <div className="min-w-0 truncate">
            <p className="text-xs font-bold text-gray-900 truncate">{isFr ? "Promo $20 Broker" : "Promo $20 Broker"}</p>
            <p className="text-[10px] text-gray-500 truncate">{isFr ? "1 Mois Offert" : "1 Month Free"}</p>
          </div>
        </Link>

        <Link
          href={`/${locale}/shop?category=sneakers`}
          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm hover:shadow-md hover:border-purple-200 transition-all"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 font-extrabold text-lg">
            &#128095;
          </div>
          <div className="min-w-0 truncate">
            <p className="text-xs font-bold text-gray-900 truncate">Sneakers</p>
            <p className="text-[10px] text-gray-500 truncate">{isFr ? "Nouveaut\u00e9s 2025" : "New drops 2025"}</p>
          </div>
        </Link>

        <Link
          href={`/${locale}/shop?category=running`}
          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm hover:shadow-md hover:border-amber-200 transition-all"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 font-extrabold text-lg">
            &#127939;
          </div>
          <div className="min-w-0 truncate">
            <p className="text-xs font-bold text-gray-900 truncate">Running</p>
            <p className="text-[10px] text-gray-500 truncate">{isFr ? "Haute Performance" : "High Performance"}</p>
          </div>
        </Link>

        <Link
          href={`/${locale}/contact`}
          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-extrabold text-lg">
            &#128172;
          </div>
          <div className="min-w-0 truncate">
            <p className="text-xs font-bold text-gray-900 truncate">{isFr ? "Support Client" : "24/7 Support"}</p>
            <p className="text-[10px] text-gray-500 truncate">{isFr ? "Telegram & Email" : "Chat on Telegram"}</p>
          </div>
        </Link>
      </div>
    </section>
  );
}