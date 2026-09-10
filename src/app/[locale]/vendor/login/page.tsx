"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, Store, LogIn, UserPlus } from "lucide-react";

const BRAND = "#CA3F2E";
const BRAND_DARK = "#8B2A1E";

export default function VendorLoginPage() {
  const { locale } = useParams();
  const router = useRouter();
  const isFr = locale === "fr";
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [login, setLogin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({ email: "", password: "", confirm: "", name: "" });

  const t = {
    title: "New Deal Zone",
    subtitle: isFr ? "Portail Vendeur" : "Vendor Portal",
    loginTab: isFr ? "Connexion" : "Login",
    signupTab: isFr ? "Inscription" : "Sign Up",
    email: "Email",
    password: isFr ? "Mot de passe" : "Password",
    confirmPassword: isFr ? "Confirmer le mot de passe" : "Confirm Password",
    name: isFr ? "Nom complet" : "Full Name",
    loginBtn: isFr ? "Se connecter" : "Log In",
    signupBtn: isFr ? "Cr\u00e9er mon compte" : "Create Account",
    noAccount: isFr ? "Pas encore de compte ?" : "No account yet?",
    hasAccount: isFr ? "D\u00e9j\u00e0 inscrit ?" : "Already have an account?",
    signUpLink: isFr ? "Inscrivez-vous" : "Sign up",
    logInLink: isFr ? "Connectez-vous" : "Log in",
    pwMismatch: isFr ? "Les mots de passe ne correspondent pas" : "Passwords do not match",
    pwShort: isFr ? "Le mot de passe doit contenir au moins 8 caract\u00e8res" : "Password must be at least 8 characters",
    tagline: isFr
      ? "Vendez vos chaussures premium \u00e0 des milliers de clients \u00e0 travers l'Afrique."
      : "Sell your premium footwear to thousands of customers across Africa.",
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/vendor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      if (data.mustChangePassword) {
        router.push(`/${locale}/vendor/change-password`);
      } else {
        router.push(`/${locale}/vendor/dashboard`);
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (signup.password !== signup.confirm) {
      setError(t.pwMismatch);
      return;
    }
    if (signup.password.length < 8) {
      setError(t.pwShort);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signup.email,
          password: signup.password,
          contactName: signup.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      router.push(`/${locale}/vendor/dashboard?setup=1`);
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: BRAND }}
          >
            <Store size={28} color="#fff" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-sm text-gray-500">{t.subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition"
              style={{
                color: mode === "login" ? BRAND : "#9ca3af",
                borderBottom: mode === "login" ? `2px solid ${BRAND}` : "2px solid transparent",
              }}
            >
              <LogIn size={16} /> {t.loginTab}
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition"
              style={{
                color: mode === "signup" ? BRAND : "#9ca3af",
                borderBottom: mode === "signup" ? `2px solid ${BRAND}` : "2px solid transparent",
              }}
            >
              <UserPlus size={16} /> {t.signupTab}
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
                  <input
                    type="email"
                    required
                    className={inputCls}
                    value={login.email}
                    onChange={(e) => setLogin((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      className={inputCls + " pr-10"}
                      value={login.password}
                      onChange={(e) => setLogin((p) => ({ ...p, password: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white font-medium text-sm transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: BRAND }}
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {t.loginBtn}
                </button>
                <p className="text-center text-xs text-gray-500">
                  {t.noAccount}{" "}
                  <button type="button" onClick={() => setMode("signup")} className="font-medium" style={{ color: BRAND }}>
                    {t.signUpLink}
                  </button>
                </p>
              </form>
            )}

            {/* SIGNUP FORM */}
            {mode === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.name}</label>
                  <input
                    type="text"
                    required
                    className={inputCls}
                    value={signup.name}
                    onChange={(e) => setSignup((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
                  <input
                    type="email"
                    required
                    className={inputCls}
                    value={signup.email}
                    onChange={(e) => setSignup((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className={inputCls}
                    value={signup.password}
                    onChange={(e) => setSignup((p) => ({ ...p, password: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.confirmPassword}</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className={inputCls}
                    value={signup.confirm}
                    onChange={(e) => setSignup((p) => ({ ...p, confirm: e.target.value }))}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white font-medium text-sm transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: BRAND }}
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {t.signupBtn}
                </button>
                <p className="text-center text-xs text-gray-500">
                  {t.hasAccount}{" "}
                  <button type="button" onClick={() => setMode("login")} className="font-medium" style={{ color: BRAND }}>
                    {t.logInLink}
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">{t.tagline}</p>
      </div>
    </div>
  );
}
