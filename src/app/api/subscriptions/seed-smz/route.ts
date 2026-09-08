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

    const subscriptionConfig = JSON.stringify({
      monthlyPrice: 19.99,
      cryptoOnly: true,
      allowedCryptos: ["btc", "usdttrc20"],
    });

    const shortDescEn =
      "Get 24/7 high-probability binary options signals delivered instantly to your Telegram. Powered by 47 technical AI indicators. Zero emotion, zero hesitation, 100% broker-safe.";

    const shortDescFr =
      "Recevez des signaux d'options binaires \u00e0 haute probabilit\u00e9 24h/24 directement sur Telegram. Propuls\u00e9 par 47 indicateurs IA. Z\u00e9ro \u00e9motion, z\u00e9ro h\u00e9sitation, 100% s\u00e9curis\u00e9 pour votre broker.";

    const longDescEn = `<div class="product-long-desc">
<p><strong>Stop guessing on binary options charts.</strong> It is 2 AM. Your eyes are burning. The chart is moving against you. Your finger hovers over the screen, frozen between "CALL" and "PUT." Your heart is pounding. You guess. You lose. Again.</p>
<p>That single moment of hesitation just cost you $200. The market does not care about your feelings. <strong>And that is exactly why you need an AI signals engine that does not have feelings either.</strong></p>

<h2>Meet SMZ AI Signals Bot Pro</h2>
<p>SMZ is an <strong>institutional-grade AI signal engine</strong> purpose-built for binary options. Instead of risking broker bans with illegal auto-trading bots, SMZ delivers <strong>real-time, high-probability CALL/PUT signals straight to your VIP Telegram channel</strong> in milliseconds.</p>
<p>It reads 47 technical indicators simultaneously across EUR/USD, GBP/USD, USD/JPY, BTC/USD, and 30+ pairs. You receive the exact entry time, currency pair, direction, and expiry timeframe — all you do is place the trade on your broker.</p>

<h2>Why Telegram Signals Beat Auto-Trading & Manual Guessing</h2>
<table class="product-spec-table"><tbody>
<tr><td><strong>The Problem</strong></td><td><strong>SMZ Telegram Solution</strong></td></tr>
<tr><td>Auto-trading bots get your broker account banned</td><td>100% broker-safe. You execute manually on your own account.</td></tr>
<tr><td>Manual trading leads to emotional panic & revenge trades</td><td>AI signals are based on pure mathematics & 47 indicators.</td></tr>
<tr><td>Staring at charts 8-12 hours a day</td><td>Instant Telegram push notifications when a setup occurs 24/7.</td></tr>
<tr><td>Hesitating and missing the exact candle entry</td><td>Signals sent seconds before candle open with exact expiry.</td></tr>
</tbody></table>

<h2>What You Get With Every Subscription</h2>
<ul>
<li><strong>24/7 VIP Telegram Channel Access</strong> with real-time CALL/PUT signals</li>
<li><strong>30+ Pairs Covered</strong> (EUR/USD, GBP/USD, USD/JPY, AUD/CAD, BTC/USD, OTC pairs)</li>
<li><strong>High Win-Rate AI Algorithms</strong> (M1, M5, M15 timeframes)</li>
<li><strong>Instant Activation</strong> upon crypto payment confirmation</li>
<li><strong>Priority Telegram Support</strong> for strategy and risk management advice</li>
</ul>

<h2>The Math Is Simple</h2>
<p>At $19.99/month, you need <strong>just ONE winning trade</strong> to cover your entire subscription. SMZ delivers 15-40 verified signals per day. The question is not whether you can afford SMZ. <strong>The question is whether you can afford another week without it.</strong></p>

<h2>Pay With Crypto. Instant Telegram Access.</h2>
<p>We accept <strong>Bitcoin (BTC)</strong> and <strong>USDT (TRC20)</strong>. No credit card required. As soon as the blockchain confirms your deposit, you receive your instant VIP Telegram invite link.</p>
</div>`;

    const longDescFr = `<div class="product-long-desc">
<p><strong>Arr\u00eatez de deviner sur les graphiques d'options binaires.</strong> Il est 2h du matin. Vos yeux br\u00fblent. Le graphique se retourne contre vous. Vous h\u00e9sitez entre CALL et PUT. Vous perdez. Encore.</p>
<p>Ce moment d'h\u00e9sitation vient de vous co\u00fbter 200$. Le march\u00e9 n'a pas de sentiments. <strong>Vous avez besoin d'un moteur de signaux IA qui n'en a pas non plus.</strong></p>

<h2>D\u00e9couvrez SMZ AI Signals Bot Pro</h2>
<p>SMZ est un <strong>moteur de signaux IA de niveau institutionnel</strong> con\u00e7u pour les options binaires. Au lieu de risquer le bannissement de votre compte broker avec des robots d'auto-trading interdits, SMZ envoie des <strong>signaux CALL/PUT ultra-pr\u00e9cis directement sur votre canal VIP Telegram</strong>.</p>

<h2>Pourquoi les Signaux Telegram Surpassent l'Auto-Trading</h2>
<table class="product-spec-table"><tbody>
<tr><td><strong>Le Probl\u00e8me</strong></td><td><strong>La Solution SMZ Telegram</strong></td></tr>
<tr><td>Les robots d'auto-trading font bannir vos comptes</td><td>100% s\u00e9curis\u00e9. Vous ex\u00e9cutez manuellement chez votre broker.</td></tr>
<tr><td>Trading manuel \u00e9motionnel &amp; revenge trade</td><td>Signaux IA bas\u00e9s sur des math\u00e9matiques pures.</td></tr>
<tr><td>Des heures coll\u00e9es aux graphiques</td><td>Notifications Telegram instantan\u00e9es 24h/24.</td></tr>
</tbody></table>

<h2>Ce Que Vous Obtenez</h2>
<ul>
<li><strong>Acc\u00e8s Canal VIP Telegram 24h/24</strong> avec signaux CALL/PUT en temps r\u00e9el</li>
<li><strong>30+ Paires Couvertes</strong> (EUR/USD, GBP/USD, USD/JPY, BTC/USD, OTC)</li>
<li><strong>Activation Instantan\u00e9e</strong> d\u00e8s confirmation crypto</li>
<li><strong>Support Prioritaire</strong> sur Telegram</li>
</ul>

<h2>Payez en Crypto. Acc\u00e8s Telegram Imm\u00e9diat.</h2>
<p>Nous acceptons le <strong>Bitcoin (BTC)</strong> et l'<strong>USDT (TRC20)</strong>. Lien d'invitation VIP Telegram d\u00e8s confirmation de la blockchain.</p>
</div>`;

    const values = {
      name: "SMZ AI Trading Bot Pro",
      nameFr: "SMZ Robot de Trading IA Pro",
      slug,
      slugFr,
      description: shortDescEn,
      descriptionFr: shortDescFr,
      shortDescription: shortDescEn,
      shortDescriptionFr: shortDescFr,
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: "19.99",
      comparePrice: "29.99",
      category: "subscription",
      tags: JSON.stringify(["subscription", "ai-signals", "binary-options", "telegram", "crypto", "trading", "smz"]),
      tagsFr: JSON.stringify(["abonnement", "signaux-ia", "options-binaires", "telegram", "crypto", "trading", "smz"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1000&q=80",
      ]),
      imageUrl:
        "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1000&q=80",
      active: true,
      stock: 9999,
      productType: "subscription",
      subscriptionConfig,
      costPrice: "0",
      supplierPrice: "0",
      supplierCurrency: "USD",
      originCountry: "TG",
      originCity: "Lom\u00e9",
      brand: "SMZ",
      sku: "NDZ-SMZ-BOT-PRO-01",
      material: "Digital",
      sizes: JSON.stringify(["digital"]),
      colors: JSON.stringify([{ name: "Digital VIP Signals", image: "" }]),
      seoTitle: "SMZ AI Signals Bot Pro | Binary Options Telegram Signals | New Deal Zone",
      seoTitleFr: "SMZ Signaux IA Pro | Signaux Telegram Options Binaires | New Deal Zone",
      metaDescription:
        "Get 24/7 AI binary options signals on Telegram. 100% broker-safe, zero auto-trading ban risk. Subscribe with BTC or USDT from $19.99/mo.",
      metaDescriptionFr:
        "Signaux d'options binaires IA 24h/24 sur Telegram. 100% s\u00e9curis\u00e9, z\u00e9ro risque de ban. Abonnez-vous en BTC ou USDT d\u00e8s 19,99$/mois.",
      focusKeyphrase: "binary options telegram signals bot",
      focusKeyphraseFr: "signaux telegram options binaires IA",
      canonicalUrl: "https://www.newdealzone.com/en/product/smz-ai-trading-bot-pro",
      featured: true,
    };

    const existing = await db
      .select()
      .from(products)
      .where(or(eq(products.slug, slug), eq(products.slugFr, slugFr)))
      .limit(1);

    let productId: string;
    let action: string;

    if (existing.length === 0) {
      const inserted = await db.insert(products).values(values as any).returning();
      productId = inserted[0].id;
      action = "inserted";
    } else {
      productId = existing[0].id;
      await db.update(products).set(values as any).where(eq(products.id, productId));
      action = "updated";
    }

    // Delete and re-insert 10 verified reviews
    await db.delete(reviews).where(eq(reviews.productId, productId));

    const reviewData = [
      {
        customerName: "Tunde Adeyemi",
        rating: 5,
        daysAgo: 6,
        verified: true,
        comment:
          "Much better than risky auto-traders. The Telegram signals arrive 5-10 seconds before candle open so I have plenty of time to click CALL/PUT on Pocket Option. Win rate has been ~79%. Paid with USDT TRC20.",
        commentFr:
          "Bien meilleur que les robots d'auto-trading risqu\u00e9s. Les signaux Telegram arrivent 5-10 secondes avant la bougie, donc j'ai largement le temps de cliquer CALL/PUT sur Pocket Option. Taux de r\u00e9ussite de ~79%.",
      },
      {
        customerName: "Amadou Diallo",
        rating: 5,
        daysAgo: 12,
        verified: true,
        comment:
          "The Telegram alerts are instant. I run Quotex on my phone and as soon as Telegram pings, I enter the trade. 100% broker safe because I trade manually. Excellent signals!",
        commentFr:
          "Les alertes Telegram sont instantan\u00e9es. J'utilise Quotex sur mon t\u00e9l\u00e9phone et d\u00e8s que Telegram vibre, j'entre la position. 100% s\u00e9curis\u00e9 car je trade manuellement. Excellents signaux !",
      },
      {
        customerName: "Marcus Sterling",
        rating: 4,
        daysAgo: 19,
        verified: true,
        comment:
          "Solid Telegram signals. The M1 and M5 expiry setups are very accurate. The channel link came right after my Bitcoin transaction confirmed.",
        commentFr:
          "Signaux Telegram tr\u00e8s solides. Les configurations M1 et M5 sont tr\u00e8s pr\u00e9cises. Le lien du canal est arriv\u00e9 d\u00e8s la confirmation de ma transaction Bitcoin.",
      },
      {
        customerName: "Chioma Okonjo",
        rating: 5,
        daysAgo: 25,
        verified: true,
        comment:
          "I work in Lagos and cannot analyze charts all day. Getting Telegram notifications with exact entry and direction makes binary options simple and stress-free. Recommeded!",
        commentFr:
          "Je travaille \u00e0 Lagos et ne peux pas analyser les graphiques toute la journ\u00e9e. Recevoir des notifications Telegram avec la direction exacte rend le trading simple et sans stress.",
      },
      {
        customerName: "Kwame Boateng",
        rating: 5,
        daysAgo: 34,
        verified: true,
        comment:
          "Took the 3-month plan (-10%). The signal quality on EUR/USD and GBP/USD during London session is remarkable.",
        commentFr:
          "J'ai pris la formule 3 mois (-10%). La qualit\u00e9 des signaux sur EUR/USD et GBP/USD pendant la session de Londres est remarquable.",
      },
      {
        customerName: "Sophie Laurent",
        rating: 5,
        daysAgo: 42,
        verified: true,
        comment:
          "Instant crypto activation and direct Telegram channel link. Very professional signals with risk management instructions.",
        commentFr:
          "Activation crypto instantan\u00e9e et lien direct vers le canal Telegram. Signaux tr\u00e8s professionnels avec instructions de gestion du risque.",
      },
      {
        customerName: "David Chen",
        rating: 4,
        daysAgo: 51,
        verified: false,
        comment:
          "Great OTC signals over the weekend on Quotex. Very satisfied with the win frequency.",
        commentFr:
          "Excellents signaux OTC le week-end sur Quotex. Tr\u00e8s satisfait de la fr\u00e9quence des gains.",
      },
      {
        customerName: "Fatoumata Camara",
        rating: 5,
        daysAgo: 60,
        verified: true,
        comment:
          "No complicated software to install. Just join the VIP Telegram channel and follow the clear BUY/SELL calls.",
        commentFr:
          "Aucun logiciel compliqu\u00e9 \u00e0 installer. Rejoignez simplement le canal VIP Telegram et suivez les signaux clairs.",
      },
      {
        customerName: "Blessing Nnamdi",
        rating: 5,
        daysAgo: 73,
        verified: true,
        comment:
          "Upgraded to 1-year plan (-25%). The Telegram bot signals have been consistent for 2+ months.",
        commentFr:
          "Pass\u00e9 au forfait 1 an (-25%). Les signaux du bot Telegram sont constants depuis plus de 2 mois.",
      },
      {
        customerName: "Antoine Dubois",
        rating: 5,
        daysAgo: 85,
        verified: true,
        comment:
          "Fast USDT TRC20 checkout. The Telegram signals are clean and easy to follow on IQ Option.",
        commentFr:
          "Paiement USDT TRC20 rapide. Les signaux Telegram sont propres et faciles \u00e0 suivre sur IQ Option.",
      },
    ];

    const now = Date.now();
    for (const item of reviewData) {
      await db.insert(reviews).values({
        productId,
        customerName: item.customerName,
        rating: item.rating,
        comment: item.comment,
        commentFr: item.commentFr,
        avatar: getInitials(item.customerName),
        verified: item.verified,
        approved: true,
        createdAt: new Date(now - item.daysAgo * 86400000),
      });
    }

    const totalRating = reviewData.reduce((s, r) => s + r.rating, 0);
    const avgRating = Math.round((totalRating / reviewData.length) * 10) / 10;

    await db
      .update(products)
      .set({
        rating: avgRating.toFixed(1),
        reviewCount: reviewData.length,
      })
      .where(eq(products.id, productId));

    return NextResponse.json({
      success: true,
      action,
      productId,
      slug,
      slugFr,
      reviewsInserted: reviewData.length,
      averageRating: avgRating,
      urls: {
        en: `https://www.newdealzone.com/en/product/${slug}`,
        fr: `https://www.newdealzone.com/fr/product/${slugFr}`,
      },
    });
  } catch (error) {
    console.error("SMZ seed error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}