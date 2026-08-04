"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import Navbar from "@/components/Navbar";
import AccountSidebar from "@/components/AccountSidebar";
import AccountMobileBar from "@/components/AccountMobileBar";
import Footer from "@/components/Footer";
import {
  Shield, Loader2, Monitor, Smartphone, AlertTriangle,
  Trash2, LogOut, CheckCircle, RefreshCw, X
} from "lucide-react";

function d(s: string): string {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

interface SessionRow {
  token: string;
  tokenFull: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

function getDeviceIcon(ua: string | null) {
  if (!ua) return <Monitor className="w-4 h-4" />;
  const u = ua.toLowerCase();
  if (u.includes("mobile") || u.includes("android") || u.includes("iphone")) {
    return <Smartphone className="w-4 h-4" />;
  }
  return <Monitor className="w-4 h-4" />;
}

function getBrowserName(ua: string | null): string {
  if (!ua) return "Unknown";
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
  return "Browser";
}

function getOsName(ua: string | null): string {
  if (!ua) return "";
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Linux")) return "Linux";
  return "";
}

export default function Page() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const router = useRouter();
  const { customer, loading, logout } = useCustomer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [signOutAllLoading, setSignOutAllLoading] = useState(false);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    if (!loading && !customer) router.push(`/${locale}/account/login`);
  }, [loading, customer, locale, router]);

  const fetchSessions = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/customer/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch { /* ignore */ }
    setFetching(false);
  }, []);

  useEffect(() => {
    if (customer) fetchSessions();
  }, [customer, fetchSessions]);

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleRevokeSession = async (tokenFull: string, isCurrent: boolean) => {
    setRevokingToken(tokenFull);
    try {
      const res = await fetch("/api/customer/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenFull }),
      });
      if (res.ok) {
        if (isCurrent) {
          logout();
        } else {
          setSessions(prev => prev.filter(s => s.tokenFull !== tokenFull));
          showNotif(isFr ? "Session r\u00e9voqu\u00e9e" : "Session revoked");
        }
      }
    } catch { /* ignore */ }
    setRevokingToken(null);
  };

  const handleSignOutAll = async () => {
    if (!confirm(isFr
      ? d("Se d\u00e9connecter de tous les appareils ?")
      : "Sign out of all devices?")) return;
    setSignOutAllLoading(true);
    try {
      const res = await fetch("/api/customer/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) logout();
    } catch { /* ignore */ }
    setSignOutAllLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError(isFr ? "Mot de passe requis" : "Password required");
      return;
    }
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/customer/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        window.location.href = `/${locale}`;
      } else {
        setDeleteError(data.error || (isFr ? "Mot de passe incorrect" : "Incorrect password"));
      }
    } catch {
      setDeleteError(isFr ? d("Erreur r\u00e9seau") : "Network error");
    }
    setDeleteLoading(false);
  };

  if (loading || !customer) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" />
    </div>
  );

  const title = isFr ? d("S\u00e9curit\u00e9") : "Security";

  return (
    <>
      <Navbar />
      <AccountSidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Notification toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-green-600 text-white rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold animate-slide-in">
          <CheckCircle className="w-4 h-4" />
          {notification}
        </div>
      )}

      {/* Delete account modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-black text-gray-900">
                  {isFr ? d("Supprimer le compte") : "Delete Account"}
                </h3>
              </div>
              <button onClick={() => { setShowDeleteModal(false); setDeletePassword(""); setDeleteError(""); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
              <p className="text-sm text-red-800 font-semibold mb-1">
                {isFr ? d("Cette action est irr\u00e9versible") : "This action is irreversible"}
              </p>
              <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                <li>{isFr ? d("Votre compte sera d\u00e9finitivement supprim\u00e9") : "Your account will be permanently deleted"}</li>
                <li>{isFr ? "Vos adresses et favoris seront supprimés" : "Your addresses and wishlist will be deleted"}</li>
                <li>{isFr ? d("L\u0027historique de commandes sera conserv\u00e9 de fa\u00e7on anonyme") : "Order history will be kept anonymously"}</li>
              </ul>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {isFr ? "Confirmez votre mot de passe" : "Confirm your password"}
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={e => { setDeletePassword(e.target.value); setDeleteError(""); }}
                placeholder={isFr ? "Votre mot de passe" : "Your password"}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                onKeyDown={e => e.key === "Enter" && handleDeleteAccount()}
                autoFocus
              />
              {deleteError && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {deleteError}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletePassword(""); setDeleteError(""); }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
              >
                {isFr ? "Annuler" : "Cancel"}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isFr ? d("Supprimer d\u00e9finitivement") : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-gray-50 pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
            <div className="hidden lg:block"><AccountSidebar /></div>
            <div>
              <AccountMobileBar title={title} onOpen={() => setMenuOpen(true)} />

              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 lg:w-7 lg:h-7 text-[#CA3F2E]" />
                <h1 className="text-2xl lg:text-3xl font-black text-gray-900">{title}</h1>
              </div>

              <div className="space-y-4">

                {/* Active Sessions */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-bold text-gray-900">
                        {isFr ? "Sessions actives" : "Active Sessions"}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isFr
                          ? d("Appareils actuellement connect\u00e9s \u00e0 votre compte")
                          : "Devices currently signed in to your account"}
                      </p>
                    </div>
                    <button onClick={fetchSessions} className="p-2 rounded-xl hover:bg-gray-100 transition">
                      <RefreshCw className={"w-4 h-4 text-gray-500" + (fetching ? " animate-spin" : "")} />
                    </button>
                  </div>

                  {fetching ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[#CA3F2E]" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">
                      {isFr ? "Aucune session active" : "No active sessions"}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {sessions.map(s => (
                        <div key={s.tokenFull}
                          className={`flex items-center gap-3 p-4 rounded-xl border ${s.isCurrent ? "border-[#CA3F2E] bg-red-50/40" : "border-gray-100 bg-gray-50"}`}>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.isCurrent ? "bg-[#CA3F2E] text-white" : "bg-gray-200 text-gray-600"}`}>
                            {getDeviceIcon(s.userAgent)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-gray-900">
                                {getBrowserName(s.userAgent)}
                                {getOsName(s.userAgent) ? ` on ${getOsName(s.userAgent)}` : ""}
                              </span>
                              {s.isCurrent && (
                                <span className="text-[10px] font-bold text-[#CA3F2E] bg-red-100 px-2 py-0.5 rounded-full">
                                  {isFr ? "Cet appareil" : "This device"}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 flex-wrap">
                              {s.ipAddress && <span>{s.ipAddress}</span>}
                              <span>
                                {isFr ? "Connecté" : "Signed in"}{" "}
                                {new Date(s.createdAt).toLocaleDateString(isFr ? "fr-FR" : "en-US", {
                                  month: "short", day: "numeric", year: "numeric"
                                })}
                              </span>
                              <span>
                                {isFr ? d("Expire le") : "Expires"}{" "}
                                {new Date(s.expiresAt).toLocaleDateString(isFr ? "fr-FR" : "en-US", {
                                  month: "short", day: "numeric"
                                })}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRevokeSession(s.tokenFull, s.isCurrent)}
                            disabled={revokingToken === s.tokenFull}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition disabled:opacity-40 flex-shrink-0"
                            title={s.isCurrent ? (isFr ? d("Se d\u00e9connecter") : "Sign out") : (isFr ? d("R\u00e9voquer") : "Revoke")}
                          >
                            {revokingToken === s.tokenFull
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : s.isCurrent ? <LogOut className="w-4 h-4" /> : <X className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {sessions.length > 1 && (
                    <button
                      onClick={handleSignOutAll}
                      disabled={signOutAllLoading}
                      className="mt-4 w-full py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {signOutAllLoading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <LogOut className="w-4 h-4" />}
                      {isFr ? d("Se d\u00e9connecter de tous les appareils") : "Sign out of all devices"}
                    </button>
                  )}
                </div>

                {/* Account Info */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h2 className="font-bold text-gray-900 mb-3">
                    {isFr ? "Informations du compte" : "Account Information"}
                  </h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-50">
                      <span className="text-gray-500">Email</span>
                      <span className="font-semibold text-gray-900">{customer.email}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">{isFr ? "Membre depuis" : "Member since"}</span>
                      <span className="font-semibold text-gray-900">
                        {new Date().toLocaleDateString(isFr ? "fr-FR" : "en-US", { year: "numeric", month: "long" })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white border border-red-200 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h2 className="font-bold text-red-700">
                      {isFr ? "Zone de danger" : "Danger Zone"}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {isFr
                      ? d("La suppression de votre compte est d\u00e9finitive et ne peut pas \u00eatre annul\u00e9e.")
                      : "Deleting your account is permanent and cannot be undone."}
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isFr ? d("Supprimer mon compte") : "Delete my account"}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
