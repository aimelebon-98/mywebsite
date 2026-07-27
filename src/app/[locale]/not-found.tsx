"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Home, ShoppingBag, BookOpen, MessageCircle, Search, ArrowRight, Compass } from "lucide-react";
import { trackEvent } from "@/components/AnalyticsTracker";

export default function NotFound() {
  const [locale, setLocale] = useState("en");
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  // Detect locale from URL
  useEffect(() => {
    setMounted(true);
    const path = window.location.pathname;
    if (path.startsWith("/fr")) setLocale("fr");
    // Track 404
    try {
      trackEvent({
        eventType: "page_view",
        path: path,
        metadata: { statusCode: 404 },
      });
    } catch { /* ignore */ }
  }, []);

  const isFr = locale === "fr";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    window.location.href = `/${locale}/shop?search=${encodeURIComponent(search.trim())}`;
  };

  const quickLinks = [
    {
      icon: Home,
      title: isFr ? "Accueil" : "Home",
      desc: isFr ? "Retour a la page d'accueil" : "Back to homepage",
      href: `/${locale}`,
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: ShoppingBag,
      title: isFr ? "Boutique" : "Shop",
      desc: isFr ? "Parcourir tous les produits" : "Browse all products",
      href: `/${locale}/shop`,
      color: "from-[#CA3F2E] to-[#8B2A1E]",
    },
    {
      icon: BookOpen,
      title: "Blog",
      desc: isFr ? "Nos derniers articles" : "Our latest articles",
      href: `/${locale}/blog`,
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: MessageCircle,
      title: "Contact",
      desc: isFr ? "Besoin d'aide ?" : "Need help?",
      href: `/${locale}/contact`,
      color: "from-emerald-500 to-emerald-600",
    },
  ];

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex flex-col">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#CA3F2E]/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-4xl w-full text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full text-xs font-bold text-red-700 mb-8 fade-in">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {isFr ? "Page introuvable" : "Page Not Found"}
          </div>

          {/* Giant 404 */}
          <div className="relative mb-6 fade-in-up">
            <h1 className="text-[120px] sm:text-[180px] lg:text-[220px] font-black leading-none tracking-tighter select-none">
              <span className="glitch-text bg-gradient-to-br from-[#CA3F2E] via-[#8B2A1E] to-gray-900 bg-clip-text text-transparent" data-text="404">
                404
              </span>
            </h1>
            {/* Compass icon rotating */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-28 sm:h-28 opacity-10 pointer-events-none">
              <Compass className="w-full h-full text-gray-900 animate-spin-slow" />
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight fade-in-up delay-1">
            {isFr ? "Oups ! Vous vous etes egare" : "Oops! You got lost"}
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed fade-in-up delay-2">
            {isFr
              ? "La page que vous cherchez n'existe pas ou a ete deplacee. Essayons de vous remettre sur les rails."
              : "The page you're looking for doesn't exist or has been moved. Let's get you back on track."}
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-12 fade-in-up delay-3">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#CA3F2E] via-purple-500 to-blue-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isFr ? "Rechercher un produit..." : "Search for a product..."}
                  className="w-full pl-11 pr-32 py-4 bg-white border-2 border-gray-200 rounded-2xl text-sm text-gray-900 shadow-sm focus:outline-none focus:border-[#CA3F2E] transition placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-4 py-2 bg-gray-900 hover:bg-[#CA3F2E] text-white rounded-xl text-xs font-bold transition"
                >
                  {isFr ? "Chercher" : "Search"}
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </form>

          {/* Quick links grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto fade-in-up delay-4">
            {quickLinks.map((link, i) => {
              const Icon = link.icon;
              return (
                <Link
                  key={i}
                  href={link.href}
                  className="group relative bg-white border-2 border-gray-200 hover:border-transparent rounded-2xl p-5 transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                >
                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className="relative">
                    <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${link.color} mb-3 group-hover:bg-white/20 group-hover:backdrop-blur transition-all`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="font-black text-sm text-gray-900 group-hover:text-white transition mb-0.5">
                      {link.title}
                    </div>
                    <div className="text-[11px] text-gray-500 group-hover:text-white/90 transition leading-relaxed">
                      {link.desc}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 group-hover:text-white transition">
                      {isFr ? "Aller" : "Go"}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Footer note */}
          <p className="text-xs text-gray-400 mt-12 fade-in-up delay-5">
            {isFr
              ? "Erreur 404 - La page demandee n'a pas ete trouvee"
              : "Error 404 - The requested page could not be found"}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glitch {
          0%, 100% { text-shadow: 0 0 0 transparent; }
          10% { text-shadow: -3px 0 #CA3F2E, 3px 0 #3b82f6; }
          20% { text-shadow: 3px 0 #CA3F2E, -3px 0 #3b82f6; }
          30% { text-shadow: 0 0 0 transparent; }
        }
        .fade-in { animation: fade-in 0.6s ease-out forwards; }
        .fade-in-up { opacity: 0; animation: fade-in-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .glitch-text { animation: glitch 5s infinite; }
      `}</style>
    </main>
  );
}