"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import Navbar from "@/components/Navbar";
import AccountSidebar from "@/components/AccountSidebar";
import AccountMobileBar from "@/components/AccountMobileBar";
import Footer from "@/components/Footer";
import { User, Save, Loader2, CheckCircle, Lock, MapPin } from "lucide-react";

export default function ProfilePage() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const router = useRouter();
  const { customer, loading: authLoading, refresh } = useCustomer();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !customer) router.push(`/${locale}/account/login`);
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone || "");
      fetch("/api/customer/address")
        .then(r => r.json())
        .then(data => {
          if (data.address) {
            setStreet(data.address.street || "");
            setCity(data.address.city || "");
            setAddrState(data.address.state || "");
            setCountry(data.address.country || "");
            setPostalCode(data.address.postalCode || "");
          }
        })
        .catch(() => {});
    }
  }, [authLoading, customer, locale, router]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body: Record<string, string> = { name, phone, street, city, state: addrState, country, postalCode };
      if (newPassword) { body.currentPassword = currentPassword; body.newPassword = newPassword; }
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error saving"); }
      else { setSaved(true); setTimeout(() => setSaved(false), 3000); await refresh(); setCurrentPassword(""); setNewPassword(""); }
    } catch { setError("Network error"); }
    setSaving(false);
  };

  if (authLoading || !customer) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" /></div>;

  return (
    <>
      <Navbar />
      <AccountSidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4 lg:pt-8 lg:pb-8">
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
            <div className="hidden lg:block"><AccountSidebar /></div>
            <div>
              <AccountMobileBar title={isFr ? "Profil" : "Profile"} onOpen={() => setMenuOpen(true)} />
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-6">{isFr ? "Mon profil" : "My Profile"}</h1>
              <form onSubmit={saveProfile} className="space-y-6 max-w-2xl">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-[#CA3F2E]" />
                    <h2 className="font-bold text-gray-900">{isFr ? "Informations personnelles" : "Personal Information"}</h2>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">{isFr ? "Nom complet" : "Full name"}</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">Email</label>
                    <input type="email" value={customer.email} disabled
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                      {isFr ? "T\u00e9l\u00e9phone" : "Phone"}
                    </label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-5 h-5 text-[#CA3F2E]" />
                    <h2 className="font-bold text-gray-900">{isFr ? "Adresse de livraison" : "Shipping Address"}</h2>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">{isFr ? "Rue" : "Street"}</label>
                    <input type="text" value={street} onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">{isFr ? "Ville" : "City"}</label>
                      <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">{isFr ? "\u00c9tat" : "State"}</label>
                      <input type="text" value={addrState} onChange={(e) => setAddrState(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">{isFr ? "Pays" : "Country"}</label>
                      <input type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">{isFr ? "Code postal" : "Postal code"}</label>
                      <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Lock className="w-5 h-5 text-[#CA3F2E]" />
                    <h2 className="font-bold text-gray-900">{isFr ? "Changer le mot de passe" : "Change Password"}</h2>
                  </div>
                  <p className="text-xs text-gray-500">{isFr ? "Laissez vide pour garder le mot de passe actuel" : "Leave blank to keep current password"}</p>
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">{isFr ? "Mot de passe actuel" : "Current password"}</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">{isFr ? "Nouveau mot de passe" : "New password"}</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
                  </div>
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
                {saved && <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {isFr ? "Profil mis \u00e0 jour" : "Profile updated"}</p>}

                <button type="submit" disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-[#CA3F2E] text-white rounded-xl text-sm font-bold transition disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isFr ? "Enregistrer" : "Save changes"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}