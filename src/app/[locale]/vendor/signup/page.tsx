"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function VendorSignupPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const isFr = locale === "fr";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isFr ? "Erreur lors de l'inscription" : "Signup failed"));
        return;
      }
      router.push("/" + locale + "/vendor/dashboard");
    } catch {
      setError(isFr ? "Erreur r\u00e9seau" : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href={"/" + locale} className="text-2xl font-bold text-white">
            New Deal <span style={{ color: "#CA3F2E" }}>Zone</span>
          </Link>
          <h1 className="text-xl font-semibold text-white mt-4">
            {isFr ? "Cr\u00e9er un compte vendeur" : "Create a Seller Account"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isFr ? "Rejoignez notre marketplace premium" : "Join our premium marketplace"}
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-300 text-sm">
              {error}
            </div>
          )}

          <SocialLoginButtons mode="register" role="vendor" theme="dark" />

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {isFr ? "Nom complet" : "Full Name"} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] transition"
                placeholder={isFr ? "Jean Dupont" : "John Doe"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {isFr ? "Email" : "Email"} *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {isFr ? "Mot de passe" : "Password"} *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#CA3F2E] transition"
                placeholder={isFr ? "Min. 6 caract\u00e8res" : "Min. 6 characters"}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold transition disabled:opacity-50"
              style={{ backgroundColor: "#CA3F2E" }}
            >
              {loading
                ? (isFr ? "Inscription..." : "Signing up...")
                : (isFr ? "Cr\u00e9er mon compte" : "Create My Account")}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          {isFr ? "D\u00e9j\u00e0 un compte ?" : "Already have an account?"}{" "}
          <Link href={"/" + locale + "/vendor/login"} className="text-[#CA3F2E] hover:underline">
            {isFr ? "Se connecter" : "Log in"}
          </Link>
        </p>
      </div>
    </div>
  );
}