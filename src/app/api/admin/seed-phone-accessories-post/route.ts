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
    if (secret !== "seed-phone-acc-2026-ndz") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const slug = "phone-accessories-business-nigeria";
    const slugFr = "commerce-accessoires-telephone";
    const authorId = "c412acd2-68c5-4105-8869-b143400d244a";
    const coverImage = "https://images.unsplash.com/photo-1677145503755-5a8c581671fe?q=80&w=1200&auto=format&fit=crop";
    const coverImageAlt = "Assortment of phone accessories including chargers, cases and earphones displayed on a table for retail sale";
    const coverImageAltFr = d("Assortiment d\\u0027accessoires t\\u00e9l\\u00e9phoniques incluant chargeurs, coques et \\u00e9couteurs pr\\u00e9sent\\u00e9s pour la vente");

    // Idempotent: delete any existing versions
    await db.delete(blogPosts).where(
      or(eq(blogPosts.slug, slug), eq(blogPosts.slugFr, slugFr))
    );

    // ============ ENGLISH: Nigeria-focused ============
    const title = "How to Start a Phone Accessories Business in Nigeria (2026 Guide)";
    const excerpt = "Learn how to start a profitable phone accessories business in Nigeria with as little as N300,000. Discover the opportunities, startup capital, best locations, and how to double or triple your money on every sale.";

    const content = `
<p>In this complete guide, we will discuss <strong>how to start a phone accessories business in Nigeria</strong>. Whether we like it or not, mobile phones have become part of us. We use them daily, and just as important as the phones themselves are the accessories that keep them running — chargers, cases, earphones, screen protectors, power banks, and more.</p>

<p>Is it worth starting a phone accessories business in Nigeria? How profitable is it? How much can you realistically make? These are the questions we will answer in detail below.</p>

<p>Related read: If you are also considering a low-capital, high-turnover venture, check out our guide on <a href="/en/blog/pos-business-nigeria">how to start a POS business in Nigeria</a> — it pairs perfectly with a phone accessories shop.</p>

<h2>1. Opportunities in the Phone Accessories Business</h2>
<p>As mentioned in the introduction, phones are now inseparable from our daily lives. We use them constantly — for banking, communication, entertainment, and business. Many people cannot function for a single day without their phone, which means they deeply value it.</p>

<p>Anything valuable needs to be maintained and protected. Add to that the reality that many accessories bundled with new phones (especially budget models and cheap knockoffs) break easily and need replacement, and you have a market that never runs dry.</p>

<p>The second massive opportunity is sheer volume: <strong>Nigeria has over 200 million mobile phone subscriptions</strong>. Every single one of those users is a potential customer for chargers, cables, headphones, cases, and screen protectors.</p>

<h2>2. Skills Needed to Run a Phone Accessories Business</h2>
<p>Selling phone accessories does not require a university degree. The only real skill you need is <strong>salesmanship</strong> — the ability to attract, engage, and close customers. Improve your marketing skills, learn how to handle common sales objections (there are countless free tutorials and sales gurus online), and you are ready to go.</p>

<p>Basic product knowledge helps too. Learn the difference between fast chargers, PD chargers, USB-C vs Lightning, and which cases fit which phone models. This makes you look professional and builds customer trust.</p>

<h2>3. Capital Needed to Start</h2>
<p>Like any business, you need startup capital. Here is a realistic breakdown:</p>

<h3>A. Shop Rent</h3>
<p>A decent, clean shop suitable for phone accessories typically costs between <strong>N50,000 and N100,000 per year</strong> in most parts of Nigeria (higher in Lagos, Abuja, and Port Harcourt city centres).</p>

<h3>B. Shop Setup</h3>
<p>You need a table, chair, customer seating, display shelves, and a glass showcase to display premium items. Budget at least <strong>N50,000</strong> for basic setup.</p>

<h3>C. Initial Stock</h3>
<p>The size of your initial stock depends on your pocket. If you are starting small, budget <strong>at least N200,000</strong> for goods. The key is variety — customers expect you to have what they are asking for, in different price points, since not everyone has the same budget.</p>

<p><strong>Total minimum startup: around N300,000 to N350,000.</strong></p>

<h2>4. Choosing the Right Shop Location</h2>
<p>Once your capital is ready, it is time to hunt for a shop. Location can make or break your business. A good location means faster return on investment.</p>

<p>Consider these factors:</p>
<ul>
  <li><strong>The rent:</strong> Do not overstretch. Your first year rent should not consume more than 20% of your total capital.</li>
  <li><strong>The location:</strong> Crowded areas are gold — markets, phone villages, transport hubs, university areas, and busy commercial streets.</li>
  <li><strong>Security:</strong> Avoid areas with known crime issues. You will be handling phones and cash daily.</li>
  <li><strong>Nearby phone repair shops:</strong> These are excellent neighbours. Customers who repair phones often need new accessories immediately.</li>
</ul>

<h2>5. Return on Investment and Profit Potential</h2>
<p>How much can you make? Most phone accessories are sold at <strong>2x to 3x their wholesale cost</strong>. For example, if you buy a charger for N500, you can sell it for N1,000 to N1,500.</p>

<p>Realistic daily earnings:</p>
<ul>
  <li>Average daily sales: N10,000</li>
  <li>Average daily profit: N5,000 (at 100% markup)</li>
  <li>Monthly profit (26 working days): around N130,000</li>
</ul>

<p>As your customer base grows and you add higher-margin items like premium cases, wireless earbuds, and power banks, daily revenue can climb to N30,000 to N50,000 with proportionally higher profits.</p>

<h2>6. Business Management Essentials</h2>
<p>For your shop to last long-term, good management is non-negotiable. Avoid being too easy-going — you need to be firm about pricing, credit, and inventory.</p>

<p>Key management practices:</p>
<ul>
  <li>Keep a daily sales record (even a simple notebook works)</li>
  <li>Never mix business money with personal money</li>
  <li>Restock consistently — running out of popular items sends customers to your competitors</li>
  <li>Track which items sell fast and which sit on the shelf</li>
  <li>Set clear credit rules if you must give credit at all</li>
</ul>

<h2>7. How to Get Your First Sales</h2>
<p>As a new business, you need customers to survive. Try these tactics from day one:</p>
<ul>
  <li><strong>Tell everyone you know:</strong> Friends, family, neighbours — word of mouth is free and powerful</li>
  <li><strong>Offer a grand opening promotion:</strong> A small discount for the first week generates buzz and repeat visits</li>
  <li><strong>Post on WhatsApp status and social media:</strong> Free reach to hundreds of contacts</li>
  <li><strong>Partner with local phone repairers:</strong> Give them a small commission to refer customers to you</li>
  <li><strong>Print simple flyers:</strong> Distribute them in your immediate neighbourhood</li>
</ul>

<h2>8. How to Grow Your Business</h2>
<p>Growing means more sales, which means more marketing reach. Someone somewhere needs your products right now — your job is to reach them.</p>

<h3>A. Sell Online</h3>
<p>Do not limit yourself to walk-in customers. Create a simple online presence:</p>
<ul>
  <li>List on Jumia, Konga, and Jiji</li>
  <li>Post daily on Instagram and TikTok with product photos and short videos</li>
  <li>Build a WhatsApp broadcast list of interested customers</li>
</ul>

<h3>B. Use Paid Ads</h3>
<p>Facebook, Instagram, and Google ads can put your products in front of thousands of local customers for as little as N1,000 per day. Start small, learn what works, then scale up.</p>

<h3>C. Reward Referrals</h3>
<p>Offer any customer who brings you a new customer a small discount or free accessory. Referral marketing is one of the cheapest and most effective growth channels.</p>

<h2>9. Extra Income Opportunities</h2>
<p>Once your accessories shop is running smoothly, you can layer on additional revenue streams:</p>
<ul>
  <li><strong>Sell mobile phones:</strong> Start with a few refurbished units before moving into new phones</li>
  <li><strong>Phone repairs:</strong> Learn basic repairs or hire a technician — this brings in constant traffic that also buys accessories</li>
  <li><strong>Add POS services:</strong> Combine with a POS business to serve the same customers with financial transactions (see our <a href="/en/blog/pos-business-nigeria">POS business guide</a>)</li>
  <li><strong>Airtime and data sales:</strong> Small commission but constant footfall</li>
</ul>

<h2>10. Register Your Business</h2>
<p>We strongly recommend registering your business with the <strong>Corporate Affairs Commission (CAC)</strong>. Registration gives your shop credibility, allows you to open a corporate bank account, and makes it easier to work with suppliers, banks, and online marketplaces.</p>

<p>The process is now largely online and costs between N15,000 and N25,000 depending on the structure you choose (Business Name is cheapest and fastest for a solo shop owner).</p>

<h2>Conclusion</h2>
<p>To wrap up: the phone accessories business in Nigeria does not require a huge amount of capital. With around <strong>N300,000</strong>, you can launch a solid shop, and with good management and consistent marketing, grow it into a full-fledged mobile business.</p>

<p>The demand is constant, the profit margins are attractive, and the barrier to entry is low. If you are looking for a stable, scalable business you can start this month, this is one of the smartest choices available. Happy hustling.</p>
    `.trim();

    // ============ FRENCH: Globalized (NO Nigeria refs) ============
    const titleFr = d("Comment Lancer un Commerce d\\u0027Accessoires pour T\\u00e9l\\u00e9phones : Guide Complet 2026");
    const excerptFr = d("Apprenez \\u00e0 lancer un commerce rentable d\\u0027accessoires pour t\\u00e9l\\u00e9phones mobiles avec un capital modeste. D\\u00e9couvrez les opportunit\\u00e9s, le budget de d\\u00e9marrage, les meilleurs emplacements et comment doubler ou tripler votre marge sur chaque vente.");

    const contentFr = d(`
<p>Dans ce guide complet, nous verrons <strong>comment lancer un commerce d\\u0027accessoires pour t\\u00e9l\\u00e9phones mobiles</strong>. Que nous le voulions ou non, le t\\u00e9l\\u00e9phone est devenu une extension de nous-m\\u00eames. Nous l\\u0027utilisons quotidiennement, et les accessoires qui l\\u0027accompagnent sont tout aussi essentiels : chargeurs, coques, \\u00e9couteurs, protections d\\u0027\\u00e9cran, batteries externes, et bien plus.</p>

<p>Cette activit\\u00e9 est-elle rentable ? Quel budget faut-il pr\\u00e9voir ? Combien peut-on r\\u00e9ellement gagner ? Nous r\\u00e9pondrons \\u00e0 toutes ces questions ci-dessous.</p>

<p>\\u00c0 lire aussi : Si vous cherchez une activit\\u00e9 compl\\u00e9mentaire \\u00e0 faible capital et forte rotation, consultez notre guide sur le <a href="/fr/blog/terminal-paiement-electronique">lancement d\\u0027une activit\\u00e9 de terminal de paiement</a> \\u2014 elle se marie parfaitement avec une boutique d\\u0027accessoires.</p>

<h2>1. Les Opportunit\\u00e9s du March\\u00e9</h2>
<p>Comme mentionn\\u00e9 en introduction, le t\\u00e9l\\u00e9phone est aujourd\\u0027hui ins\\u00e9parable de nos vies quotidiennes. Nous l\\u0027utilisons constamment \\u2014 pour les op\\u00e9rations bancaires, la communication, le divertissement et le travail. Beaucoup de personnes ne peuvent pas passer une journ\\u00e9e sans leur t\\u00e9l\\u00e9phone, ce qui signifie qu\\u0027elles y accordent une grande valeur.</p>

<p>Ce qui a de la valeur doit \\u00eatre entretenu et prot\\u00e9g\\u00e9. Ajoutez \\u00e0 cela le fait que de nombreux accessoires livr\\u00e9s avec les t\\u00e9l\\u00e9phones neufs (surtout les mod\\u00e8les d\\u0027entr\\u00e9e de gamme et les contrefa\\u00e7ons) tombent rapidement en panne et n\\u00e9cessitent un remplacement \\u2014 vous avez un march\\u00e9 qui ne s\\u0027\\u00e9puise jamais.</p>

<p>La seconde grande opportunit\\u00e9 est le volume : plusieurs milliards de personnes utilisent un smartphone dans le monde. Chacune d\\u0027entre elles est un client potentiel pour des chargeurs, c\\u00e2bles, \\u00e9couteurs, coques et protections d\\u0027\\u00e9cran.</p>

<h2>2. Les Comp\\u00e9tences Requises</h2>
<p>Vendre des accessoires pour t\\u00e9l\\u00e9phones ne n\\u00e9cessite aucun dipl\\u00f4me universitaire. La seule vraie comp\\u00e9tence dont vous avez besoin est le <strong>sens commercial</strong> \\u2014 la capacit\\u00e9 d\\u0027attirer, d\\u0027engager et de conclure des ventes. Am\\u00e9liorez vos comp\\u00e9tences en marketing, apprenez \\u00e0 g\\u00e9rer les objections courantes (il existe d\\u0027innombrables tutoriels gratuits en ligne), et vous \\u00eates pr\\u00eat.</p>

<p>Une connaissance basique des produits aide \\u00e9galement. Apprenez la diff\\u00e9rence entre chargeurs rapides, PD, USB-C et Lightning, et quelles coques conviennent \\u00e0 quels mod\\u00e8les. Cela vous donne un air professionnel et cr\\u00e9e la confiance chez le client.</p>

<h2>3. Le Capital N\\u00e9cessaire</h2>
<p>Comme toute activit\\u00e9 commerciale, vous avez besoin d\\u0027un capital de d\\u00e9part. Voici une r\\u00e9partition r\\u00e9aliste :</p>

<h3>A. Loyer de la Boutique</h3>
<p>Une boutique d\\u00e9cente et bien situ\\u00e9e adapt\\u00e9e aux accessoires t\\u00e9l\\u00e9phoniques co\\u00fbte g\\u00e9n\\u00e9ralement <strong>l\\u0027\\u00e9quivalent de 2 \\u00e0 6 mois de salaire minimum local</strong> en loyer annuel, selon la ville et le quartier.</p>

<h3>B. Am\\u00e9nagement</h3>
<p>Vous aurez besoin d\\u0027une table, une chaise, des si\\u00e8ges pour les clients, des \\u00e9tag\\u00e8res de pr\\u00e9sentation et une vitrine en verre pour les articles premium. Pr\\u00e9voyez un budget d\\u0027am\\u00e9nagement de base.</p>

<h3>C. Stock Initial</h3>
<p>La taille de votre stock d\\u00e9pend de votre budget. Si vous d\\u00e9marrez petit, pr\\u00e9voyez au moins l\\u0027\\u00e9quivalent de plusieurs mois de salaire minimum en marchandise. La cl\\u00e9 est la <strong>vari\\u00e9t\\u00e9</strong> \\u2014 les clients s\\u0027attendent \\u00e0 trouver ce qu\\u0027ils cherchent, dans diff\\u00e9rentes gammes de prix, car tous n\\u0027ont pas le m\\u00eame budget.</p>

<h2>4. Choisir le Bon Emplacement</h2>
<p>Une fois votre capital pr\\u00eat, il est temps de chercher une boutique. L\\u0027emplacement peut faire ou d\\u00e9faire votre commerce. Un bon emplacement acc\\u00e9l\\u00e8re le retour sur investissement.</p>

<p>Consid\\u00e9rez ces facteurs :</p>
<ul>
  <li><strong>Le loyer :</strong> Ne vous surendettez pas. Votre premi\\u00e8re ann\\u00e9e de loyer ne devrait pas consommer plus de 20 % de votre capital total.</li>
  <li><strong>L\\u0027emplacement :</strong> Les zones anim\\u00e9es sont id\\u00e9ales \\u2014 march\\u00e9s, quartiers commer\\u00e7ants, zones universitaires, gares routi\\u00e8res, rues passantes.</li>
  <li><strong>La s\\u00e9curit\\u00e9 :</strong> \\u00c9vitez les zones \\u00e0 fort taux de criminalit\\u00e9. Vous manipulerez des produits de valeur et des esp\\u00e8ces quotidiennement.</li>
  <li><strong>La proximit\\u00e9 de r\\u00e9parateurs :</strong> Ce sont d\\u0027excellents voisins. Les clients qui font r\\u00e9parer leur t\\u00e9l\\u00e9phone ont souvent besoin d\\u0027accessoires imm\\u00e9diatement.</li>
</ul>

<h2>5. Retour sur Investissement et Marges</h2>
<p>Combien peut-on gagner ? La plupart des accessoires t\\u00e9l\\u00e9phoniques se vendent \\u00e0 <strong>2 \\u00e0 3 fois leur prix d\\u0027achat en gros</strong>. Par exemple, un chargeur achet\\u00e9 5 euros peut se vendre entre 10 et 15 euros.</p>

<p>Estimation r\\u00e9aliste des revenus :</p>
<ul>
  <li>Chiffre d\\u0027affaires quotidien moyen : \\u00e9quivalent d\\u0027une journ\\u00e9e de salaire moyen</li>
  <li>Marge quotidienne : environ 50 % du chiffre d\\u0027affaires</li>
  <li>Revenu mensuel (26 jours) : plusieurs fois le salaire minimum local</li>
</ul>

<p>\\u00c0 mesure que votre client\\u00e8le grandit et que vous ajoutez des articles \\u00e0 forte marge (coques premium, \\u00e9couteurs sans fil, batteries externes), le chiffre d\\u0027affaires quotidien peut consid\\u00e9rablement augmenter.</p>

<h2>6. Les Essentiels de la Gestion</h2>
<p>Pour que votre boutique dure sur le long terme, une bonne gestion est indispensable. \\u00c9vitez d\\u0027\\u00eatre trop laxiste \\u2014 vous devez \\u00eatre ferme sur les prix, le cr\\u00e9dit et l\\u0027inventaire.</p>

<p>Pratiques cl\\u00e9s :</p>
<ul>
  <li>Tenez un registre quotidien des ventes (m\\u00eame un simple cahier suffit)</li>
  <li>Ne m\\u00e9langez jamais l\\u0027argent de l\\u0027entreprise avec l\\u0027argent personnel</li>
  <li>R\\u00e9approvisionnez r\\u00e9guli\\u00e8rement \\u2014 la rupture de stock des articles populaires envoie vos clients chez la concurrence</li>
  <li>Suivez quels articles se vendent vite et lesquels stagnent</li>
  <li>D\\u00e9finissez des r\\u00e8gles claires si vous devez accorder du cr\\u00e9dit</li>
</ul>

<h2>7. Comment Obtenir Vos Premi\\u00e8res Ventes</h2>
<p>En tant que nouvelle entreprise, vous avez besoin de clients pour survivre. Essayez ces tactiques d\\u00e8s le premier jour :</p>
<ul>
  <li><strong>Parlez-en \\u00e0 tout le monde :</strong> Amis, famille, voisins \\u2014 le bouche-\\u00e0-oreille est gratuit et puissant</li>
  <li><strong>Proposez une promotion d\\u0027ouverture :</strong> Une petite r\\u00e9duction la premi\\u00e8re semaine cr\\u00e9e du buzz et fid\\u00e9lise</li>
  <li><strong>Publiez sur WhatsApp et les r\\u00e9seaux sociaux :</strong> Une port\\u00e9e gratuite vers des centaines de contacts</li>
  <li><strong>Associez-vous \\u00e0 des r\\u00e9parateurs locaux :</strong> Donnez-leur une petite commission pour chaque client r\\u00e9f\\u00e9r\\u00e9</li>
  <li><strong>Imprimez des prospectus simples :</strong> Distribuez-les dans votre quartier</li>
</ul>

<h2>8. Comment D\\u00e9velopper Votre Commerce</h2>
<p>D\\u00e9velopper signifie plus de ventes, donc plus de port\\u00e9e marketing. Quelqu\\u0027un, quelque part, a besoin de vos produits en ce moment \\u2014 votre travail est de l\\u0027atteindre.</p>

<h3>A. Vendez en Ligne</h3>
<p>Ne vous limitez pas aux clients qui passent devant votre boutique. Cr\\u00e9ez une pr\\u00e9sence en ligne :</p>
<ul>
  <li>Inscrivez-vous sur les marketplaces locales (Jumia, Cdiscount, Le Bon Coin selon votre pays)</li>
  <li>Publiez quotidiennement sur Instagram et TikTok avec photos et vid\\u00e9os courtes</li>
  <li>Constituez une liste WhatsApp de clients int\\u00e9ress\\u00e9s</li>
</ul>

<h3>B. Utilisez la Publicit\\u00e9 Payante</h3>
<p>Facebook, Instagram et Google Ads peuvent placer vos produits devant des milliers de clients locaux pour quelques euros par jour. Commencez petit, apprenez ce qui fonctionne, puis passez \\u00e0 l\\u0027\\u00e9chelle sup\\u00e9rieure.</p>

<h3>C. R\\u00e9compensez les Recommandations</h3>
<p>Offrez \\u00e0 tout client qui vous am\\u00e8ne un nouveau client une petite r\\u00e9duction ou un accessoire gratuit. Le marketing par recommandation est l\\u0027un des canaux de croissance les plus efficaces et les moins co\\u00fbteux.</p>

<h2>9. Sources de Revenus Compl\\u00e9mentaires</h2>
<p>Une fois votre boutique d\\u0027accessoires bien lanc\\u00e9e, vous pouvez ajouter d\\u0027autres sources de revenus :</p>
<ul>
  <li><strong>Vente de t\\u00e9l\\u00e9phones :</strong> Commencez par des mod\\u00e8les reconditionn\\u00e9s avant de passer aux t\\u00e9l\\u00e9phones neufs</li>
  <li><strong>R\\u00e9paration :</strong> Apprenez les r\\u00e9parations de base ou embauchez un technicien \\u2014 cela g\\u00e9n\\u00e8re un flux constant de clients qui ach\\u00e8tent aussi des accessoires</li>
  <li><strong>Ajoutez des services de paiement :</strong> Combinez avec un <a href="/fr/blog/terminal-paiement-electronique">terminal de paiement \\u00e9lectronique</a> pour servir les m\\u00eames clients avec des transactions financi\\u00e8res</li>
  <li><strong>Vente de cr\\u00e9dit t\\u00e9l\\u00e9phonique et de donn\\u00e9es :</strong> Petite commission mais flux constant de clients</li>
</ul>

<h2>10. Enregistrez Votre Entreprise</h2>
<p>Nous recommandons fortement d\\u0027enregistrer votre entreprise aupr\\u00e8s de <strong>l\\u0027organisme comp\\u00e9tent de votre pays</strong> (registre du commerce, chambre de commerce ou \\u00e9quivalent local). L\\u0027enregistrement donne de la cr\\u00e9dibilit\\u00e9 \\u00e0 votre boutique, vous permet d\\u0027ouvrir un compte bancaire professionnel et facilite les relations avec les fournisseurs, les banques et les marketplaces en ligne.</p>

<h2>Conclusion</h2>
<p>Pour conclure : le commerce d\\u0027accessoires pour t\\u00e9l\\u00e9phones ne demande pas un capital \\u00e9norme. Avec un budget modeste, vous pouvez lancer une boutique solide et, avec une bonne gestion et un marketing r\\u00e9gulier, la faire cro\\u00eetre jusqu\\u0027\\u00e0 devenir une entreprise mobile compl\\u00e8te.</p>

<p>La demande est constante, les marges sont attractives et la barri\\u00e8re \\u00e0 l\\u0027entr\\u00e9e est faible. Si vous cherchez une activit\\u00e9 stable et \\u00e9volutive que vous pouvez lancer ce mois-ci, c\\u0027est l\\u0027un des choix les plus intelligents. Bonne r\\u00e9ussite.</p>
    `.trim());

    // SEO metadata
    const seoTitle = "Phone Accessories Business in Nigeria: Complete Startup Guide | New Deal Zone";
    const metaDescription = "Start a phone accessories business in Nigeria with N300,000. Learn opportunities, capital breakdown, best locations, and how to profit 2-3x per sale.";
    const focusKeyphrase = "phone accessories business Nigeria";

    const seoTitleFr = d("Commerce d\\u0027Accessoires T\\u00e9l\\u00e9phones : Guide Complet 2026 | New Deal Zone");
    const metaDescriptionFr = d("Lancez un commerce rentable d\\u0027accessoires pour t\\u00e9l\\u00e9phones. Capital, emplacement, marges et strat\\u00e9gies pour g\\u00e9n\\u00e9rer des revenus solides d\\u00e8s le d\\u00e9part.");
    const focusKeyphraseFr = d("commerce accessoires t\\u00e9l\\u00e9phone");

    const tags = JSON.stringify(["phone accessories", "nigeria", "small business", "entrepreneurship", "retail", "side hustle", "mobile business"]);
    const tagsFr = JSON.stringify([
      d("accessoires t\\u00e9l\\u00e9phone"),
      "commerce",
      "petite entreprise",
      "entrepreneuriat",
      d("vente au d\\u00e9tail"),
      d("revenu compl\\u00e9mentaire"),
      "mobile"
    ]);

    // Word count ~1400 EN -> readTime = ceil(1400/200) = 7 min
    const readTime = 7;

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
      message: "Phone accessories post seeded successfully",
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