"use client";

import { useState, useEffect, Suspense, useTransition } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import TurnstileGate from "@/components/TurnstileGate";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  User,
  Mail
} from "lucide-react";

function AffiliateApplyForm() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const prefillEmail = searchParams.get("email") || "";
  const oauthPrefill = Boolean(searchParams.get("oauth") || prefillEmail);
  const prefillName = searchParams.get("name") || "";

  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const [formData, setFormData] = useState({
    applicantName: prefillName,
    email: prefillEmail,
    password: "",
  });

  useEffect(() => {
    if (prefillEmail || prefillName) {
      setFormData((f) => ({
        ...f,
        applicantName: f.applicantName || prefillName,
        email: f.email || prefillEmail,
      }));
    }
  }, [prefillEmail, prefillName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const t = isFr ? {
    heading: "Cr\u00e9ation de compte Affili\u00e9",
    subtitle: "Cr\u00e9ez votre compte pour commencer \u00e0 toucher jusqu'\u00e0 50% de commission imm\u00e9diatement.",
    name: "Nom complet",
    email: "Adresse email",
    password: "Mot de passe",
    submit: "Cr\u00e9er mon compte",
    submitting: "Cr\u00e9ation...",
    backHome: "Retour \u00e0 la pr\u00e9sentation",
    haveAccount: "D\u00e9j\u00e0 affili\u00e9 ?",
    login: "Se connecter",
    tag: "REJOINDRE LE R\u00c9SEAU",
  } : {
    heading: "Affiliate Account Signup",
    subtitle: "Create your account to instantly start earning up to 50% commission.",
    name: "Full name",
    email: "Email address",
    password: "Password",
    submit: "Create my account",
    submitting: "Creating...",
    backHome: "Back to program overview",
    haveAccount: "Already an affiliate?",
    login: "Log in",
    tag: "JOIN THE NETWORK",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.password.length < 6) {
      setErrorMsg(
        isFr
          ? "Le mot de passe doit comporter au moins 6 caract\u00e8res"
          : "Password must be at least 6 characters"
      );
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/affiliate/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, locale, turnstileToken }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || "Failed to create account");
          return;
        }

        window.location.href = `/${locale}/affiliate/dashboard`;
      } catch {
        setErrorMsg("Network error. Please try again.");
      }
    });
  };

  return (
    <TurnstileGate action="affiliate-apply" isFr={isFr} locale={locale} onVerify={setTurnstileToken}>
      <div className="min-h-screen bg-[#0d0d0d] text-white py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Link
            href={`/${locale}/affiliate`}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backHome}
          </Link>

          <div className="p-8 sm:p-10 rounded-2xl bg-white/[0.04] border border-white/10 shadow-2xl">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CA3F2E]/10 border border-[#CA3F2E]/30 text-[#CA3F2E] text-xs font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                {t.tag}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">{t.heading}</h1>
              <p className="mt-2 text-sm text-gray-400">{t.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3 text-sm">
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">{t.name}</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="applicantName"
                    required
                    value={formData.applicantName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">{t.password}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm transition-colors"
                    placeholder={isFr ? "Min. 6 caract\u00e8res" : "Min. 6 characters"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#CA3F2E]/20 text-sm mt-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.submitting}
                  </>
                ) : (
                  <>
                    {t.submit}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <SocialLoginButtons mode="register" role="affiliate" theme="dark" />

            <div className="mt-8 text-center text-sm text-gray-400 pt-6 border-t border-white/10">
              {t.haveAccount} <Link href={`/${locale}/affiliate/login`} className="font-semibold text-[#CA3F2E] hover:underline transition-colors">{t.login}</Link>
            </div>
          </div>
        </div>
      </div>
    </TurnstileGate>
  );
}

export default function AffiliateApplyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white">
          <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" />
        </div>
      }
    >
      <AffiliateApplyForm />
    </Suspense>
  );
}