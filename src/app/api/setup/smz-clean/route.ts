import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const slug = "smz-ai-trading-bot-pro";

    const longDescEn = `<div class="product-long-desc">
<p><strong>You already know the feeling.</strong> It is 2 AM. Your eyes are burning. The chart is moving against you. Your finger hovers over the screen, frozen between "CALL" and "PUT." Your heart is pounding. You guess. You lose. Again.</p>
<p>That single moment of hesitation just cost you $200. The market did not care about your rent, your bills, or your family. The market does not have feelings. <strong>And that is exactly why you need a trader that does not either.</strong></p>

<h2>Meet SMZ AI Trading Bot Pro</h2>
<p>SMZ is an <strong>institutional-grade AI signal engine</strong> purpose-built for binary options. Instead of risking broker bans with illegal auto-trading bots, SMZ delivers <strong>real-time, high-probability CALL/PUT signals</strong> straight to your VIP Telegram channel in milliseconds.</p>
<p>It reads 47 technical indicators simultaneously across EUR/USD, GBP/USD, USD/JPY, BTC/USD, and 30+ pairs. You receive the exact entry time, currency pair, direction, and expiry timeframe — all you do is place the trade on your broker.</p>

<h2>What You Get With Every Subscription</h2>
<ul>
<li><strong>24/7 Precision Binary Signals</strong> on EUR/USD, GBP/USD, USD/JPY, BTC/USD, and 30+ pairs</li>
<li><strong>Real-Time Telegram VIP Alerts</strong> for every trade entry, direction, and expiry time</li>
<li><strong>Smart Protection &amp; Money Management</strong> algorithms built directly into signals</li>
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

<h2>Ce Que Vous Obtenez Avec Chaque Abonnement</h2>
<ul>
<li><strong>Signaux d'Options Binaires Ultra-Pr\u00e9cis 24h/24</strong> sur EUR/USD, GBP/USD, USD/JPY, BTC/USD et 30+ paires</li>
<li><strong>Alertes VIP Telegram en Temps R\u00e9el</strong> pour chaque entr\u00e9e, direction et d\u00e9lai d'expiration</li>
<li><strong>Protection Intelligente &amp; Gestion du Risque</strong> int\u00e9gr\u00e9es directement dans les signaux</li>
<li><strong>Analyse Multi-Timeframe</strong> (M1, M5, M15) pour un taux de r\u00e9ussite maximal</li>
<li><strong>Support VIP Prioritaire 24/7</strong> via Telegram et email d\u00e9di\u00e9</li>
</ul>

<h2>Le Calcul Est Simple</h2>
<p>\u00c0 19,99$/mois, il vous suffit de <strong>SEULEMENT UN trade gagnant</strong> pour couvrir l'int\u00e9gralit\u00e9 de votre abonnement mensuel. SMZ g\u00e9n\u00e8re en moyenne 15 \u00e0 40 signaux ultra-pr\u00e9cis par jour. La question n'est pas de savoir si vous pouvez vous offrir SMZ. <strong>La question est de savoir si vous pouvez vous permettre une autre semaine sans lui.</strong></p>

<h2>Payez en Crypto. Pas de Banque. Pas de Questions.</h2>
<p>Nous acceptons le <strong>Bitcoin (BTC)</strong> et l'<strong>USDT (TRC20)</strong>. Pas de carte bancaire requise. Pas de relev\u00e9s bancaires. Abonnez-vous en moins de 60 secondes et commencez \u00e0 recevoir vos signaux dans l'heure.</p>
</div>`;

    await db.update(products).set({
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      updatedAt: new Date(),
    }).where(eq(products.slug, slug));

    return NextResponse.json({ success: true, message: "Cleaned SMZ descriptions updated!" });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message }, { status: 500 });
  }
}