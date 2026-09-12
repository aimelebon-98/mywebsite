"use client";

import React from "react";

interface BotSidebarProps {
  locale: string;
}

export default function BotSidebar({ locale }: BotSidebarProps) {
  const isFr = locale === "fr";

  return (
    <div className="mt-4 space-y-4 text-left">
      {/* 1. Bot Technical Specs Box */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 p-5 text-white shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {isFr ? "Sp\u00e9cifications SMZ Bot" : "SMZ Bot Pro Specs"}
            </h4>
          </div>
          <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/20">
            v4.2 Pro
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-medium">{isFr ? "Taux de R\u00e9ussite" : "Win Rate"}</p>
            <p className="text-sm font-extrabold text-emerald-400">87.4%</p>
          </div>
          <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-medium">{isFr ? "Signaux / Jour" : "Daily Signals"}</p>
            <p className="text-sm font-extrabold text-white">45 - 70</p>
          </div>
          <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-medium">{isFr ? "Vitesse Push" : "Signal Latency"}</p>
            <p className="text-sm font-extrabold text-amber-400">&lt; 50ms</p>
          </div>
          <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-medium">{isFr ? "Livraison" : "Delivery"}</p>
            <p className="text-sm font-extrabold text-blue-400">Telegram</p>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{isFr ? "Courtages compatibles:" : "Supported Brokers:"}</span>
            <span className="font-semibold text-white">Deriv, Quotex, Pocket</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{isFr ? "Filtres IA:" : "AI Filters:"}</span>
            <span className="font-semibold text-emerald-400">47 Indicators</span>
          </div>
        </div>
      </div>

      {/* 2. Quick Setup Steps */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
        <h4 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
          {isFr ? "Comment \u00c7a Marche ?" : "Quick Activation Steps"}
        </h4>
        <div className="space-y-2 text-xs text-gray-700">
          <div className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">1</span>
            <p className="leading-tight">
              <strong className="text-gray-900">{isFr ? "Abonnez-vous" : "Subscribe"}</strong> - {isFr ? "Paiement s\u00e9curis\u00e9" : "Automated billing"}
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">2</span>
            <p className="leading-tight">
              <strong className="text-gray-900">{isFr ? "Acc\u00e8s Telegram" : "Telegram Link"}</strong> - {isFr ? "Cl\u00e9 d'acc\u00e8s auto instantan\u00e9e" : "Instant VIP Telegram bot link"}
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">3</span>
            <p className="leading-tight">
              <strong className="text-gray-900">{isFr ? "Signaux 24/7" : "24/7 Signals"}</strong> - {isFr ? "Recevez les signaux en direct" : "Receive instant binary alerts"}
            </p>
          </div>
        </div>
      </div>

      {/* 3. VIP Telegram Channel Live Counter */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-3.5 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900">
            {isFr ? "1 420+ Traders Actifs" : "1,420+ Active VIP Traders"}
          </p>
          <p className="text-[11px] text-gray-500">
            {isFr ? "Canal Telegram VIP 24/7" : "Live Telegram VIP signal channel"}
          </p>
        </div>
      </div>
    </div>
  );
}