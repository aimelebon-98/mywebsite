"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { trackEvent } from "@/components/AnalyticsTracker";
import Turnstile from "@/components/Turnstile";

const STORAGE_KEY = "solevault_exit_popup_shown";
const STORAGE_EXPIRES_DAYS = 7;
const DISCOUNT_CODE = "SAVE10";
const DISCOUNT_PERCENT = 10;

export default function ExitIntentPopup() {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [isFr, setIsFr] = useState(false);
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [formOpenTime] = useState(() => Date.now());
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [turnstileToken, setTurnstileToken] = useState("");

  useEffect(() => {
    setPortalTarget(document.body);
    const path = window.location.pathname;
    setIsFr(path.startsWith("/fr"));
  }, []);

  useEffect(() => {
    if (!portalTarget) return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const timestamp = parsed?.timestamp || 0;
        const expiresAt = timestamp + STORAGE_EXPIRES_DAYS * 24 * 60 * 60 * 1000;
        if (Date.now() < expiresAt) return;
      }
    } catch { /* ignore */ }

    let hasTriggered = false;
    const trigger = () => {
      if (hasTriggered) return;
      hasTriggered = true;
      setShow(true);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: Date.now() }));
      } catch { /* ignore */ }
      if (mouseLeaveHandler) document.removeEventListener("mouseleave", mouseLeaveHandler);
      if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };

    let mouseLeaveHandler: ((e: MouseEvent) => void) | null = null;
    let scrollHandler: (() => void) | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const initTimer = setTimeout(() => {
      mouseLeaveHandler = (e: MouseEvent) => {
        if (e.clientY <= 0) trigger();
      };

      let lastScroll = window.scrollY;
      let lastTime = Date.now();
      scrollHandler = () => {
        const now = Date.now();
        const scrollY = window.scrollY;
        const timeDiff = now - lastTime;
        const scrollDiff = lastScroll - scrollY;
        if (scrollDiff > 500 && timeDiff < 300 && lastScroll > 800) trigger();
        lastScroll = scrollY;
        lastTime = now;
      };

      fallbackTimer = setTimeout(() => trigger(), 60000);

      document.addEventListener("mouseleave", mouseLeaveHandler);
      window.addEventListener("scroll", scrollHandler, { passive: true });
    }, 3000);

    return () => {
      clearTimeout(initTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (mouseLeaveHandler) document.removeEventListener("mouseleave", mouseLeaveHandler);
      if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
    };
  }, [portalTarget]);

  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, [show]);

  const handleClose = () => {
    setShow(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: Date.now(), dismissed: true }));
    } catch { /* ignore */ }
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
        body: JSON.stringify({ email: email.trim(), honeypot: "", timestamp: formOpenTime, turnstileToken }),
      });
      try { trackEvent({ eventType: "newsletter_signup", metadata: { source: "exit_intent" } }); } catch {}
      setSubscribed(true);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: Date.now(), dismissed: true }));
      } catch { /* ignore */ }
      setTimeout(handleCopy, 300);
    } catch { /* ignore */ }
    setSubscribing(false);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  if (!portalTarget) return null;
  if (!show) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 exit-fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full exit-slide-up"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white transition shadow-md"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="relative overflow-hidden px-8 pt-10 pb-6 text-center" style={{ background: "linear-gradient(135deg, #CA3F2E 0%, #8B2A1E 100%)" }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white rounded-full blur-3xl opacity-20 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white rounded-full blur-2xl opacity-10 pointer-events-none" />

          {timeLeft > 0 && (
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur rounded-full text-white text-[10px] font-bold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
          )}

          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 backdrop-blur rounded-2xl mb-4 exit-bounce-slow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white">
                <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur rounded-full text-white text-[10px] font-bold uppercase tracking-widest mb-3">
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
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isFr ? "votre@email.com" : "your@email.com"}
                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#CA3F2E] transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subscribing || !email.trim()}
                  className="w-full py-3.5 bg-gray-900 hover:bg-[#CA3F2E] text-white rounded-xl text-sm font-bold transition disabled:opacity-50"
                >
                  {subscribing
                    ? (isFr ? "Envoi..." : "Sending...")
                    : (isFr ? "Obtenir mon code" : "Get my code")}
                </button>
                <div className="hidden">
                  <Turnstile
                    mode="auto"
                    action="exit-intent-newsletter"
                    onVerify={(tok) => setTurnstileToken(tok)}
                    onError={() => setTurnstileToken("")}
                  />
                </div>
              </form>
            </>
          ) : (
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold mb-3">
                {isFr ? "Inscrit avec succes !" : "Successfully subscribed!"}
              </div>
              <div className="text-2xl font-black text-[#CA3F2E] tracking-widest my-2">
                {DISCOUNT_CODE}
              </div>
              <button
                onClick={handleCopy}
                className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold transition mt-3"
              >
                {copied ? (isFr ? "Copie !" : "Copied!") : (isFr ? "Copier le code" : "Copy code")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, portalTarget);
}