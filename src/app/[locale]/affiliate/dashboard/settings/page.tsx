"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Shield,
  Wallet,
  User,
  Lock,
  Loader2,
  CheckCircle2,
  QrCode,
  Copy,
  CheckCheck,
  AlertCircle,
  Save,
} from "lucide-react";

export default function AffiliateSettingsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [activeTab, setActiveTab] = useState<"security" | "wallet" | "profile">("security");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 2FA state
  const [totpSecret, setTotpSecret] = useState("");
  const [totpQr, setTotpQr] = useState("");
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Profile & Wallet state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    country: "",
    city: "",
    bankAccount: "",
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    fetch("/api/affiliate/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.affiliate) {
          setForm((f) => ({
            ...f,
            name: d.affiliate.name || "",
            email: d.affiliate.email || "",
            phone: d.affiliate.phone || "",
            whatsapp: d.affiliate.whatsapp || "",
            country: d.affiliate.country || "",
            city: d.affiliate.city || "",
            bankAccount: d.affiliate.bankAccount || "",
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/affiliate/settings/2fa")
      .then((r) => r.json())
      .then((d) => {
        if (d?.success) {
          setTotpSecret(d.secret);
          setTotpQr(d.qrUrl);
          setTotpEnabled(d.enabled);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggle2FA = async (enable: boolean) => {
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch("/api/affiliate/settings/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: enable ? "enable" : "disable",
          code: verifyCode,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");

      setTotpEnabled(d.enabled);
      setVerifyCode("");
      setMsg({
        type: "success",
        text: enable
          ? isFr
            ? "Google Authenticator activ\u00e9 avec succ\u00e8s !"
            : "Google Authenticator enabled successfully!"
          : isFr
          ? "2FA d\u00e9sactiv\u00e9."
          : "2FA disabled.",
      });
    } catch (e: any) {
      setMsg({ type: "error", text: e.message || "Error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setSaving(true);

    try {
      const res = await fetch("/api/affiliate/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");

      setMsg({
        type: "success",
        text: isFr ? "Param\u00e8tres enregistr\u00e9s !" : "Settings saved successfully!",
      });
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
    } catch (e: any) {
      setMsg({ type: "error", text: e.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" />
      </div>
    );
  }

  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpQr)}`;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">{isFr ? "Param\u00e8tres du compte" : "Account Settings"}</h1>
        <p className="text-xs text-gray-400 mt-1">
          {isFr
            ? "S\u00e9curisez votre compte avec la 2FA Google, g\u00e9rez votre portefeuille USDT et votre profil."
            : "Secure your account with Google 2FA, manage your USDT payout wallet and profile."}
        </p>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            msg.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/40 border-red-500/30 text-red-300"
          }`}
        >
          {msg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "security"
              ? "border-[#CA3F2E] text-white"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Shield className="w-4 h-4" />
          {isFr ? "S\u00e9curit\u00e9 & 2FA" : "Security & 2FA"}
        </button>
        <button
          onClick={() => setActiveTab("wallet")}
          className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "wallet"
              ? "border-[#CA3F2E] text-white"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Wallet className="w-4 h-4" />
          {isFr ? "Portefeuille USDT" : "USDT Wallet"}
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "profile"
              ? "border-[#CA3F2E] text-white"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <User className="w-4 h-4" />
          {isFr ? "Profil & Contact" : "Profile & Contact"}
        </button>
      </div>

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#CA3F2E]" />
                  Google Authenticator (2FA TOTP)
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {isFr
                    ? "Exige un code de 6 chiffres depuis votre application Google Authenticator lors de chaque connexion."
                    : "Require a 6-digit code from Google Authenticator app on every login."}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  totpEnabled
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-gray-500/20 border-gray-500/40 text-gray-400"
                }`}
              >
                {totpEnabled ? (isFr ? "ACTIV\u00c9" : "ENABLED") : isFr ? "D\u00c9SACTIV\u00c9" : "DISABLED"}
              </span>
            </div>

            {!totpEnabled ? (
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-black/40 border border-white/5">
                  <div className="w-36 h-36 bg-white p-2 rounded-xl flex items-center justify-center flex-shrink-0">
                    <img src={qrImgUrl} alt="QR Code" className="w-full h-full object-contain" />
                  </div>
                  <div className="space-y-2 text-xs text-gray-300">
                    <p className="font-bold text-white">
                      1. {isFr ? "Scannez ce QR code dans Google Authenticator" : "Scan this QR code in Google Authenticator"}
                    </p>
                    <p className="text-gray-400">
                      {isFr
                        ? "Ou saisissez cette cl\u00e9 secr\u00e8te manuellement :"
                        : "Or enter this secret key manually:"}
                    </p>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 font-mono text-emerald-400 text-sm font-bold">
                      <span>{totpSecret}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(totpSecret);
                          setCopiedSecret(true);
                          setTimeout(() => setCopiedSecret(false), 2000);
                        }}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        {copiedSecret ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    2. {isFr ? "Saisissez le code \u00e0 6 chiffres pour activer :" : "Enter 6-digit code to activate:"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      placeholder="123456"
                      className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 font-mono text-center tracking-widest text-lg text-white focus:outline-none focus:border-[#CA3F2E] w-36"
                    />
                    <button
                      type="button"
                      disabled={saving || verifyCode.trim().length !== 6}
                      onClick={() => handleToggle2FA(true)}
                      className="px-5 py-2.5 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white text-xs font-bold transition disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isFr ? "Activer 2FA" : "Enable 2FA"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleToggle2FA(false)}
                  className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold transition"
                >
                  {isFr ? "D\u00e9sactiver Google Authenticator" : "Disable Google Authenticator"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wallet Tab */}
      {activeTab === "wallet" && (
        <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            {isFr ? "Portefeuille de Retrait USDT (TRC20)" : "USDT Payout Wallet (TRC20)"}
          </h2>
          <p className="text-xs text-gray-400">
            {isFr
              ? "Toutes les commissions sont vers\u00e9es en USDT TRC20 sur cette adresse."
              : "All commission payouts are transferred in USDT TRC20 to this wallet address."}
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              {isFr ? "Adresse USDT TRC20" : "USDT TRC20 Wallet Address"}
            </label>
            <input
              type="text"
              value={form.bankAccount}
              onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
              placeholder="T..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 font-mono text-sm text-white focus:outline-none focus:border-[#CA3F2E]"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-bold text-xs transition flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isFr ? "Enregistrer l'adresse" : "Save Wallet Address"}
          </button>
        </form>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-sky-400" />
            {isFr ? "Informations Personnelles" : "Personal Information"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                {isFr ? "Nom complet" : "Full Name"}
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#CA3F2E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                disabled
                value={form.email}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                {isFr ? "T\u00e9l\u00e9phone" : "Phone"}
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#CA3F2E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                WhatsApp
              </label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#CA3F2E]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-bold text-xs transition flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isFr ? "Enregistrer le profil" : "Save Profile"}
          </button>
        </form>
      )}
    </div>
  );
}