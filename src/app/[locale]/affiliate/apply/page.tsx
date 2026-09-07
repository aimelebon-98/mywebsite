"use client";

import { useState, useTransition } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  DollarSign,
  Share2,
} from "lucide-react";

export default function AffiliateApplyPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    applicantName: "",
    email: "",
    phone: "",
    whatsapp: "",
    country: "NG",
    city: "",
    websiteUrl: "",
    socialMediaUrl: "",
    marketingPlan: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/affiliate/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, locale }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || "Failed to submit application");
          return;
        }

        setSubmitted(true);
      } catch {
        setErrorMsg("Network error. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/${locale}/affiliate`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isFr ? "Retour \u00e0 la pr\u00e9sentation" : "Back to program overview"}
        </Link>

        {submitted ? (
          <div className="p-8 sm:p-10 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              {isFr ? "Candidature Re\u00e7ue !" : "Application Submitted!"}
            </h2>
            <p className="mt-4 text-gray-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
              {isFr
                ? "Merci d'avoir postul\u00e9 au Programme d'Affiliation New Deal Zone. Nous examinons votre dossier sous 24 \u00e0 48 heures. Vous recevrez un e-mail avec vos identifiants d\u00e8s validation."
                : "Thank you for applying to the New Deal Zone Affiliate Program! We will review your application within 24-48 hours and send your referral credentials to your email."}
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href={`/${locale}`}
                className="px-6 py-3 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-semibold text-sm transition-all"
              >
                {isFr ? "Retourner \u00e0 la boutique" : "Return to Shop"}
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-10 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CA3F2E]/10 border border-[#CA3F2E]/30 text-[#CA3F2E] text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                {isFr ? "Rejoindre le r\u00e9seau" : "Join the Network"}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {isFr
                  ? "Formulaire de Candidature d'Affiliation"
                  : "Affiliate Application Form"}
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                {isFr
                  ? "Remplissez ce formulaire pour obtenir votre code de recommandation et commencer \u00e0 toucher 5% de commission."
                  : "Fill out the form below to get your unique referral code and start earning 5% commission on sales."}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                  {isFr ? "Nom Complet *" : "Full Name *"}
                </label>
                <input
                  type="text"
                  name="applicantName"
                  required
                  value={formData.applicantName}
                  onChange={handleChange}
                  placeholder={isFr ? "ex: Sarah Johnson" : "e.g. Sarah Johnson"}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                  {isFr ? "Adresse E-mail *" : "Email Address *"}
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                />
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                    {isFr ? "T\u00e9l\u00e9phone" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+234..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="+228..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                  />
                </div>
              </div>

              {/* Country & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                    {isFr ? "Pays" : "Country"}
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white focus:outline-none focus:border-[#CA3F2E] text-sm"
                  >
                    <option value="NG">Nigeria</option>
                    <option value="TG">Togo</option>
                    <option value="GH">Ghana</option>
                    <option value="CI">C\u00f4te d'Ivoire</option>
                    <option value="BJ">B\u00e9nin</option>
                    <option value="SN">S\u00e9n\u00e9gal</option>
                    <option value="CM">Cameroun</option>
                    <option value="FR">France</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="OTHER">{isFr ? "Autre pays" : "Other Country"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                    {isFr ? "Ville" : "City"}
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder={isFr ? "ex: Lom\u00e9, Abuja, Lagos..." : "e.g. Lagos, Abuja, Lome..."}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                  />
                </div>
              </div>

              {/* Social Media / Website */}
              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                  {isFr
                    ? "Lien R\u00e9seaux Sociaux (Instagram, TikTok, YouTube...)"
                    : "Primary Social Media Profile or Website"}
                </label>
                <input
                  type="url"
                  name="socialMediaUrl"
                  value={formData.socialMediaUrl}
                  onChange={handleChange}
                  placeholder="https://instagram.com/yourhandle or tiktok.com/@you"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                />
              </div>

              {/* Marketing Strategy */}
              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                  {isFr
                    ? "Comment pr\u00e9voyez-vous de promouvoir nos produits ?"
                    : "How do you plan to promote New Deal Zone products?"}
                </label>
                <textarea
                  name="marketingPlan"
                  rows={3}
                  value={formData.marketingPlan}
                  onChange={handleChange}
                  placeholder={
                    isFr
                      ? "ex: Vid\u00e9os unboxing TikTok, recommandations WhatsApp, blog de mode..."
                      : "e.g. TikTok unboxing reviews, WhatsApp status recommendations, fashion blog..."
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#CA3F2E]/30 text-base"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isFr ? "Envoi en cours..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    {isFr ? "Envoyer ma Candidature" : "Submit Application"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}