"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { useLocale } from "next-intl";

interface Props {
  compact?: boolean;
  className?: string;
  dark?: boolean;
}

// SVG flag components
function Flag({ code, xofCountry, size = 20 }: { code: CurrencyCode; xofCountry?: string; size?: number }) {
  const h = Math.round(size * 0.7);
  const props = { width: size, height: h, className: "rounded-sm flex-shrink-0", xmlns: "http://www.w3.org/2000/svg" };

  // Special case: XOF uses visitor's country flag
  if (code === "XOF" && xofCountry) {
    return <XofFlag country={xofCountry} svgProps={props} />;
  }

  switch (code) {
    case "USD":
      return (
        <svg {...props} viewBox="0 0 60 42">
          <rect width="60" height="42" fill="#B22234" />
          <rect y="3.23" width="60" height="3.23" fill="#fff" />
          <rect y="9.69" width="60" height="3.23" fill="#fff" />
          <rect y="16.15" width="60" height="3.23" fill="#fff" />
          <rect y="22.62" width="60" height="3.23" fill="#fff" />
          <rect y="29.08" width="60" height="3.23" fill="#fff" />
          <rect y="35.54" width="60" height="3.23" fill="#fff" />
          <rect width="24" height="22.62" fill="#3C3B6E" />
        </svg>
      );
    case "EUR":
      return (
        <svg {...props} viewBox="0 0 60 42">
          <rect width="60" height="42" fill="#003399" />
          <g fill="#FFCC00">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const cx = 30 + 12 * Math.cos(angle);
              const cy = 21 + 12 * Math.sin(angle);
              return <circle key={i} cx={cx} cy={cy} r="1.6" />;
            })}
          </g>
        </svg>
      );
    case "GBP":
      return (
        <svg {...props} viewBox="0 0 60 42">
          <rect width="60" height="42" fill="#012169" />
          <path d="M0 0 L60 42 M60 0 L0 42" stroke="#fff" strokeWidth="6" />
          <path d="M0 0 L60 42 M60 0 L0 42" stroke="#C8102E" strokeWidth="3" />
          <rect x="25" width="10" height="42" fill="#fff" />
          <rect y="16" width="60" height="10" fill="#fff" />
          <rect x="27" width="6" height="42" fill="#C8102E" />
          <rect y="18" width="60" height="6" fill="#C8102E" />
        </svg>
      );
    case "NGN":
      return (
        <svg {...props} viewBox="0 0 3 2">
          <rect width="1" height="2" x="0" fill="#008751" />
          <rect width="1" height="2" x="1" fill="#fff" />
          <rect width="1" height="2" x="2" fill="#008751" />
        </svg>
      );
    case "GHS":
      return (
        <svg {...props} viewBox="0 0 60 42">
          <rect width="60" height="42" fill="#CE1126" />
          <rect y="14" width="60" height="14" fill="#FCD116" />
          <rect y="28" width="60" height="14" fill="#006B3F" />
          <polygon points="30,17 32,23 38,23 33,26.5 35,32.5 30,29 25,32.5 27,26.5 22,23 28,23" fill="#000" />
        </svg>
      );
    case "XOF":
      // Fallback: use Senegal flag (largest XOF economy) if no visitor country
      return <XofFlag country="SN" svgProps={props} />;
    case "KES":
      return (
        <svg {...props} viewBox="0 0 60 42">
          <rect width="60" height="42" fill="#000" />
          <rect y="10" width="60" height="10" fill="#fff" />
          <rect y="12" width="60" height="6" fill="#BB0000" />
          <rect y="22" width="60" height="10" fill="#fff" />
          <rect y="24" width="60" height="6" fill="#006600" />
        </svg>
      );
    case "ZAR":
      return (
        <svg {...props} viewBox="0 0 60 42">
          <rect width="60" height="21" fill="#E03C31" />
          <rect y="21" width="60" height="21" fill="#001489" />
          <polygon points="0,0 25,21 0,42" fill="#007749" />
          <polygon points="0,0 30,21 0,42" fill="none" stroke="#fff" strokeWidth="6" />
          <polygon points="0,0 30,21 0,42" fill="none" stroke="#000" strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
}

// XOF country-specific flags
type SvgProps = { width: number; height: number; className: string; xmlns: string };
function XofFlag({ country, svgProps }: { country: string; svgProps: SvgProps }) {
  switch (country.toUpperCase()) {
    case "TG": // Togo
      return (
        <svg {...svgProps} viewBox="0 0 60 42">
          <rect width="60" height="42" fill="#FFCE00" />
          <rect y="8.4" width="60" height="8.4" fill="#006A4E" />
          <rect y="25.2" width="60" height="8.4" fill="#006A4E" />
          <rect width="24" height="25.2" fill="#D21034" />
          <polygon points="12,7 13.5,11.5 18.5,11.5 14.5,14.5 16,19 12,16 8,19 9.5,14.5 5.5,11.5 10.5,11.5" fill="#fff" />
        </svg>
      );
    case "CI": // Cote d'Ivoire
      return (
        <svg {...svgProps} viewBox="0 0 3 2">
          <rect x="0" width="1" height="2" fill="#F77F00" />
          <rect x="1" width="1" height="2" fill="#fff" />
          <rect x="2" width="1" height="2" fill="#009E60" />
        </svg>
      );
    case "SN": // Senegal
      return (
        <svg {...svgProps} viewBox="0 0 60 42">
          <rect width="20" height="42" fill="#00853F" />
          <rect x="20" width="20" height="42" fill="#FDEF42" />
          <rect x="40" width="20" height="42" fill="#E31B23" />
          <polygon points="30,17 31,20 34,20 31.5,22 32.5,25 30,23 27.5,25 28.5,22 26,20 29,20" fill="#00853F" />
        </svg>
      );
    case "BF": // Burkina Faso
      return (
        <svg {...svgProps} viewBox="0 0 60 42">
          <rect width="60" height="21" fill="#EF2B2D" />
          <rect y="21" width="60" height="21" fill="#009E49" />
          <polygon points="30,15 31.5,19.5 36,19.5 32,22 34,26.5 30,24 26,26.5 28,22 24,19.5 28.5,19.5" fill="#FCD116" />
        </svg>
      );
    case "BJ": // Benin
      return (
        <svg {...svgProps} viewBox="0 0 60 42">
          <rect width="20" height="42" fill="#009543" />
          <rect x="20" width="40" height="21" fill="#FCD116" />
          <rect x="20" y="21" width="40" height="21" fill="#E8112D" />
        </svg>
      );
    case "ML": // Mali
      return (
        <svg {...svgProps} viewBox="0 0 3 2">
          <rect x="0" width="1" height="2" fill="#14B53A" />
          <rect x="1" width="1" height="2" fill="#FCD116" />
          <rect x="2" width="1" height="2" fill="#CE1126" />
        </svg>
      );
    case "NE": // Niger
      return (
        <svg {...svgProps} viewBox="0 0 60 42">
          <rect width="60" height="14" fill="#E05206" />
          <rect y="14" width="60" height="14" fill="#fff" />
          <rect y="28" width="60" height="14" fill="#0DB02B" />
          <circle cx="30" cy="21" r="4" fill="#E05206" />
        </svg>
      );
    case "GW": // Guinea-Bissau
      return (
        <svg {...svgProps} viewBox="0 0 60 42">
          <rect width="60" height="21" fill="#FCD116" />
          <rect y="21" width="60" height="21" fill="#009E49" />
          <rect width="24" height="42" fill="#CE1126" />
          <polygon points="12,15 13.5,19.5 18.5,19.5 14.5,22.5 16,27 12,24 8,27 9.5,22.5 5.5,19.5 10.5,19.5" fill="#000" />
        </svg>
      );
    default:
      // Generic West African / neutral (green/yellow/red pan-African)
      return (
        <svg {...svgProps} viewBox="0 0 3 2">
          <rect x="0" width="1" height="2" fill="#009E60" />
          <rect x="1" width="1" height="2" fill="#FCD116" />
          <rect x="2" width="1" height="2" fill="#CE1126" />
        </svg>
      );
  }
}

export default function CurrencySelector({ compact = false, className = "", dark = false }: Props) {
  const { currency, setCurrency, visitorCountry } = useCurrency();
  // Safe locale detection - useLocale throws if no NextIntlClientProvider (e.g. admin panel)
  let localeSafe = "en";
  try { localeSafe = useLocale(); } catch { /* not inside next-intl provider - fallback to en */ }
  const isFr = localeSafe === "fr";
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = CURRENCIES[currency];

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Change currency"
        className={`inline-flex items-center gap-1.5 transition ${
          compact
            ? "px-2 py-1 text-xs hover:bg-white/10 rounded-lg"
            : dark
              ? "px-2 py-2 text-sm font-semibold text-white hover:bg-white/10 rounded-xl"
              : "px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl"
        }`}
      >
        <Flag code={currency} xofCountry={visitorCountry} size={20} />
        <span className={`font-bold ${dark ? "text-white" : ""}`}>{current.code}</span>
        <ChevronDown className={`w-3 h-3 transition ${open ? "rotate-180" : ""} ${dark ? "text-white" : ""}`} />
      </button>

      {open && (
        <>
          {/* MOBILE: full-screen bottom sheet backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 sm:bg-transparent sm:pointer-events-none"
            onClick={() => setOpen(false)}
          />

          {/* MOBILE bottom sheet | DESKTOP dropdown */}
          <div className="fixed inset-x-0 bottom-0 z-50 sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-1 sm:w-64 bg-white rounded-t-2xl sm:rounded-xl shadow-2xl sm:shadow-lg border-t sm:border border-gray-100 overflow-hidden animate-slide-up sm:animate-none max-h-[85vh] sm:max-h-none flex flex-col">

            {/* Mobile drag handle */}
            <div className="flex justify-center pt-2 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 sm:p-2 sm:py-2 border-b border-gray-100 flex-shrink-0">
              <div className="text-sm sm:text-[10px] font-bold uppercase tracking-wider text-gray-700 sm:text-gray-500 sm:px-2">
                {isFr ? "Choisir la devise" : "Select Currency"}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="sm:hidden p-1 -mr-1 rounded-lg hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Currency list - scrollable */}
            <div className="overflow-y-auto py-1 flex-1 sm:max-h-80">
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map(code => {
                const info = CURRENCIES[code];
                const isActive = code === currency;
                return (
                  <button
                    key={code}
                    onClick={() => { setCurrency(code); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 sm:px-3 py-3 sm:py-2 text-left transition active:bg-gray-100 ${
                      isActive ? "bg-[#CA3F2E]/5" : "hover:bg-gray-50"
                    }`}
                  >
                    <Flag code={code} xofCountry={visitorCountry} size={24} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-base sm:text-sm font-bold ${isActive ? "text-[#CA3F2E]" : "text-gray-900"}`}>
                          {code}
                        </span>
                        <span className="text-sm sm:text-xs text-gray-500">{info.symbol}</span>
                      </div>
                      <div className="text-xs sm:text-[11px] text-gray-500 truncate">
                        {isFr ? info.nameFr : info.name}
                      </div>
                    </div>
                    {isActive && <Check className="w-5 h-5 sm:w-4 sm:h-4 text-[#CA3F2E] flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Footer note */}
            <div className="p-3 sm:p-2 border-t border-gray-100 bg-gray-50 flex-shrink-0 pb-safe">
              <p className="text-xs sm:text-[10px] text-gray-500 leading-relaxed sm:px-2">
                {isFr
                  ? "Prix convertis automatiquement. Paiement final en USD."
                  : "Prices auto-converted. Final payment in USD."}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
