"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, Key, ArrowRight, AlertCircle, Loader2, ShieldCheck } from "lucide-react";

export default function AffiliateChangePasswordPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [isPending, startTransition] = useTransition();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword !== confirmPassword) {
      setErrorMsg(
        isFr
          ? "Les mots de passe ne correspondent pas"
          : "Passwords do not match"
      );
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg(
        isFr
          ? "Le mot de passe doit comporter au moins 6 caract\u00e8res"
          : "Password must be at least 6 characters"
      );
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/affiliate/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || "Failed to change password");
          return;
        }

        router.push(`/${locale}/affiliate/dashboard`);
      } catch {
        setErrorMsg("Network error. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
            <Key className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            {isFr ? "S\u00e9curisez votre Compte" : "Secure Your Account"}
          </h1>
          <p className="mt-2 text-xs text-gray-400">
            {isFr
              ? "Veuillez d\u00e9finir un nouveau mot de passe personnel pour continuer."
              : "Please create a new password to activate your affiliate dashboard."}
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white/[0.04] border border-white/10 shadow-2xl">
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                {isFr ? "Nouveau Mot de Passe" : "New Password"}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isFr ? "Min. 6 caract\u00e8res" : "Min. 6 characters"}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                {isFr ? "Confirmer le Mot de Passe" : "Confirm New Password"}
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isFr ? "Confirmez votre mot de passe" : "Re-enter password"}
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
                  {isFr ? "Mise \u00e0 jour..." : "Updating..."}
                </>
              ) : (
                <>
                  {isFr ? "Enregistrer et Acc\u00e9der" : "Save and Continue"}
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