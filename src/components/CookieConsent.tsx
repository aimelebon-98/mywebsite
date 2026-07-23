"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Cookie, X, Settings } from "lucide-react";

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
        title: "Nous utilisons des cookies",
        desc: "Nous utilisons des cookies pour ameliorer votre experience, analyser le trafic et personnaliser le contenu. Vous pouvez accepter tous les cookies ou personnaliser vos choix.",
        acceptAll: "Tout accepter",
        rejectAll: "Refuser",
        customize: "Personnaliser",
        savePrefs: "Enregistrer",
        settings: "Preferences de cookies",
        necessary: "Necessaires",
        necessaryDesc: "Requis pour le fonctionnement du site. Ne peuvent pas etre desactives.",
        analytics: "Analytiques",
        analyticsDesc: "Nous aident a comprendre comment les visiteurs utilisent le site.",
        marketing: "Marketing",
        marketingDesc: "Utilises pour afficher des publicites pertinentes.",
        learnMore: "En savoir plus",
        privacy: "Politique de confidentialite",
      }
    : {
        title: "We use cookies",
        desc: "We use cookies to improve your experience, analyze traffic, and personalize content. You can accept all cookies or customize your choices.",
        acceptAll: "Accept all",
        rejectAll: "Reject",
        customize: "Customize",
        savePrefs: "Save preferences",
        settings: "Cookie preferences",
        necessary: "Necessary",
        necessaryDesc: "Required for the site to function. Cannot be disabled.",
        analytics: "Analytics",
        analyticsDesc: "Help us understand how visitors use the site.",
        marketing: "Marketing",
        marketingDesc: "Used to show you relevant advertising.",
        learnMore: "Learn more",
        privacy: "Privacy Policy",
      };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) {
        // Show after 1.5s for less intrusion
        setTimeout(() => setShow(true), 1500);
        return;
      }
      const parsed = JSON.parse(stored) as Consent;
      if (parsed.version !== CONSENT_VERSION) {
        setTimeout(() => setShow(true), 1500);
      }
    } catch {
      setTimeout(() => setShow(true), 1500);
    }
  }, []);

  const saveConsent = (a: boolean, m: boolean) => {
    const consent: Consent = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: a,
      marketing: m,
      timestamp: Date.now(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setShow(false);
    setShowSettings(false);

    // Dispatch event so analytics scripts can react
    window.dispatchEvent(new CustomEvent("cookieConsentUpdated", { detail: consent }));
  };

  const acceptAll = () => saveConsent(true, true);
  const rejectAll = () => saveConsent(false, false);
  const savePrefs = () => saveConsent(analytics, marketing);

  if (!show) return null;

  return (
    <>
      {/* Backdrop for settings modal */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/50 z-[70] animate-fade-in"
          onClick={() => setShowSettings(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[71] flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-slide-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-700" />
                <h2 className="font-bold text-lg">{t.settings}</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Necessary */}
              <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <div className="font-semibold text-sm">{t.necessary}</div>
                  <div className="text-xs text-gray-500 mt-1">{t.necessaryDesc}</div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-11 h-6 bg-gray-900 rounded-full relative opacity-60">
                    <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Analytics */}
              <label className="flex items-start justify-between gap-4 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                <div className="flex-1">
                  <div className="font-semibold text-sm">{t.analytics}</div>
                  <div className="text-xs text-gray-500 mt-1">{t.analyticsDesc}</div>
                </div>
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full relative peer-checked:bg-gray-900 transition">
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${analytics ? "right-0.5" : "left-0.5"}`}></div>
                  </div>
                </div>
              </label>

              {/* Marketing */}
              <label className="flex items-start justify-between gap-4 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                <div className="flex-1">
                  <div className="font-semibold text-sm">{t.marketing}</div>
                  <div className="text-xs text-gray-500 mt-1">{t.marketingDesc}</div>
                </div>
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full relative peer-checked:bg-gray-900 transition">
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${marketing ? "right-0.5" : "left-0.5"}`}></div>
                  </div>
                </div>
              </label>
            </div>

            <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
              <button
                onClick={rejectAll}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
              >
                {t.rejectAll}
              </button>
              <button
                onClick={savePrefs}
                className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
              >
                {t.savePrefs}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Banner */}
      {!showSettings && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] p-3 sm:p-4 animate-slide-up">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{t.title}</div>
                  <div className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                    {t.desc}{" "}
                    <Link href="/privacy" className="underline hover:text-gray-900">
                      {t.learnMore}
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex-1 md:flex-none px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  {t.customize}
                </button>
                <button
                  onClick={rejectAll}
                  className="flex-1 md:flex-none px-4 py-2 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {t.rejectAll}
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 md:flex-none px-5 py-2 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                >
                  {t.acceptAll}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
