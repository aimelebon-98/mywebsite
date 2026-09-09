"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import TurnstileGate from "@/components/TurnstileGate";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { Store, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";

const BRAND_RED = "#CA3F2E";
const BRAND_RED_DARK = "#8B2A1E";

function VendorLoginForm() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "pending_review") {
      setError(
        isFr
          ? "Votre candidature de vendeur est en cours d'examen par l'administrateur."
          : "Your vendor application is currently under admin review."
      );
    } else if (errorParam === "oauth_failed") {
      setError(
        isFr
          ? "Échec de la connexion sociale. Veuillez réessayer."
          : "Social login failed. Please try again."
      );
    } else if (errorParam === "oauth_not_configured") {
      setError(
        isFr
          ? "La connexion sociale n'est pas encore configurée."
          : "Social login is not configured yet."
      );
    }
  }, [searchParams, isFr]);

  const t = isFr
    ? {
        heading: "Espace vendeur",
        subtitle: "Connectez-vous \u00e0 votre tableau de bord",
        email: "Adresse email",
        password: "Mot de passe",
        login: "Se connecter",
        loggingIn: "Connexion...",
        noAccount: "Pas encore vendeur ?",
        apply: "Postuler maintenant",
        backHome: "Retour au site",
      }
    : {
        heading: "Vendor login",
        subtitle: "Sign in to your dashboard",
        email: "Email address",
        password: "Password",
        login: "Log in",
        loggingIn: "Logging in...",
        noAccount: "Not a vendor yet?",
        apply: "Apply now",
        backHome: "Back to site",
      };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, turnstileToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      if (data.vendor?.mustChangePassword) {
        router.push(`/${locale}/vendor/change-password`);
      } else {
        router.push(`/${locale}/vendor/dashboard`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setSubmitting(false);
    }
  }

  return (
    <TurnstileGate action="vendor-login" isFr={isFr} locale={locale} onVerify={setTurnstileToken}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm"
              style={{ backgroundColor: BRAND_RED }}
            >
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t.heading}</h1>
            <p className="text-gray-500 text-sm">{t.subtitle}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ boxShadow: "none" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = BRAND_RED)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">{t.password}</label>
                  <Link
                    href={`/${locale}/vendor/forgot-password`}
                    className="text-xs font-semibold hover:underline"
                    style={{ color: BRAND_RED }}
                  >
                    {isFr ? "Mot de passe oubli\u00e9 ?" : "Forgot password?"}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-white font-bold text-base rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                style={{ backgroundColor: BRAND_RED }}
                onMouseOver={(e) => {
                  if (!submitting) e.currentTarget.style.backgroundColor = BRAND_RED_DARK;
                }}
                onMouseOut={(e) => {
                  if (!submitting) e.currentTarget.style.backgroundColor = BRAND_RED;
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t.loggingIn}
                  </>
                ) : (
                  <>
                    {t.login}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <SocialLoginButtons mode="login" role="vendor" theme="light" />

            <div className="text-center text-sm text-gray-500 pt-6 mt-6 border-t border-gray-100">
              {t.noAccount}{" "}
              <Link
                href={`/${locale}/vendor/apply`}
                className="font-semibold hover:underline"
                style={{ color: BRAND_RED }}
              >
                {t.apply}
              </Link>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link href={`/${locale}`} className="text-sm text-gray-500 hover:text-gray-700">
              &larr; {t.backHome}
            </Link>
          </div>
        </div>
      </div>
    </TurnstileGate>
  );
}

export default function VendorLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" />
      </div>
    }>
      <VendorLoginForm />
    </Suspense>
  );
}