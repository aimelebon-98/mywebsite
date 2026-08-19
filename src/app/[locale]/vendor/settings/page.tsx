"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Loader2, Store, Upload, User, CreditCard, Lock, Save, CheckCircle2, AlertCircle, Eye, EyeOff, ImageIcon } from "lucide-react";

const BRAND_RED = "#CA3F2E";
const BRAND_RED_DARK = "#8B2A1E";

interface VendorSettings {
  email: string;
  storeName: string;
  storeSlug: string;
  storeDescription: string;
  storeDescriptionFr: string;
  logo: string;
  banner: string;
  trustTagline: string;
  trustTaglineFr: string;
  contactName: string;
  phone: string;
  whatsapp: string;
  country: string;
  city: string;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  commissionRate: string;
}

const COUNTRIES = [
  { value: "NG", label: "Nigeria" },
  { value: "TG", label: "Togo" },
  { value: "GH", label: "Ghana" },
  { value: "BJ", label: "Benin" },
  { value: "CI", label: "Ivory Coast" },
  { value: "SN", label: "Senegal" },
  { value: "ML", label: "Mali" },
  { value: "BF", label: "Burkina Faso" },
  { value: "KE", label: "Kenya" },
  { value: "ZA", label: "South Africa" },
  { value: "FR", label: "France" },
  { value: "US", label: "United States" },
  { value: "OTHER", label: "Other" },
];

type Tab = "store" | "contact" | "bank" | "password";

export default function VendorSettingsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [settings, setSettings] = useState<VendorSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("store");
  const [notif, setNotif] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Password state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  // Upload state
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/vendor/settings");
        const data = await res.json();
        setSettings(data.settings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function showNotif(type: "success" | "error", msg: string) {
    setNotif({ type, msg });
    setTimeout(() => setNotif(null), 4000);
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/vendor/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showNotif("success", "Settings saved");
    } catch (err) {
      showNotif("error", err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(kind: "logo" | "banner", file: File) {
    if (kind === "logo") setUploadingLogo(true); else setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);
      const res = await fetch("/api/vendor/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      if (settings) {
        const updated = { ...settings, [kind]: data.url };
        setSettings(updated);
        // Auto-save the URL
        await fetch("/api/vendor/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [kind]: data.url }),
        });
        showNotif("success", kind === "logo" ? "Logo updated" : "Banner updated");
      }
    } catch (err) {
      showNotif("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      if (kind === "logo") setUploadingLogo(false); else setUploadingBanner(false);
    }
  }

  async function handleChangePassword() {
    if (newPwd !== confirmPwd) {
      showNotif("error", "New passwords do not match");
      return;
    }
    if (newPwd.length < 8) {
      showNotif("error", "New password must be at least 8 characters");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/vendor/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showNotif("success", "Password updated");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err) {
      showNotif("error", err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_RED }} /></div>;
  }

  const tabs: Array<{ id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "store", label: "Store profile", icon: Store },
    { id: "contact", label: "Contact info", icon: User },
    { id: "bank", label: "Bank details", icon: CreditCard },
    { id: "password", label: "Password", icon: Lock },
  ];

  return (
    <div className="max-w-4xl">
      {notif && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2 ${notif.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {notif.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notif.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Store settings</h1>
        <p className="text-gray-500 text-sm">Manage your store profile, contact info and account</p>
      </div>

      {/* Commission info */}
      <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 font-semibold uppercase">Your commission rate</div>
          <div className="text-lg font-bold text-gray-900 mt-1">You keep {(100 - parseFloat(settings.commissionRate)).toFixed(1)}% of each sale</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 font-semibold uppercase">Platform fee</div>
          <div className="text-2xl font-black" style={{ color: BRAND_RED }}>{parseFloat(settings.commissionRate).toFixed(1)}%</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition ${active ? "text-gray-900" : "text-gray-500 border-transparent hover:text-gray-700"}`}
              style={active ? { borderBottomColor: BRAND_RED, color: BRAND_RED } : undefined}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Store profile tab */}
      {tab === "store" && (
        <div className="space-y-6">
          {/* Logo + Banner */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Store branding</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Logo (square)</label>
                <div className="flex items-center gap-4">
                  {settings.logo ? (
                    <img src={settings.logo} alt="Logo" className="w-20 h-20 rounded-2xl object-cover border border-gray-200" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => logoRef.current?.click()}
                    disabled={uploadingLogo}
                    className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                    style={{ backgroundColor: BRAND_RED }}
                    onMouseOver={e => { if (!uploadingLogo) e.currentTarget.style.backgroundColor = BRAND_RED_DARK; }}
                    onMouseOut={e => { if (!uploadingLogo) e.currentTarget.style.backgroundColor = BRAND_RED; }}
                  >
                    {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload logo
                  </button>
                  <input
                    ref={logoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload("logo", f); }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Recommended: 400x400 px, max 5 MB</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Banner (wide)</label>
                <div className="flex items-center gap-4">
                  {settings.banner ? (
                    <img src={settings.banner} alt="Banner" className="w-32 h-16 rounded-xl object-cover border border-gray-200" />
                  ) : (
                    <div className="w-32 h-16 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => bannerRef.current?.click()}
                    disabled={uploadingBanner}
                    className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                    style={{ backgroundColor: BRAND_RED }}
                    onMouseOver={e => { if (!uploadingBanner) e.currentTarget.style.backgroundColor = BRAND_RED_DARK; }}
                    onMouseOut={e => { if (!uploadingBanner) e.currentTarget.style.backgroundColor = BRAND_RED; }}
                  >
                    {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload banner
                  </button>
                  <input
                    ref={bannerRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload("banner", f); }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Recommended: 1600x400 px, max 5 MB</p>
              </div>
            </div>
          </div>

          {/* Store info */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-900">Store information</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store name</label>
              <input type="text" value={settings.storeName} onChange={e => setSettings({ ...settings, storeName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
              <p className="text-xs text-gray-500 mt-1">Store URL: /store/{settings.storeSlug} (URL slug cannot be changed)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store description (English)</label>
              <textarea rows={3} value={settings.storeDescription} onChange={e => setSettings({ ...settings, storeDescription: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Store description (French)</label>
              <textarea rows={3} value={settings.storeDescriptionFr} onChange={e => setSettings({ ...settings, storeDescriptionFr: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trust tagline (English)</label>
                <input type="text" value={settings.trustTagline} onChange={e => setSettings({ ...settings, trustTagline: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
                <p className="text-xs text-gray-500 mt-1">Shown on your product pages (e.g. &quot;2+ years selling premium footwear&quot;)</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trust tagline (French)</label>
                <input type="text" value={settings.trustTaglineFr} onChange={e => setSettings({ ...settings, trustTaglineFr: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <SaveButton onClick={handleSave} saving={saving} />
          </div>
        </div>
      )}

      {/* Contact tab */}
      {tab === "contact" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-900">Contact information</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email (login)</label>
              <input type="email" value={settings.email} disabled className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500" />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact support to update.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact name</label>
              <input type="text" value={settings.contactName} onChange={e => setSettings({ ...settings, contactName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                <input type="tel" value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp</label>
                <input type="tel" value={settings.whatsapp} onChange={e => setSettings({ ...settings, whatsapp: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
                <select value={settings.country} onChange={e => setSettings({ ...settings, country: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white">
                  {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                <input type="text" value={settings.city} onChange={e => setSettings({ ...settings, city: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <SaveButton onClick={handleSave} saving={saving} />
          </div>
        </div>
      )}

      {/* Bank tab */}
      {tab === "bank" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-900">Bank details for payouts</h3>
            <p className="text-sm text-gray-500">This is where we send your earnings when you request a payout.</p>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bank name</label>
              <input type="text" placeholder="e.g. UBA, GTBank, Ecobank..." value={settings.bankName} onChange={e => setSettings({ ...settings, bankName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account number</label>
              <input type="text" placeholder="1234567890" value={settings.bankAccount} onChange={e => setSettings({ ...settings, bankAccount: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account name (as on bank record)</label>
              <input type="text" placeholder="Full name" value={settings.bankAccountName} onChange={e => setSettings({ ...settings, bankAccountName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>

          <div className="flex justify-end">
            <SaveButton onClick={handleSave} saving={saving} />
          </div>
        </div>
      )}

      {/* Password tab */}
      {tab === "password" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-900">Change password</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current password</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm pr-10" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">New password</label>
              <input type={showPwd ? "text" : "password"} value={newPwd} onChange={e => setNewPwd(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm new password</label>
              <input type={showPwd ? "text" : "password"} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleChangePassword}
                disabled={saving || !currentPwd || !newPwd || !confirmPwd}
                className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: BRAND_RED }}
                onMouseOver={e => { if (!saving) e.currentTarget.style.backgroundColor = BRAND_RED_DARK; }}
                onMouseOut={e => { if (!saving) e.currentTarget.style.backgroundColor = BRAND_RED; }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Update password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
      style={{ backgroundColor: BRAND_RED }}
      onMouseOver={e => { if (!saving) e.currentTarget.style.backgroundColor = BRAND_RED_DARK; }}
      onMouseOut={e => { if (!saving) e.currentTarget.style.backgroundColor = BRAND_RED; }}
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      Save changes
    </button>
  );
}