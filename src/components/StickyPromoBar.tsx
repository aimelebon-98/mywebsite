"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, Check } from "lucide-react";

const DISMISS_KEY = "sv_promo_dismissed";
const DISMISS_COUNT_KEY = "sv_promo_dismiss_count";
const SUBSCRIBED_KEY = "sv_promo_subscribed";
const BRAND_RED = "#CA3F2E";
const AVATAR_URL = "https://i.ibb.co/HTrQYdfK/Aime-komlan.jpg";

const REAPPEAR_HOURS = [24, 72, 168];

export default function StickyPromoBar() {
  const [visible, setVisible] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const pathname = usePathname();
  const isFr = pathname?.startsWith("/fr");
  const isAdminRoute = pathname?.includes("/admin");

  const t = isFr
    ? {
        headline: "Obtenez 10% de reduction sur votre 1ere commande",
        placeholder: "Votre email",
        cta: "S'inscrire",
        success: "Merci !",
      }
    : {
        headline: "Get 10% off your first order",
        placeholder: "Your email",
        cta: "Subscribe",
        success: "Thanks!",
      };

  // Check if user is allowed to see it (respects dismiss/subscribe)
  useEffect(() => {
    if (isAdminRoute) return;

    try {
      const subscribed = localStorage.getItem(SUBSCRIBED_KEY);
      if (subscribed) return;

      const dismissed = localStorage.getItem(DISMISS_KEY);
      const dismissCount = parseInt(localStorage.getItem(DISMISS_COUNT_KEY) || "0");

      if (dismissed) {
        if (dismissCount >= REAPPEAR_HOURS.length) return;
        const waitHours = REAPPEAR_HOURS[Math.min(dismissCount, REAPPEAR_HOURS.length - 1)];
        const waitMs = waitHours * 60 * 60 * 1000;
        if (Date.now() - parseInt(dismissed) < waitMs) return;
      }
    } catch { /* ignore */ }

    setAllowed(true);
  }, [isAdminRoute]);

  // Show when user scrolls past 70% of page
  useEffect(() => {
    if (!allowed || visible) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const scrollPct = (scrollTop / docHeight) * 100;
      if (scrollPct >= 70) {
        setVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // check on mount in case already scrolled
    return () => window.removeEventListener("scroll", handleScroll);
  }, [allowed, visible]);

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
        setStatus("idle");
      }
    } catch {
      setStatus("idle");
    }
  };

  if (isAdminRoute || !visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 animate-slide-up max-w-[calc(100vw-2rem)]">
      <div className="bg-gray-900 text-white shadow-2xl rounded-2xl border border-gray-800 overflow-hidden">
        <div className="flex items-center gap-3 px-3 py-2.5">
          {/* Avatar (inline, no pop-out) */}
          <img
            src={AVATAR_URL}
            alt=""
            className="w-10 h-10 rounded-full object-cover border-2 border-white/20 flex-shrink-0"
            style={{ objectPosition: "top center" }}
          />

          {/* Text */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base leading-none" style={{ color: BRAND_RED }}>*</span>
              <p className="text-sm font-bold leading-tight">{t.headline}</p>
            </div>
          </div>

          {/* Form / Success */}
          {status === "success" ? (
            <div className="flex items-center gap-1.5 text-green-400 flex-shrink-0">
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
                className="hidden md:block w-40 lg:w-48 px-3 py-1.5 bg-white text-gray-900 rounded-lg text-sm focus:outline-none placeholder-gray-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-3 py-1.5 text-white rounded-lg text-xs font-bold hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
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
            className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        {/* Mobile email input */}
        {status === "idle" && (
          <form onSubmit={handleSubmit} className="md:hidden px-3 pb-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.placeholder}
              required
              className="w-full px-3 py-1.5 bg-white text-gray-900 rounded-lg text-sm focus:outline-none placeholder-gray-400"
            />
          </form>
        )}
      </div>
    </div>
  );
}
