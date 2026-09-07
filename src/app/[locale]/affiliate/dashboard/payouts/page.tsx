"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams } from "next/navigation";
import {
  Wallet,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface PayoutItem {
  id: string;
  amount: string;
  currency: string;
  method: string;
  reference: string | null;
  status: string;
  requestedAt: string;
  paidAt: string | null;
}

export default function AffiliatePayoutsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [pendingBalance, setPendingBalance] = useState("0.00");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = () => {
    fetch("/api/affiliate/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.affiliate) setPendingBalance(d.affiliate.pendingPayout || "0.00");
      });

    fetch("/api/affiliate/payout")
      .then((r) => r.json())
      .then((d) => {
        if (d?.payouts) setPayouts(d.payouts);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/affiliate/payout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, note }),
        });

        const data = await res.json();
        if (!res.ok) {
          setMsg({ type: "error", text: data.error || "Failed to request payout" });
          return;
        }

        setMsg({
          type: "success",
          text: isFr
            ? "Demande de retrait enregistr\u00e9e avec succ\u00e8s !"
            : "Payout request submitted successfully!",
        });
        setAmount("");
        setNote("");
        loadData();
      } catch {
        setMsg({ type: "error", text: "Network error. Please try again." });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/${locale}/affiliate/dashboard`}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {isFr ? "Retour au tableau de bord" : "Back to dashboard"}
        </Link>
        <h1 className="text-2xl font-bold">
          {isFr ? "Paiements & Retraits" : "Payouts & Balances"}
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          {isFr
            ? "G\u00e9rez vos demandes de virement bancaire et consultez vos historiques de versement."
            : "Request bank transfer withdrawals and review your payout history."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Form */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 lg:col-span-1">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#CA3F2E]" />
            {isFr ? "Nouveau Retrait" : "Request Payout"}
          </h3>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-5">
            <span className="text-[11px] text-gray-400 uppercase font-semibold">
              {isFr ? "Solde Disponible" : "Available Balance"}
            </span>
            <p className="text-2xl font-bold text-white mt-0.5">
              ${parseFloat(pendingBalance).toFixed(2)}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              {isFr ? "Seuil min: $20.00 USD" : "Min threshold: $20.00 USD"}
            </p>
          </div>

          {msg && (
            <div
              className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
                msg.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {msg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleRequestPayout} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 uppercase font-semibold mb-1.5">
                {isFr ? "Montant ($ USD)" : "Amount ($ USD)"}
              </label>
              <input
                type="number"
                step="0.01"
                min="20"
                max={pendingBalance}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="20.00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#CA3F2E]"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 uppercase font-semibold mb-1.5">
                {isFr ? "Note ou Référence (Optionnel)" : "Note / Reference (Optional)"}
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={isFr ? "ex: Virement UBA Lomé..." : "e.g. Wire to Zenith Bank Abuja..."}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#CA3F2E] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || parseFloat(pendingBalance) < 20}
              className="w-full py-3 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-semibold text-xs transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-[#CA3F2E]/20"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isFr ? "Envoi..." : "Submitting..."}</span>
                </>
              ) : (
                <span>{isFr ? "Confirmer la Demande" : "Submit Request"}</span>
              )}
            </button>
          </form>
        </div>

        {/* Payout History */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 lg:col-span-2">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            {isFr ? "Historique des Versements" : "Payout History"}
          </h3>

          {loading ? (
            <div className="text-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-[#CA3F2E] mx-auto" />
            </div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              {isFr
                ? "Aucune demande de retrait effectuée."
                : "No payout requests submitted yet."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {payouts.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3.5 px-3">
                        {new Date(p.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-white">
                        ${parseFloat(p.amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 capitalize">
                        {p.method.replace("_", " ")}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold border ${
                            p.status === "completed" || p.status === "paid"
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-gray-400">
                        {p.reference || "\u2014"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}