"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { useLocale } from "next-intl";

interface Props {
  compact?: boolean;
  className?: string;
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

export default function CurrencySelector({ compact = false, className = "" }: Props) {
  const { currency, setCurrency, visitorCountry } = useCurrency();
  const locale = useLocale();
  const isFr = locale === "fr";
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
            : "px-2 py-2 text-sm font-semibold hover:bg-gray-100 rounded-xl"
        }`}
      >
        <Flag code={currency} xofCountry={visitorCountry} size={20} />
        <span className="font-bold">{current.code}</span>
        <ChevronDown className={`w-3 h-3 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-2 py-1">
                {isFr ? "Choisir la devise" : "Select Currency"}
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto py-1">
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map(code => {
                const info = CURRENCIES[code];
                const isActive = code === currency;
                return (
                  <button
                    key={code}
                    onClick={() => { setCurrency(code); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left transition ${
                      isActive ? "bg-[#CA3F2E]/5" : "hover:bg-gray-50"
                    }`}
                  >
                    <Flag code={code} xofCountry={visitorCountry} size={22} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isActive ? "text-[#CA3F2E]" : "text-gray-900"}`}>
                          {code}
                        </span>
                        <span className="text-xs text-gray-500">{info.symbol}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">
                        {isFr ? info.nameFr : info.name}
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-[#CA3F2E] flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="p-2 border-t border-gray-100 bg-gray-50">
              <p className="text-[10px] text-gray-500 leading-relaxed px-2">
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
