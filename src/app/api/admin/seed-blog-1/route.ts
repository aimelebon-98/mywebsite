import { NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts, authors } from "@/db/schema";
import { eq } from "drizzle-orm";

interface SeedPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  titleFr: string;
  excerptFr: string;
  contentFr: string;
  coverImage: string;
  category: string;
  tags: string[];
  tagsFr: string[];
  featured?: boolean;
  seoTitle: string;
  metaDescription: string;
  focusKeyphrase: string;
  seoTitleFr: string;
  metaDescriptionFr: string;
  focusKeyphraseFr: string;
}

const POSTS: SeedPost[] = [
  {
    slug: "how-to-style-chunky-sneakers-2026",
    title: "How to Style Chunky Sneakers in 2026",
    excerpt: "Chunky sneakers are still dominating streetwear. Here's how to wear them without looking dated.",
    content: `<p>Chunky sneakers refuse to go away, and 2026 proves they're not just a fleeting trend. From runway shows in Paris to street style in Tokyo, oversized silhouettes are everywhere. But wearing them well is an art.</p>
<h2>Why chunky sneakers still matter</h2>
<p>The appeal of chunky sneakers goes beyond aesthetics. They add height, create a bold statement, and instantly modernize any outfit. The exaggerated proportions balance well against slim-fit clothing, creating a visual contrast that feels intentional rather than accidental.</p>
<h2>Match with tapered trousers</h2>
<p>The most flattering pairing for chunky sneakers is tapered trousers or slim-fit jeans. The narrow silhouette of the pants lets the shoes take center stage. Avoid wide-leg pants that swallow the shoe entirely. Cropped hems work particularly well, showcasing the full profile of the sneaker.</p>
<h2>Balance the proportions</h2>
<p>If your shoes are bulky, keep the rest of your outfit streamlined. A fitted t-shirt or crisp button-down keeps the focus where you want it. Layering an oversized jacket over a slim base creates that coveted balanced silhouette without looking sloppy.</p>
<h2>Neutral colors are your friend</h2>
<p>White, cream, and grey chunky sneakers are versatile enough to work with 90% of your wardrobe. Save the bold colorways for when you want to make a statement. A clean white pair with a black tapered jean and cream sweater is a foolproof combination.</p>
<h2>Don't skip the socks</h2>
<p>Show a bit of sock, or opt for no-show socks paired with cropped pants. Athletic crew socks in white make the look feel intentional. Statement socks in bright colors work great with monochrome outfits, adding a pop without overwhelming.</p>
<h2>Confidence is the key accessory</h2>
<p>Chunky sneakers demand attitude. Own the look, walk with intention, and don't try to hide the shoes. Their size is the point. When you commit to the proportions, the outfit works. When you second-guess it, everyone can tell.</p>`,
    titleFr: "Comment porter les baskets chunky en 2026",
    excerptFr: "Les baskets chunky continuent de dominer le streetwear. Voici comment les porter sans paraitre demode.",
    contentFr: `<p>Les baskets chunky refusent de disparaitre, et 2026 prouve qu'il ne s'agit pas d'une tendance passagere. Des defiles parisiens au style de rue tokyoite, les silhouettes surdimensionnees sont partout. Mais bien les porter est un art.</p>
<h2>Pourquoi les baskets chunky comptent encore</h2>
<p>L'attrait des baskets chunky depasse l'esthetique. Elles ajoutent de la hauteur, creent une declaration audacieuse et modernisent instantanement toute tenue. Les proportions exagerees s'equilibrent bien avec des vetements ajustes, creant un contraste visuel intentionnel.</p>
<h2>Associez-les a des pantalons ajustes</h2>
<p>L'association la plus flatteuse pour les baskets chunky est un pantalon ajuste ou un jean slim. La silhouette etroite du pantalon laisse les chaussures au centre de l'attention. Evitez les pantalons larges qui engloutissent la chaussure. Les ourlets courts fonctionnent particulierement bien.</p>
<h2>Equilibrez les proportions</h2>
<p>Si vos chaussures sont volumineuses, gardez le reste de votre tenue epuree. Un t-shirt ajuste ou une chemise nette maintient le focus. Superposer une veste oversized sur une base slim cree cette silhouette equilibree tant convoitee.</p>
<h2>Les couleurs neutres sont vos amies</h2>
<p>Le blanc, la creme et le gris sont assez polyvalents pour fonctionner avec 90% de votre garde-robe. Gardez les coloris audacieux pour quand vous voulez faire une declaration. Une paire blanche avec un jean noir ajuste et un pull creme est une combinaison infaillible.</p>
<h2>Ne negligez pas les chaussettes</h2>
<p>Montrez un peu de chaussette, ou optez pour des chaussettes invisibles avec des pantalons courts. Des chaussettes athletiques blanches rendent le look intentionnel.</p>
<h2>La confiance est l'accessoire cle</h2>
<p>Les baskets chunky exigent de l'attitude. Assumez le look, marchez avec intention. Leur taille est le point. Quand vous vous engagez dans les proportions, la tenue fonctionne.</p>`,
    coverImage: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=80",
    category: "style-tips",
    tags: ["chunky", "streetwear", "styling", "2026"],
    tagsFr: ["chunky", "streetwear", "style", "2026"],
    featured: true,
    seoTitle: "How to Style Chunky Sneakers in 2026 - Complete Guide",
    metaDescription: "Master the chunky sneaker look with our 2026 styling guide. Learn how to pair oversized sneakers with any outfit for a modern silhouette.",
    focusKeyphrase: "chunky sneakers styling",
    seoTitleFr: "Comment porter les baskets chunky en 2026 - Guide complet",
    metaDescriptionFr: "Maitrisez le look basket chunky avec notre guide 2026. Apprenez a associer les baskets oversized avec toute tenue.",
    focusKeyphraseFr: "baskets chunky style",
  },
  {
    slug: "5-ways-white-sneakers-any-outfit",
    title: "5 Ways to Wear White Sneakers with Any Outfit",
    excerpt: "White sneakers are the ultimate wardrobe workhorse. Here are five foolproof ways to style them.",
    content: `<p>White sneakers are the Swiss Army knife of footwear. They work with jeans, chinos, suits, and even dresses. But not all white sneakers are created equal, and neither is the way you style them.</p>
<h2>1. With tailored trousers for smart-casual</h2>
<p>Wool trousers, dressy chinos, or even a suit paired with clean white leather sneakers strike the perfect smart-casual balance. Keep the sneakers minimal - think low-profile silhouettes without loud branding.</p>
<h2>2. With denim for effortless weekend style</h2>
<p>Straight-leg or slim jeans in classic indigo let white sneakers pop. Roll the cuffs slightly to show the shoe. A tucked-in t-shirt or oversized sweater completes the look.</p>
<h2>3. With shorts for warm weather</h2>
<p>Tailored shorts hitting just above the knee paired with white low-tops create a clean summer look. Add a linen shirt and you're ready for anything from brunch to a beach walk.</p>
<h2>4. With athleisure for gym-to-street</h2>
<p>Joggers or performance leggings paired with chunky white trainers make athleisure feel intentional rather than lazy. Add a bomber jacket for streetwear credibility.</p>
<h2>5. With dresses and skirts for a fresh feminine look</h2>
<p>Midi dresses, sundresses, and pleated skirts all benefit from the casual counter-balance of white sneakers. It creates a modern, effortless vibe that feels youthful without trying too hard.</p>
<h2>The maintenance factor</h2>
<p>White sneakers demand upkeep. Clean them weekly with a soft brush and mild soap. Protect them with a waterproof spray. When they finally show wear, replace them - a scuffed white sneaker ruins the whole point.</p>`,
    titleFr: "5 facons de porter les baskets blanches",
    excerptFr: "Les baskets blanches sont l'element polyvalent ultime. Voici cinq facons infaillibles de les styliser.",
    contentFr: `<p>Les baskets blanches sont le couteau suisse de la chaussure. Elles fonctionnent avec les jeans, les chinos, les costumes et meme les robes. Mais toutes les baskets blanches ne se valent pas, et leur mise en style non plus.</p>
<h2>1. Avec un pantalon ajuste pour un look smart-casual</h2>
<p>Un pantalon en laine, un chino habille ou meme un costume associe a des baskets en cuir blanc propres cree l'equilibre smart-casual parfait. Gardez les baskets minimalistes.</p>
<h2>2. Avec du denim pour un style weekend sans effort</h2>
<p>Un jean droit ou slim en indigo classique fait ressortir les baskets blanches. Roulez legerement les revers pour montrer la chaussure.</p>
<h2>3. Avec un short par temps chaud</h2>
<p>Un short ajuste s'arretant juste au-dessus du genou associe a des baskets basses blanches cree un look estival epure.</p>
<h2>4. Avec du sportswear pour du gym-to-street</h2>
<p>Un jogger ou un legging de performance associe a des baskets blanches chunky rend le sportswear intentionnel plutot que paresseux.</p>
<h2>5. Avec des robes et jupes pour un look feminin frais</h2>
<p>Les robes midi, les robes d'ete et les jupes plissees beneficient toutes du contrepoids casual des baskets blanches.</p>
<h2>Le facteur entretien</h2>
<p>Les baskets blanches exigent de l'entretien. Nettoyez-les chaque semaine avec une brosse douce et un savon doux.</p>`,
    coverImage: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1200&q=80",
    category: "style-tips",
    tags: ["white-sneakers", "styling", "essentials"],
    tagsFr: ["baskets-blanches", "style", "essentiels"],
    seoTitle: "5 Ways to Wear White Sneakers with Any Outfit",
    metaDescription: "Discover 5 foolproof ways to style white sneakers with any outfit. From smart-casual to weekend looks, master the versatile classic.",
    focusKeyphrase: "white sneakers outfit",
    seoTitleFr: "5 facons de porter les baskets blanches",
    metaDescriptionFr: "Decouvrez 5 facons infaillibles de porter des baskets blanches. Du smart-casual aux looks du weekend.",
    focusKeyphraseFr: "baskets blanches tenue",
  },
  {
    slug: "formal-shoes-vs-loafers",
    title: "Formal Shoes vs Loafers: Which to Choose",
    excerpt: "Oxford, Derby, or Loafer? Understanding when to wear each type transforms your professional wardrobe.",
    content: `<p>The difference between an Oxford, a Derby, and a Loafer isn't just aesthetic - it's about occasion, formality, and personal style. Getting it right elevates your entire outfit.</p>
<h2>Oxford: The most formal choice</h2>
<p>Oxfords have a closed lacing system where the eyelets are stitched under the vamp. This creates a sleek, seamless silhouette that reads as the most formal shoe you can wear. Save them for job interviews, weddings, black-tie events, and business meetings with executives.</p>
<h2>Derby: The versatile middle ground</h2>
<p>Derbies (also called Bluchers) have open lacing where the eyelet tabs are stitched on top of the vamp. This makes them slightly less formal than Oxfords but still absolutely appropriate for business settings. They're often more comfortable due to the adjustable fit.</p>
<h2>Loafers: Sophisticated ease</h2>
<p>Loafers are slip-on shoes with no laces, ranging from casual penny loafers to elegant tassel loafers. They occupy a fascinating middle space between formal and casual. A polished pair of horsebit loafers can work with a suit or with tailored jeans equally well.</p>
<h2>When to choose each</h2>
<ul>
<li><strong>Oxford:</strong> Formal events, conservative business, funerals, black-tie</li>
<li><strong>Derby:</strong> Standard business, business-casual, semi-formal</li>
<li><strong>Loafer:</strong> Business-casual, smart-casual, sophisticated weekend</li>
</ul>
<h2>The color rules</h2>
<p>Black is the most formal in all three styles. Dark brown works for everything except black-tie. Burgundy and oxblood are stylish alternatives for creative professionals. Suede is always more casual than smooth leather.</p>
<h2>Investment worth making</h2>
<p>A quality pair of formal shoes should last a decade with proper care. Cheap shoes look cheap, and everyone in the room notices. Buy the best pair you can afford, care for them properly, and they'll return the investment many times over.</p>`,
    titleFr: "Chaussures formelles vs mocassins : que choisir",
    excerptFr: "Oxford, Derby ou mocassin ? Comprendre quand porter chaque type transforme votre garde-robe professionnelle.",
    contentFr: `<p>La difference entre un Oxford, un Derby et un mocassin n'est pas seulement esthetique - c'est une question d'occasion, de formalite et de style personnel.</p>
<h2>Oxford : le choix le plus formel</h2>
<p>Les Oxfords ont un systeme de laçage ferme ou les oeillets sont cousus sous la tige. Cela cree une silhouette elegante et sans couture qui se lit comme la chaussure la plus formelle possible.</p>
<h2>Derby : le terrain d'entente polyvalent</h2>
<p>Les Derbies ont un laçage ouvert ou les languettes des oeillets sont cousues sur le dessus de la tige. Cela les rend legerement moins formels que les Oxfords mais toujours appropries pour le milieu des affaires.</p>
<h2>Mocassins : elegance sans effort</h2>
<p>Les mocassins sont des chaussures a enfiler sans lacets, allant du penny loafer decontracte au mocassin a pompons elegant. Ils occupent un espace fascinant entre formel et decontracte.</p>
<h2>Quand choisir chaque</h2>
<ul>
<li><strong>Oxford :</strong> Evenements formels, affaires conservatrices, funerailles, cravate noire</li>
<li><strong>Derby :</strong> Affaires standard, business-casual, semi-formel</li>
<li><strong>Mocassin :</strong> Business-casual, smart-casual, weekend sophistique</li>
</ul>
<h2>Un investissement qui vaut la peine</h2>
<p>Une bonne paire de chaussures formelles devrait durer une decennie avec des soins appropries.</p>`,
    coverImage: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=1200&q=80",
    category: "style-tips",
    tags: ["formal", "loafers", "oxfords", "business"],
    tagsFr: ["formel", "mocassins", "oxfords", "business"],
    seoTitle: "Formal Shoes vs Loafers: Complete Style Guide",
    metaDescription: "Learn the difference between Oxfords, Derbies, and Loafers. Know when to wear each formal shoe style for maximum impact.",
    focusKeyphrase: "formal shoes loafers",
    seoTitleFr: "Chaussures formelles vs mocassins : guide complet",
    metaDescriptionFr: "Apprenez la difference entre Oxfords, Derbies et mocassins. Sachez quand porter chaque style de chaussure formelle.",
    focusKeyphraseFr: "chaussures formelles mocassins",
  },
  {
    slug: "capsule-shoe-wardrobe-7-essentials",
    title: "Building a Capsule Shoe Wardrobe: 7 Essential Pairs",
    excerpt: "You don't need 30 pairs. These 7 versatile shoes cover every occasion in your life.",
    content: `<p>A capsule wardrobe isn't about minimalism for its own sake - it's about intentional choices that maximize versatility. Your shoe collection should follow the same philosophy.</p>
<h2>1. White leather sneakers</h2>
<p>The single most versatile shoe you can own. Pair with jeans, chinos, suits, or dresses. Choose a clean, minimalist silhouette without loud branding for maximum longevity.</p>
<h2>2. Black leather Derby or Oxford</h2>
<p>For interviews, weddings, funerals, and formal business. Black polished leather is non-negotiable for your most important events.</p>
<h2>3. Brown suede Chelsea boots</h2>
<p>The perfect fall and winter shoe. Works with jeans, chinos, and even lightweight suits for smart-casual events. Suede reads more casual than leather.</p>
<h2>4. Running shoes</h2>
<p>Actual performance running shoes, not fashion sneakers. Even if you don't run daily, they're essential for gym visits, travel, and long walks in the city.</p>
<h2>5. Loafers (penny or horsebit)</h2>
<p>The smart-casual weapon. Wear with tailored shorts in summer, with chinos in fall, with slim trousers year-round. Brown or burgundy suede offers maximum versatility.</p>
<h2>6. Everyday casual sneaker</h2>
<p>A darker or patterned sneaker for days when white feels too precious. Grey, navy, or a subtle color that hides scuffs and pairs with darker outfits.</p>
<h2>7. Weather-appropriate boots</h2>
<p>Depending on your climate: waterproof leather boots for wet cities, insulated boots for cold winters, or hiking boots for outdoor lifestyles. Function over fashion here.</p>
<h2>What you don't need</h2>
<p>Skip the trendy limited editions unless you truly love them. Skip the impulse buys. Skip the "just in case" pairs. Every shoe in your rotation should get worn regularly. If it doesn't, it's taking up space.</p>
<h2>Quality over quantity</h2>
<p>Seven quality pairs will outlast and outperform twenty cheap ones. Invest in the pairs you'll wear most, and treat them well.</p>`,
    titleFr: "Construire une garde-robe capsule : 7 paires essentielles",
    excerptFr: "Vous n'avez pas besoin de 30 paires. Ces 7 chaussures polyvalentes couvrent toutes les occasions de votre vie.",
    contentFr: `<p>Une garde-robe capsule n'est pas du minimalisme pour lui-meme - c'est faire des choix intentionnels qui maximisent la polyvalence.</p>
<h2>1. Baskets blanches en cuir</h2>
<p>La chaussure la plus polyvalente que vous puissiez posseder. Associez avec jeans, chinos, costumes ou robes.</p>
<h2>2. Derby ou Oxford noir en cuir</h2>
<p>Pour les entretiens, mariages, funerailles et affaires formelles. Le cuir noir poli est non-negociable.</p>
<h2>3. Bottes Chelsea en daim marron</h2>
<p>La chaussure parfaite pour l'automne et l'hiver. Fonctionne avec jeans, chinos et meme costumes legers.</p>
<h2>4. Chaussures de course</h2>
<p>De vraies chaussures de course de performance, pas des baskets de mode. Meme si vous ne courez pas quotidiennement, elles sont essentielles.</p>
<h2>5. Mocassins</h2>
<p>L'arme smart-casual. Portez avec un short ajuste en ete, avec des chinos en automne, avec un pantalon slim toute l'annee.</p>
<h2>6. Basket decontractee au quotidien</h2>
<p>Une basket plus sombre ou a motifs pour les jours ou le blanc semble trop precieux.</p>
<h2>7. Bottes adaptees a la meteo</h2>
<p>Selon votre climat : bottes en cuir impermeables pour les villes humides, bottes isolees pour les hivers froids.</p>
<h2>Qualite plutot que quantite</h2>
<p>Sept paires de qualite dureront plus longtemps et performeront mieux que vingt bon marche.</p>`,
    coverImage: "https://images.unsplash.com/photo-1449505078894-c7859f8ea1a3?w=1200&q=80",
    category: "style-tips",
    tags: ["capsule", "essentials", "minimalism", "wardrobe"],
    tagsFr: ["capsule", "essentiels", "minimalisme", "garde-robe"],
    seoTitle: "7 Essential Shoes for a Capsule Wardrobe",
    metaDescription: "Build a versatile shoe collection with just 7 essential pairs. From white sneakers to Chelsea boots, cover every occasion.",
    focusKeyphrase: "capsule shoe wardrobe",
    seoTitleFr: "7 chaussures essentielles pour une garde-robe capsule",
    metaDescriptionFr: "Construisez une collection de chaussures polyvalente avec seulement 7 paires essentielles.",
    focusKeyphraseFr: "garde-robe capsule chaussures",
  },
  {
    slug: "nike-air-max-90-review",
    title: "Nike Air Max 90 Review: Timeless or Overhyped?",
    excerpt: "Three decades after launch, we tested the Air Max 90 to see if it still deserves its legendary status.",
    content: `<p>Released in 1990 and designed by Tinker Hatfield, the Air Max 90 has spent 35 years as one of Nike's most iconic silhouettes. But does it still hold up in 2026? We wore a pair daily for a month to find out.</p>
<h2>The design that changed everything</h2>
<p>The visible Air unit in the heel wasn't just innovative - it was revolutionary. Hatfield exposed the technology as a design element, turning cushioning into a visual statement. That transparent window remains one of the most recognizable design features in sneaker history.</p>
<h2>Fit and comfort</h2>
<p>The Air Max 90 fits true to size for most people, though the shape is slightly narrow. Wide-footers may want to size up half. The visible air unit provides decent cushioning for casual wear but doesn't match modern running shoes for actual performance.</p>
<h2>Materials and build quality</h2>
<p>Standard colorways use a mix of leather, mesh, and synthetic overlays. Higher-end versions in premium leather or suede feel noticeably more substantial. The stitching quality is generally excellent for the price point.</p>
<h2>Styling versatility</h2>
<p>This is where the Air Max 90 truly shines. It works with jeans, joggers, shorts, and even tailored trousers for casual settings. The classic silhouette is neither too dressy nor too athletic - a rare middle ground.</p>
<h2>Long-term durability</h2>
<p>After a month of daily wear, the shoes show minor creasing on the toe box (normal) and slight sole wear. The upper materials hold up well. Expect 1-2 years of regular wear before they need replacing.</p>
<h2>Value proposition</h2>
<p>At standard retail, the Air Max 90 offers exceptional value. You're paying for design heritage, comfortable-enough cushioning, and a silhouette that will never look dated. Sale prices make them even more attractive.</p>
<h2>The verdict</h2>
<p>Timeless. Not overhyped. The Air Max 90 earned its status through genuine innovation and consistent quality. It's not the most comfortable sneaker on the market, but it might be the most iconic - and that counts for something. Recommended for anyone who values design heritage.</p>`,
    titleFr: "Test Nike Air Max 90 : intemporelle ou surestimee ?",
    excerptFr: "Trois decennies apres son lancement, nous avons teste l'Air Max 90 pour voir si elle merite toujours son statut legendaire.",
    contentFr: `<p>Lancee en 1990 et concue par Tinker Hatfield, l'Air Max 90 a passe 35 ans comme l'une des silhouettes les plus emblematiques de Nike.</p>
<h2>Le design qui a tout change</h2>
<p>L'unite Air visible au talon n'etait pas seulement innovante - elle etait revolutionnaire. Hatfield a expose la technologie comme element de design.</p>
<h2>Coupe et confort</h2>
<p>L'Air Max 90 taille conformement pour la plupart des gens, bien que la forme soit legerement etroite. Les pieds larges voudront prendre une demi-pointure au-dessus.</p>
<h2>Materiaux et qualite</h2>
<p>Les coloris standards utilisent un melange de cuir, de mesh et de superpositions synthetiques.</p>
<h2>Polyvalence de style</h2>
<p>C'est la que l'Air Max 90 brille vraiment. Elle fonctionne avec des jeans, des joggers, des shorts et meme des pantalons ajustes en contexte decontracte.</p>
<h2>Durabilite a long terme</h2>
<p>Apres un mois de port quotidien, les chaussures montrent un pli mineur sur l'avant-pied (normal).</p>
<h2>Le verdict</h2>
<p>Intemporelle. Pas surestimee. L'Air Max 90 a gagne son statut grace a une innovation authentique et une qualite constante.</p>`,
    coverImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
    category: "product-reviews",
    tags: ["nike", "air-max", "review", "sneakers"],
    tagsFr: ["nike", "air-max", "test", "baskets"],
    seoTitle: "Nike Air Max 90 Review 2026: Still Worth It?",
    metaDescription: "Full Nike Air Max 90 review after 30 days of daily wear. Comfort, style, durability, and value analyzed.",
    focusKeyphrase: "nike air max 90 review",
    seoTitleFr: "Test Nike Air Max 90 en 2026 : ça vaut le coup ?",
    metaDescriptionFr: "Test complet des Nike Air Max 90 apres 30 jours de port quotidien.",
    focusKeyphraseFr: "test nike air max 90",
  },
  {
    slug: "best-running-shoes-long-distance-2026",
    title: "The Best Running Shoes for Long Distance in 2026",
    excerpt: "We tested the top marathon-ready shoes to find which pair actually delivers on race day.",
    content: `<p>Long-distance running punishes shoes and feet alike. After testing 12 models over 500 combined miles, these are the pairs that consistently perform when the mileage gets serious.</p>
<h2>What matters at long distances</h2>
<p>For runs over 10 miles, three factors dominate: cushioning that doesn't compress by mile 20, breathability that keeps feet cool for hours, and weight that doesn't tire your legs over time. Fit is non-negotiable - blisters ruin marathons.</p>
<h2>Nike Alphafly 3</h2>
<p>The gold standard for elite marathoners. Carbon plate and ZoomX foam provide unmatched energy return. Not cheap, and the aggressive geometry doesn't suit everyone, but for race day performance, few shoes compare.</p>
<h2>Hoka Bondi 9</h2>
<p>Maximum cushioning for runners who prioritize comfort over speed. The exaggerated stack height feels bouncy at first, becoming addictive by mile 15. Ideal for high-mileage training weeks.</p>
<h2>Asics Novablast 5</h2>
<p>The best value in the field. FF Blast Plus foam delivers modern responsiveness at half the price of super shoes. Great for daily training and casual half-marathons.</p>
<h2>Saucony Endorphin Speed 5</h2>
<p>The tempo shoe champion. Nylon plate provides propulsion without the carbon-plate rigidity. Excellent for interval training and race pacing sessions.</p>
<h2>Brooks Ghost Max 2</h2>
<p>Best for beginners tackling their first long distance. Balanced cushioning, wide platform for stability, moderate price. No fireworks, just consistent performance.</p>
<h2>How to choose your pair</h2>
<p>Match the shoe to your goal. Racing a PR? Super shoe with carbon plate. Building weekly mileage? Cushioned daily trainer. First half-marathon? Something forgiving and stable. Don't wear race shoes for training - the foam compresses and you'll lose the benefit for the actual race.</p>
<h2>Break-in period</h2>
<p>All these shoes need 30-50 miles before you rely on them for a race. Test them on training runs at goal pace. Never wear anything new on race day.</p>`,
    titleFr: "Les meilleures chaussures de course longue distance en 2026",
    excerptFr: "Nous avons teste les meilleures chaussures marathon pour trouver celle qui performe le jour J.",
    contentFr: `<p>La course longue distance punit les chaussures et les pieds. Apres avoir teste 12 modeles sur 800 km combines, voici les paires qui performent constamment.</p>
<h2>Ce qui compte sur longue distance</h2>
<p>Pour les courses de plus de 16 km, trois facteurs dominent : un amorti qui ne se compresse pas au 30eme km, une respirabilite qui garde les pieds au frais, et un poids qui ne fatigue pas.</p>
<h2>Nike Alphafly 3</h2>
<p>La reference pour les marathoniens elite. Plaque carbone et mousse ZoomX offrent un retour d'energie inegale.</p>
<h2>Hoka Bondi 9</h2>
<p>Amorti maximum pour les coureurs qui privilegient le confort a la vitesse.</p>
<h2>Asics Novablast 5</h2>
<p>La meilleure valeur du marche. Mousse FF Blast Plus offre une reactivite moderne a moitie prix.</p>
<h2>Saucony Endorphin Speed 5</h2>
<p>Le champion des chaussures tempo. Plaque nylon offre une propulsion sans la rigidite du carbone.</p>
<h2>Brooks Ghost Max 2</h2>
<p>Meilleur pour les debutants abordant leur premiere longue distance.</p>
<h2>Periode de rodage</h2>
<p>Toutes ces chaussures ont besoin de 50-80 km avant que vous puissiez compter sur elles pour une course.</p>`,
    coverImage: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&q=80",
    category: "product-reviews",
    tags: ["running", "marathon", "long-distance", "2026"],
    tagsFr: ["course", "marathon", "longue-distance", "2026"],
    seoTitle: "Best Long Distance Running Shoes 2026 - Marathon Tested",
    metaDescription: "The best running shoes for marathons and long distance in 2026. Tested over 500 miles for real-world performance data.",
    focusKeyphrase: "best long distance running shoes",
    seoTitleFr: "Meilleures chaussures course longue distance 2026",
    metaDescriptionFr: "Les meilleures chaussures de course pour marathons et longue distance en 2026.",
    focusKeyphraseFr: "meilleures chaussures course longue distance",
  },
  {
    slug: "chelsea-boots-leather-vs-suede",
    title: "Chelsea Boots Comparison: Leather vs Suede",
    excerpt: "Both look great, but leather and suede Chelsea boots serve very different styling purposes.",
    content: `<p>The Chelsea boot is arguably the most versatile boot silhouette ever designed. Choosing between leather and suede shapes when, where, and how you'll wear them.</p>
<h2>Leather Chelsea boots</h2>
<p>Smooth leather Chelseas read more formal. They polish up beautifully, patina with age, and can transition from office to dinner. Black leather works with suits. Brown leather bridges casual and dressy contexts.</p>
<h2>Suede Chelsea boots</h2>
<p>Suede Chelseas are inherently more casual, with a soft texture that reads relaxed even in dark colors. They pair perfectly with jeans, chinos, and casual trousers. Never wear them to formal events.</p>
<h2>Weather considerations</h2>
<p>Leather handles rain and salt far better than suede. Suede stains easily and requires protective spray plus careful maintenance. If you live somewhere wet, leather is the safer daily choice.</p>
<h2>The color question</h2>
<p>Brown suede in medium or dark shades is the most versatile Chelsea boot on the market. It works with denim, chinos, wool trousers - virtually anything short of a suit. Black leather is the runner-up for maximum versatility.</p>
<h2>Fit specifics</h2>
<p>Chelsea boots should fit snug in the heel with no slipping. The elastic side panels should feel firm but not painful. Break-in takes 2-3 weeks of regular wear for leather, often less for suede.</p>
<h2>Which to buy first</h2>
<p>If you're building a wardrobe: brown suede Chelseas. They're the most useful, most flattering, and most forgiving. Add a black leather pair later for formal contexts.</p>
<h2>Care matters</h2>
<p>Leather: condition every few months, polish before events, protect with wax spray. Suede: brush regularly with a suede brush, use eraser for spots, always protect with quality waterproofing spray. Both need shoe trees when not worn.</p>`,
    titleFr: "Comparaison bottes Chelsea : cuir vs daim",
    excerptFr: "Toutes deux magnifiques, mais les bottes Chelsea en cuir et en daim ont des usages tres differents.",
    contentFr: `<p>La botte Chelsea est sans doute la silhouette de botte la plus polyvalente jamais concue. Choisir entre cuir et daim faconne quand, ou et comment vous les porterez.</p>
<h2>Bottes Chelsea en cuir</h2>
<p>Les Chelseas en cuir lisse se lisent plus formelles. Elles se cirent magnifiquement, prennent une patine avec l'age.</p>
<h2>Bottes Chelsea en daim</h2>
<p>Les Chelseas en daim sont intrinsequement plus decontractees, avec une texture douce qui se lit detendue.</p>
<h2>Considerations meteo</h2>
<p>Le cuir gere la pluie et le sel bien mieux que le daim. Le daim tache facilement.</p>
<h2>La question de la couleur</h2>
<p>Le daim marron dans des tons moyens ou fonces est la botte Chelsea la plus polyvalente du marche.</p>
<h2>Specificites de coupe</h2>
<p>Les bottes Chelsea doivent tenir serre au talon sans glisser.</p>
<h2>Laquelle acheter en premier</h2>
<p>Si vous construisez une garde-robe : Chelseas en daim marron.</p>`,
    coverImage: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=1200&q=80",
    category: "product-reviews",
    tags: ["chelsea-boots", "leather", "suede", "boots"],
    tagsFr: ["bottes-chelsea", "cuir", "daim", "bottes"],
    seoTitle: "Chelsea Boots: Leather vs Suede Complete Guide",
    metaDescription: "Chelsea boot buying guide comparing leather vs suede. Know which style fits your wardrobe, climate, and lifestyle.",
    focusKeyphrase: "chelsea boots leather suede",
    seoTitleFr: "Bottes Chelsea : cuir vs daim guide complet",
    metaDescriptionFr: "Guide d'achat de bottes Chelsea comparant cuir et daim.",
    focusKeyphraseFr: "bottes chelsea cuir daim",
  },
  {
    slug: "rise-of-retro-90s-sneakers-2026",
    title: "The Rise of Retro '90s Sneakers in 2026",
    excerpt: "Everything old is new again. Why '90s sneaker silhouettes are dominating 2026 releases.",
    content: `<p>The '90s were sneaker culture's golden age, and 2026 has firmly embraced that heritage. Nearly every major brand is releasing retros, remakes, and reissues of designs from three decades ago.</p>
<h2>Why now?</h2>
<p>Nostalgia sells, but there's more to it. The maximalist '90s aesthetic - chunky soles, bright colors, visible tech - contrasts sharply with the minimalism that dominated 2010s design. After a decade of muted tones and clean lines, people are craving personality again.</p>
<h2>The silhouettes leading the charge</h2>
<p>Air Max 95, Zoom Vomero 5, and various basketball retros are seeing massive success. Adidas is riding the wave with Response CL and Torsion revivals. New Balance's 2002R was arguably 2024's breakout hit and continues strong.</p>
<h2>Modern updates on classic designs</h2>
<p>Most retros aren't pure reissues. Brands are updating materials for better durability, using more sustainable inputs, and often improving fit. The result is often better than the original - but purists still argue this misses the point.</p>
<h2>The premium retro trend</h2>
<p>Luxury collaborations have transformed '90s reissues into high-fashion statements. Louis Vuitton partnering with Nike, Dior with Jordan Brand, Gucci with adidas - these projects normalize four-figure sneakers.</p>
<h2>Streetwear influence</h2>
<p>Streetwear brands like Stussy, Kith, and Palace continue producing exclusive retros with major athletic brands. Their limited runs generate hype and often trade at 3-10x retail on resale platforms.</p>
<h2>What to buy vs skip</h2>
<p>Focus on iconic silhouettes with genuine history - Air Max 95, Jordan 3, Air Force 1. Skip minor retros of forgotten models. Buy the modern update if the improvements matter to you; buy vintage if authenticity is the point.</p>
<h2>Where the trend goes next</h2>
<p>Expect early 2000s designs to be next - the Y2K sneaker revival is already starting. Prepare to see chunky mesh runners and Reebok DMX designs dominate 2027 releases.</p>`,
    titleFr: "L'essor des baskets retro annees 90 en 2026",
    excerptFr: "Tout ce qui est ancien redevient nouveau. Pourquoi les silhouettes annees 90 dominent 2026.",
    contentFr: `<p>Les annees 90 etaient l'age d'or de la culture sneaker, et 2026 a fermement embrasse cet heritage.</p>
<h2>Pourquoi maintenant ?</h2>
<p>La nostalgie se vend, mais il y a plus. L'esthetique maximaliste des annees 90 contraste fortement avec le minimalisme des annees 2010.</p>
<h2>Les silhouettes qui menent la charge</h2>
<p>Air Max 95, Zoom Vomero 5 et divers retros basketball connaissent un succes massif.</p>
<h2>Mises a jour modernes de designs classiques</h2>
<p>La plupart des retros ne sont pas de purs reissues. Les marques mettent a jour les materiaux pour plus de durabilite.</p>
<h2>La tendance retro premium</h2>
<p>Les collaborations de luxe ont transforme les reissues des annees 90 en declarations haute couture.</p>
<h2>Ce qu'il faut acheter vs eviter</h2>
<p>Concentrez-vous sur les silhouettes iconiques avec une vraie histoire.</p>`,
    coverImage: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1200&q=80",
    category: "sneaker-news",
    tags: ["retro", "90s", "trends", "sneakerhead"],
    tagsFr: ["retro", "90s", "tendances", "sneakerhead"],
    seoTitle: "'90s Sneaker Revival: What's Trending in 2026",
    metaDescription: "The '90s sneaker revival is dominating 2026. Discover which retro silhouettes are back and which are worth buying.",
    focusKeyphrase: "retro 90s sneakers",
    seoTitleFr: "Renouveau des baskets 90s : tendances 2026",
    metaDescriptionFr: "Le renouveau des baskets annees 90 domine 2026.",
    focusKeyphraseFr: "baskets retro annees 90",
  },
  {
    slug: "upcoming-sneaker-releases",
    title: "Upcoming Sneaker Releases You Can't Miss",
    excerpt: "The most anticipated sneaker drops of the coming months, from limited collabs to major restocks.",
    content: `<p>Every month brings dozens of releases, but a handful genuinely matter. Here's the shortlist of upcoming drops worth watching, planning for, and possibly camping for.</p>
<h2>Nike Air Jordan 4 Retro "Bred" 2026</h2>
<p>The original Bred colorway returns with premium materials and updated construction. Expected to sell out instantly through SNKRS app, with resale prices likely doubling retail within days.</p>
<h2>Adidas Samba OG "Wales Bonner" Series</h2>
<p>Grace Wales Bonner's collaboration with adidas continues to define modern retro. The next drop features unexpected color combinations that will move fast on drop day.</p>
<h2>New Balance 990v7</h2>
<p>The 990 line's newest iteration promises the same made-in-USA quality with modern comfort improvements. Not limited, but expect the best colorways to disappear quickly.</p>
<h2>Nike Air Max Dn8</h2>
<p>The newest Air Max innovation, featuring double-stacked air tubes. Divisive design that will either be loved or hated - no middle ground.</p>
<h2>Asics x Kiko Kostadinov</h2>
<p>The high-fashion athletic collaboration continues with new silhouettes that blur runway and sport. Expensive but genuinely different from anything else in the market.</p>
<h2>How to actually secure limited releases</h2>
<p>Use official brand apps (SNKRS, CONFIRMED, END. Launches). Enter every raffle you're eligible for. Set up notifications for shock drops. Have your credit card and shipping details saved for autofill. Speed matters.</p>
<h2>Restock alerts</h2>
<p>Many "sold out" sneakers restock unexpectedly. Follow accounts that track this on Twitter and Discord. Set up product alerts on brand websites for your grail pairs.</p>
<h2>Skip the resale market</h2>
<p>Unless a pair is truly unavailable at retail, skip the 2-3x markup on StockX and GOAT. The overwhelming majority of "must-have" releases eventually restock or drop in price.</p>`,
    titleFr: "Les prochaines sorties de baskets a ne pas manquer",
    excerptFr: "Les sorties de baskets les plus attendues des prochains mois, des collabs limitees aux restocks majeurs.",
    contentFr: `<p>Chaque mois apporte des dizaines de sorties, mais une poignee comptent vraiment. Voici la liste courte des prochaines sorties a surveiller.</p>
<h2>Nike Air Jordan 4 Retro "Bred" 2026</h2>
<p>Le coloris Bred original revient avec des materiaux premium et une construction mise a jour.</p>
<h2>Adidas Samba OG "Wales Bonner"</h2>
<p>La collaboration de Grace Wales Bonner avec adidas continue de definir le retro moderne.</p>
<h2>New Balance 990v7</h2>
<p>La nouvelle iteration de la gamme 990 promet la meme qualite made-in-USA avec des ameliorations modernes.</p>
<h2>Nike Air Max Dn8</h2>
<p>La nouvelle innovation Air Max, avec des tubes d'air double.</p>
<h2>Comment vraiment securiser les sorties limitees</h2>
<p>Utilisez les applications officielles des marques. Participez a tous les tirages au sort. La vitesse compte.</p>
<h2>Sautez le marche de revente</h2>
<p>Sauf si une paire est vraiment indisponible au detail, evitez les majorations 2-3x sur StockX.</p>`,
    coverImage: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=80",
    category: "sneaker-news",
    tags: ["releases", "drops", "limited", "2026"],
    tagsFr: ["sorties", "drops", "limitees", "2026"],
    seoTitle: "Upcoming Sneaker Releases 2026 - Must-Watch Drops",
    metaDescription: "The most anticipated sneaker releases of 2026. Jordan retros, adidas collabs, and limited drops worth planning for.",
    focusKeyphrase: "upcoming sneaker releases 2026",
    seoTitleFr: "Sorties baskets 2026 - Sorties a surveiller",
    metaDescriptionFr: "Les sorties de baskets les plus attendues de 2026.",
    focusKeyphraseFr: "sorties baskets 2026",
  },
  {
    slug: "sustainability-trends-footwear",
    title: "Sustainability Trends Reshaping Footwear",
    excerpt: "From recycled ocean plastic to biodegradable soles, sustainability is finally driving real innovation.",
    content: `<p>Footwear has historically been an environmental disaster. But 2026 shows that meaningful change is possible - and profitable. These trends are reshaping how shoes are made, sold, and disposed of.</p>
<h2>Recycled materials go mainstream</h2>
<p>Major brands now use recycled polyester, ocean plastic, and reclaimed rubber in mass-market shoes. Adidas leads with over 96% of their polyester now recycled. Nike's Space Hippie line uses 85-90% recycled content.</p>
<h2>Bio-based alternatives to leather</h2>
<p>Mycelium (mushroom) leather, cactus leather, and pineapple fiber alternatives are moving from niche startups to major brand adoption. These materials require less water, no animals, and biodegrade properly.</p>
<h2>Modular design for repairability</h2>
<p>A few forward-thinking brands are designing shoes where soles can be replaced when worn out. Vessi, Cariuma, and Allbirds all offer partial repair programs, extending shoe life dramatically.</p>
<h2>Take-back and recycling programs</h2>
<p>Nike Grind, adidas Refresh, and Timberland's ReBOTL initiative accept old shoes for grinding into new products. Not perfect, but a significant improvement over landfill disposal.</p>
<h2>Local manufacturing revival</h2>
<p>Shipping shoes from Vietnam or China to Western markets has enormous carbon costs. Brands like New Balance (USA), Meermin (Spain), and Grenson (UK) manufacture regionally, dramatically reducing footprint.</p>
<h2>Water usage reduction</h2>
<p>Traditional leather tanning uses staggering amounts of water and toxic chemicals. Vegetable tanning, chrome-free processes, and waterless dyeing techniques are reducing this by 60-80% for early adopters.</p>
<h2>What consumers can do</h2>
<p>Buy fewer pairs. Buy quality that lasts. Repair rather than replace. Choose brands with genuine sustainability commitments (not just greenwashing). Donate wearable shoes, recycle worn ones properly.</p>
<h2>The uncomfortable truth</h2>
<p>The most sustainable shoe is the one you already own. No amount of eco-marketing changes this. Buy fewer, wear longer, care properly.</p>`,
    titleFr: "Les tendances durabilite qui remodelent la chaussure",
    excerptFr: "Du plastique recycle des oceans aux semelles biodegradables, la durabilite pilote enfin une vraie innovation.",
    contentFr: `<p>La chaussure a historiquement ete un desastre environnemental. Mais 2026 montre qu'un changement significatif est possible.</p>
<h2>Les materiaux recycles se generalisent</h2>
<p>Les grandes marques utilisent maintenant du polyester recycle, du plastique oceanique et du caoutchouc recupere dans les chaussures grand public.</p>
<h2>Alternatives bio-sourcees au cuir</h2>
<p>Le cuir de mycelium, le cuir de cactus et les alternatives en fibre d'ananas passent des startups aux grandes marques.</p>
<h2>Design modulaire pour la reparabilite</h2>
<p>Quelques marques concoivent des chaussures dont les semelles peuvent etre remplacees quand elles s'usent.</p>
<h2>Programmes de reprise et recyclage</h2>
<p>Nike Grind, adidas Refresh et l'initiative ReBOTL de Timberland acceptent les vieilles chaussures.</p>
<h2>Renaissance de la fabrication locale</h2>
<p>Expedier des chaussures du Vietnam ou de Chine vers les marches occidentaux a des couts carbone enormes.</p>
<h2>Ce que les consommateurs peuvent faire</h2>
<p>Achetez moins de paires. Achetez de la qualite qui dure. Reparez plutot que remplacer.</p>`,
    coverImage: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=1200&q=80",
    category: "sneaker-news",
    tags: ["sustainability", "eco", "recycled", "environment"],
    tagsFr: ["durabilite", "eco", "recycle", "environnement"],
    seoTitle: "Sustainable Footwear Trends 2026 - Real Innovation",
    metaDescription: "How sustainability is finally reshaping footwear. Recycled materials, bio-alternatives, and repair programs analyzed.",
    focusKeyphrase: "sustainable footwear",
    seoTitleFr: "Tendances chaussures durables 2026 - Vraie innovation",
    metaDescriptionFr: "Comment la durabilite remodele enfin la chaussure.",
    focusKeyphraseFr: "chaussures durables",
  },
];

function calcReadTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function GET() {
  try {
    // Find default author
    const authorRes = await db.select().from(authors).where(eq(authors.slug, "solevault-team"));
    if (authorRes.length === 0) {
      return NextResponse.json({ error: "Default author 'solevault-team' not found. Run /api/admin/migrate-blog first." }, { status: 400 });
    }
    const authorId = authorRes[0].id;

    let created = 0;
    let skipped = 0;
    const results: Array<{ slug: string; status: string }> = [];

    for (const p of POSTS) {
      const existing = await db.select().from(blogPosts).where(eq(blogPosts.slug, p.slug));
      if (existing.length > 0) {
        skipped++;
        results.push({ slug: p.slug, status: "skipped (exists)" });
        continue;
      }

      const readTime = calcReadTime(p.content);
      await db.insert(blogPosts).values({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        coverImage: p.coverImage,
        titleFr: p.titleFr,
        excerptFr: p.excerptFr,
        contentFr: p.contentFr,
        tagsFr: JSON.stringify(p.tagsFr),
        category: p.category,
        tags: JSON.stringify(p.tags),
        authorId,
        readTime,
        published: true,
        featured: p.featured || false,
        publishedAt: new Date(),
        seoTitle: p.seoTitle,
        metaDescription: p.metaDescription,
        focusKeyphrase: p.focusKeyphrase,
        seoTitleFr: p.seoTitleFr,
        metaDescriptionFr: p.metaDescriptionFr,
        focusKeyphraseFr: p.focusKeyphraseFr,
      });
      created++;
      results.push({ slug: p.slug, status: "created" });
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
      total: POSTS.length,
      message: `Seeded ${created} posts (${skipped} already existed). Now run /api/admin/seed-blog-2 for posts 11-20.`,
      results,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}