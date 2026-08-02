"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import Navbar from "@/components/Navbar";
import AccountSidebar from "@/components/AccountSidebar";
import Footer from "@/components/Footer";
import { Settings, Loader2, Sparkles } from "lucide-react";

export default function Page() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const router = useRouter();
  const { customer, loading } = useCustomer();

  useEffect(() => {
    if (!loading && !customer) router.push(`/${locale}/account/login`);
  }, [loading, customer, locale, router]);

  if (loading || !customer) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" /></div>;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
            <div className="hidden lg:block"><AccountSidebar /></div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-7 h-7 text-[#CA3F2E]" />
                <h1 className="text-3xl font-black text-gray-900">{isFr ? "Pr\u00e9f\u00e9rences" : "Preferences"}</h1>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <Sparkles className="w-12 h-12 text-[#CA3F2E] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">{isFr ? "Bient\u00f4t disponible" : "Coming Soon"}</h2>
                <p className="text-sm text-gray-500 max-w-md mx-auto">{isFr ? "G\u00e9rez vos pr\u00e9f\u00e9rences de langue, devise et notifications." : "Manage language, currency, and notification preferences."}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
