import { NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, or } from "drizzle-orm";

// Runtime French accent decoder (avoids PowerShell UTF-8 corruption)
function d(s: string): string {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
}

export async function POST(req: Request) {
  try {
    const { secret } = await req.json();
    if (secret !== "seed-phone-sell-2026-ndz") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const slug = "phone-selling-business-nigeria";
    const slugFr = "commerce-vente-telephones";
    const authorId = "c412acd2-68c5-4105-8869-b143400d244a";
    const coverImage = "https://images.unsplash.com/photo-1747572939169-192f44e107a3?q=80&w=1200&auto=format&fit=crop";
    const coverImageAlt = "Assortment of mobile smartphones displayed on shelves in a retail phone shop for sale";
    const coverImageAltFr = d("Assortiment de smartphones expos\\u00e9s sur des \\u00e9tag\\u00e8res dans une boutique de vente au d\\u00e9tail");

    // Idempotent: delete any existing versions
    await db.delete(blogPosts).where(
      or(eq(blogPosts.slug, slug), eq(blogPosts.slugFr, slugFr))
    );

    // ============ ENGLISH: Nigeria-focused ============
    const title = "How to Start a Phone Selling Business in Nigeria (2026 Guide)";
    const excerpt = "Complete guide to starting a profitable phone selling business in Nigeria. Learn opportunities, startup capital from N200,000, best locations, profit margins, and how to scale.";

    const content = `
<p>The <strong>phone selling business in Nigeria</strong> is one of the most lucrative retail ventures you can start today. In this guide, we will break down exactly how to start one, how much capital you need, where to source phones, how to price for profit, and how to scale from a small kiosk into a full mobile business.</p>

<p>Related reads: If you want to pair this venture with complementary income streams, check out our guides on <a href="/en/blog/pos-business-nigeria">starting a POS business in Nigeria</a> and <a href="/en/blog/phone-accessories-business-nigeria">starting a phone accessories business</a>.</p>

<h2>1. Opportunities in the Phone Selling Business</h2>
<p>Before you invest a single naira, understand why this market is so strong:</p>
<ul>
  <li><strong>Massive population:</strong> Nigeria has over <strong>200 million people</strong>, and almost everyone owns or wants to own a phone, regardless of budget.</li>
  <li><strong>Short replacement cycles:</strong> A large share of the market uses budget Chinese-brand phones (Tecno, Infinix, Itel) that typically need replacement every 18 to 30 months.</li>
  <li><strong>Rapid smartphone adoption:</strong> Millions of Nigerians upgrade from feature phones to entry-level smartphones every year.</li>
  <li><strong>You become your own boss:</strong> No corporate hierarchy, no monthly targets from a boss, just you and your customers.</li>
  <li><strong>Real financial freedom:</strong> A well-managed shop can generate a full-time income within the first six months.</li>
  <li><strong>Strong profit margins:</strong> More on the numbers below.</li>
</ul>

<h2>2. Skills You Need</h2>
<p>The phone selling business does not require any advanced degree or technical certification. What you actually need is <strong>selling skill</strong> — the ability to attract customers, explain products clearly, handle objections, and close deals.</p>

<p>You can build these skills for free:</p>
<ul>
  <li>Watch sales tutorials on YouTube (search for "retail selling techniques" and "handling customer objections")</li>
  <li>Study how successful phone dealers in your area interact with customers</li>
  <li>Learn basic phone specifications: RAM, storage, camera megapixels, battery capacity, and network bands</li>
  <li>Understand which phones fit which customer needs (student, worker, business person, elderly buyer)</li>
</ul>

<h2>3. Getting the Right Shop</h2>
<p>Not just any shop will do. The quality of your location directly determines your daily sales volume.</p>

<p><strong>Rule of thumb:</strong> A busy location may cost more in rent but will generate multiples of that cost in sales. A cheap shop in a dead zone will drain your capital before you make your first profit.</p>

<p>Expect to pay anywhere from <strong>N100,000 to N500,000 per year</strong> for a decent shop in a phone-selling cluster (higher in Lagos Computer Village, Ikeja, Abuja Wuse, or Port Harcourt phone markets).</p>

<h2>4. What to Look for in a Location</h2>
<p>There is a Nigerian saying: <em>"The way you dress is how people will address you."</em> The same applies to your shop. A clean, well-positioned, attractive shop will always outsell a shabby one.</p>

<p>Check for these factors:</p>
<ul>
  <li><strong>Foot traffic:</strong> Is the area busy with pedestrians daily?</li>
  <li><strong>Rent value:</strong> Is the price justified by the visibility and traffic?</li>
  <li><strong>Competition:</strong> Are there already 20 phone shops on the street? Consider a slightly quieter but growing area instead.</li>
  <li><strong>Accessibility:</strong> Can car owners park nearby? Can okada or keke riders drop off customers easily?</li>
  <li><strong>Security:</strong> Is the shop easy to break into at night? What is the neighbourhood crime level?</li>
  <li><strong>Power supply:</strong> Regular electricity means you can display charged demo phones and use security lights.</li>
</ul>

<h2>5. Capital Needed to Start</h2>
<p>How much money do you need? It depends on how big you want to start. Here is a realistic breakdown for a small-scale launch:</p>

<h3>A. Small-Scale Startup (Total: around N200,000)</h3>
<ul>
  <li><strong>Shop rent:</strong> N50,000 (small kiosk in a decent area)</li>
  <li><strong>Shop setup:</strong> N50,000 (display glass, chairs, small table, signage, security padlock)</li>
  <li><strong>Initial phone stock:</strong> N100,000 (approximately 25 to 28 basic feature phones at N3,500 to N4,000 each, or 5 to 8 entry-level smartphones)</li>
</ul>

<h3>B. Medium-Scale Startup (Total: around N800,000)</h3>
<ul>
  <li><strong>Shop rent:</strong> N150,000</li>
  <li><strong>Shop setup:</strong> N100,000</li>
  <li><strong>Stock:</strong> N500,000 (mix of feature phones, entry smartphones, and one or two mid-range models)</li>
  <li><strong>Working capital:</strong> N50,000 buffer</li>
</ul>

<h3>C. Full-Scale Launch (N1.5 million and above)</h3>
<p>Includes premium smartphones (Samsung Galaxy A-series, Tecno Camon, Infinix Note), refurbished iPhones, and a wider inventory. This tier can generate N50,000+ in daily profit once established.</p>

<h2>6. Profit Potential</h2>
<p>Let us do the math for a small-scale shop:</p>

<ul>
  <li>Buy price per basic phone: <strong>N4,000</strong></li>
  <li>Sell price per basic phone: <strong>N5,000 to N5,500</strong></li>
  <li>Profit per unit: <strong>N1,000 to N1,500</strong></li>
</ul>

<p>If you sell <strong>10 phones per day</strong> at N1,000 profit each, that is <strong>N10,000 in daily profit</strong>. On slow days, even 5 phones a day gives you N5,000. That works out to approximately <strong>N130,000 to N260,000 in monthly profit</strong> from a small kiosk alone.</p>

<p>Smartphone margins are even better. A phone bought at N45,000 can sell for N60,000 to N70,000, giving you N15,000 to N25,000 per unit sold.</p>

<h2>7. Business Management Essentials</h2>
<p>Statistics show most Nigerian start-ups fail within their first 5 years, and <strong>poor management</strong> is one of the top causes. To make a living long-term from your phone shop, follow these rules:</p>

<ul>
  <li>Keep a daily sales and expense record (a simple notebook or free app like Kippa or Bumpa works fine)</li>
  <li>Never mix business money with personal money — pay yourself a fixed monthly salary</li>
  <li>Restock consistently — customers who see an empty display never come back</li>
  <li>Track your best-selling models and reorder them faster</li>
  <li>Reinvest profits back into stock during the first year, not into luxuries</li>
  <li>Avoid giving credit to family, friends, or "trustworthy" strangers — cash sales only</li>
</ul>

<h2>8. Register Your Business</h2>
<p>Register your shop with the <strong>Corporate Affairs Commission (CAC)</strong>. This gives you:</p>
<ul>
  <li>Legal protection and a recognized business identity</li>
  <li>Ability to open a corporate bank account</li>
  <li>Credibility with suppliers and wholesalers (many now demand a CAC certificate)</li>
  <li>Access to bank loans and government support programs (GEEP, TraderMoni successors, etc.)</li>
  <li>Ability to list on Jumia, Konga, and Jiji as a verified merchant</li>
</ul>

<p>Business Name registration costs around <strong>N15,000 to N25,000</strong> and can be done online in a few days.</p>

<h2>9. How to Get Your First Customers</h2>
<p>You have opened the shop. Now what?</p>
<ul>
  <li><strong>Tell everyone you know:</strong> Friends, family, neighbours, church members, work colleagues. Word of mouth is free and powerful.</li>
  <li><strong>Use WhatsApp status daily:</strong> Post 2 to 3 phone photos with prices every day.</li>
  <li><strong>Run an opening promotion:</strong> A small discount or free earpiece with every phone for the first two weeks generates buzz.</li>
  <li><strong>Be friendly to passersby:</strong> A warm greeting invites people in, even if they were not planning to buy.</li>
  <li><strong>Treat every customer like gold:</strong> Handwork rule applies — happy customers bring friends. Rude treatment kills your business.</li>
</ul>

<h2>10. How to Promote and Grow</h2>

<h3>A. Flyers and Signage</h3>
<p>Print simple flyers with your prices and phone number. Distribute around bus stops, universities, and busy markets nearby.</p>

<h3>B. Social Media and Online Selling</h3>
<p>This is where real growth happens:</p>
<ul>
  <li>Create an Instagram and TikTok page — post daily with clear product photos</li>
  <li>List your phones on Jumia, Konga, and Jiji</li>
  <li>Join Facebook groups for phone dealers in your city</li>
  <li>Start a WhatsApp broadcast list of interested customers</li>
</ul>

<h3>C. Paid Advertising</h3>
<p>Facebook and Instagram ads targeting your city can reach thousands of potential buyers for as little as N1,000 per day. Start small, learn what works, then scale up.</p>

<h3>D. Referral Program</h3>
<p>Reward any customer who brings a new buyer to you with a small discount, free earpiece, or free screen protector.</p>

<h2>11. Extra Income Streams</h2>
<p>Once your main shop is stable, add on:</p>
<ul>
  <li><strong>Phone accessories:</strong> Chargers, earpieces, screen protectors, memory cards, pouches — see our full <a href="/en/blog/phone-accessories-business-nigeria">phone accessories business guide</a></li>
  <li><strong>Refurbishing cracked phones:</strong> Buy damaged phones cheap, fix and resell for solid profit (requires basic repair skills or a technician)</li>
  <li><strong>POS services:</strong> Add cash withdrawals, deposits, and bill payments to serve the same walk-in traffic — see our <a href="/en/blog/pos-business-nigeria">POS business guide</a></li>
  <li><strong>Airtime and data sales:</strong> Small margin but constant footfall</li>
  <li><strong>Phone accessories bundles:</strong> Sell phone + case + screen guard combos for higher ticket sales</li>
</ul>

<h2>12. Common Mistakes to Avoid</h2>
<ul>
  <li><strong>Buying too many of one model:</strong> Diversify your stock across price tiers and brands</li>
  <li><strong>Giving credit:</strong> Cash sales only until you have deep pockets and a proven customer</li>
  <li><strong>Involving family in operations:</strong> Business and family often do not mix — hire employees instead</li>
  <li><strong>Ignoring receipts:</strong> Always give a receipt and offer a short warranty (even 3 to 7 days)</li>
  <li><strong>Selling stolen phones:</strong> Never buy phones without proper ID from the seller — this can get you arrested</li>
  <li><strong>No warranty policy:</strong> Customers trust shops that offer even a 7-day return window</li>
</ul>

<h2>Frequently Asked Questions</h2>

<h3>Can I start a phone selling business with N100,000?</h3>
<p>Yes, but you will be limited to basic feature phones and maybe one or two entry-level smartphones. It is a starting point — reinvest all early profits to grow inventory.</p>

<h3>Where do I source phones wholesale in Nigeria?</h3>
<p>Top wholesale hubs include Computer Village (Ikeja, Lagos), Alaba International Market (Lagos), Wuse Market (Abuja), and Aba Phone Market (Abia). Always verify supplier legitimacy and avoid unusually cheap offers.</p>

<h3>Do I need a physical shop or can I sell online only?</h3>
<p>You can start purely online via Jumia, Konga, Jiji, WhatsApp, and Instagram with much lower capital. However, a physical shop builds trust much faster with local customers.</p>

<h3>How long before I break even?</h3>
<p>With good location and consistent effort, most small phone shops break even within <strong>4 to 8 months</strong>.</p>

<h2>Conclusion</h2>
<p>The phone selling business in Nigeria is genuinely profitable — but only for those willing to manage it properly. Avoid mixing family and business, avoid giving credit, keep clean records, and reinvest early profits into growing your stock.</p>

<p>With the right location, consistent hustle, and smart marketing, this is a business that can pay your bills for decades. Are you ready to put in the work?</p>
    `.trim();

    // ============ FRENCH: Globalized (NO Nigeria refs) ============
    const titleFr = d("Comment Lancer un Commerce de Vente de T\\u00e9l\\u00e9phones : Guide Complet 2026");
    const excerptFr = d("Guide complet pour lancer un commerce rentable de vente de t\\u00e9l\\u00e9phones mobiles. Opportunit\\u00e9s, capital de d\\u00e9marrage, meilleurs emplacements, marges b\\u00e9n\\u00e9ficiaires et strat\\u00e9gies pour d\\u00e9velopper votre boutique.");

    const contentFr = d(`
<p>Le <strong>commerce de vente de t\\u00e9l\\u00e9phones mobiles</strong> est l\\u0027une des activit\\u00e9s de vente au d\\u00e9tail les plus lucratives que vous puissiez lancer aujourd\\u0027hui. Dans ce guide, nous d\\u00e9taillons exactement comment d\\u00e9marrer, quel capital pr\\u00e9voir, o\\u00f9 vous approvisionner, comment fixer vos prix pour maximiser vos marges, et comment passer d\\u0027un petit kiosque \\u00e0 une v\\u00e9ritable boutique mobile.</p>

<p>\\u00c0 lire aussi : Pour combiner cette activit\\u00e9 avec des sources de revenus compl\\u00e9mentaires, consultez nos guides sur le <a href="/fr/blog/terminal-paiement-electronique">lancement d\\u0027une activit\\u00e9 de terminal de paiement</a> et sur le <a href="/fr/blog/commerce-accessoires-telephone">commerce d\\u0027accessoires t\\u00e9l\\u00e9phoniques</a>.</p>

<h2>1. Les Opportunit\\u00e9s du March\\u00e9</h2>
<p>Avant d\\u0027investir le moindre euro, comprenez pourquoi ce march\\u00e9 est aussi solide :</p>
<ul>
  <li><strong>Une base de clients \\u00e9norme :</strong> Plusieurs milliards de personnes utilisent un t\\u00e9l\\u00e9phone mobile dans le monde, et la plupart en changent r\\u00e9guli\\u00e8rement.</li>
  <li><strong>Des cycles de remplacement courts :</strong> Une grande partie du march\\u00e9 utilise des t\\u00e9l\\u00e9phones d\\u0027entr\\u00e9e de gamme qui n\\u00e9cessitent un remplacement tous les 18 \\u00e0 30 mois.</li>
  <li><strong>Adoption rapide du smartphone :</strong> Des millions de consommateurs passent chaque ann\\u00e9e du t\\u00e9l\\u00e9phone basique au smartphone d\\u0027entr\\u00e9e de gamme.</li>
  <li><strong>Vous devenez votre propre patron :</strong> Aucune hi\\u00e9rarchie, aucun objectif mensuel impos\\u00e9, juste vous et vos clients.</li>
  <li><strong>Une vraie libert\\u00e9 financi\\u00e8re :</strong> Une boutique bien g\\u00e9r\\u00e9e peut g\\u00e9n\\u00e9rer un revenu \\u00e0 temps plein en six mois.</li>
  <li><strong>De fortes marges b\\u00e9n\\u00e9ficiaires :</strong> Nous d\\u00e9taillons les chiffres ci-dessous.</li>
</ul>

<h2>2. Les Comp\\u00e9tences Requises</h2>
<p>Le commerce de vente de t\\u00e9l\\u00e9phones ne demande aucun dipl\\u00f4me sp\\u00e9cifique ni certification technique. Ce dont vous avez r\\u00e9ellement besoin, c\\u0027est de <strong>comp\\u00e9tences commerciales</strong> \\u2014 la capacit\\u00e9 d\\u0027attirer les clients, d\\u0027expliquer clairement les produits, de g\\u00e9rer les objections et de conclure des ventes.</p>

<p>Vous pouvez d\\u00e9velopper ces comp\\u00e9tences gratuitement :</p>
<ul>
  <li>Regardez des tutoriels de vente sur YouTube (cherchez \\u00ab techniques de vente retail \\u00bb et \\u00ab g\\u00e9rer les objections client \\u00bb)</li>
  <li>Observez comment les revendeurs \\u00e0 succ\\u00e8s de votre r\\u00e9gion interagissent avec les clients</li>
  <li>Apprenez les caract\\u00e9ristiques de base : RAM, stockage, m\\u00e9gapixels, capacit\\u00e9 de batterie, bandes r\\u00e9seau</li>
  <li>Comprenez quels t\\u00e9l\\u00e9phones conviennent \\u00e0 quels profils (\\u00e9tudiant, salari\\u00e9, entrepreneur, senior)</li>
</ul>

<h2>3. Trouver la Bonne Boutique</h2>
<p>N\\u0027importe quelle boutique ne suffira pas. La qualit\\u00e9 de votre emplacement d\\u00e9termine directement votre volume de ventes quotidien.</p>

<p><strong>R\\u00e8gle d\\u0027or :</strong> Un emplacement anim\\u00e9 co\\u00fbte plus cher en loyer mais g\\u00e9n\\u00e9rera plusieurs fois ce co\\u00fbt en chiffre d\\u0027affaires. Une boutique bon march\\u00e9 dans une zone morte \\u00e9puisera votre capital avant m\\u00eame votre premier b\\u00e9n\\u00e9fice.</p>

<h2>4. Les Crit\\u00e8res d\\u0027un Bon Emplacement</h2>
<p>Il existe un adage : <em>\\u00ab On juge un livre \\u00e0 sa couverture. \\u00bb</em> Cela vaut aussi pour votre boutique. Un espace propre, bien plac\\u00e9 et attrayant surpassera toujours une boutique n\\u00e9glig\\u00e9e.</p>

<p>V\\u00e9rifiez ces facteurs :</p>
<ul>
  <li><strong>Achalandage :</strong> La zone est-elle fr\\u00e9quent\\u00e9e quotidiennement ?</li>
  <li><strong>Valeur du loyer :</strong> Le prix est-il justifi\\u00e9 par la visibilit\\u00e9 et le trafic ?</li>
  <li><strong>Concurrence :</strong> Y a-t-il d\\u00e9j\\u00e0 20 boutiques de t\\u00e9l\\u00e9phones dans la rue ? Consid\\u00e9rez une zone l\\u00e9g\\u00e8rement plus calme mais en croissance.</li>
  <li><strong>Accessibilit\\u00e9 :</strong> Les clients peuvent-ils se garer facilement ? Les transports en commun sont-ils proches ?</li>
  <li><strong>S\\u00e9curit\\u00e9 :</strong> La boutique est-elle facilement cambriolable la nuit ? Quel est le niveau de s\\u00e9curit\\u00e9 du quartier ?</li>
  <li><strong>Fiabilit\\u00e9 \\u00e9lectrique :</strong> L\\u0027\\u00e9lectricit\\u00e9 stable vous permet de garder les t\\u00e9l\\u00e9phones de d\\u00e9monstration charg\\u00e9s.</li>
</ul>

<h2>5. Le Capital N\\u00e9cessaire</h2>
<p>Combien d\\u0027argent faut-il ? Cela d\\u00e9pend de l\\u0027ampleur de votre lancement. Voici une r\\u00e9partition r\\u00e9aliste :</p>

<h3>A. Lancement Petite \\u00c9chelle</h3>
<ul>
  <li>Loyer d\\u0027un petit kiosque dans un quartier correct</li>
  <li>Am\\u00e9nagement (vitrine, chaises, table, enseigne, s\\u00e9curit\\u00e9)</li>
  <li>Stock initial : environ 25 \\u00e0 30 t\\u00e9l\\u00e9phones basiques ou 5 \\u00e0 8 smartphones d\\u0027entr\\u00e9e de gamme</li>
</ul>

<h3>B. Lancement Moyenne \\u00c9chelle</h3>
<ul>
  <li>Loyer d\\u0027une boutique bien situ\\u00e9e</li>
  <li>Am\\u00e9nagement complet et signal\\u00e9tique de qualit\\u00e9</li>
  <li>Stock diversifi\\u00e9 : t\\u00e9l\\u00e9phones basiques, smartphones d\\u0027entr\\u00e9e et un ou deux mod\\u00e8les milieu de gamme</li>
  <li>Fonds de roulement de r\\u00e9serve</li>
</ul>

<h3>C. Lancement Grande \\u00c9chelle</h3>
<p>Inclut des smartphones premium (Samsung Galaxy A, Xiaomi Redmi Note, iPhone reconditionn\\u00e9s) et un inventaire large. Ce niveau peut g\\u00e9n\\u00e9rer un revenu quotidien tr\\u00e8s substantiel une fois \\u00e9tabli.</p>

<h2>6. Le Potentiel de B\\u00e9n\\u00e9fice</h2>
<p>Faisons le calcul pour une petite boutique :</p>

<ul>
  <li>Prix d\\u0027achat d\\u0027un t\\u00e9l\\u00e9phone basique : co\\u00fbt de gros standard</li>
  <li>Prix de vente : environ 25 \\u00e0 40 % de marge</li>
  <li>B\\u00e9n\\u00e9fice par unit\\u00e9 : significatif sur volume</li>
</ul>

<p>Si vous vendez <strong>10 t\\u00e9l\\u00e9phones par jour</strong>, m\\u00eame les jours creux avec 5 ventes vous donnent un revenu quotidien confortable. Sur un mois, cela repr\\u00e9sente plusieurs fois le salaire minimum local.</p>

<p>Les marges sur les smartphones sont encore meilleures : un t\\u00e9l\\u00e9phone milieu de gamme peut d\\u00e9gager une marge unitaire \\u00e9quivalente \\u00e0 plusieurs jours de salaire.</p>

<h2>7. Les Essentiels de la Gestion</h2>
<p>Les statistiques montrent que la majorit\\u00e9 des jeunes entreprises \\u00e9chouent dans leurs 5 premi\\u00e8res ann\\u00e9es, et la <strong>mauvaise gestion</strong> est l\\u0027une des causes principales. Pour vivre durablement de votre boutique, suivez ces r\\u00e8gles :</p>

<ul>
  <li>Tenez un registre quotidien des ventes et d\\u00e9penses (un simple cahier ou une application gratuite suffit)</li>
  <li>Ne m\\u00e9langez jamais l\\u0027argent professionnel avec l\\u0027argent personnel \\u2014 versez-vous un salaire mensuel fixe</li>
  <li>R\\u00e9approvisionnez r\\u00e9guli\\u00e8rement \\u2014 les clients qui voient une vitrine vide ne reviennent pas</li>
  <li>Identifiez vos mod\\u00e8les les plus vendus et r\\u00e9commandez-les plus vite</li>
  <li>R\\u00e9investissez les b\\u00e9n\\u00e9fices dans le stock la premi\\u00e8re ann\\u00e9e, pas dans le luxe</li>
  <li>\\u00c9vitez d\\u0027accorder du cr\\u00e9dit \\u2014 ventes au comptant uniquement</li>
</ul>

<h2>8. Enregistrez Votre Entreprise</h2>
<p>Enregistrez votre boutique aupr\\u00e8s de <strong>l\\u0027organisme comp\\u00e9tent de votre pays</strong> (registre du commerce, chambre de commerce ou \\u00e9quivalent local). Cela vous apporte :</p>
<ul>
  <li>Une protection juridique et une identit\\u00e9 commerciale reconnue</li>
  <li>La possibilit\\u00e9 d\\u0027ouvrir un compte bancaire professionnel</li>
  <li>De la cr\\u00e9dibilit\\u00e9 aupr\\u00e8s des fournisseurs et grossistes</li>
  <li>L\\u0027acc\\u00e8s aux pr\\u00eats bancaires et aux programmes de soutien gouvernementaux</li>
  <li>La possibilit\\u00e9 de vendre sur les marketplaces (Cdiscount, Amazon, Le Bon Coin, etc.) en tant que marchand v\\u00e9rifi\\u00e9</li>
</ul>

<h2>9. Obtenir Vos Premiers Clients</h2>
<p>Vous avez ouvert la boutique. Et maintenant ?</p>
<ul>
  <li><strong>Parlez-en \\u00e0 tout votre entourage :</strong> Amis, famille, voisins, coll\\u00e8gues. Le bouche-\\u00e0-oreille est gratuit et puissant.</li>
  <li><strong>Utilisez WhatsApp quotidiennement :</strong> Publiez 2 \\u00e0 3 photos de t\\u00e9l\\u00e9phones avec prix chaque jour.</li>
  <li><strong>Lancez une promotion d\\u0027ouverture :</strong> Une petite r\\u00e9duction ou un accessoire offert les deux premi\\u00e8res semaines g\\u00e9n\\u00e8re du buzz.</li>
  <li><strong>Soyez accueillant avec les passants :</strong> Un salut chaleureux invite les gens \\u00e0 entrer, m\\u00eame sans intention d\\u0027achat imm\\u00e9diat.</li>
  <li><strong>Traitez chaque client comme de l\\u0027or :</strong> Un client satisfait revient avec ses amis. Un client mal trait\\u00e9 tue votre r\\u00e9putation.</li>
</ul>

<h2>10. Promouvoir et D\\u00e9velopper Votre Commerce</h2>

<h3>A. Flyers et Signal\\u00e9tique</h3>
<p>Imprimez des flyers simples avec vos prix et num\\u00e9ro de t\\u00e9l\\u00e9phone. Distribuez-les autour des arr\\u00eats de bus, universit\\u00e9s et march\\u00e9s anim\\u00e9s.</p>

<h3>B. R\\u00e9seaux Sociaux et Vente en Ligne</h3>
<p>C\\u0027est l\\u00e0 que se passe la vraie croissance :</p>
<ul>
  <li>Cr\\u00e9ez une page Instagram et TikTok \\u2014 publiez quotidiennement avec des photos claires</li>
  <li>Inscrivez vos t\\u00e9l\\u00e9phones sur les marketplaces locales</li>
  <li>Rejoignez les groupes Facebook de revendeurs de t\\u00e9l\\u00e9phones de votre ville</li>
  <li>Constituez une liste de diffusion WhatsApp de clients int\\u00e9ress\\u00e9s</li>
</ul>

<h3>C. Publicit\\u00e9 Payante</h3>
<p>Facebook et Instagram Ads cibl\\u00e9es sur votre ville peuvent atteindre des milliers d\\u0027acheteurs potentiels pour quelques euros par jour. Commencez petit, testez, puis passez \\u00e0 l\\u0027\\u00e9chelle.</p>

<h3>D. Programme de Parrainage</h3>
<p>R\\u00e9compensez tout client qui vous ram\\u00e8ne un nouvel acheteur avec une petite r\\u00e9duction ou un accessoire offert.</p>

<h2>11. Sources de Revenus Compl\\u00e9mentaires</h2>
<p>Une fois votre boutique principale stable, ajoutez :</p>
<ul>
  <li><strong>Accessoires t\\u00e9l\\u00e9phoniques :</strong> Chargeurs, \\u00e9couteurs, protections d\\u0027\\u00e9cran, cartes m\\u00e9moire, coques \\u2014 voir notre <a href="/fr/blog/commerce-accessoires-telephone">guide complet sur les accessoires t\\u00e9l\\u00e9phoniques</a></li>
  <li><strong>Reconditionnement de t\\u00e9l\\u00e9phones cass\\u00e9s :</strong> Achetez des t\\u00e9l\\u00e9phones endommag\\u00e9s pas chers, r\\u00e9parez-les et revendez-les avec une belle marge</li>
  <li><strong>Services de paiement :</strong> Ajoutez retraits, d\\u00e9p\\u00f4ts et paiements de factures pour servir le m\\u00eame flux de clients \\u2014 voir notre <a href="/fr/blog/terminal-paiement-electronique">guide TPE</a></li>
  <li><strong>Vente de cr\\u00e9dit t\\u00e9l\\u00e9phonique et de donn\\u00e9es :</strong> Petite marge mais flux constant</li>
  <li><strong>Packs t\\u00e9l\\u00e9phone + accessoires :</strong> Vendez des packs t\\u00e9l\\u00e9phone + coque + protection d\\u0027\\u00e9cran pour augmenter le panier moyen</li>
</ul>

<h2>12. Erreurs Courantes \\u00e0 \\u00c9viter</h2>
<ul>
  <li><strong>Acheter trop d\\u0027un seul mod\\u00e8le :</strong> Diversifiez votre stock sur diff\\u00e9rentes gammes de prix et marques</li>
  <li><strong>Accorder du cr\\u00e9dit :</strong> Ventes au comptant uniquement tant que vous n\\u0027avez pas de tr\\u00e9sorerie solide</li>
  <li><strong>Impliquer la famille dans la gestion :</strong> Business et famille font rarement bon m\\u00e9nage \\u2014 embauchez plut\\u00f4t des employ\\u00e9s</li>
  <li><strong>N\\u00e9gliger les re\\u00e7us :</strong> Donnez toujours un re\\u00e7u et offrez une garantie courte (m\\u00eame 3 \\u00e0 7 jours)</li>
  <li><strong>Vendre des t\\u00e9l\\u00e9phones vol\\u00e9s :</strong> N\\u0027achetez jamais de t\\u00e9l\\u00e9phones sans pi\\u00e8ce d\\u0027identit\\u00e9 du vendeur \\u2014 cela peut vous conduire en prison</li>
  <li><strong>Aucune politique de garantie :</strong> Les clients font davantage confiance aux boutiques offrant m\\u00eame une garantie de 7 jours</li>
</ul>

<h2>Questions Fr\\u00e9quentes</h2>

<h3>Puis-je lancer un commerce de t\\u00e9l\\u00e9phones avec un petit budget ?</h3>
<p>Oui, mais vous serez limit\\u00e9 aux t\\u00e9l\\u00e9phones basiques et \\u00e0 un ou deux smartphones d\\u0027entr\\u00e9e. C\\u0027est un point de d\\u00e9part \\u2014 r\\u00e9investissez tous les premiers b\\u00e9n\\u00e9fices pour \\u00e9largir votre inventaire.</p>

<h3>O\\u00f9 trouver des grossistes en t\\u00e9l\\u00e9phones ?</h3>
<p>Renseignez-vous aupr\\u00e8s des grossistes officiels de marques (Samsung, Xiaomi, Tecno), des importateurs agr\\u00e9\\u00e9s et des salons professionnels dans votre r\\u00e9gion. \\u00c9vitez les offres suspicieusement bon march\\u00e9.</p>

<h3>Faut-il une boutique physique ou puis-je vendre uniquement en ligne ?</h3>
<p>Vous pouvez d\\u00e9marrer purement en ligne via les marketplaces, WhatsApp et Instagram avec un capital tr\\u00e8s r\\u00e9duit. Cependant, une boutique physique construit la confiance beaucoup plus rapidement avec les clients locaux.</p>

<h3>Combien de temps pour rentabiliser ?</h3>
<p>Avec un bon emplacement et un effort constant, la plupart des petites boutiques de t\\u00e9l\\u00e9phones atteignent le seuil de rentabilit\\u00e9 en <strong>4 \\u00e0 8 mois</strong>.</p>

<h2>Conclusion</h2>
<p>Le commerce de vente de t\\u00e9l\\u00e9phones est r\\u00e9ellement rentable \\u2014 mais uniquement pour ceux qui savent le g\\u00e9rer correctement. \\u00c9vitez de m\\u00e9langer famille et business, \\u00e9vitez d\\u0027accorder du cr\\u00e9dit, tenez des comptes clairs et r\\u00e9investissez les premiers b\\u00e9n\\u00e9fices dans l\\u0027agrandissement de votre stock.</p>

<p>Avec le bon emplacement, une hustle constante et un marketing intelligent, c\\u0027est une activit\\u00e9 qui peut payer vos factures pendant des d\\u00e9cennies. \\u00cates-vous pr\\u00eat \\u00e0 vous investir ?</p>
    `.trim());

    // SEO metadata
    const seoTitle = "Phone Selling Business in Nigeria: Complete 2026 Startup Guide | New Deal Zone";
    const metaDescription = "Start a profitable phone selling business in Nigeria with N200,000. Complete guide: opportunities, capital, location, profit margins, and how to scale fast.";
    const focusKeyphrase = "phone selling business Nigeria";

    const seoTitleFr = d("Commerce de Vente de T\\u00e9l\\u00e9phones : Guide de D\\u00e9marrage 2026 | New Deal Zone");
    const metaDescriptionFr = d("Lancez un commerce rentable de vente de t\\u00e9l\\u00e9phones mobiles. Guide complet : opportunit\\u00e9s, capital, emplacement, marges et strat\\u00e9gies pour d\\u00e9velopper votre boutique.");
    const focusKeyphraseFr = d("commerce vente t\\u00e9l\\u00e9phones");

    const tags = JSON.stringify(["phone selling", "nigeria", "mobile business", "entrepreneurship", "small business", "retail", "smartphone business"]);
    const tagsFr = JSON.stringify([
      d("vente t\\u00e9l\\u00e9phones"),
      "commerce mobile",
      "entrepreneuriat",
      "petite entreprise",
      d("vente au d\\u00e9tail"),
      "smartphones",
      "revendeur"
    ]);

    const readTime = 9;

    const inserted = await db.insert(blogPosts).values({
      slug,
      slugFr,
      title,
      excerpt,
      content,
      titleFr,
      excerptFr,
      contentFr,
      coverImage,
      coverImageAlt,
      coverImageAltFr,
      category: "business",
      tags,
      tagsFr,
      authorId,
      readTime,
      published: true,
      featured: false,
      publishedAt: new Date(),
      viewCount: 0,
      seoTitle,
      metaDescription,
      focusKeyphrase,
      ogImage: coverImage,
      canonicalUrl: `https://newdealzone.com/en/blog/${slug}`,
      noIndex: false,
      seoTitleFr,
      metaDescriptionFr,
      focusKeyphraseFr,
    }).returning();

    return NextResponse.json({
      success: true,
      message: "Phone selling post seeded successfully",
      post: inserted[0],
      urls: {
        en: `https://newdealzone.com/en/blog/${slug}`,
        fr: `https://newdealzone.com/fr/blog/${slugFr}`,
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: "seed failed",
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}