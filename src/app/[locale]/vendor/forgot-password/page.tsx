"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Store, Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function VendorForgotPasswordPage() {
  const locale = useLocale();
  const isFr = locale === "fr";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        setError(data.error || (isFr ? "Une erreur est survenue." : "Something went wrong."));
        return;
      }
      setDone(true);
    } catch {
      setError(isFr ? "Erreur reseau. Reessayez." : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
          style={{ background: "#CA3F2E" }}
        >
          <Store className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          {isFr ? "Mot de passe oublie" : "Forgot password"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isFr
            ? "Recevez un lien de reinitialisation par e-mail"
            : "Get a reset link by email"}
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        {done ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {isFr ? "Verifiez votre boite mail" : "Check your inbox"}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {isFr
                ? "Si un compte vendeur existe pour cette adresse, un lien de reinitialisation vient d etre envoye. Le lien expire dans 1 heure."
                : "If a vendor account exists for that address, a reset link has been sent. The link expires in 1 hour."}
            </p>
            <Link
              href={`/${locale}/vendor/login`}
              className="inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: "#CA3F2E" }}
            >
              <ArrowLeft className="w-4 h-4" />
              {isFr ? "Retour a la connexion" : "Back to login"}
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <p className="text-sm text-gray-600 leading-relaxed">
              {isFr
                ? "Entrez l e-mail de votre compte vendeur. Nous vous enverrons un lien pour reinitialiser votre mot de passe."
                : "Enter your vendor account email and we will send you a link to reset your password."}
            </p>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {isFr ? "Adresse e-mail" : "Email address"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-opacity disabled:opacity-60"
              style={{ background: "#CA3F2E" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isFr ? "Envoi..." : "Sending..."}
                </>
              ) : isFr ? (
                "Envoyer le lien"
              ) : (
                "Send reset link"
              )}
            </button>

            <div className="text-center pt-1">
              <Link
                href={`/${locale}/vendor/login`}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {isFr ? "Retour a la connexion" : "Back to login"}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}