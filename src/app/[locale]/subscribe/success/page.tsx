import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureSubscriptionTablesExist } from "@/lib/ensure-subscription-tables";
import { formatExpiry } from "@/lib/subscription-pricing";
import { CheckCircle2, Clock, Send, Store } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}

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

  const telegramMsg = isFr
    ? `Bonjour ! Je viens de m'abonner \u00e0 SMZ AI Trading Bot Pro. Mon num\u00e9ro de commande est : ${sub.orderNumber}. Merci de m'envoyer le lien du canal de signaux.`
    : `Hello! I just subscribed to SMZ AI Trading Bot Pro. My Order Number is: ${sub.orderNumber}. Please send me the signals channel link.`;

  const telegramUrl = `https://t.me/livetraderu?text=${encodeURIComponent(telegramMsg)}`;

  return (
    <div className="min-h-[70vh] py-16 px-4 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-8 shadow-xl">
        <div className="text-center space-y-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
              active
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600"
                : "bg-amber-100 dark:bg-amber-950/60 text-amber-600"
            }`}
          >
            {active ? <CheckCircle2 className="w-10 h-10" /> : <Clock className="w-10 h-10 animate-pulse" />}
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300">
              {sub.orderNumber}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-3">
              {active
                ? isFr
                  ? "Abonnement Actif !"
                  : "Subscription Active!"
                : isFr
                ? "En attente de confirmation"
                : "Awaiting Confirmation"}
            </h1>
            <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto">
              {isFr
                ? "Cliquez sur le bouton ci-dessous pour contacter @livetraderu sur Telegram et obtenir le lien d'acc\u00e8s au canal VIP de signaux."
                : "Click below to contact @livetraderu on Telegram to receive your VIP signals channel access link."}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 space-y-4 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-zinc-800">
            <span className="text-gray-500">{isFr ? "Produit" : "Product"}</span>
            <span className="font-bold text-gray-900 dark:text-white">{sub.productName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-zinc-800">
            <span className="text-gray-500">{isFr ? "Dur\u00e9e" : "Term"}</span>
            <span className="font-semibold">
              {sub.months} {sub.months === 12 ? (isFr ? "an" : "year") : isFr ? "mois" : "months"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-zinc-800">
            <span className="text-gray-500">{isFr ? "Total pay\u00e9" : "Total Paid"}</span>
            <span className="font-mono font-bold text-emerald-600">${Number(sub.totalPaid).toFixed(2)} USD</span>
          </div>
          {sub.expiresAt && (
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-zinc-800">
              <span className="text-gray-500">{isFr ? "Expire le" : "Valid Until"}</span>
              <span className="font-semibold">{formatExpiry(new Date(sub.expiresAt), locale)}</span>
            </div>
          )}
        </div>

        {/* TELEGRAM CTA BUTTON */}
        <div className="mt-8 space-y-3">
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#229ED9] hover:bg-[#1b88bd] text-white text-base font-extrabold shadow-lg shadow-[#229ED9]/25 transition-all transform hover:-translate-y-0.5"
          >
            <Send className="w-5 h-5" />
            {isFr ? "Rejoindre sur Telegram (@livetraderu)" : "Claim Signals on Telegram (@livetraderu)"}
          </a>

          <Link
            href={`/${locale}`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
          >
            <Store className="w-4 h-4" />
            {isFr ? "Retour \u00e0 la boutique" : "Return to Store"}
          </Link>
        </div>
      </div>
    </div>
  );
}