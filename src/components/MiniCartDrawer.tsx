"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Truck } from "lucide-react";
import { useCart } from "@/lib/cart-context";

const FREE_SHIPPING_THRESHOLD = 100;

export default function MiniCartDrawer() {
  const { items, drawerOpen, closeDrawer, updateQuantity, removeItem, totalPrice, totalQuantity } = useCart();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeDrawer(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeDrawer]);

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
  const progress = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);
  const qualifiesFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-[70] shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-base font-bold">Your Cart</h2>
            <span className="text-xs text-gray-500">({totalQuantity} {totalQuantity === 1 ? "item" : "items"})</span>
          </div>
          <button
            onClick={closeDrawer}
            aria-label="Close cart"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {items.length > 0 && (
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4 text-gray-600" />
              {qualifiesFreeShipping ? (
                <p className="text-xs font-semibold text-green-600">You qualify for FREE shipping!</p>
              ) : (
                <p className="text-xs text-gray-700">
                  Add <span className="font-bold text-gray-900">${remaining.toFixed(2)}</span> more for FREE shipping
                </p>
              )}
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
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
            <div className="h-full flex flex-col items-center justify-center px-6 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-sm text-gray-500 mb-6">Add some products to get started!</p>
              <button
                onClick={closeDrawer}
                className="px-6 py-3 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 p-4">
                  <Link
                    href={`/product/${item.id}`}
                    onClick={closeDrawer}
                    className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-xl overflow-hidden"
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <Link
                        href={`/product/${item.id}`}
                        onClick={closeDrawer}
                        className="text-sm font-semibold text-gray-900 hover:text-brand-600 transition line-clamp-2 leading-tight"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id, item.size, item.color)}
                        aria-label="Remove item"
                        className="flex-shrink-0 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Size: {item.size} · Color: {item.color}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded-l-lg transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 rounded-r-lg transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
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
          <div className="border-t border-gray-100 p-5 space-y-3 bg-white">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-xl font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-gray-400 -mt-2">Shipping and taxes calculated at checkout</p>

            <Link
              href="/cart"
              onClick={closeDrawer}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition"
            >
              View Cart & Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={closeDrawer}
              className="w-full py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
