"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, Check, Send } from "lucide-react";

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
        badge: "OFFRE SPECIALE",
        headline: "Obtenez 10% de reduction sur votre premiere commande",
        subline: "Rejoignez notre communaute et recevez des conseils de style hebdomadaires, en avant-premiere.",
        placeholder: "Votre adresse email",
        cta: "S'INSCRIRE",
        skip: "Non merci",
        success: "Merci !",
        successDesc: "Verifiez votre boite mail pour votre code de reduction.",
        privacy: "Nous respectons votre vie privee. Zero spam.",
      }
    : {
        badge: "SPECIAL OFFER",
        headline: "Get 10% off your first order",
        subline: "Join our community and get weekly style tips, plus early access to new drops.",
        placeholder: "Your email address",
        cta: "SUBSCRIBE",
        skip: "No thanks",
        success: "Thanks!",
        successDesc: "Check your inbox for your discount code.",
        privacy: "We respect your privacy. Zero spam.",
      };

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
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [allowed, visible]);

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
      const currentCount = parseInt(localStorage.getItem(DISMISS_COUNT_KEY) || "0");
      localStorage.setItem(DISMISS_COUNT_KEY, String(currentCount + 1));
    } catch { /* ignore */ }
    setVisible(false);
    setAllowed(false); // prevent scroll listener from re-showing it during same session
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
        setAllowed(false); // stop scroll listener
        setTimeout(() => setVisible(false), 3500);
      } else {
        setStatus("idle");
      }
    } catch {
      setStatus("idle");
    }
  };

  if (isAdminRoute || !visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Modal card - portrait format */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Top image section (red gradient background) */}
        <div
          className="relative pt-10 pb-6 px-6 text-center"
          style={{ background: `linear-gradient(135deg, ${BRAND_RED} 0%, #8B2A1E 100%)` }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-widest text-white mb-4">
            {t.badge}
          </div>

          {/* Avatar */}
          <div className="flex justify-center mb-2">
            <img
              src={AVATAR_URL}
              alt=""
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
              style={{ objectPosition: "top center" }}
            />
          </div>
        </div>

        {/* Content section */}
        <div className="px-6 pt-5 pb-6 text-center">
          {status === "success" ? (
            <div className="py-4">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-1">{t.success}</h3>
              <p className="text-sm text-gray-600">{t.successDesc}</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold leading-tight mb-2 text-gray-900">
                {t.headline}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                {t.subline}
              </p>

              <form onSubmit={handleSubmit} className="space-y-2.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.placeholder}
                  required
                  disabled={status === "loading"}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-400 disabled:opacity-50 transition"
                  style={{ boxShadow: "none" }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${BRAND_RED}30`)}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
                <button
                  type="submit"
                  disabled={status === "loading" || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:brightness-110 transition disabled:opacity-50 shadow-lg"
                  style={{
                    backgroundColor: BRAND_RED,
                    boxShadow: `0 4px 14px ${BRAND_RED}66`,
                  }}
                >
                  {status === "loading" ? (
                    "..."
                  ) : (
                    <>
                      {t.cta}
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <button
                onClick={handleDismiss}
                className="mt-3 text-xs text-gray-500 hover:text-gray-900 hover:underline transition"
              >
                {t.skip}
              </button>

              <p className="text-[10px] text-gray-400 mt-4 leading-relaxed">
                {t.privacy}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
