"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

const BRAND_RED = "#CA3F2E";
const BRAND_RED_DARK = "#8B2A1E";

export default function ChangePasswordPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = isFr ? {
    heading: "Changez votre mot de passe",
    subtitle: "Pour votre s\u00e9curit\u00e9, veuillez d\u00e9finir un nouveau mot de passe avant de continuer.",
    newPassword: "Nouveau mot de passe",
    confirm: "Confirmer le mot de passe",
    hint: "Minimum 8 caract\u00e8res",
    submit: "Enregistrer et continuer",
    submitting: "Enregistrement...",
    mismatch: "Les mots de passe ne correspondent pas",
  } : {
    heading: "Change your password",
    subtitle: "For your security, please set a new password before continuing.",
    newPassword: "New password",
    confirm: "Confirm password",
    hint: "Minimum 8 characters",
    submit: "Save and continue",
    submitting: "Saving...",
    mismatch: "Passwords do not match",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError(t.mismatch);
      return;
    }
    if (newPassword.length < 8) {
      setError(t.hint);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendor/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push(`/${locale}/vendor/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: BRAND_RED }}>
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t.heading}</h1>
          <p className="text-gray-500 text-sm">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 md:p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.newPassword}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={show ? "text" : "password"}
                required
                minLength={8}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm"
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t.hint}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.confirm}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={show ? "text" : "password"}
                required
                minLength={8}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 text-white font-bold text-base rounded-xl transition-colors disabled:opacity-50"
            style={{ backgroundColor: BRAND_RED }}
            onMouseOver={e => { if (!submitting) e.currentTarget.style.backgroundColor = BRAND_RED_DARK; }}
            onMouseOut={e => { if (!submitting) e.currentTarget.style.backgroundColor = BRAND_RED; }}
          >
            {submitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" />{t.submitting}</>
            ) : (
              <>{t.submit}<ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}