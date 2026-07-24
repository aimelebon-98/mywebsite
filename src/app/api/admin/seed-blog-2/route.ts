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
    slug: "clean-white-sneakers-without-damage",
    title: "How to Clean White Sneakers Without Damaging Them",
    excerpt: "The right technique keeps white sneakers looking fresh. The wrong one destroys them.",
    content: `<p>White sneakers get dirty. It's the price of owning them. But most people damage their shoes trying to clean them. Here's the proper technique that keeps them looking new for years.</p>
<h2>Gather the right supplies</h2>
<p>You need a soft-bristled brush (a toothbrush works), mild soap or dedicated sneaker cleaner, microfiber cloth, and warm water. Never use bleach - it yellows leather and damages canvas fibers over time.</p>
<h2>Step 1: Remove laces and initial debris</h2>
<p>Take out the laces completely. Bang the shoes together outside to knock loose dirt off. Use a dry brush to remove surface dust. Skipping this step means grinding dirt into the material later.</p>
<h2>Step 2: Clean the laces separately</h2>
<p>Soak laces in warm soapy water for 30 minutes, then agitate gently. Rinse and air dry. Yellowed laces might need to be replaced entirely - new white laces cost almost nothing.</p>
<h2>Step 3: Clean the uppers by material</h2>
<p>Leather: use a slightly damp cloth with mild soap. Wipe in circular motions. Never soak. Canvas: use a brush with soapy water, working in small sections. Rinse cloth frequently. Mesh: use the softest brush and gentle scrubbing motions.</p>
<h2>Step 4: Address the midsoles</h2>
<p>The white foam midsoles are notoriously difficult. A magic eraser removes most scuffs but wears down the material with each use. Use sparingly on genuinely marked areas, not the entire midsole.</p>
<h2>Step 5: Air dry properly</h2>
<p>Stuff shoes with white paper towels or shoe trees. Never use newspaper - the ink transfers. Place shoes in shade, never direct sunlight (yellows white materials). Never use a hair dryer or heater.</p>
<h2>Step 6: Protect for the future</h2>
<p>Apply waterproof spray after they dry completely. Do this after every deep clean. Keep them clean weekly with a quick brush-off rather than letting dirt build up.</p>
<h2>When to give up</h2>
<p>Some stains are permanent. Deep grass stains, ink, or heavy discoloration from long neglect may never fully come out. Accept it and get more use, or replace them. Fighting a losing battle wastes hours.</p>`,
    titleFr: "Comment nettoyer les baskets blanches sans les abimer",
    excerptFr: "La bonne technique garde les baskets blanches fraiches. La mauvaise les detruit.",
    contentFr: `<p>Les baskets blanches se salissent. C'est le prix a payer pour en porter. Mais la plupart des gens abiment leurs chaussures en essayant de les nettoyer.</p>
<h2>Rassemblez les bonnes fournitures</h2>
<p>Vous avez besoin d'une brosse a poils doux, d'un savon doux ou nettoyant specialise, d'un chiffon en microfibre et d'eau tiede.</p>
<h2>Etape 1 : Retirez les lacets et les debris initiaux</h2>
<p>Retirez completement les lacets. Cognez les chaussures ensemble dehors pour enlever la poussiere.</p>
<h2>Etape 2 : Nettoyez les lacets separement</h2>
<p>Faites tremper les lacets dans de l'eau savonneuse tiede pendant 30 minutes.</p>
<h2>Etape 3 : Nettoyez le dessus selon le materiau</h2>
<p>Cuir : utilisez un chiffon legerement humide avec du savon doux. Toile : utilisez une brosse avec de l'eau savonneuse.</p>
<h2>Etape 4 : Adressez les semelles intermediaires</h2>
<p>Les semelles en mousse blanche sont notoirement difficiles. Une gomme magique enleve la plupart des marques.</p>
<h2>Etape 5 : Sechage a l'air correctement</h2>
<p>Bourrez les chaussures avec du papier essuie-tout blanc. N'utilisez jamais de journal - l'encre se transfere.</p>
<h2>Etape 6 : Protegez pour l'avenir</h2>
<p>Appliquez un spray impermeabilisant apres sechage complet.</p>`,
    coverImage: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=80",
    category: "care-guides",
    tags: ["cleaning", "white-sneakers", "care", "maintenance"],
    tagsFr: ["nettoyage", "baskets-blanches", "entretien", "soin"],
    seoTitle: "How to Clean White Sneakers Without Damaging Them",
    metaDescription: "Complete guide to cleaning white sneakers without damage. Proper technique for leather, canvas, mesh, and rubber midsoles.",
    focusKeyphrase: "clean white sneakers",
    seoTitleFr: "Comment nettoyer les baskets blanches sans les abimer",
    metaDescriptionFr: "Guide complet pour nettoyer les baskets blanches sans dommage.",
    focusKeyphraseFr: "nettoyer baskets blanches",
  },
  {
    slug: "leather-shoe-care-complete-guide",
    title: "Leather Shoe Care: A Complete Guide",
    excerpt: "Properly cared-for leather shoes can last decades. Here's how to make yours join the collection.",
    content: `<p>Quality leather shoes are an investment. With proper care, dress shoes can last 15-20 years. Casual leather sneakers can last 5-8. Skip the care, and even the finest leather cracks within a couple years.</p>
<h2>Understanding leather</h2>
<p>Leather is skin. It needs moisture, protection, and rest. Full-grain leather (highest quality) responds best to care. Corrected-grain and bonded leather have plastic coatings that limit what care can do.</p>
<h2>Daily care routine</h2>
<p>After each wear: use a horsehair brush to remove surface dust. Wipe with a soft cloth if needed. Use shoe trees to maintain shape and absorb moisture from your feet. This alone doubles shoe life.</p>
<h2>Weekly care</h2>
<p>Once a week, brush thoroughly. Check for scuffs and address them promptly with matching polish. Small scuffs left alone become permanent marks that never fully come out.</p>
<h2>Monthly conditioning</h2>
<p>Every 4-6 weeks, apply leather conditioner. Use a cloth to work it into the leather in small circles. Let it absorb for 15 minutes, then buff with a soft cloth. This prevents the drying that leads to cracking.</p>
<h2>Polishing for shine</h2>
<p>For dress shoes, apply cream polish (not wax) once monthly. Use a small horsehair brush to spread it evenly. Let dry for 15 minutes, then buff hard with a chamois cloth. For a mirror shine, add wax polish over the cream.</p>
<h2>Protecting from weather</h2>
<p>Apply waterproofing spray before wearing new shoes for the first time. Reapply every few months. In salt-treated winter cities, wipe shoes down immediately after coming inside - salt kills leather faster than water.</p>
<h2>Rotation is critical</h2>
<p>Never wear the same shoes two days in a row. Leather needs 24 hours to fully dry from foot moisture. Rotating 2-3 pairs extends each pair's life by 3-5x.</p>
<h2>Handling damage</h2>
<p>Scuffs: brush and polish. Scratches: leather cream and buffing. Water spots: apply water evenly over affected area, let dry naturally. Cracks: nothing fully fixes them - prevention is everything.</p>
<h2>Storage</h2>
<p>Cedar shoe trees when not worn. Dust bags for long-term storage. Never leave in direct sunlight, near heaters, or in humid basements. Room temperature and low humidity are ideal.</p>`,
    titleFr: "Soin des chaussures en cuir : guide complet",
    excerptFr: "Bien entretenues, les chaussures en cuir peuvent durer des decennies.",
    contentFr: `<p>Les chaussures en cuir de qualite sont un investissement. Avec des soins appropries, les chaussures habillees peuvent durer 15-20 ans.</p>
<h2>Comprendre le cuir</h2>
<p>Le cuir est de la peau. Il a besoin d'humidite, de protection et de repos.</p>
<h2>Routine de soin quotidienne</h2>
<p>Apres chaque port : utilisez une brosse en crin de cheval. Utilisez des embauchoirs pour maintenir la forme.</p>
<h2>Soins hebdomadaires</h2>
<p>Une fois par semaine, brossez soigneusement. Verifiez les marques et adressez-les rapidement.</p>
<h2>Conditionnement mensuel</h2>
<p>Toutes les 4-6 semaines, appliquez un conditionneur de cuir.</p>
<h2>Polissage pour la brillance</h2>
<p>Pour les chaussures habillees, appliquez une creme cirage (pas de la cire) une fois par mois.</p>
<h2>Protection contre les intemperies</h2>
<p>Appliquez un spray impermeabilisant avant de porter les nouvelles chaussures pour la premiere fois.</p>
<h2>La rotation est critique</h2>
<p>Ne portez jamais les memes chaussures deux jours de suite. Le cuir a besoin de 24 heures pour secher.</p>
<h2>Stockage</h2>
<p>Embauchoirs en cedre quand non portees. Sacs a poussiere pour le stockage long terme.</p>`,
    coverImage: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=1200&q=80",
    category: "care-guides",
    tags: ["leather", "care", "polish", "maintenance"],
    tagsFr: ["cuir", "entretien", "cirage", "soin"],
    seoTitle: "Leather Shoe Care Complete Guide - Make Them Last",
    metaDescription: "Learn the complete leather shoe care routine. Brushing, conditioning, polishing, and rotation techniques to make shoes last decades.",
    focusKeyphrase: "leather shoe care",
    seoTitleFr: "Soin chaussures cuir - Guide complet",
    metaDescriptionFr: "Apprenez la routine complete d'entretien des chaussures en cuir.",
    focusKeyphraseFr: "soin chaussures cuir",
  },
  {
    slug: "store-shoes-make-them-last",
    title: "How to Store Your Shoes to Make Them Last Longer",
    excerpt: "Improper storage destroys more shoes than actual wear. Here's how to store them properly.",
    content: `<p>Storage is the most neglected aspect of shoe care. A pair worn twice and thrown in a pile deteriorates faster than a pair worn regularly but stored correctly.</p>
<h2>Why storage matters so much</h2>
<p>Shoes not being worn still absorb moisture from the air, warp under their own weight, gather dust that dries out materials, and can develop mold in humid conditions. All of these damage shoes silently.</p>
<h2>The essentials</h2>
<p>Shoe trees for every pair worth keeping. Dust bags for less-used shoes. Boxes or shelves that keep shoes upright. Climate control to prevent extreme temperature or humidity swings.</p>
<h2>Shoe trees: your most important investment</h2>
<p>Cedar trees are ideal - they absorb moisture and repel insects. Insert them within 30 minutes of removing the shoe while it's still warm. Leave them in for at least 8 hours. For dress shoes, leave them in permanently.</p>
<h2>Dust bags for long-term storage</h2>
<p>If you're not wearing a pair for months, put them in a cotton dust bag. This prevents dust accumulation and light exposure while allowing airflow. Never use plastic bags - they trap moisture and create mold.</p>
<h2>Storage position</h2>
<p>Store shoes flat on a shelf, not stacked. Don't hang them by the laces. Keep pairs together but not touching, to allow air circulation. Rotate stored shoes seasonally to prevent one side from getting flat.</p>
<h2>Climate considerations</h2>
<p>Ideal: 65-75F (18-24C) and 40-60% humidity. Too dry: leather cracks. Too humid: mold grows. Avoid attics (too hot), basements (too humid), and closets against exterior walls (temperature swings).</p>
<h2>Seasonal rotation</h2>
<p>Store off-season shoes in dust bags with cedar chips. When bringing them out, condition leather pairs, brush suede, and check for any damage that developed. Handle everything before wearing again.</p>
<h2>The rotation principle</h2>
<p>Even with proper storage, shoes need to be worn to stay alive. Every pair in your collection should get wear at least once a month. Anything you haven't worn in a year is probably not worth keeping.</p>
<h2>Emergency situations</h2>
<p>Flood or water damage: dry shoes with paper towels, stuff with more paper, let dry slowly at room temperature. Never use heat. If mold appears: mix white vinegar and water 1:1, wipe affected areas, let dry in shade.</p>`,
    titleFr: "Comment ranger vos chaussures pour qu'elles durent",
    excerptFr: "Un mauvais rangement detruit plus de chaussures que l'usure reelle.",
    contentFr: `<p>Le rangement est l'aspect le plus neglige du soin des chaussures. Une paire portee deux fois et jetee dans un tas se deteriore plus vite qu'une paire portee regulierement mais rangee correctement.</p>
<h2>Pourquoi le rangement est si important</h2>
<p>Les chaussures non portees absorbent toujours l'humidite de l'air, se deforment sous leur propre poids.</p>
<h2>Les essentiels</h2>
<p>Embauchoirs pour chaque paire qui merite d'etre conservee. Sacs a poussiere pour les chaussures moins utilisees.</p>
<h2>Embauchoirs : votre investissement le plus important</h2>
<p>Les embauchoirs en cedre sont ideaux - ils absorbent l'humidite et repoussent les insectes.</p>
<h2>Sacs a poussiere pour le stockage long terme</h2>
<p>Si vous ne portez pas une paire pendant des mois, mettez-la dans un sac a poussiere en coton.</p>
<h2>Position de rangement</h2>
<p>Rangez les chaussures a plat sur une etagere, pas empilees. Ne les suspendez pas par les lacets.</p>
<h2>Considerations climatiques</h2>
<p>Ideal : 18-24C et 40-60% d'humidite. Trop sec : le cuir craque. Trop humide : les moisissures poussent.</p>
<h2>Rotation saisonniere</h2>
<p>Rangez les chaussures hors saison dans des sacs a poussiere avec des copeaux de cedre.</p>
<h2>Le principe de rotation</h2>
<p>Meme avec un rangement approprie, les chaussures doivent etre portees pour rester vivantes.</p>`,
    coverImage: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=1200&q=80",
    category: "care-guides",
    tags: ["storage", "care", "shoe-trees", "organization"],
    tagsFr: ["rangement", "entretien", "embauchoirs", "organisation"],
    seoTitle: "How to Store Shoes Properly - Make Them Last Longer",
    metaDescription: "Learn proper shoe storage techniques. Shoe trees, dust bags, climate control, and rotation to extend shoe life dramatically.",
    focusKeyphrase: "store shoes properly",
    seoTitleFr: "Ranger les chaussures - Faites-les durer",
    metaDescriptionFr: "Apprenez les bonnes techniques de rangement des chaussures.",
    focusKeyphraseFr: "ranger chaussures",
  },
  {
    slug: "waterproofing-shoes-what-works",
    title: "Waterproofing Your Shoes: What Actually Works",
    excerpt: "Not all waterproofing products deliver on their promises. Here's what actually keeps feet dry.",
    content: `<p>Wet feet ruin days. Wet shoes ruin themselves. Effective waterproofing is essential for anyone in wet climates, but the market is flooded with products that barely work.</p>
<h2>How waterproofing works</h2>
<p>Waterproofing products either seal the outer surface (impregnation) or create a repellent coating (durable water repellent, or DWR). Neither is truly permanent - all treatments wear off with use and need reapplication.</p>
<h2>Best waterproofing sprays</h2>
<p>Nikwax TX.Direct: excellent for technical materials like Gore-Tex. Doesn't affect breathability. Grangers Performance Repel Plus: similar performance, wide availability. Kiwi Camp Dry: budget option that works well for casual footwear.</p>
<h2>Waxes for leather</h2>
<p>Sno-Seal beeswax: legendary among hikers, creates thick water barrier. Darkens leather significantly. Otter Wax: silicone-free, less darkening. Better for dress boots. Apply, let sit, buff off excess.</p>
<h2>Silicone sprays: use with caution</h2>
<p>Silicone-based sprays like Kiwi Protect All work fast but can damage leather over time and eliminate breathability. Fine for canvas and synthetic shoes. Avoid on premium leather.</p>
<h2>What about Gore-Tex?</h2>
<p>Shoes with built-in Gore-Tex membranes are naturally waterproof. The membrane stops water but allows sweat to escape. Still, treat the exterior with DWR spray - once water saturates the outer layer, feet feel cold even if they stay dry.</p>
<h2>Application technique</h2>
<p>Clean shoes thoroughly first. Apply in a well-ventilated area. Multiple thin coats work better than one thick coat. Let fully dry between coats (usually 4-6 hours). Wait 24 hours before wearing.</p>
<h2>Reapplication schedule</h2>
<p>Every 4-8 weeks for daily-wear shoes. After every 5-10 wet exposures. Whenever water stops beading on the surface. Suede needs more frequent treatment than leather.</p>
<h2>Testing effectiveness</h2>
<p>Drop water on the shoe. If it beads and rolls off, waterproofing is working. If it soaks in or leaves dark spots, reapply. This test should be done monthly regardless.</p>
<h2>What waterproofing cannot do</h2>
<p>No treatment makes non-waterproof shoes truly waterproof. If you'll be walking through significant water, buy actual waterproof boots. Treatments prevent light rain damage - they don't survive puddles.</p>`,
    titleFr: "Impermeabiliser vos chaussures : ce qui marche vraiment",
    excerptFr: "Tous les produits d'impermeabilisation ne tiennent pas leurs promesses.",
    contentFr: `<p>Les pieds mouilles ruinent les journees. Les chaussures mouillees se ruinent elles-memes.</p>
<h2>Comment l'impermeabilisation fonctionne</h2>
<p>Les produits d'impermeabilisation scellent la surface exterieure ou creent un revetement repellent.</p>
<h2>Meilleurs sprays impermeabilisants</h2>
<p>Nikwax TX.Direct : excellent pour les materiaux techniques comme Gore-Tex. Grangers Performance Repel Plus : performance similaire.</p>
<h2>Cires pour le cuir</h2>
<p>Sno-Seal cire d'abeille : legendaire chez les randonneurs. Cire d'otter : sans silicone, moins d'assombrissement.</p>
<h2>Sprays au silicone : a utiliser avec precaution</h2>
<p>Les sprays a base de silicone fonctionnent vite mais peuvent endommager le cuir avec le temps.</p>
<h2>Et le Gore-Tex ?</h2>
<p>Les chaussures avec des membranes Gore-Tex integrees sont naturellement impermeables.</p>
<h2>Technique d'application</h2>
<p>Nettoyez d'abord les chaussures a fond. Appliquez dans un endroit bien ventile.</p>
<h2>Calendrier de reapplication</h2>
<p>Toutes les 4-8 semaines pour les chaussures de tous les jours.</p>
<h2>Ce que l'impermeabilisation ne peut pas faire</h2>
<p>Aucun traitement ne rend les chaussures vraiment impermeables si elles ne le sont pas conçues pour l'etre.</p>`,
    coverImage: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&q=80",
    category: "care-guides",
    tags: ["waterproofing", "care", "weather", "protection"],
    tagsFr: ["impermeabilisation", "entretien", "meteo", "protection"],
    seoTitle: "Waterproofing Shoes: What Actually Works",
    metaDescription: "Complete guide to waterproofing shoes. Which sprays, waxes, and treatments actually keep feet dry in wet weather.",
    focusKeyphrase: "waterproofing shoes",
    seoTitleFr: "Impermeabiliser chaussures - Ce qui marche",
    metaDescriptionFr: "Guide complet pour impermeabiliser les chaussures.",
    focusKeyphraseFr: "impermeabiliser chaussures",
  },
  {
    slug: "find-perfect-shoe-size-online",
    title: "How to Find Your Perfect Shoe Size Online",
    excerpt: "Online shoe shopping is a size guessing game. These techniques get it right every time.",
    content: `<p>Ordering shoes online has become normal, but getting the right size still feels like gambling. Different brands size differently. Different shoe styles fit differently. Here's how to buy with confidence.</p>
<h2>Measure your feet properly</h2>
<p>Stand on paper with your full weight, trace your foot outline. Measure heel to longest toe. Measure both feet - most people have one foot slightly larger. Always size to the larger foot.</p>
<h2>Convert to brand-specific sizing</h2>
<p>Never assume your "size" is universal. Nike, Adidas, and New Balance all use different size scales. Check each brand's size guide against your actual foot measurement in centimeters.</p>
<h2>Read reviews for fit intelligence</h2>
<p>Product reviews reveal fit patterns. Look for phrases like "runs small," "runs large," "true to size." When 30% of reviewers say "size up half," believe them.</p>
<h2>Check width considerations</h2>
<p>American brands often assume medium (D) width. If you have wide or narrow feet, buy from brands offering width options: New Balance, Brooks, Rockport. Otherwise, expect fit issues.</p>
<h2>Different shoe types fit differently</h2>
<p>Running shoes typically fit true to size with room in toe box. Dress shoes fit closer, requiring precise sizing. Boots vary wildly - always check specific model reviews.</p>
<h2>Time of day matters</h2>
<p>Feet swell throughout the day. Measure in the evening for best accuracy. Order half size up if you'll wear the shoes primarily later in the day or during exercise.</p>
<h2>The return policy is critical</h2>
<p>Only buy from retailers with free returns. Try shoes on immediately when they arrive. Wear them on carpet indoors to preserve returnability. Have alternate size ready to reorder if needed.</p>
<h2>International sizing pitfalls</h2>
<p>US, UK, EU, and Japanese sizes all use different scales. A US 10 is a UK 9, EU 44, JP 28. Always look for the CM measurement - it's the only truly universal number.</p>
<h2>Fit tests when they arrive</h2>
<p>You should be able to wiggle toes freely. Your heel shouldn't slip when walking. No pinching anywhere. If shoes feel snug at first, they usually stay snug - break-in doesn't fix true size problems.</p>
<h2>Common mistakes to avoid</h2>
<p>Trusting your usual size across brands. Buying without checking reviews. Ordering when you're between sizes without ordering both. Rushing the try-on process.</p>`,
    titleFr: "Comment trouver votre pointure parfaite en ligne",
    excerptFr: "L'achat de chaussures en ligne est un jeu de devinettes.",
    contentFr: `<p>Commander des chaussures en ligne est devenu normal, mais obtenir la bonne taille ressemble toujours a du hasard.</p>
<h2>Mesurez vos pieds correctement</h2>
<p>Tenez-vous sur du papier avec tout votre poids, tracez le contour du pied.</p>
<h2>Convertissez en pointures specifiques a la marque</h2>
<p>Ne supposez jamais que votre "pointure" est universelle. Nike, Adidas et New Balance utilisent des echelles differentes.</p>
<h2>Lisez les avis pour connaitre la coupe</h2>
<p>Les avis produits revelent les tendances de coupe.</p>
<h2>Considerez la largeur</h2>
<p>Les marques americaines supposent souvent une largeur moyenne (D).</p>
<h2>Les differents types de chaussures se portent differemment</h2>
<p>Les chaussures de course taillent generalement conformement avec de l'espace dans l'orteil.</p>
<h2>L'heure de la journee compte</h2>
<p>Les pieds gonflent tout au long de la journee. Mesurez le soir pour plus de precision.</p>
<h2>La politique de retour est critique</h2>
<p>N'achetez que chez les detaillants avec retours gratuits.</p>
<h2>Pieges de tailles internationales</h2>
<p>US, UK, EU et pointures japonaises utilisent toutes des echelles differentes.</p>`,
    coverImage: "https://images.unsplash.com/photo-1449505078894-c7859f8ea1a3?w=1200&q=80",
    category: "buying-guides",
    tags: ["sizing", "online", "buying", "fit"],
    tagsFr: ["pointure", "en-ligne", "achat", "coupe"],
    seoTitle: "How to Find Perfect Shoe Size Online",
    metaDescription: "Master online shoe sizing. Learn measurement techniques, brand differences, and review patterns to buy with confidence.",
    focusKeyphrase: "shoe size online",
    seoTitleFr: "Trouver votre pointure parfaite en ligne",
    metaDescriptionFr: "Maitrisez les tailles de chaussures en ligne.",
    focusKeyphraseFr: "pointure chaussures en ligne",
  },
  {
    slug: "choose-running-shoe-foot-type",
    title: "Choosing the Right Running Shoe for Your Foot Type",
    excerpt: "Running shoes aren't universal. Your foot type determines which category will actually help you.",
    content: `<p>The right running shoe prevents injuries and improves performance. The wrong one causes both. Understanding your foot type is the foundation of choosing correctly.</p>
<h2>Determine your foot type</h2>
<p>Wet foot test: wet your foot, step on paper, examine the print. High arch: narrow print connecting heel to ball. Neutral: moderate print with clear arch. Flat: nearly full outline of your foot.</p>
<h2>Understanding pronation</h2>
<p>Pronation is how your foot rolls inward when landing. Overpronation (excessive inward roll) usually accompanies flat feet. Underpronation/supination (rolling outward) accompanies high arches. Neutral pronation is ideal.</p>
<h2>Neutral runners</h2>
<p>If you have normal arches and neutral pronation, choose neutral cushioned shoes. Nike Pegasus, Brooks Ghost, Saucony Ride. These provide balanced cushioning without artificial motion control.</p>
<h2>Overpronators need stability</h2>
<p>Flat-footed runners need stability shoes. These have firmer medial (inside) foam to prevent excessive rolling. Brooks Adrenaline, Asics Kayano, Saucony Guide. Motion control shoes offer maximum stability.</p>
<h2>High-arch runners need cushioning</h2>
<p>Supinators need maximum cushioning with flexibility. Rigid shoes worsen the problem. Look for well-cushioned neutral shoes: Hoka Clifton, New Balance Fresh Foam 1080.</p>
<h2>Foot width matters</h2>
<p>Wide feet in narrow shoes cause blisters and pain. New Balance offers 2E and 4E widths. Brooks and Saucony have wide options in most models. Try before committing.</p>
<h2>Body weight consideration</h2>
<p>Heavier runners need more cushioning and firmer support. Elite carbon-plate racing shoes designed for 130lb runners won't perform for 200lb runners. Choose appropriately.</p>
<h2>Your running style</h2>
<p>Heel strikers need cushioned heels. Midfoot strikers need balanced cushioning throughout. Forefoot strikers need forefoot cushioning. Modern running shoes are typically designed for one or the other.</p>
<h2>When to consider gait analysis</h2>
<p>Specialty running stores offer free gait analysis. They watch you run and recommend appropriate shoes. Take advantage - the professional assessment often reveals what self-diagnosis misses.</p>
<h2>Replacement schedule</h2>
<p>Running shoes lose cushioning by 300-500 miles. Track your mileage and replace before shoes cause pain. Old shoes destroy the injury prevention they were supposed to provide.</p>`,
    titleFr: "Choisir la bonne chaussure de course pour votre type de pied",
    excerptFr: "Les chaussures de course ne sont pas universelles. Votre type de pied determine la categorie qui vous aide reellement.",
    contentFr: `<p>La bonne chaussure de course previent les blessures et ameliore les performances. La mauvaise cause les deux.</p>
<h2>Determinez votre type de pied</h2>
<p>Test du pied mouille : mouillez votre pied, marchez sur du papier, examinez l'empreinte.</p>
<h2>Comprendre la pronation</h2>
<p>La pronation est la facon dont votre pied roule vers l'interieur en atterrissant.</p>
<h2>Coureurs neutres</h2>
<p>Si vous avez des voutes normales et une pronation neutre, choisissez des chaussures neutres amorties.</p>
<h2>Les hyperpronateurs ont besoin de stabilite</h2>
<p>Les coureurs aux pieds plats ont besoin de chaussures de stabilite.</p>
<h2>Les coureurs a voute haute ont besoin d'amorti</h2>
<p>Les supinateurs ont besoin d'un amorti maximum avec flexibilite.</p>
<h2>La largeur du pied compte</h2>
<p>Les pieds larges dans des chaussures etroites causent des ampoules.</p>
<h2>Considerez votre poids</h2>
<p>Les coureurs plus lourds ont besoin de plus d'amorti.</p>
<h2>Quand envisager une analyse de foulee</h2>
<p>Les magasins de course specialises offrent une analyse gratuite de la foulee.</p>`,
    coverImage: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1200&q=80",
    category: "buying-guides",
    tags: ["running", "sizing", "pronation", "buying"],
    tagsFr: ["course", "pointure", "pronation", "achat"],
    seoTitle: "Right Running Shoe for Your Foot Type - Complete Guide",
    metaDescription: "Choose the perfect running shoe for your foot type. Learn about pronation, arch types, and body weight considerations.",
    focusKeyphrase: "running shoe foot type",
    seoTitleFr: "Chaussure de course pour votre type de pied",
    metaDescriptionFr: "Choisissez la chaussure de course parfaite pour votre type de pied.",
    focusKeyphraseFr: "chaussure course type pied",
  },
  {
    slug: "investment-sneakers-hold-value",
    title: "Investment Sneakers: Which Pairs Hold Their Value",
    excerpt: "Some sneakers appreciate over time. Others depreciate the moment you leave the store.",
    content: `<p>Sneakers can be investments. Some pairs increase 300-500% over their retail price within a year. Others become worthless the moment they're released. Knowing the difference matters if you buy strategically.</p>
<h2>What makes a sneaker hold value</h2>
<p>Genuine scarcity (not artificial hype), cultural significance, iconic design status, and continued demand from a passionate collector base. Marketing budget doesn't create long-term value; genuine desire does.</p>
<h2>Blue-chip investment sneakers</h2>
<p>Air Jordan 1 (specifically OG colorways like Bred, Royal, Shadow). Nike Dunk Low (Panda and university colorways). Air Jordan 4 Retros. New Balance 990 series in premium colorways. These consistently hold or increase value.</p>
<h2>Limited collaborations that appreciate</h2>
<p>Travis Scott Jordan collaborations. Fragment collaborations. Off-White x Nike (particularly early 2018-2020 releases). Yeezy Boost 350 v1 (the original). These have historic collector value.</p>
<h2>Regular retros with predictable resale</h2>
<p>Standard Jordan retro releases in classic colorways typically sell 20-40% above retail. Not spectacular but consistent. Buy at retail through SNKRS, sell within 3-6 months for reliable modest profit.</p>
<h2>What loses value fast</h2>
<p>General release Air Force 1s (except limited collabs). Standard Nike running shoes. Any shoe with obvious "trying too hard" marketing. Colorways in wild, unwearable combinations.</p>
<h2>Deadstock vs worn</h2>
<p>Deadstock (never worn, tags on, original box) commands 100-300% more than lightly worn same shoe. Investment strategy requires keeping shoes unworn. Wearing them is the enjoyment; storing them is the profit.</p>
<h2>The authentication issue</h2>
<p>Fakes flood the resale market. Buy from authenticated marketplaces (GOAT, StockX, Stadium Goods) or take your risk. Authentic Jordan 1s in premium colorways are one of the most-faked shoes on the planet.</p>
<h2>Storage for investment pairs</h2>
<p>Original boxes and tags increase value dramatically. Store in cool, dry places away from sunlight. Silica gel packets absorb moisture. Never bend the box or damage packaging.</p>
<h2>When to sell</h2>
<p>Watch resale prices closely. Values often peak 3-12 months after release, then decline as excitement fades. Iconic silhouettes can appreciate for years, but most releases have a specific resale window.</p>
<h2>Reality check</h2>
<p>Most sneakers don't appreciate. Most collectors don't make money. The exceptions get famous, but they're exceptions. Buy sneakers primarily to enjoy wearing them - occasional appreciation is a bonus.</p>`,
    titleFr: "Baskets d'investissement : lesquelles conservent leur valeur",
    excerptFr: "Certaines baskets prennent de la valeur avec le temps. D'autres se deprecient a l'instant meme ou vous quittez le magasin.",
    contentFr: `<p>Les baskets peuvent etre des investissements. Certaines paires augmentent de 300-500% par rapport a leur prix de detail en un an.</p>
<h2>Ce qui fait qu'une basket conserve sa valeur</h2>
<p>Rarete authentique, signification culturelle, statut de design iconique et demande continue.</p>
<h2>Baskets d'investissement blue-chip</h2>
<p>Air Jordan 1 (specifiquement les coloris OG comme Bred, Royal, Shadow). Nike Dunk Low.</p>
<h2>Collaborations limitees qui prennent de la valeur</h2>
<p>Collaborations Travis Scott Jordan. Collaborations Fragment. Off-White x Nike.</p>
<h2>Retros reguliers avec revente previsible</h2>
<p>Les sorties standards de Jordan retro dans les coloris classiques se vendent generalement 20-40% au-dessus du detail.</p>
<h2>Ce qui perd de la valeur rapidement</h2>
<p>Air Force 1 de sortie generale (sauf collaborations limitees).</p>
<h2>Deadstock vs porte</h2>
<p>Deadstock (jamais portees, avec etiquettes, boite d'origine) commande 100-300% de plus.</p>
<h2>Le probleme d'authentification</h2>
<p>Les faux inondent le marche de la revente.</p>
<h2>Verite face a la realite</h2>
<p>La plupart des baskets ne prennent pas de valeur.</p>`,
    coverImage: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=80",
    category: "buying-guides",
    tags: ["investment", "collecting", "resale", "value"],
    tagsFr: ["investissement", "collection", "revente", "valeur"],
    seoTitle: "Investment Sneakers - Which Pairs Hold Value",
    metaDescription: "Which sneakers actually appreciate in value? Complete guide to blue-chip pairs, limited collaborations, and resale strategy.",
    focusKeyphrase: "investment sneakers value",
    seoTitleFr: "Baskets d'investissement - Lesquelles conservent leur valeur",
    metaDescriptionFr: "Quelles baskets prennent vraiment de la valeur ?",
    focusKeyphraseFr: "baskets investissement valeur",
  },
  {
    slug: "complete-history-of-nike",
    title: "The Complete History of Nike",
    excerpt: "From selling shoes out of a car trunk to global dominance. The Nike story is one of the most remarkable in business history.",
    content: `<p>Nike is one of the most valuable brands in the world, but it started as two people selling running shoes at track meets from a car. This is how a small operation became a global empire.</p>
<h2>The beginning: Blue Ribbon Sports</h2>
<p>In 1964, University of Oregon track coach Bill Bowerman and business student Phil Knight founded Blue Ribbon Sports. They imported Japanese Onitsuka Tiger running shoes and sold them at track meets. First year revenue: $8,000.</p>
<h2>The waffle iron moment</h2>
<p>In 1971, Bowerman poured rubber into his wife's waffle iron, creating a new sole design that gave runners more traction and cushioning. This became the Nike Waffle Trainer, which established the young brand's design credentials.</p>
<h2>The Nike name and swoosh</h2>
<p>Also in 1971, they needed their own brand. Named after the Greek goddess of victory, "Nike" was created. Graphic design student Carolyn Davidson designed the swoosh logo for $35. It's now valued at billions.</p>
<h2>Air Force 1 and basketball dominance</h2>
<p>1982's Air Force 1, designed by Bruce Kilgore, introduced Nike's Air technology. But it was signing Michael Jordan in 1984 that transformed the brand. The Air Jordan 1 broke NBA uniform rules, was fined every game, and became the most iconic sneaker ever released.</p>
<h2>The Just Do It era</h2>
<p>1988's "Just Do It" campaign redefined athletic marketing. Simple, powerful, universal. Combined with iconic athlete endorsements, Nike transitioned from a shoe company to a lifestyle brand.</p>
<h2>Sweatshop controversies</h2>
<p>The 1990s brought scandals about labor conditions in Asian factories. Nike's response, including introducing labor standards and third-party audits, became a case study in corporate reform.</p>
<h2>Innovation eras</h2>
<p>Air Max, Shox, Flywire, Flyknit, Vaporfly. Each represents a leap in athletic footwear technology. The Vaporfly, in particular, disrupted professional running so dramatically that governing bodies debated banning it.</p>
<h2>Cultural collaborations</h2>
<p>Nike x Off-White. Nike x Travis Scott. Nike x Sacai. High-fashion collaborations transformed sneakers from athletic equipment to luxury goods and art collectibles.</p>
<h2>The present and future</h2>
<p>Today Nike is worth over $200 billion. They dominate athletic footwear, are pushing sustainability, embracing direct-to-consumer sales, and continuing to define sneaker culture globally.</p>
<h2>Lessons from the story</h2>
<p>Innovation matters. Athlete partnerships built the brand. Cultural relevance kept it dominant. And it started with two people who genuinely loved running.</p>`,
    titleFr: "L'histoire complete de Nike",
    excerptFr: "De la vente de chaussures depuis un coffre de voiture a la domination mondiale.",
    contentFr: `<p>Nike est l'une des marques les plus precieuses au monde, mais elle a commence comme deux personnes vendant des chaussures de course a partir d'une voiture.</p>
<h2>Le debut : Blue Ribbon Sports</h2>
<p>En 1964, l'entraineur d'athletisme Bill Bowerman et l'etudiant Phil Knight ont fonde Blue Ribbon Sports.</p>
<h2>Le moment du gaufrier</h2>
<p>En 1971, Bowerman a verse du caoutchouc dans le gaufrier de sa femme.</p>
<h2>Le nom Nike et le swoosh</h2>
<p>Nomme d'apres la deesse grecque de la victoire, "Nike" a ete cree en 1971.</p>
<h2>Air Force 1 et domination du basketball</h2>
<p>L'Air Force 1 de 1982 a introduit la technologie Air de Nike.</p>
<h2>L'ere Just Do It</h2>
<p>La campagne "Just Do It" de 1988 a redefini le marketing sportif.</p>
<h2>Controverses des ateliers clandestins</h2>
<p>Les annees 1990 ont apporte des scandales sur les conditions de travail dans les usines asiatiques.</p>
<h2>Eres d'innovation</h2>
<p>Air Max, Shox, Flywire, Flyknit, Vaporfly.</p>
<h2>Collaborations culturelles</h2>
<p>Nike x Off-White. Nike x Travis Scott.</p>
<h2>Le present et l'avenir</h2>
<p>Aujourd'hui Nike vaut plus de 200 milliards de dollars.</p>`,
    coverImage: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=80",
    category: "brand-stories",
    tags: ["nike", "history", "brand", "iconic"],
    tagsFr: ["nike", "histoire", "marque", "iconique"],
    seoTitle: "The Complete History of Nike - From Car Trunk to Empire",
    metaDescription: "The complete Nike history: from selling Onitsuka Tigers from a car trunk to becoming the world's most iconic athletic brand.",
    focusKeyphrase: "nike history",
    seoTitleFr: "Histoire complete de Nike - Du coffre de voiture a l'empire",
    metaDescriptionFr: "L'histoire complete de Nike.",
    focusKeyphraseFr: "histoire nike",
  },
  {
    slug: "adidas-streetwear-icon",
    title: "How Adidas Became a Streetwear Icon",
    excerpt: "The German sports brand's journey from soccer specialist to streetwear royalty.",
    content: `<p>Adidas has spent decades defining what streetwear looks like. From Run-DMC's endorsement to Kanye's Yeezys, the three stripes have consistently sat at the intersection of sport and style.</p>
<h2>Founding roots</h2>
<p>Founded in 1949 by Adolf "Adi" Dassler in Germany after splitting from his brother Rudolf (who started Puma), Adidas was purely a sports company. Making better shoes for athletes was the singular mission.</p>
<h2>Early cultural moments</h2>
<p>The Adidas Superstar debuted in 1969 as a basketball shoe. It became a hit among NBA players and remained popular through the 1970s. Nothing about it suggested future cultural significance.</p>
<h2>My Adidas moment</h2>
<p>In 1986, Run-DMC released "My Adidas," a hip-hop track celebrating the Superstar sneaker. This was unprompted, organic love from a genre that had rejected corporate sports culture. Adidas paid attention.</p>
<h2>The endorsement that changed marketing</h2>
<p>Adidas signed Run-DMC to a $1.5 million endorsement deal - the first non-athlete endorsement for the brand. This proved streetwear cred was commercially valuable, forever changing how sports brands marketed.</p>
<h2>Trefoil vs three stripes</h2>
<p>Adidas splits into two brands under the parent: Adidas Sport (three stripes, athletics focus) and Adidas Originals (trefoil, lifestyle focus). The trefoil manages the streetwear heritage.</p>
<h2>The Stan Smith renaissance</h2>
<p>Named after tennis player Stan Smith in 1971, this simple leather sneaker became one of the best-selling shoes ever. Multiple relaunches over the decades keep it relevant to new generations.</p>
<h2>Yeezy: the game changer</h2>
<p>Kanye West's partnership starting in 2013 transformed Adidas from strong second to Nike into a direct challenger for cultural relevance. Yeezys generated billions and defined mid-2010s sneaker style.</p>
<h2>The end of Yeezy</h2>
<p>Kanye's controversies led Adidas to end the partnership in 2022, resulting in massive financial losses. The brand had to rebuild without their signature streetwear icon.</p>
<h2>Sambas and Gazelles resurgence</h2>
<p>Post-Yeezy, Adidas leaned into their heritage silhouettes. Sambas and Gazelles became fashion darlings in 2023-2024, driven by Grace Wales Bonner collaborations and organic celebrity adoption.</p>
<h2>What's next</h2>
<p>Adidas continues balancing sports authenticity with streetwear cultural cachet. Football (soccer) partnerships remain central. Terrace culture (soccer hooligan fashion) continues driving colorway choices.</p>`,
    titleFr: "Comment Adidas est devenu une icone streetwear",
    excerptFr: "Le parcours de la marque allemande, de specialiste du football a la royaute du streetwear.",
    contentFr: `<p>Adidas a passe des decennies a definir ce a quoi ressemble le streetwear.</p>
<h2>Racines de fondation</h2>
<p>Fondee en 1949 par Adolf "Adi" Dassler en Allemagne.</p>
<h2>Moments culturels precoces</h2>
<p>La Superstar Adidas a fait ses debuts en 1969 comme chaussure de basketball.</p>
<h2>Le moment My Adidas</h2>
<p>En 1986, Run-DMC a sorti "My Adidas".</p>
<h2>Le sponsoring qui a change le marketing</h2>
<p>Adidas a signe Run-DMC pour un accord de 1,5 million de dollars.</p>
<h2>Yeezy : le changeur de jeu</h2>
<p>Le partenariat de Kanye West a partir de 2013 a transforme Adidas.</p>
<h2>La renaissance des Sambas et Gazelles</h2>
<p>Post-Yeezy, Adidas s'est appuye sur ses silhouettes patrimoniales.</p>
<h2>Ce qui vient ensuite</h2>
<p>Adidas continue d'equilibrer authenticite sportive et cachet culturel streetwear.</p>`,
    coverImage: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1200&q=80",
    category: "brand-stories",
    tags: ["adidas", "streetwear", "history", "brand"],
    tagsFr: ["adidas", "streetwear", "histoire", "marque"],
    seoTitle: "How Adidas Became a Streetwear Icon",
    metaDescription: "The Adidas story: from German sports brand to streetwear royalty. Run-DMC, Yeezy, Samba - the cultural journey.",
    focusKeyphrase: "adidas streetwear history",
    seoTitleFr: "Comment Adidas est devenu une icone streetwear",
    metaDescriptionFr: "L'histoire d'Adidas : de marque de sport allemande a royaute du streetwear.",
    focusKeyphraseFr: "adidas streetwear histoire",
  },
  {
    slug: "how-premium-sneakers-are-made",
    title: "Behind the Scenes: How Premium Sneakers Are Made",
    excerpt: "From design sketch to finished pair, premium sneaker production involves hundreds of steps.",
    content: `<p>The sneaker on your foot went through more processes than you might imagine. Understanding how premium sneakers are made deepens appreciation for good pairs - and helps you spot cheap shortcuts.</p>
<h2>The design phase</h2>
<p>Everything starts with sketches. Designers create hundreds of concepts, refine promising ones digitally, then produce 3D renderings. Every curve is analyzed, materials are selected, colorways developed. The process takes 12-18 months for major releases.</p>
<h2>Prototype creation</h2>
<p>Physical prototypes are made by hand. Athletes test them extensively. Designs are refined, materials swapped, patterns adjusted. Most designs are killed at this stage - only strong concepts survive to production.</p>
<h2>Sourcing materials</h2>
<p>Premium leather from Italian or French tanneries. Technical fabrics from specialized mills. Rubber compounds developed for specific performance characteristics. High-end brands maintain relationships with suppliers spanning decades.</p>
<h2>Pattern cutting</h2>
<p>Patterns are created for each part of the shoe. Modern factories use computerized cutting to minimize waste. Premium production may still use hand-cutting for certain parts, ensuring the best material sections are used.</p>
<h2>The uppers assembly</h2>
<p>Individual pieces are stitched together to form the upper. This requires skilled sewing operators. A quality upper can involve 40-60 individual pieces of material joined with precision stitching. Each seam must be exact.</p>
<h2>Lasting</h2>
<p>The upper is stretched over a foot-shaped mold (last) and bonded to the insole. This defines the shoe's final shape. Premium shoes may be lasted by hand; mass-produced shoes use machinery.</p>
<h2>Sole attachment</h2>
<p>The outsole is either cemented, welted, or stitched to the upper. Welt construction (used in premium dress shoes and boots) allows resoling and lasts decades. Cement construction is cheaper but limits repairability.</p>
<h2>Finishing touches</h2>
<p>Insoles inserted, laces threaded, tags attached, boxes packed. Quality control checks catch defects. Premium shoes get individual inspection; mass-produced shoes get random sampling.</p>
<h2>The craftsmanship difference</h2>
<p>Premium sneakers use better materials, more careful construction, and more human quality control. A $200 sneaker might cost $50 to produce. A $50 sneaker might cost $8. The difference shows in longevity, comfort, and how the shoes wear over time.</p>
<h2>Why quality matters</h2>
<p>Cheap shoes cost more per year of wear. A well-made $250 pair worn for 5 years costs $50/year. A cheap $70 pair replaced every year costs $70/year and never delivers the comfort or style of the premium option.</p>`,
    titleFr: "Dans les coulisses : comment les baskets premium sont fabriquees",
    excerptFr: "Du croquis de conception a la paire finie, la production de baskets premium implique des centaines d'etapes.",
    contentFr: `<p>La basket sur votre pied a subi plus de processus que vous ne le pensez.</p>
<h2>La phase de conception</h2>
<p>Tout commence par des croquis. Les designers creent des centaines de concepts.</p>
<h2>Creation de prototypes</h2>
<p>Des prototypes physiques sont fabriques a la main.</p>
<h2>Approvisionnement en materiaux</h2>
<p>Cuir premium des tanneries italiennes ou francaises.</p>
<h2>Coupe des patrons</h2>
<p>Les patrons sont crees pour chaque partie de la chaussure.</p>
<h2>Assemblage des dessus</h2>
<p>Les pieces individuelles sont cousues ensemble pour former le dessus.</p>
<h2>Formage</h2>
<p>Le dessus est etire sur un moule en forme de pied.</p>
<h2>Fixation de la semelle</h2>
<p>La semelle exterieure est soit cimentee, soit cousue au dessus.</p>
<h2>Finitions</h2>
<p>Semelles interieures inserees, lacets enfiles, etiquettes fixees.</p>
<h2>La difference de savoir-faire</h2>
<p>Les baskets premium utilisent de meilleurs materiaux, une construction plus soignee.</p>
<h2>Pourquoi la qualite compte</h2>
<p>Les chaussures bon marche coutent plus cher par annee d'usure.</p>`,
    coverImage: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&q=80",
    category: "brand-stories",
    tags: ["manufacturing", "craftsmanship", "quality", "premium"],
    tagsFr: ["fabrication", "savoir-faire", "qualite", "premium"],
    seoTitle: "How Premium Sneakers Are Made - Behind the Scenes",
    metaDescription: "The complete premium sneaker manufacturing process. From design to production, understand what makes quality footwear.",
    focusKeyphrase: "how sneakers are made",
    seoTitleFr: "Comment les baskets premium sont fabriquees",
    metaDescriptionFr: "Le processus complet de fabrication des baskets premium.",
    focusKeyphraseFr: "comment les baskets sont fabriquees",
  },
];

function calcReadTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function GET() {
  try {
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
      message: `Seeded ${created} posts (${skipped} already existed). Your blog is now fully stocked with 20 posts!`,
      results,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}