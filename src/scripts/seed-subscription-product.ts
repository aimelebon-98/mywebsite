import fs from "fs";
import path from "path";

for (const envFile of [".env.local", ".env"]) {
  const fullPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(fullPath)) {
    const raw = fs.readFileSync(fullPath, "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

async function main() {
  const { db } = await import("../db");
  const { products } = await import("../db/schema");
  const { eq } = await import("drizzle-orm");
  const { ensureSubscriptionTablesExist } = await import("../lib/ensure-subscription-tables");

  await ensureSubscriptionTablesExist();

  const slug = "smz-ai-trading-bot-pro";
  const slugFr = "smz-robot-trading-ia-pro";

  const [existing] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

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
<p>SMZ is an <strong>institutional-grade AI signal engine</strong> purpose-built for binary options. Instead of risking broker bans with illegal auto-trading bots, SMZ delivers <strong>real-time, high-probability CALL/PUT signals</strong> straight to your VIP Telegram channel in milliseconds.</p>
<p>It reads 47 technical indicators simultaneously across EUR/USD, GBP/USD, USD/JPY, BTC/USD, and 30+ pairs. You receive the exact entry time, currency pair, direction, and expiry timeframe — all you do is place the trade on your broker.</p>

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
<li><strong>24/7 Precision Binary Signals</strong> on EUR/USD, GBP/USD, USD/JPY, BTC/USD, and 30+ pairs</li>
<li><strong>Real-Time Telegram VIP Alerts</strong> for every trade entry, direction, and expiry time</li>
<li><strong>Smart Protection & Money Management</strong> algorithms built directly into signals</li>
<li><strong>Multi-Timeframe Analysis</strong> (M1, M5, M15) for maximum win-rate probability</li>
<li><strong>Priority 24/7 VIP Support</strong> via Telegram and dedicated email</li>
</ul>

<h2>The Math Is Simple</h2>
<p>At $19.99/month, you need <strong>just ONE winning trade</strong> to cover your entire subscription. SMZ averages 15-40 high-accuracy signals per day. The question is not whether you can afford SMZ. <strong>The question is whether you can afford another week without it.</strong></p>

<h2>Pay With Crypto. No Banks. No Questions.</h2>
<p>We accept <strong>Bitcoin (BTC)</strong> and <strong>USDT (TRC20)</strong>. No credit card required. No bank statements. Subscribe in under 60 seconds and start trading within the hour.</p>
</div>`;

  const longDescFr = `<div class="product-long-desc">
<p><strong>Vous connaissez d\u00e9j\u00e0 cette sensation.</strong> Il est 2h du matin. Vos yeux br\u00fblent. Le graphique se retourne contre vous. Votre doigt plane au-dessus de l'\u00e9cran, paralys\u00e9 entre "CALL" et "PUT". Votre c\u0153ur bat la chamade. Vous devinez. Vous perdez. Encore.</p>
<p>Ce seul moment d'h\u00e9sitation vient de vous co\u00fbter 200$. Le march\u00e9 n'a pas de sentiments. <strong>Et c'est exactement pourquoi vous avez besoin d'un moteur de signaux IA qui n'en a pas non plus.</strong></p>

<h2>D\u00e9couvrez SMZ AI Signals Bot Pro</h2>
<p>SMZ est un <strong>moteur de signaux IA de niveau institutionnel</strong> con\u00e7u sp\u00e9cifiquement pour les options binaires. Au lieu de risquer le bannissement de votre compte broker avec des robots d'auto-trading interdits, SMZ envoie des <strong>signaux CALL/PUT ultra-pr\u00e9cis en temps r\u00e9el</strong> directement sur votre canal VIP Telegram en quelques millisecondes.</p>
<p>Il analyse simultan\u00e9ment 47 indicateurs techniques sur EUR/USD, GBP/USD, USD/JPY, BTC/USD et plus de 30 paires. Vous recevez l'heure exacte d'entr\u00e9e, la paire de devises, la direction et le d\u00e9lai d'expiration : tout ce que vous avez \u00e0 faire est d'ex\u00e9cuter le trade chez votre courtier.</p>

<h2>Pourquoi les Traders Manuels Perdent (Et Pas SMZ)</h2>
<table class="product-spec-table">
<tbody>
<tr><td><strong>Le Probl\u00e8me</strong></td><td><strong>La Solution SMZ</strong></td></tr>
<tr><td>Vous tradez sous l'\u00e9motion (peur, FOMO)</td><td>SMZ trade sur des math\u00e9matiques pures. Z\u00e9ro \u00e9motion. Z\u00e9ro \u00e9go.</td></tr>
<tr><td>Vous fixez les \u00e9crans pendant 8 \u00e0 12h</td><td>SMZ surveille 24h/24, 7j/7. Il ne dort jamais, ne cille jamais.</td></tr>
<tr><td>Vous h\u00e9sitez et ratez l'entr\u00e9e de 2 secondes</td><td>SMZ ex\u00e9cute et d\u00e9tecte en moins de 200 millisecondes.</td></tr>
<tr><td>Vous br\u00fblez votre compte apr\u00e8s une perte</td><td>SMZ applique une gestion stricte du risque (max 2% par trade).</td></tr>
<tr><td>Vous ne tradez que lorsque vous \u00eates \u00e9veill\u00e9</td><td>SMZ capture automatiquement les sessions de Londres, New York et Tokyo.</td></tr>
</tbody>
</table>

<h2>Ce Que Vous Obtenez Avec Chaque Abonnement</h2>
<ul>
<li><strong>Signaux d'Options Binaires Ultra-Pr\u00e9cis 24h/24</strong> sur EUR/USD, GBP/USD, USD/JPY, BTC/USD et 30+ paires</li>
<li><strong>Alertes VIP Telegram en Temps R\u00e9el</strong> pour chaque entr\u00e9e, direction et d\u00e9lai d'expiration</li>
<li><strong>Protection Intelligente & Gestion du Risque</strong> int\u00e9gr\u00e9es directement dans les signaux</li>
<li><strong>Analyse Multi-Timeframe</strong> (M1, M5, M15) pour un taux de r\u00e9ussite maximal</li>
<li><strong>Support VIP Prioritaire 24/7</strong> via Telegram et email d\u00e9di\u00e9</li>
</ul>

<h2>Le Calcul Est Simple</h2>
<p>\u00c0 19,99$/mois, il vous suffit de <strong>SEULEMENT UN trade gagnant</strong> pour couvrir l'int\u00e9gralit\u00e9 de votre abonnement mensuel. SMZ g\u00e9n\u00e8re en moyenne 15 \u00e0 40 signaux ultra-pr\u00e9cis par jour. La question n'est pas de savoir si vous pouvez vous offrir SMZ. <strong>La question est de savoir si vous pouvez vous permettre une autre semaine sans lui.</strong></p>

<h2>Payez en Crypto. Pas de Banque. Pas de Questions.</h2>
<p>Nous acceptons le <strong>Bitcoin (BTC)</strong> et l'<strong>USDT (TRC20)</strong>. Pas de carte bancaire requise. Pas de relev\u00e9s bancaires. Abonnez-vous en moins de 60 secondes et commencez \u00e0 recevoir vos signaux dans l'heure.</p>
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
    colors: JSON.stringify([{ name: "Digital Vip Signals", image: "" }]),
    seoTitle: "SMZ AI Trading Bot Pro | Automated Binary Options | New Deal Zone",
    seoTitleFr: "SMZ Robot Trading IA Pro | Options Binaires Automatis\u00e9es | New Deal Zone",
    metaDescription: "Stop losing money on binary options. SMZ AI Bot trades 24/7 with zero emotion. 200ms execution, 47 indicators. Subscribe with BTC or USDT from $19.99/mo.",
    metaDescriptionFr: "Arr\u00eatez de perdre sur les options binaires. Le robot SMZ IA trade 24h/24 sans \u00e9motion. Ex\u00e9cution 200ms. Abonnez-vous en BTC ou USDT d\u00e8s 19,99$/mois.",
    focusKeyphrase: "AI binary options trading bot",
    focusKeyphraseFr: "robot trading options binaires IA",
    canonicalUrl: "https://www.newdealzone.com/en/product/smz-ai-trading-bot-pro",
  };

  if (!existing) {
    console.log("Seeding SMZ AI Trading Bot Pro...");
    await db.insert(products).values(values);
    console.log("Seeded successfully!");
  } else {
    console.log("Updating existing product...");
    await db.update(products).set(values).where(eq(products.id, existing.id));
    console.log("Updated successfully!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  });