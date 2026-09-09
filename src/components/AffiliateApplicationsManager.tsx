"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  Percent,
  RefreshCw,
  Loader2,
  User,
  Mail,
  Phone,
  Globe,
  Share2,
  FileText,
  CheckSquare,
  Square,
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

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/affiliates/applications")
      .then((r) => r.json())
      .then((d) => {
        if (d?.applications) {
          setList(d.applications);
          setSelectedIds([]);
        }
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
          setMsg({ type: "err", text: data.error || "Review failed" });
          return;
        }
        setMsg({
          type: "ok",
          text: action === "approve" ? "Affiliate approved" : "Application rejected",
        });
        load();
      } catch {
        setMsg({ type: "err", text: "Failed to process application" });
      } finally {
        setActiveId(null);
      }
    });
  };

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map((a) => a.id));
  }

  async function bulkReview(action: "approve" | "reject") {
    if (selectedIds.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to ${action} ${selectedIds.length} application${
          selectedIds.length === 1 ? "" : "s"
        }?`
      )
    ) {
      return;
    }
    setBulkProcessing(true);
    try {
      const res = await fetch("/api/admin/affiliates/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationIds: selectedIds,
          action,
          commissionRate,
          adminNote: note || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk action failed");
      setMsg({ type: "ok", text: data.message || "Bulk action complete" });
      setSelectedIds([]);
      load();
    } catch (err) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Failed" });
    } finally {
      setBulkProcessing(false);
    }
  }

  const filtered = list.filter((a) => {
    if (filter === "all") return true;
    return a.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Affiliate Applications
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Review and approve creators who want to promote New Deal Zone.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            msg.type === "ok"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setSelectedIds([]);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-xl capitalize transition ${
              filter === f
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* SELECT ALL BAR */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
            >
              {selectedIds.length === filtered.length && filtered.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-gray-900" />
              ) : selectedIds.length > 0 ? (
                <div className="w-4 h-4 rounded border-2 border-gray-900 bg-gray-900 flex items-center justify-center">
                  <div className="w-2 h-0.5 bg-white"></div>
                </div>
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span className="font-semibold text-gray-900">
                {selectedIds.length === filtered.length && filtered.length > 0
                  ? "Deselect all"
                  : "Select all"}
              </span>
            </button>
            <span className="text-xs text-gray-500 ml-2">
              {filtered.length} visible
            </span>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-gray-700 mr-2">
                {selectedIds.length} selected:
              </span>
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={() => bulkReview("approve")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-40 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
              </button>
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={() => bulkReview("reject")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-40 flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
          No {filter !== "all" ? filter : ""} applications found.
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((app) => (
            <div
              key={app.id}
              className={`bg-white rounded-2xl border p-6 space-y-4 hover:shadow-md transition-shadow ${
                selectedIds.includes(app.id)
                  ? "border-[#CA3F2E] ring-1 ring-[#CA3F2E]/30"
                  : "border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <button
                  type="button"
                  onClick={() => toggleSelect(app.id)}
                  className="mt-1 flex-shrink-0 text-gray-400 hover:text-[#CA3F2E]"
                >
                  {selectedIds.includes(app.id) ? (
                    <CheckSquare className="w-5 h-5 text-[#CA3F2E]" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-base">
                      {app.applicantName}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-full capitalize ${
                        app.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : app.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{app.email}</p>
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(app.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                {app.phone && (
                  <div>
                    <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                      Phone
                    </span>
                    {app.phone}
                  </div>
                )}
                {app.whatsapp && (
                  <div>
                    <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                      WhatsApp
                    </span>
                    {app.whatsapp}
                  </div>
                )}
                {(app.city || app.country) && (
                  <div>
                    <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                      Location
                    </span>
                    {app.city ? `${app.city}, ` : ""}
                    {app.country}
                  </div>
                )}
                {app.socialMediaUrl && (
                  <div>
                    <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                      Social / Web
                    </span>
                    <a
                      href={app.socialMediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#CA3F2E] hover:underline font-semibold flex items-center gap-1 truncate"
                    >
                      View link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {app.marketingPlan && (
                <div className="text-xs text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                  <span className="font-bold text-gray-700 block mb-1">
                    Marketing Plan:
                  </span>
                  {app.marketingPlan}
                </div>
              )}

              {app.status === "pending" && (
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      Commission %:
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="50"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Admin note (optional)..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
                  />
                  <button
                    disabled={isPending && activeId === app.id}
                    onClick={() => review(app.id, "approve")}
                    className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 disabled:opacity-50"
                  >
                    {isPending && activeId === app.id && (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    )}
                    Approve
                  </button>
                  <button
                    disabled={isPending && activeId === app.id}
                    onClick={() => review(app.id, "reject")}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}