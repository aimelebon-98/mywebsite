"use client";

import { useState, useEffect } from "react";
import { Store, Check, X, Mail, Phone, MapPin, Globe, Calendar, Copy, CheckCheck, Loader2 } from "lucide-react";

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

  async function loadApps() {
    setLoading(true);
    try {
      const url = filter === "all" ? "/api/admin/vendor-applications" : `/api/admin/vendor-applications?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setApps(data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadApps(); }, [filter]);

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
          locale: "en",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      if (action === "approve" && data.vendor) {
        setCredentials({
          email: data.vendor.email,
          password: data.vendor.tempPassword,
          storeSlug: data.vendor.storeSlug,
        });
      } else {
        setSelectedApp(null);
        setReviewNote("");
      }
      await loadApps();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setProcessing(false);
    }
  }

  function closeCredentials() {
    setCredentials(null);
    setSelectedApp(null);
    setReviewNote("");
    setCommissionRate("10");
  }

  function copyCredentials() {
    if (!credentials) return;
    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}\nStore URL: /store/${credentials.storeSlug}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const pendingCount = apps.filter(a => a.status === "pending").length;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {(["pending", "approved", "rejected", "all"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-red-600 text-white" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "pending" && pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-white text-red-600">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-500">
          <Store className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          No {filter !== "all" ? filter : ""} applications
        </div>
      ) : (
        <div className="grid gap-3">
          {apps.map(app => {
            let cats: string[] = [];
            try { cats = JSON.parse(app.productCategories || "[]"); } catch {}
            const statusColors: Record<string, string> = {
              pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
              approved: "bg-green-100 text-green-800 border-green-200",
              rejected: "bg-red-100 text-red-800 border-red-200",
            };
            return (
              <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">{app.storeName}</h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusColors[app.status]}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">by {app.applicantName}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{app.email}</div>
                      {app.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{app.phone}</div>}
                      <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{app.city}, {app.country}</div>
                      <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(app.createdAt).toLocaleDateString()}</div>
                    </div>
                    {cats.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {cats.map(c => (
                          <span key={c} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setSelectedApp(app)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors">
                    Review
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedApp && !credentials && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">{selectedApp.storeName}</h2>
              <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Name</div>
                  <div className="text-gray-900">{selectedApp.applicantName}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Email</div>
                  <div className="text-gray-900 break-all">{selectedApp.email}</div>
                </div>
                {selectedApp.phone && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Phone</div>
                    <div className="text-gray-900">{selectedApp.phone}</div>
                  </div>
                )}
                {selectedApp.whatsapp && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">WhatsApp</div>
                    <div className="text-gray-900">{selectedApp.whatsapp}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Country</div>
                  <div className="text-gray-900">{selectedApp.country}</div>
                </div>
                {selectedApp.city && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">City</div>
                    <div className="text-gray-900">{selectedApp.city}</div>
                  </div>
                )}
              </div>

              {selectedApp.storeDescription && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Store Description</div>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedApp.storeDescription}</p>
                </div>
              )}

              {selectedApp.instagramUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <InstagramIcon className="w-4 h-4 text-pink-500" />
                  <a href={selectedApp.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline break-all">{selectedApp.instagramUrl}</a>
                </div>
              )}

              {selectedApp.websiteUrl && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <a href={selectedApp.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline break-all">{selectedApp.websiteUrl}</a>
                </div>
              )}

              {selectedApp.additionalInfo && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Additional Info</div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedApp.additionalInfo}</p>
                </div>
              )}

              {selectedApp.status === "pending" ? (
                <div className="border-t border-gray-200 pt-5 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Commission Rate (%)</label>
                    <input type="number" min="0" max="100" step="0.5" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
                    <p className="text-xs text-gray-500 mt-1">Default 10%. Vendor keeps the remainder.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Note</label>
                    <textarea rows={3} placeholder="Optional for approval, required for rejection..." value={reviewNote} onChange={e => setReviewNote(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleReview("reject")} disabled={processing} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-red-300 text-red-700 font-semibold rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors">
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                    <button onClick={() => handleReview("approve")} disabled={processing} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors">
                      {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Approve
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Admin Note</div>
                  <p className="text-sm text-gray-700">{selectedApp.adminNote || "-"}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    Reviewed: {selectedApp.reviewedAt ? new Date(selectedApp.reviewedAt).toLocaleString() : "-"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {credentials && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Vendor Approved!</h2>
              <p className="text-sm text-gray-500 mt-1">Credentials have been emailed. You can also copy them here.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-4">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Email</div>
                <div className="font-mono text-sm text-gray-900 break-all">{credentials.email}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Temporary Password</div>
                <div className="font-mono text-base font-bold text-red-600 tracking-widest">{credentials.password}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Store URL</div>
                <div className="font-mono text-sm text-gray-900">/store/{credentials.storeSlug}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={copyCredentials} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors">
                {copied ? <CheckCheck className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy All"}
              </button>
              <button onClick={closeCredentials} className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}