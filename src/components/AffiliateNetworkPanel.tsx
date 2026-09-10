"use client";

import { useEffect, useState } from "react";
import { Loader2, X, Users, DollarSign } from "lucide-react";

interface Props {
  affiliateId: string;
  onClose: () => void;
}

export default function AffiliateNetworkPanel({ affiliateId, onClose }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/affiliates/network?affiliateId=${affiliateId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch((e) => console.error("Network fetch error:", e))
      .finally(() => setLoading(false));
  }, [affiliateId]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[85vh] overflow-y-auto relative p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#CA3F2E]" />
          Affiliate Network & Team Breakdown
        </h3>
        <p className="text-xs text-gray-500 mb-6 font-mono">ID: {affiliateId}</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" />
          </div>
        ) : !data || !data.success ? (
          <div className="text-center py-12 text-sm text-gray-400">
            No active recruits or network data available for this affiliate.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">L1 Sales</p>
                <p className="text-lg font-black text-emerald-900 mt-0.5">
                  ${data.commissions?.level1?.amount || "0.00"}
                </p>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                <p className="text-[10px] uppercase tracking-wider text-sky-700 font-bold">L2 Override</p>
                <p className="text-lg font-black text-sky-900 mt-0.5">
                  ${data.commissions?.level2?.amount || "0.00"}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-[10px] uppercase tracking-wider text-purple-700 font-bold">L3 Override</p>
                <p className="text-lg font-black text-purple-900 mt-0.5">
                  ${data.commissions?.level3?.amount || "0.00"}
                </p>
              </div>
            </div>

            {data.team && data.team.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">
                  Direct Recruits ({data.team.length})
                </h4>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 uppercase">
                      <tr>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Code</th>
                        <th className="p-2.5">Orders</th>
                        <th className="p-2.5">Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.team.map((m: any) => (
                        <tr key={m.id} className="hover:bg-gray-50">
                          <td className="p-2.5 font-semibold text-gray-900">{m.name}</td>
                          <td className="p-2.5 font-mono text-[#CA3F2E] font-bold">{m.code}</td>
                          <td className="p-2.5">{m.totalOrders || 0}</td>
                          <td className="p-2.5 font-semibold">
                            ${parseFloat(m.totalEarnings || "0").toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
