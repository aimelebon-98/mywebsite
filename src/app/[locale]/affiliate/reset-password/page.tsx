"use client";

import { useState, useTransition, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

function ResetForm() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!token) {
      setErrorMsg(isFr ? "Lien invalide" : "Invalid reset link");
      return;
    }
    if (password.length < 6) {
      setErrorMsg(
        isFr
          ? "Le mot de passe doit comporter au moins 6 caracteres"
          : "Password must be at least 6 characters"
      );
      return;
    }
    if (password !== confirm) {
      setErrorMsg(
        isFr ? "Les mots de passe ne correspondent pas" : "Passwords do not match"
      );
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/affiliate/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || "Reset failed");
          return;
        }
        setDone(true);
        setTimeout(() => router.push(`/${locale}/affiliate/login`), 2000);
      } catch {
        setErrorMsg("Network error");
      }
    });
  };

  if (done) {
    return (
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex gap-2">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        {isFr
          ? "Mot de passe mis a jour ! Redirection vers la connexion..."
          : "Password updated! Redirecting to login..."}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
          {isFr ? "Nouveau mot de passe" : "New password"}
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#CA3F2E]"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
          {isFr ? "Confirmer" : "Confirm password"}
        </label>
        <div className="relative">
          <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
            {isFr ? "Enregistrer le mot de passe" : "Save new password"}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}

export default function AffiliateResetPasswordPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/[0.04] border border-white/10">
        <h1 className="text-2xl font-bold mb-2">
          {isFr ? "Nouveau mot de passe" : "Set new password"}
        </h1>
        <p className="text-xs text-gray-400 mb-6">
          {isFr
            ? "Choisissez un nouveau mot de passe pour votre compte affilie."
            : "Choose a new password for your affiliate account."}
        </p>
        <Suspense fallback={<Loader2 className="w-6 h-6 animate-spin text-[#CA3F2E]" />}>
          <ResetForm />
        </Suspense>
        <div className="mt-6 text-center text-xs text-gray-400">
          <Link href={`/${locale}/affiliate/login`} className="text-[#CA3F2E] hover:underline">
            {isFr ? "Retour a la connexion" : "Back to login"}
          </Link>
        </div>
      </div>
    </div>
  );
}