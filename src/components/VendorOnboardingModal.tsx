"use client";

import { useState } from "react";
import {
  Store,
  MapPin,
  Landmark,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
} from "lucide-react";

interface VendorOnboardingModalProps {
  locale: string;
  onComplete: () => void;
  onSkip?: () => void;
}

const CATEGORIES = ["sneakers", "running", "formal", "boots", "sandals", "casual"];
const COUNTRIES = [
  { code: "NG", name: "Nigeria" },
  { code: "TG", name: "Togo" },
  { code: "GH", name: "Ghana" },
  { code: "KE", name: "Kenya" },
  { code: "SN", name: "S\u00e9n\u00e9gal" },
  { code: "CI", name: "C\u00f4te d'Ivoire" },
  { code: "CM", name: "Cameroun" },
  { code: "BJ", name: "B\u00e9nin" },
  { code: "ML", name: "Mali" },
  { code: "BF", name: "Burkina Faso" },
  { code: "NE", name: "Niger" },
  { code: "ZA", name: "South Africa" },
  { code: "FR", name: "France" },
  { code: "US", name: "United States" },
  { code: "OTHER", name: "Other" },
];

export default function VendorOnboardingModal({
  locale,
  onComplete,
  onSkip,
}: VendorOnboardingModalProps) {
  const isFr = locale === "fr";
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    storeName: "",
    storeDescription: "",
    categories: [] as string[],
    country: "",
    city: "",
    phone: "",
    whatsapp: "",
    bankName: "",
    bankAccount: "",
    bankAccountName: "",
    instagramUrl: "",
    websiteUrl: "",
  });

  const setField = (key: string, val: any) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const validateStep = (s: number) => {
    if (s === 1) return form.storeName.trim().length >= 2;
    if (s === 2) return form.country.length > 0 && form.phone.trim().length >= 4;
    if (s === 3) return true;
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: form.storeName,
          storeDescription: form.storeDescription,
          productCategories: form.categories,
          country: form.country,
          city: form.city,
          phone: form.phone,
          whatsapp: form.whatsapp,
          bankName: form.bankName,
          bankAccount: form.bankAccount,
          bankAccountName: form.bankAccountName,
          instagramUrl: form.instagramUrl,
          websiteUrl: form.websiteUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete setup");
      }
      setDone(true);
    } catch (err: any) {
      setError(err?.message || (isFr ? "Une erreur est survenue" : "An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  const t = {
    title: isFr ? "Configuration de votre boutique" : "Set Up Your Seller Store",
    step1: isFr ? "Boutique" : "Store Info",
    step2: isFr ? "Contact & Pays" : "Contact & Region",
    step3: isFr ? "Coordonn\u00e9es bancaires" : "Payout Details",
    storeName: isFr ? "Nom de votre boutique *" : "Store Name *",
    storeNamePh: isFr ? "Ex: Sneaker Vault Lom\u00e9" : "e.g. Sneaker Vault",
    storeDesc: isFr ? "Description courte" : "Store Description",
    storeDescPh: isFr ? "Pr\u00e9sentez vos produits et votre marque..." : "Tell customers about your products...",
    catLabel: isFr ? "Cat\u00e9gories principales" : "Product Categories",
    country: isFr ? "Pays d'origine *" : "Country *",
    city: isFr ? "Ville" : "City",
    cityPh: isFr ? "Lom\u00e9, Abuja, Accra..." : "Lom\u00e9, Abuja, Accra...",
    phone: isFr ? "Num\u00e9ro de t\u00e9l\u00e9phone *" : "Phone Number *",
    whatsapp: "WhatsApp",
    bankName: isFr ? "Nom de la banque ou op\u00e9rateur" : "Bank / Mobile Money Provider",
    bankNamePh: isFr ? "Ex: Ecobank, GTBank, Flooz, TMoney" : "e.g. Ecobank, GTBank, Flooz, TMoney",
    bankAccount: isFr ? "Num\u00e9ro de compte ou t\u00e9l\u00e9phone" : "Account Number / Phone",
    bankAccountName: isFr ? "Nom complet du titulaire" : "Account Holder Full Name",
    insta: "Instagram URL",
    website: isFr ? "Site web (facultatif)" : "Website URL (optional)",
    next: isFr ? "Continuer" : "Next",
    back: isFr ? "Retour" : "Back",
    submit: isFr ? "Finaliser ma boutique" : "Submit Store Setup",
    doneTitle: isFr ? "Boutique enregistr\u00e9e !" : "Store Profile Created!",
    doneDesc: isFr
      ? "Votre boutique est pr\u00eate. L'\u00e9quipe v\u00e9rifie vos informations et vous pouvez d\u00e9sormais explorer votre tableau de bord."
      : "Your store setup is complete. You can now access your vendor dashboard and begin uploading products.",
    enterDash: isFr ? "Acc\u00e9der au tableau de bord" : "Go to Dashboard",
    skip: isFr ? "Compl\u00e9ter plus tard" : "Complete later",
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => {
          if (!done && onSkip) onSkip();
        }}
      />

      <div className="relative w-full max-w-xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Progress header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-800 bg-gray-900/90 backdrop-blur-sm relative">
          {onSkip && !done && (
            <button
              type="button"
              onClick={() => { if (onSkip) onSkip(); }}
              className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#CA3F2E]/20 text-[#CA3F2E] flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">{t.title}</h2>
          </div>

          {/* Stepper bar */}
          {!done && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { n: 1, label: t.step1, icon: Store },
                { n: 2, label: t.step2, icon: MapPin },
                { n: 3, label: t.step3, icon: Landmark },
              ].map((s) => {
                const Icon = s.icon;
                const active = step >= s.n;
                const current = step === s.n;
                return (
                  <div
                    key={s.n}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all ${
                      current
                        ? "bg-[#CA3F2E]/20 border-[#CA3F2E] text-white"
                        : active
                        ? "bg-gray-800/80 border-gray-700 text-gray-300"
                        : "bg-gray-900 border-gray-800 text-gray-500"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{s.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* STEP 1: Store info */}
          {step === 1 && !done && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  {t.storeName}
                </label>
                <input
                  type="text"
                  required
                  value={form.storeName}
                  onChange={(e) => setField("storeName", e.target.value)}
                  placeholder={t.storeNamePh}
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  {t.storeDesc}
                </label>
                <textarea
                  rows={3}
                  value={form.storeDescription}
                  onChange={(e) => setField("storeDescription", e.target.value)}
                  placeholder={t.storeDescPh}
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                  {t.catLabel}
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const sel = form.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          sel
                            ? "bg-[#CA3F2E] border-[#CA3F2E] text-white shadow-md shadow-[#CA3F2E]/30"
                            : "bg-gray-800/70 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
                        }`}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Location & Contact */}
          {step === 2 && !done && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    {t.country}
                  </label>
                  <select
                    value={form.country}
                    onChange={(e) => setField("country", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border border-gray-700 text-white focus:outline-none focus:border-[#CA3F2E] text-sm"
                  >
                    <option value="">{isFr ? "-- S\u00e9lectionnez --" : "-- Select Country --"}</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    {t.city}
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                    placeholder={t.cityPh}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="+228..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    {t.whatsapp}
                  </label>
                  <input
                    type="tel"
                    value={form.whatsapp}
                    onChange={(e) => setField("whatsapp", e.target.value)}
                    placeholder="+228..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    {t.insta}
                  </label>
                  <input
                    type="text"
                    value={form.instagramUrl}
                    onChange={(e) => setField("instagramUrl", e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    {t.website}
                  </label>
                  <input
                    type="text"
                    value={form.websiteUrl}
                    onChange={(e) => setField("websiteUrl", e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Banking */}
          {step === 3 && !done && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  {t.bankName}
                </label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={(e) => setField("bankName", e.target.value)}
                  placeholder={t.bankNamePh}
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  {t.bankAccount}
                </label>
                <input
                  type="text"
                  value={form.bankAccount}
                  onChange={(e) => setField("bankAccount", e.target.value)}
                  placeholder="1234567890"
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  {t.bankAccountName}
                </label>
                <input
                  type="text"
                  value={form.bankAccountName}
                  onChange={(e) => setField("bankAccountName", e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Completed */}
          {done && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#CA3F2E]/20 text-[#CA3F2E] flex items-center justify-center mx-auto border border-[#CA3F2E]/30 animate-pulse">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{t.doneTitle}</h3>
                <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">{t.doneDesc}</p>
              </div>
              <button
                type="button"
                onClick={onComplete}
                className="px-8 py-3.5 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-bold text-sm shadow-xl shadow-[#CA3F2E]/30 transition-all inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {t.enterDash}
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!done && (
          <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/90 flex items-center justify-between">
            <div>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t.back}
                </button>
              ) : onSkip ? (
                <button
                  type="button"
                  onClick={() => { if (onSkip) onSkip(); }}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {t.skip}
                </button>
              ) : (
                <div />
              )}
            </div>

            <div>
              {step < 3 ? (
                <button
                  type="button"
                  disabled={!validateStep(step)}
                  onClick={() => setStep(step + 1)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-semibold text-xs transition-all disabled:opacity-40"
                >
                  {t.next}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-semibold text-xs shadow-lg shadow-[#CA3F2E]/30 transition-all disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t.submit}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
