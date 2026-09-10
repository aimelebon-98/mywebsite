"use client";

import { useState } from "react";
import { X, Store, Phone, Landmark, CheckCircle2, Loader2, ChevronRight, ChevronLeft } from "lucide-react";

const BRAND = "#CA3F2E";
const BRAND_DARK = "#8B2A1E";

const COUNTRIES = [
  { code: "NG", label: "Nigeria" },
  { code: "TG", label: "Togo" },
  { code: "GH", label: "Ghana" },
  { code: "SN", label: "S\u00e9n\u00e9gal" },
  { code: "CI", label: "C\u00f4te d'Ivoire" },
  { code: "CM", label: "Cameroun" },
  { code: "KE", label: "Kenya" },
  { code: "BJ", label: "B\u00e9nin" },
  { code: "ML", label: "Mali" },
  { code: "BF", label: "Burkina Faso" },
  { code: "NE", label: "Niger" },
  { code: "ZA", label: "South Africa" },
  { code: "FR", label: "France" },
  { code: "OTHER", label: "Other" },
];

const CATEGORIES = ["Sneakers", "Running", "Formal", "Boots", "Sandals", "Casual"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  locale?: string;
}

export default function VendorSignupWizard({ isOpen, onClose, locale = "en" }: Props) {
  const isFr = locale === "fr";
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    storeName: "",
    storeDescription: "",
    productCategories: [] as string[],
    contactName: "",
    phone: "",
    whatsapp: "",
    country: "",
    city: "",
    bankName: "",
    bankAccount: "",
    bankAccountName: "",
    instagramUrl: "",
    websiteUrl: "",
    additionalInfo: "",
  });

  if (!isOpen) return null;

  const set = (key: string, val: any) => setForm((p) => ({ ...p, [key]: val }));
  const toggleCat = (cat: string) => {
    setForm((p) => ({
      ...p,
      productCategories: p.productCategories.includes(cat)
        ? p.productCategories.filter((c) => c !== cat)
        : [...p.productCategories, cat],
    }));
  };

  const canNext = () => {
    if (step === 1) return form.storeName.trim().length > 0;
    if (step === 2) return form.contactName.trim().length > 0 && form.country.length > 0;
    if (step === 3) return form.bankName.trim().length > 0 && form.bankAccount.trim().length > 0;
    return true;
  };

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/vendor/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          productCategories: form.productCategories.join(", "),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setDone(true);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const t = {
    title: isFr ? "Configurez votre boutique" : "Set Up Your Store",
    step1: isFr ? "Boutique" : "Store",
    step2: isFr ? "Contact" : "Contact",
    step3: isFr ? "Banque" : "Banking",
    step4: isFr ? "Termin\u00e9" : "Done",
    storeName: isFr ? "Nom de la boutique *" : "Store Name *",
    storeDesc: isFr ? "Description de la boutique" : "Store Description",
    categories: isFr ? "Cat\u00e9gories de produits" : "Product Categories",
    contactName: isFr ? "Nom du contact *" : "Contact Name *",
    phone: isFr ? "T\u00e9l\u00e9phone" : "Phone",
    whatsapp: "WhatsApp",
    country: isFr ? "Pays *" : "Country *",
    city: isFr ? "Ville" : "City",
    bankName: isFr ? "Nom de la banque *" : "Bank Name *",
    bankAccount: isFr ? "Num\u00e9ro de compte *" : "Account Number *",
    bankAccountName: isFr ? "Nom du titulaire *" : "Account Holder Name *",
    instagram: "Instagram URL",
    website: isFr ? "Site web" : "Website",
    extra: isFr ? "Infos suppl\u00e9mentaires" : "Additional Info",
    next: isFr ? "Suivant" : "Next",
    back: isFr ? "Retour" : "Back",
    submit: isFr ? "Soumettre ma candidature" : "Submit Application",
    doneTitle: isFr ? "Candidature envoy\u00e9e !" : "Application Submitted!",
    doneMsg: isFr
      ? "Votre boutique est en cours de v\u00e9rification. Vous recevrez un email d\u00e8s approbation."
      : "Your store is under review. You will receive an email once approved.",
    goToDash: isFr ? "Aller au tableau de bord" : "Go to Dashboard",
    selectCountry: isFr ? "S\u00e9lectionnez un pays" : "Select a country",
    placeholderDesc: isFr
      ? "D\u00e9crivez votre boutique en quelques phrases..."
      : "Describe your store in a few sentences...",
  };

  const steps = [
    { n: 1, label: t.step1, icon: Store },
    { n: 2, label: t.step2, icon: Phone },
    { n: 3, label: t.step3, icon: Landmark },
    { n: 4, label: t.step4, icon: CheckCircle2 },
  ];

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-6 pt-5 pb-3 z-10">
          {step < 4 && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
          )}
          <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
          {/* Step indicator */}
          <div className="flex items-center gap-1 mt-3">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const active = step >= s.n;
              return (
                <div key={s.n} className="flex items-center flex-1">
                  <div
                    className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition"
                    style={{
                      backgroundColor: active ? BRAND : "#e5e7eb",
                      color: active ? "#fff" : "#9ca3af",
                    }}
                  >
                    <Icon size={14} />
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className="flex-1 h-0.5 mx-1 transition"
                      style={{ backgroundColor: step > s.n ? BRAND : "#e5e7eb" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {error && (
            <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* STEP 1: Store */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>{t.storeName}</label>
                <input
                  className={inputCls}
                  style={{ focusRing: BRAND } as any}
                  value={form.storeName}
                  onChange={(e) => set("storeName", e.target.value)}
                  placeholder="e.g. SoleKing Lom\u00e9"
                />
              </div>
              <div>
                <label className={labelCls}>{t.storeDesc}</label>
                <textarea
                  className={inputCls + " min-h-[80px] resize-none"}
                  value={form.storeDescription}
                  onChange={(e) => set("storeDescription", e.target.value)}
                  placeholder={t.placeholderDesc}
                />
              </div>
              <div>
                <label className={labelCls}>{t.categories}</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCat(cat)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border transition"
                      style={{
                        backgroundColor: form.productCategories.includes(cat) ? BRAND : "#fff",
                        color: form.productCategories.includes(cat) ? "#fff" : "#374151",
                        borderColor: form.productCategories.includes(cat) ? BRAND : "#d1d5db",
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Contact */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>{t.contactName}</label>
                <input
                  className={inputCls}
                  value={form.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t.phone}</label>
                  <input
                    className={inputCls}
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+228..."
                  />
                </div>
                <div>
                  <label className={labelCls}>{t.whatsapp}</label>
                  <input
                    className={inputCls}
                    value={form.whatsapp}
                    onChange={(e) => set("whatsapp", e.target.value)}
                    placeholder="+228..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t.country}</label>
                  <select
                    className={inputCls}
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                  >
                    <option value="">{t.selectCountry}</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t.city}</label>
                  <input
                    className={inputCls}
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="Lom\u00e9, Abuja..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Banking */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>{t.bankName}</label>
                <input
                  className={inputCls}
                  value={form.bankName}
                  onChange={(e) => set("bankName", e.target.value)}
                  placeholder="e.g. Ecobank, GTBank"
                />
              </div>
              <div>
                <label className={labelCls}>{t.bankAccount}</label>
                <input
                  className={inputCls}
                  value={form.bankAccount}
                  onChange={(e) => set("bankAccount", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>{t.bankAccountName}</label>
                <input
                  className={inputCls}
                  value={form.bankAccountName}
                  onChange={(e) => set("bankAccountName", e.target.value)}
                />
              </div>
              <hr className="border-gray-200" />
              <div>
                <label className={labelCls}>{t.instagram}</label>
                <input
                  className={inputCls}
                  value={form.instagramUrl}
                  onChange={(e) => set("instagramUrl", e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className={labelCls}>{t.website}</label>
                <input
                  className={inputCls}
                  value={form.websiteUrl}
                  onChange={(e) => set("websiteUrl", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          {/* STEP 4: Done */}
          {step === 4 && done && (
            <div className="text-center py-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: BRAND + "15" }}
              >
                <CheckCircle2 size={32} style={{ color: BRAND }} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t.doneTitle}</h3>
              <p className="text-sm text-gray-500 mb-6">{t.doneMsg}</p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg text-white font-medium text-sm transition hover:opacity-90"
                style={{ backgroundColor: BRAND }}
              >
                {t.goToDash}
              </button>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {step < 4 && (
          <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-100 px-6 py-4 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                <ChevronLeft size={16} /> {t.back}
              </button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <button
                onClick={() => canNext() && setStep(step + 1)}
                className="flex items-center gap-1 px-5 py-2 rounded-lg text-white text-sm font-medium transition hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: BRAND }}
                disabled={!canNext()}
              >
                {t.next} <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={loading || !canNext()}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: BRAND }}
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {t.submit}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
