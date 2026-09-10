"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import TurnstileGate from "@/components/TurnstileGate";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

function AffiliateLoginForm() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const prefillEmail = searchParams.get("email") || "";

  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/affiliate/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, turnstileToken }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || "Login failed");
          return;
        }

        // If 2FA or Email OTP is required
        if (data.requires2FA) {
          router.push(
            `/${locale}/affiliate/verify-otp?id=${encodeURIComponent(data.affiliateId)}&method=${encodeURIComponent(data.method)}`
          );
          return;
        }

        if (data.mustChangePassword) {
          router.push(`/${locale}/affiliate/change-password`);
        } else {
          router.push(`/${locale}/affiliate/dashboard`);
        }
      } catch {
        setErrorMsg("Network error. Please try again.");
      }
    });
  };

  return (
    <TurnstileGate action="affiliate-login" isFr={isFr} locale={locale} onVerify={setTurnstileToken}>
      <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link
              href={`/${locale}/affiliate`}
              className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {isFr ? "Retour \u00e0 la pr\u00e9sentation" : "Back to affiliate page"}
            </Link>

            <div className="w-12 h-12 rounded-2xl bg-[#CA3F2E]/20 text-[#CA3F2E] flex items-center justify-center mx-auto mb-4 border border-[#CA3F2E]/30">
              <Sparkles className="w-6 h-6" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight">
              {isFr ? "Portail Partenaire Affili\u00e9" : "Affiliate Partner Portal"}
            </h1>
            <p className="mt-2 text-xs text-gray-400">
              {isFr
                ? "Connectez-vous pour suivre vos gains et liens de parrainage"
                : "Sign in to track your earnings, clicks, and referral links"}
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white/[0.04] border border-white/10 shadow-2xl">
            {errorMsg && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                  {isFr ? "Adresse E-mail" : "Email Address"}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {isFr ? "Mot de Passe" : "Password"}
                  </label>
                  <Link
                    href={`/${locale}/affiliate/forgot-password`}
                    className="text-xs text-[#CA3F2E] hover:underline font-medium"
                  >
                    {isFr ? "Mot de passe oubli\u00e9 ?" : "Forgot password?"}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#CA3F2E]/30 text-sm mt-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isFr ? "Connexion..." : "Signing in..."}
                  </>
                ) : (
                  <>
                    {isFr ? "Se Connecter" : "Sign In"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <SocialLoginButtons mode="login" role="affiliate" theme="dark" />

            <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-gray-400">
              {isFr ? "Pas encore affili\u00e9 ?" : "Not an affiliate yet?"}{" "}
              <Link
                href={`/${locale}/affiliate/apply`}
                className="text-[#CA3F2E] hover:underline font-medium"
              >
                {isFr ? "Postuler ici" : "Apply here"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </TurnstileGate>
  );
}

export default function AffiliateLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" /></div>}>
      <AffiliateLoginForm />
    </Suspense>
  );
}