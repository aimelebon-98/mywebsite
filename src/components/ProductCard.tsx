"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Star, ShoppingBag, Zap, Eye } from "lucide-react";
import type { Product } from "@/db/schema";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useState } from "react";
import ProductImage from "./ProductImage";
import QuickViewModal from "./QuickViewModal";
import { useTranslations, useLocale } from "next-intl";
import { getProductName } from "@/lib/product-i18n";

interface ProductCardProps {
  product: Product;
  badge?: string;
}

export default function ProductCard({ product, badge }: ProductCardProps) {
  const t = useTranslations("product");
  const locale = useLocale();

  const displayName = getProductName(product, locale);

  const price = parseFloat(product.price);
  const comparePrice = product.comparePrice ? parseFloat(product.comparePrice) : null;
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const rating = parseFloat(product.rating ?? "0");
  const reviewCount = product.reviewCount ?? 0;
  const displayStars = rating > 0 ? Math.round(rating) : 5;
  const { addItem } = useCart();
  const { isWished, toggle } = useWishlist();
  const router = useRouter();
  const [addedToCart, setAddedToCart] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const wished = isWished(product.id);

  const sizes: string[] = (() => {
    try { return JSON.parse(product.sizes || "[]"); } catch { return []; }
  })();
  const colors: string[] = (() => {
    try { return JSON.parse(product.colors || "[]"); } catch { return []; }
  })();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: displayName,
      price,
      imageUrl: product.imageUrl,
      size: sizes[0] || "One Size",
      color: colors[0] || "Default",
      quantity: 1,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: displayName,
      price,
      imageUrl: product.imageUrl,
      size: sizes[0] || "One Size",
      color: colors[0] || "Default",
      quantity: 1,
    });
    router.push(`/${locale}/cart`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const colorMap: Record<string, string> = {
    black: "#1a1a1a", white: "#ffffff", red: "#dc2626", blue: "#2563eb",
    green: "#16a34a", yellow: "#eab308", orange: "#f97316", pink: "#ec4899",
    purple: "#9333ea", brown: "#78350f", gray: "#6b7280", grey: "#6b7280",
    beige: "#d4b896", navy: "#1e3a8a", cream: "#f5f5dc", tan: "#d2b48c",
    silver: "#c0c0c0", gold: "#d4af37",
  };

  return (
    <>
      <Link href={`/${locale}/product/${product.slug || product.id}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-square mb-3">
          <ProductImage
            src={product.imageUrl}
            alt={displayName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {badge && (
              <span className={`px-2.5 py-1 text-white text-[10px] font-bold rounded-full shadow-sm ${
                badge === "HOT"     ? "bg-red-500"    :
                badge === "NEW"     ? "bg-emerald-500":
                badge === "LIMITED" ? "bg-purple-500" :
                badge === "SALE"    ? "bg-orange-500" :
                "bg-gray-900"
              }`}>
                {badge}
              </span>
            )}
            {!badge && discount > 0 && (
              <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                -{discount}%
              </span>
            )}
            {!badge && product.featured && (
              <span className="px-2.5 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-full shadow-sm">
                {t("featured")}
              </span>
            )}
          </div>

          <button
            onClick={handleWishlist}
            aria-label={wished ? t("removeFromWishlist") : t("addToWishlist")}
            className={`absolute top-3 right-3 w-9 h-9 backdrop-blur rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95 z-10 ${
              wished ? "bg-red-500 text-white" : "bg-white/95 text-gray-700 hover:text-red-500"
            }`}
          >
            <Heart className={`w-4 h-4 ${wished ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={handleQuickView}
            className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10"
          >
            <div className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur text-gray-900 rounded-xl text-xs font-semibold shadow-lg hover:bg-white transition">
              <Eye className="w-3.5 h-3.5" />
              {t("quickView")}
            </div>
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] text-gray-400 font-medium tracking-wide">{product.brand || product.category}</p>
          <h3 className="font-semibold text-sm text-gray-900 group-hover:text-brand-600 transition line-clamp-2 leading-tight">{displayName}</h3>

          {colors.length > 0 && (
            <div className="flex items-center gap-1 pt-0.5">
              {colors.slice(0, 4).map((c, idx) => {
                const key = c.toLowerCase().trim();
                const bg = colorMap[key] || "#d1d5db";
                return (
                  <span
                    key={idx}
                    title={c}
                    className="w-3 h-3 rounded-full border border-gray-200 shadow-sm"
                    style={{ backgroundColor: bg }}
                  />
                );
              })}
              {colors.length > 4 && (
                <span className="text-[9px] text-gray-400 font-medium ml-0.5">+{colors.length - 4}</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[1,2,3,4,5].map(i => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i <= displayStars ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">({reviewCount})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-base font-bold">${price.toFixed(2)}</span>
            {comparePrice && (
              <span className="text-xs text-gray-400 line-through">${comparePrice.toFixed(2)}</span>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-2.5">
          <button
            onClick={handleBuyNow}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 active:scale-95 transition"
          >
            <Zap className="w-3.5 h-3.5" /> {t("buyNow")}
          </button>
          <button
            onClick={handleAddToCart}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition flex-shrink-0 ${
              addedToCart
                ? "bg-green-500 text-white scale-95"
                : "bg-gray-900 text-white hover:bg-gray-800 active:scale-95"
            }`}
            aria-label={t("addToCart")}
          >
            {addedToCart ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </Link>

      <QuickViewModal
        product={product}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
