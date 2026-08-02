"use client";
import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/customer/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale }),
    });
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href={`/${locale}/account/login`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> {isFr ? "Retour" : "Back"}
        </Link>
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
              <h1 className="text-xl font-black mb-2">{isFr ? "Email envoye !" : "Email sent!"}</h1>
              <p className="text-sm text-gray-500">
                {isFr ? "Si un compte existe, vous recevrez un email avec les instructions." : "If an account exists, you'll receive an email with instructions."}
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black text-gray-900 mb-1">{isFr ? "Mot de passe oublie" : "Forgot password"}</h1>
              <p className="text-sm text-gray-500 mb-6">
                {isFr ? "Entrez votre email pour recevoir un lien" : "Enter your email to receive a reset link"}
              </p>
              <form onSubmit={submit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E]" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-gray-900 hover:bg-[#CA3F2E] text-white rounded-xl text-sm font-bold transition disabled:opacity-50">
                  {loading ? "..." : (isFr ? "Envoyer le lien" : "Send reset link")}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}