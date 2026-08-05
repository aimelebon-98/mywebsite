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
    if (secret !== "seed-phone-repair-2026-ndz") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const slug = "phone-repair-business-nigeria";
    const slugFr = "commerce-reparation-telephones";
    const authorId = "c412acd2-68c5-4105-8869-b143400d244a";
    const coverImage = "https://plus.unsplash.com/premium_photo-1663021816337-be7fb3833336?q=80&w=1200&auto=format&fit=crop";
    const coverImageAlt = "Technician using precision tools to repair the internal components of a smartphone motherboard";
    const coverImageAltFr = d("Technicien utilisant des outils de pr\\u00e9cision pour r\\u00e9parer les composants internes d\\u0027une carte m\\u00e8re de smartphone");

    // Idempotent: delete any existing versions
    await db.delete(blogPosts).where(
      or(eq(blogPosts.slug, slug), eq(blogPosts.slugFr, slugFr))
    );

    // ============ ENGLISH: Nigeria-focused ============
    const title = "How to Start a Lucrative Phone Repair Business in Nigeria (2026 Guide)";
    const excerpt = "Complete guide to starting a profitable phone repair business in Nigeria. Learn the skills, tools, shop setup, pricing, and how to earn N150,000+ monthly from your local shop.";

    const content = `
<p>Have you ever handed your phone to a technician for repair and been shocked by the bill? The last time I fixed a simple charging port, I paid N1,000. A cracked screen replacement? Between N15,000 and N40,000. A dead motherboard? Sometimes over N25,000.</p>

<p>Now think about this: Nigeria has over <strong>220 million people</strong>, and mobile penetration exceeds 95%. That means more than <strong>200 million active phones</strong> in use daily. If just one out of every thousand needs repair on any given day, that is 200,000 phones going to technicians. This is why the <strong>phone repair business in Nigeria</strong> is one of the most durable, recession-proof ventures you can start.</p>

<p>In this guide, we will cover the opportunities, how to acquire the skill, tools you need, how to set up shop, pricing, marketing, and common mistakes to avoid.</p>

<p>Related reads: <a href="/en/blog/pos-business-nigeria">Starting a POS business</a>, <a href="/en/blog/phone-selling-business-nigeria">how to start a phone selling business</a>, and <a href="/en/blog/phone-accessories-business-nigeria">the phone accessories business guide</a> — all three pair perfectly with phone repair.</p>

<h2>1. Why the Phone Repair Business is a Goldmine in Nigeria</h2>
<ul>
  <li><strong>Massive market:</strong> Over 200 million active phones in Nigeria, most of them budget models (Tecno, Infinix, Itel, Samsung A-series) that break more often than premium phones.</li>
  <li><strong>Constant demand:</strong> Phones fall, screens crack, batteries die, charging ports fail. This happens every single day.</li>
  <li><strong>You are your own boss:</strong> No monthly targets, no boss breathing down your neck. You decide your hours and rates.</li>
  <li><strong>Solid income:</strong> A skilled technician charging an average of N2,000 per job with 10 to 15 jobs a day earns N20,000 to N30,000 daily — that is <strong>N400,000 to N600,000 monthly</strong>.</li>
  <li><strong>Multiple revenue streams:</strong> Beyond repairs, you can sell accessories, refurbished phones, spare parts, and software services from the same shop.</li>
</ul>

<h2>2. Getting the Skill</h2>
<p>Becoming a phone repair technician does not require a university degree. What you need is <strong>determination and hands-on practice</strong>. Here is how to acquire the skill:</p>

<h3>A. Find the Best Technician in Your Area</h3>
<p>Ask around. Not just anyone who fixes phones, but the one people trust with their expensive devices. Reputation matters — you want to learn from someone who does the work correctly, not someone who guesses.</p>

<h3>B. Enroll as an Apprentice</h3>
<p>Apprenticeship in Nigeria typically lasts 6 months to 2 years depending on your speed and the technician's structure. Expect to pay a training fee (usually N30,000 to N150,000 depending on scope and location).</p>

<h3>C. Practice Constantly</h3>
<p>Buy scrap phones cheap from wholesalers and practice on them. Take them apart, fix them, put them back together. Repetition is what turns knowledge into skill.</p>

<h3>D. Learn Online Too</h3>
<p>YouTube is a goldmine. Channels like Hugh Jeffreys, JerryRigEverything, and Rossmann Repair Group show real repair techniques. Search for specific phone model repairs to learn tricks specific to popular Nigerian brands.</p>

<h3>E. Consider Formal Training</h3>
<p>Institutions like <strong>JETRIC (Jubilee Educational Technical Institute)</strong>, <strong>iFixit training centers</strong>, and various tech hubs in Lagos, Abuja, and Port Harcourt offer structured programs that shortcut the apprenticeship path.</p>

<h2>3. Get a Shop (or Start Without One)</h2>
<p>You need a physical location for customers to trust you with their devices. However, if you do not have shop capital yet, start from home. Fix phones for friends, family, and neighbours. Reinvest earnings until you can afford your first shop.</p>

<p>Key rule: <strong>Do not open in a dead area to save on rent</strong>. Foot traffic pays for itself many times over.</p>

<h2>4. Choosing the Right Location</h2>
<p>Your shop's appearance and location shape the type of customers you attract. A clean, well-lit shop attracts customers willing to pay premium prices. A rough-looking corner shop attracts hagglers.</p>

<p>Consider these factors:</p>
<ul>
  <li><strong>Accessibility:</strong> Can customers reach you easily? Parking? Public transport nearby?</li>
  <li><strong>Rent:</strong> Is the price justified by the visibility and traffic?</li>
  <li><strong>Competition:</strong> How many technicians are already in the area? Can you offer better service, faster turnaround, or fair pricing?</li>
  <li><strong>Nearby phone shops:</strong> These are gold. Customers buying new phones often need repairs later, and phone shops often refer customers to trusted technicians.</li>
  <li><strong>Security:</strong> You will be handling valuable devices daily. The area must be safe.</li>
  <li><strong>Power supply:</strong> Frequent power outages disrupt soldering, testing, and customer service. Budget for an inverter or small generator.</li>
</ul>

<h2>5. Essential Tools for Phone Repair</h2>
<p>Here is your starter toolkit. Total investment: <strong>around N50,000 to N100,000</strong> for basic tools, or up to N300,000 for a fully equipped shop with microscope and BGA station.</p>

<ul>
  <li><strong>Precision screwdriver set:</strong> Multiple heads (Phillips, Pentalobe, Torx) for different phone models</li>
  <li><strong>Suction cup pliers:</strong> Lift screens without damaging the glass</li>
  <li><strong>Plastic pry tools and guitar picks:</strong> Separate screens and back covers without scratching</li>
  <li><strong>Heat gun or hair dryer:</strong> Loosens adhesive for screen and back panel removal</li>
  <li><strong>Magnetic mat and small containers:</strong> Keep tiny screws organized so nothing gets lost</li>
  <li><strong>Magnifying glass or microscope:</strong> Essential for board-level repairs</li>
  <li><strong>Desk lamp with adjustable arm:</strong> Bright, focused lighting</li>
  <li><strong>Cleaning brush and isopropyl alcohol:</strong> Clean logic boards and remove residue</li>
  <li><strong>Tweezers (curved and straight):</strong> Handle small components precisely</li>
  <li><strong>Soldering iron with fine tip:</strong> Repair connections and replace IC chips</li>
  <li><strong>Multimeter:</strong> Test circuits, batteries, and charging ports</li>
  <li><strong>Anti-static wrist strap:</strong> Prevents ESD damage to sensitive components</li>
  <li><strong>Battery replacement stock:</strong> Common models sell fast</li>
  <li><strong>Screen replacement stock:</strong> Focus on Tecno, Infinix, Samsung A-series, iPhone 11 to 14</li>
</ul>

<h2>6. Pricing Guide (2026 Nigerian Rates)</h2>
<p>Here are typical repair rates in most Nigerian cities:</p>
<ul>
  <li><strong>Charging port repair:</strong> N1,000 to N3,000</li>
  <li><strong>Battery replacement (Android):</strong> N3,000 to N8,000</li>
  <li><strong>Battery replacement (iPhone):</strong> N8,000 to N25,000</li>
  <li><strong>Screen replacement (budget Android):</strong> N8,000 to N20,000</li>
  <li><strong>Screen replacement (Samsung premium / iPhone):</strong> N25,000 to N120,000</li>
  <li><strong>Speaker or microphone fix:</strong> N2,000 to N5,000</li>
  <li><strong>Water damage recovery:</strong> N5,000 to N15,000 (no guarantee of success)</li>
  <li><strong>Software flashing / unlocking:</strong> N1,500 to N5,000</li>
  <li><strong>Motherboard repair:</strong> N10,000 to N50,000 depending on damage</li>
  <li><strong>Face ID / fingerprint sensor repair:</strong> N5,000 to N15,000</li>
</ul>

<h2>7. Types of Phones to Learn</h2>
<p>In Nigeria, focus on the phones people actually own:</p>
<ul>
  <li><strong>Tecno, Infinix, Itel:</strong> The biggest volume in Nigeria — master these first</li>
  <li><strong>Samsung Galaxy A-series:</strong> Very popular, screens crack often</li>
  <li><strong>iPhone (all models from XR to 15):</strong> High-value repairs, premium clients</li>
  <li><strong>Xiaomi Redmi Note series:</strong> Growing user base</li>
  <li><strong>Basic feature phones:</strong> Older users, quick easy jobs, still profitable</li>
</ul>

<p>Skip Windows Phone (dead platform) and old HTC (rare now). Focus your inventory of spare parts on the top 5 categories above.</p>

<h2>8. How to Get Your First Customers</h2>
<ul>
  <li><strong>Start with friends and family:</strong> Fix their phones at half price in exchange for referrals</li>
  <li><strong>WhatsApp status daily:</strong> Post repair jobs completed, before/after photos</li>
  <li><strong>Partner with phone shops:</strong> They send you repair jobs, you send them customers who need new phones</li>
  <li><strong>Google My Business profile:</strong> Free listing that shows up when people search "phone repair near me"</li>
  <li><strong>Facebook and Instagram page:</strong> Daily posts with real repair work builds trust fast</li>
  <li><strong>Print small flyers:</strong> Distribute at bus stops, universities, and busy markets</li>
  <li><strong>Offer opening promotion:</strong> Free diagnostic + small discount for the first 2 weeks</li>
</ul>

<h2>9. How to Promote and Grow</h2>

<h3>A. Social Media Marketing</h3>
<p>Facebook has over 3 billion monthly active users. TikTok has over 1 billion. Your customers are there. Post daily short videos of repair work — this content converts extremely well.</p>

<h3>B. Paid Ads</h3>
<p>Facebook and Instagram ads targeting your city can reach thousands of phone owners for N1,000 to N3,000 per day. Start small, learn what works, then scale.</p>

<h3>C. Referral Program</h3>
<p>Reward customers who bring new customers with 10-20% off their next repair. Referrals are the highest-quality leads you will ever get.</p>

<h3>D. Reviews and Reputation</h3>
<p>Ask every satisfied customer to leave a Google review. High ratings dramatically increase walk-in customers over time.</p>

<h2>10. Skills and Attitude Needed to Succeed</h2>

<h3>Patience and People Skills</h3>
<p>You will deal with anxious customers whose phones are broken. Listen carefully, explain clearly, and never rush. A rude technician loses customers to competitors — even if the technical work is perfect.</p>

<h3>Attention to Detail</h3>
<p>One wrong move can destroy a customer's device. Take your time, double-check connections, and never work when tired or distracted.</p>

<h3>Continuous Learning</h3>
<p>New phone models release monthly. Keep learning new repair techniques through YouTube, forums (like GSMHosting), and manufacturer service guides.</p>

<h3>Business Management</h3>
<p>Track every repair job, keep customer records, manage spare parts inventory, and pay yourself a fixed salary. Poor management kills more phone repair shops than technical mistakes.</p>

<h2>11. Extra Income Streams from the Same Shop</h2>
<p>Multiply your revenue by adding these services:</p>
<ul>
  <li><strong>Sell refurbished phones:</strong> Buy dead phones cheap, fix and resell for 40-70% margin. See our <a href="/en/blog/phone-selling-business-nigeria">phone selling business guide</a></li>
  <li><strong>Phone accessories:</strong> Chargers, earpieces, cases, screen protectors — see our <a href="/en/blog/phone-accessories-business-nigeria">accessories business guide</a></li>
  <li><strong>Spare parts sales:</strong> Sell screens, batteries, back covers, and small components to other technicians</li>
  <li><strong>Software services:</strong> Flashing, unlocking, iCloud bypass, custom ROMs — high margin, quick turnaround (10-30 minutes)</li>
  <li><strong>POS services:</strong> Add cash withdrawals, deposits, and airtime — see our <a href="/en/blog/pos-business-nigeria">POS business guide</a></li>
  <li><strong>Data services:</strong> Sell data bundles, airtime, and offer WiFi hotspot</li>
</ul>

<h2>12. Understanding Software Repairs</h2>
<p>Phone repair is not just hardware. Software issues generate consistent, high-margin work:</p>
<ul>
  <li>Apps crashing repeatedly</li>
  <li>Phone stuck on logo (boot loop)</li>
  <li>Forgotten passwords or pattern locks</li>
  <li>Google account (FRP) locks after factory reset</li>
  <li>Water-damaged phones that need software reflashing after drying</li>
  <li>Overheating or extreme battery drain</li>
  <li>Phone extremely slow due to corrupt firmware</li>
</ul>

<p>A software flash takes 10-30 minutes and earns N1,500 to N5,000. Add unlocking services and this alone can generate N50,000+ monthly.</p>

<h2>13. Common Mistakes to Avoid</h2>
<ul>
  <li><strong>Working without diagnostics:</strong> Always diagnose before quoting. Guessing leads to lost money.</li>
  <li><strong>Accepting stolen phones:</strong> Never repair a phone without verifying ownership if it seems suspicious. This can get you arrested.</li>
  <li><strong>No warranty policy:</strong> Offer at least a 7-day warranty on parts and labour. This builds massive trust.</li>
  <li><strong>Poor record-keeping:</strong> Track every job, part used, and customer contact. This is your business memory.</li>
  <li><strong>Cheap fake parts:</strong> Yes, they save money, but they damage your reputation when they fail. Balance cost vs quality.</li>
  <li><strong>Overpromising delivery time:</strong> Give a realistic timeline plus a buffer. Under-promise, over-deliver.</li>
  <li><strong>Not registering the business:</strong> A CAC-registered business gets more trust, corporate customers, and bank loans.</li>
</ul>

<h2>Frequently Asked Questions</h2>

<h3>How long does it take to learn phone repair?</h3>
<p>Basic repairs (screens, batteries, charging ports) can be learned in 3 to 6 months with daily practice. Advanced board-level work takes 1 to 2 years to master.</p>

<h3>How much capital do I need to start a phone repair business?</h3>
<p>You can start from home with as little as N50,000 in basic tools. A proper shop with rent, setup, and initial spare parts stock costs N200,000 to N500,000.</p>

<h3>Do I need to sell phones and accessories too?</h3>
<p>Not required, but highly recommended. Selling accessories and refurbished phones can easily double or triple your monthly revenue with the same walk-in traffic.</p>

<h3>Which brand of phone is most profitable to repair?</h3>
<p>iPhones and premium Samsung Galaxy models have the highest margin per repair, but Tecno, Infinix, and Itel bring the highest volume of daily jobs in Nigeria.</p>

<h3>Can I do phone repair as a side hustle?</h3>
<p>Yes. Many technicians start weekends-only or evenings-only from home before going full-time.</p>

<h2>Conclusion</h2>
<p>The phone repair business in Nigeria is genuinely lucrative — over <strong>N150,000 to N600,000 monthly</strong> is realistic for a skilled technician with a well-located shop. The only real requirements are the humility to learn, patience with customers, and consistency.</p>

<p>If you are willing to spend 6 to 12 months mastering the craft and another 6 months building your customer base, this business can support you for life. Is that better than working for someone else? You decide.</p>
    `.trim();

    // ============ FRENCH: Globalized (NO Nigeria refs) ============
    const titleFr = d("Comment Lancer un Commerce Lucratif de R\\u00e9paration de T\\u00e9l\\u00e9phones : Guide Complet 2026");
    const excerptFr = d("Guide complet pour lancer un commerce rentable de r\\u00e9paration de t\\u00e9l\\u00e9phones mobiles. Apprenez les comp\\u00e9tences, les outils, l\\u0027am\\u00e9nagement, la tarification et comment g\\u00e9n\\u00e9rer un revenu mensuel confortable.");

    const contentFr = d(`
<p>Avez-vous d\\u00e9j\\u00e0 confi\\u00e9 votre t\\u00e9l\\u00e9phone \\u00e0 un technicien pour r\\u00e9paration et \\u00e9t\\u00e9 surpris par la facture ? Une simple prise de charge peut co\\u00fbter l\\u0027\\u00e9quivalent de plusieurs heures de salaire minimum. Un \\u00e9cran cass\\u00e9 ? Souvent une journ\\u00e9e ou plus de salaire. Une carte m\\u00e8re endommag\\u00e9e ? Parfois plusieurs jours de salaire.</p>

<p>Maintenant, r\\u00e9fl\\u00e9chissez \\u00e0 ceci : plusieurs milliards de personnes utilisent un smartphone dans le monde. La majorit\\u00e9 poss\\u00e8dent des mod\\u00e8les d\\u0027entr\\u00e9e ou milieu de gamme qui tombent, se cassent, dont la batterie meurt et dont la prise de charge d\\u00e9faille. C\\u0027est pourquoi le <strong>commerce de r\\u00e9paration de t\\u00e9l\\u00e9phones</strong> est l\\u0027une des activit\\u00e9s les plus durables et anti-crise que vous puissiez lancer.</p>

<p>Dans ce guide, nous couvrirons les opportunit\\u00e9s, comment acqu\\u00e9rir la comp\\u00e9tence, les outils n\\u00e9cessaires, l\\u0027am\\u00e9nagement de la boutique, la tarification, le marketing et les erreurs courantes \\u00e0 \\u00e9viter.</p>

<p>\\u00c0 lire aussi : <a href="/fr/blog/terminal-paiement-electronique">lancer une activit\\u00e9 de terminal de paiement</a>, <a href="/fr/blog/commerce-vente-telephones">comment lancer un commerce de vente de t\\u00e9l\\u00e9phones</a>, et notre <a href="/fr/blog/commerce-accessoires-telephone">guide sur le commerce d\\u0027accessoires t\\u00e9l\\u00e9phoniques</a> \\u2014 les trois se combinent parfaitement avec la r\\u00e9paration.</p>

<h2>1. Pourquoi la R\\u00e9paration de T\\u00e9l\\u00e9phones est une Mine d\\u0027Or</h2>
<ul>
  <li><strong>Un march\\u00e9 immense :</strong> Des milliards de t\\u00e9l\\u00e9phones actifs dans le monde, majoritairement des mod\\u00e8les d\\u0027entr\\u00e9e de gamme qui cassent plus souvent que les mod\\u00e8les premium.</li>
  <li><strong>Une demande constante :</strong> Les t\\u00e9l\\u00e9phones tombent, les \\u00e9crans se fissurent, les batteries meurent, les prises de charge d\\u00e9faillent. Chaque jour, partout.</li>
  <li><strong>Vous \\u00eates votre propre patron :</strong> Aucun objectif mensuel impos\\u00e9, aucun sup\\u00e9rieur hi\\u00e9rarchique. Vous d\\u00e9cidez de vos horaires et de vos tarifs.</li>
  <li><strong>Un revenu solide :</strong> Un technicien qualifi\\u00e9 facturant en moyenne une somme correcte par intervention avec 10 \\u00e0 15 jobs par jour peut d\\u00e9gager plusieurs fois le salaire minimum local.</li>
  <li><strong>Sources de revenus multiples :</strong> Au-del\\u00e0 des r\\u00e9parations, vous pouvez vendre des accessoires, des t\\u00e9l\\u00e9phones reconditionn\\u00e9s, des pi\\u00e8ces d\\u00e9tach\\u00e9es et des services logiciels depuis la m\\u00eame boutique.</li>
</ul>

<h2>2. Acqu\\u00e9rir la Comp\\u00e9tence</h2>
<p>Devenir technicien en r\\u00e9paration de t\\u00e9l\\u00e9phones ne demande aucun dipl\\u00f4me universitaire. Ce qu\\u0027il faut, c\\u0027est de la <strong>d\\u00e9termination et de la pratique</strong>. Voici comment acqu\\u00e9rir la comp\\u00e9tence :</p>

<h3>A. Trouver le Meilleur Technicien de Votre R\\u00e9gion</h3>
<p>Renseignez-vous. Pas n\\u0027importe qui r\\u00e9parant des t\\u00e9l\\u00e9phones, mais celui \\u00e0 qui les gens confient leurs appareils co\\u00fbteux. La r\\u00e9putation compte \\u2014 apprenez de quelqu\\u0027un qui fait le travail correctement.</p>

<h3>B. S\\u0027inscrire comme Apprenti</h3>
<p>L\\u0027apprentissage dure g\\u00e9n\\u00e9ralement 6 mois \\u00e0 2 ans selon votre rapidit\\u00e9 et la structure du technicien. Pr\\u00e9voyez des frais de formation qui varient selon la r\\u00e9gion et l\\u0027\\u00e9tendue du programme.</p>

<h3>C. Pratiquer Constamment</h3>
<p>Achetez des t\\u00e9l\\u00e9phones de rebut \\u00e0 bas prix aupr\\u00e8s de grossistes et pratiquez dessus. D\\u00e9montez-les, r\\u00e9parez-les, remontez-les. La r\\u00e9p\\u00e9tition transforme la connaissance en comp\\u00e9tence.</p>

<h3>D. Apprendre en Ligne Aussi</h3>
<p>YouTube est une mine d\\u0027or. Des cha\\u00eenes comme Hugh Jeffreys, JerryRigEverything et Rossmann Repair Group montrent de vraies techniques de r\\u00e9paration. Cherchez des tutoriels sp\\u00e9cifiques aux mod\\u00e8les populaires dans votre r\\u00e9gion.</p>

<h3>E. Envisager une Formation Formelle</h3>
<p>De nombreux instituts techniques et centres de formation professionnelle proposent des programmes structur\\u00e9s qui raccourcissent le chemin de l\\u0027apprentissage traditionnel.</p>

<h2>3. Obtenir une Boutique (ou D\\u00e9marrer Sans)</h2>
<p>Il faut un lieu physique pour que les clients vous confient leurs appareils. Cependant, si vous n\\u0027avez pas encore le capital, commencez depuis chez vous. R\\u00e9parez pour les amis, la famille et les voisins. R\\u00e9investissez les gains jusqu\\u0027\\u00e0 pouvoir vous offrir votre premi\\u00e8re boutique.</p>

<p>R\\u00e8gle cl\\u00e9 : <strong>N\\u0027ouvrez pas dans une zone morte pour \\u00e9conomiser sur le loyer</strong>. L\\u0027achalandage se paie de lui-m\\u00eame plusieurs fois.</p>

<h2>4. Choisir le Bon Emplacement</h2>
<p>L\\u0027apparence et l\\u0027emplacement de votre boutique fa\\u00e7onnent le type de clients que vous attirez. Une boutique propre et bien \\u00e9clair\\u00e9e attire des clients pr\\u00eats \\u00e0 payer des prix premium. Une boutique n\\u00e9glig\\u00e9e attire les n\\u00e9gociateurs de prix.</p>

<p>Consid\\u00e9rez ces facteurs :</p>
<ul>
  <li><strong>Accessibilit\\u00e9 :</strong> Les clients peuvent-ils vous atteindre facilement ? Parking ? Transports en commun proches ?</li>
  <li><strong>Loyer :</strong> Le prix est-il justifi\\u00e9 par la visibilit\\u00e9 et l\\u0027achalandage ?</li>
  <li><strong>Concurrence :</strong> Combien de techniciens sont d\\u00e9j\\u00e0 dans la zone ? Pouvez-vous offrir un meilleur service, des d\\u00e9lais plus rapides ou une tarification plus juste ?</li>
  <li><strong>Boutiques de t\\u00e9l\\u00e9phones voisines :</strong> Ce sont des voisins en or. Les clients qui ach\\u00e8tent de nouveaux t\\u00e9l\\u00e9phones auront besoin de r\\u00e9parations plus tard.</li>
  <li><strong>S\\u00e9curit\\u00e9 :</strong> Vous manipulerez des appareils de valeur quotidiennement. La zone doit \\u00eatre s\\u00fbre.</li>
  <li><strong>Alimentation \\u00e9lectrique :</strong> Les coupures fr\\u00e9quentes perturbent le soudage et les tests. Pr\\u00e9voyez un onduleur ou petit g\\u00e9n\\u00e9rateur si n\\u00e9cessaire.</li>
</ul>

<h2>5. Outils Essentiels pour la R\\u00e9paration</h2>
<p>Voici votre kit de d\\u00e9marrage. Investissement total mod\\u00e9r\\u00e9 pour les outils de base, ou plus important pour un atelier compl\\u00e8tement \\u00e9quip\\u00e9 avec microscope et station BGA.</p>

<ul>
  <li><strong>Set de tournevis de pr\\u00e9cision :</strong> Multiples t\\u00eates (Phillips, Pentalobe, Torx) pour diff\\u00e9rents mod\\u00e8les</li>
  <li><strong>Ventouses :</strong> Soulever les \\u00e9crans sans endommager le verre</li>
  <li><strong>Outils de d\\u00e9montage en plastique et m\\u00e9diators :</strong> S\\u00e9parer \\u00e9crans et coques arri\\u00e8re sans rayer</li>
  <li><strong>Pistolet \\u00e0 air chaud ou s\\u00e8che-cheveux :</strong> Ramollit l\\u0027adh\\u00e9sif pour retirer \\u00e9crans et panneaux arri\\u00e8re</li>
  <li><strong>Tapis magn\\u00e9tique et petits contenants :</strong> Organiser les minuscules vis pour ne rien perdre</li>
  <li><strong>Loupe ou microscope :</strong> Indispensable pour les r\\u00e9parations au niveau de la carte</li>
  <li><strong>Lampe de bureau avec bras ajustable :</strong> \\u00c9clairage brillant et focalis\\u00e9</li>
  <li><strong>Brosse de nettoyage et alcool isopropylique :</strong> Nettoyer les cartes m\\u00e8res et enlever les r\\u00e9sidus</li>
  <li><strong>Pinces \\u00e0 \\u00e9piler (courbes et droites) :</strong> Manipuler les petits composants avec pr\\u00e9cision</li>
  <li><strong>Fer \\u00e0 souder avec panne fine :</strong> R\\u00e9parer les connexions et remplacer les puces IC</li>
  <li><strong>Multim\\u00e8tre :</strong> Tester circuits, batteries et prises de charge</li>
  <li><strong>Bracelet antistatique :</strong> \\u00c9vite les d\\u00e9charges qui endommagent les composants sensibles</li>
  <li><strong>Stock de batteries de remplacement :</strong> Les mod\\u00e8les courants se vendent vite</li>
  <li><strong>Stock d\\u0027\\u00e9crans de remplacement :</strong> Concentrez-vous sur Samsung Galaxy A, iPhone 11 \\u00e0 15, Xiaomi Redmi Note</li>
</ul>

<h2>6. Guide de Tarification</h2>
<p>Voici les fourchettes typiques de r\\u00e9paration (ajustez selon le co\\u00fbt de la vie local) :</p>
<ul>
  <li><strong>R\\u00e9paration prise de charge :</strong> Tarif faible \\u00e0 mod\\u00e9r\\u00e9</li>
  <li><strong>Remplacement batterie (Android) :</strong> Tarif mod\\u00e9r\\u00e9</li>
  <li><strong>Remplacement batterie (iPhone) :</strong> Tarif \\u00e9lev\\u00e9</li>
  <li><strong>Remplacement \\u00e9cran (Android d\\u0027entr\\u00e9e) :</strong> Tarif mod\\u00e9r\\u00e9</li>
  <li><strong>Remplacement \\u00e9cran (Samsung premium / iPhone) :</strong> Tarif tr\\u00e8s \\u00e9lev\\u00e9</li>
  <li><strong>R\\u00e9paration haut-parleur ou microphone :</strong> Tarif faible \\u00e0 mod\\u00e9r\\u00e9</li>
  <li><strong>R\\u00e9cup\\u00e9ration apr\\u00e8s d\\u00e9g\\u00e2t des eaux :</strong> Tarif mod\\u00e9r\\u00e9 (sans garantie de succ\\u00e8s)</li>
  <li><strong>Flash / d\\u00e9blocage logiciel :</strong> Tarif faible mais rapide</li>
  <li><strong>R\\u00e9paration carte m\\u00e8re :</strong> Tarif variable selon dommages</li>
  <li><strong>R\\u00e9paration Face ID / capteur d\\u0027empreinte :</strong> Tarif mod\\u00e9r\\u00e9 \\u00e0 \\u00e9lev\\u00e9</li>
</ul>

<h2>7. Types de T\\u00e9l\\u00e9phones \\u00e0 Apprendre</h2>
<p>Concentrez-vous sur les t\\u00e9l\\u00e9phones que les gens poss\\u00e8dent r\\u00e9ellement :</p>
<ul>
  <li><strong>Samsung Galaxy A-series :</strong> Tr\\u00e8s populaire, \\u00e9crans cass\\u00e9s fr\\u00e9quents</li>
  <li><strong>iPhone (tous mod\\u00e8les de XR \\u00e0 15) :</strong> R\\u00e9parations \\u00e0 forte valeur, clients premium</li>
  <li><strong>Xiaomi Redmi et Redmi Note :</strong> Base utilisateurs en croissance</li>
  <li><strong>Huawei et Honor :</strong> Toujours pr\\u00e9sents dans de nombreuses r\\u00e9gions</li>
  <li><strong>T\\u00e9l\\u00e9phones basiques :</strong> Utilisateurs seniors, jobs rapides et simples, toujours rentables</li>
</ul>

<p>Ignorez Windows Phone (plateforme morte) et les vieux HTC (rares). Concentrez votre stock de pi\\u00e8ces d\\u00e9tach\\u00e9es sur les 5 cat\\u00e9gories ci-dessus.</p>

<h2>8. Comment Obtenir Vos Premiers Clients</h2>
<ul>
  <li><strong>Commencez avec les amis et la famille :</strong> R\\u00e9parez leurs t\\u00e9l\\u00e9phones \\u00e0 moiti\\u00e9 prix en \\u00e9change de recommandations</li>
  <li><strong>WhatsApp status quotidien :</strong> Publiez des r\\u00e9parations termin\\u00e9es, photos avant/apr\\u00e8s</li>
  <li><strong>Partenariat avec les boutiques de t\\u00e9l\\u00e9phones :</strong> Ils vous envoient les r\\u00e9parations, vous leur envoyez les clients cherchant \\u00e0 acheter neuf</li>
  <li><strong>Profil Google My Business :</strong> Fiche gratuite qui appara\\u00eet dans les recherches \\u00ab r\\u00e9paration t\\u00e9l\\u00e9phone pr\\u00e8s de chez moi \\u00bb</li>
  <li><strong>Page Facebook et Instagram :</strong> Publications quotidiennes de vrais travaux de r\\u00e9paration construisent la confiance rapidement</li>
  <li><strong>Imprimez de petits flyers :</strong> Distribuez aux arr\\u00eats de bus, universit\\u00e9s et march\\u00e9s anim\\u00e9s</li>
  <li><strong>Offrez une promotion d\\u0027ouverture :</strong> Diagnostic gratuit + petite r\\u00e9duction les 2 premi\\u00e8res semaines</li>
</ul>

<h2>9. Comment Promouvoir et D\\u00e9velopper</h2>

<h3>A. Marketing sur les R\\u00e9seaux Sociaux</h3>
<p>Facebook compte plus de 3 milliards d\\u0027utilisateurs mensuels actifs. TikTok plus d\\u0027un milliard. Vos clients y sont. Publiez quotidiennement de courtes vid\\u00e9os de travaux de r\\u00e9paration \\u2014 ce contenu convertit extr\\u00eamement bien.</p>

<h3>B. Publicit\\u00e9 Payante</h3>
<p>Facebook et Instagram Ads cibl\\u00e9es sur votre ville peuvent atteindre des milliers de propri\\u00e9taires de t\\u00e9l\\u00e9phones pour quelques euros par jour.</p>

<h3>C. Programme de Parrainage</h3>
<p>R\\u00e9compensez les clients qui vous en am\\u00e8nent de nouveaux avec 10 \\u00e0 20 % de r\\u00e9duction sur leur prochaine r\\u00e9paration. Les recommandations sont les meilleurs prospects que vous obtiendrez jamais.</p>

<h3>D. Avis et R\\u00e9putation</h3>
<p>Demandez \\u00e0 chaque client satisfait de laisser un avis Google. Les excellentes notes augmentent consid\\u00e9rablement le passage client sur le long terme.</p>

<h2>10. Comp\\u00e9tences et Attitudes N\\u00e9cessaires</h2>

<h3>Patience et Sens du Contact</h3>
<p>Vous ferez face \\u00e0 des clients anxieux dont le t\\u00e9l\\u00e9phone est cass\\u00e9. \\u00c9coutez attentivement, expliquez clairement et ne bousculez jamais. Un technicien impoli perd ses clients \\u2014 m\\u00eame si son travail technique est parfait.</p>

<h3>Attention au D\\u00e9tail</h3>
<p>Un seul faux mouvement peut d\\u00e9truire l\\u0027appareil d\\u0027un client. Prenez votre temps, v\\u00e9rifiez les connexions, et ne travaillez jamais fatigu\\u00e9 ou distrait.</p>

<h3>Apprentissage Continu</h3>
<p>De nouveaux mod\\u00e8les sortent chaque mois. Continuez d\\u0027apprendre via YouTube, forums (GSMHosting) et guides de service constructeur.</p>

<h3>Gestion Commerciale</h3>
<p>Suivez chaque r\\u00e9paration, gardez des fiches clients, g\\u00e9rez l\\u0027inventaire de pi\\u00e8ces d\\u00e9tach\\u00e9es et versez-vous un salaire fixe. La mauvaise gestion tue plus d\\u0027ateliers que les erreurs techniques.</p>

<h2>11. Sources de Revenus Suppl\\u00e9mentaires</h2>
<p>Multipliez votre chiffre d\\u0027affaires en ajoutant ces services :</p>
<ul>
  <li><strong>Vente de t\\u00e9l\\u00e9phones reconditionn\\u00e9s :</strong> Achetez cass\\u00e9s, r\\u00e9parez et revendez avec 40 \\u00e0 70 % de marge. Voir notre <a href="/fr/blog/commerce-vente-telephones">guide vente de t\\u00e9l\\u00e9phones</a></li>
  <li><strong>Accessoires t\\u00e9l\\u00e9phoniques :</strong> Chargeurs, \\u00e9couteurs, coques, protections d\\u0027\\u00e9cran \\u2014 voir notre <a href="/fr/blog/commerce-accessoires-telephone">guide accessoires</a></li>
  <li><strong>Vente de pi\\u00e8ces d\\u00e9tach\\u00e9es :</strong> Vendez \\u00e9crans, batteries, coques arri\\u00e8re \\u00e0 d\\u0027autres techniciens</li>
  <li><strong>Services logiciels :</strong> Flash, d\\u00e9blocage, contournement iCloud, ROMs personnalis\\u00e9es \\u2014 forte marge, rotation rapide (10 \\u00e0 30 min)</li>
  <li><strong>Services de paiement :</strong> Ajoutez retraits, d\\u00e9p\\u00f4ts et cr\\u00e9dit t\\u00e9l\\u00e9phonique \\u2014 voir notre <a href="/fr/blog/terminal-paiement-electronique">guide TPE</a></li>
  <li><strong>Services data :</strong> Vendez forfaits data, cr\\u00e9dit t\\u00e9l\\u00e9phonique et proposez du WiFi</li>
</ul>

<h2>12. Comprendre les R\\u00e9parations Logicielles</h2>
<p>La r\\u00e9paration de t\\u00e9l\\u00e9phones ne se limite pas au mat\\u00e9riel. Les probl\\u00e8mes logiciels g\\u00e9n\\u00e8rent un travail constant et rentable :</p>
<ul>
  <li>Applications qui plantent \\u00e0 r\\u00e9p\\u00e9tition</li>
  <li>T\\u00e9l\\u00e9phone bloqu\\u00e9 sur logo (boot loop)</li>
  <li>Mots de passe ou sch\\u00e9mas oubli\\u00e9s</li>
  <li>Verrouillage compte Google (FRP) apr\\u00e8s r\\u00e9initialisation</li>
  <li>T\\u00e9l\\u00e9phones ayant subi d\\u00e9g\\u00e2t des eaux n\\u00e9cessitant reflash apr\\u00e8s s\\u00e9chage</li>
  <li>Surchauffe ou d\\u00e9charge extr\\u00eame de batterie</li>
  <li>T\\u00e9l\\u00e9phone extr\\u00eamement lent d\\u00fb \\u00e0 un firmware corrompu</li>
</ul>

<p>Un flash logiciel prend 10 \\u00e0 30 minutes. Ajoutez les services de d\\u00e9blocage et cela peut g\\u00e9n\\u00e9rer un revenu mensuel substantiel \\u00e0 lui seul.</p>

<h2>13. Erreurs Courantes \\u00e0 \\u00c9viter</h2>
<ul>
  <li><strong>Travailler sans diagnostic :</strong> Diagnostiquez toujours avant de chiffrer. Deviner fait perdre de l\\u0027argent.</li>
  <li><strong>Accepter des t\\u00e9l\\u00e9phones vol\\u00e9s :</strong> Ne r\\u00e9parez jamais un t\\u00e9l\\u00e9phone sans v\\u00e9rifier la propri\\u00e9t\\u00e9 si cela para\\u00eet suspect. Cela peut vous conduire en prison.</li>
  <li><strong>Aucune politique de garantie :</strong> Offrez au moins 7 jours de garantie sur pi\\u00e8ces et main-d\\u0027oeuvre. Cela construit une confiance massive.</li>
  <li><strong>Mauvais suivi :</strong> Notez chaque job, pi\\u00e8ce utilis\\u00e9e et contact client. C\\u0027est la m\\u00e9moire de votre entreprise.</li>
  <li><strong>Pi\\u00e8ces contrefaites bon march\\u00e9 :</strong> Elles \\u00e9conomisent de l\\u0027argent mais d\\u00e9truisent votre r\\u00e9putation quand elles d\\u00e9faillent.</li>
  <li><strong>Sur-promettre les d\\u00e9lais :</strong> Donnez un d\\u00e9lai r\\u00e9aliste avec marge. Sous-promettez, sur-livrez.</li>
  <li><strong>Ne pas enregistrer l\\u0027entreprise :</strong> Une entreprise enregistr\\u00e9e obtient plus de confiance, de clients corporate et acc\\u00e8s aux pr\\u00eats bancaires.</li>
</ul>

<h2>Questions Fr\\u00e9quentes</h2>

<h3>Combien de temps pour apprendre la r\\u00e9paration de t\\u00e9l\\u00e9phones ?</h3>
<p>Les r\\u00e9parations de base (\\u00e9crans, batteries, prises de charge) peuvent \\u00eatre apprises en 3 \\u00e0 6 mois avec pratique quotidienne. Le travail avanc\\u00e9 au niveau carte demande 1 \\u00e0 2 ans de ma\\u00eetrise.</p>

<h3>Quel capital faut-il pour lancer un atelier de r\\u00e9paration ?</h3>
<p>Vous pouvez d\\u00e9marrer depuis chez vous avec un investissement minimal en outils de base. Un vrai atelier avec loyer, am\\u00e9nagement et stock initial de pi\\u00e8ces d\\u00e9tach\\u00e9es demande un capital plus cons\\u00e9quent.</p>

<h3>Faut-il aussi vendre des t\\u00e9l\\u00e9phones et accessoires ?</h3>
<p>Non requis, mais fortement recommand\\u00e9. Vendre accessoires et t\\u00e9l\\u00e9phones reconditionn\\u00e9s peut facilement doubler ou tripler votre chiffre d\\u0027affaires mensuel avec le m\\u00eame flux de clients.</p>

<h3>Quelle marque de t\\u00e9l\\u00e9phone est la plus rentable \\u00e0 r\\u00e9parer ?</h3>
<p>Les iPhone et Samsung Galaxy premium ont la marge la plus \\u00e9lev\\u00e9e par r\\u00e9paration, mais les mod\\u00e8les d\\u0027entr\\u00e9e de gamme (Xiaomi, Samsung A) apportent le plus gros volume quotidien.</p>

<h3>Puis-je faire cela en activit\\u00e9 secondaire ?</h3>
<p>Oui. Beaucoup de techniciens d\\u00e9marrent les week-ends ou les soirs depuis chez eux avant de passer \\u00e0 plein temps.</p>

<h2>Conclusion</h2>
<p>Le commerce de r\\u00e9paration de t\\u00e9l\\u00e9phones est r\\u00e9ellement lucratif \\u2014 un revenu mensuel confortable, souvent \\u00e9quivalent \\u00e0 plusieurs fois le salaire minimum local, est r\\u00e9aliste pour un technicien qualifi\\u00e9 avec une boutique bien situ\\u00e9e. Les seules vraies exigences sont l\\u0027humilit\\u00e9 d\\u0027apprendre, la patience avec les clients et la constance.</p>

<p>Si vous \\u00eates pr\\u00eat \\u00e0 passer 6 \\u00e0 12 mois \\u00e0 ma\\u00eetriser le m\\u00e9tier et 6 mois de plus \\u00e0 b\\u00e2tir votre client\\u00e8le, ce commerce peut vous faire vivre \\u00e0 vie. Est-ce mieux que travailler pour quelqu\\u0027un d\\u0027autre ? \\u00c0 vous de d\\u00e9cider.</p>
    `.trim());

    // SEO metadata
    const seoTitle = "Phone Repair Business in Nigeria: Complete 2026 Startup Guide | New Deal Zone";
    const metaDescription = "Start a profitable phone repair business in Nigeria. Learn skills, tools, pricing, and marketing to earn N150,000+ monthly. Complete step-by-step guide.";
    const focusKeyphrase = "phone repair business Nigeria";

    const seoTitleFr = d("Commerce de R\\u00e9paration de T\\u00e9l\\u00e9phones : Guide de D\\u00e9marrage 2026 | New Deal Zone");
    const metaDescriptionFr = d("Lancez un commerce rentable de r\\u00e9paration de t\\u00e9l\\u00e9phones. Guide complet : comp\\u00e9tences, outils, tarification, marketing et strat\\u00e9gies pour g\\u00e9n\\u00e9rer un revenu solide.");
    const focusKeyphraseFr = d("r\\u00e9paration t\\u00e9l\\u00e9phones");

    const tags = JSON.stringify(["phone repair", "nigeria", "technician", "mobile business", "entrepreneurship", "small business", "side hustle"]);
    const tagsFr = JSON.stringify([
      d("r\\u00e9paration t\\u00e9l\\u00e9phones"),
      "technicien",
      "commerce mobile",
      "entrepreneuriat",
      "petite entreprise",
      d("revenu compl\\u00e9mentaire"),
      d("r\\u00e9parateur")
    ]);

    const readTime = 11;

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
      message: "Phone repair post seeded successfully",
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