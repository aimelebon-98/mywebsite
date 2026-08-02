"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Lock, CheckCircle, ArrowLeft } from "lucide-react";

function ResetForm() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) setError(isFr ? "Lien invalide" : "Invalid link");
  }, [token, isFr]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/customer/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || (isFr ? "Erreur" : "Error"));
    } else {
      setDone(true);
      setTimeout(() => router.push(`/${locale}/account/login`), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href={`/${locale}/account/login`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> {isFr ? "Retour" : "Back"}
        </Link>
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          {done ? (
            <div className="text-center">
              <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
              <h1 className="text-xl font-black mb-2">{isFr ? "Mot de passe change !" : "Password changed!"}</h1>
              <p className="text-sm text-gray-500">{isFr ? "Redirection..." : "Redirecting..."}</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black text-gray-900 mb-1">{isFr ? "Nouveau mot de passe" : "New password"}</h1>
              <p className="text-sm text-gray-500 mb-6">{isFr ? "Choisissez un nouveau mot de passe" : "Choose a new password"}</p>
              <form onSubmit={submit} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder={isFr ? "Nouveau mot de passe (8+ caracteres)" : "New password (8+ characters)"}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" disabled={loading || !token}
                  className="w-full py-3 bg-gray-900 hover:bg-[#CA3F2E] text-white rounded-xl text-sm font-bold transition disabled:opacity-50">
                  {loading ? "..." : (isFr ? "Changer le mot de passe" : "Change password")}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}