"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import Navbar from "@/components/Navbar";
import AccountSidebar from "@/components/AccountSidebar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { User, Save, ArrowLeft, Loader2, CheckCircle, Lock } from "lucide-react";

export default function ProfilePage() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const router = useRouter();
  const { customer, loading: authLoading, refresh } = useCustomer();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !customer) router.push(`/${locale}/account/login`);
    if (customer) { setName(customer.name); setPhone(customer.phone || ""); }
  }, [authLoading, customer, locale, router]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body: Record<string, string> = { name, phone };
      if (newPassword) { body.currentPassword = currentPassword; body.newPassword = newPassword; }
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); }
      else { setSaved(true); setTimeout(() => setSaved(false), 3000); await refresh(); setCurrentPassword(""); setNewPassword(""); }
    } catch { setError("Network error"); }
    setSaving(false);
  };

  if (authLoading || !customer) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" /></div>;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-20 lg:pt-24">
        <div className="max-w-2xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <h1 className="text-3xl font-black text-gray-900 mb-6">{isFr ? "Mon profil" : "My Profile"}</h1>

          <form onSubmit={saveProfile} className="space-y-6">
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
                <p className="text-[10px] text-gray-400 mt-1">{isFr ? "L'email ne peut pas \u00eatre modifi\u00e9" : "Email cannot be changed"}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                  {isFr ? "T\u00e9l\u00e9phone" : "Phone"} <span className="text-gray-400 font-normal normal-case">({isFr ? "optionnel" : "optional"})</span>
                </label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
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
      </main>
      <Footer />
    </>
  );
}