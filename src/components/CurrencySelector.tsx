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
        className={`inline-flex items-center gap-1.5 transition ${
          compact
            ? "px-2 py-1 text-xs hover:bg-white/10 rounded-lg"
            : "px-3 py-2 text-sm font-semibold hover:bg-gray-100 rounded-xl"
        }`}
      >
        <span>{current.flag}</span>
        <span className="font-bold">{current.code}</span>
        <ChevronDown className={`w-3 h-3 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-50">
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
                  <span className="text-lg flex-shrink-0">{info.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isActive ? "text-[#CA3F2E]" : "text-gray-900"}`}>
                        {code}
                      </span>
                      <span className="text-xs text-gray-500">
                        {info.position === "left" ? info.symbol : `${info.symbol}`}
                      </span>
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
                ? "Prix convertis automatiquement. Le paiement final est en USD."
                : "Prices auto-converted. Final payment in USD."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
