"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import TurnstileGate from "@/components/TurnstileGate";
import { Mail, Lock, User, Phone, UserPlus, Loader2, ArrowLeft } from "lucide-react";
import { trackCompleteRegistration as fbTrackCompleteRegistration } from "@/lib/fbpixel";

export default function RegisterPage() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const router = useRouter();
  const { customer, loading: authLoading, refresh } = useCustomer();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
      const res = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, phone, password, locale,
          turnstileToken,
          visitorId: typeof window !== "undefined" ? localStorage.getItem("solevault-visitor-id") || "" : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isFr ? "Erreur d\u0027inscription" : "Registration failed"));
      } else {
        try { fbTrackCompleteRegistration({ content_name: "customer_register", status: true }); } catch { /* ignore */ }
        await refresh();
        router.push(`/${locale}/account/dashboard`);
      }
    } catch {
      setError(isFr ? "Erreur reseau" : "Network error");
    }
    setLoading(false);
  };

  if (customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E] mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            {isFr ? "Redirection..." : "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <TurnstileGate action="customer-register" isFr={isFr} locale={locale} onVerify={setTurnstileToken}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link href={`/${locale}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition">
            <ArrowLeft className="w-4 h-4" /> {isFr ? "Retour" : "Back"}
          </Link>
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-[#CA3F2E] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <UserPlus className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-black text-gray-900">{isFr ? "Creer un compte" : "Create account"}</h1>
              <p className="text-sm text-gray-500 mt-1">{isFr ? "C\u0027est rapide et gratuit" : "It\u0027s quick and free"}</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">{isFr ? "Nom complet" : "Full name"}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    autoComplete="name" autoFocus
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] transition" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] transition" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                  {isFr ? "Telephone" : "Phone"} <span className="text-gray-400 font-normal normal-case">({isFr ? "optionnel" : "optional"})</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] transition" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">{isFr ? "Mot de passe" : "Password"}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] transition" />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{isFr ? "Minimum 8 caracteres" : "Minimum 8 characters"}</p>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gray-900 hover:bg-[#CA3F2E] text-white rounded-xl text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isFr ? "Creer mon compte" : "Create my account"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-500">
              {isFr ? "Deja un compte ?" : "Already have an account?"}{" "}
              <Link href={`/${locale}/account/login`} className="text-[#CA3F2E] font-semibold hover:underline">
                {isFr ? "Se connecter" : "Log in"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </TurnstileGate>
  );
}
