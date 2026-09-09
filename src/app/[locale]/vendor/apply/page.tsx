"use client";

import { useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Store, UserPlus, ArrowLeft, Loader2, Mail, User, Lock, EyeOff, Eye } from "lucide-react";
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
  } : {
    heading: "Become a vendor",
    subtitle: "Create your account to start selling.",
    name: "Full name",
    email: "Email address",
    password: "Password",
    submit: "Create my account",
    submitting: "Creating...",
    backHome: "Back to site",
    haveAccount: "Already a vendor?",
    login: "Log in",
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: BRAND_RED }}>
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t.heading}</h1>
            <p className="text-gray-500 text-sm">{t.subtitle}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">{t.name}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" required value={form.applicantName} onChange={e => setForm({ ...form, applicantName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#CA3F2E]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#CA3F2E]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">{t.password}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPass ? "text" : "password"} required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#CA3F2E]" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-3 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50" style={{ backgroundColor: BRAND_RED }}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? t.submitting : t.submit}
              </button>
            </form>

            <SocialLoginButtons mode="register" role="vendor" theme="light" />

            <div className="text-center text-sm text-gray-500 pt-6 mt-6 border-t border-gray-100">
              {t.haveAccount} <Link href={`/${locale}/vendor/login`} className="font-semibold hover:underline" style={{ color: BRAND_RED }}>{t.login}</Link>
            </div>
          </div>
          <div className="text-center mt-6">
            <Link href={`/${locale}`} className="text-sm text-gray-500 hover:text-gray-700">&larr; {t.backHome}</Link>
          </div>
        </div>
      </div>
    </TurnstileGate>
  );
}

export default function VendorApplyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" /></div>}>
      <VendorApplyForm />
    </Suspense>
  );
}