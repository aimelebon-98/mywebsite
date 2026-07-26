"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";

const BRAND_RED = "#CA3F2E";

export default function FloatingCartPill() {
  const pathname = usePathname();
  const { totalItems, openDrawer, lastAddedAt } = useCart();
  const [pulse, setPulse] = useState(false);

  // Only show on shop and product pages
  const isShopOrProduct =
    pathname !== null &&
    (pathname.includes("/shop") || pathname.includes("/product/"));

  // Trigger pulse animation on new add
  useEffect(() => {
    if (lastAddedAt > 0) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 1200);
      return () => clearTimeout(t);
    }
  }, [lastAddedAt]);

  // Hide if not on shop/product OR cart is empty
  if (!isShopOrProduct || totalItems === 0) return null;

  return (
    <button
      onClick={openDrawer}
      aria-label={`Open cart (${totalItems} items)`}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 group"
    >
      {/* Pulse ring on new add */}
      {pulse && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-40"
          style={{ backgroundColor: BRAND_RED }}
        />
      )}

      <div
        className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 ${pulse ? "scale-110" : ""}`}
        style={{
          backgroundColor: BRAND_RED,
          boxShadow: "0 10px 30px rgba(202, 63, 46, 0.45)",
        }}
      >
        <ShoppingBag className="w-6 h-6" />

        {/* Item count badge */}
        <span
          className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 bg-white rounded-full text-[11px] font-black flex items-center justify-center shadow-md border-2 border-white"
          style={{ color: BRAND_RED }}
        >
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      </div>

      {/* Tooltip on hover */}
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none">
        Open cart
      </span>
    </button>
  );
}
