"use client";

import { useState, useTransition } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TurnstileGate from "@/components/TurnstileGate";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Key,
} from "lucide-react";

export default function AffiliateForgotPasswordPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/affiliate/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, locale, turnstileToken }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || "Request failed");
          return;
        }
        setDone(true);
      } catch {
        setErrorMsg("Network error. Please try again.");
      }
    });
  };

  return (
    <TurnstileGate action="affiliate-forgot-password" isFr={isFr} locale={locale} onVerify={setTurnstileToken}>
      <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <Link
            href={`/${locale}/affiliate/login`}
            className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {isFr ? "Retour a la connexion" : "Back to login"}
          </Link>

          <div className="p-8 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30">
              <Key className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">
              {isFr ? "Mot de passe oublie" : "Forgot password"}
            </h1>
            <p className="mt-2 text-xs text-gray-400">
              {isFr
                ? "Entrez l'e-mail de votre compte affilie. Nous vous enverrons un lien de reinitialisation."
                : "Enter your affiliate account email. We will send you a reset link."}
            </p>

            {done ? (
              <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>
                  {isFr
                    ? "Si un compte existe pour cet e-mail, un lien a ete envoye. Verifiez votre boite de reception."
                    : "If an account exists for this email, a reset link has been sent. Check your inbox."}
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errorMsg}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#CA3F2E]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3.5 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {isFr ? "Envoyer le lien" : "Send reset link"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </TurnstileGate>
  );
}