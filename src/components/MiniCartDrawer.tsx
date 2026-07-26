"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Truck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

const FREE_SHIPPING_THRESHOLD = 100;

export default function MiniCartDrawer() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { items, drawerOpen, closeDrawer, updateQuantity, removeItem, totalPrice, totalQuantity } = useCart();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeDrawer(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeDrawer]);

  if (!drawerOpen) return null;

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
  const progress = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);
  const qualifiesFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;

  return (
    <div
      className="fixed top-1/2 -translate-y-1/2 right-24 z-50 w-[380px] max-w-[calc(100vw-2rem)] animate-slide-in-left"
      aria-label={t("yourCart")}
      role="dialog"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <ShoppingBag className="w-5 h-5 flex-shrink-0" />
            <h2 className="text-base font-bold truncate">{t("yourCart")}</h2>
            <span className="text-xs text-gray-500 flex-shrink-0">
              ({totalQuantity} {totalQuantity === 1 ? t("item") : t("items")})
            </span>
          </div>
          <button
            onClick={closeDrawer}
            aria-label={t("closeCart")}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {items.length > 0 && (
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Truck className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
              {qualifiesFreeShipping ? (
                <p className="text-[11px] font-semibold text-green-600">{t("freeShippingQualified")}</p>
              ) : (
                <p className="text-[11px] text-gray-700">
                  {t("freeShippingProgress", { amount: `$${remaining.toFixed(2)}` })}
                </p>
              )}
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${qualifiesFreeShipping ? "bg-green-500" : "bg-brand-600"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <ShoppingBag className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{t("empty")}</h3>
              <p className="text-xs text-gray-500 mb-4">{t("emptyDescDrawer")}</p>
              <button
                onClick={closeDrawer}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition"
              >
                {t("continueShopping")}
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 p-3">
                  <Link
                    href={`/${locale}/product/${item.id}`}
                    onClick={closeDrawer}
                    className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-lg overflow-hidden"
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <Link
                        href={`/${locale}/product/${item.id}`}
                        onClick={closeDrawer}
                        className="text-xs font-semibold text-gray-900 hover:text-brand-600 transition line-clamp-2 leading-tight"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id, item.size, item.color)}
                        aria-label="Remove item"
                        className="flex-shrink-0 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {t("size")}: {item.size} - {t("color")}: {item.color}
                    </p>

                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="w-6 h-6 flex items-center justify-center hover:bg-gray-50 rounded-l-lg transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-[11px] font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="w-6 h-6 flex items-center justify-center hover:bg-gray-50 rounded-r-lg transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-4 space-y-2 bg-white flex-shrink-0">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-gray-600">{t("subtotal")}</span>
              <span className="text-lg font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-gray-400 -mt-1">{t("subtotalNote")}</p>

            <Link
              href={`/${locale}/cart`}
              onClick={closeDrawer}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition"
            >
              {t("viewCartCheckout")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
