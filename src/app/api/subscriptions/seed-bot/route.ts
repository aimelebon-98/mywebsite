import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { ensureSubscriptionTablesExist } from "@/lib/ensure-subscription-tables";

export const dynamic = "force-dynamic";

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
      "Stop bleeding money on binary options. SMZ AI Trading Bot Pro executes precision trades 24/7 with zero emotion, zero hesitation, and zero sleep. Your wallet deserves a machine that never panics.";

    const shortDescFr =
      "Arr\u00eatez de perdre votre argent sur les options binaires. Le Robot SMZ IA Trading Pro ex\u00e9cute des trades de pr\u00e9cision 24h/24 sans \u00e9motion, sans h\u00e9sitation et sans sommeil. Votre portefeuille m\u00e9rite une machine qui ne panique jamais.";

    const longDescEn = `<div class="product-long-desc">
<p><strong>You already know the feeling.</strong> It is 2 AM. Your eyes are burning. The chart is moving against you. Your finger hovers over the screen, frozen between "CALL" and "PUT." Your heart is pounding. You guess. You lose. Again.</p>
<p>That single moment of hesitation just cost you $200. The market did not care about your rent, your bills, or your family. The market does not have feelings. <strong>And that is exactly why you need a trader that does not either.</strong></p>

<h2>Meet SMZ AI Trading Bot Pro</h2>
<p>SMZ is not another signal group that sends you alerts 30 seconds too late. It is a <strong>cold, calculated, institutional-grade AI engine</strong> purpose-built for binary options that executes trades in milliseconds while you sleep, eat, work, or live your life.</p>
<p>It reads 47 technical indicators simultaneously. It processes candlestick patterns faster than any human brain. It enters and exits positions with surgical precision, and it <strong>never revenge-trades after a loss</strong>. Ever.</p>

<h2>Why Manual Traders Lose (And SMZ Does Not)</h2>
<table class="product-spec-table">
<tbody>
<tr><td><strong>The Problem</strong></td><td><strong>SMZ Solution</strong></td></tr>
<tr><td>You trade on emotion (fear, greed, FOMO)</td><td>SMZ trades on pure mathematics. Zero emotion. Zero ego.</td></tr>
<tr><td>You stare at charts 8-12 hours a day</td><td>SMZ monitors 24/7/365. It never sleeps, never blinks.</td></tr>
<tr><td>You hesitate and miss the entry by 2 seconds</td><td>SMZ executes in under 200 milliseconds.</td></tr>
<tr><td>You revenge-trade and blow your account</td><td>SMZ follows strict risk management. Max 2% per trade.</td></tr>
<tr><td>You only trade when awake</td><td>SMZ captures London, New York, AND Tokyo sessions automatically.</td></tr>
</tbody>
</table>

<h2>What You Get With Every Subscription</h2>
<ul>
<li><strong>24/7 Autonomous Trading</strong> on EUR/USD, GBP/USD, USD/JPY, BTC/USD, and 30+ pairs</li>
<li><strong>Real-Time Telegram Alerts</strong> for every trade entry, exit, and daily P&L summary</li>
<li><strong>Smart Protection</strong> that caps drawdown at 5 consecutive losses</li>
<li><strong>Multi-Timeframe Analysis</strong> (M1, M5, M15) for high-probability entries</li>
<li><strong>Priority Support</strong> via Telegram and email</li>
</ul>

<h2>The Math Is Simple</h2>
<p>At $19.99/month, you need <strong>just ONE winning trade</strong> to cover your entire subscription. SMZ averages 15-40 trades per day. The question is not whether you can afford SMZ. <strong>The question is whether you can afford another week without it.</strong></p>

<h2>Pay With Crypto. No Banks. No Questions.</h2>
<p>We accept <strong>Bitcoin (BTC)</strong> and <strong>USDT (TRC20)</strong>. No credit card required. No bank statements. Subscribe in under 60 seconds and start trading within the hour.</p>
</div>`;

    const longDescFr = `<div class="product-long-desc">
<p><strong>Vous connaissez d\u00e9j\u00e0 cette sensation.</strong> Il est 2h du matin. Vos yeux br\u00fblent. Le graphique se retourne contre vous. Votre doigt plane au-dessus de l'\u00e9cran, paralys\u00e9 entre "CALL" et "PUT". Votre c\u0153ur bat la chamade. Vous devinez. Vous perdez. Encore.</p>
<p>Ce seul moment d'h\u00e9sitation vient de vous co\u00fbter 200$. Le march\u00e9 n'a pas de sentiments. <strong>Et c'est exactement pourquoi vous avez besoin d'un trader qui n'en a pas non plus.</strong></p>

<h2>D\u00e9couvrez SMZ AI Trading Bot Pro</h2>
<p>SMZ est un <strong>moteur IA de niveau institutionnel, froid et calcul\u00e9</strong>, con\u00e7u sp\u00e9cifiquement pour les options binaires, qui ex\u00e9cute des trades en millisecondes pendant que vous dormez ou travaillez.</p>
<p>Il lit 47 indicateurs techniques simultan\u00e9ment. Il traite les patterns de chandeliers plus vite que n'importe quel cerveau humain et <strong>ne fait jamais de revenge-trade</strong>.</p>

<h2>Pourquoi les Traders Manuels Perdent (Et Pas SMZ)</h2>
<table class="product-spec-table">
<tbody>
<tr><td><strong>Le Probl\u00e8me</strong></td><td><strong>La Solution SMZ</strong></td></tr>
<tr><td>Vous tradez sous l'\u00e9motion (peur, FOMO)</td><td>SMZ trade sur des math\u00e9matiques pures. Z\u00e9ro \u00e9motion.</td></tr>
<tr><td>Vous fixez les \u00e9crans des heures</td><td>SMZ surveille 24h/24, 7j/7. Il ne dort jamais.</td></tr>
<tr><td>Vous h\u00e9sitez et ratez l'entr\u00e9e</td><td>SMZ ex\u00e9cute en moins de 200 millisecondes.</td></tr>
<tr><td>Vous br\u00fblez votre compte apr\u00e8s une perte</td><td>SMZ applique une gestion stricte du risque (max 2%).</td></tr>
</tbody>
</table>

<h2>Ce Que Vous Obtenez</h2>
<ul>
<li><strong>Trading Autonome 24h/24</strong> sur EUR/USD, GBP/USD, USD/JPY, BTC/USD et 30+ paires</li>
<li><strong>Alertes Telegram en Temps R\u00e9el</strong> pour chaque entr\u00e9e, sortie et P&L quotidien</li>
<li><strong>Protection Intelligente</strong> contre le drawdown</li>
<li><strong>Support Prioritaire</strong> via Telegram et email</li>
</ul>

<h2>Payez en Crypto. Pas de Banque. Pas de Questions.</h2>
<p>Nous acceptons le <strong>Bitcoin (BTC)</strong> et l'<strong>USDT (TRC20)</strong>. Pas de carte requise. Votre abonnement s'active d\u00e8s la confirmation blockchain.</p>
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
      tags: JSON.stringify(["subscription", "ai-bot", "binary-options", "trading", "crypto", "automated", "smz"]),
      tagsFr: JSON.stringify(["abonnement", "robot-ia", "options-binaires", "trading", "crypto", "automatis\u00e9", "smz"]),
      images: JSON.stringify(["https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1000&q=80"]),
      imageUrl: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1000&q=80",
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
      colors: JSON.stringify([{ name: "Digital License", image: "" }]),
      seoTitle: "SMZ AI Trading Bot Pro | Automated Binary Options | New Deal Zone",
      seoTitleFr: "SMZ Robot Trading IA Pro | Options Binaires Automatis\u00e9es | New Deal Zone",
      metaDescription: "Stop losing money on binary options. SMZ AI Bot trades 24/7 with zero emotion. 200ms execution, 47 indicators. Subscribe with BTC or USDT from $19.99/mo.",
      metaDescriptionFr: "Arr\u00eatez de perdre sur les options binaires. Le robot SMZ IA trade 24h/24 sans \u00e9motion. Ex\u00e9cution 200ms. Abonnez-vous en BTC ou USDT d\u00e8s 19,99$/mois.",
      focusKeyphrase: "AI binary options trading bot",
      focusKeyphraseFr: "robot trading options binaires IA",
      canonicalUrl: "https://www.newdealzone.com/en/product/smz-ai-trading-bot-pro",
    };

    const existing = await db
      .select()
      .from(products)
      .where(or(eq(products.slug, slug), eq(products.slugFr, slugFr)))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(products).values(values);
      return NextResponse.json({ success: true, action: "inserted", product: values.name, slug });
    } else {
      await db.update(products).set(values).where(eq(products.id, existing[0].id));
      return NextResponse.json({ success: true, action: "updated", product: values.name, slug });
    }
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}