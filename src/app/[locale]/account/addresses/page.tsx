"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import Navbar from "@/components/Navbar";
import AccountSidebar from "@/components/AccountSidebar";
import AccountMobileBar from "@/components/AccountMobileBar";
import Footer from "@/components/Footer";
import { MapPin, Plus, Trash2, Star, Loader2, Save, X } from "lucide-react";

interface Address { id: string; label: string; fullName: string; phone: string; street: string; city: string; state: string; country: string; postalCode: string; isDefault: boolean; }

export default function AddressesPage() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const router = useRouter();
  const { customer, loading: authLoading } = useCustomer();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ label: "Home", fullName: "", phone: "", street: "", city: "", state: "", country: "Nigeria", postalCode: "", isDefault: false });

  useEffect(() => {
    if (!authLoading && !customer) router.push(`/${locale}/account/login`);
  }, [authLoading, customer, locale, router]);

  const load = async () => {
    const res = await fetch("/api/customer/addresses");
    if (res.ok) { const d = await res.json(); setAddresses(d.addresses || []); }
    setLoading(false);
  };

  useEffect(() => { if (customer) load(); }, [customer]);

  const save = async () => {
    if (!form.fullName || !form.phone || !form.street || !form.city) return;
    setSaving(true);
    await fetch("/api/customer/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    await load();
    setShowForm(false);
    setForm({ label: "Home", fullName: "", phone: "", street: "", city: "", state: "", country: "Nigeria", postalCode: "", isDefault: false });
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm(isFr ? "Supprimer cette adresse ?" : "Delete this address?")) return;
    await fetch("/api/customer/addresses/" + id, { method: "DELETE" });
    await load();
  };

  const setDefault = async (id: string) => {
    await fetch("/api/customer/addresses/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    await load();
  };

  if (authLoading || !customer) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" /></div>;

  return (
    <>
      <Navbar />
      <AccountSidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
            <div className="hidden lg:block"><AccountSidebar /></div>
            <div>
              <AccountMobileBar title={isFr ? "Mes adresses" : "My Addresses"} onOpen={() => setMenuOpen(true)} />
              <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                <h1 className="text-2xl lg:text-3xl font-black text-gray-900">{isFr ? "Mes adresses" : "My Addresses"}</h1>
                {!showForm && (
                  <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-[#CA3F2E] transition">
                    <Plus className="w-4 h-4" /> {isFr ? "Ajouter" : "Add new"}
                  </button>
                )}
              </div>

              {showForm && (
                <div className="bg-white border-2 border-[#CA3F2E]/20 rounded-2xl p-6 mb-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold">{isFr ? "Nouvelle adresse" : "New Address"}</h2>
                    <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-500" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder={isFr ? "Nom complet" : "Full name"} value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    <input placeholder={isFr ? "T\u00e9l\u00e9phone" : "Phone"} value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    <select value={form.label} onChange={(e) => setForm({...form, label: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                      <option value="Home">{isFr ? "Domicile" : "Home"}</option>
                      <option value="Work">{isFr ? "Travail" : "Work"}</option>
                      <option value="Other">{isFr ? "Autre" : "Other"}</option>
                    </select>
                    <input placeholder={isFr ? "Rue" : "Street"} value={form.street} onChange={(e) => setForm({...form, street: e.target.value})} className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    <input placeholder={isFr ? "Ville" : "City"} value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    <input placeholder={isFr ? "\u00c9tat / R\u00e9gion" : "State / Region"} value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    <input placeholder={isFr ? "Pays" : "Country"} value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    <input placeholder={isFr ? "Code postal" : "Postal code"} value={form.postalCode} onChange={(e) => setForm({...form, postalCode: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({...form, isDefault: e.target.checked})} className="w-4 h-4 accent-[#CA3F2E]" />
                    <span className="text-sm">{isFr ? "Adresse par d\u00e9faut" : "Default address"}</span>
                  </label>
                  <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#CA3F2E] text-white rounded-xl text-sm font-bold hover:bg-[#8B2A1E] transition disabled:opacity-50">
                    <Save className="w-4 h-4" /> {saving ? "..." : (isFr ? "Enregistrer" : "Save")}
                  </button>
                </div>
              )}

              {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto mt-12 text-[#CA3F2E]" /> : addresses.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-lg font-bold mb-2">{isFr ? "Aucune adresse" : "No addresses saved"}</h2>
                  <p className="text-sm text-gray-500">{isFr ? "Ajoutez une adresse pour un checkout plus rapide" : "Add an address for faster checkout"}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(a => (
                    <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-[#CA3F2E] mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">{a.label}</span>
                          {a.isDefault && <span className="text-[10px] px-2 py-0.5 bg-[#CA3F2E] text-white rounded-full font-bold">{isFr ? "Par d\u00e9faut" : "Default"}</span>}
                        </div>
                        <div className="text-sm text-gray-700">{a.fullName}</div>
                        <div className="text-xs text-gray-500">{a.street}, {a.city}{a.state ? ", " + a.state : ""}, {a.country}</div>
                        <div className="text-xs text-gray-500">{a.phone}</div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!a.isDefault && <button onClick={() => setDefault(a.id)} className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg" title={isFr ? "Par d\u00e9faut" : "Set default"}><Star className="w-4 h-4" /></button>}
                        <button onClick={() => remove(a.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}