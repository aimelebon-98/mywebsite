"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/lib/cart-context";
import { useCustomer } from "@/lib/customer-context";
import { useCurrency } from "@/lib/currency-context";
import { computeShipping } from "@/lib/shipping";
import { findApplicableBundle, calcDiscount, type Bundle } from "@/lib/bundles";
import { trackEvent } from "@/components/AnalyticsTracker";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowLeft, MessageCircle, AlertCircle, User, Mail, Lock, Phone, MapPin,
  Loader2, Eye, EyeOff, Sparkles, CheckCircle, Ticket, ShoppingBag, LogIn, UserPlus, ArrowRight
} from "lucide-react";

function d(s: string): string {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

interface AppliedCoupon {
  id: string; code: string; type: string; value: number; discount: number;
  description?: string | null; descriptionFr?: string | null;
}

type Mode = "guest" | "signup" | "login";
type Stage = "auth" | "details" | "success";

export default function CheckoutPage() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const isFr = locale === "fr";
  const router = useRouter();

  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { customer, refresh } = useCustomer();
  const { currency: userCurrency, format: formatPrice, rates: currencyRates } = useCurrency();

  const [mode, setMode] = useState<Mode>("guest");
  const [stage, setStage] = useState<Stage>("auth");
  const [orderNumber, setOrderNumber] = useState("");
  const [wasGuest, setWasGuest] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [welcomeCode, setWelcomeCode] = useState("");
  const [mounted, setMounted] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const appliedBundle = findApplicableBundle(items.map(i => ({ quantity: i.quantity })), bundles);
  const bundleDiscount = calcDiscount(totalPrice, appliedBundle);
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const totalDiscount = bundleDiscount + couponDiscount;
  const finalTotal = Math.max(0, totalPrice - totalDiscount);
  const shippingInfo = computeShipping(userCurrency);
  const shippingUsd = shippingInfo.hasLocalRate && shippingInfo.amountLocal && shippingInfo.localCurrency
    ? shippingInfo.amountLocal / (currencyRates[shippingInfo.localCurrency] || 1)
    : 0;
  const grandTotal = finalTotal + shippingUsd;

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings").then(r => r.json()).then(data => {
      if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
      fetch("/api/bundles").then(r => r.json()).then(setBundles).catch(() => {});
    }).catch(() => {});
  }, []);

  // If already logged in, skip auth stage and prefill from account
  useEffect(() => {
    if (!customer) return;

    // Set name + phone from customer profile
    setName(prev => prev || customer.name || "");
    setPhone(prev => prev || customer.phone || "");
    setWasGuest(false);
    if (stage === "auth") setStage("details");

    // Fetch default address for prefill
    fetch("/api/customer/addresses")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.addresses?.length) return;
        // Prefer default address, else the most recent
        const list = data.addresses as Array<{ isDefault?: boolean; fullName?: string; phone?: string; street?: string; city?: string; state?: string; country?: string; postalCode?: string; }>;
        const def = list.find(a => a.isDefault) || list[0];
        if (!def) return;

        // Only fill blanks - do not overwrite what user already typed
        setName(prev => prev || def.fullName || customer.name || "");
        setPhone(prev => prev || def.phone || customer.phone || "");
        const addrParts = [def.street, def.city, def.state, def.postalCode, def.country].filter(Boolean).join(", ");
        setAddress(prev => prev || addrParts);
      })
      .catch(() => { /* ignore - user can still type manually */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

  // Redirect to shop if cart empty (unless on success stage)
  useEffect(() => {
    if (mounted && items.length === 0 && stage !== "success") {
      router.push(`/${locale}/cart`);
    }
  }, [mounted, items.length, stage, locale, router]);

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
          id: data.coupon.id, code: data.coupon.code, type: data.coupon.type,
          value: data.coupon.value, discount: data.discount,
          description: data.coupon.description, descriptionFr: data.coupon.descriptionFr,
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

  const handleAuthSubmit = async () => {
    setAuthError("");
    setErrors({});

    if (mode === "signup" && !name.trim()) { setAuthError(isFr ? "Nom requis" : "Name required"); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setAuthError(isFr ? "Email invalide" : "Invalid email"); return; }
    if (mode === "signup" && password.length < 8) { setAuthError(isFr ? d("Mot de passe : 8 caract\u00e8res minimum") : "Password: 8 characters minimum"); return; }
    if (mode === "login" && !password) { setAuthError(isFr ? "Mot de passe requis" : "Password required"); return; }

    setLoading(true);


    try {
      const url = mode === "signup" ? "/api/customer/register" : "/api/customer/login";
      const body = mode === "signup"
        ? { name: name.trim(), email: email.trim().toLowerCase(), password, locale }
        : { email: email.trim().toLowerCase(), password };

      const res = await fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        await refresh();
        setWasGuest(false);
        if (mode === "signup" && data.welcomeCoupon?.code) {
          setWelcomeCode(data.welcomeCoupon.code);
          setTimeout(() => { setStage("details"); setWelcomeCode(""); }, 2200);
        } else {
          setStage("details");
        }
      } else {
        setAuthError(data.error || (isFr ? "Erreur" : "Error"));
      }
    } catch {
      setAuthError(isFr ? d("Erreur r\u00e9seau") : "Network error");
    }
    setLoading(false);
  };

  const handleGuestContinue = () => {
    setAuthError("");
    if (!name.trim()) { setAuthError(isFr ? "Nom requis" : "Name required"); return; }
    setWasGuest(true);
    setStage("details");
  };

  const validateDetails = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = isFr ? "Nom requis" : "Name required";
    if (!phone.trim()) { e.phone = isFr ? d("T\u00e9l\u00e9phone requis") : "Phone required"; }
    else if (phone.replace(/\D/g, "").length < 7) { e.phone = isFr ? d("T\u00e9l\u00e9phone invalide") : "Invalid phone"; }
    if (!address.trim()) e.address = isFr ? "Adresse requise" : "Address required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const performCheckout = async () => {
    if (!validateDetails()) return;
    setLoading(true);

    // Save order
    let orderNum = "";
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name, customerPhone: phone, customerAddress: address,
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
          // Order amounts are stored in USD (our base currency).
          // userCurrency is only for display - store as USD so dashboard math works.
          currency: "USD",
          displayCurrency: userCurrency,
          locale,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        orderNum = data.order?.orderNumber || "";
      }
    } catch { /* ignore */ }

    setOrderNumber(orderNum);

    // Auto-save address + phone to customer account (only for logged-in users, first order or new address)
    if (customer && orderNum) {
      try {
        // Update phone on profile if empty
        if (!customer.phone && phone.trim()) {
          await fetch("/api/customer/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: phone.trim() }),
          }).catch(() => {});
        }

        // Fetch existing addresses to decide whether to save
        const addrRes = await fetch("/api/customer/addresses");
        if (addrRes.ok) {
          const addrData = await addrRes.json();
          const existing = (addrData.addresses || []) as Array<{ street?: string; city?: string; phone?: string }>;
          const normalizedNew = address.trim().toLowerCase().replace(/\s+/g, " ");
          const isDuplicate = existing.some(a => {
            const combined = ((a.street || "") + " " + (a.city || "")).toLowerCase().replace(/\s+/g, " ").trim();
            return combined && normalizedNew.includes(combined.split(" ")[0] || "");
          });

          // Save as new address if not duplicate (best-effort - use whole address string as street)
          if (!isDuplicate && address.trim()) {
            const parts = address.split(",").map(s => s.trim()).filter(Boolean);
            const street = parts[0] || address.trim();
            const city = parts[1] || "Unknown";
            const country = parts[parts.length - 1] || "Nigeria";
            const isFirst = existing.length === 0;

            await fetch("/api/customer/addresses", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                label: isFirst ? "Home" : "Address " + (existing.length + 1),
                fullName: name.trim() || customer.name,
                phone: phone.trim(),
                street,
                city,
                country,
                isDefault: isFirst,
              }),
            }).catch(() => {});
          }
        }
      } catch { /* non-blocking */ }
    }

    // Build WhatsApp message
    let message = "*New Order from NewDealZone*\n\n";
    if (orderNum) message += "*Order:* " + orderNum + "\n";
    message += "*Customer:* " + name + "\n";
    message += "*Phone:* " + phone + "\n";
    message += "*Address:* " + address + "\n";
    if (customer) message += "*Account:* " + (customer.email || "registered") + "\n";
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
      if (appliedBundle && bundleDiscount > 0) message += "Bundle (" + appliedBundle.name + "): -" + formatPrice(bundleDiscount) + "\n";
      if (appliedCoupon && couponDiscount > 0) message += "Coupon (" + appliedCoupon.code + "): -" + formatPrice(couponDiscount) + "\n";
    }
    if (shippingInfo.hasLocalRate) {
      message += "Shipping: " + shippingInfo.label + "\n";
      message += "*Total: " + formatPrice(grandTotal) + "*\n";
    } else {
      message += "Shipping: To be calculated based on your address\n";
      message += "*Subtotal: " + formatPrice(finalTotal) + "* (+ shipping to be added)\n";
    }
    message += "*Items: " + totalItems + "*\n";

    // Guest incentive message
    if (wasGuest && !customer) {
      const siteUrl = window.location.origin;
      message += "\n-----------------------------\n";
      message += "Order received! We will confirm and process shortly.\n\n";
      message += "*Save time on your next order!*\n";
      message += "Create a free account to:\n";
      message += " - Get a welcome discount coupon\n";
      message += " - Track orders and delivery status\n";
      message += " - Save addresses for faster checkout\n";
      message += " - Access exclusive member offers\n\n";
      message += "Register in 30 seconds: " + siteUrl + "/" + locale + "/account/register\n";
    } else if (customer) {
      message += "\n-----------------------------\n";
      message += "Order received! We will confirm and process shortly.\n";
      message += "Track your order: " + window.location.origin + "/" + locale + "/account/orders\n";
    }

    try {
      trackEvent({
        eventType: "checkout_click",
        metadata: {
          itemCount: items.length,
          totalItems: items.reduce((s, i) => s + (i.quantity || 1), 0),
          coupon: appliedCoupon?.code || null,
          isGuest: wasGuest,
        },
      });
    } catch { /* ignore */ }

    const waPhone = whatsappNumber.replace(/\D/g, "");
    const url = "https://wa.me/" + waPhone + "?text=" + encodeURIComponent(message);
    window.open(url, "_blank");

    // Clear cart immediately after successful submission
    // (order is saved server-side, WhatsApp is opened - no reason to keep items)
    clearCart();

    setStage("success");
    setLoading(false);
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-10 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E] mx-auto" /></div>
      </main>
    );
  }

  // ==================== SUCCESS STAGE ====================
  if (stage === "success") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <Navbar />
        <div className="pb-16">
          <div className="max-w-lg mx-auto px-4 py-12">
            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10 text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center animate-bounce-in">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">
                {isFr ? d("Commande re\u00e7ue !") : "Order Received!"}
              </h1>
              {orderNumber && (
                <p className="text-sm text-gray-500 mb-1">
                  {isFr ? d("N\u00b0 de commande") : "Order"}: <span className="font-mono font-bold text-gray-900">{orderNumber}</span>
                </p>
              )}
              <p className="text-gray-600 mt-4 mb-6 leading-relaxed">
                {isFr
                  ? d("Votre commande a \u00e9t\u00e9 envoy\u00e9e sur WhatsApp. Notre \u00e9quipe vous contactera pour confirmer les d\u00e9tails et le paiement.")
                  : "Your order has been sent to WhatsApp. Our team will contact you to confirm details and payment."}
              </p>

              {wasGuest && !customer && (
                <div className="bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] rounded-2xl p-5 text-left mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                      {isFr ? d("Cr\u00e9ez votre compte") : "Create your account"}
                    </span>
                  </div>
                  <p className="text-white font-bold mb-2">
                    {isFr ? d("Gagnez un coupon de bienvenue !") : "Get a welcome coupon!"}
                  </p>
                  <p className="text-white/85 text-xs mb-4">
                    {isFr
                      ? d("Suivez vos commandes, sauvegardez vos adresses et acc\u00e9dez aux offres membres.")
                      : "Track orders, save addresses, and unlock member offers."}
                  </p>
                  <Link
                    href={`/${locale}/account/register`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#CA3F2E] rounded-xl font-bold text-sm hover:bg-gray-100 transition w-full justify-center"
                  >
                    {isFr ? d("Cr\u00e9er mon compte") : "Create my account"}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              <button
                onClick={() => router.push(`/${locale}/shop`)}
                className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition inline-flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                {isFr ? "Continuer les achats" : "Continue Shopping"}
              </button>

              {customer && (
                <Link
                  href={`/${locale}/account/orders`}
                  className="block mt-3 text-sm text-gray-500 hover:text-[#CA3F2E] transition"
                >
                  {isFr ? "Voir mes commandes" : "View my orders"} {String.fromCharCode(0x2192)}
                </Link>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // ==================== WELCOME CODE FLASH ====================
  if (welcomeCode) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-10 pb-16 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">{isFr ? "Bienvenue !" : "Welcome!"}</h2>
            <p className="text-sm text-gray-500 mb-4">
              {isFr ? d("Votre coupon de bienvenue :") : "Your welcome coupon:"}
            </p>
            <div className="bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] rounded-2xl p-4">
              <div className="font-mono text-3xl font-black text-white tracking-widest">{welcomeCode}</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const inputBase = "w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition";
  const inputOk = "border-gray-200 focus:ring-[#CA3F2E]";
  const inputErr = "border-red-400 focus:ring-red-400";

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href={`/${locale}/cart`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition">
            <ArrowLeft className="w-4 h-4" /> {isFr ? "Retour au panier" : "Back to cart"}
          </Link>

          <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-8">{isFr ? "Paiement" : "Checkout"}</h1>

          <div className="grid lg:grid-cols-[1fr_380px] gap-8">

            {/* LEFT: Auth / Details */}
            <div>
              {stage === "auth" && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">



                  {/* Mode tabs */}
                  <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-xl mb-6">
                    <button onClick={() => { setMode("guest"); setAuthError(""); }}
                      className={"flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition " +
                        (mode === "guest" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {isFr ? "Invit\u00e9" : "Guest"}
                    </button>
                    <button onClick={() => { setMode("signup"); setAuthError(""); }}
                      className={"flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition " +
                        (mode === "signup" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                      <UserPlus className="w-3.5 h-3.5" />
                      {isFr ? "Inscription" : "Sign up"}
                    </button>
                    <button onClick={() => { setMode("login"); setAuthError(""); }}
                      className={"flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition " +
                        (mode === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                      <LogIn className="w-3.5 h-3.5" />
                      {isFr ? "Connexion" : "Log in"}
                    </button>
                  </div>

                  {/* GUEST MODE */}
                  {mode === "guest" && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <ShoppingBag className="w-4 h-4 text-[#CA3F2E]" />
                        <span className="text-[10px] font-bold text-[#CA3F2E] uppercase tracking-widest">
                          {isFr ? "Sans compte" : "No account needed"}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-gray-900 mb-1">
                        {isFr ? d("Commande rapide") : "Quick checkout"}
                      </h2>
                      <p className="text-xs text-gray-500 mb-5">
                        {isFr
                          ? d("Passez directement \u00e0 la caisse. Aucune inscription requise.")
                          : "Skip registration and check out directly."}
                      </p>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                            {isFr ? "Votre nom" : "Your name"} *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" value={name} onChange={e => setName(e.target.value)}
                              placeholder={isFr ? "Jean Dupont" : "John Doe"} autoComplete="name"
                              className={"pl-10 " + inputBase + " " + inputOk} />
                          </div>
                        </div>
                      </div>

                      {authError && (
                        <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {authError}
                        </div>
                      )}

                      <button onClick={handleGuestContinue}
                        className="w-full mt-5 flex items-center justify-center gap-2 py-3.5 bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white rounded-xl font-bold text-sm transition">
                        {isFr ? "Continuer" : "Continue"}
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <p className="text-[10px] text-center text-gray-400 mt-3">
                        {isFr
                          ? d("Astuce : cr\u00e9ez un compte pour recevoir un coupon de bienvenue et suivre vos commandes.")
                          : "Tip: create an account to get a welcome coupon and track your orders."}
                      </p>
                    </div>
                  )}

                  {/* SIGNUP MODE */}
                  {mode === "signup" && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-[#CA3F2E]" />
                        <span className="text-[10px] font-bold text-[#CA3F2E] uppercase tracking-widest">
                          {isFr ? d("+ Coupon offert !") : "+ Free welcome coupon!"}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-gray-900 mb-1">
                        {isFr ? d("Cr\u00e9ez votre compte") : "Create your account"}
                      </h2>
                      <p className="text-xs text-gray-500 mb-5">
                        {isFr
                          ? d("30 secondes. Nous vous demanderons le t\u00e9l\u00e9phone et l\u0027adresse ensuite.")
                          : "30 seconds. We will ask for phone and address next."}
                      </p>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                            {isFr ? "Nom complet" : "Full name"} *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" value={name} onChange={e => setName(e.target.value)}
                              placeholder={isFr ? "Jean Dupont" : "John Doe"} autoComplete="name" autoFocus
                              className={"pl-10 " + inputBase + " " + inputOk} />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Email *</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                              placeholder="you@example.com" autoComplete="email"
                              className={"pl-10 " + inputBase + " " + inputOk} />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                            {isFr ? "Mot de passe" : "Password"} * <span className="text-gray-400 font-normal normal-case">(8+ {isFr ? "car." : "chars"})</span>
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type={showPassword ? "text" : "password"} value={password}
                              onChange={e => setPassword(e.target.value)} placeholder="********"
                              autoComplete="new-password"
                              className={"pl-10 pr-10 " + inputBase + " " + inputOk} />
                            <button type="button" onClick={() => setShowPassword(s => !s)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700">
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {authError && (
                        <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {authError}
                        </div>
                      )}

                      <button onClick={handleAuthSubmit} disabled={loading}
                        className="w-full mt-5 flex items-center justify-center gap-2 py-3.5 bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white rounded-xl font-bold text-sm transition disabled:opacity-50">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isFr ? d("Cr\u00e9er mon compte") : "Create my account"}
                      </button>

                      <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full h-px bg-gray-200" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {isFr ? "ou" : "or"}
                          </span>
                        </div>
                      </div>

                      <button type="button" disabled
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-200 text-gray-400 rounded-xl font-bold text-sm cursor-not-allowed">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.1 1.6l3-3C17.2 2.4 14.8 1.5 12 1.5 7.4 1.5 3.5 4.1 1.7 8l3.5 2.7c.9-2.5 3.3-4.3 6.8-4.3z"/>
                          <path fill="#4285F4" d="M23 12c0-.7-.1-1.4-.2-2H12v4h6.2c-.3 1.5-1.1 2.7-2.4 3.5l3.5 2.7c2.1-1.9 3.7-4.7 3.7-8.2z"/>
                          <path fill="#FBBC05" d="M5.2 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.7 7C.9 8.5.5 10.2.5 12s.4 3.5 1.2 5l3.5-2.7z"/>
                          <path fill="#34A853" d="M12 22.5c2.8 0 5.2-.9 6.9-2.5l-3.5-2.7c-1 .7-2.2 1.1-3.5 1.1-3.5 0-6-2-6.8-4.6L1.7 16C3.5 19.9 7.4 22.5 12 22.5z"/>
                        </svg>
                        {isFr ? "Google (bient\u00f4t)" : "Google (coming soon)"}
                      </button>
                    </div>
                  )}

                  {/* LOGIN MODE */}
                  {mode === "login" && (
                    <div>
                      <h2 className="text-xl font-black text-gray-900 mb-1">{isFr ? "Bon retour !" : "Welcome back!"}</h2>
                      <p className="text-xs text-gray-500 mb-5">
                        {isFr ? "Connectez-vous pour continuer" : "Sign in to continue"}
                      </p>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Email *</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                              placeholder="you@example.com" autoComplete="email" autoFocus
                              className={"pl-10 " + inputBase + " " + inputOk} />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                            {isFr ? "Mot de passe" : "Password"} *
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type={showPassword ? "text" : "password"} value={password}
                              onChange={e => setPassword(e.target.value)} placeholder="********"
                              autoComplete="current-password"
                              className={"pl-10 pr-10 " + inputBase + " " + inputOk} />
                            <button type="button" onClick={() => setShowPassword(s => !s)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700">
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {authError && (
                        <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {authError}
                        </div>
                      )}

                      <button onClick={handleAuthSubmit} disabled={loading}
                        className="w-full mt-5 flex items-center justify-center gap-2 py-3.5 bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white rounded-xl font-bold text-sm transition disabled:opacity-50">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isFr ? "Se connecter" : "Sign in"}
                      </button>

                      <Link href={`/${locale}/account/forgot-password`}
                        className="block text-center text-xs text-gray-500 hover:text-[#CA3F2E] transition mt-3">
                        {isFr ? d("Mot de passe oubli\u00e9 ?") : "Forgot password?"}
                      </Link>
                    </div>
                  )}

                </div>
              )}

              {/* DETAILS STAGE */}
              {stage === "details" && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
                  {customer && (
                    <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] flex items-center justify-center text-white font-bold text-sm">
                        {customer.name.slice(0,1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  )}

                  <h2 className="text-xl font-black text-gray-900 mb-1">
                    {isFr ? d("D\u00e9tails de livraison") : "Delivery details"}
                  </h2>
                  <p className="text-xs text-gray-500 mb-5">
                    {isFr ? d("O\u00f9 devons-nous livrer votre commande ?") : "Where should we deliver your order?"}
                  </p>

                  <div className="space-y-3">
                    {!customer && (
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                          {isFr ? "Nom complet" : "Full name"} *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="text" value={name} onChange={e => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: "" })); }}
                            placeholder={isFr ? "Jean Dupont" : "John Doe"}
                            className={"pl-10 " + inputBase + " " + (errors.name ? inputErr : inputOk)} />
                        </div>
                        {errors.name && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                        {isFr ? d("T\u00e9l\u00e9phone") : "Phone number"} *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); if (errors.phone) setErrors(p => ({ ...p, phone: "" })); }}
                          placeholder="+1 234 567 8900" autoComplete="tel"
                          className={"pl-10 " + inputBase + " " + (errors.phone ? inputErr : inputOk)} />
                      </div>
                      {errors.phone && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="w-3 h-3" /> {errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                        {isFr ? "Adresse de livraison" : "Delivery address"} *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <textarea value={address} onChange={e => { setAddress(e.target.value); if (errors.address) setErrors(p => ({ ...p, address: "" })); }}
                          placeholder={isFr ? "Rue, Ville, Pays" : "Street, City, Country"}
                          rows={3} autoComplete="street-address"
                          className={"pl-10 " + inputBase + " resize-none " + (errors.address ? inputErr : inputOk)} />
                      </div>
                      {errors.address && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="w-3 h-3" /> {errors.address}</p>}
                    </div>
                  </div>

                  <button onClick={performCheckout} disabled={loading}
                    className="w-full mt-6 flex items-center justify-center gap-2 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-base transition disabled:opacity-50">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                    {isFr ? "Envoyer via WhatsApp" : "Send via WhatsApp"}
                  </button>

                  {customer && (
                    <button onClick={() => setStage("auth")} className="w-full mt-3 py-2 text-xs text-gray-500 hover:text-gray-800 transition">
                      {isFr ? "Utiliser un autre compte" : "Use a different account"}
                    </button>
                  )}

                  <p className="text-[10px] text-center text-gray-400 mt-3">
                    {isFr
                      ? d("Vous serez redirig\u00e9 vers WhatsApp pour finaliser votre commande.")
                      : "You will be redirected to WhatsApp to finalize your order."}
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT: Order Summary */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-28">
                <h3 className="text-lg font-black text-gray-900 mb-4">{isFr ? "Votre commande" : "Your order"}</h3>

                {/* Items compact */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2">
                  {items.map(item => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3">
                      <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-gray-500">{item.size} - {item.color}</p>
                      </div>
                      <span className="text-xs font-bold text-gray-900 whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  {appliedCoupon ? (
                    <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-xs font-bold text-green-800">{appliedCoupon.code}</span>
                      </div>
                      <button onClick={() => setAppliedCoupon(null)} className="text-green-700 hover:text-green-900 text-xs font-bold">
                        {isFr ? "Retirer" : "Remove"}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                        <Ticket className="w-3 h-3" />
                        {isFr ? "Code promo" : "Coupon code"}
                      </label>
                      <div className="flex gap-2">
                        <input type="text" value={couponCode}
                          onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } }}
                          placeholder="WELCOME15"
                          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
                        <button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}
                          className="px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-[10px] font-bold transition disabled:opacity-40 flex items-center min-w-[60px] justify-center">
                          {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : (isFr ? "OK" : "Apply")}
                        </button>
                      </div>
                      {couponError && (
                        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-red-500">
                          <AlertCircle className="w-3 h-3" /> {couponError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>{isFr ? "Sous-total" : "Subtotal"}</span>
                    <span className="font-semibold text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>
                  {bundleDiscount > 0 && appliedBundle && (
                    <div className="flex justify-between text-green-700">
                      <span>Bundle ({appliedBundle.name})</span>
                      <span className="font-semibold">-{formatPrice(bundleDiscount)}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && appliedCoupon && (
                    <div className="flex justify-between text-green-700">
                      <span className="inline-flex items-center gap-1"><Ticket className="w-3 h-3" /> {appliedCoupon.code}</span>
                      <span className="font-semibold">-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 items-start">
                    <span>{isFr ? "Livraison" : "Shipping"}</span>
                    {shippingInfo.hasLocalRate ? (
                      <span className="font-semibold text-gray-900 text-right">{shippingInfo.label}</span>
                    ) : (
                      <span className="text-xs italic text-right text-gray-500 max-w-[180px]">
                        {isFr ? d("Calcul\u00e9 apr\u00e8s la commande") : "Calculated after checkout"}
                      </span>
                    )}
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
                    <span className="font-black text-base text-gray-900">{isFr ? "Total" : "Total"}</span>
                    <div className="text-right">
                      <span className="font-black text-lg text-gray-900">{formatPrice(grandTotal)}</span>
                      {!shippingInfo.hasLocalRate && (
                        <div className="text-[10px] text-gray-400 font-normal">+ {isFr ? "livraison" : "shipping"}</div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}