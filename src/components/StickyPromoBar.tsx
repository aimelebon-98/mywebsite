"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, Check } from "lucide-react";

const DISMISS_KEY = "sv_promo_dismissed";
const DISMISS_COUNT_KEY = "sv_promo_dismiss_count";
const SUBSCRIBED_KEY = "sv_promo_subscribed";
const BRAND_RED = "#CA3F2E";
const AVATAR_URL = "https://i.ibb.co/HTrQYdfK/Aime-komlan.jpg";

// Reappear schedule (in hours) - gets longer each dismissal so we don't annoy
const REAPPEAR_HOURS = [24, 72, 168]; // 1 day, 3 days, 7 days, then permanent

export default function StickyPromoBar() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const pathname = usePathname();
  const isFr = pathname?.startsWith("/fr");
  const isAdminRoute = pathname?.includes("/admin");

  const t = isFr
    ? {
        headline: "Obtenez 10% de reduction sur votre 1ere commande",
        subline: "+ conseils de style hebdomadaires. Zero spam.",
        placeholder: "Votre email",
        cta: "S'inscrire",
        success: "Merci !",
        error: "Erreur",
      }
    : {
        headline: "Get 10% off your first order",
        subline: "+ weekly style tips. Zero spam.",
        placeholder: "Your email",
        cta: "Subscribe",
        success: "Thanks!",
        error: "Error",
      };

  useEffect(() => {
    if (isAdminRoute) return;

    try {
      const subscribed = localStorage.getItem(SUBSCRIBED_KEY);
      if (subscribed) return;

      const dismissed = localStorage.getItem(DISMISS_KEY);
      const dismissCountStr = localStorage.getItem(DISMISS_COUNT_KEY);
      const dismissCount = dismissCountStr ? parseInt(dismissCountStr) : 0;

      if (dismissed) {
        const dismissedAt = parseInt(dismissed);
        // If they dismissed 3+ times, stop showing (respect them)
        if (dismissCount >= REAPPEAR_HOURS.length) return;
        const waitHours = REAPPEAR_HOURS[Math.min(dismissCount, REAPPEAR_HOURS.length - 1)];
        const waitMs = waitHours * 60 * 60 * 1000;
        if (Date.now() - dismissedAt < waitMs) return;
      }
    } catch { /* ignore */ }

    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, [isAdminRoute]);

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
      const currentCount = parseInt(localStorage.getItem(DISMISS_COUNT_KEY) || "0");
      localStorage.setItem(DISMISS_COUNT_KEY, String(currentCount + 1));
    } catch { /* ignore */ }
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
        setTimeout(() => setVisible(false), 2500);
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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 animate-slide-up px-3 w-full sm:w-auto max-w-[calc(100vw-1rem)]">
      <div className="bg-gray-900 text-white shadow-2xl rounded-2xl border border-gray-800 overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3">
          {/* Avatar */}
          <img
            src={AVATAR_URL}
            alt=""
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white/20 flex-shrink-0"
          />

          {/* Text */}
          <div className="min-w-0 flex-shrink">
            <div className="flex items-center gap-1.5">
              <span className="text-base leading-none" style={{ color: BRAND_RED }}>*</span>
              <p className="text-sm font-bold leading-tight whitespace-nowrap sm:whitespace-normal truncate sm:truncate-none">
                {t.headline}
              </p>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5 hidden sm:block">{t.subline}</p>
          </div>

          {/* Form */}
          {status === "success" ? (
            <div className="flex items-center gap-1.5 text-green-400 flex-shrink-0 pr-1">
              <Check className="w-4 h-4" />
              <span className="text-xs font-semibold">{t.success}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center gap-1.5 flex-shrink-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.placeholder}
                required
                disabled={status === "loading"}
                className="hidden md:block w-40 lg:w-52 px-3 py-2 bg-white text-gray-900 rounded-lg text-sm focus:outline-none placeholder-gray-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex items-center gap-1 px-3 sm:px-4 py-2 text-white rounded-lg text-xs sm:text-sm font-bold hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
                style={{ backgroundColor: BRAND_RED }}
              >
                {status === "loading" ? "..." : t.cta}
              </button>
            </form>
          )}

          {/* Close */}
          <button
            onClick={handleDismiss}
            aria-label="Close"
            className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition -mr-1"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        {/* Mobile-only email input */}
        {status === "idle" && (
          <form onSubmit={handleSubmit} className="md:hidden px-3 pb-3 -mt-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.placeholder}
              required
              className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg text-sm focus:outline-none placeholder-gray-400"
            />
          </form>
        )}
      </div>
    </div>
  );
}
