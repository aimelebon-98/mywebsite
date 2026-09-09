"use client";

import { Clock } from "lucide-react";

export default function PendingApprovalBanner({
  isFr = false,
  type = "vendor",
}: {
  isFr?: boolean;
  type?: "vendor" | "affiliate";
}) {
  const title = isFr
    ? "Compte en attente de verification"
    : "Account pending verification";

  const msg =
    type === "vendor"
      ? isFr
        ? "Votre boutique est en cours d'examen. Vous pouvez explorer le tableau de bord, mais la mise en ligne de produits et les paiements seront actives apres approbation (24-48h)."
        : "Your store is under review. You can explore the dashboard, but product listing and payouts unlock after admin approval (usually 24-48h)."
      : isFr
      ? "Votre compte affilié est en cours d'examen. Vos liens seront actifs apres approbation (24-48h)."
      : "Your affiliate account is under review. Referral links and commissions unlock after admin approval (usually 24-48h).";

  return (
    <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 flex gap-3 items-start">
      <div className="mt-0.5 w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
        <Clock className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-amber-900">{title}</p>
        <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">{msg}</p>
      </div>
    </div>
  );
}