"use client";

import { useState, useEffect } from "react";
import {
  Store,
  Check,
  X,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Copy,
  CheckCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  Percent,
  AlertCircle,
  CheckSquare,
  Square,
} from "lucide-react";

const BRAND_RED = "#CA3F2E";
const BRAND_RED_DARK = "#8B2A1E";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

interface Application {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  whatsapp: string;
  storeName: string;
  storeDescription: string;
  productCategories: string;
  country: string;
  city: string;
  instagramUrl: string;
  websiteUrl: string;
  additionalInfo: string;
  status: string;
  adminNote: string;
  createdAt: string;
  reviewedAt: string | null;
}

export default function VendorApplicationsManager() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [commissionRate, setCommissionRate] = useState("10");
  const [processing, setProcessing] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string; storeSlug: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [notif, setNotif] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  function showNotif(type: "success" | "error", msg: string) {
    setNotif({ type, msg });
    setTimeout(() => setNotif(null), 3500);
  }

  async function load() {
    setLoading(true);
    try {
      const url = filter === "all" ? "/api/admin/vendor-applications" : `/api/admin/vendor-applications?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setApps(data.applications || []);
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === apps.length) setSelectedIds([]);
    else setSelectedIds(apps.map((a) => a.id));
  }

  async function bulkAction(action: "approve" | "reject") {
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
      const res = await fetch("/api/admin/vendor-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationIds: selectedIds,
          action,
          commissionRate,
          adminNote: reviewNote || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showNotif("success", data.message || "Bulk action complete");
      setSelectedIds([]);
      await load();
    } catch (err) {
      showNotif("error", err instanceof Error ? err.message : "Failed");
    } finally {
      setBulkProcessing(false);
    }
  }

  async function handleReview(action: "approve" | "reject") {
    if (!selectedApp) return;
    if (action === "reject" && !reviewNote.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/vendor-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          action,
          adminNote: reviewNote,
          commissionRate: action === "approve" ? commissionRate : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showNotif("success", data.message || "Updated");
      
      if (action === "approve" && data.vendor?.tempPassword) {
        setCredentials({
          email: data.vendor.email,
          password: data.vendor.tempPassword,
          storeSlug: data.vendor.storeSlug,
        });
      } else {
        setSelectedApp(null);
      }
      await load();
    } catch (err) {
      showNotif("error", err instanceof Error ? err.message : "Failed");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div>
      {notif && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2 ${notif.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {notif.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notif.msg}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {(["pending", "approved", "rejected", "all"] as const).map(f => {
          const active = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${active ? "text-white" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"}`} style={active ? { backgroundColor: BRAND_RED } : undefined}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          );
        })}
      </div>

      {/* SELECT ALL BAR */}
      {apps.length > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
            >
              {selectedIds.length === apps.length && apps.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-gray-900" />
              ) : selectedIds.length > 0 ? (
                <div className="w-4 h-4 rounded border-2 border-gray-900 bg-gray-900 flex items-center justify-center">
                  <div className="w-2 h-0.5 bg-white"></div>
                </div>
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span className="font-semibold text-gray-900">
                {selectedIds.length === apps.length && apps.length > 0
                  ? "Deselect all"
                  : "Select all"}
              </span>
            </button>
            <span className="text-xs text-gray-500 ml-2">
              {apps.length} visible
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
                onClick={() => bulkAction("approve")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-40"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={bulkProcessing}
                onClick={() => bulkAction("reject")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-40"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_RED }} /></div>
      ) : apps.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500">
          <Store className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          No {filter !== "all" ? filter : ""} applications
        </div>
      ) : (
        <div className="grid gap-3">
          {apps.map(app => (
            <div key={app.id} className={`bg-white rounded-xl border p-4 flex items-start justify-between flex-wrap gap-4 hover:shadow-md transition-shadow ${selectedIds.includes(app.id) ? "border-[#CA3F2E] ring-1 ring-[#CA3F2E]/30" : "border-gray-200"}`}>
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
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{app.storeName}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${app.status === "approved" ? "bg-green-100 text-green-800" : app.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{app.status}</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Applicant: {app.applicantName} ({app.email})</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1"><Phone className="w-3 h-3" /><span>{app.phone || app.whatsapp || "-"}</span></div>
                  <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /><span>{app.city || "-"}, {app.country}</span></div>
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /><span>{new Date(app.createdAt).toLocaleDateString()}</span></div>
                </div>
              </div>
              <button onClick={() => { setSelectedApp(app); setReviewNote(app.adminNote || ""); }} className="px-4 py-2 text-white text-sm font-semibold rounded-lg" style={{ backgroundColor: BRAND_RED }}>Review</button>
            </div>
          ))}
        </div>
      )}

      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedApp.storeName}</h2>
              <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <p><strong>Applicant:</strong> {selectedApp.applicantName} ({selectedApp.email})</p>
              <p><strong>Location:</strong> {selectedApp.city}, {selectedApp.country}</p>
              {selectedApp.storeDescription && <p><strong>Description:</strong> {selectedApp.storeDescription}</p>}
            </div>

            {selectedApp.status === "pending" && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Commission Rate %</label>
                  <input type="number" min="0" max="100" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} className="w-32 px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admin Note / Reason</label>
                  <textarea rows={3} value={reviewNote} onChange={e => setReviewNote(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Optional for approval, required for rejection..." />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleReview("reject")} disabled={processing} className="flex-1 py-2.5 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-xl text-sm disabled:opacity-50">Reject</button>
                  <button onClick={() => handleReview("approve")} disabled={processing} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm disabled:opacity-50">Approve</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}