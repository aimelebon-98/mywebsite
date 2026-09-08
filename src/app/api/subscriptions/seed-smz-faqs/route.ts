import { NextResponse } from "next/server";
import { db } from "@/db";
import { productFaqs } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "product_faqs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "question" text NOT NULL,
        "answer" text NOT NULL,
        "question_fr" text,
        "answer_fr" text,
        "sort_order" integer NOT NULL DEFAULT 0,
        "active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT now()
      );
    `);

    await db.delete(productFaqs);

    const items = [
      {
        sortOrder: 1,
        question: "What is SMZ AI Trading Bot Pro?",
        questionFr: "Qu'est-ce que SMZ AI Trading Bot Pro ?",
        answer: "SMZ AI Trading Bot Pro is an automated binary options trading bot. It analyzes markets 24/7, executes high-probability entries in milliseconds, and follows strict risk rules so you do not trade on emotion.",
        answerFr: "SMZ AI Trading Bot Pro est un robot de trading automatis\u00e9 pour options binaires. Il analyse les march\u00e9s 24h/24, ex\u00e9cute des entr\u00e9es \u00e0 haute probabilit\u00e9 en millisecondes et suit des r\u00e8gles de risque strictes pour \u00e9viter le trading \u00e9motionnel.",
      },
      {
        sortOrder: 2,
        question: "How do I subscribe and activate the bot?",
        questionFr: "Comment m'abonner et activer le robot ?",
        answer: "Click Subscribe, choose 1, 3, 5 or 12 months, pay with BTC or USDT (TRC20). As soon as the blockchain confirms payment, your subscription activates automatically with no manual approval.",
        answerFr: "Cliquez sur S'abonner, choisissez 1, 3, 5 ou 12 mois, payez en BTC ou USDT (TRC20). D\u00e8s confirmation blockchain, l'abonnement s'active automatiquement sans validation manuelle.",
      },
      {
        sortOrder: 3,
        question: "Which payment methods are accepted?",
        questionFr: "Quels moyens de paiement sont accept\u00e9s ?",
        answer: "Crypto only: Bitcoin (BTC) and USDT on TRC20. No cards, no banks, no chargeback delays.",
        answerFr: "Crypto uniquement : Bitcoin (BTC) et USDT sur TRC20. Pas de carte, pas de banque.",
      },
      {
        sortOrder: 4,
        question: "What discounts apply on longer plans?",
        questionFr: "Quelles r\u00e9ductions pour les formules longues ?",
        answer: "Base price is $19.99/month. 3 months = 10% off, 5 months = 15% off, 12 months = 25% off. You see total and expiry before paying.",
        answerFr: "Tarif de base 19,99$/mois. 3 mois = -10%, 5 mois = -15%, 12 mois = -25%. Total et expiration affiches avant paiement.",
      },
      {
        sortOrder: 5,
        question: "Which brokers does SMZ work with?",
        questionFr: "Quels brokers sont compatibles ?",
        answer: "Built for major binary platforms such as IQ Option, Pocket Option, Quotex and Binomo. After activation you get setup steps to connect securely.",
        answerFr: "Compatible avec IQ Option, Pocket Option, Quotex et Binomo. Apr\u00e8s activation vous recevez les etapes de connexion securisee.",
      },
      {
        sortOrder: 6,
        question: "Does the bot trade while I sleep?",
        questionFr: "Le robot trade-t-il pendant mon sommeil ?",
        answer: "Yes. SMZ runs 24/7 across London, New York and Tokyo sessions with Telegram alerts for entries, exits and daily P&L.",
        answerFr: "Oui. SMZ tourne 24h/24 (Londres, New York, Tokyo) avec alertes Telegram pour entrees, sorties et P&L quotidien.",
      },
      {
        sortOrder: 7,
        question: "How does risk management work?",
        questionFr: "Comment fonctionne la gestion du risque ?",
        answer: "Default risk is capped near 2% per trade. Smart protection limits damage after consecutive losses so the bot does not revenge-trade.",
        answerFr: "Risque plafonne pres de 2% par trade. Protection anti-drawdown pour eviter le revenge-trade.",
      },
      {
        sortOrder: 8,
        question: "Is this a get-rich-quick promise?",
        questionFr: "Est-ce une promesse de richesse rapide ?",
        answer: "No. SMZ is a professional automation tool. Markets carry risk. The bot removes emotional mistakes and enforces discipline - it does not guarantee profits.",
        answerFr: "Non. SMZ est un outil pro. Les marches sont risques. Le robot reduit les erreurs emotionnelles sans garantir les profits.",
      },
      {
        sortOrder: 9,
        question: "How fast is activation after crypto payment?",
        questionFr: "Vitesse d'activation apres paiement crypto ?",
        answer: "Usually minutes after network confirmation. USDT TRC20 is typically fastest. Your order page auto-updates to Active when confirmed.",
        answerFr: "Souvent quelques minutes apres confirmation. USDT TRC20 est generalement le plus rapide. La page commande passe a Actif automatiquement.",
      },
      {
        sortOrder: 10,
        question: "How do I get support after subscribing?",
        questionFr: "Comment contacter le support apres abonnement ?",
        answer: "Use Contact or Telegram with your order number (SUB-...). Priority support is included for active subscribers for setup and broker connection.",
        answerFr: "Contact ou Telegram avec votre numero SUB-.... Support prioritaire inclus pour setup et connexion broker.",
      },
    ];

    for (const item of items) {
      await db.insert(productFaqs).values({
        question: item.question,
        answer: item.answer,
        questionFr: item.questionFr,
        answerFr: item.answerFr,
        sortOrder: item.sortOrder,
        active: true,
      });
    }

    return NextResponse.json({ success: true, inserted: items.length, message: "SMZ bot FAQs seeded" });
  } catch (error) {
    console.error("FAQ seed error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}