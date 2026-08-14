"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { ChevronRight } from "lucide-react";
import { CATEGORY_IMAGES } from "@/lib/category-images";

export default function MobilePromoCarousel() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const [slideIdx, setSlideIdx] = useState(0);

  const slides = [
    {
      badge: isFr ? "M\u00c9GA VENTE" : "MEGA SALE",
      title: isFr ? "Jusqu\u0027\u00e0 50% de r\u00e9duction" : "Up to 50% OFF",
      subtitle: isFr ? "Sur toutes les baskets" : "On All Sneakers",
      cta: isFr ? "Acheter" : "Shop Now",
      href: `/${locale}/shop?category=sneakers`,
      bg: "linear-gradient(135deg, #CA3F2E 0%, #8B2A1E 100%)",
      image: CATEGORY_IMAGES.sneakers,
    },
    {
      badge: isFr ? "NOUVEAU" : "NEW IN",
      title: isFr ? "Collection Course" : "Running Collection",
      subtitle: isFr ? "Livraison gratuite dispo" : "Free shipping available",
      cta: isFr ? "D\u00e9couvrir" : "Discover",
      href: `/${locale}/shop?category=running`,
      bg: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      image: CATEGORY_IMAGES.running,
    },
    {
      badge: isFr ? "OFFRES CHAUDES" : "HOT DEALS",
      title: isFr ? "Chaussures habill\u00e9es" : "Formal Shoes",
      subtitle: isFr ? "Style intemporel" : "Timeless style",
      cta: isFr ? "Voir tout" : "See All",
      href: `/${locale}/shop?category=formal`,
      bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      image: CATEGORY_IMAGES.formal,
    },
    {
      badge: isFr ? "TENDANCE" : "TRENDING",
      title: isFr ? "Bottes robustes" : "Rugged Boots",
      subtitle: isFr ? "Style aventurier" : "Adventure ready",
      cta: isFr ? "Voir tout" : "See All",
      href: `/${locale}/shop?category=boots`,
      bg: "linear-gradient(135deg, #475569 0%, #1e293b 100%)",
      image: CATEGORY_IMAGES.boots,
    },
    {
      badge: isFr ? "\u00c9T\u00c9" : "SUMMER",
      title: isFr ? "Sandales confort" : "Comfort Sandals",
      subtitle: isFr ? "L\u00e9geret\u00e9 assur\u00e9e" : "Cool and easy",
      cta: isFr ? "Voir tout" : "See All",
      href: `/${locale}/shop?category=sandals`,
      bg: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)",
      image: CATEGORY_IMAGES.sandals,
    },
    {
      badge: isFr ? "AU QUOTIDIEN" : "EVERYDAY",
      title: isFr ? "Look d\u00e9contract\u00e9" : "Casual Style",
      subtitle: isFr ? "Confort sans effort" : "Effortless comfort",
      cta: isFr ? "Voir tout" : "See All",
      href: `/${locale}/shop?category=casual`,
      bg: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
      image: CATEGORY_IMAGES.casual,
    },
  ];

  useEffect(() => {
    const t = setInterval(() => setSlideIdx(i => (i + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <div className="lg:hidden px-3 pt-1 pb-3">
      <div className="relative rounded-2xl overflow-hidden shadow-md h-40 min-w-0" style={{ background: slides[slideIdx].bg }}>
        <Link prefetch={false} href={slides[slideIdx].href} className="block relative h-full">
          <div className="absolute inset-0 flex items-center">
            <div className="flex-1 pl-4 pr-2 py-4 text-white z-10 min-h-[128px] min-w-0">
              <div className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur rounded text-[9px] font-black tracking-widest mb-2">
                {slides[slideIdx].badge}
              </div>
              <h3 className="text-lg font-black leading-tight mb-1 drop-shadow line-clamp-2">{slides[slideIdx].title}</h3>
              <p className="text-[11px] opacity-90 mb-3 line-clamp-1">{slides[slideIdx].subtitle}</p>
              <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-xs font-bold" style={{ color: "#CA3F2E" }}>
                {slides[slideIdx].cta}
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
            <div className="w-32 h-32 relative flex-shrink-0 mr-2 rounded-2xl overflow-hidden shadow-lg">
              <Image src={slides[slideIdx].image} alt={slides[slideIdx].title} fill sizes="128px" quality={80} className="object-cover" />
            </div>
          </div>
        </Link>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIdx(i)}
              aria-label={`Slide ${i + 1}`}
              className={"h-1.5 rounded-full transition-all " + (i === slideIdx ? "w-4 bg-white" : "w-1.5 bg-white/50")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}