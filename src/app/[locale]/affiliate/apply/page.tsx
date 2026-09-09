"use client";

import { useState, useTransition } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TurnstileGate from "@/components/TurnstileGate";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AffiliateApplyPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const [formData, setFormData] = useState({
    applicantName: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password.length < 6) {
      setErrorMsg(
        isFr
          ? "Le mot de passe doit comporter au moins 6 caracteres"
          : "Password must be at least 6 characters"
      );
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg(
        isFr
          ? "Les mots de passe ne correspondent pas"
          : "Passwords do not match"
      );
      return;
    }

    startTransition(async () => {
      try {
        const { confirmPassword: _c, ...payload } = formData;
        const res = await fetch("/api/affiliate/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, locale, turnstileToken }),
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
    <TurnstileGate action="affiliate-apply" isFr={isFr} locale={locale} onVerify={setTurnstileToken}>
      <div className="min-h-screen bg-[#0d0d0d] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Link
            href={`/${locale}/affiliate`}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {isFr ? "Retour a la presentation" : "Back to program overview"}
          </Link>

          {submitted ? (
            <div className="p-8 sm:p-10 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                {isFr ? "Candidature Recue !" : "Application Submitted!"}
              </h2>
              <p className="mt-4 text-gray-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
                {isFr
                  ? "Merci d'avoir postule. Nous examinons votre dossier sous 24 a 48 heures. Une fois approuve, connectez-vous avec l'e-mail et le mot de passe que vous venez de choisir."
                  : "Thank you for applying. We review applications within 24-48 hours. Once approved, log in with the email and password you just chose."}
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link
                  href={`/${locale}/affiliate/login`}
                  className="px-6 py-3 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-semibold text-sm transition-all"
                >
                  {isFr ? "Aller a la connexion" : "Go to Login"}
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 sm:p-10 rounded-2xl bg-white/[0.04] border border-white/10">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CA3F2E]/10 border border-[#CA3F2E]/30 text-[#CA3F2E] text-xs font-semibold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isFr ? "Rejoindre le reseau" : "Join the Network"}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {isFr
                    ? "Formulaire de Candidature d'Affiliation"
                    : "Affiliate Application Form"}
                </h1>
                <p className="mt-2 text-sm text-gray-400">
                  {isFr
                    ? "Choisissez votre mot de passe maintenant. Apres approbation, vous l'utiliserez pour vous connecter et toucher jusqu'a 50% de commission."
                    : "Choose your password now. After approval, use it to log in and earn up to 50% commission."}
                </p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                  />
                </div>

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
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                      {isFr ? "Mot de passe *" : "Password *"}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPass ? "text" : "password"}
                        name="password"
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={isFr ? "Min. 6 caracteres" : "Min. 6 characters"}
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                      {isFr ? "Confirmer *" : "Confirm Password *"}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPass ? "text" : "password"}
                        name="confirmPassword"
                        required
                        minLength={6}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                      {isFr ? "Telephone" : "Phone Number"}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
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
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                    />
                  </div>
                </div>

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
                      <option value="CI">Cote d&apos;Ivoire</option>
                      <option value="BJ">Benin</option>
                      <option value="SN">Senegal</option>
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
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                    {isFr
                      ? "Lien Reseaux Sociaux (Instagram, TikTok, YouTube...)"
                      : "Primary Social Media Profile or Website"}
                  </label>
                  <input
                    type="url"
                    name="socialMediaUrl"
                    value={formData.socialMediaUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                    {isFr
                      ? "Comment prevoyez-vous de promouvoir nos produits ?"
                      : "How do you plan to promote New Deal Zone products?"}
                  </label>
                  <textarea
                    name="marketingPlan"
                    rows={3}
                    value={formData.marketingPlan}
                    onChange={handleChange}
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

              <SocialLoginButtons mode="register" role="affiliate" theme="dark" />
            </div>
          )}
        </div>
      </div>
    </TurnstileGate>
  );
}