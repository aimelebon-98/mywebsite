"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Heart, ShoppingBag, Zap, Star, Check, ArrowRight } from "lucide-react";
import type { Product } from "@/db/schema";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import ProductImage from "./ProductImage";
import { useTranslations, useLocale } from "next-intl";

interface QuickViewModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, open, onClose }: QuickViewModalProps) {
  const t = useTranslations("product");
  const locale = useLocale();
  const router = useRouter();
  const { addItem } = useCart();
  const { isWished, toggle } = useWishlist();
  const wished = isWished(product.id);

  const price = parseFloat(product.price);
  const comparePrice = product.comparePrice ? parseFloat(product.comparePrice) : null;
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const rating = parseFloat(product.rating ?? "0");
  const reviewCount = product.reviewCount ?? 0;
  const displayStars = rating > 0 ? Math.round(rating) : 5;

  const sizes: string[] = (() => {
    try { return JSON.parse(product.sizes || "[]"); } catch { return []; }
  })();
  const colors: string[] = (() => {
    try { return JSON.parse(product.colors || "[]"); } catch { return []; }
  })();

  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || "One Size");
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] || "Default");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setSelectedSize(sizes[0] || "One Size");
      setSelectedColor(colors[0] || "Default");
      setAdded(false);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;

  const colorMap: Record<string, string> = {
    black: "#1a1a1a", white: "#ffffff", red: "#dc2626", blue: "#2563eb",
    green: "#16a34a", yellow: "#eab308", orange: "#f97316", pink: "#ec4899",
    purple: "#9333ea", brown: "#78350f", gray: "#6b7280", grey: "#6b7280",
    beige: "#d4b896", navy: "#1e3a8a", cream: "#f5f5dc", tan: "#d2b48c",
    silver: "#c0c0c0", gold: "#d4af37",
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price,
      imageUrl: product.imageUrl,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      name: product.name,
      price,
      imageUrl: product.imageUrl,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    });
    router.push(`/${locale}/cart`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col sm:flex-row animate-fade-in-up">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Image Side */}
        <div className="relative w-full sm:w-1/2 bg-gray-100 aspect-square sm:aspect-auto sm:h-auto flex-shrink-0">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                -{discount}%
              </span>
            )}
            {product.featured && (
              <span className="px-2.5 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-full shadow-sm">
                {t("featured")}
              </span>
            )}
          </div>
        </div>

        {/* Details Side */}
        <div className="w-full sm:w-1/2 p-5 sm:p-6 overflow-y-auto flex flex-col">
          <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase mb-1">
            {product.brand || product.category}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-2">
            {product.name}
          </h2>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center">
              {[1,2,3,4,5].map(i => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i <= displayStars ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({reviewCount} {reviewCount === 1 ? t("review") : t("reviews")})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-gray-900">${price.toFixed(2)}</span>
            {comparePrice && (
              <>
                <span className="text-sm text-gray-400 line-through">${comparePrice.toFixed(2)}</span>
                <span className="text-xs font-bold text-red-500">-{discount}%</span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-3 mb-4">
              {product.description}
            </p>
          )}

          {/* Colors */}
          {colors.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                {t("color") || "Color"}: <span className="text-gray-900 font-semibold normal-case">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((c, idx) => {
                  const key = c.toLowerCase().trim();
                  const bg = colorMap[key] || "#d1d5db";
                  const active = selectedColor === c;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(c)}
                      title={c}
                      className={`w-9 h-9 rounded-full border-2 transition ${
                        active ? "border-gray-900 scale-110" : "border-gray-200 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: bg }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                {t("size") || "Size"}
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s, idx) => {
                  const active = selectedSize === s;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[44px] px-3 py-2 rounded-lg text-sm font-semibold border-2 transition ${
                        active
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto space-y-2">
            <div className="flex gap-2">
              <button
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 active:scale-95 transition"
              >
                <Zap className="w-4 h-4" /> {t("buyNow")}
              </button>
              <button
                onClick={handleAddToCart}
                className={`px-4 py-3 flex items-center justify-center gap-1.5 rounded-xl text-sm font-bold transition ${
                  added
                    ? "bg-green-500 text-white"
                    : "bg-gray-900 text-white hover:bg-gray-800 active:scale-95"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> {t("added") || "Added"}
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> {t("addToCart")}
                  </>
                )}
              </button>
              <button
                onClick={() => toggle(product.id)}
                aria-label={wished ? t("removeFromWishlist") : t("addToWishlist")}
                className={`w-11 h-11 flex items-center justify-center rounded-xl border transition ${
                  wished
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white text-gray-700 border-gray-200 hover:border-red-500 hover:text-red-500"
                }`}
              >
                <Heart className={`w-4 h-4 ${wished ? "fill-current" : ""}`} />
              </button>
            </div>

            <Link
              href={`/${locale}/product/${product.slug || product.id}`}
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 transition group"
            >
              {t("viewFullDetails") || "View full details"}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
