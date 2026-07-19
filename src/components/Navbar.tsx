"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";

export default function Navbar() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setMobileSearchQuery("");
      setMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      {/* Promo bar */}
      <div className="bg-gray-900 text-white text-center py-2 text-xs font-medium tracking-wide">
        🔥 FREE SHIPPING on orders over $100 — <Link href="/shop" className="underline underline-offset-2">Shop Now</Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">SV</span>
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:block">SoleVault</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-5">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Home</Link>
            <Link href="/shop" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Shop All</Link>
            <Link href="/shop?category=sneakers" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Sneakers</Link>
            <Link href="/shop?category=running" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Running</Link>
            <Link href="/shop?category=formal" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Formal</Link>
            <Link href="/shop?category=boots" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Boots</Link>
            <Link href="/shop?category=casual" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Casual</Link>
          </div>

          {/* Desktop Search + Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
              <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shoes..."
                className="w-48 lg:w-56 pl-9 pr-3 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition placeholder-gray-400"
              />
            </form>

            <Link href="/cart" className="relative p-2 rounded-xl hover:bg-gray-100 transition">
              <ShoppingBag className="w-5 h-5 text-gray-600" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 animate-slide-in shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {/* Mobile Search */}
            <form onSubmit={handleMobileSearch} className="relative mb-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                placeholder="Search shoes..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
              />
            </form>
            {[
              { href: "/", label: "Home" },
              { href: "/shop", label: "Shop All" },
              { href: "/shop?category=sneakers", label: "Sneakers" },
              { href: "/shop?category=running", label: "Running" },
              { href: "/shop?category=formal", label: "Formal" },
              { href: "/shop?category=boots", label: "Boots" },
              { href: "/shop?category=sandals", label: "Sandals" },
              { href: "/shop?category=casual", label: "Casual" },
              { href: "/cart", label: "Cart" },
            ].map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
