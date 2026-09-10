"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams } from "next/navigation";
import { Loader2, Save, Wallet, User, Lock } from "lucide-react";

export default function AffiliateSettingsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    country: "",
    city: "",
    bankName: "USDT-TRC20",
    bankAccount: "",
    bankAccountName: "USDT TRC20 Wallet",
    preferredCurrency: "USD",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetch("/api/affiliate/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.affiliate) {
          const a = d.affiliate;
          setFormData({
            name: a.name || "",
            phone: a.phone || "",
            whatsapp: a.whatsapp || "",
            country: a.country || "",
            city: a.city || "",
            bankName: a.bankName || "USDT-TRC20",
            bankAccount: a.bankAccount || "",
            bankAccountName: a.bankAccountName || "USDT TRC20 Wallet",
            preferredCurrency: a.preferredCurrency || "USD",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const isValidTrc20 = (addr: string) =>
    !addr || /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr.trim());

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    if (formData.bankAccount && !isValidTrc20(formData.bankAccount)) {
      setErr(
        isFr
          ? "Adresse USDT TRC20 invalide (doit commencer par T, 34 caract\u00e8res)"
          : "Invalid USDT TRC20 address (must start with T, 34 characters)"
      );
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/affiliate/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            bankName: "USDT-TRC20",
            bankAccountName: "USDT TRC20 Wallet",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Save failed");
        setMsg(isFr ? "Profil enregistr\u00e9" : "Profile saved");
      } catch (e: any) {
        setErr(e.message || "Error");
      }
    });
  };

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    if (passwords.newPassword !== passwords.confirmPassword) {
      setErr(isFr ? "Les mots de passe ne correspondent pas" : "Passwords do not match");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/affiliate/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(passwords),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setMsg(isFr ? "Mot de passe mis \u00e0 jour" : "Password updated");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } catch (e: any) {
        setErr(e.message || "Error");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#CA3F2E]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">
          {isFr ? "Param\u00e8tres" : "Settings"}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {isFr
            ? "Mettez \u00e0 jour votre profil et votre portefeuille USDT TRC20."
            : "Update your profile and USDT TRC20 payout wallet."}
        </p>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
          {msg}
        </div>
      )}
      {err && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {err}
        </div>
      )}

      <form onSubmit={saveProfile} className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/10 space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <User className="w-4 h-4 text-[#CA3F2E]" />
          {isFr ? "Profil" : "Profile"}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{isFr ? "Nom" : "Name"}</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#CA3F2E]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{isFr ? "T\u00e9l\u00e9phone" : "Phone"}</label>
            <input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#CA3F2E]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">WhatsApp</label>
            <input
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#CA3F2E]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{isFr ? "Pays" : "Country"}</label>
            <input
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#CA3F2E]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">{isFr ? "Ville" : "City"}</label>
            <input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#CA3F2E]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Wallet className="w-4 h-4 text-[#CA3F2E]" />
            {isFr ? "Portefeuille de paiement (USDT TRC20)" : "Payout Wallet (USDT TRC20)"}
          </div>
          <p className="text-xs text-gray-400">
            {isFr
              ? "Les retraits affili\u00e9s sont envoy\u00e9s uniquement en USDT sur le r\u00e9seau TRC20 (Tron)."
              : "Affiliate withdrawals are paid only in USDT on the TRC20 (Tron) network."}
          </p>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              {isFr ? "Adresse USDT TRC20 *" : "USDT TRC20 Address *"}
            </label>
            <input
              value={formData.bankAccount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bankAccount: e.target.value,
                  bankName: "USDT-TRC20",
                  bankAccountName: "USDT TRC20 Wallet",
                })
              }
              placeholder="TXyz... (34 characters)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#CA3F2E]"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Network: <span className="text-[#CA3F2E] font-semibold">TRC20</span>
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white text-sm font-semibold disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isFr ? "Enregistrer" : "Save changes"}
        </button>
      </form>

      <form onSubmit={changePassword} className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Lock className="w-4 h-4 text-[#CA3F2E]" />
          {isFr ? "S\u00e9curit\u00e9" : "Security"}
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">
            {isFr ? "Mot de passe actuel" : "Current password"}
          </label>
          <input
            type="password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#CA3F2E]"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">
            {isFr ? "Nouveau mot de passe" : "New password"}
          </label>
          <input
            type="password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#CA3F2E]"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">
            {isFr ? "Confirmer" : "Confirm"}
          </label>
          <input
            type="password"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#CA3F2E]"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold disabled:opacity-50"
        >
          {isFr ? "Changer le mot de passe" : "Change password"}
        </button>
      </form>
    </div>
  );
}
