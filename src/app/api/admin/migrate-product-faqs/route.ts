import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { productFaqs } from "@/db/schema";

export async function GET() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS product_faqs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        question_fr TEXT,
        answer_fr TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    const existing = await db.select().from(productFaqs);
    let seeded = 0;

    if (existing.length === 0) {
      const seeds = [
        {
          question: "Are these shoes authentic?",
          answer: "Yes, 100% authentic. Every pair we sell is sourced directly from authorized distributors and comes with original packaging, tags, and quality guarantees.",
          questionFr: "Ces chaussures sont-elles authentiques?",
          answerFr: "Oui, 100% authentiques. Chaque paire que nous vendons provient directement de distributeurs agrees et arrive avec l'emballage d'origine, les etiquettes et les garanties de qualite.",
          sortOrder: 1,
        },
        {
          question: "What is your return policy for this product?",
          answer: "You have 14 days to return this item if unworn and in original packaging. Simply message us on WhatsApp with your order details to start the return process.",
          questionFr: "Quelle est votre politique de retour pour ce produit?",
          answerFr: "Vous disposez de 14 jours pour retourner cet article s'il n'a pas ete porte et est dans son emballage d'origine. Envoyez-nous simplement un message sur WhatsApp avec les details de votre commande pour commencer le processus de retour.",
          sortOrder: 2,
        },
        {
          question: "How long does shipping take?",
          answer: "Standard delivery takes 3-7 business days. Free shipping on all orders over $1000. Express shipping options are available on request via WhatsApp.",
          questionFr: "Combien de temps prend la livraison?",
          answerFr: "La livraison standard prend 3 a 7 jours ouvrables. Livraison gratuite pour toutes les commandes de plus de 1000$. Des options de livraison express sont disponibles sur demande via WhatsApp.",
          sortOrder: 3,
        },
        {
          question: "How do I know my size?",
          answer: "Each product page shows all available sizes. If you are between sizes, we recommend sizing up for comfort. Contact us on WhatsApp for personalized sizing advice based on the specific brand.",
          questionFr: "Comment connaitre ma taille?",
          answerFr: "Chaque page produit affiche toutes les tailles disponibles. Si vous etes entre deux tailles, nous recommandons de prendre la taille au-dessus pour le confort. Contactez-nous sur WhatsApp pour des conseils de taille personnalises selon la marque.",
          sortOrder: 4,
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept bank transfers, mobile money, credit/debit cards, and cash on delivery in select areas. Payment is arranged securely via WhatsApp after order confirmation.",
          questionFr: "Quels modes de paiement acceptez-vous?",
          answerFr: "Nous acceptons les virements bancaires, mobile money, cartes de credit/debit et paiement a la livraison dans certaines regions. Le paiement est organise en toute securite via WhatsApp apres confirmation de la commande.",
          sortOrder: 5,
        },
      ];

      for (const s of seeds) {
        await db.insert(productFaqs).values(s);
        seeded++;
      }
    }

    return NextResponse.json({
      ok: true,
      tableCreated: true,
      seededCount: seeded,
      existingCount: existing.length,
      message: seeded > 0 ? `Table created and ${seeded} FAQs seeded` : `Table ready, ${existing.length} FAQs exist`
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
