"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const CONSENT_KEY = "sv_cookie_consent";
const CONSENT_VERSION = "1";

type Consent = {
  version: string;
  timestamp: number;
};

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();
  const isFr = pathname?.startsWith("/fr");

  const t = isFr
    ? {
        title: "Ce site utilise des cookies",
        desc: "Ce site utilise des cookies pour ameliorer l'experience utilisateur.",
        readMore: "En savoir plus",
        gotIt: "J'AI COMPRIS",
      }
    : {
        title: "This website uses cookies",
        desc: "This website uses cookies to improve user experience.",
        readMore: "Read more",
        gotIt: "I GOT IT",
      };

  useEffect(() => {
    let cancelled = false;
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Consent;
        if (parsed.version === CONSENT_VERSION) return;
      }
    } catch { /* ignore */ }

    const t = setTimeout(() => {
      if (!cancelled) setShow(true);
    }, 30000);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  const accept = () => {
    const consent: Consent = {
      version: CONSENT_VERSION,
      timestamp: Date.now(),
    };
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(consent)); } catch { /* ignore */ }
    setShow(false);
    window.dispatchEvent(new CustomEvent("cookieConsentUpdated", { detail: consent }));
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[60] animate-slide-up max-w-xs w-[calc(100vw-2rem)] sm:w-80">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <Cookie className="w-4 h-4 text-gray-400" />
          <button
            onClick={accept}
            aria-label="Close"
            className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="px-4 pb-4">
          <h3 className="font-bold text-base mb-1.5">{t.title}</h3>
          <p className="text-xs text-gray-300 leading-relaxed mb-3">
            {t.desc}{" "}
            <Link href="/privacy" className="underline hover:text-white">
              {t.readMore}
            </Link>
          </p>

          <button
            onClick={accept}
            className="w-full px-3 py-2.5 bg-white text-gray-900 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-gray-100 transition"
          >
            {t.gotIt}
          </button>
        </div>
      </div>
    </div>
  );
}
