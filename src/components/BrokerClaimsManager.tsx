"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, RefreshCw, CheckCircle2, XCircle, Gift, ExternalLink, Image as ImageIcon } from "lucide-react";

interface Claim {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  brokerName: string;
  brokerAccountId: string;
  depositAmount: string | null;
  proofImage: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string | null;
}

export default function BrokerClaimsManager() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/broker-claims")
      .then((r) => r.json())
      .then((d) => {
        if (d?.claims) setClaims(d.claims);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const process = (claimId: string, action: "approve" | "reject") => {
    setMsg(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/broker-claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Failed");
        return;
      }
      setMsg(action === "approve" ? "Claim approved & 1-Month Free Subscription activated!" : "Claim rejected");
      load();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="w-6 h-6 text-amber-500" />
            Partner Broker Claims
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Verify $20+ broker deposits and approve 1-Month Free SMZ Bot Pro subscriptions.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : claims.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
          No broker deposit claims submitted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-gray-900">{claim.customerName}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        claim.status === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : claim.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{claim.customerEmail} {claim.customerPhone ? `· ${claim.customerPhone}` : ""}</p>
                  <p className="text-xs font-mono font-bold text-amber-600 pt-1">
                    Broker: {claim.brokerName} · Account ID: <span className="text-gray-900">{claim.brokerAccountId}</span> · Deposit: ${claim.depositAmount || "20.00"}
                  </p>
                </div>

                {claim.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      disabled={isPending}
                      onClick={() => process(claim.id, "approve")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve & Grant 1 Mo Free
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() => process(claim.id, "reject")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>

              {claim.proofImage && (
                <div className="pt-2 border-t border-gray-100">
                  <a
                    href={claim.proofImage}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-semibold"
                  >
                    <ImageIcon className="w-4 h-4" /> View Deposit Screenshot <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}