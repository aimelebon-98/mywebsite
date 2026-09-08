import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { ensureSubscriptionTablesExist } from "@/lib/ensure-subscription-tables";

export const dynamic = "force-dynamic";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0]?.toUpperCase() || "")
    .slice(0, 2)
    .join("");
}

export async function GET() {
  try {
    await ensureSubscriptionTablesExist();

    const slug = "smz-ai-trading-bot-pro";
    const slugFr = "smz-robot-trading-ia-pro";

    const [product] = await db
      .select()
      .from(products)
      .where(or(eq(products.slug, slug), eq(products.slugFr, slugFr)))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "SMZ AI Trading Bot Pro product not found" },
        { status: 404 }
      );
    }

    // Delete existing reviews for this product for clean idempotency
    await db.delete(reviews).where(eq(reviews.productId, product.id));

    const reviewData = [
      {
        customerName: "Tunde Adeyemi",
        rating: 5,
        daysAgo: 6,
        verified: true,
        comment:
          "I blew 3 accounts on Pocket Option before finding SMZ. The fact that it never revenge trades and caps losses at 5 is what saved my trading journey. Paid with USDT TRC20 and it activated in 2 minutes.",
        commentFr:
          "J'ai br\u00fbl\u00e9 3 comptes sur Pocket Option avant de d\u00e9couvrir SMZ. Le fait qu'il ne fasse aucun revenge trade et bloque les pertes apr\u00e8s 5 essais a sauv\u00e9 mon parcours. Pay\u00e9 en USDT TRC20 et activ\u00e9 en 2 minutes.",
      },
      {
        customerName: "Amadou Diallo",
        rating: 5,
        daysAgo: 12,
        verified: true,
        comment:
          "The 200ms execution is real. During the London session, manual clicks always had slippage on Quotex. With SMZ bot running, every entry is on point. Averaging 78% win rate this week.",
        commentFr:
          "L'ex\u00e9cution en 200ms est bien r\u00e9elle. Pendant la session de Londres, mes clics manuels avaient toujours du glissement sur Quotex. Avec le robot SMZ, chaque entr\u00e9e est parfaite. 78% de taux de r\u00e9ussite cette semaine.",
      },
      {
        customerName: "Marcus Sterling",
        rating: 4,
        daysAgo: 19,
        verified: true,
        comment:
          "Solid binary bot. Took me about 10 minutes to configure the API key on IQ Option, but once connected, the Telegram alerts kept me updated throughout the night. Woke up in profit 4 days out of 5.",
        commentFr:
          "Robot binaire tr\u00e8s solide. Il m'a fallu environ 10 minutes pour configurer la cl\u00e9 API sur IQ Option, mais une fois connect\u00e9, les alertes Telegram m'ont tenu inform\u00e9 toute la nuit. R\u00e9veill\u00e9 en profit 4 jours sur 5.",
      },
      {
        customerName: "Chioma Okonjo",
        rating: 5,
        daysAgo: 25,
        verified: true,
        comment:
          "Finally, a tool that removes stress from trading. I work 9 to 5 in Lagos and cannot watch charts all day. SMZ handles EUR/USD and GBP/USD sessions while I focus on work. The $19.99 subscription paid for itself on day two.",
        commentFr:
          "Enfin un outil qui \u00e9limine le stress du trading. Je travaille de 9h \u00e0 17h \u00e0 Lagos et je ne peux pas surveiller les graphiques toute la journ\u00e9e. SMZ g\u00e8re les sessions EUR/USD et GBP/USD pendant que je travaille. L'abonnement \u00e0 19,99$ a \u00e9t\u00e9 rentabilis\u00e9 d\u00e8s le deuxi\u00e8me jour.",
      },
      {
        customerName: "Kwame Boateng",
        rating: 5,
        daysAgo: 34,
        verified: true,
        comment:
          "Paid for the 3-month plan with Bitcoin. The multi-timeframe analysis (M1/M5) filters out so many false breakouts. It passed my personal backtest and live forward test with flying colors.",
        commentFr:
          "J'ai pris la formule 3 mois en payant en Bitcoin. L'analyse multi-timeframe (M1/M5) filtre \u00e9norm\u00e9ment de faux signaux. Il a r\u00e9ussi mes tests r\u00e9els avec brio.",
      },
      {
        customerName: "Sophie Laurent",
        rating: 5,
        daysAgo: 42,
        verified: true,
        comment:
          "Best crypto-backed subscription I have used. Automatic activation worked seamlessly without waiting for support. The risk management setting of max 2% per trade keeps the balance secure.",
        commentFr:
          "Le meilleur abonnement crypto que j'ai utilis\u00e9. L'activation automatique a fonctionn\u00e9 imm\u00e9diatement sans attendre le support. Le r\u00e9glage de gestion du risque \u00e0 2% maximum par trade prot\u00e8ge parfaitement le capital.",
      },
      {
        customerName: "David Chen",
        rating: 4,
        daysAgo: 51,
        verified: false,
        comment:
          "Very good win rate on OTC pairs over the weekend. I only wish there was more customization for indicator weights, but the default AI presets are already profitable.",
        commentFr:
          "Tr\u00e8s bon taux de r\u00e9ussite sur les paires OTC le week-end. J'aimerais juste plus de personnalisation sur les indicateurs, mais les param\u00e8tres IA par d\u00e9faut sont d\u00e9j\u00e0 tr\u00e8s rentables.",
      },
      {
        customerName: "Fatoumata Camara",
        rating: 5,
        daysAgo: 60,
        verified: true,
        comment:
          "No more panic selling or entering trades too early. The Telegram group support helped me set up my Binomo broker account in minutes. Highly recommended for beginners and experienced traders.",
        commentFr:
          "Fini les paniques ou les entr\u00e9es pr\u00e9cipit\u00e9es. Le support sur Telegram m'a aid\u00e9e \u00e0 configurer mon compte Binomo en quelques minutes. Tr\u00e8s recommand\u00e9 pour les d\u00e9butants comme pour les exp\u00e9riment\u00e9s.",
      },
      {
        customerName: "Blessing Nnamdi",
        rating: 5,
        daysAgo: 73,
        verified: true,
        comment:
          "Switched to the 1-year plan to save 25%. Been running SMZ for over two months now. Trading discipline is 100% outsourced to the bot. Total game changer.",
        commentFr:
          "Je suis pass\u00e9 au forfait 1 an pour b\u00e9n\u00e9ficier des 25% de r\u00e9duction. SMZ tourne depuis plus de deux mois chez moi. La discipline est 100% d\u00e9l\u00e9gu\u00e9e au robot. Un vrai changement.",
      },
      {
        customerName: "Antoine Dubois",
        rating: 5,
        daysAgo: 85,
        verified: true,
        comment:
          "Instant USDT checkout, clean interface, and clear documentation. It took 3 trades on my first day to recover the monthly fee. Excellent execution speed.",
        commentFr:
          "Paiement USDT instantan\u00e9, interface claire et documentation limpide. Il a suffi de 3 trades lors de ma premi\u00e8re journ\u00e9e pour rentabiliser le mois. Vitesse d'ex\u00e9cution remarquable.",
      },
    ];

    const now = Date.now();
    for (const item of reviewData) {
      const createdAt = new Date(now - item.daysAgo * 86400000);
      await db.insert(reviews).values({
        productId: product.id,
        customerName: item.customerName,
        rating: item.rating,
        comment: item.comment,
        commentFr: item.commentFr,
        avatar: getInitials(item.customerName),
        verified: item.verified,
        approved: true,
        createdAt,
      });
    }

    // Compute updated average rating & review count
    const totalRating = reviewData.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Math.round((totalRating / reviewData.length) * 10) / 10;

    await db
      .update(products)
      .set({
        rating: avgRating.toFixed(1),
        reviewCount: reviewData.length,
      })
      .where(eq(products.id, product.id));

    return NextResponse.json({
      success: true,
      product: product.name,
      reviewsInserted: reviewData.length,
      averageRating: avgRating,
      ratingSummary: "8 x 5-star, 2 x 4-star (90% verified)",
    });
  } catch (error) {
    console.error("Reviews seed error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}