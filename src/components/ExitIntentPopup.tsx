"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { X, Copy, Check, Gift, Sparkles, Mail, Clock } from "lucide-react";

const STORAGE_KEY = "solevault_exit_popup_shown";
const STORAGE_EXPIRES_DAYS = 7; // Show again after 7 days
const DISCOUNT_CODE = "SAVE10";
const DISCOUNT_PERCENT = 10;

export default function ExitIntentPopup() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 min countdown

  // Check if already shown
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { timestamp } = JSON.parse(stored);
        const expiresAt = timestamp + STORAGE_EXPIRES_DAYS * 24 * 60 * 60 * 1000;
        if (Date.now() < expiresAt) return; // Already shown recently
      }
    } catch { /* ignore */ }

    // Small delay so it doesn't trigger on very first mouse move
    const initTimer = setTimeout(() => {
      // DESKTOP: mouse leaving toward top (browser tabs)
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) trigger();
      };

      // MOBILE: fast scroll up (indicates leaving intent)
      let lastScroll = window.scrollY;
      let lastTime = Date.now();
      const handleScroll = () => {
        const now = Date.now();
        const scrollY = window.scrollY;
        const timeDiff = now - lastTime;
        const scrollDiff = lastScroll - scrollY;
        // Fast upward scroll (>500px in 300ms) AND user has scrolled at least 800px down
        if (scrollDiff > 500 && timeDiff < 300 && lastScroll > 800) {
          trigger();
        }
        lastScroll = scrollY;
        lastTime = now;
      };

      // FALLBACK: After 60 seconds on page
      const fallbackTimer = setTimeout(() => trigger(), 60000);

      document.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        document.removeEventListener("mouseleave", handleMouseLeave);
        window.removeEventListener("scroll", handleScroll);
        clearTimeout(fallbackTimer);
      };
    }, 3000); // Wait 3s after page load

    return () => clearTimeout(initTimer);
  }, []);

  const trigger = () => {
    setShow(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: Date.now() }));
    } catch { /* ignore */ }
  };

  // Countdown timer
  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [show]);

  const handleClose = () => {
    setShow(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(DISCOUNT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* ignore */ }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || subscribing) return;
    setSubscribing(true);
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setSubscribed(true);
      setTimeout(handleCopy, 300);
    } catch { /* ignore */ }
    setSubscribing(false);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full animate-slide-up"
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white transition shadow-md"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Gradient header with decorative shapes */}
        <div className="relative overflow-hidden px-8 pt-10 pb-6 text-center" style={{ background: "linear-gradient(135deg, #CA3F2E 0%, #8B2A1E 100%)" }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white rounded-full blur-3xl opacity-20 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white rounded-full blur-2xl opacity-10 pointer-events-none" />

          {/* Countdown badge */}
          {timeLeft > 0 && (
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur rounded-full text-white text-[10px] font-bold">
              <Clock className="w-3 h-3" />
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
          )}

          <div className="relative">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 backdrop-blur rounded-2xl mb-4 animate-bounce-slow">
              <Gift className="w-8 h-8 text-white" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-white text-[10px] font-bold uppercase tracking-widest mb-3">
              <Sparkles className="w-3 h-3" />
              {isFr ? "Offre exclusive" : "Exclusive offer"}
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
              {isFr ? "Attendez !" : "Wait!"}
            </h2>
            <p className="text-white/90 text-sm">
              {isFr ? "Ne partez pas les mains vides" : "Don't leave empty-handed"}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="text-5xl sm:text-6xl font-black text-gray-900 mb-1">
              -{DISCOUNT_PERCENT}<span className="text-3xl">%</span>
            </div>
            <p className="text-sm text-gray-600">
              {isFr ? "sur votre premiere commande" : "off your first order"}
            </p>
          </div>

          {!subscribed ? (
            <>
              <p className="text-center text-gray-600 text-sm mb-5 leading-relaxed">
                {isFr
                  ? "Entrez votre email pour recevoir votre code de reduction et nos meilleures offres."
                  : "Enter your email to get your discount code and our best deals."}
              </p>

              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isFr ? "votre@email.com" : "your@email.com"}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#CA3F2E] transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subscribing || !email.trim()}
                  className="w-full py-3.5 bg-gray-900 hover:bg-[#CA3F2E] text-white rounded-xl text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subscribing
                    ? (isFr ? "Envoi..." : "Sending...")
                    : (isFr ? "Obtenir mon code" : "Get my code")}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold mb-3">
                  <Check className="w-3.5 h-3.5" />
                  {isFr ? "Inscrit avec succes !" : "Successfully subscribed!"}
                </div>
                <p className="text-sm text-gray-600">
                  {isFr ? "Utilisez ce code au checkout via WhatsApp :" : "Use this code at WhatsApp checkout:"}
                </p>
              </div>

              {/* Discount code display */}
              <div className="relative bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-[#CA3F2E] rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-2xl font-black text-[#CA3F2E] tracking-widest">
                    {DISCOUNT_CODE}
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                      copied
                        ? "bg-green-500 text-white"
                        : "bg-gray-900 hover:bg-[#CA3F2E] text-white"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        {isFr ? "Copie !" : "Copied!"}
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        {isFr ? "Copier" : "Copy"}
                      </>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl text-sm font-bold transition"
              >
                {isFr ? "Continuer mes achats" : "Continue shopping"}
              </button>
            </>
          )}

          {/* Terms */}
          <p className="text-center text-[10px] text-gray-400 mt-4 leading-relaxed">
            {isFr
              ? "Valable pour les nouvelles commandes. Une utilisation par client. Pas cumulable avec d'autres offres."
              : "Valid for new orders. One use per customer. Cannot be combined with other offers."}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
