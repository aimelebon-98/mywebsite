"use client";

import { useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Store, ArrowLeft, Loader2, Mail, User, Lock, EyeOff, Eye, Sparkles } from "lucide-react";
import TurnstileGate from "@/components/TurnstileGate";
import SocialLoginButtons from "@/components/SocialLoginButtons";

const BRAND_RED = "#CA3F2E";

function VendorApplyForm() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [form, setForm] = useState({
    applicantName: searchParams.get("name") || "",
    email: searchParams.get("email") || "",
    password: "",
  });
  
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  const t = isFr ? {
    heading: "Devenez vendeur",
    subtitle: "Cr\u00e9ez votre compte pour commencer \u00e0 vendre.",
    name: "Nom complet",
    email: "Adresse email",
    password: "Mot de passe",
    submit: "Cr\u00e9er mon compte",
    submitting: "Cr\u00e9ation...",
    backHome: "Retour au site",
    haveAccount: "D\u00e9j\u00e0 vendeur ?",
    login: "Se connecter",
    tag: "VENDRE SUR NEW DEAL",
  } : {
    heading: "Vendor Application Form",
    subtitle: "Create your account to start selling on our marketplace.",
    name: "Full name *",
    email: "Email address *",
    password: "Password *",
    submit: "Create my account",
    submitting: "Creating...",
    backHome: "Back to program overview",
    haveAccount: "Already a vendor?",
    login: "Log in",
    tag: "START SELLING",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) {
      setError(isFr ? "Le mot de passe doit comporter au moins 6 caract\u00e8res" : "Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      
      if (data.redirectTo === "dashboard") {
        window.location.href = `/${locale}/vendor/dashboard`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up");
      setSubmitting(false);
    }
  }

  return (
    <TurnstileGate action="vendor-apply" isFr={isFr} locale={locale} onVerify={setTurnstileToken}>
      <div className="min-h-screen bg-[#0d0d0d] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Link
            href={`/${locale}/vendor/login`}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backHome}
          </Link>

          <div className="p-8 sm:p-10 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CA3F2E]/10 border border-[#CA3F2E]/30 text-[#CA3F2E] text-xs font-semibold uppercase tracking-wider mb-3">
                <Store className="w-3.5 h-3.5" />
                {t.tag}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">{t.heading}</h1>
              <p className="mt-2 text-sm text-gray-400">{t.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3 text-sm">
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">{t.name}</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" required value={form.applicantName} onChange={e => setForm({ ...form, applicantName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">{t.password}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPass ? "text" : "password"} required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm" 
                    placeholder={isFr ? "Min. 6 caract\u00e8res" : "Min. 6 characters"} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full py-4 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#CA3F2E]/30 text-base">
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {submitting ? t.submitting : t.submit}
              </button>
            </form>

            <SocialLoginButtons mode="register" role="vendor" theme="dark" />

            <div className="mt-8 text-center text-sm text-gray-400 pt-6 border-t border-white/10">
              {t.haveAccount} <Link href={`/${locale}/vendor/login`} className="font-semibold text-[#CA3F2E] hover:underline">{t.login}</Link>
            </div>
          </div>
        </div>
      </div>
    </TurnstileGate>
  );
}

export default function VendorApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" /></div>}>
      <VendorApplyForm />
    </Suspense>
  );
}