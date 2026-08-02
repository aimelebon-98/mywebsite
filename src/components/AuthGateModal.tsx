"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Mail, Lock, User, MessageCircle, Sparkles, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useCustomer } from "@/lib/customer-context";

function d(s: string): string {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSkipAsGuest: () => void;
  locale: string;
}

type Mode = "signup" | "login";

export default function AuthGateModal({ open, onClose, onSuccess, onSkipAsGuest, locale }: Props) {
  const isFr = locale === "fr";
  const { refresh } = useCustomer();
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [welcomeCode, setWelcomeCode] = useState("");

  useEffect(() => {
    if (!open) {
      setError("");
      setWelcomeCode("");
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "signup" && !name.trim()) {
      setError(isFr ? "Nom requis" : "Name required");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(isFr ? "Email invalide" : "Invalid email");
      return;
    }
    if (mode === "signup" && password.length < 8) {
      setError(isFr ? d("Mot de passe : 8 caract\u00e8res minimum") : "Password: 8 characters minimum");
      return;
    }
    if (mode === "login" && !password) {
      setError(isFr ? "Mot de passe requis" : "Password required");
      return;
    }

    setLoading(true);
    try {
      const url = mode === "signup" ? "/api/customer/register" : "/api/customer/login";
      const body = mode === "signup"
        ? { name: name.trim(), email: email.trim().toLowerCase(), password, locale }
        : { email: email.trim().toLowerCase(), password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        await refresh();
        if (mode === "signup" && data.welcomeCoupon?.code) {
          setWelcomeCode(data.welcomeCoupon.code);
          setTimeout(() => { onSuccess(); }, 2200);
        } else {
          onSuccess();
        }
      } else {
        setError(data.error || (isFr ? "Erreur" : "Error"));
      }
    } catch {
      setError(isFr ? d("Erreur r\u00e9seau") : "Network error");
    }
    setLoading(false);
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity" aria-hidden="true" />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto pointer-events-auto animate-fade-in-up">

          {welcomeCode ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">{isFr ? "Bienvenue !" : "Welcome!"}</h2>
              <p className="text-sm text-gray-500 mb-5">
                {isFr
                  ? d("Votre compte a \u00e9t\u00e9 cr\u00e9\u00e9 et un coupon vous attend :")
                  : "Your account is ready and you got a welcome coupon:"}
              </p>
              <div className="bg-gradient-to-br from-[#CA3F2E] to-[#8B2A1E] rounded-2xl p-5 mb-4">
                <div className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-1">{isFr ? "Votre code" : "Your code"}</div>
                <div className="font-mono text-3xl font-black text-white tracking-widest">{welcomeCode}</div>
              </div>
              <p className="text-xs text-gray-400">{isFr ? "Redirection..." : "Continuing..."}</p>
            </div>
          ) : (
            <>
              <div className="relative p-6 pb-4 border-b border-gray-100">
                <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[#CA3F2E]" />
                  <span className="text-[10px] font-bold text-[#CA3F2E] uppercase tracking-widest">{isFr ? "Presque fini !" : "Almost done!"}</span>
                </div>
                <h2 className="text-xl font-black text-gray-900">
                  {mode === "signup" ? (isFr ? d("Cr\u00e9ez votre compte") : "Create your account") : (isFr ? "Connectez-vous" : "Sign in")}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {mode === "signup"
                    ? (isFr ? d("30 secondes. Suivez vos commandes et recevez un coupon de bienvenue.") : "30 seconds. Track your orders and get a welcome coupon.")
                    : (isFr ? "Content de vous revoir." : "Good to see you back.")}
                </p>
              </div>

              <div className="flex gap-1 p-1 mx-6 mt-4 bg-gray-100 rounded-xl">
                <button onClick={() => { setMode("signup"); setError(""); }}
                  className={"flex-1 py-2 rounded-lg text-xs font-bold transition " + (mode === "signup" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                  {isFr ? d("Cr\u00e9er un compte") : "Sign up"}
                </button>
                <button onClick={() => { setMode("login"); setError(""); }}
                  className={"flex-1 py-2 rounded-lg text-xs font-bold transition " + (mode === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
                  {isFr ? "Se connecter" : "Log in"}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-3">
                {mode === "signup" && (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">{isFr ? "Nom complet" : "Full name"}</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder={isFr ? "Jean Dupont" : "John Doe"} autoComplete="name" autoFocus
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] transition" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" autoComplete="email" autoFocus={mode === "login"}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] transition" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                    {isFr ? "Mot de passe" : "Password"}
                    {mode === "signup" && <span className="ml-1 text-gray-400 font-normal normal-case">(8+ {isFr ? "caract." : "chars"})</span>}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="********" autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CA3F2E] transition" />
                    <button type="button" onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white rounded-xl font-bold text-sm transition disabled:opacity-50">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {mode === "signup" ? (isFr ? d("Cr\u00e9er mon compte") : "Create my account") : (isFr ? "Se connecter" : "Sign in")}
                </button>

                {mode === "login" && (
                  <a href={`/${locale}/account/forgot-password`}
                    className="block text-center text-xs text-gray-500 hover:text-[#CA3F2E] transition">
                    {isFr ? d("Mot de passe oubli\u00e9 ?") : "Forgot password?"}
                  </a>
                )}
              </form>

              <div className="relative px-6">
                <div className="absolute inset-x-6 top-1/2 h-px bg-gray-100" />
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isFr ? "ou" : "or"}</span>
                </div>
              </div>

              <div className="p-6 pt-4">
                <button type="button" onClick={onSkipAsGuest}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 text-gray-700 hover:text-green-700 rounded-xl font-bold text-sm transition">
                  <MessageCircle className="w-4 h-4" />
                  {isFr ? "Continuer sans compte" : "Continue as guest"}
                </button>
                <p className="text-[10px] text-center text-gray-400 mt-2 leading-relaxed">
                  {isFr
                    ? d("Vous pouvez commander via WhatsApp sans cr\u00e9er de compte, mais vous manquerez le coupon de bienvenue.")
                    : "You can order via WhatsApp without an account, but you will miss the welcome coupon and order tracking."}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
