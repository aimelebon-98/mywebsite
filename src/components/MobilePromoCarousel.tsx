"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { ChevronRight } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";

interface PromoProduct {
  id: string;
  name: string;
  nameFr?: string | null;
  slug: string;
  slugFr?: string | null;
  imageUrl: string;
  price: string;
  comparePrice?: string | null;
  brand?: string | null;
  category?: string | null;
  featured?: boolean | null;
}

interface Props {
  products: PromoProduct[];
}

// Single uniform dark blue gradient for ALL slides
const UNIFORM_BG = "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)";

export default function MobilePromoCarousel({ products }: Props) {
  const locale = useLocale();
  const isFr = locale === "fr";
  const { format: formatPrice } = useCurrency();
  const [slideIdx, setSlideIdx] = useState(0);

  const slides = products.slice(0, 6).map((p, i) => {
    const displayName = (isFr && p.nameFr) ? p.nameFr : p.name;
    const displaySlug = (isFr && p.slugFr) ? p.slugFr : p.slug;
    const price = parseFloat(p.price);
    const comparePrice = p.comparePrice ? parseFloat(p.comparePrice) : null;
    const discount = comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

    let badge = isFr ? "TENDANCE" : "TRENDING";
    if (p.featured) badge = isFr ? "VEDETTE" : "FEATURED";
    else if (discount >= 20) badge = isFr ? "OFFRE CHAUDE" : "HOT DEAL";
    else if (discount > 0) badge = isFr ? "EN SOLDE" : "ON SALE";
    else if (i === 0) badge = isFr ? "M\u00c9GA VENTE" : "MEGA SALE";

    return {
      id: p.id,
      displayName,
      displaySlug,
      price,
      comparePrice,
      discount,
      badge,
      href: `/${locale}/product/${displaySlug}`,
      image: p.imageUrl,
    };
  });

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setSlideIdx(i => (i + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const s = slides[slideIdx];
  const ctaLabel = isFr ? "ACHETER" : "Shop Now";

  return (
    <div
      className="lg:hidden mb-3 relative left-1/2 right-1/2 -translate-x-1/2 w-screen max-w-[100vw]"
      style={{ background: UNIFORM_BG }}
    >
      <div className="relative overflow-hidden h-40 w-full min-w-0">
        <Link prefetch={false} href={s.href} className="block relative h-full w-full">
          <div className="absolute inset-0 flex items-center">
            <div className="flex-1 pl-4 pr-2 py-4 text-white z-10 min-h-[128px] min-w-0">
              <div className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur rounded text-[9px] font-black tracking-widest mb-2">
                {s.badge}
              </div>
              <h3 className="text-base font-black leading-tight mb-1 drop-shadow line-clamp-2">{s.displayName}</h3>
              <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                <span className="text-sm font-bold drop-shadow">{formatPrice(s.price)}</span>
                {s.comparePrice && s.discount > 0 && (
                  <>
                    <span className="text-[10px] line-through opacity-70">{formatPrice(s.comparePrice)}</span>
                    <span className="text-[10px] font-black bg-white/20 px-1.5 py-0.5 rounded">-{s.discount}%</span>
                  </>
                )}
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-xs font-bold" style={{ color: "#CA3F2E" }}>
                {ctaLabel}
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
            <div className="w-32 h-32 relative flex-shrink-0 mr-4 rounded-2xl overflow-hidden shadow-lg">
              <Image src={s.image} alt={s.displayName} fill sizes="128px" quality={80} className="object-cover" />
            </div>
          </div>
        </Link>
        {slides.length > 1 && (
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
        )}
      </div>
    </div>
  );
}