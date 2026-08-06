"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import TurnstileGate from "@/components/TurnstileGate";
import { Mail, Lock, LogIn, Loader2, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const router = useRouter();
  const { customer, loading: authLoading, refresh } = useCustomer();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  useEffect(() => {
    if (!authLoading && customer) {
      router.replace(`/${locale}/account/dashboard`);
    }
  }, [authLoading, customer, locale, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          turnstileToken,
          visitorId: typeof window !== "undefined" ? localStorage.getItem("solevault-visitor-id") || "" : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isFr ? "Erreur de connexion" : "Login failed"));
      } else {
        await refresh();
        router.push(`/${locale}/account/dashboard`);
      }
    } catch {
      setError(isFr ? "Erreur reseau" : "Network error");
    }
    setLoading(false);
  };

  // Only show loader if a logged-in customer is being redirected (very brief)
  // Guests go straight to the Turnstile gate + login form
  if (customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E] mx-auto mb-3" />
          <p className="text-sm text-gray-500">{isFr ? "Redirection..." : "Redirecting..."}</p>
        </div>
      </div>
    );
  }

  return (
    <TurnstileGate action="customer-login" isFr={isFr} locale={locale} onVerify={setTurnstileToken}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#CA3F2E] mb-6 transition group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition" />
            {isFr ? "Visiter la page d\u0027accueil" : "Visit Home Page"}
          </Link>
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-[#CA3F2E] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <LogIn className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-black text-gray-900">{isFr ? "Connexion" : "Log in"}</h1>
              <p className="text-sm text-gray-500 mt-1">{isFr ? "Accedez a votre compte" : "Access your account"}</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email" autoFocus
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] transition" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">{isFr ? "Mot de passe" : "Password"}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] transition" />
                </div>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gray-900 hover:bg-[#CA3F2E] text-white rounded-xl text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isFr ? "Se connecter" : "Log in"}
              </button>
            </form>

            <div className="mt-4 text-center space-y-2">
              <Link href={`/${locale}/account/forgot-password`} className="text-xs text-gray-500 hover:text-[#CA3F2E] transition block">
                {isFr ? "Mot de passe oublie ?" : "Forgot password?"}
              </Link>
              <p className="text-sm text-gray-500">
                {isFr ? "Pas de compte ?" : "No account?"}{" "}
                <Link href={`/${locale}/account/register`} className="text-[#CA3F2E] font-semibold hover:underline">
                  {isFr ? "S\u0027inscrire" : "Sign up"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </TurnstileGate>
  );
}
