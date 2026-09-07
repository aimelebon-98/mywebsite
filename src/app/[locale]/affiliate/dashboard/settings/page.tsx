"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams } from "next/navigation";
import {
  User,
  CreditCard,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function AffiliateSettingsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const isFr = locale === "fr";

  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    country: "NG",
    city: "",
    bankName: "",
    bankAccount: "",
    bankAccountName: "",
    preferredCurrency: "USD",
  });

  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
            country: a.country || "NG",
            city: a.city || "",
            bankName: a.bankName || "",
            bankAccount: a.bankAccount || "",
            bankAccountName: a.bankAccountName || "",
            preferredCurrency: a.preferredCurrency || "USD",
          });
        }
      });
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/affiliate/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (!res.ok) {
          setMsg({ type: "error", text: data.error || "Failed to save settings" });
          return;
        }

        setMsg({
          type: "success",
          text: isFr ? "Param\u00e8tres enregistr\u00e9s avec succ\u00e8s !" : "Settings saved successfully!",
        });
      } catch {
        setMsg({ type: "error", text: "Network error" });
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/affiliate/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(passData),
        });

        const data = await res.json();
        if (!res.ok) {
          setPassMsg({ type: "error", text: data.error || "Failed to update password" });
          return;
        }

        setPassMsg({
          type: "success",
          text: isFr ? "Mot de passe mis \u00e0 jour avec succ\u00e8s !" : "Password updated successfully!",
        });
        setPassData({ currentPassword: "", newPassword: "" });
      } catch {
        setPassMsg({ type: "error", text: "Network error" });
      }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <Link
          href={`/${locale}/affiliate/dashboard`}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {isFr ? "Retour au tableau de bord" : "Back to dashboard"}
        </Link>
        <h1 className="text-2xl font-bold">
          {isFr ? "Param\u00e8tres du Compte" : "Account Settings"}
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          {isFr
            ? "Mettez \u00e0 jour vos coordonn\u00e9es, vos informations bancaires de virement et votre mot de passe."
            : "Update your profile, payout bank credentials, and security password."}
        </p>
      </div>

      {/* PROFILE & BANK SETTINGS FORM */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/10">
        <h2 className="text-base font-bold mb-6 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#CA3F2E]" />
          {isFr ? "Informations Personnelles & Bancaires" : "Personal & Payout Details"}
        </h2>

        {msg && (
          <div
            className={`mb-6 p-3 rounded-xl text-xs flex items-center gap-2 border ${
              msg.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {msg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 uppercase font-semibold mb-1.5">
                {isFr ? "Nom Complet" : "Full Name"}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#CA3F2E]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase font-semibold mb-1.5">
                WhatsApp
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#CA3F2E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 uppercase font-semibold mb-1.5">
                {isFr ? "Pays" : "Country"}
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#CA3F2E]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase font-semibold mb-1.5">
                {isFr ? "Devise de Retrait Pr\u00e9f\u00e9r\u00e9e" : "Preferred Payout Currency"}
              </label>
              <select
                value={formData.preferredCurrency}
                onChange={(e) => setFormData({ ...formData, preferredCurrency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-white text-xs focus:outline-none focus:border-[#CA3F2E]"
              >
                <option value="USD">USD ($)</option>
                <option value="NGN">NGN (\u20a6)</option>
                <option value="XOF">FCFA (XOF)</option>
                <option value="EUR">EUR (\u20ac)</option>
                <option value="GHS">GHS (GH\u20b5)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-4">
            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">
              {isFr ? "Coordonn\u00e9es Bancaires (Pour Virement)" : "Bank Details (For Wire Transfer)"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 uppercase font-semibold mb-1.5">
                  {isFr ? "Nom de la Banque" : "Bank Name"}
                </label>
                <input
                  type="text"
                  placeholder={isFr ? "ex: UBA, Ecobank, Zenith..." : "e.g. Zenith Bank, GTBank..."}
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#CA3F2E]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase font-semibold mb-1.5">
                  {isFr ? "Num\u00e9ro de Compte / IBAN" : "Account Number / IBAN"}
                </label>
                <input
                  type="text"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#CA3F2E]"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase font-semibold mb-1.5">
                  {isFr ? "Titulaire du Compte" : "Account Holder Name"}
                </label>
                <input
                  type="text"
                  value={formData.bankAccountName}
                  onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#CA3F2E]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="py-3 px-6 rounded-xl bg-[#CA3F2E] hover:bg-[#8B2A1E] text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isFr ? "Enregistrer les modifications" : "Save Changes"}</span>
          </button>
        </form>
      </div>

      {/* PASSWORD CHANGE FORM */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/10">
        <h2 className="text-base font-bold mb-6 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" />
          {isFr ? "Changer de Mot de Passe" : "Change Password"}
        </h2>

        {passMsg && (
          <div
            className={`mb-6 p-3 rounded-xl text-xs flex items-center gap-2 border ${
              passMsg.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {passMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{passMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs text-gray-400 uppercase font-semibold mb-1.5">
              {isFr ? "Mot de Passe Actuel" : "Current Password"}
            </label>
            <input
              type="password"
              required
              value={passData.currentPassword}
              onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#CA3F2E]"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase font-semibold mb-1.5">
              {isFr ? "Nouveau Mot de Passe" : "New Password"}
            </label>
            <input
              type="password"
              required
              value={passData.newPassword}
              onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#CA3F2E]"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="py-3 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isFr ? "Mettre \u00e0 jour le mot de passe" : "Update Password"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}