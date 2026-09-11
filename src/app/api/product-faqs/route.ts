import { NextResponse } from "next/server";
import { db } from "@/db";
import { productFaqs } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const qEn = "What if I already have a broker account?";
    const [existing] = await db
      .select()
      .from(productFaqs)
      .where(eq(productFaqs.question, qEn))
      .limit(1);

    if (!existing) {
      await db.insert(productFaqs).values({
        question: qEn,
        questionFr: "Que faire si j'ai d\u00e9j\u00e0 un compte chez le courtier ?",
        answer: "No problem at all! You can keep your existing account and still purchase or use the bot normally. However, if you want to take advantage of our 1-Month FREE offer, you need to register a NEW broker account using our partner link. To avoid double-account penalties from the broker, make sure to delete or close your old account first before creating the new one.",
        answerFr: "Aucun probl\u00e8me ! Vous pouvez garder votre compte actuel et acheter/utiliser le robot normalement. Cependant, si vous souhaitez profiter de l'offre de 1 mois GRATUIT, vous devez cr\u00e9er un NOUVEAU compte via notre lien partenaire. Pensez \u00e0 supprimer votre ancien compte courtier au pr\u00e9alable pour \u00e9viter tout blocage pour compte double.",
        active: true,
        sortOrder: 1,
      });
    }

    const faqs = await db
      .select()
      .from(productFaqs)
      .where(eq(productFaqs.active, true))
      .orderBy(asc(productFaqs.sortOrder));

    return NextResponse.json(faqs);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}