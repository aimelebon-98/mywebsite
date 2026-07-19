"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Star, ShoppingBag, Zap } from "lucide-react";
import type { Product } from "@/db/schema";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";
import ProductImage from "./ProductImage";

interface ProductCardProps {
  product: Product;
  badge?: string;
}

export default function ProductCard({ product, badge }: ProductCardProps) {
  const price = parseFloat(product.price);
  const comparePrice = product.comparePrice ? parseFloat(product.comparePrice) : null;
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const rating = parseFloat(product.rating ?? "0");
  const { addItem } = useCart();
  const router = useRouter();
  const [addedToCart, setAddedToCart] = useState(false);

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
      name: product.name,
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
      name: product.name,
      price,
      imageUrl: product.imageUrl,
      size: sizes[0] || "One Size",
      color: colors[0] || "Default",
      quantity: 1,
    });
    router.push("/cart");
  };

  return (
    <Link href={`/product/${product.slug || product.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-square mb-3">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {badge && (
            <span className={`px-2.5 py-1 text-white text-[10px] font-bold rounded-full ${
              badge === "HOT" ? "bg-red-500" :
              badge === "NEW" ? "bg-emerald-500" :
              badge === "LIMITED" ? "bg-purple-500" :
              badge === "SALE" ? "bg-orange-500" :
              "bg-gray-900"
            }`}>
              {badge}
            </span>
          )}
          {!badge && discount > 0 && (
            <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
              -{discount}%
            </span>
          )}
          {!badge && product.featured && (
            <span className="px-2.5 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-full">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
        >
          <Heart className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{product.brand || product.category}</p>
        <h3 className="font-semibold text-sm text-gray-900 group-hover:text-brand-600 transition line-clamp-2 leading-tight">{product.name}</h3>
        {rating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-base font-bold">${price.toFixed(2)}</span>
          {comparePrice && (
            <span className="text-xs text-gray-400 line-through">${comparePrice.toFixed(2)}</span>
          )}
        </div>
      </div>

      {/* Always-visible Action Buttons */}
      <div className="flex gap-2 mt-2.5">
        <button
          onClick={handleBuyNow}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 active:scale-95 transition"
        >
          <Zap className="w-3.5 h-3.5" /> BUY NOW
        </button>
        <button
          onClick={handleAddToCart}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition flex-shrink-0 ${
            addedToCart
              ? "bg-green-500 text-white scale-95"
              : "bg-gray-900 text-white hover:bg-gray-800 active:scale-95"
          }`}
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
  );
}
