"use client";

import { useState } from "react";
import {
  Sparkles,
  MapPin,
  Share2,
  Wallet,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ChevronLeft,
  X,
  Copy,
  CheckCheck,
} from "lucide-react";

interface AffiliateOnboardingModalProps {
  locale: string;
  affiliateCode: string;
  onComplete: () => void;
  onSkip?: () => void;
  forceSetup?: boolean;
}

const COUNTRIES = [
  { code: "NG", name: "Nigeria" },
  { code: "TG", name: "Togo" },
  { code: "GH", name: "Ghana" },
  { code: "KE", name: "Kenya" },
  { code: "SN", name: "S\u00e9n\u00e9gal" },
  { code: "CI", name: "C\u00f4te d'Ivoire" },
  { code: "CM", name: "Cameroun" },
  { code: "BJ", name: "B\u00e9nin" },
  { code: "ZA", name: "South Africa" },
  { code: "FR", name: "France" },
  { code: "US", name: "United States" },
  { code: "OTHER", name: "Other" },
];

export default function AffiliateOnboardingModal({
  locale,
  affiliateCode,
  onComplete,
  onSkip,
  forceSetup = false,
}: AffiliateOnboardingModalProps) {
  const isFr = locale === "fr";
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    country: "",
    city: "",
    phone: "",
    whatsapp: "",
    websiteUrl: "",
    socialMediaUrl: "",
    marketingPlan: "",
    usdtWallet: "",
  });

  const setField = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const refUrl = `https://www.newdealzone.com/${locale}?ref=${affiliateCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(refUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isValidTrc20 = (addr: string) =>
    !addr.trim() || /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr.trim());

  // COMPULSORY VALIDATION RULES
  const validateStep = (s: number) => {
    if (s === 1) return form.country.length > 0 && form.phone.trim().length >= 4;
    if (s === 2) return form.marketingPlan.trim().length >= 5; // COMPULSORY
    if (s === 3) return isValidTrc20(form.usdtWallet);
    return true;
  };

  const handleSubmit = async () => {
    if (!form.marketingPlan.trim()) {
      setError(
        isFr
          ? "Veuillez expliquer comment vous comptez promouvoir nos produits."
          : "Please describe how you plan to promote our products."
      );
      setStep(2);
      return;
    }

    if (form.usdtWallet.trim() && !isValidTrc20(form.usdtWallet)) {
      setError(
        isFr
          ? "Adresse USDT TRC20 invalide (doit commencer par T et faire 34 caract\u00e8res)"
          : "Invalid USDT TRC20 address (must start with T and be 34 characters)"
      );
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/affiliate/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.phone,
          whatsapp: form.whatsapp,
          country: form.country,
          city: form.city,
          websiteUrl: form.websiteUrl,
          socialMediaUrl: form.socialMediaUrl,
          marketingPlan: form.marketingPlan,
          bankName: "USDT-TRC20",
          bankAccount: form.usdtWallet.trim(),
          bankAccountName: "USDT TRC20 Wallet",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete onboarding");
      setDone(true);
    } catch (err: any) {
      setError(err?.message || (isFr ? "Une erreur est survenue" : "An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  const t = {
    title: isFr ? "Configuration Partenaire Affili\u00e9" : "Affiliate Partner Setup",
    step1: isFr ? "Contact & Pays" : "Contact & Region",
    step2: isFr ? "Canaux de Vente" : "Marketing Channels",
    step3: isFr ? "Portefeuille USDT" : "USDT Wallet",
    country: isFr ? "Votre pays *" : "Your Country *",
    city: isFr ? "Ville" : "City",
    cityPh: isFr ? "New York, Paris, Los Angeles..." : "New York, Los Angeles, Miami...",
    phone: isFr ? "Num\u00e9ro de t\u00e9l\u00e9phone *" : "Phone Number *",
    whatsapp: "WhatsApp",
    socialUrl: isFr ? "Lien Profil Social Principal (facultatif)" : "Primary Social Profile URL (optional)",
    socialPh: "https://instagram.com/..., TikTok, etc.",
    webUrl: isFr ? "Site web / Blog (facultatif)" : "Website / Blog (optional)",
    plan: isFr ? "Comment comptez-vous promouvoir nos produits ? *" : "How do you plan to promote our products? *",
    planPh: isFr
      ? "Ex: TikTok, stories Instagram, groupes WhatsApp, canal Telegram..."
      : "e.g. TikTok reviews, WhatsApp status, Instagram stories, Telegram channel...",
    walletLabel: isFr ? "Adresse portefeuille USDT (TRC20) (facultatif)" : "USDT Wallet Address (TRC20) (optional)",
    walletPh: isFr ? "Vous pourrez l'ajouter plus tard dans les param\u00e8tres" : "you can add it later in settings",
    walletHint: isFr
      ? "Les paiements de commission sont effectu\u00e9s en USDT TRC20. Vous pouvez saisir votre adresse maintenant ou l'ajouter plus tard dans votre tableau de bord."
      : "Commission payouts are made in USDT TRC20. You can enter your wallet address now or add it later in your Settings.",
    next: isFr ? "Continuer" : "Next",
    back: isFr ? "Retour" : "Back",
    submit: isFr ? "Terminer la configuration" : "Complete Setup",
    doneTitle: isFr ? "F\u00e9licitations !" : "You're All Set!",
    doneDesc: isFr
      ? "Votre profil affili\u00e9 est activ\u00e9. Voici votre lien de parrainage unique :"
      : "Your affiliate profile is active. Here is your unique referral link:",
    copyLink: isFr ? "Copier mon lien" : "Copy My Link",
    copied: isFr ? "Copi\u00e9 !" : "Copied!",
    enterDash: isFr ? "Ouvrir mon tableau de bord" : "Go to Dashboard",
    skip: isFr ? "Passer pour l'instant" : "Skip for now",
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* SOFT BACKDROP (MATCHING SMZ BOT MODAL) */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          if (!forceSetup && onSkip) onSkip();
        }}
      />

      <div className="relative w-full max-w-xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 pt-6 pb-4 border-b border-gray-800 bg-gray-900/90 relative">
          {(!forceSetup || onSkip) && !done && (
            <button
              type="button"
              onClick={onSkip || onComplete}
              className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#CA3F2E]/20 text-[#CA3F2E] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">{t.title}</h2>
          </div>

          {!done && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { n: 1, label: t.step1, icon: MapPin },
                { n: 2, label: t.step2, icon: Share2 },
                { n: 3, label: t.step3, icon: Wallet },
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

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs">
              {error}
            </div>
          )}

          {step === 1 && !done && (
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
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="+1 (800) 458-0199"
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
                    placeholder="+1 (800) 458-0199"
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && !done && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  {t.plan}
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.marketingPlan}
                  onChange={(e) => setField("marketingPlan", e.target.value)}
                  placeholder={t.planPh}
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  {t.socialUrl}
                </label>
                <input
                  type="text"
                  value={form.socialMediaUrl}
                  onChange={(e) => setField("socialMediaUrl", e.target.value)}
                  placeholder={t.socialPh}
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  {t.webUrl}
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
          )}

          {step === 3 && !done && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
                {t.walletHint}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  {t.walletLabel}
                </label>
                <input
                  type="text"
                  value={form.usdtWallet}
                  onChange={(e) => setField("usdtWallet", e.target.value)}
                  placeholder={t.walletPh}
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/90 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm font-mono"
                />
                <p className="mt-1.5 text-[11px] text-gray-500">
                  Network: <span className="text-[#CA3F2E] font-semibold">TRC20 (Tron)</span> — USDT only
                </p>
              </div>
            </div>
          )}

          {done && (
            <div className="text-center py-5 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#CA3F2E]/20 text-[#CA3F2E] flex items-center justify-center mx-auto border border-[#CA3F2E]/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{t.doneTitle}</h3>
                <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">{t.doneDesc}</p>
              </div>
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 text-left">
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#CA3F2E]">
                  Code: {affiliateCode}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={refUrl}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={copyLink}
                    className="px-3.5 py-2 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? t.copied : t.copyLink}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={onComplete}
                className="w-full py-3.5 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-bold text-sm shadow-xl shadow-[#CA3F2E]/30 transition-all inline-flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {t.enterDash}
              </button>
            </div>
          )}
        </div>

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
              ) : (
                <button
                  type="button"
                  onClick={onSkip || onComplete}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {t.skip}
                </button>
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
                  disabled={loading || !validateStep(3)}
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