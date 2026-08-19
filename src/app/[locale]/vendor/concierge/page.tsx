"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, Sparkles, Plus, Clock, CheckCircle2, XCircle, AlertCircle, MessageSquare, Package } from "lucide-react";
import { getTierById } from "@/lib/concierge-tiers";

const BRAND_RED = "#CA3F2E";
const BRAND_RED_DARK = "#8B2A1E";

interface RequestRow {
  id: string;
  tier: string;
  fee: string;
  productName: string;
  productPrice: string;
  status: string;
  adminNote: string;
  sourceImages: string;
  createdAt: string;
  completedAt: string | null;
  createdProductId: string | null;
}

export default function VendorConciergePage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [debt, setDebt] = useState("0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendor/concierge").then(r => r.json()).then(d => {
      setRequests(d.requests || []);
      setDebt(d.debt || "0");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_RED }} /></div>;

  const totalUnpaid = parseFloat(debt);

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Sparkles className="w-7 h-7" style={{ color: BRAND_RED }} />
            Concierge requests
          </h1>
          <p className="text-gray-500 text-sm">Products we create for you. Pay with your next payout.</p>
        </div>
        <Link
          href={`/${locale}/vendor/products/add`}
          className="flex items-center gap-2 px-5 py-3 text-white font-semibold rounded-xl"
          style={{ backgroundColor: BRAND_RED }}
        >
          <Plus className="w-4 h-4" />
          New request
        </Link>
      </div>

      {/* Debt card */}
      {totalUnpaid > 0 && (
        <div className="rounded-2xl p-5 mb-6 text-white" style={{ backgroundImage: `linear-gradient(135deg, ${BRAND_RED} 0%, ${BRAND_RED_DARK} 100%)` }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs font-bold uppercase opacity-90">Concierge fees to invoice</div>
              <div className="text-3xl font-black mt-1">${totalUnpaid.toFixed(2)}</div>
              <div className="text-xs opacity-85 mt-1">Deducted from your next payout, or invoiced separately</div>
            </div>
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <Sparkles className="w-14 h-14 mx-auto mb-3" style={{ color: BRAND_RED }} />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No concierge requests yet</h3>
          <p className="text-gray-500 text-sm mb-6">Save time - let us create products for you. Just send images and basic info.</p>
          <Link href={`/${locale}/vendor/products/add`} className="inline-flex items-center gap-2 px-5 py-3 text-white font-semibold rounded-xl" style={{ backgroundColor: BRAND_RED }}>
            <Plus className="w-4 h-4" />
            Make first request
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {requests.map(r => {
            const tierInfo = getTierById(r.tier);
            let images: string[] = [];
            try { images = JSON.parse(r.sourceImages || "[]"); } catch {}

            return (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start gap-4">
                  {images[0] ? (
                    <img src={images[0]} alt={r.productName} className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{r.productName}</h3>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="text-xs text-gray-500 flex flex-wrap items-center gap-3">
                      <span>Tier: <strong>{tierInfo?.name || r.tier}</strong> (${parseFloat(r.fee).toFixed(2)})</span>
                      <span>&middot; Price: ${parseFloat(r.productPrice).toFixed(2)}</span>
                      <span>&middot; {new Date(r.createdAt).toLocaleDateString()}</span>
                      {images.length > 1 && <span>&middot; {images.length} images</span>}
                    </div>
                    {r.adminNote && (
                      <div className="mt-2 text-xs bg-blue-50 border-l-2 border-blue-300 pl-2 py-1 rounded flex items-start gap-1">
                        <MessageSquare className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-800">{r.adminNote}</span>
                      </div>
                    )}
                    {r.status === "completed" && r.createdProductId && (
                      <div className="mt-2 text-xs text-green-700 font-semibold">
                        Product is live on the site
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; Icon: React.ComponentType<{ className?: string }> }> = {
    pending: { label: "Pending", bg: "bg-yellow-100", color: "text-yellow-800", Icon: Clock },
    in_progress: { label: "In progress", bg: "bg-blue-100", color: "text-blue-800", Icon: Loader2 },
    needs_info: { label: "Needs info", bg: "bg-orange-100", color: "text-orange-800", Icon: AlertCircle },
    completed: { label: "Completed", bg: "bg-green-100", color: "text-green-800", Icon: CheckCircle2 },
    cancelled: { label: "Cancelled", bg: "bg-red-100", color: "text-red-800", Icon: XCircle },
  };
  const m = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${m.bg} ${m.color}`}>
      <m.Icon className="w-3 h-3" />
      {m.label}
    </span>
  );
}