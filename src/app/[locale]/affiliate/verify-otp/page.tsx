"use client";

import { useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight, Loader2, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";

function VerifyOtpInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const affiliateId = searchParams.get("id") || "";
  const method = searchParams.get("method") || "email_otp";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/affiliate/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ affiliateId, code, method }),
      });

      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "Invalid code");
        return;
      }

      router.push(`/${locale}/affiliate/dashboard`);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <Link
          href={`/${locale}/affiliate/login`}
          className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {isFr ? "Retour a la connexion" : "Back to login"}
        </Link>

        <div className="p-8 rounded-2xl bg-white/[0.04] border border-white/10 shadow-2xl space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#CA3F2E]/20 text-[#CA3F2E] flex items-center justify-center mx-auto mb-4 border border-[#CA3F2E]/30">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">
              {method === "totp"
                ? "Google Authenticator"
                : isFr
                ? "V\u00e9rification de S\u00e9curit\u00e9"
                : "Security Check"}
            </h1>
            <p className="mt-2 text-xs text-gray-400 leading-relaxed">
              {method === "totp"
                ? isFr
                  ? "Entrez le code \u00e0 6 chiffres depuis votre application Google Authenticator."
                  : "Enter the 6-digit code from your Google Authenticator app."
                : isFr
                ? "Saisissez le code de v\u00e9rification \u00e0 6 chiffres envoy\u00e9 par e-mail."
                : "Enter the 6-digit passcode sent to your registered email address."}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 text-center mb-2">
                {isFr ? "Code de V\u00e9rification" : "Passcode"}
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="w-full py-3.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-center tracking-widest text-2xl focus:outline-none focus:border-[#CA3F2E]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.trim().length !== 6}
              className="w-full py-3.5 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-bold text-sm shadow-lg shadow-[#CA3F2E]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isFr ? "V\u00e9rifier et Se Connecter" : "Verify & Sign In"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" /></div>}>
      <VerifyOtpInner />
    </Suspense>
  );
}