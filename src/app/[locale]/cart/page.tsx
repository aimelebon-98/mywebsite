"use client";
import { useCustomer } from "@/lib/customer-context";
import { useCurrency } from "@/lib/currency-context";
import { computeShipping } from "@/lib/shipping";
import BundleBanner from "@/components/BundleBanner";
import { findApplicableBundle, calcDiscount, type Bundle } from "@/lib/bundles";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight, Ticket, Shield, Truck } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";

function d(s: string): string {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export default function CartPage() {
  const t = useTranslations("cart");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isFr = locale === "fr";

  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const { customer } = useCustomer();
  const { currency: userCurrency, format: formatPrice, rates: currencyRates } = useCurrency();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [mounted, setMounted] = useState(false);

  const appliedBundle = findApplicableBundle(items.map(i => ({ quantity: i.quantity })), bundles);
  const bundleDiscount = calcDiscount(totalPrice, appliedBundle);
  const finalTotal = Math.max(0, totalPrice - bundleDiscount);
  const shippingInfo = computeShipping(userCurrency);
  const shippingUsd = shippingInfo.hasLocalRate && shippingInfo.amountLocal && shippingInfo.localCurrency
    ? shippingInfo.amountLocal / (currencyRates[shippingInfo.localCurrency] || 1)
    : 0;
  const grandTotal = finalTotal + shippingUsd;

  useEffect(() => {
    setMounted(true);
    fetch("/api/bundles").then(r => r.json()).then(setBundles).catch(() => {});
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 text-center">
          <div className="animate-pulse text-gray-400">{t("loadingCart")}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href={`/${locale}/shop`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition">
            <ArrowLeft className="w-4 h-4" /> {tc("continueShopping")}
          </Link>

          <h1 className="text-3xl lg:text-4xl font-bold mb-8">{t("title")}</h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">{t("empty")}</h3>
              <p className="text-gray-500 mb-6">{t("emptyDesc")}</p>
              <Link href={`/${locale}/shop`} className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 transition inline-block">
                {tc("browseShoes")}
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{t("size")}: {item.size} - {t("color")}: {item.color}</p>
                      <p className="text-lg font-bold mt-2">{formatPrice(item.price)}</p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="inline-flex items-center border border-gray-300 rounded-lg">
                          <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)} className="p-2 hover:bg-gray-200 transition rounded-l-lg">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-4 text-sm font-semibold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)} className="p-2 hover:bg-gray-200 transition rounded-r-lg">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.id, item.size, item.color)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium transition">
                  {t("clearCart")}
                </button>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-2xl p-6 sticky top-28">
                  <h3 className="text-lg font-bold mb-4">{t("orderSummary")}</h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t("subtotal")} ({totalItems} {totalItems === 1 ? t("item") : t("items")})</span>
                      <span className="font-semibold">{formatPrice(totalPrice)}</span>
                    </div>

                    {bundleDiscount > 0 && appliedBundle && (
                      <div className="flex justify-between text-sm text-green-700">
                        <span>{isFr ? "Remise bundle" : "Bundle discount"} ({appliedBundle.name})</span>
                        <span className="font-semibold">-{formatPrice(bundleDiscount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm items-start">
                      <span className="text-gray-500">{t("shipping")}</span>
                      {shippingInfo.hasLocalRate ? (
                        <span className="font-semibold text-right">{shippingInfo.label}</span>
                      ) : (
                        <span className="text-gray-500 text-xs italic text-right max-w-[200px]">{t("shippingQuote")}</span>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
                      <span className="font-bold text-lg">{t("total")}</span>
                      <div className="text-right">
                        <span className="font-bold text-lg">{formatPrice(grandTotal)}</span>
                        {!shippingInfo.hasLocalRate && (
                          <div className="text-[10px] text-gray-400 font-normal">{t("plusShipping")}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <BundleBanner bundle={appliedBundle} bundles={bundles} currentItemCount={totalItems} discountAmount={bundleDiscount} currency={userCurrency} />

                  {/* CHECKOUT BUTTON - navigates to /checkout */}
                  <Link
                    href={`/${locale}/checkout`}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white rounded-2xl font-bold text-lg transition group"
                  >
                    {isFr ? "Passer au paiement" : "Checkout"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition" />
                  </Link>

                  {/* Trust badges */}
                  <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Shield className="w-4 h-4 text-gray-500" />
                      <span className="text-[10px] text-gray-500 leading-tight">{isFr ? d("S\u00e9curis\u00e9") : "Secure"}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Truck className="w-4 h-4 text-gray-500" />
                      <span className="text-[10px] text-gray-500 leading-tight">{isFr ? "Livraison" : "Delivery"}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Ticket className="w-4 h-4 text-gray-500" />
                      <span className="text-[10px] text-gray-500 leading-tight">{isFr ? "Coupons" : "Coupons"}</span>
                    </div>
                  </div>

                  {!customer && (
                    <p className="text-xs text-gray-400 text-center mt-4">
                      {isFr
                        ? d("Commandez en tant qu\u0027invit\u00e9 ou cr\u00e9ez un compte lors du paiement.")
                        : "Check out as guest or create an account at checkout."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
