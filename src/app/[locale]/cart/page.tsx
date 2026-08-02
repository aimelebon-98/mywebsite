"use client";
import { useCustomer } from "@/lib/customer-context";
import { useCurrency } from "@/lib/currency-context";
import { computeShipping } from "@/lib/shipping";
import BundleBanner from "@/components/BundleBanner";
import { findApplicableBundle, calcDiscount, type Bundle } from "@/lib/bundles";
import { trackEvent } from "@/components/AnalyticsTracker";
import AuthGateModal from "@/components/AuthGateModal";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, MessageCircle, AlertCircle, Ticket, X, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

function d(s: string): string {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

interface AppliedCoupon {
  id: string;
  code: string;
  type: string;
  value: number;
  discount: number;
  description?: string | null;
  descriptionFr?: string | null;
}

export default function CartPage() {
  const t = useTranslations("cart");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isFr = locale === "fr";

  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const { customer } = useCustomer();
  const { currency: userCurrency, format: formatPrice, rates: currencyRates } = useCurrency();

  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [bundles, setBundles] = useState<Bundle[]>([]);

  const appliedBundle = findApplicableBundle(items.map(i => ({ quantity: i.quantity })), bundles);
  const bundleDiscount = calcDiscount(totalPrice, appliedBundle);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const totalDiscount = bundleDiscount + couponDiscount;
  const finalTotal = Math.max(0, totalPrice - totalDiscount);

  const shippingInfo = computeShipping(userCurrency);
  const shippingUsd = shippingInfo.hasLocalRate && shippingInfo.amountLocal && shippingInfo.localCurrency
    ? shippingInfo.amountLocal / (currencyRates[shippingInfo.localCurrency] || 1)
    : 0;
  const grandTotal = finalTotal + shippingUsd;

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string }>({});
  const [mounted, setMounted] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings").then(r => r.json()).then(data => {
      if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
      fetch("/api/bundles").then(r => r.json()).then(setBundles).catch(() => {});
    }).catch(() => {});
  }, []);

  // Pre-fill customer info if logged in
  useEffect(() => {
    if (customer) {
      if (!customerName) setCustomerName(customer.name || "");
      if (!customerPhone && customer.phone) setCustomerPhone(customer.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

  // Re-validate coupon if cart changes (subtotal may drop below minimum)
  useEffect(() => {
    if (appliedCoupon) {
      // Silently re-check by triggering the same validate endpoint
      fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: appliedCoupon.code, orderTotal: totalPrice }),
      })
      .then(r => r.json())
      .then(data => {
        if (!data.ok) {
          setAppliedCoupon(null);
          setCouponError(data.error || (isFr ? d("Coupon plus valide") : "Coupon no longer valid"));
        } else if (data.discount !== appliedCoupon.discount) {
          setAppliedCoupon(prev => prev ? { ...prev, discount: data.discount } : null);
        }
      })
      .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPrice]);

  const applyCoupon = useCallback(async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, orderTotal: totalPrice }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setAppliedCoupon({
          id: data.coupon.id,
          code: data.coupon.code,
          type: data.coupon.type,
          value: data.coupon.value,
          discount: data.discount,
          description: data.coupon.description,
          descriptionFr: data.coupon.descriptionFr,
        });
        setCouponCode("");
      } else {
        setCouponError(data.error || (isFr ? "Code invalide" : "Invalid code"));
      }
    } catch {
      setCouponError(isFr ? d("Erreur r\u00e9seau") : "Network error");
    }
    setCouponLoading(false);
  }, [couponCode, totalPrice, isFr]);

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const validate = () => {
    const newErrors: { name?: string; phone?: string; address?: string } = {};
    if (!customerName.trim()) newErrors.name = t("nameRequired");
    if (!customerPhone.trim()) {
      newErrors.phone = t("phoneRequired");
    } else {
      const digits = customerPhone.replace(/\D/g, "");
      if (digits.length < 7) newErrors.phone = t("phoneInvalid");
    }
    if (!customerAddress.trim()) newErrors.address = t("addressRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const performWhatsAppCheckout = async () => {
    let orderNumber = "";
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName, customerPhone, customerAddress,
          items: items.map(it => ({
            id: it.id, name: it.name, size: it.size, color: it.color,
            quantity: it.quantity, price: it.price, imageUrl: it.imageUrl,
            subtotal: it.price * it.quantity,
          })),
          subtotal: totalPrice,
          discountAmount: totalDiscount,
          bundleName: appliedBundle?.name || null,
          couponCode: appliedCoupon?.code || null,
          couponDiscount: couponDiscount,
          total: finalTotal,
          customerId: customer?.id || null,
          currency: userCurrency,
          locale,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        orderNumber = data.order?.orderNumber || "";
      }
    } catch (err) {
      console.error("Failed to save order:", err);
    }

    let message = "*New Order from NewDealZone*\n\n";
    if (orderNumber) message += "*Order:* " + orderNumber + "\n";
    message += "*Customer:* " + customerName + "\n";
    message += "*Phone:* " + customerPhone + "\n";
    message += "*Address:* " + customerAddress + "\n";
    message += "\n*Order Details:*\n";
    message += "-----------------------------\n";

    items.forEach((item, i) => {
      message += (i + 1) + ". *" + item.name + "*\n";
      message += "   Size: " + item.size + " | Color: " + item.color + "\n";
      message += "   Qty: " + item.quantity + " x " + formatPrice(item.price) + "\n";
      message += "   Subtotal: " + formatPrice(item.price * item.quantity) + "\n\n";
    });

    message += "-----------------------------\n";
    if (bundleDiscount > 0 || couponDiscount > 0) {
      message += "Subtotal: " + formatPrice(totalPrice) + "\n";
      if (appliedBundle && bundleDiscount > 0) {
        message += "Bundle (" + appliedBundle.name + "): -" + formatPrice(bundleDiscount) + "\n";
      }
      if (appliedCoupon && couponDiscount > 0) {
        message += "Coupon (" + appliedCoupon.code + "): -" + formatPrice(couponDiscount) + "\n";
      }
    }
    if (shippingInfo.hasLocalRate) {
      message += "Shipping: " + shippingInfo.label + "\n";
      message += "*Total: " + formatPrice(grandTotal) + "*\n";
    } else {
      message += "Shipping: To be calculated based on your address\n";
      message += "*Subtotal: " + formatPrice(finalTotal) + "* (+ shipping to be added)\n";
    }
    message += "*Items: " + totalItems + "*\n";

    const phone = whatsappNumber.replace(/\D/g, "");
    try {
      trackEvent({
        eventType: "checkout_click",
        metadata: { itemCount: items.length, totalItems: items.reduce((s, i) => s + (i.quantity || 1), 0), coupon: appliedCoupon?.code || null },
      });
    } catch { /* ignore */ }
    const url = "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
    window.open(url, "_blank");
  };

  const handleCheckoutClick = () => {
    if (!validate()) {
      const firstErrorField = document.querySelector("[data-error=\"true\"]") as HTMLElement | null;
      if (firstErrorField) firstErrorField.focus();
      return;
    }
    if (customer) {
      performWhatsAppCheckout();
      return;
    }
    setShowAuthGate(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthGate(false);
    setPendingCheckout(true);
  };

  const handleGuestCheckout = () => {
    setShowAuthGate(false);
    performWhatsAppCheckout();
  };

  useEffect(() => {
    if (pendingCheckout && customer) {
      setPendingCheckout(false);
      performWhatsAppCheckout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCheckout, customer]);

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

  const inputBase = "w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition";
  const inputOk = "border-gray-200 focus:ring-gray-900";
  const inputErr = "border-red-400 focus:ring-red-400";

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20 lg:pt-24">
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
                        <img src={item.imageUrl} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
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

                  {/* Coupon input */}
                  <div className="mb-5 pb-5 border-b border-gray-200">
                    {appliedCoupon ? (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-green-800">{appliedCoupon.code}</span>
                            <span className="text-xs font-bold text-green-700">
                              -{appliedCoupon.type === "percent" ? appliedCoupon.value + "%" : formatPrice(appliedCoupon.value)}
                            </span>
                          </div>
                          {(isFr && appliedCoupon.descriptionFr) || appliedCoupon.description ? (
                            <p className="text-[10px] text-green-700 mt-0.5 line-clamp-1">
                              {isFr && appliedCoupon.descriptionFr ? appliedCoupon.descriptionFr : appliedCoupon.description}
                            </p>
                          ) : null}
                        </div>
                        <button onClick={removeCoupon} className="p-1.5 rounded-lg hover:bg-green-100 text-green-700 flex-shrink-0" aria-label="Remove coupon">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                          <Ticket className="w-3.5 h-3.5" />
                          {isFr ? "Code promo" : "Coupon code"}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } }}
                            placeholder={isFr ? "WELCOME15" : "WELCOME15"}
                            className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] transition"
                          />
                          <button
                            onClick={applyCoupon}
                            disabled={couponLoading || !couponCode.trim()}
                            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition disabled:opacity-40 flex items-center justify-center gap-1 min-w-[70px]"
                          >
                            {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : (isFr ? "OK" : "Apply")}
                          </button>
                        </div>
                        {couponError && (
                          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                            <AlertCircle className="w-3 h-3" /> {couponError}
                          </p>
                        )}
                        {customer && (
                          <Link href={`/${locale}/account/rewards`} className="mt-2 inline-block text-[10px] text-gray-500 hover:text-[#CA3F2E] transition">
                            {isFr ? d("Voir mes coupons \u2192") : "See my coupons \u2192"}
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

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

                    {couponDiscount > 0 && appliedCoupon && (
                      <div className="flex justify-between text-sm text-green-700">
                        <span className="inline-flex items-center gap-1">
                          <Ticket className="w-3 h-3" /> {appliedCoupon.code}
                        </span>
                        <span className="font-semibold">-{formatPrice(couponDiscount)}</span>
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

                  {/* Customer Info */}
                  <div className="space-y-3 mb-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {t("yourName")} <span className="text-red-500">*</span>
                      </label>
                      <input type="text" placeholder={t("namePlaceholder")} value={customerName}
                        data-error={!!errors.name}
                        onChange={(e) => { setCustomerName(e.target.value); if (errors.name) setErrors(prev => ({ ...prev, name: undefined })); }}
                        className={`${inputBase} ${errors.name ? inputErr : inputOk}`} />
                      {errors.name && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle className="w-3 h-3" /> {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {t("phoneNumber")} <span className="text-red-500">*</span>
                      </label>
                      <input type="tel" placeholder={t("phonePlaceholder")} value={customerPhone}
                        data-error={!!errors.phone}
                        onChange={(e) => { setCustomerPhone(e.target.value); if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined })); }}
                        className={`${inputBase} ${errors.phone ? inputErr : inputOk}`} />
                      {errors.phone && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle className="w-3 h-3" /> {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {t("deliveryAddress")} <span className="text-red-500">*</span>
                      </label>
                      <textarea placeholder={t("addressPlaceholder")} value={customerAddress}
                        data-error={!!errors.address}
                        onChange={(e) => { setCustomerAddress(e.target.value); if (errors.address) setErrors(prev => ({ ...prev, address: undefined })); }}
                        rows={2}
                        className={`${inputBase} resize-none ${errors.address ? inputErr : inputOk}`} />
                      {errors.address && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle className="w-3 h-3" /> {errors.address}
                        </p>
                      )}
                    </div>
                  </div>

                  <BundleBanner bundle={appliedBundle} bundles={bundles} currentItemCount={totalItems} discountAmount={bundleDiscount} currency={userCurrency} />

                  <button
                    onClick={handleCheckoutClick}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-500 text-white rounded-2xl font-semibold text-lg hover:bg-green-600 transition"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {t("checkoutWhatsapp")}
                  </button>

                  <p className="text-xs text-gray-400 text-center mt-3">{t("checkoutNote")}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <AuthGateModal
        open={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        onSuccess={handleAuthSuccess}
        onSkipAsGuest={handleGuestCheckout}
        locale={locale}
      />
    </main>
  );
}
