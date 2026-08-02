"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import Navbar from "@/components/Navbar";
import AccountSidebar from "@/components/AccountSidebar";
import AccountMobileBar from "@/components/AccountMobileBar";
import Footer from "@/components/Footer";
import { Shield, Loader2, Sparkles } from "lucide-react";

export default function Page() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const router = useRouter();
  const { customer, loading } = useCustomer();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !customer) router.push(`/${locale}/account/login`);
  }, [loading, customer, locale, router]);

  if (loading || !customer) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" /></div>;

  const title = isFr ? "S\u00e9curit\u00e9" : "Security";

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
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 lg:w-7 lg:h-7 text-[#CA3F2E]" />
                <h1 className="text-2xl lg:text-3xl font-black text-gray-900">{title}</h1>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-8 lg:p-12 text-center">
                <Sparkles className="w-12 h-12 text-[#CA3F2E] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">{isFr ? "Bient\u00f4t disponible" : "Coming Soon"}</h2>
                <p className="text-sm text-gray-500 max-w-md mx-auto">{isFr ? "Consultez vos sessions actives et g\u00e9rez votre compte." : "View active sessions, login history, and delete your account."}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}