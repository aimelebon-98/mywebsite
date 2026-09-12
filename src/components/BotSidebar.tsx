'use client';

import React from 'react';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Clock,
  Sparkles
} from 'lucide-react';

interface BotSidebarProps {
  locale?: string;
}

export default function BotSidebar({ locale = 'en' }: BotSidebarProps) {
  const isFr = locale === 'fr';

  return (
    <div className="mt-4 space-y-4 text-xs text-gray-700">
      {/* Live Performance Widget */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-400 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {isFr ? 'Performances en direct' : 'Live Performance'}
          </span>
          <span className="text-[10px] text-gray-400">{isFr ? 'IA Active' : 'AI Active'}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-slate-800/80 rounded-lg p-2.5">
            <p className="text-[10px] text-gray-400">{isFr ? 'Taux de reussite' : 'Win Rate (24h)'}</p>
            <p className="text-base font-bold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> 88.4%
            </p>
          </div>
          <div className="bg-slate-800/80 rounded-lg p-2.5">
            <p className="text-[10px] text-gray-400">{isFr ? 'Signaux / Jour' : 'Daily Signals'}</p>
            <p className="text-base font-bold text-white flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-400" /> 15 - 30
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-2.5">
        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          {isFr ? 'Pourquoi choisir SMZ Bot ?' : 'Why Choose SMZ Bot?'}
        </h4>

        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{isFr ? 'Alertes instantanees Telegram 24/7' : 'Instant 24/7 Telegram Alerts'}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{isFr ? '47 indicateurs IA integres' : 'Powered by 47 Technical AI Indicators'}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{isFr ? 'Compatible avec tous les courtiers' : 'Compatible with all major brokers'}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{isFr ? 'Aucune experience requise' : 'Zero trading experience needed'}</span>
          </li>
        </ul>
      </div>

      {/* 3-Step Setup */}
      <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100 space-y-2">
        <h4 className="font-semibold text-emerald-950 text-xs flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-700" />
          {isFr ? 'Activation Instantanee' : 'Instant 3-Step Setup'}
        </h4>
        <ol className="text-[11px] text-emerald-900 space-y-1.5 pl-1">
          <li className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
            {isFr ? 'Abonnez-vous ci-dessus' : 'Click Subscribe above'}
          </li>
          <li className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">2</span>
            {isFr ? 'Recevez le lien VIP Telegram' : 'Receive VIP Telegram invite link'}
          </li>
          <li className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">3</span>
            {isFr ? 'Recevez les signaux en direct' : 'Start receiving live AI signals'}
          </li>
        </ol>
      </div>

      {/* Security Badge */}
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex items-center gap-3 text-gray-600">
        <ShieldCheck className="w-7 h-7 text-emerald-600 shrink-0" />
        <div className="text-[11px] leading-tight">
          <p className="font-semibold text-gray-900">{isFr ? '100% Securise & Verifie' : '100% Verified & Broker-Safe'}</p>
          <p className="text-gray-500 mt-0.5">{isFr ? 'Aucune cle API risquee requise' : 'No risky API keys needed'}</p>
        </div>
      </div>

      {/* Pre-purchase Telegram Support */}
      <a
        href="https://t.me/newdealzone" 
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 font-semibold transition text-xs"
      >
        <MessageSquare className="w-4 h-4" />
        {isFr ? 'Question avant d\'acheter ? Contactez-nous' : 'Have questions? Chat on Telegram'}
      </a>
    </div>
  );
}