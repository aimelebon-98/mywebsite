"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Globe, X, Settings } from "lucide-react";

const CONSENT_KEY = "sv_cookie_consent";
const CONSENT_VERSION = "1";

type Consent = {
  version: string;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
};

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);
  const pathname = usePathname();
  const isFr = pathname?.startsWith("/fr");

  const t = isFr
    ? {
        title: "Ce site utilise des cookies",
        desc: "Ce site utilise des cookies pour ameliorer l'experience utilisateur.",
        readMore: "En savoir plus",
        acceptAll: "TOUT ACCEPTER",
        rejectAll: "TOUT REFUSER",
        showDetails: "PARAMETRES",
        savePrefs: "ENREGISTRER",
        settings: "Preferences de cookies",
        necessary: "Necessaires",
        necessaryDesc: "Requis pour le fonctionnement du site.",
        analytics: "Analytiques",
        analyticsDesc: "Nous aident a comprendre l'utilisation.",
        marketing: "Marketing",
        marketingDesc: "Pour afficher des publicites pertinentes.",
      }
    : {
        title: "This website uses cookies",
        desc: "This website uses cookies to improve user experience.",
        readMore: "Read more",
        acceptAll: "ACCEPT ALL",
        rejectAll: "DECLINE ALL",
        showDetails: "SHOW DETAILS",
        savePrefs: "SAVE",
        settings: "Cookie preferences",
        necessary: "Necessary",
        necessaryDesc: "Required for the site to function.",
        analytics: "Analytics",
        analyticsDesc: "Help us understand how visitors use the site.",
        marketing: "Marketing",
        marketingDesc: "Used to show relevant ads.",
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
    }, 30000); // 30 seconds
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  const saveConsent = (a: boolean, m: boolean) => {
    const consent: Consent = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: a,
      marketing: m,
      timestamp: Date.now(),
    };
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(consent)); } catch { /* ignore */ }
    setShow(false);
    setShowSettings(false);
    window.dispatchEvent(new CustomEvent("cookieConsentUpdated", { detail: consent }));
  };

  const acceptAll = () => saveConsent(true, true);
  const rejectAll = () => saveConsent(false, false);
  const savePrefs = () => saveConsent(analytics, marketing);

  if (!show) return null;

  return (
    <>
      {/* Settings modal */}
      {showSettings && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[70] animate-fade-in"
            onClick={() => setShowSettings(false)}
          />
          <div className="fixed inset-0 z-[71] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto animate-slide-in max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-700" />
                  <h2 className="font-bold text-lg">{t.settings}</h2>
                </div>
                <button onClick={() => setShowSettings(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{t.necessary}</div>
                    <div className="text-xs text-gray-500 mt-1">{t.necessaryDesc}</div>
                  </div>
                  <div className="w-11 h-6 bg-gray-900 rounded-full relative opacity-60 flex-shrink-0">
                    <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full"></div>
                  </div>
                </div>

                <label className="flex items-start justify-between gap-4 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{t.analytics}</div>
                    <div className="text-xs text-gray-500 mt-1">{t.analyticsDesc}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 rounded-full relative peer-checked:bg-gray-900 transition">
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${analytics ? "right-0.5" : "left-0.5"}`}></div>
                    </div>
                  </div>
                </label>

                <label className="flex items-start justify-between gap-4 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{t.marketing}</div>
                    <div className="text-xs text-gray-500 mt-1">{t.marketingDesc}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 rounded-full relative peer-checked:bg-gray-900 transition">
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${marketing ? "right-0.5" : "left-0.5"}`}></div>
                    </div>
                  </div>
                </label>
              </div>

              <div className="p-5 border-t border-gray-100 flex gap-2">
                <button onClick={rejectAll} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                  {t.rejectAll}
                </button>
                <button onClick={savePrefs} className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
                  {t.savePrefs}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Compact bottom-left card (main banner) */}
      {!showSettings && (
        <div className="fixed bottom-4 left-4 z-[60] animate-slide-up max-w-xs w-[calc(100vw-2rem)] sm:w-80">
          <div className="bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
            {/* Header row with globe and close */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <Globe className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => saveConsent(false, false)}
                aria-label="Close"
                className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
              <h3 className="font-bold text-base mb-1.5">{t.title}</h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-3">
                {t.desc}{" "}
                <Link href="/privacy" className="underline hover:text-white">
                  {t.readMore}
                </Link>
              </p>

              {/* Accept / Decline buttons */}
              <div className="flex gap-2 mb-2">
                <button
                  onClick={acceptAll}
                  className="flex-1 px-3 py-2 bg-white text-gray-900 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-gray-100 transition"
                >
                  {t.acceptAll}
                </button>
                <button
                  onClick={rejectAll}
                  className="flex-1 px-3 py-2 border border-white/30 text-white rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-white/10 transition"
                >
                  {t.rejectAll}
                </button>
              </div>

              {/* Show details link */}
              <button
                onClick={() => setShowSettings(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 hover:text-white transition"
              >
                <Settings className="w-3 h-3" />
                {t.showDetails}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
