"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Store, Send, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";

const BRAND_RED = "#CA3F2E";
const BRAND_RED_DARK = "#8B2A1E";

const CATEGORIES = [
  { value: "sneakers", en: "Sneakers", fr: "Baskets" },
  { value: "running", en: "Running", fr: "Course" },
  { value: "formal", en: "Formal", fr: "Habill\u00e9" },
  { value: "boots", en: "Boots", fr: "Bottes" },
  { value: "sandals", en: "Sandals", fr: "Sandales" },
  { value: "casual", en: "Casual", fr: "D\u00e9contract\u00e9" },
];

const COUNTRIES = [
  { value: "NG", en: "Nigeria", fr: "Nig\u00e9ria" },
  { value: "TG", en: "Togo", fr: "Togo" },
  { value: "GH", en: "Ghana", fr: "Ghana" },
  { value: "BJ", en: "Benin", fr: "B\u00e9nin" },
  { value: "CI", en: "Ivory Coast", fr: "C\u00f4te d'Ivoire" },
  { value: "SN", en: "Senegal", fr: "S\u00e9n\u00e9gal" },
  { value: "ML", en: "Mali", fr: "Mali" },
  { value: "BF", en: "Burkina Faso", fr: "Burkina Faso" },
  { value: "KE", en: "Kenya", fr: "Kenya" },
  { value: "ZA", en: "South Africa", fr: "Afrique du Sud" },
  { value: "FR", en: "France", fr: "France" },
  { value: "US", en: "United States", fr: "\u00c9tats-Unis" },
  { value: "OTHER", en: "Other", fr: "Autre" },
];

export default function VendorApplyPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [form, setForm] = useState({
    applicantName: "",
    email: "",
    phone: "",
    whatsapp: "",
    storeName: "",
    storeDescription: "",
    productCategories: [] as string[],
    country: "NG",
    city: "",
    instagramUrl: "",
    websiteUrl: "",
    additionalInfo: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const t = isFr ? {
    heading: "Devenez vendeur sur NewDealZone",
    subtitle: "Rejoignez notre place de march\u00e9 et vendez vos chaussures \u00e0 des milliers de clients en Afrique et au-del\u00e0.",
    contactInfo: "Informations de contact",
    fullName: "Nom complet",
    email: "Adresse email",
    phone: "T\u00e9l\u00e9phone",
    whatsapp: "WhatsApp (si diff\u00e9rent)",
    storeInfo: "Informations sur votre boutique",
    storeName: "Nom de votre boutique",
    storeDesc: "Description de votre boutique",
    storeDescPlaceholder: "Parlez-nous de votre marque, votre exp\u00e9rience, ce qui vous rend unique...",
    categories: "Cat\u00e9gories de produits",
    categoriesHint: "S\u00e9lectionnez les cat\u00e9gories que vous vendez",
    country: "Pays",
    city: "Ville",
    instagram: "Instagram (optionnel)",
    website: "Site web (optionnel)",
    additional: "Informations suppl\u00e9mentaires (optionnel)",
    additionalPlaceholder: "Volume mensuel, sources, r\u00e9f\u00e9rences, questions...",
    terms: "En soumettant, j'accepte les conditions vendeur de NewDealZone. Ma candidature sera examin\u00e9e sous 24-48 heures.",
    submit: "Soumettre ma candidature",
    submitting: "Envoi en cours...",
    successHead: "Candidature re\u00e7ue !",
    successMsg: "Merci ! Nous avons re\u00e7u votre candidature. Notre \u00e9quipe l'examinera sous 24-48 heures. Vous recevrez un email d\u00e8s qu'une d\u00e9cision sera prise.",
    successCheck: "V\u00e9rifiez votre bo\u00eete de r\u00e9ception (et vos spams) pour l'email de confirmation.",
    backHome: "Retour \u00e0 l'accueil",
    haveAccount: "D\u00e9j\u00e0 vendeur ?",
    login: "Se connecter",
  } : {
    heading: "Become a vendor on NewDealZone",
    subtitle: "Join our marketplace and sell your footwear to thousands of customers across Africa and beyond.",
    contactInfo: "Contact information",
    fullName: "Full name",
    email: "Email address",
    phone: "Phone",
    whatsapp: "WhatsApp (if different)",
    storeInfo: "About your store",
    storeName: "Store name",
    storeDesc: "Store description",
    storeDescPlaceholder: "Tell us about your brand, your experience, what makes you unique...",
    categories: "Product categories",
    categoriesHint: "Select the categories you sell",
    country: "Country",
    city: "City",
    instagram: "Instagram (optional)",
    website: "Website (optional)",
    additional: "Additional info (optional)",
    additionalPlaceholder: "Monthly volume, sources, references, questions...",
    terms: "By submitting, I agree to NewDealZone's vendor terms. My application will be reviewed within 24-48 hours.",
    submit: "Submit application",
    submitting: "Submitting...",
    successHead: "Application received!",
    successMsg: "Thank you! We've received your application. Our team will review it within 24-48 hours. You'll receive an email as soon as a decision is made.",
    successCheck: "Check your inbox (and spam) for the confirmation email.",
    backHome: "Back to home",
    haveAccount: "Already a vendor?",
    login: "Log in",
  };

  function toggleCategory(cat: string) {
    setForm(f => ({
      ...f,
      productCategories: f.productCategories.includes(cat)
        ? f.productCategories.filter(c => c !== cat)
        : [...f.productCategories, cat],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{t.successHead}</h1>
          <p className="text-gray-600 text-base leading-relaxed mb-4">{t.successMsg}</p>
          <p className="text-gray-500 text-sm mb-8">{t.successCheck}</p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl transition-colors"
            style={{ backgroundColor: BRAND_RED }}
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backHome}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: BRAND_RED }}>
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{t.heading}</h1>
          <p className="text-gray-600 text-base max-w-xl mx-auto">{t.subtitle}</p>
          <div className="mt-4 text-sm text-gray-500">
            {t.haveAccount}{" "}
            <Link href={`/${locale}/vendor/login`} className="font-semibold hover:underline" style={{ color: BRAND_RED }}>{t.login}</Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 md:p-8 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{t.contactInfo}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.fullName} *</label>
                <input type="text" required value={form.applicantName} onChange={e => setForm({ ...form, applicantName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm" style={{ outlineColor: BRAND_RED }} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.email} *</label>
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.phone}</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.whatsapp}</label>
                <input type="tel" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{t.storeInfo}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.storeName} *</label>
                <input type="text" required value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.storeDesc}</label>
                <textarea rows={4} placeholder={t.storeDescPlaceholder} value={form.storeDescription} onChange={e => setForm({ ...form, storeDescription: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.categories}</label>
                <p className="text-xs text-gray-500 mb-2">{t.categoriesHint}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => {
                    const checked = form.productCategories.includes(cat.value);
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => toggleCategory(cat.value)}
                        className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${checked ? "text-white" : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"}`}
                        style={checked ? { backgroundColor: BRAND_RED, borderColor: BRAND_RED } : undefined}
                      >
                        {isFr ? cat.fr : cat.en}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.country} *</label>
                  <select required value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                    {COUNTRIES.map(c => (
                      <option key={c.value} value={c.value}>{isFr ? c.fr : c.en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.city}</label>
                  <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.instagram}</label>
                  <input type="url" placeholder="https://instagram.com/..." value={form.instagramUrl} onChange={e => setForm({ ...form, instagramUrl: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.website}</label>
                  <input type="url" placeholder="https://..." value={form.websiteUrl} onChange={e => setForm({ ...form, websiteUrl: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.additional}</label>
                <textarea rows={3} placeholder={t.additionalPlaceholder} value={form.additionalInfo} onChange={e => setForm({ ...form, additionalInfo: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none" />
              </div>
            </div>
          </section>

          <div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">{t.terms}</p>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 text-white font-bold text-base rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              style={{ backgroundColor: submitting ? "#9ca3af" : BRAND_RED }}
              onMouseOver={e => { if (!submitting) e.currentTarget.style.backgroundColor = BRAND_RED_DARK; }}
              onMouseOut={e => { if (!submitting) e.currentTarget.style.backgroundColor = BRAND_RED; }}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {t.submit}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}