"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import { useCurrency } from "@/lib/currency-context";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import Navbar from "@/components/Navbar";
import AccountSidebar from "@/components/AccountSidebar";
import AccountMobileBar from "@/components/AccountMobileBar";
import Footer from "@/components/Footer";
import { Settings, Loader2, Globe, DollarSign, CheckCircle } from "lucide-react";
import Link from "next/link";

function d(s: string): string {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export default function Page() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const router = useRouter();
  const { customer, loading } = useCustomer();
  const { currency, setCurrency } = useCurrency();
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !customer) router.push(`/${locale}/account/login`);
  }, [loading, customer, locale, router]);

  if (loading || !customer) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" />
    </div>
  );

  const title = isFr ? d("Pr\u00e9f\u00e9rences") : "Preferences";

  const handleCurrencyChange = (c: CurrencyCode) => {
    setCurrency(c);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const otherLocale = isFr ? "en" : "fr";

  return (
    <>
      <Navbar />
      <AccountSidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4 lg:pt-8 lg:pb-8">
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
            <div className="hidden lg:block"><AccountSidebar /></div>
            <div>
              <AccountMobileBar title={title} onOpen={() => setMenuOpen(true)} />
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 lg:w-7 lg:h-7 text-[#CA3F2E]" />
                <h1 className="text-2xl lg:text-3xl font-black text-gray-900">{title}</h1>
              </div>

              <div className="space-y-4">

                {/* Language */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">{isFr ? "Langue" : "Language"}</h2>
                      <p className="text-xs text-gray-500">
                        {isFr ? d("Choisissez votre langue d\u0027affichage") : "Choose your display language"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`flex items-center gap-3 p-4 rounded-xl border-2 transition cursor-default ${locale === "en" ? "border-[#CA3F2E] bg-red-50" : "border-gray-200 bg-gray-50"}`}>
                      <span className="text-2xl">&#127482;&#127480;</span>
                      <div>
                        <p className="font-bold text-sm text-gray-900">English</p>
                        <p className="text-xs text-gray-500">{locale === "en" ? "Current" : "Switch"}</p>
                      </div>
                      {locale === "en" && <CheckCircle className="w-4 h-4 text-[#CA3F2E] ml-auto" />}
                    </div>
                    <Link
                      href={`/${otherLocale}/account/preferences`}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition ${locale === "fr" ? "border-[#CA3F2E] bg-red-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}
                    >
                      <span className="text-2xl">&#127467;&#127479;</span>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{"Fran\u00e7ais"}</p>
                        <p className="text-xs text-gray-500">{locale === "fr" ? "Actuel" : "Switch"}</p>
                      </div>
                      {locale === "fr" && <CheckCircle className="w-4 h-4 text-[#CA3F2E] ml-auto" />}
                    </Link>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    {isFr
                      ? d("Cliquez sur une langue pour changer l\u0027interface.")
                      : "Click a language to switch the interface."}
                  </p>
                </div>

                {/* Currency */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">{isFr ? "Devise" : "Currency"}</h2>
                      <p className="text-xs text-gray-500">
                        {isFr ? "Choisissez votre devise" : "Choose your display currency"}
                      </p>
                    </div>
                    {saved && (
                      <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        {isFr ? d("Enregistr\u00e9") : "Saved"}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
                      const info = CURRENCIES[code];
                      const isActive = currency === code;
                      return (
                        <button
                          key={code}
                          onClick={() => handleCurrencyChange(code)}
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm font-semibold transition ${
                            isActive
                              ? "border-[#CA3F2E] bg-red-50 text-[#CA3F2E]"
                              : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-lg">{info.flag}</span>
                          <span className="text-xs font-bold">{code}</span>
                          <span className="text-[10px] text-gray-500 font-normal text-center leading-tight">
                            {isFr ? info.nameFr : info.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    {isFr
                      ? d("Les prix sont convert\u00e9s en temps r\u00e9el selon les taux de change.")
                      : "Prices are converted in real time using live exchange rates."}
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
