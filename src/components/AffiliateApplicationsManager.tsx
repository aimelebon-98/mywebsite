"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
} from "lucide-react";

interface Application {
  id: string;
  applicantName: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  country: string | null;
  city: string | null;
  websiteUrl: string | null;
  socialMediaUrl: string | null;
  marketingPlan: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export default function AffiliateApplicationsManager() {
  const [list, setList] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [commissionRate, setCommissionRate] = useState("5.00");
  const [note, setNote] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/affiliates/applications")
      .then((r) => r.json())
      .then((d) => {
        if (d?.applications) setList(d.applications);
      })
      .catch(() => setMsg({ type: "err", text: "Failed to load applications" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const review = (applicationId: string, action: "approve" | "reject") => {
    setMsg(null);
    setActiveId(applicationId);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/affiliates/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applicationId,
            action,
            adminNote: note || undefined,
            commissionRate: action === "approve" ? commissionRate : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMsg({ type: "err", text: data.error || "Action failed" });
          return;
        }
        setMsg({
          type: "ok",
          text:
            action === "approve"
              ? "Affiliate approved — credentials emailed"
              : "Application rejected",
        });
        setNote("");
        setActiveId(null);
        load();
      } catch {
        setMsg({ type: "err", text: "Network error" });
      }
    });
  };

  const filtered =
    filter === "all" ? list : list.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Affiliate Applications</h2>
          <p className="text-sm text-gray-500 mt-1">
            Review and approve creators who want to promote New Deal Zone.
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
        <div
          className={`p-3 rounded-xl text-sm border ${
            msg.type === "ok"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide ${
              filter === f
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f} (
            {f === "all"
              ? list.length
              : list.filter((a) => a.status === f).length}
            )
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Default commission % on approve
          </label>
          <input
            type="number"
            min={1}
            max={50}
            step="0.5"
            value={commissionRate}
            onChange={(e) => setCommissionRate(e.target.value)}
            className="w-28 px-3 py-2 border border-gray-200 rounded-xl text-sm"
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Admin note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Shown in rejection email / saved on affiliate"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
          No applications in this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg text-gray-900">
                      {app.applicantName}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        app.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : app.status === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> {app.email}
                    </span>
                    {app.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {app.phone}
                      </span>
                    )}
                    {(app.city || app.country) && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {[app.city, app.country].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {app.socialMediaUrl && (
                      <a
                        href={app.socialMediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#CA3F2E] hover:underline"
                      >
                        <Globe className="w-3.5 h-3.5" /> Social
                      </a>
                    )}
                  </div>
                  {app.marketingPlan && (
                    <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3 mt-2">
                      {app.marketingPlan}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Applied {new Date(app.createdAt).toLocaleString()}
                  </p>
                </div>

                {app.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      disabled={isPending && activeId === app.id}
                      onClick={() => review(app.id, "approve")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
                    >
                      {isPending && activeId === app.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      disabled={isPending && activeId === app.id}
                      onClick={() => review(app.id, "reject")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold border border-red-200 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}