"use client";

import React, { useState } from "react";
import { Gift, ExternalLink, CheckCircle2, Loader2, X, AlertCircle, ShieldCheck } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  locale?: string;
}

const BROKERS = [
  {
    id: "Pocket Option",
    name: "1️⃣ Pocket Option 💰",
    brokerName: "Pocket Option",
    link: "https://u3.shortink.io/register?utm_campaign=53859&utm_source=affiliate&utm_medium=sr&a=VDVajoCOfNvwnK&ac=telegram&code=LFL041",
  },
  {
    id: "Quotex",
    name: "2️⃣ Quotex 📊",
    brokerName: "Quotex",
    link: "https://broker-qx.pro/sign-up/?lid=2111456",
  },
  {
    id: "IQ Option",
    name: "3️⃣ IQ Option 📈",
    brokerName: "IQ Option",
    link: "https://affiliate.iqoption.net/redir/?aff=816924&aff_model=revenue&afftrack=aimelebon",
  },
];

export function BrokerClaimModal({ isOpen, onClose, locale = "en" }: Props) {
  const isFr = locale === "fr";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [brokerName, setBrokerName] = useState("Pocket Option");
  const [brokerAccountId, setBrokerAccountId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectBroker = (bName: string, link: string) => {
    setBrokerName(bName);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("customerName", name);
      formData.append("customerEmail", email);
      formData.append("customerPhone", phone);
      formData.append("brokerName", brokerName);
      formData.append("brokerAccountId", brokerAccountId);
      formData.append("depositAmount", "20.00");
      if (file) formData.append("proofFile", file);

      const res = await fetch("/api/broker-claims/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setDone(true);
    } catch (err: any) {
      setError(err?.message || "Failed to submit claim");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isFr ? "1 Mois Gratuit (Offre Courtier)" : "Get 1 Month FREE (Broker Offer)"}
              </h2>
              <p className="text-xs text-amber-300/80">
                {isFr ? "D\u00e9posez 20$ sur votre propre compte de trading" : "Deposit $20+ in your own trading account"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!done ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Step 1: Select & Register with Partner Broker */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px] block">
                  Step 1: {isFr ? "Choisissez et inscrivez-vous chez un courtier" : "Select & Register with a Partner Broker"}
                </span>
                <p className="text-gray-300 leading-relaxed text-[11px]">
                  {isFr
                    ? "Cr\u00e9ez un compte de trading via un des liens ci-dessous et d\u00e9posez au moins 20$ (votre argent reste 100% le vôtre)."
                    : "Create a trading account via one of the links below and deposit $20+ (your money remains 100% yours to trade or withdraw anytime)."}
                </p>

                {/* 3 Broker Buttons Styled Like Screenshot */}
                <div className="space-y-2 pt-1">
                  {BROKERS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBroker(b.brokerName, b.link)}
                      className={`w-full p-3 rounded-xl border text-left font-bold text-sm transition-all flex items-center justify-between group ${
                        brokerName === b.brokerName
                          ? "bg-amber-500/20 border-amber-500 text-white shadow-md shadow-amber-500/10"
                          : "bg-gray-800/80 hover:bg-gray-800 border-gray-700 text-gray-200"
                      }`}
                    >
                      <span className="flex items-center gap-2">{b.name}</span>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-amber-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Form Details */}
              <div className="space-y-3 pt-2">
                <span className="font-bold text-gray-300 uppercase tracking-wider text-[10px] block">
                  Step 2: {isFr ? "Saisissez vos d\u00e9tails de d\u00e9p\u00f4t" : "Submit Your Deposit Details"}
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">
                      {isFr ? "Nom complet *" : "Full Name *"}
                    </label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">
                      {isFr ? "Email *" : "Email Address *"}
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">
                      {isFr ? "Courtier S\u00e9lectionn\u00e9" : "Selected Broker"}
                    </label>
                    <select
                      value={brokerName}
                      onChange={(e) => setBrokerName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white font-semibold focus:outline-none focus:border-amber-500"
                    >
                      <option value="Pocket Option">Pocket Option</option>
                      <option value="Quotex">Quotex</option>
                      <option value="IQ Option">IQ Option</option>
                      <option value="Exness">Exness</option>
                      <option value="Deriv">Deriv</option>
                      <option value="Other">Other Broker</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1">
                      {isFr ? "ID Compte Courtier *" : "Broker Account ID *"}
                    </label>
                    <input
                      required
                      type="text"
                      value={brokerAccountId}
                      onChange={(e) => setBrokerAccountId(e.target.value)}
                      placeholder="e.g. 14829023"
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">
                    {isFr ? "Capture de d\u00e9p\u00f4t (20$+) (Optionnel)" : "Deposit Screenshot (20$+) (Optional)"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-amber-500/20 file:text-amber-300 file:font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isFr ? "Envoi en cours..." : "Submitting Claim..."}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    {isFr ? "R\u00e9clamer mes 1 mois gratuits" : "Claim My 1 Month FREE Access"}
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {isFr ? "Demande envoy\u00e9e !" : "Claim Submitted!"}
                </h3>
                <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  {isFr
                    ? "Notre \u00e9quipe v\u00e9rifie les d\u00e9p\u00f4ts sous 1 \u00e0 6 heures. Votre abonnement d'un mois gratuit sera activ\u00e9 automatiquement !"
                    : "Our team verifies broker deposits within 1 to 6 hours. Your 1-Month FREE subscription will be activated automatically!"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition"
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