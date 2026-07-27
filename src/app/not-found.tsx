"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Home, ArrowRight, Search, ArrowLeft, Package } from "lucide-react";

interface Category {
  id: string;
  slug: string;
  nameEn: string;
  nameFr?: string;
}

interface Suggestion {
  id: string | number;
  name: string;
  slug?: string;
}

// Same Unsplash images as CategoryShowcase for consistency
const fallbackImages: Record<string, string> = {
  sneakers: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&q=80",
  running:  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80",
  formal:   "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&q=80",
  boots:    "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400&q=80",
  sandals:  "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80",
  casual:   "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80",
};

export default function NotFound() {
  const [locale, setLocale] = useState("en");
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/fr")) {
      setLocale("fr");
    }
    fetch("/api/categories")
      .then(r => r.ok ? r.json() : [])
      .then(data => setCategories(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!search || search.trim().length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setShowDropdown(true);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search-suggestions?q=${encodeURIComponent(search.trim())}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isFr = locale === "fr";
  const getCategoryName = (c: Category) => isFr && c.nameFr ? c.nameFr : c.nameEn;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    window.location.href = `/${locale}/shop?search=${encodeURIComponent(search.trim())}`;
  };

  const handleSelectSuggestion = (s: Suggestion) => {
    if (s.slug) {
      window.location.href = `/${locale}/product/${s.slug}`;
    } else {
      window.location.href = `/${locale}/shop?search=${encodeURIComponent(s.name)}`;
    }
  };

  if (!mounted) {
    return (
      <html lang="en">
        <body>
          <main style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#fff",fontFamily:"system-ui"}}>
            <div style={{textAlign:"center"}}>
              <h1 style={{fontSize:"96px",fontWeight:900,color:"#111"}}>404</h1>
              <p style={{color:"#666",marginBottom:"24px"}}>Page not found</p>
              <a href="/en" style={{display:"inline-block",padding:"12px 24px",background:"#111",color:"#fff",borderRadius:"12px",textDecoration:"none",fontWeight:700}}>Go Home</a>
            </div>
          </main>
        </body>
      </html>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center text-white font-black text-sm">SV</div>
            <span className="font-black text-lg text-gray-900">SoleVault</span>
          </Link>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-[#CA3F2E] text-white rounded-xl text-sm font-bold transition"
          >
            <Home className="w-4 h-4" />
            {isFr ? "Accueil" : "Home"}
          </Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 lg:pt-6 pb-8 flex-1">
        <div className="grid lg:grid-cols-[1fr_600px] gap-8 lg:gap-12 items-start">
          {/* LEFT: hero */}
          <div className="text-center lg:text-left">
            <div className="mb-2 -mt-2 lg:-mt-4">
              <h1 className="text-8xl sm:text-9xl lg:text-[160px] font-black leading-none tracking-tighter bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] bg-clip-text text-transparent">
                404
              </h1>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">
              {isFr ? "Page introuvable" : "Page Not Found"}
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-xl mb-8 leading-relaxed lg:mx-0 mx-auto">
              {isFr
                ? "Cette page n'existe pas. Continuez votre exploration ci-dessous."
                : "This page doesn't exist. Continue exploring below."}
            </p>

            <div ref={wrapperRef} className="relative max-w-xl mb-4 lg:mx-0 mx-auto">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => search.length > 0 && setShowDropdown(true)}
                    placeholder={isFr ? "Rechercher un produit..." : "Search for a product..."}
                    className="w-full pl-11 pr-32 py-3.5 bg-white border-2 border-gray-200 rounded-2xl text-sm text-gray-900 shadow-sm focus:outline-none focus:border-[#CA3F2E] transition"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-4 py-2 bg-gray-900 hover:bg-[#CA3F2E] text-white rounded-xl text-xs font-bold transition"
                  >
                    {isFr ? "Chercher" : "Search"}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </form>

              {showDropdown && search.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto text-left">
                  {loading ? (
                    <div className="px-4 py-4 text-sm text-gray-500 flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-gray-300 border-t-[#CA3F2E] rounded-full animate-spin" />
                      {isFr ? "Recherche..." : "Searching..."}
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="px-4 py-4 text-sm text-gray-500">
                      {isFr ? `Aucun produit pour "${search}"` : `No products for "${search}"`}
                    </div>
                  ) : (
                    <ul>
                      {suggestions.map(s => (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectSuggestion(s)}
                            className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 text-gray-700 hover:bg-gray-50 transition"
                          >
                            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate font-medium">{s.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              {isFr ? "Retour a la page precedente" : "Go back to previous page"}
            </button>
          </div>

          {/* RIGHT: Categories - shop page style */}
          {categories.length > 0 && (
            <div>
              <div className="text-center lg:text-left mb-5">
                <div className="inline-block text-xs font-bold text-[#CA3F2E] uppercase tracking-widest mb-1">
                  {isFr ? "Explorer" : "Explore"}
                </div>
                <h3 className="text-lg font-black text-gray-900">
                  {isFr ? "Nos categories" : "Shop Categories"}
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {categories.slice(0, 6).map(cat => {
                  const bgImg = fallbackImages[cat.slug];
                  return (
                    <Link
                      key={cat.id}
                      href={`/${locale}/shop?category=${cat.slug}`}
                      className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-white/70 hover:border-white shadow-[0_4px_20px_-2px_rgba(0,0,0,0.15)] hover:shadow-2xl hover:scale-105 transition-all duration-300"
                      style={{
                        backgroundImage: bgImg ? `url(${bgImg})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundColor: "#f3f4f6",
                      }}
                    >
                      {/* Inner white glow ring */}
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/30 pointer-events-none" />

                      {/* Dark overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {!bgImg && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-400" />
                        </div>
                      )}

                      {/* Label */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white font-bold text-sm sm:text-base drop-shadow-lg capitalize">
                          {getCategoryName(cat)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="text-center lg:text-left mt-5">
                <Link
                  href={`/${locale}/shop`}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-900 hover:text-[#CA3F2E] group transition"
                >
                  {isFr ? "Voir toute la boutique" : "View full shop"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="mt-auto py-8 border-t border-gray-100 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4">
          &copy; {new Date().getFullYear()} SoleVault. {isFr ? "Tous droits reserves." : "All rights reserved."}
        </div>
      </footer>
    </main>
  );
}