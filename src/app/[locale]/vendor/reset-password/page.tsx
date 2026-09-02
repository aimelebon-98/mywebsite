"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Store, Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function VendorResetPasswordPage() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError(isFr ? "Lien invalide." : "Invalid reset link.");
      return;
    }
    if (password.length < 8) {
      setError(
        isFr
          ? "Le mot de passe doit contenir au moins 8 caracteres."
          : "Password must be at least 8 characters."
      );
      return;
    }
    if (password !== confirm) {
      setError(isFr ? "Les mots de passe ne correspondent pas." : "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/vendor/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, locale }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(
          data.error ||
            (isFr ? "Impossible de reinitialiser le mot de passe." : "Could not reset password.")
        );
        return;
      }
      setDone(true);
      setTimeout(() => {
        router.push(`/${locale}/vendor/login`);
      }, 2500);
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
          {isFr ? "Nouveau mot de passe" : "Set new password"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isFr ? "Choisissez un mot de passe securise" : "Choose a secure password"}
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        {!token ? (
          <div className="text-center py-2">
            <p className="text-sm text-red-600 mb-4">
              {isFr
                ? "Lien invalide ou manquant. Demandez un nouveau lien."
                : "Invalid or missing link. Please request a new one."}
            </p>
            <Link
              href={`/${locale}/vendor/forgot-password`}
              className="text-sm font-semibold"
              style={{ color: "#CA3F2E" }}
            >
              {isFr ? "Demander un lien" : "Request a reset link"}
            </Link>
          </div>
        ) : done ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {isFr ? "Mot de passe mis a jour" : "Password updated"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {isFr
                ? "Redirection vers la connexion..."
                : "Redirecting you to login..."}
            </p>
            <Link
              href={`/${locale}/vendor/login`}
              className="text-sm font-semibold"
              style={{ color: "#CA3F2E" }}
            >
              {isFr ? "Se connecter maintenant" : "Sign in now"}
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {isFr ? "Nouveau mot de passe" : "New password"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {isFr ? "Minimum 8 caracteres" : "Minimum 8 characters"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {isFr ? "Confirmer le mot de passe" : "Confirm password"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
                  {isFr ? "Enregistrement..." : "Saving..."}
                </>
              ) : isFr ? (
                "Enregistrer le mot de passe"
              ) : (
                "Save new password"
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