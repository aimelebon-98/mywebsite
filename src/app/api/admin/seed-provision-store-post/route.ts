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
    if (secret !== "seed-provision-store-2026-ndz") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const slug = "provision-store-business-nigeria";
    const slugFr = "commerce-epicerie-quartier";
    const authorId = "c412acd2-68c5-4105-8869-b143400d244a";
    const coverImage = "https://images.unsplash.com/photo-1771574209038-01ad953ca43a?q=80&w=1200&auto=format&fit=crop";
    const coverImageAlt = "Well-stocked provision store shelves displaying groceries, beverages and household items for retail sale";
    const coverImageAltFr = d("Rayons bien approvisionn\\u00e9s d\\u0027une \\u00e9picerie de quartier pr\\u00e9sentant produits alimentaires, boissons et articles m\\u00e9nagers");

    // Idempotent: delete any existing versions
    await db.delete(blogPosts).where(
      or(eq(blogPosts.slug, slug), eq(blogPosts.slugFr, slugFr))
    );

    // ============ ENGLISH: Nigeria-focused ============
    const title = "How to Start a Provision Store Business in Nigeria (2026 Complete Guide)";
    const excerpt = "Start a profitable provision store business in Nigeria from N200,000. Learn what to stock, best location, pricing strategy, and how to make N5,000-N10,000 daily profit.";

    const content = `
<p>A <strong>provision store</strong> is one of the most reliable retail businesses you can start in Nigeria. It is the neighbourhood shop where families buy their daily essentials — noodles, soap, salt, beverages, pure water, biscuits, and hundreds of other everyday items. Life in any Nigerian neighbourhood without a nearby provision store is genuinely difficult, and that is exactly why this business will never go out of demand.</p>

<p>If your neighbourhood does not have one, or the existing ones are poorly stocked, that is your opportunity. In this complete guide, we will show you how to start a <strong>provision store business in Nigeria</strong>, from capital breakdown to what to stock, where to source, and how to keep customers coming back.</p>

<p>Related business ideas: <a href="/en/blog/pos-business-nigeria">Starting a POS business</a>, <a href="/en/blog/phone-selling-business-nigeria">phone selling business</a>, <a href="/en/blog/phone-accessories-business-nigeria">phone accessories business</a>, and <a href="/en/blog/phone-repair-business-nigeria">phone repair business</a> — all of these can be combined with a provision store for extra income streams.</p>

<h2>1. What is a Provision Store?</h2>
<p>A provision store is a small retail outlet that sells food items and everyday household goods — rice, salt, seasoning cubes, crayfish, indomie noodles, beverages, soap, toothpaste, sanitary products, and more. The business model is simple: <strong>buy at wholesale price, sell at retail price</strong>, and pocket the difference.</p>

<p>Unlike full supermarkets that carry thousands of SKUs and require massive capital, provision stores focus on the <strong>top 100 to 200 fastest-moving daily-use items</strong> in a specific neighbourhood.</p>

<h2>2. Why You Should Start a Provision Store</h2>
<ul>
  <li><strong>Constant demand:</strong> People buy provisions every single day — recession or no recession, election or no election.</li>
  <li><strong>Lower capital than supermarkets:</strong> You can start small and grow. No need for a 500-item inventory on day one.</li>
  <li><strong>High turnover:</strong> Items like sachet water, biscuits, and seasoning cubes sell dozens of times a day.</li>
  <li><strong>Solid profit margins:</strong> Most items give you 20% to 40% margin, and some (like recharge cards, phone accessories, and sachets) go higher.</li>
  <li><strong>You are your own boss:</strong> Choose your hours, your customers, your prices.</li>
  <li><strong>Strong cash flow:</strong> Daily sales mean daily cash — no long invoice waits.</li>
</ul>

<p><strong>Important warning:</strong> A provision store has healthy margins, but it can quickly collapse if you keep dipping into the daily cash for personal spending. Discipline is non-negotiable — pay yourself a fixed monthly amount and leave the shop's money alone.</p>

<h2>3. Capital Needed to Start</h2>
<p>Contrary to what many people say, you do not need a million naira to start. Here are three realistic tiers:</p>

<h3>A. Small-Scale Startup (N200,000 to N400,000)</h3>
<ul>
  <li><strong>Small kiosk or container rent:</strong> N30,000 to N70,000/year</li>
  <li><strong>Setup:</strong> N30,000 (basic shelves, table, chair, security lock)</li>
  <li><strong>Initial stock:</strong> N150,000 to N250,000 of fast-moving items</li>
  <li><strong>Working capital buffer:</strong> N20,000 to N50,000</li>
</ul>
<p>Perfect if you are testing the business or starting in a residential estate.</p>

<h3>B. Medium-Scale Startup (N500,000 to N1,000,000)</h3>
<ul>
  <li><strong>Proper shop rent:</strong> N100,000 to N200,000/year</li>
  <li><strong>Setup:</strong> N100,000 (glass showcase, standing fridge, more shelves, signage)</li>
  <li><strong>Stock:</strong> N400,000 to N700,000 covering wider variety</li>
</ul>
<p>Recommended if you are in a busy area with 50+ daily customer potential.</p>

<h3>C. Large-Scale / Mini-Supermarket (N1.5 million and above)</h3>
<ul>
  <li>Larger shop with wider aisles</li>
  <li>Full grocery selection plus cosmetics and small electronics</li>
  <li>Chest freezer for frozen goods and cold drinks</li>
  <li>POS terminal, security cameras, and possibly a cashier</li>
</ul>

<h2>4. Step-by-Step: How to Start</h2>

<h3>Step A: Do Your Research First</h3>
<p>Before spending a single naira, walk around your target neighbourhood and answer these questions:</p>
<ul>
  <li>How many provision stores are already there? Are they always busy?</li>
  <li>What are they missing? (Talk to residents — they will tell you)</li>
  <li>What is the average income level in the area? Rich neighbourhoods buy premium brands; low-income areas prefer sachets and small units.</li>
  <li>What days and hours are busiest?</li>
  <li>What are the current price points for common items?</li>
</ul>

<h3>Step B: Get the Right Shop</h3>
<p>Location makes or breaks this business. Look for:</p>
<ul>
  <li><strong>High foot traffic:</strong> Near residential estates, bus stops, schools, or markets</li>
  <li><strong>Corner shops:</strong> Two-side visibility doubles your walk-ins</li>
  <li><strong>Enough space:</strong> Customers should be able to walk in, browse, and pick items themselves without feeling cramped</li>
  <li><strong>Good ventilation:</strong> Provisions can spoil in heat; airflow matters</li>
  <li><strong>Security:</strong> Solid locks, ideally a metal shutter, ideally in a safe area</li>
  <li><strong>Reliable power:</strong> Or budget for an inverter, especially if you plan to sell cold drinks and frozen items</li>
</ul>

<h3>Step C: Set Up the Shop</h3>
<p>Essentials for a professional look:</p>
<ul>
  <li>Wall shelves (open display attracts more sales than closed cabinets)</li>
  <li>Glass showcase for premium items and cosmetics</li>
  <li>Standing chest freezer or fridge (cold drinks and frozen items are high-margin)</li>
  <li>Weighing scale for grains and produce</li>
  <li>Nylon and paper packaging bags</li>
  <li>Signboard with your shop name and phone number</li>
  <li>Notebook or free POS app (Kippa, Bumpa) for record-keeping</li>
  <li>Small chair or stool for the shop attendant</li>
</ul>

<h3>Step D: Find Reliable Suppliers</h3>
<p>Do not depend on just one supplier — always have <strong>at least 5 sources</strong> for major items to avoid stockouts and get the best prices.</p>
<ul>
  <li>Visit major wholesale markets: Mile 12, Oyingbo, Alaba, Onitsha Main Market, Wuse Market, Aba Ariaria</li>
  <li>Save every supplier's WhatsApp and phone number</li>
  <li>Compare prices monthly — supplier prices fluctuate constantly</li>
  <li>Never buy goods close to expiry, no matter how cheap</li>
  <li>Check for damaged packaging before paying</li>
  <li>Build good relationships — top suppliers give discounts and credit to loyal customers</li>
</ul>

<h3>Step E: Keep Perfect Records</h3>
<p>Poor record-keeping kills more provision stores than theft. Track:</p>
<ul>
  <li>Every sale (daily total minimum)</li>
  <li>Every expense (rent, transport, supplier payments, utilities)</li>
  <li>Stock levels of top-selling items</li>
  <li>Which items sell fast vs slow</li>
  <li>Monthly profit/loss</li>
</ul>
<p>Use free tools like <strong>Kippa</strong>, <strong>Bumpa</strong>, or <strong>Sabi</strong> — Nigerian apps built exactly for small shop owners.</p>

<h2>5. What to Stock (Complete Item List by Category)</h2>

<h3>Food and Grains</h3>
<ul>
  <li>Rice (in small measure bowls)</li>
  <li>Beans, garri, semolina</li>
  <li>Indomie noodles, spaghetti, macaroni</li>
  <li>Cornflakes, custard, oats</li>
  <li>Bread (fresh daily)</li>
  <li>Baby food (Nan, Cerelac, SMA)</li>
</ul>

<h3>Seasonings and Spices</h3>
<ul>
  <li>Maggi, Knorr, Royco cubes</li>
  <li>Salt, curry, thyme, ginger</li>
  <li>Crayfish, dried pepper</li>
  <li>Vegetable oil (small and large bottles)</li>
  <li>Tomato paste, tin tomatoes</li>
  <li>Sugar (cube and granulated)</li>
</ul>

<h3>Beverages and Drinks</h3>
<ul>
  <li>Sachet water, bottled water</li>
  <li>Soft drinks (Coke, Pepsi, Fanta, Sprite)</li>
  <li>Malt drinks (Malta Guinness, Amstel Malta)</li>
  <li>Energy drinks (Fearless, Bullet, Predator)</li>
  <li>Milo, Bournvita, Milk (tin and sachet)</li>
  <li>Juice (Chi, Hollandia)</li>
  <li>Sachet alcohol (if licensed and appropriate for your area)</li>
</ul>

<h3>Toiletries and Personal Care</h3>
<ul>
  <li>Bathing soap (Lux, Dettol, Delta)</li>
  <li>Washing soap (Klin, Ariel, Omo)</li>
  <li>Toothpaste, toothbrush, mouthwash</li>
  <li>Cream, lotion, Vaseline</li>
  <li>Deodorant, roll-on</li>
  <li>Sanitary pads (Always, Kotex)</li>
  <li>Tissue paper, wet wipes</li>
  <li>Relaxer, hair oil</li>
</ul>

<h3>Cleaning and Household</h3>
<ul>
  <li>Detergent (Ariel, Klin, Zip)</li>
  <li>Bleach, Hypo, Izal</li>
  <li>Dettol (antiseptic)</li>
  <li>Insecticide (Raid, Baygon, Mortein)</li>
  <li>Candles, matches, lighters</li>
  <li>Batteries (Tiger, Duracell)</li>
  <li>Bulbs (LED and traditional)</li>
  <li>Superglue, adhesive tape</li>
</ul>

<h3>Baby and Child Items</h3>
<ul>
  <li>Pampers, Molfix diapers</li>
  <li>Baby powder, cream, oil</li>
  <li>Baby food, formula</li>
  <li>Baby wipes</li>
</ul>

<h3>Snacks and Confectionery</h3>
<ul>
  <li>Biscuits (Cabin, Digestive, Cream Crackers)</li>
  <li>Chin-chin, popcorn, plantain chips</li>
  <li>Sweets, candies, chewing gum</li>
  <li>Chocolate bars</li>
</ul>

<h3>Bonus Add-ons for Higher Revenue</h3>
<ul>
  <li>Airtime and data recharge (small margin but constant traffic)</li>
  <li>Phone accessories (chargers, earpieces)</li>
  <li>Sachet drugs (Panadol, Alabukun, Emzor)</li>
  <li>School supplies (biros, notebooks — great near schools)</li>
</ul>

<h2>6. How to Get Your First Customers</h2>
<p>Provision stores are neighbourhood businesses — you do not need big-budget advertising:</p>
<ul>
  <li><strong>Grand opening promotion:</strong> Small discount on selected items the first week generates buzz</li>
  <li><strong>Play music softly:</strong> A sound system attracts foot traffic; keep the volume friendly</li>
  <li><strong>Add small entertainment:</strong> A ludo, draughts, or table tennis setup nearby draws people (avoid rowdy crowds)</li>
  <li><strong>Word of mouth:</strong> Tell every neighbour, church member, WhatsApp group about your shop</li>
  <li><strong>Print small flyers:</strong> Slip under doors in your immediate area</li>
  <li><strong>WhatsApp status:</strong> Post daily with new arrivals, prices, and offers</li>
  <li><strong>Welcome children warmly:</strong> Kids remember shops that give them a free sweet — they become lifelong customers</li>
</ul>

<h2>7. How to Keep Customers Coming Back</h2>
<ul>
  <li><strong>Always be friendly and respectful:</strong> Greet every customer warmly, even during a bad day</li>
  <li><strong>Fair prices:</strong> Do not overcharge — customers will notice and leave</li>
  <li><strong>Consistent stock:</strong> Never let popular items run out. Restock before you run dry.</li>
  <li><strong>Small gifts for loyal customers:</strong> A free sweet for a child, an extra spoon for regular buyers</li>
  <li><strong>Occasional discounts on bulk purchases:</strong> Reward customers who buy larger quantities</li>
  <li><strong>Neat, clean shop:</strong> Sweep daily, wipe shelves weekly, no rats</li>
  <li><strong>Fast service:</strong> Long queues drive customers to competitors</li>
</ul>

<h2>8. How Much Can You Make?</h2>
<p>Earnings depend on location, stock quality, and customer relationships. Realistic profit projections:</p>
<ul>
  <li><strong>Small-scale (residential estate kiosk):</strong> N3,000 to N7,000 daily profit → N90,000 to N210,000 monthly</li>
  <li><strong>Medium-scale (busy street shop):</strong> N7,000 to N15,000 daily → N210,000 to N450,000 monthly</li>
  <li><strong>Large-scale (mini-supermarket):</strong> N15,000 to N50,000+ daily → N450,000 to N1,500,000+ monthly</li>
</ul>

<p>A daily sales volume of N50,000 typically yields N5,000 to N10,000 in profit after all expenses. Would that solve your unemployment concerns?</p>

<h2>9. Common Mistakes to Avoid</h2>
<ul>
  <li><strong>Mixing shop money with personal money:</strong> The number one cause of failure. Pay yourself a fixed monthly salary and leave the rest alone.</li>
  <li><strong>Giving credit to customers:</strong> Especially family and friends. Cash sales only, at least for the first year.</li>
  <li><strong>Overstocking slow items:</strong> Focus on fast movers first. Wide variety comes later.</li>
  <li><strong>Ignoring expiry dates:</strong> Rotate stock — first in, first out. Expired goods destroy trust.</li>
  <li><strong>No security:</strong> Install proper locks, consider CCTV once you can afford it. Petty theft is real.</li>
  <li><strong>Poor hygiene:</strong> Dirty shop = lost customers. Sweep daily. No exceptions.</li>
  <li><strong>Not tracking sales:</strong> You cannot manage what you do not measure. Use a notebook or app from day one.</li>
</ul>

<h2>10. Scaling Your Provision Store into a Supermarket</h2>
<p>Every serious business owner should dream bigger. If your provision store thrives, you can grow it into a mini-supermarket by:</p>
<ul>
  <li>Expanding to a bigger shop with proper aisles</li>
  <li>Adding fresh produce (fruits, vegetables, meat if you have a freezer)</li>
  <li>Adding cosmetics, home decor, small electronics</li>
  <li>Installing a POS terminal for card payments (see our <a href="/en/blog/pos-business-nigeria">POS business guide</a>)</li>
  <li>Hiring 1 to 2 trustworthy staff</li>
  <li>Registering with CAC and getting proper permits</li>
  <li>Setting up online delivery via WhatsApp orders</li>
</ul>

<p>The path from provision store to supermarket usually takes 3 to 5 years of consistent, disciplined growth.</p>

<h2>11. Register Your Business</h2>
<p>Once your shop stabilizes, register with the <strong>Corporate Affairs Commission (CAC)</strong>. Business Name registration costs N15,000 to N25,000 and gives you:</p>
<ul>
  <li>Legal recognition</li>
  <li>Corporate bank account</li>
  <li>Supplier credit lines</li>
  <li>Access to bank loans and grants</li>
  <li>Trust from customers and landlords</li>
</ul>

<h2>Frequently Asked Questions</h2>

<h3>How much money do I need to start a provision store in Nigeria?</h3>
<p>You can realistically start a small-scale provision store with <strong>N200,000 to N400,000</strong>. Medium-scale requires N500,000 to N1,000,000, and a mini-supermarket needs N1.5 million and above.</p>

<h3>What is the most profitable item in a provision store?</h3>
<p>Fast-moving items like sachet water, seasoning cubes, biscuits, soft drinks, and airtime recharge sell in large volumes. Cosmetics, sanitary products, and baby items give higher unit margins.</p>

<h3>Where do I buy provisions in bulk in Nigeria?</h3>
<p>Top wholesale markets include: Mile 12 (Lagos), Alaba International (Lagos), Onitsha Main Market (Anambra), Ariaria (Aba), Wuse Market (Abuja), and Mile 1 (Port Harcourt).</p>

<h3>Do I need to register my provision store?</h3>
<p>Not required to start, but strongly recommended within your first 6 months. CAC registration builds credibility and unlocks banking and supplier benefits.</p>

<h3>How long before I break even?</h3>
<p>With a good location and consistent management, most provision stores break even in <strong>6 to 12 months</strong>.</p>

<h2>Conclusion</h2>
<p>The provision store business in Nigeria is one of the most reliable, recession-proof ventures you can start with modest capital. Demand never disappears, margins are fair, and cash flow is daily.</p>

<p>Stop procrastinating. Do your neighbourhood research this week, find your suppliers next week, and open your shop within the month. Purchase more of what is genuinely demanded in your area, treat every customer like gold, keep clean records, and you are on your way to a real, sustainable business.</p>

<p>Ready to add more income streams? Check out our full library of <a href="/en/blog/pos-business-nigeria">business startup guides</a> to build multiple revenue sources from a single location.</p>
    `.trim();

    // ============ FRENCH: Globalized (NO Nigeria refs) ============
    const titleFr = d("Comment Lancer un Commerce d\\u0027\\u00c9picerie de Quartier : Guide Complet 2026");
    const excerptFr = d("Lancez un commerce d\\u0027\\u00e9picerie de quartier rentable avec un capital mod\\u00e9r\\u00e9. Guide complet : quoi stocker, meilleur emplacement, strat\\u00e9gie de prix et comment g\\u00e9n\\u00e9rer un revenu quotidien solide.");

    const contentFr = d(`
<p>Une <strong>\\u00e9picerie de quartier</strong> est l\\u0027un des commerces de d\\u00e9tail les plus fiables que vous puissiez lancer aujourd\\u0027hui. C\\u0027est la boutique du coin o\\u00f9 les familles ach\\u00e8tent leurs essentiels quotidiens \\u2014 p\\u00e2tes, savon, sel, boissons, eau, biscuits, et des centaines d\\u0027autres articles du quotidien. La vie dans un quartier sans \\u00e9picerie \\u00e0 proximit\\u00e9 est v\\u00e9ritablement difficile, et c\\u0027est exactement pourquoi ce commerce ne conna\\u00eetra jamais de baisse de demande.</p>

<p>Si votre quartier n\\u0027en a pas, ou si les \\u00e9piceries existantes sont mal approvisionn\\u00e9es, c\\u0027est votre opportunit\\u00e9. Dans ce guide complet, nous vous montrons comment lancer un <strong>commerce d\\u0027\\u00e9picerie de quartier</strong>, du capital de d\\u00e9part au choix des produits, en passant par les fournisseurs et la fid\\u00e9lisation client\\u00e8le.</p>

<p>Id\\u00e9es de commerces li\\u00e9es : <a href="/fr/blog/terminal-paiement-electronique">Lancer une activit\\u00e9 de terminal de paiement</a>, <a href="/fr/blog/commerce-vente-telephones">commerce de vente de t\\u00e9l\\u00e9phones</a>, <a href="/fr/blog/commerce-accessoires-telephone">commerce d\\u0027accessoires t\\u00e9l\\u00e9phoniques</a>, et <a href="/fr/blog/commerce-reparation-telephones">commerce de r\\u00e9paration de t\\u00e9l\\u00e9phones</a> \\u2014 tous peuvent \\u00eatre combin\\u00e9s avec une \\u00e9picerie pour multiplier les sources de revenus.</p>

<h2>1. Qu\\u0027est-ce qu\\u0027une \\u00c9picerie de Quartier ?</h2>
<p>Une \\u00e9picerie de quartier est un petit commerce de d\\u00e9tail vendant produits alimentaires et articles m\\u00e9nagers quotidiens \\u2014 riz, sel, cubes de bouillon, p\\u00e2tes, boissons, savon, dentifrice, produits d\\u0027hygi\\u00e8ne, et bien plus. Le mod\\u00e8le \\u00e9conomique est simple : <strong>acheter en gros, vendre au d\\u00e9tail</strong>, et empocher la diff\\u00e9rence.</p>

<p>Contrairement aux supermarch\\u00e9s complets qui g\\u00e8rent des milliers de r\\u00e9f\\u00e9rences et n\\u00e9cessitent un capital massif, les \\u00e9piceries de quartier se concentrent sur les <strong>100 \\u00e0 200 articles quotidiens les plus rapidement \\u00e9coul\\u00e9s</strong> d\\u0027un secteur pr\\u00e9cis.</p>

<h2>2. Pourquoi Lancer une \\u00c9picerie de Quartier</h2>
<ul>
  <li><strong>Demande constante :</strong> Les gens ach\\u00e8tent des provisions tous les jours \\u2014 crise ou pas crise.</li>
  <li><strong>Capital inf\\u00e9rieur aux supermarch\\u00e9s :</strong> Vous pouvez commencer petit et cro\\u00eetre.</li>
  <li><strong>Rotation \\u00e9lev\\u00e9e :</strong> Certains articles (eau, biscuits, cubes) se vendent des dizaines de fois par jour.</li>
  <li><strong>Marges solides :</strong> La plupart des articles offrent 20 \\u00e0 40 % de marge, certains bien plus.</li>
  <li><strong>Vous \\u00eates votre propre patron :</strong> Choisissez vos horaires, vos clients, vos prix.</li>
  <li><strong>Tr\\u00e9sorerie quotidienne :</strong> Ventes quotidiennes = liquidit\\u00e9s quotidiennes, aucune attente de paiement.</li>
</ul>

<p><strong>Avertissement important :</strong> Une \\u00e9picerie a de bonnes marges, mais peut s\\u0027effondrer rapidement si vous puisez dans la caisse quotidienne pour des d\\u00e9penses personnelles. La discipline est non n\\u00e9gociable \\u2014 versez-vous un montant mensuel fixe et ne touchez pas \\u00e0 l\\u0027argent de la boutique.</p>

<h2>3. Le Capital N\\u00e9cessaire</h2>
<p>Contrairement \\u00e0 ce que beaucoup pensent, vous n\\u0027avez pas besoin d\\u0027une somme \\u00e9norme pour d\\u00e9marrer. Voici trois niveaux r\\u00e9alistes :</p>

<h3>A. Petit d\\u00e9marrage</h3>
<ul>
  <li>Loyer d\\u0027un petit kiosque ou conteneur</li>
  <li>Am\\u00e9nagement basique : \\u00e9tag\\u00e8res, table, chaise, serrure</li>
  <li>Stock initial d\\u0027articles \\u00e0 forte rotation</li>
  <li>Fonds de roulement de r\\u00e9serve</li>
</ul>
<p>Id\\u00e9al pour tester le march\\u00e9 ou d\\u00e9marrer dans un quartier r\\u00e9sidentiel.</p>

<h3>B. D\\u00e9marrage Moyen</h3>
<ul>
  <li>Loyer d\\u0027une vraie boutique bien situ\\u00e9e</li>
  <li>Am\\u00e9nagement complet : vitrine, r\\u00e9frig\\u00e9rateur, \\u00e9tag\\u00e8res, enseigne</li>
  <li>Stock plus large couvrant plus de vari\\u00e9t\\u00e9s</li>
</ul>
<p>Recommand\\u00e9 dans une zone anim\\u00e9e avec potentiel de 50+ clients par jour.</p>

<h3>C. Grand D\\u00e9marrage / Mini-Supermarch\\u00e9</h3>
<ul>
  <li>Boutique plus grande avec all\\u00e9es</li>
  <li>Gamme compl\\u00e8te + cosm\\u00e9tiques et petit \\u00e9lectrom\\u00e9nager</li>
  <li>Cong\\u00e9lateur bahut pour produits surgel\\u00e9s et boissons fra\\u00eeches</li>
  <li>Terminal de paiement, cam\\u00e9ras de s\\u00e9curit\\u00e9, potentiellement un employ\\u00e9</li>
</ul>

<h2>4. \\u00c9tape par \\u00c9tape : Comment Lancer</h2>

<h3>\\u00c9tape A : Faites Votre \\u00c9tude de Terrain</h3>
<p>Avant de d\\u00e9penser le moindre euro, parcourez votre quartier cible et r\\u00e9pondez \\u00e0 ces questions :</p>
<ul>
  <li>Combien d\\u0027\\u00e9piceries y a-t-il d\\u00e9j\\u00e0 ? Sont-elles toujours anim\\u00e9es ?</li>
  <li>Que manquent-elles ? (Parlez aux r\\u00e9sidents, ils vous le diront)</li>
  <li>Quel est le niveau de revenu moyen du quartier ? Les quartiers ais\\u00e9s ach\\u00e8tent des marques premium ; les quartiers modestes pr\\u00e9f\\u00e8rent les petites unit\\u00e9s.</li>
  <li>Quels jours et heures sont les plus occup\\u00e9s ?</li>
  <li>Quels sont les prix courants pour les articles communs ?</li>
</ul>

<h3>\\u00c9tape B : Trouvez la Bonne Boutique</h3>
<p>L\\u0027emplacement fait ou d\\u00e9fait ce commerce. Recherchez :</p>
<ul>
  <li><strong>Fort achalandage :</strong> Pr\\u00e8s de quartiers r\\u00e9sidentiels, arr\\u00eats de bus, \\u00e9coles ou march\\u00e9s</li>
  <li><strong>Boutiques d\\u0027angle :</strong> La visibilit\\u00e9 sur deux c\\u00f4t\\u00e9s double vos entr\\u00e9es</li>
  <li><strong>Espace suffisant :</strong> Les clients doivent pouvoir entrer, parcourir et se servir sans se sentir \\u00e0 l\\u0027\\u00e9troit</li>
  <li><strong>Bonne ventilation :</strong> Les provisions peuvent s\\u0027ab\\u00eemer \\u00e0 la chaleur</li>
  <li><strong>S\\u00e9curit\\u00e9 :</strong> Serrures solides, id\\u00e9alement rideau m\\u00e9tallique, dans une zone s\\u00fbre</li>
  <li><strong>Alimentation \\u00e9lectrique fiable :</strong> Sinon pr\\u00e9voyez un onduleur, surtout pour boissons fra\\u00eeches et surgel\\u00e9s</li>
</ul>

<h3>\\u00c9tape C : Am\\u00e9nagez la Boutique</h3>
<p>Essentiels pour un look professionnel :</p>
<ul>
  <li>\\u00c9tag\\u00e8res murales (l\\u0027exposition ouverte g\\u00e9n\\u00e8re plus de ventes que les meubles ferm\\u00e9s)</li>
  <li>Vitrine en verre pour articles premium et cosm\\u00e9tiques</li>
  <li>Cong\\u00e9lateur bahut ou r\\u00e9frig\\u00e9rateur (boissons fra\\u00eeches et surgel\\u00e9s = fortes marges)</li>
  <li>Balance pour c\\u00e9r\\u00e9ales et produits en vrac</li>
  <li>Sacs d\\u0027emballage plastique et papier</li>
  <li>Enseigne avec nom de la boutique et num\\u00e9ro de t\\u00e9l\\u00e9phone</li>
  <li>Cahier ou application gratuite (Kippa, Bumpa) pour la tenue de comptes</li>
  <li>Petite chaise ou tabouret pour le vendeur</li>
</ul>

<h3>\\u00c9tape D : Trouvez des Fournisseurs Fiables</h3>
<p>Ne d\\u00e9pendez pas d\\u0027un seul fournisseur \\u2014 ayez toujours <strong>au moins 5 sources</strong> pour \\u00e9viter les ruptures et obtenir les meilleurs prix.</p>
<ul>
  <li>Visitez les grands march\\u00e9s de gros de votre r\\u00e9gion</li>
  <li>Sauvegardez le WhatsApp et num\\u00e9ro de chaque fournisseur</li>
  <li>Comparez les prix mensuellement \\u2014 les prix fluctuent constamment</li>
  <li>N\\u0027achetez jamais des marchandises proches de la p\\u00e9remption, m\\u00eame bon march\\u00e9</li>
  <li>V\\u00e9rifiez les emballages endommag\\u00e9s avant de payer</li>
  <li>Cultivez de bonnes relations \\u2014 les meilleurs fournisseurs offrent remises et cr\\u00e9dit aux clients fid\\u00e8les</li>
</ul>

<h3>\\u00c9tape E : Tenez des Comptes Parfaits</h3>
<p>La mauvaise gestion tue plus d\\u0027\\u00e9piceries que le vol. Suivez :</p>
<ul>
  <li>Chaque vente (au minimum le total quotidien)</li>
  <li>Chaque d\\u00e9pense (loyer, transport, paiement fournisseurs, factures)</li>
  <li>Niveaux de stock des meilleures ventes</li>
  <li>Quels articles se vendent vite ou lentement</li>
  <li>Le profit / perte mensuel</li>
</ul>

<h2>5. Quoi Stocker (Liste Compl\\u00e8te par Cat\\u00e9gorie)</h2>

<h3>Aliments et C\\u00e9r\\u00e9ales</h3>
<ul>
  <li>Riz (petits volumes)</li>
  <li>P\\u00e2tes, semoule, farine</li>
  <li>C\\u00e9r\\u00e9ales de petit d\\u00e9jeuner, flocons d\\u0027avoine</li>
  <li>Pain (frais quotidien)</li>
  <li>Aliments pour b\\u00e9b\\u00e9 (Blediner, Blevita, laits infantiles)</li>
</ul>

<h3>Assaisonnements et \\u00c9pices</h3>
<ul>
  <li>Cubes de bouillon (Maggi, Knorr)</li>
  <li>Sel, curry, thym, gingembre</li>
  <li>Huile v\\u00e9g\\u00e9tale (petites et grandes bouteilles)</li>
  <li>Concentr\\u00e9 de tomate</li>
  <li>Sucre (morceaux et poudre)</li>
</ul>

<h3>Boissons</h3>
<ul>
  <li>Eau en bouteille et en sachet</li>
  <li>Sodas (Coca, Pepsi, Fanta, Sprite)</li>
  <li>Boissons \\u00e9nerg\\u00e9tiques</li>
  <li>Chocolats en poudre (Nesquik, Ovaltine)</li>
  <li>Lait (bo\\u00eete et sachet)</li>
  <li>Jus de fruits</li>
</ul>

<h3>Hygi\\u00e8ne et Soins Personnels</h3>
<ul>
  <li>Savon de toilette (Dove, Palmolive, Lux)</li>
  <li>Savon lessive (Ariel, Omo, Skip)</li>
  <li>Dentifrice, brosse \\u00e0 dents, bain de bouche</li>
  <li>Cr\\u00e8me, lotion, vaseline</li>
  <li>D\\u00e9odorants</li>
  <li>Serviettes hygi\\u00e9niques (Always, Nana)</li>
  <li>Papier toilette, lingettes</li>
</ul>

<h3>Entretien et M\\u00e9nage</h3>
<ul>
  <li>Lessive en poudre et liquide</li>
  <li>Eau de Javel, d\\u00e9sinfectants</li>
  <li>Insecticide (Baygon, Raid)</li>
  <li>Bougies, allumettes, briquets</li>
  <li>Piles</li>
  <li>Ampoules (LED et traditionnelles)</li>
  <li>Colle forte, ruban adh\\u00e9sif</li>
</ul>

<h3>Articles B\\u00e9b\\u00e9 et Enfant</h3>
<ul>
  <li>Couches (Pampers, Molfix)</li>
  <li>Talc, cr\\u00e8me, huile pour b\\u00e9b\\u00e9</li>
  <li>Lait infantile et petits pots</li>
  <li>Lingettes b\\u00e9b\\u00e9</li>
</ul>

<h3>Snacks et Confiserie</h3>
<ul>
  <li>Biscuits sal\\u00e9s et sucr\\u00e9s</li>
  <li>Chips, pop-corn</li>
  <li>Bonbons, chewing-gums</li>
  <li>Barres chocolat\\u00e9es</li>
</ul>

<h3>Extras pour Booster les Revenus</h3>
<ul>
  <li>Recharges t\\u00e9l\\u00e9phoniques et forfaits data</li>
  <li>Petits accessoires t\\u00e9l\\u00e9phoniques (chargeurs, \\u00e9couteurs)</li>
  <li>M\\u00e9dicaments en vente libre (paracetamol, aspirine)</li>
  <li>Fournitures scolaires (stylos, cahiers) \\u2014 excellent pr\\u00e8s des \\u00e9coles</li>
</ul>

<h2>6. Comment Obtenir Vos Premiers Clients</h2>
<p>Les \\u00e9piceries de quartier sont des commerces locaux \\u2014 vous n\\u0027avez pas besoin de gros budget publicitaire :</p>
<ul>
  <li><strong>Promotion d\\u0027ouverture :</strong> Petite r\\u00e9duction sur articles s\\u00e9lectionn\\u00e9s la premi\\u00e8re semaine g\\u00e9n\\u00e8re du buzz</li>
  <li><strong>Musique douce :</strong> Un syst\\u00e8me sonore attire les passants ; gardez le volume amical</li>
  <li><strong>Bouche-\\u00e0-oreille :</strong> Parlez de votre boutique \\u00e0 chaque voisin, groupe WhatsApp local</li>
  <li><strong>Imprimez de petits flyers :</strong> Glissez-les sous les portes du quartier imm\\u00e9diat</li>
  <li><strong>WhatsApp status :</strong> Publiez quotidiennement nouveaut\\u00e9s, prix et promotions</li>
  <li><strong>Accueillez chaleureusement les enfants :</strong> Un enfant \\u00e0 qui vous offrez un bonbon devient client \\u00e0 vie</li>
</ul>

<h2>7. Comment Fid\\u00e9liser Vos Clients</h2>
<ul>
  <li><strong>Soyez toujours aimable et respectueux :</strong> Saluez chaleureusement chaque client, m\\u00eame lors d\\u0027une mauvaise journ\\u00e9e</li>
  <li><strong>Prix justes :</strong> Ne surfacturez pas \\u2014 les clients le remarquent et partent</li>
  <li><strong>Stock constant :</strong> Ne laissez jamais les articles populaires \\u00e9puis\\u00e9s. R\\u00e9approvisionnez avant la rupture.</li>
  <li><strong>Petits cadeaux pour clients fid\\u00e8les :</strong> Un bonbon offert pour un enfant, une petite prime pour les habitu\\u00e9s</li>
  <li><strong>Remises ponctuelles sur les achats en gros :</strong> R\\u00e9compensez les clients qui ach\\u00e8tent en quantit\\u00e9</li>
  <li><strong>Boutique propre et rang\\u00e9e :</strong> Balayez quotidiennement, essuyez les \\u00e9tag\\u00e8res chaque semaine</li>
  <li><strong>Service rapide :</strong> Les longues files poussent les clients chez la concurrence</li>
</ul>

<h2>8. Combien Pouvez-vous Gagner ?</h2>
<p>Les revenus d\\u00e9pendent de l\\u0027emplacement, de la qualit\\u00e9 du stock et de la relation client. Projections r\\u00e9alistes de b\\u00e9n\\u00e9fice mensuel :</p>
<ul>
  <li><strong>Petit format (kiosque r\\u00e9sidentiel) :</strong> \\u00e9quivalent d\\u0027un salaire minimum local</li>
  <li><strong>Format moyen (boutique en rue anim\\u00e9e) :</strong> plusieurs fois le salaire minimum</li>
  <li><strong>Grand format (mini-supermarch\\u00e9) :</strong> revenu confortable de cadre sup\\u00e9rieur</li>
</ul>

<h2>9. Erreurs Courantes \\u00e0 \\u00c9viter</h2>
<ul>
  <li><strong>M\\u00e9langer argent de la boutique et personnel :</strong> Cause n\\u00b0 1 d\\u0027\\u00e9chec. Versez-vous un salaire fixe et laissez le reste tranquille.</li>
  <li><strong>Accorder du cr\\u00e9dit aux clients :</strong> Surtout famille et amis. Ventes au comptant uniquement au moins la premi\\u00e8re ann\\u00e9e.</li>
  <li><strong>Surstocker les articles lents :</strong> Concentrez-vous sur les rotations rapides d\\u0027abord. La vari\\u00e9t\\u00e9 vient plus tard.</li>
  <li><strong>Ignorer les dates de p\\u00e9remption :</strong> Rotation stock \\u2014 premier entr\\u00e9, premier sorti. Les p\\u00e9rim\\u00e9s d\\u00e9truisent la confiance.</li>
  <li><strong>Aucune s\\u00e9curit\\u00e9 :</strong> Installez de bonnes serrures, envisagez une cam\\u00e9ra CCTV d\\u00e8s que possible.</li>
  <li><strong>Mauvaise hygi\\u00e8ne :</strong> Boutique sale = clients perdus. Balayez quotidiennement. Aucune exception.</li>
  <li><strong>Ne pas suivre les ventes :</strong> On ne peut g\\u00e9rer que ce qu\\u0027on mesure. Utilisez un cahier ou une application d\\u00e8s le jour 1.</li>
</ul>

<h2>10. Faire \\u00c9voluer Votre \\u00c9picerie en Supermarch\\u00e9</h2>
<p>Tout entrepreneur s\\u00e9rieux devrait r\\u00eaver plus grand. Si votre \\u00e9picerie prosp\\u00e8re, vous pouvez la transformer en mini-supermarch\\u00e9 en :</p>
<ul>
  <li>Passant \\u00e0 une plus grande boutique avec vraies all\\u00e9es</li>
  <li>Ajoutant produits frais (fruits, l\\u00e9gumes, viande si vous avez un cong\\u00e9lateur)</li>
  <li>Ajoutant cosm\\u00e9tiques, d\\u00e9co, petit \\u00e9lectrom\\u00e9nager</li>
  <li>Installant un terminal de paiement (voir notre <a href="/fr/blog/terminal-paiement-electronique">guide TPE</a>)</li>
  <li>Embauchant 1 \\u00e0 2 employ\\u00e9s de confiance</li>
  <li>Enregistrant l\\u0027entreprise et obtenant les permis appropri\\u00e9s</li>
  <li>Cr\\u00e9ant un service de livraison via commandes WhatsApp</li>
</ul>

<p>Le chemin de l\\u0027\\u00e9picerie au supermarch\\u00e9 prend g\\u00e9n\\u00e9ralement 3 \\u00e0 5 ans de croissance disciplin\\u00e9e.</p>

<h2>11. Enregistrez Votre Entreprise</h2>
<p>Une fois votre boutique stabilis\\u00e9e, enregistrez-la aupr\\u00e8s de <strong>l\\u0027organisme comp\\u00e9tent de votre pays</strong> (registre du commerce ou \\u00e9quivalent local). Cela vous apporte :</p>
<ul>
  <li>Reconnaissance juridique</li>
  <li>Compte bancaire professionnel</li>
  <li>Lignes de cr\\u00e9dit fournisseur</li>
  <li>Acc\\u00e8s aux pr\\u00eats bancaires et subventions</li>
  <li>Confiance des clients et propri\\u00e9taires</li>
</ul>

<h2>Questions Fr\\u00e9quentes</h2>

<h3>Combien faut-il pour lancer une \\u00e9picerie de quartier ?</h3>
<p>Vous pouvez d\\u00e9marrer une petite \\u00e9picerie avec un budget mod\\u00e9r\\u00e9. Le format moyen n\\u00e9cessite plus de capital, et un mini-supermarch\\u00e9 demande un investissement cons\\u00e9quent.</p>

<h3>Quel est l\\u0027article le plus rentable ?</h3>
<p>Les articles \\u00e0 forte rotation (eau, cubes de bouillon, biscuits, boissons, recharges t\\u00e9l\\u00e9phoniques) g\\u00e9n\\u00e8rent de gros volumes. Les cosm\\u00e9tiques, produits d\\u0027hygi\\u00e8ne et articles b\\u00e9b\\u00e9 offrent des marges unitaires plus \\u00e9lev\\u00e9es.</p>

<h3>O\\u00f9 acheter les produits en gros ?</h3>
<p>Renseignez-vous sur les grands march\\u00e9s de gros de votre r\\u00e9gion, les cash and carry professionnels et les grossistes agr\\u00e9\\u00e9s de marques.</p>

<h3>Faut-il enregistrer l\\u0027\\u00e9picerie ?</h3>
<p>Non requis pour d\\u00e9marrer, mais fortement recommand\\u00e9 dans les 6 premiers mois. L\\u0027enregistrement construit la cr\\u00e9dibilit\\u00e9 et d\\u00e9bloque les avantages bancaires et fournisseurs.</p>

<h3>Combien de temps pour rentabiliser ?</h3>
<p>Avec un bon emplacement et une gestion constante, la plupart des \\u00e9piceries atteignent le seuil de rentabilit\\u00e9 en <strong>6 \\u00e0 12 mois</strong>.</p>

<h2>Conclusion</h2>
<p>Le commerce d\\u0027\\u00e9picerie de quartier est l\\u0027un des plus fiables et anti-crise que vous puissiez lancer avec un capital mod\\u00e9r\\u00e9. La demande ne dispara\\u00eet jamais, les marges sont \\u00e9quitables, et la tr\\u00e9sorerie est quotidienne.</p>

<p>Arr\\u00eatez de procrastiner. Faites votre \\u00e9tude de quartier cette semaine, trouvez vos fournisseurs la semaine prochaine, et ouvrez votre boutique dans le mois. Achetez plus de ce qui est r\\u00e9ellement demand\\u00e9 dans votre zone, traitez chaque client comme de l\\u0027or, tenez des comptes clairs, et vous voil\\u00e0 en route vers un commerce r\\u00e9el et durable.</p>
    `.trim());

    // SEO metadata
    const seoTitle = "Provision Store Business in Nigeria: Complete 2026 Guide | New Deal Zone";
    const metaDescription = "Start a profitable provision store in Nigeria with N200,000. Complete guide: capital, what to stock, best location, and how to earn N5,000-N10,000 daily.";
    const focusKeyphrase = "provision store business Nigeria";

    const seoTitleFr = d("Commerce d\\u0027\\u00c9picerie de Quartier : Guide Complet 2026 | New Deal Zone");
    const metaDescriptionFr = d("Lancez un commerce rentable d\\u0027\\u00e9picerie de quartier. Guide complet : capital, quoi stocker, meilleur emplacement, gestion et strat\\u00e9gies pour g\\u00e9n\\u00e9rer un revenu solide.");
    const focusKeyphraseFr = d("commerce \\u00e9picerie quartier");

    const tags = JSON.stringify(["provision store", "nigeria", "small business", "retail", "entrepreneurship", "neighborhood shop", "grocery"]);
    const tagsFr = JSON.stringify([
      d("\\u00e9picerie quartier"),
      "commerce",
      "petite entreprise",
      d("vente au d\\u00e9tail"),
      "entrepreneuriat",
      d("commerce alimentaire"),
      d("commerce de proximit\\u00e9")
    ]);

    const readTime = 10;

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
      message: "Provision store post seeded successfully",
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