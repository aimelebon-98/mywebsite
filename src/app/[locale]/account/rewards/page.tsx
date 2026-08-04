"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import Navbar from "@/components/Navbar";
import AccountSidebar from "@/components/AccountSidebar";
import AccountMobileBar from "@/components/AccountMobileBar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Gift, Loader2, Ticket, Copy, CheckCircle, Calendar, ShoppingBag,
  Sparkles, RefreshCw, ArrowRight
} from "lucide-react";

function d(s: string): string {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

interface CustCoupon {
  id: string;
  couponId: string;
  usedAt: string | null;
  createdAt: string;
  code: string | null;
  type: string | null;
  value: string | null;
  minOrder: string | null;
  expiresAt: string | null;
  description: string | null;
  descriptionFr: string | null;
  active: boolean | null;
}

export default function Page() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const router = useRouter();
  const { customer, loading } = useCustomer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [coupons, setCoupons] = useState<CustCoupon[]>([]);
  const [fetching, setFetching] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !customer) router.push(`/${locale}/account/login`);
  }, [loading, customer, locale, router]);

  const fetchCoupons = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/customer/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch { /* ignore */ }
    setFetching(false);
  }, []);

  useEffect(() => {
    if (customer) fetchCoupons();
  }, [customer, fetchCoupons]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading || !customer) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" />
    </div>
  );

  const title = isFr ? d("R\u00e9compenses") : "Rewards";

  // Split into available (usable) and used/expired
  const now = new Date();
  const available = coupons.filter(c =>
    !c.usedAt &&
    c.active !== false &&
    c.code &&
    (!c.expiresAt || new Date(c.expiresAt) > now)
  );
  const usedOrExpired = coupons.filter(c =>
    c.usedAt || c.active === false ||
    (c.expiresAt && new Date(c.expiresAt) <= now)
  );

  return (
    <>
      <Navbar />
      <AccountSidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="min-h-screen bg-gray-50 pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
            <div className="hidden lg:block"><AccountSidebar /></div>
            <div>
              <AccountMobileBar title={title} onOpen={() => setMenuOpen(true)} />

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Gift className="w-6 h-6 lg:w-7 lg:h-7 text-[#CA3F2E]" />
                  <h1 className="text-2xl lg:text-3xl font-black text-gray-900">{title}</h1>
                </div>
                <button onClick={fetchCoupons} className="p-2 rounded-xl hover:bg-gray-100 transition">
                  <RefreshCw className={"w-4 h-4 text-gray-500" + (fetching ? " animate-spin" : "")} />
                </button>
              </div>

              {fetching ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" />
                </div>
              ) : coupons.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">
                    {isFr ? "Pas encore de coupons" : "No coupons yet"}
                  </h2>
                  <p className="text-sm text-gray-500 max-w-md mx-auto mb-5">
                    {isFr
                      ? d("Vos coupons de r\u00e9duction appara\u00eetront ici. Restez \u00e0 l\u0027aff\u00fbt des offres sp\u00e9ciales !")
                      : "Your discount coupons will appear here. Watch out for special offers!"}
                  </p>
                  <Link
                    href={`/${locale}/shop`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#CA3F2E] text-white rounded-xl text-sm font-bold hover:bg-[#8B2A1E] transition"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {isFr ? "Explorer la boutique" : "Explore the shop"}
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-green-100 flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-black text-gray-900">{available.length}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{isFr ? "Disponibles" : "Available"}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gray-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-gray-500" />
                      </div>
                      <p className="text-2xl font-black text-gray-900">{coupons.filter(c => c.usedAt).length}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{isFr ? d("Utilis\u00e9s") : "Used"}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-red-100 flex items-center justify-center">
                        <Gift className="w-5 h-5 text-[#CA3F2E]" />
                      </div>
                      <p className="text-2xl font-black text-gray-900">{coupons.length}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Total</p>
                    </div>
                  </div>

                  {/* Available coupons */}
                  {available.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                          {isFr ? "Coupons disponibles" : "Available Coupons"}
                        </h2>
                        <span className="text-xs text-gray-500">({available.length})</span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {available.map(c => {
                          const value = parseFloat(c.value || "0");
                          const valueLabel = c.type === "percent" ? value + "%" : "$" + value.toFixed(2);
                          const minOrder = parseFloat(c.minOrder || "0");
                          const desc = isFr && c.descriptionFr ? c.descriptionFr : (c.description || "");

                          return (
                            <div key={c.id} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] p-5 text-white shadow-lg group hover:shadow-xl transition">
                              {/* Decorative circles */}
                              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
                              <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

                              <div className="relative">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur px-2 py-1 rounded-full">
                                    <Sparkles className="w-3 h-3" />
                                    {isFr ? "Actif" : "Active"}
                                  </div>
                                  {c.expiresAt && (
                                    <div className="inline-flex items-center gap-1 text-[10px] text-white/80">
                                      <Calendar className="w-3 h-3" />
                                      {isFr ? d("Expire le") : "Expires"} {new Date(c.expiresAt).toLocaleDateString(isFr ? "fr-FR" : "en-US", { month: "short", day: "numeric" })}
                                    </div>
                                  )}
                                </div>

                                <div className="text-4xl font-black leading-tight mb-1">
                                  {valueLabel}
                                </div>
                                <div className="text-xs text-white/90 mb-4">
                                  {c.type === "percent"
                                    ? (isFr ? d("de r\u00e9duction") : "off")
                                    : (isFr ? "de remise" : "off")}
                                  {minOrder > 0 && (
                                    <> {isFr ? "sur" : "on"} ${minOrder.toFixed(0)}+</>
                                  )}
                                </div>

                                {desc && (
                                  <p className="text-xs text-white/85 mb-4 leading-relaxed">
                                    {desc}
                                  </p>
                                )}

                                {/* Code section - dashed border to look like a ticket */}
                                <div className="bg-white rounded-xl p-3 relative">
                                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                                    {isFr ? "Code" : "Code"}
                                  </div>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono text-lg font-black text-[#CA3F2E] tracking-wider">
                                      {c.code}
                                    </span>
                                    <button
                                      onClick={() => c.code && copyCode(c.code)}
                                      className={"flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition " +
                                        (copiedCode === c.code
                                          ? "bg-green-500 text-white"
                                          : "bg-gray-100 text-gray-700 hover:bg-gray-200")}
                                    >
                                      {copiedCode === c.code
                                        ? <><CheckCircle className="w-3 h-3" /> {isFr ? "Copie" : "Copied"}</>
                                        : <><Copy className="w-3 h-3" /> {isFr ? "Copier" : "Copy"}</>
                                      }
                                    </button>
                                  </div>
                                </div>

                                <Link
                                  href={`/${locale}/shop`}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-white mt-3 hover:gap-2 transition-all"
                                >
                                  {isFr ? d("Utiliser maintenant") : "Use now"}
                                  <ArrowRight className="w-3 h-3" />
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Used/expired coupons */}
                  {usedOrExpired.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-sm font-black text-gray-500 uppercase tracking-wide">
                          {isFr ? "Historique" : "History"}
                        </h2>
                        <span className="text-xs text-gray-400">({usedOrExpired.length})</span>
                      </div>

                      <div className="space-y-2">
                        {usedOrExpired.map(c => {
                          const value = parseFloat(c.value || "0");
                          const valueLabel = c.type === "percent" ? value + "%" : "$" + value.toFixed(2);
                          const isUsed = !!c.usedAt;
                          const isExpired = c.expiresAt && new Date(c.expiresAt) <= now;

                          return (
                            <div key={c.id} className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl opacity-60">
                              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Ticket className="w-5 h-5 text-gray-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-sm font-bold text-gray-500 line-through">{c.code}</span>
                                  <span className="text-sm font-bold text-gray-400">{valueLabel}</span>
                                  <span className={"text-[10px] font-bold px-2 py-0.5 rounded uppercase " +
                                    (isUsed ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700")}>
                                    {isUsed
                                      ? (isFr ? d("Utilis\u00e9") : "Used")
                                      : isExpired
                                        ? (isFr ? "Expire" : "Expired")
                                        : (isFr ? "Inactif" : "Inactive")}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {isUsed && c.usedAt
                                    ? (isFr ? d("Utilis\u00e9 le ") : "Used on ") + new Date(c.usedAt).toLocaleDateString(isFr ? "fr-FR" : "en-US")
                                    : (isFr ? d("Re\u00e7u le ") : "Received on ") + new Date(c.createdAt).toLocaleDateString(isFr ? "fr-FR" : "en-US")
                                  }
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Info box */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                    <p className="font-semibold mb-1">{isFr ? "Comment utiliser vos coupons ?" : "How to use your coupons"}</p>
                    <ul className="text-xs space-y-1 list-disc list-inside">
                      <li>{isFr ? d("Copiez le code du coupon disponible") : "Copy the code from an available coupon"}</li>
                      <li>{isFr ? d("Ajoutez des produits au panier") : "Add products to your cart"}</li>
                      <li>{isFr ? d("Collez le code au moment du paiement") : "Paste the code at checkout"}</li>
                      <li>{isFr ? d("Chaque coupon ne peut \u00eatre utilis\u00e9 qu\u0027une seule fois") : "Each coupon can only be used once"}</li>
                    </ul>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
