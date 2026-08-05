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
    if (secret !== "seed-pos-2026-ndz") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const slug = "pos-business-nigeria";
    const oldSlug = "how-to-start-a-pos-business-in-nigeria";
    const authorId = "c412acd2-68c5-4105-8869-b143400d244a";
    const coverImage = "https://images.unsplash.com/photo-1718010571964-bac048b9ded0?q=80&w=1200&auto=format&fit=crop";
    const coverImageAlt = "POS terminal machine used for mobile banking and cash withdrawal transactions in Nigeria";
    const coverImageAltFr = d("Terminal POS utilis\\u00e9 pour les transactions bancaires mobiles et les retraits d\\u0027esp\\u00e8ces au Nig\\u00e9ria");

    // Delete old bad-slug version + current slug (idempotent seed)
    await db.delete(blogPosts).where(or(eq(blogPosts.slug, slug), eq(blogPosts.slug, oldSlug)));

    // ============ ENGLISH CONTENT ============
    const title = "How to Start a POS Business in Nigeria: The Complete 2026 Guide";
    const excerpt = "Learn how to start a profitable POS business in Nigeria from scratch. Discover requirements, startup costs, top providers, and how to earn up to N15,000 daily.";

    const content = `
<p>POS business, which stands for <strong>Point Of Sale business</strong>, is one of the most lucrative and legitimate ventures in Nigeria today. It is easy to start, requires relatively low capital, and offers strong profit potential — unlike many businesses that demand a huge investment upfront.</p>

<p>In this complete guide, we will discuss the opportunities in the POS business, the requirements, the pros and cons, and the realistic profit you can make. Did you know that with the right setup, you can make up to <strong>N15,000 in profit daily</strong>? Let's break it all down.</p>

<h2>1. What is Involved in a POS Business?</h2>
<p>A POS business involves offering the following services to customers in exchange for a small fee:</p>
<ul>
  <li>Cash withdrawals</li>
  <li>Cash deposits</li>
  <li>Money transfers</li>
  <li>Airtime and data sales</li>
  <li>Bill payments (GoTV, DSTV, electricity, water, etc.)</li>
</ul>

<h2>2. The Massive Opportunity in POS</h2>
<p>Have you ever waited in a bank queue for over an hour just to make a deposit? Or stood in front of an ATM only to see the dreaded <em>"out of service"</em> or <em>"temporarily unable to dispense cash"</em> message?</p>
<p>Humans are impatient by nature. Most people would gladly skip long bank queues if there's a faster, closer option — and that is exactly where your POS business comes in. You become the bridge between banks and people who need instant financial services.</p>

<h2>3. Requirements You Must Meet</h2>
<p>Anything involving financial transactions must be taken seriously. Here's what you need to get started:</p>

<h3>A. Have an Established Business</h3>
<p>Financial institutions need to trust you before handing over a POS terminal. You need a registered business with the <strong>Corporate Affairs Commission (CAC)</strong>. If your business is not properly registered, your application will likely be declined.</p>

<h3>B. Approach Financial Institutions</h3>
<p>You'll need a POS machine, and to get one, you must approach a bank or fintech company. Most banks require you to be an existing customer with an active account.</p>
<p>Beyond traditional banks, here are top POS providers in Nigeria:</p>
<ul>
  <li>OPay</li>
  <li>Moniepoint</li>
  <li>PalmPay</li>
  <li>Paga</li>
  <li>Baxi</li>
  <li>Quickteller</li>
  <li>Firstmonie (First Bank)</li>
  <li>PocketMoni</li>
  <li>PayCentre</li>
  <li>Nexgo POS</li>
  <li>CitiServe</li>
</ul>

<h3>C. Required Documents</h3>
<p>Requirements vary slightly by provider, but you'll typically need:</p>
<ul>
  <li>Valid means of identification (Driver's License, National ID, International Passport, or Voter's Card)</li>
  <li>BVN (Bank Verification Number)</li>
  <li>2 recent passport photographs</li>
  <li>2 current account references</li>
  <li>CAC Certificate (evidence of business registration)</li>
  <li>Tax Identification Number (TIN)</li>
  <li>Memorandum and Articles of Association</li>
  <li>Credit Bureau Report</li>
  <li>Minimum working capital of N50,000</li>
</ul>

<h2>4. How to Get Started</h2>

<h3>A. Get the Necessary Tools</h3>
<ul>
  <li>A POS machine (the most important tool)</li>
  <li>A card reader</li>
  <li>A barcode scanner (for bill payment transactions)</li>
  <li>A reliable smartphone with mobile data</li>
</ul>

<h3>B. Choose a Location</h3>
<p>You don't need a big shop. In fact, many operators run POS from a small container or kiosk. If you already have a shop or existing business, simply add POS as an extra income stream.</p>
<p>Using a container saves you from yearly shop rent — you buy it once and only pay a small token for the space.</p>

<h3>C. Pick the Right Spot</h3>
<p>Location is everything. Consider these factors:</p>
<ul>
  <li><strong>Accessibility:</strong> Can customers easily reach you? Is there parking?</li>
  <li><strong>Foot traffic:</strong> Is the area busy? Markets, bus stops, and residential estates are gold mines.</li>
  <li><strong>Competition:</strong> How many POS operators are already there? Can you offer something better — faster service, lower fees, or extended hours?</li>
  <li><strong>Security:</strong> Is the area safe? You'll be handling cash daily.</li>
</ul>

<h2>5. How to Start a POS Business on a Low Budget</h2>
<p>POS machines typically cost <strong>N45,000, N65,000, or N75,000</strong>, depending on features and speed. The pricier machines are faster and more reliable — the difference is similar to comparing 2G, 3G, and 4G networks.</p>
<p><strong>No machine? No problem.</strong> You can still start by accepting bank transfers into your personal account and giving customers cash in return. For deposits, collect cash and transfer it into the account they provide. This is the fastest way to test the business before investing in a machine.</p>

<h2>6. Pros and Cons</h2>

<h3>Pros</h3>
<ul>
  <li>Little to no IT knowledge required</li>
  <li>Highly mobile — operate almost anywhere</li>
  <li>No software installation needed</li>
  <li>Automatic cloud backup of all transactions</li>
  <li>Strong daily profit potential</li>
</ul>

<h3>Cons</h3>
<ul>
  <li><strong>Network issues:</strong> Occasional connectivity failures can disrupt service</li>
  <li><strong>Security risk:</strong> Handling cash daily requires strong security awareness</li>
  <li><strong>Cash flow management:</strong> You need enough float to serve customers throughout the day</li>
</ul>

<h2>7. How Much Can You Make?</h2>
<p>Your daily earnings depend on transaction volume. Typical charges:</p>
<ul>
  <li>Withdraw N10,000 → charge N150 to N200</li>
  <li>Larger withdrawals (N50,000+) → charge up to N500 to N2,000</li>
  <li>Bill payments → charge N100 to N300 per transaction</li>
</ul>
<p>If you serve <strong>50 customers a day</strong> with a mix of deposits and withdrawals, earning <strong>N10,000 to N15,000 daily is very realistic</strong>. That's over N300,000 monthly.</p>

<h2>8. How to Succeed in POS Business</h2>
<ul>
  <li>Keep your charges fair — competitive pricing builds loyal customers</li>
  <li>Operate in a safe, secure area</li>
  <li>Avoid keeping large amounts of cash on-site — deposit regularly</li>
  <li>Build trust with customers through excellent, friendly service</li>
  <li>Have a backup network (dual SIM, WiFi) to handle outages</li>
</ul>

<h2>9. Why You Should Start a POS Business Today</h2>
<ul>
  <li>Low startup capital compared to most businesses</li>
  <li>High profit potential from day one</li>
  <li>You create a stable job for yourself</li>
  <li>No technical expertise required</li>
  <li>Cash economy in Nigeria keeps demand strong</li>
</ul>

<h2>Conclusion</h2>
<p>POS business is one of the smartest ways to earn a stable, growing income in Nigeria today. Whether as a side hustle or a full-time venture, it's an excellent income opportunity that anyone with basic capital and the right location can start.</p>
<p>Even if you already own a business, adding POS services is a powerful way to expand your revenue streams and keep customers coming back. Start small, stay consistent, and scale as your customer base grows.</p>
    `.trim();

    // ============ FRENCH CONTENT ============
    const titleFr = d("Comment D\\u00e9marrer une Entreprise POS au Nig\\u00e9ria : Le Guide Complet 2026");
    const excerptFr = d("Apprenez \\u00e0 lancer une entreprise POS rentable au Nig\\u00e9ria \\u00e0 partir de z\\u00e9ro. D\\u00e9couvrez les exigences, les co\\u00fbts, les meilleurs fournisseurs et comment gagner jusqu\\u0027\\u00e0 15 000 nairas par jour.");

    const contentFr = d(`
<p>L\\u0027entreprise POS, qui signifie <strong>Point Of Sale</strong> ou point de vente, est aujourd\\u0027hui l\\u0027une des activit\\u00e9s les plus lucratives et l\\u00e9gitimes au Nig\\u00e9ria. Elle est facile \\u00e0 lancer, n\\u00e9cessite un capital relativement faible et offre un fort potentiel de profit \\u2014 contrairement \\u00e0 de nombreuses entreprises qui exigent un investissement initial important.</p>

<p>Dans ce guide complet, nous aborderons les opportunit\\u00e9s du POS, les exigences, les avantages et inconv\\u00e9nients, ainsi que les b\\u00e9n\\u00e9fices r\\u00e9alistes que vous pouvez g\\u00e9n\\u00e9rer. Saviez-vous qu\\u0027avec la bonne configuration, vous pouvez gagner jusqu\\u0027\\u00e0 <strong>15 000 nairas de b\\u00e9n\\u00e9fice par jour</strong> ? D\\u00e9composons cela ensemble.</p>

<h2>1. Qu\\u0027est-ce qu\\u0027une Entreprise POS ?</h2>
<p>Une entreprise POS consiste \\u00e0 offrir les services suivants aux clients moyennant des frais modiques :</p>
<ul>
  <li>Retraits d\\u0027esp\\u00e8ces</li>
  <li>D\\u00e9p\\u00f4ts d\\u0027esp\\u00e8ces</li>
  <li>Transferts d\\u0027argent</li>
  <li>Vente de cr\\u00e9dit t\\u00e9l\\u00e9phonique et de donn\\u00e9es</li>
  <li>Paiement de factures (GoTV, DSTV, \\u00e9lectricit\\u00e9, eau, etc.)</li>
</ul>

<h2>2. L\\u0027\\u00c9norme Opportunit\\u00e9 du POS</h2>
<p>Avez-vous d\\u00e9j\\u00e0 fait la queue dans une banque pendant plus d\\u0027une heure juste pour effectuer un d\\u00e9p\\u00f4t ? Ou vous \\u00eates-vous tenu devant un distributeur pour voir le message redout\\u00e9 <em>\\u00ab hors service \\u00bb</em> ou <em>\\u00ab momentan\\u00e9ment incapable de distribuer \\u00bb</em> ?</p>
<p>Les humains sont impatients par nature. La plupart des gens sauteraient volontiers les longues files d\\u0027attente s\\u0027il existait une option plus rapide et plus proche \\u2014 et c\\u0027est exactement l\\u00e0 qu\\u0027intervient votre entreprise POS. Vous devenez le pont entre les banques et les personnes qui ont besoin de services financiers instantan\\u00e9s.</p>

<h2>3. Les Exigences \\u00e0 Remplir</h2>
<p>Toute activit\\u00e9 impliquant des transactions financi\\u00e8res doit \\u00eatre prise au s\\u00e9rieux. Voici ce dont vous avez besoin :</p>

<h3>A. Avoir une Entreprise \\u00c9tablie</h3>
<p>Les institutions financi\\u00e8res doivent vous faire confiance avant de vous confier un terminal POS. Vous devez disposer d\\u0027une entreprise enregistr\\u00e9e aupr\\u00e8s de la <strong>Corporate Affairs Commission (CAC)</strong>. Si votre entreprise n\\u0027est pas correctement enregistr\\u00e9e, votre demande sera probablement refus\\u00e9e.</p>

<h3>B. Contacter les Institutions Financi\\u00e8res</h3>
<p>Vous aurez besoin d\\u0027un terminal POS, et pour en obtenir un, vous devez approcher une banque ou une fintech. La plupart des banques exigent que vous soyez d\\u00e9j\\u00e0 client avec un compte actif.</p>
<p>Au-del\\u00e0 des banques traditionnelles, voici les principaux fournisseurs POS au Nig\\u00e9ria :</p>
<ul>
  <li>OPay</li>
  <li>Moniepoint</li>
  <li>PalmPay</li>
  <li>Paga</li>
  <li>Baxi</li>
  <li>Quickteller</li>
  <li>Firstmonie (First Bank)</li>
  <li>PocketMoni</li>
  <li>PayCentre</li>
  <li>Nexgo POS</li>
  <li>CitiServe</li>
</ul>

<h3>C. Documents Requis</h3>
<p>Les exigences varient l\\u00e9g\\u00e8rement selon le fournisseur, mais vous aurez g\\u00e9n\\u00e9ralement besoin de :</p>
<ul>
  <li>Une pi\\u00e8ce d\\u0027identit\\u00e9 valide (permis de conduire, carte nationale, passeport ou carte d\\u0027\\u00e9lecteur)</li>
  <li>BVN (Bank Verification Number)</li>
  <li>2 photos d\\u0027identit\\u00e9 r\\u00e9centes</li>
  <li>2 r\\u00e9f\\u00e9rences de compte courant</li>
  <li>Certificat CAC (preuve d\\u0027enregistrement de l\\u0027entreprise)</li>
  <li>Num\\u00e9ro d\\u0027identification fiscale (TIN)</li>
  <li>Statuts et acte constitutif</li>
  <li>Rapport du bureau de cr\\u00e9dit</li>
  <li>Capital de d\\u00e9part minimum de 50 000 nairas</li>
</ul>

<h2>4. Comment D\\u00e9marrer</h2>

<h3>A. Se Procurer les Outils N\\u00e9cessaires</h3>
<ul>
  <li>Un terminal POS (l\\u0027outil le plus important)</li>
  <li>Un lecteur de carte</li>
  <li>Un scanner de codes-barres (pour les paiements de factures)</li>
  <li>Un smartphone fiable avec donn\\u00e9es mobiles</li>
</ul>

<h3>B. Choisir un Emplacement</h3>
<p>Vous n\\u0027avez pas besoin d\\u0027une grande boutique. En r\\u00e9alit\\u00e9, de nombreux op\\u00e9rateurs g\\u00e8rent un POS depuis un petit conteneur ou un kiosque. Si vous poss\\u00e9dez d\\u00e9j\\u00e0 un commerce, ajoutez simplement le POS comme source de revenus suppl\\u00e9mentaire.</p>

<h3>C. Trouver le Bon Endroit</h3>
<p>L\\u0027emplacement est primordial. Consid\\u00e9rez ces facteurs :</p>
<ul>
  <li><strong>Accessibilit\\u00e9 :</strong> Les clients peuvent-ils vous atteindre facilement ?</li>
  <li><strong>Achalandage :</strong> La zone est-elle anim\\u00e9e ? Les march\\u00e9s, arr\\u00eats de bus et quartiers r\\u00e9sidentiels sont des mines d\\u0027or.</li>
  <li><strong>Concurrence :</strong> Combien d\\u0027op\\u00e9rateurs POS y a-t-il d\\u00e9j\\u00e0 ? Pouvez-vous offrir mieux \\u2014 service plus rapide, frais r\\u00e9duits, horaires \\u00e9tendus ?</li>
  <li><strong>S\\u00e9curit\\u00e9 :</strong> La zone est-elle s\\u00fbre ? Vous manipulerez des esp\\u00e8ces au quotidien.</li>
</ul>

<h2>5. D\\u00e9marrer un POS avec un Petit Budget</h2>
<p>Les terminaux POS co\\u00fbtent g\\u00e9n\\u00e9ralement <strong>45 000, 65 000 ou 75 000 nairas</strong>, selon les fonctionnalit\\u00e9s et la vitesse. Les machines plus ch\\u00e8res sont plus rapides et plus fiables.</p>
<p><strong>Pas de machine ? Pas de probl\\u00e8me.</strong> Vous pouvez commencer en acceptant des virements bancaires sur votre compte personnel et en remettant les esp\\u00e8ces aux clients. C\\u0027est le moyen le plus rapide de tester le march\\u00e9 avant d\\u0027investir dans une machine.</p>

<h2>6. Avantages et Inconv\\u00e9nients</h2>

<h3>Avantages</h3>
<ul>
  <li>Peu ou pas de connaissances informatiques requises</li>
  <li>Tr\\u00e8s mobile \\u2014 op\\u00e9rez presque partout</li>
  <li>Aucune installation logicielle</li>
  <li>Sauvegarde automatique dans le cloud de toutes les transactions</li>
  <li>Fort potentiel de b\\u00e9n\\u00e9fice quotidien</li>
</ul>

<h3>Inconv\\u00e9nients</h3>
<ul>
  <li><strong>Probl\\u00e8mes de r\\u00e9seau :</strong> Des pannes de connexion occasionnelles peuvent perturber le service</li>
  <li><strong>Risque s\\u00e9curitaire :</strong> Manipuler des esp\\u00e8ces quotidiennement exige une forte vigilance</li>
  <li><strong>Gestion de tr\\u00e9sorerie :</strong> Il faut suffisamment de liquidit\\u00e9 pour servir les clients toute la journ\\u00e9e</li>
</ul>

<h2>7. Combien Pouvez-vous Gagner ?</h2>
<p>Vos revenus quotidiens d\\u00e9pendent du volume de transactions. Frais typiques :</p>
<ul>
  <li>Retrait de 10 000 nairas \\u2192 facturez 150 \\u00e0 200 nairas</li>
  <li>Retraits plus importants (50 000+ nairas) \\u2192 jusqu\\u0027\\u00e0 500 \\u00e0 2 000 nairas</li>
  <li>Paiement de factures \\u2192 100 \\u00e0 300 nairas par transaction</li>
</ul>
<p>Si vous servez <strong>50 clients par jour</strong>, gagner <strong>10 000 \\u00e0 15 000 nairas quotidiennement est tout \\u00e0 fait r\\u00e9aliste</strong>. Cela repr\\u00e9sente plus de 300 000 nairas par mois.</p>

<h2>8. Comment R\\u00e9ussir dans le POS</h2>
<ul>
  <li>Gardez vos frais \\u00e9quitables \\u2014 des prix comp\\u00e9titifs fid\\u00e9lisent les clients</li>
  <li>Op\\u00e9rez dans une zone s\\u00fbre</li>
  <li>\\u00c9vitez de garder de grosses sommes sur place \\u2014 d\\u00e9posez r\\u00e9guli\\u00e8rement</li>
  <li>B\\u00e2tissez la confiance par un service excellent et amical</li>
  <li>Ayez un r\\u00e9seau de secours (double SIM, WiFi) contre les pannes</li>
</ul>

<h2>9. Pourquoi Lancer un POS D\\u00e8s Aujourd\\u0027hui</h2>
<ul>
  <li>Capital de d\\u00e9part faible par rapport \\u00e0 la plupart des entreprises</li>
  <li>Fort potentiel de b\\u00e9n\\u00e9fice d\\u00e8s le premier jour</li>
  <li>Vous cr\\u00e9ez un emploi stable pour vous-m\\u00eame</li>
  <li>Aucune expertise technique requise</li>
  <li>L\\u0027\\u00e9conomie de tr\\u00e9sorerie au Nig\\u00e9ria maintient une forte demande</li>
</ul>

<h2>Conclusion</h2>
<p>L\\u0027entreprise POS est l\\u0027une des mani\\u00e8res les plus intelligentes de g\\u00e9n\\u00e9rer un revenu stable et croissant au Nig\\u00e9ria aujourd\\u0027hui. Que ce soit comme activit\\u00e9 secondaire ou principale, c\\u0027est une excellente opportunit\\u00e9 accessible \\u00e0 toute personne disposant d\\u0027un capital de base et du bon emplacement.</p>
<p>M\\u00eame si vous poss\\u00e9dez d\\u00e9j\\u00e0 une entreprise, ajouter des services POS est un moyen puissant d\\u0027\\u00e9largir vos sources de revenus et de fid\\u00e9liser vos clients. Commencez petit, restez constant et \\u00e9voluez avec votre client\\u00e8le.</p>
    `.trim());

    // SEO metadata
    const seoTitle = "How to Start a POS Business in Nigeria (2026 Guide) | New Deal Zone";
    const metaDescription = "Complete guide to starting a profitable POS business in Nigeria. Requirements, costs, top providers, and how to earn up to N15,000 daily. Read now.";
    const focusKeyphrase = "POS business Nigeria";

    const seoTitleFr = d("Comment D\\u00e9marrer une Entreprise POS au Nig\\u00e9ria (Guide 2026) | New Deal Zone");
    const metaDescriptionFr = d("Guide complet pour lancer une entreprise POS rentable au Nig\\u00e9ria. Exigences, co\\u00fbts, meilleurs fournisseurs et comment gagner 15 000 nairas par jour.");
    const focusKeyphraseFr = d("entreprise POS Nig\\u00e9ria");

    // Tags stored as JSON string
    const tags = JSON.stringify(["pos business", "nigeria", "entrepreneurship", "small business", "fintech", "side hustle"]);

    const inserted = await db.insert(blogPosts).values({
      slug,
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
      authorId,
      readTime: 8,
      published: true,
      featured: true,
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
      message: "POS post seeded successfully with clean slug + alt text",
      post: inserted[0],
      urls: {
        en: `https://newdealzone.com/en/blog/${slug}`,
        fr: `https://newdealzone.com/fr/blog/${slug}`,
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: "seed failed",
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}