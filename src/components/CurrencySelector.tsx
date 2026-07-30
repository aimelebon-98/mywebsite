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

// SVG flag components (rendered inline like language dropdown)
function Flag({ code, size = 20 }: { code: CurrencyCode; size?: number }) {
  const h = Math.round(size * 0.7);
  const props = { width: size, height: h, className: "rounded-sm flex-shrink-0", xmlns: "http://www.w3.org/2000/svg" };

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
      return (
        <svg {...props} viewBox="0 0 3 2">
          <rect width="1" height="2" x="0" fill="#009E60" />
          <rect width="1" height="2" x="1" fill="#FCD116" />
          <rect width="1" height="2" x="2" fill="#CE1126" />
        </svg>
      );
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

export default function CurrencySelector({ compact = false, className = "" }: Props) {
  const { currency, setCurrency } = useCurrency();
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
        <Flag code={currency} size={20} />
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
                    <Flag code={code} size={22} />
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
