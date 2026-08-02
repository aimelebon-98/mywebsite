"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User, Package, Heart, MapPin, LogOut, Loader2, ShoppingBag } from "lucide-react";

export default function DashboardPage() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const router = useRouter();
  const { customer, loading, logout } = useCustomer();

  useEffect(() => {
    if (!loading && !customer) {
      router.push(`/${locale}/account/login`);
    }
  }, [loading, customer, locale, router]);

  if (loading || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" />
      </div>
    );
  }

  const cards = [
    { icon: Package, label: isFr ? "Mes commandes" : "My orders", desc: isFr ? "Suivi et historique" : "Track and history", href: `/${locale}/account/orders`, color: "bg-blue-500" },
    { icon: Heart, label: isFr ? "Liste de souhaits" : "Wishlist", desc: isFr ? "Vos produits favoris" : "Your favorite items", href: `/${locale}/wishlist`, color: "bg-pink-500" },
    { icon: MapPin, label: isFr ? "Adresses" : "Addresses", desc: isFr ? "Livraison sauvegardees" : "Saved shipping addresses", href: `/${locale}/account/addresses`, color: "bg-emerald-500" },
    { icon: User, label: isFr ? "Profil" : "Profile", desc: isFr ? "Informations personnelles" : "Personal information", href: `/${locale}/account/profile`, color: "bg-purple-500" },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900">
              {isFr ? `Bonjour, ${customer.name.split(" ")[0]}` : `Hi, ${customer.name.split(" ")[0]}`}
            </h1>
            <p className="text-gray-500 mt-1">{isFr ? "Bienvenue dans votre compte" : "Welcome to your account"}</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map(c => (
              <Link key={c.href} href={c.href}
                className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:shadow-md transition-all">
                <div className={`w-11 h-11 ${c.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition`}>
                  <c.icon className="w-5 h-5 text-white" />
                </div>
                <div className="font-bold text-gray-900 text-sm">{c.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{c.desc}</div>
              </Link>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="font-bold text-gray-900 mb-4">{isFr ? "Vos informations" : "Your info"}</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">{isFr ? "Nom" : "Name"}</span><span className="font-semibold">{customer.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-semibold">{customer.email}</span></div>
                {customer.phone && <div className="flex justify-between"><span className="text-gray-500">{isFr ? "Telephone" : "Phone"}</span><span className="font-semibold">{customer.phone}</span></div>}
              </div>
              <Link href={`/${locale}/account/profile`} className="inline-block mt-4 text-xs font-bold text-[#CA3F2E] hover:underline">
                {isFr ? "Modifier" : "Edit"}
              </Link>
            </div>

            <div className="bg-gradient-to-br from-gray-950 to-[#8B2A1E] rounded-2xl p-6 text-white">
              <ShoppingBag className="w-8 h-8 mb-3 opacity-70" />
              <h2 className="font-bold text-lg">{isFr ? "Continuez a decouvrir" : "Keep exploring"}</h2>
              <p className="text-sm text-gray-300 mt-1 mb-4">{isFr ? "Nos derniers produits vous attendent" : "Our latest products are waiting"}</p>
              <Link href={`/${locale}/shop`} className="inline-block px-5 py-2 bg-white text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-100 transition">
                {isFr ? "Voir la boutique" : "Shop now"}
              </Link>
            </div>
          </div>

          <button onClick={logout}
            className="mt-8 inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-semibold">
            <LogOut className="w-4 h-4" /> {isFr ? "Se deconnecter" : "Log out"}
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}