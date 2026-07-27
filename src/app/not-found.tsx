"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Home, ArrowRight, Search, ShoppingBag } from "lucide-react";

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

export default function NotFound() {
  const [locale, setLocale] = useState("en");
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/fr")) {
      setLocale("fr");
    }
    // Fetch categories
    fetch("/api/categories")
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => {});
    // Fetch featured products
    fetch("/api/products?featured=true&limit=4")
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => {});
  }, []);

  const isFr = locale === "fr";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    window.location.href = `/${locale}/shop?search=${encodeURIComponent(search.trim())}`;
  };

  const getCategoryName = (c: Category) => isFr && c.nameFr ? c.nameFr : c.nameEn;

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-8xl font-black text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-6">Page not found</p>
          <a href="/en" className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl font-bold">Go Home</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20 lg:pt-24">
        {/* HERO */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
          {/* 404 number */}
          <div className="mb-6">
            <h1 className="text-8xl sm:text-9xl lg:text-[160px] font-black leading-none tracking-tighter bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] bg-clip-text text-transparent">
              404
            </h1>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">
            {isFr ? "Page introuvable" : "Page Not Found"}
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            {isFr
              ? "Cette page n'existe pas. Continuez votre exploration ci-dessous."
              : "This page doesn't exist. Continue exploring below."}
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isFr ? "Rechercher un produit..." : "Search for a product..."}
                className="w-full pl-11 pr-32 py-3.5 bg-white border-2 border-gray-200 rounded-2xl text-sm text-gray-900 shadow-sm focus:outline-none focus:border-[#CA3F2E] transition"
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

          {/* Home button */}
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 hover:border-gray-900 text-gray-900 rounded-xl text-sm font-bold transition group"
          >
            <Home className="w-4 h-4 group-hover:-translate-x-0.5 transition" />
            {isFr ? "Retour a l'accueil" : "Back to Home"}
          </Link>
        </section>

        {/* SHOP CATEGORIES */}
        {categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-block text-xs font-bold text-[#CA3F2E] uppercase tracking-widest mb-2">
                {isFr ? "Nos categories" : "Our Categories"}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
                {isFr ? "Parcourir la boutique" : "Browse the Shop"}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {categories.map(cat => (
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
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Label */}
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

            <div className="text-center mt-8">
              <Link
                href={`/${locale}/shop`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-[#CA3F2E] text-white rounded-xl text-sm font-bold transition group"
              >
                {isFr ? "Voir toute la boutique" : "View Full Shop"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </section>
        )}

        {/* FEATURED PRODUCTS */}
        {products.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-100 mb-12">
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
      </div>

      <Footer />
    </main>
  );
}