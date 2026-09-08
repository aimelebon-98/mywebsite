import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureSubscriptionTablesExist } from "@/lib/ensure-subscription-tables";
import { formatExpiry } from "@/lib/subscription-pricing";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PageProps { params: Promise<{ locale: string }>; searchParams: Promise<{ order?: string }>; }
export const dynamic = "force-dynamic";

export default async function SubscriptionSuccessPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { order } = await searchParams;
  if (!order) notFound();
  await ensureSubscriptionTablesExist();
  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.orderNumber, order)).limit(1);
  if (!sub) notFound();

  const isFr = locale === "fr";
  const active = sub.status === "active";

  return (
    <div className="min-h-[70vh] py-16 px-4 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-8 shadow-xl">
        <div className="text-center space-y-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${active ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600" : "bg-amber-100 dark:bg-amber-950/60 text-amber-600"}`}>
            {active ? <CheckCircle2 className="w-10 h-10" /> : <Clock className="w-10 h-10 animate-pulse" />}
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">{sub.orderNumber}</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-3">
              {active ? (isFr ? "Abonnement Actif !" : "Subscription Active!") : (isFr ? "En attente de confirmation" : "Awaiting Confirmation")}
            </h1>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 space-y-4 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-zinc-800"><span className="text-gray-500">{isFr ? "Produit" : "Product"}</span><span className="font-bold text-gray-900 dark:text-white">{sub.productName}</span></div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-zinc-800"><span className="text-gray-500">{isFr ? "Dur\u00e9e" : "Term"}</span><span className="font-semibold">{sub.months} {sub.months === 12 ? (isFr ? "an" : "year") : isFr ? "mois" : "months"}</span></div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-zinc-800"><span className="text-gray-500">{isFr ? "Total pay\u00e9" : "Total Paid"}</span><span className="font-mono font-bold text-emerald-600">${Number(sub.totalPaid).toFixed(2)} USD</span></div>
          {sub.expiresAt && <div className="flex justify-between py-2 border-b border-gray-100 dark:border-zinc-800"><span className="text-gray-500">{isFr ? "Expire le" : "Valid Until"}</span><span className="font-semibold">{formatExpiry(new Date(sub.expiresAt), locale)}</span></div>}
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link href={`/${locale}`} className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 transition">{isFr ? "Boutique" : "Store"}</Link>
          <Link href={`/${locale}/contact`} className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition">{isFr ? "Acc\u00e8s & Support" : "Access & Support"} <ArrowRight className="w-4 h-4 ml-1" /></Link>
        </div>
      </div>
    </div>
  );
}