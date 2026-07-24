"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, Send, Check } from "lucide-react";

const DISMISS_KEY = "sv_promo_dismissed";
const SUBSCRIBED_KEY = "sv_promo_subscribed";
const BRAND_RED = "#CA3F2E";
const AVATAR_URL = "https://i.ibb.co/HTrQYdfK/Aime-komlan.jpg";

export default function StickyPromoBar() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const pathname = usePathname();
  const isFr = pathname?.startsWith("/fr");

  const t = isFr
    ? {
        headline: "Obtenez 10% de reduction sur votre premiere commande",
        subline: "+ conseils de style hebdomadaires. Zero spam.",
        placeholder: "Votre email",
        cta: "S'INSCRIRE",
        success: "Merci ! Verifiez votre boite mail.",
        error: "Erreur. Reessayez.",
      }
    : {
        headline: "Get 10% off your first order",
        subline: "+ weekly style tips. Zero spam.",
        placeholder: "Your email",
        cta: "SUBSCRIBE",
        success: "Thanks! Check your inbox.",
        error: "Something went wrong. Try again.",
      };

  // Hide on admin routes entirely
  const isAdminRoute = pathname?.includes("/admin");

  useEffect(() => {
    if (isAdminRoute) return;

    // Check dismissal/subscription state
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      const subscribed = localStorage.getItem(SUBSCRIBED_KEY);
      if (subscribed) return;
      if (dismissed) {
        const dismissedAt = parseInt(dismissed);
        // Reappear after 7 days
        if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
      }
    } catch { /* ignore */ }

    // Appear after 5 seconds
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, [isAdminRoute]);

  const handleDismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, Date.now().toString()); } catch { /* ignore */ }
    setVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        try { localStorage.setItem(SUBSCRIBED_KEY, "1"); } catch { /* ignore */ }
        setTimeout(() => setVisible(false), 3000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  if (isAdminRoute || !visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 animate-slide-up">
      <div className="bg-gray-900 text-white shadow-2xl border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Avatar (hidden on very small mobile) */}
            <div className="hidden sm:block relative flex-shrink-0">
              <img
                src={AVATAR_URL}
                alt="Aime Komlon"
                className="w-14 h-14 lg:w-16 lg:h-16 rounded-full object-cover border-2 border-white/20"
              />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg" style={{ color: BRAND_RED }}>*</span>
                <p className="text-sm sm:text-base font-bold leading-tight">{t.headline}</p>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 mt-0.5 hidden sm:block">{t.subline}</p>
            </div>

            {/* Form or Success */}
            {status === "success" ? (
              <div className="flex items-center gap-2 text-green-400 flex-shrink-0">
                <Check className="w-5 h-5" />
                <span className="text-sm font-semibold hidden sm:inline">{t.success}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-shrink-0">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.placeholder}
                  required
                  disabled={status === "loading"}
                  className="hidden sm:block w-48 lg:w-64 px-4 py-2.5 bg-white text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/40 placeholder-gray-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-white rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wide hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
                  style={{ backgroundColor: BRAND_RED }}
                >
                  {status === "loading" ? "..." : (
                    <>
                      <span className="hidden sm:inline">{t.cta}</span>
                      <Send className="w-4 h-4 sm:hidden" />
                      <span className="hidden sm:inline">
                        <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Close button */}
            <button
              onClick={handleDismiss}
              aria-label="Close"
              className="flex-shrink-0 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {status === "error" && (
            <p className="text-xs text-red-400 mt-2 text-center sm:text-left sm:ml-24">{t.error}</p>
          )}

          {/* Mobile-only email input (below the row when small screen) */}
          {status !== "success" && (
            <form onSubmit={handleSubmit} className="sm:hidden mt-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.placeholder}
                required
                disabled={status === "loading"}
                className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg text-sm focus:outline-none placeholder-gray-500 disabled:opacity-50"
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
