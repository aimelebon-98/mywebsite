"use client";

import React, { useState, useEffect } from "react";
import { type SubscriptionTierMonths, getTierQuote, parseSubscriptionConfig } from "@/lib/subscription-pricing";
import { SubscriptionTierSelector } from "./SubscriptionTierSelector";
import { Copy, CheckCircle2, Clock, ExternalLink, AlertCircle, LayoutGrid, Loader2, X, Sparkles, Send } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  subscriptionConfig?: string | null;
}

interface Props {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  locale?: string;
}

type Step = "form" | "payment" | "success";

function formatTimeLeft(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function SubscriptionCheckoutModal({ product, isOpen, onClose, locale = "en" }: Props) {
  const isFr = locale === "fr";
  const config = parseSubscriptionConfig(product.subscriptionConfig);

  const [step, setStep] = useState<Step>("form");
  const [months, setMonths] = useState<SubscriptionTierMonths>(1);
  const [cryptoCurrency, setCryptoCurrency] = useState("usdttrc20");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [autoAffiliate, setAutoAffiliate] = useState(true);
  const [refCode, setRefCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedAmt, setCopiedAmt] = useState(false);

  const [pay, setPay] = useState<{
    orderNumber: string;
    payAddress: string;
    payAmount: string | number;
    payCurrency: string;
    status: string;
    expiresAt?: string | null;
  } | null>(null);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const quote = getTierQuote(config.monthlyPrice, months);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      let r = localStorage.getItem("ndz_affiliate") || sessionStorage.getItem("ndz_affiliate") || "";
      if (!r) {
        const match = document.cookie.match(/ndz_affiliate=([^;]+)/);
        if (match) r = decodeURIComponent(match[1]);
      }
      if (r) setRefCode(r.trim());
    } catch {}
  }, []);

  useEffect(() => {
    if (step !== "payment" || !pay?.orderNumber) return;
    const iv = setInterval(async () => {
      try {
        const r = await fetch(`/api/subscriptions/status?order=${pay.orderNumber}`);
        if (!r.ok) return;
        const d = await r.json();
        if (d.subscription?.status === "active" || d.payment?.status === "confirmed") {
          setStep("success");
          clearInterval(iv);
        } else if (d.payment?.status) {
          setPay((p) => (p ? { ...p, status: d.payment.status } : null));
        }
      } catch {}
    }, 4000);
    return () => clearInterval(iv);
  }, [step, pay?.orderNumber]);

  useEffect(() => {
    if (step !== "payment" || !pay) {
      setTimeLeft(null);
      return;
    }

    let targetMs: number;
    if (pay.expiresAt) {
      const parsed = new Date(pay.expiresAt).getTime();
      targetMs = isNaN(parsed) ? Date.now() + 20 * 60 * 1000 : parsed;
    } else {
      targetMs = Date.now() + 20 * 60 * 1000;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((targetMs - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [step, pay?.expiresAt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const r = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          months,
          payCurrency: cryptoCurrency,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          autoAffiliate,
          refCode,
          locale,
        }),
      });

      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");

      setPay({
        orderNumber: d.subscription.orderNumber,
        payAddress: d.payment.payAddress,
        payAmount: d.payment.payAmount,
        payCurrency: d.payment.payCurrency,
        status: d.payment.status,
        expiresAt: d.payment.expiresAt,
      });

      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, type: "a" | "m") => {
    navigator.clipboard.writeText(text);
    if (type === "a") {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    } else {
      setCopiedAmt(true);
      setTimeout(() => setCopiedAmt(false), 2000);
    }
  };

  if (!isOpen) return null;

  const qrUrl = pay?.payAddress
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pay.payAddress)}`
    : "";

  const telegramMsg = isFr
    ? `Bonjour ! Je viens de m'abonner \u00e0 SMZ AI Trading Bot Pro. Mon num\u00e9ro de commande est : ${pay?.orderNumber || ""}. Merci de m'envoyer le lien du canal de signaux.`
    : `Hello! I just subscribed to SMZ AI Trading Bot Pro. My Order Number is: ${pay?.orderNumber || ""}. Please send me the signals channel link.`;

  const telegramUrl = `https://t.me/livetraderu?text=${encodeURIComponent(telegramMsg)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {step === "form" && (isFr ? `Abonnement \u2022 ${product.name}` : `Subscribe \u2022 ${product.name}`)}
              {step === "payment" && (isFr ? "Paiement Crypto" : "Complete Crypto Payment")}
              {step === "success" && (isFr ? "Abonnement Activ\u00e9 !" : "Subscription Confirmed!")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <SubscriptionTierSelector
                monthlyPrice={config.monthlyPrice}
                selectedMonths={months}
                onSelectTier={setMonths}
                locale={locale}
              />

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                  {isFr ? "Cryptomonnaie" : "Payment Currency"}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["usdttrc20", "btc"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCryptoCurrency(c)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        cryptoCurrency === c
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20"
                          : "border-gray-200 dark:border-zinc-800"
                      }`}
                    >
                      <div className="font-bold text-sm">
                        {c === "usdttrc20" ? "USDT (TRC20)" : "Bitcoin (BTC)"}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {c === "usdttrc20"
                          ? isFr
                            ? "Frais bas & rapide"
                            : "Low fees & fast"
                          : isFr
                          ? "R\u00e9seau BTC natif"
                          : "Native BTC network"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="modal-name" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {isFr ? "Nom complet *" : "Full Name *"}
                  </label>
                  <input
                    id="modal-name"
                    required
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="mt-1 w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="modal-email" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {isFr ? "Email (activation) *" : "Email Address *"}
                  </label>
                  <input
                    id="modal-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="mt-1 w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="modal-phone" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {isFr ? "Telegram / T\u00e9l\u00e9phone (optionnel)" : "Telegram / Phone (optional)"}
                  </label>
                  <input
                    id="modal-phone"
                    value={phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                    placeholder="@handle"
                    className="mt-1 w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2">
                  <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={autoAffiliate}
                        onChange={(e) => setAutoAffiliate(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 flex-shrink-0"
                      />
                      <div className="text-xs text-gray-700 dark:text-gray-300 leading-snug">
                        <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          {isFr ? "Devenir partenaire affili\u00e9 (Recommand\u00e9)" : "Become an affiliate partner (Recommended)"}
                        </span>
                        {isFr
                          ? "Gagnez jusqu'a 50% de commission en recommandant ce robot. Votre compte affili\u00e9 sera cr\u00e9\u00e9 automatiquement."
                          : "Earn up to 50% commission promoting this bot. Your affiliate account will be created automatically."}
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-base shadow-lg shadow-emerald-600/20 transition flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {isFr ? "Cr\u00e9ation..." : "Generating..."}
                  </>
                ) : (
                  <>{isFr ? `Payer $${quote.total.toFixed(2)} en Crypto` : `Pay $${quote.total.toFixed(2)} in Crypto`}</>
                )}
              </button>
            </form>
          )}

          {step === "payment" && pay && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse flex-shrink-0" />
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span>{isFr ? "En attente du transfert..." : "Awaiting blockchain confirmation..."}</span>
                    {timeLeft !== null && timeLeft > 0 && (
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100 text-[11px] inline-flex items-center gap-1 shadow-sm">
                        ⏱️ {formatTimeLeft(timeLeft)}
                      </span>
                    )}
                    {timeLeft === 0 && (
                      <span className="font-mono font-bold text-red-600 dark:text-red-400 text-[11px] bg-red-100 dark:bg-red-950 px-1.5 py-0.5 rounded">
                        {isFr ? "EXPIR\u00c9" : "EXPIRED"}
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-mono font-bold uppercase tracking-wider text-[11px] bg-amber-200/60 dark:bg-amber-900/40 px-2 py-0.5 rounded">
                  {pay.status}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                <div className="w-36 h-36 bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center flex-shrink-0">
                  {qrUrl ? (
                    <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" />
                  ) : (
                    <LayoutGrid className="w-20 h-20 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 space-y-3 w-full min-w-0">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      {isFr ? "Montant exact" : "Exact Amount"}
                    </label>
                    <div className="flex items-center justify-between gap-2 mt-1 p-2 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                      <span className="font-mono font-extrabold text-base text-emerald-600 dark:text-emerald-400 truncate">
                        {pay.payAmount} {pay.payCurrency.toUpperCase()}
                      </span>
                      <button
                        onClick={() => copyText(String(pay.payAmount), "m")}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
                      >
                        {copiedAmt ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      {isFr ? "Adresse de d\u00e9p\u00f4t" : "Deposit Address"}
                    </label>
                    <div className="flex items-center justify-between gap-2 mt-1 p-2 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                      <span className="font-mono text-xs break-all text-gray-800 dark:text-gray-200 select-all">
                        {pay.payAddress}
                      </span>
                      <button
                        onClick={() => copyText(pay.payAddress, "a")}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition flex-shrink-0"
                      >
                        {copiedAddr ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setStep("form")}
                  className="flex-1 border border-gray-200 dark:border-zinc-800 rounded-xl py-3 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-zinc-900 transition"
                >
                  {isFr ? "Modifier" : "Back"}
                </button>
                <a
                  href={`/${locale}/subscribe/success?order=${pay.orderNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 text-sm font-semibold text-center flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-600/20"
                >
                  {isFr ? "Suivi" : "Track"} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {step === "success" && pay && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isFr ? "Abonnement Confirm\u00e9 !" : "Subscription Active!"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {isFr ? "Votre abonnement est maintenant actif." : "Your subscription has been activated."}
                </p>
              </div>

              {/* TELEGRAM REDIRECT BUTTON */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#229ED9] hover:bg-[#1b88bd] text-white font-extrabold text-sm shadow-lg shadow-[#229ED9]/25 transition-all"
              >
                <Send className="w-4 h-4" />
                {isFr ? "Rejoindre sur Telegram (@livetraderu)" : "Claim Signals on Telegram (@livetraderu)"}
              </a>

              <button
                onClick={onClose}
                className="w-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl transition text-sm"
              >
                {isFr ? "Fermer" : "Done"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}