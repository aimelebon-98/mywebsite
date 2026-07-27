"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Home, ArrowRight, Search, ShoppingBag, ArrowLeft } from "lucide-react";

interface Category {
  id: string;
  slug: string;
  nameEn: string;
  nameFr?: string;
  imageUrl?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: string;
}

interface Suggestion {
  id: string | number;
  name: string;
  slug?: string;
}

export default function NotFound() {
  const [locale, setLocale] = useState("en");
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
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
    fetch("/api/products?featured=true&limit=4")
      .then(r => r.ok ? r.json() : [])
      .then(data => setProducts(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => {});
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!search || search.trim().length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search-suggestions?q=${encodeURIComponent(search.trim())}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShowDropdown(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  // Click outside to close dropdown
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
      {/* Header */}
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

      {/* HERO + CATEGORIES SIDE-BY-SIDE */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-[1fr_500px] gap-8 lg:gap-12 items-center">
          {/* LEFT: 404 hero */}
          <div className="text-center lg:text-left">
            <div className="mb-4">
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

            {/* Search with autocomplete */}
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

              {/* Suggestions dropdown */}
              {showDropdown && (suggestions.length > 0 || loading) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
                  {loading && suggestions.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400">
                      {isFr ? "Recherche..." : "Searching..."}
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400">
                      {isFr ? "Aucun resultat" : "No results"}
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
                            <span className="truncate">{s.name}</span>
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

          {/* RIGHT: Categories grid 2x3 */}
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

              <div className="grid grid-cols-2 gap-3">
                {categories.slice(0, 6).map(cat => (
                  <Link
                    key={cat.id}
                    href={`/${locale}/shop?category=${cat.slug}`}
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 hover:border-gray-900 hover:shadow-lg transition-all"
                  >
                    {cat.imageUrl ? (
                      <Image
                        src={cat.imageUrl}
                        alt={getCategoryName(cat)}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 1024px) 50vw, 250px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="text-white font-black text-sm sm:text-base capitalize truncate">
                        {getCategoryName(cat)}
                      </div>
                      <div className="flex items-center gap-1 text-white/80 text-[10px] font-bold uppercase tracking-wider mt-0.5 group-hover:text-white transition">
                        {isFr ? "Voir" : "Shop"}
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  </Link>
                ))}
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

      {/* FEATURED PRODUCTS */}
      {products.length > 0 && (
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 border-t border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-block text-xs font-bold text-[#CA3F2E] uppercase tracking-widest mb-2">
              {isFr ? "Populaires" : "Popular"}
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
              {isFr ? "Peut-etre pour vous" : "You might like these"}
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map(p => (
              <Link
                key={p.id}
                href={`/${locale}/product/${p.slug}`}
                className="group bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
              >
                <div className="relative aspect-square bg-gray-100">
                  {p.imageUrl && (
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-sm text-gray-900 truncate group-hover:text-[#CA3F2E] transition">
                    {p.name}
                  </h4>
                  <div className="text-sm font-black text-gray-900 mt-1">
                    ${parseFloat(p.price).toFixed(2)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-gray-100 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4">
          &copy; {new Date().getFullYear()} SoleVault. {isFr ? "Tous droits reserves." : "All rights reserved."}
        </div>
      </footer>
    </main>
  );
}