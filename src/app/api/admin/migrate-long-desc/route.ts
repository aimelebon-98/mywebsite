import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

// Unicode decoder for French accents (safe through PowerShell)
function d(s: string): string {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// Rich long descriptions for all products - HTML formatted for Tiptap editor
const LONG_DESC: Record<string, { en: string; fr: string }> = {

  // ==================== SNEAKERS ====================

  "c80ce47b-dca5-43e0-8023-d34752ced1c4": {
    en: `<p>The Air Max Velocity represents the perfect fusion of athletic performance and street-ready style. Engineered for the modern lifestyle, these sneakers deliver premium comfort whether you are hitting the gym, running errands, or making a fashion statement on the city streets.</p>
<p><strong>Advanced Cushioning Technology</strong></p>
<p>At the heart of the Air Max Velocity lies our proprietary air cushioning system, strategically placed in the heel and forefoot to absorb impact and return energy with every stride. The dual-density foam midsole provides all-day comfort while maintaining the responsiveness serious athletes demand.</p>
<p><strong>Breathable Engineered Mesh Upper</strong></p>
<p>The upper is crafted from an engineered mesh that promotes airflow, keeping your feet cool and dry even during intense activity. Reinforced overlays at high-stress zones provide structural support without adding unnecessary weight, resulting in a shoe that feels barely there yet performs exceptionally.</p>
<p><strong>Versatile Design for Every Occasion</strong></p>
<p>Available in Black, White, and Red, the Air Max Velocity transitions seamlessly from your morning workout to weekend brunches. The clean silhouette pairs effortlessly with athletic wear, denim, or even chinos for a smart-casual look.</p>
<p><strong>Perfect For</strong></p>
<ul><li>Daily training and gym sessions</li><li>Long walks and casual jogging</li><li>Street style and everyday wear</li><li>Travel and standing for extended periods</li></ul>
<p><strong>Sizing & Care</strong></p>
<p>Available in sizes 7 through 12. We recommend ordering your standard athletic shoe size. To maintain the pristine appearance, wipe clean with a damp cloth and mild soap. Avoid machine washing to preserve the cushioning technology and mesh integrity.</p>
<p>Backed by NewDealZone quality assurance, every pair of Air Max Velocity sneakers comes with our 14-day satisfaction guarantee and free returns.</p>`,
    fr: d(`<p>Les Air Max Vitesse repr\\u00e9sentent la fusion parfaite entre performance athl\\u00e9tique et style urbain. Con\\u00e7ues pour le mode de vie moderne, ces baskets offrent un confort premium que vous alliez \\u00e0 la salle de sport, fassiez vos courses ou affirmiez votre style dans la rue.</p>
<p><strong>Technologie d\\u2019amorti avanc\\u00e9e</strong></p>
<p>Au c\\u0153ur des Air Max Vitesse se trouve notre syst\\u00e8me exclusif d\\u2019amorti \\u00e0 air, plac\\u00e9 strat\\u00e9giquement au talon et \\u00e0 l\\u2019avant-pied pour absorber les chocs et restituer l\\u2019\\u00e9nergie \\u00e0 chaque foul\\u00e9e. La semelle interm\\u00e9diaire en mousse \\u00e0 double densit\\u00e9 offre un confort tout au long de la journ\\u00e9e.</p>
<p><strong>Tige en mesh respirant</strong></p>
<p>La tige est fabriqu\\u00e9e dans un mesh technique qui favorise la circulation de l\\u2019air, gardant vos pieds au frais et au sec m\\u00eame lors d\\u2019activit\\u00e9s intenses. Des renforts synth\\u00e9tiques aux zones de forte contrainte apportent un soutien structurel sans ajouter de poids inutile.</p>
<p><strong>Design polyvalent pour toutes les occasions</strong></p>
<p>Disponibles en Noir, Blanc et Rouge, les Air Max Vitesse passent sans effort de votre entra\\u00eenement matinal aux brunchs du week-end. La silhouette \\u00e9pur\\u00e9e s\\u2019associe aussi bien \\u00e0 des tenues sport qu\\u2019\\u00e0 des jeans ou chinos pour un look smart casual.</p>
<p><strong>Parfaites pour</strong></p>
<ul><li>Entra\\u00eenement quotidien et salle de sport</li><li>Longues marches et jogging occasionnel</li><li>Style urbain et port quotidien</li><li>Voyages et stations debout prolong\\u00e9es</li></ul>
<p><strong>Taille et entretien</strong></p>
<p>Disponibles du 7 au 12. Nous recommandons de commander votre taille habituelle de chaussure de sport. Pour maintenir leur aspect impeccable, nettoyez avec un chiffon humide et un savon doux. \\u00c9vitez le lavage en machine.</p>
<p>Chaque paire est garantie par NewDealZone avec 14 jours pour changer d\\u2019avis et retours gratuits.</p>`),
  },

  "495f6a05-522b-4e96-96f9-16eb6f09bb8c": {
    en: `<p>Make a bold statement with the StreetFlex High-Top, the ultimate expression of urban style meets premium comfort. Designed for those who refuse to blend in, these high-tops combine timeless canvas construction with modern athletic engineering.</p>
<p><strong>Reinforced Ankle Support</strong></p>
<p>The distinctive high-top silhouette does more than just look great, it provides critical ankle stability and support that low-tops simply cannot match. Padded ankle collars cradle your feet in comfort while preventing rolls and strains during active use.</p>
<p><strong>Premium Canvas Construction</strong></p>
<p>Built from heavyweight cotton canvas that softens beautifully with wear, these sneakers develop character over time while maintaining their structural integrity. Double-stitched seams at stress points ensure these will last through years of daily wear.</p>
<p><strong>Cushioned Insole for All-Day Comfort</strong></p>
<p>Beneath the classic canvas exterior lies a removable cushioned insole engineered for extended wear. The molded footbed provides arch support while shock-absorbing foam reduces fatigue on hard urban surfaces.</p>
<p><strong>Available Colorways</strong></p>
<p>Choose from White, Black, Red, and Green to match any streetwear rotation. Each colorway features contrast stitching and metallic eyelets that add just the right amount of visual interest.</p>
<p><strong>Style Guide</strong></p>
<ul><li>Pair with slim jeans and a graphic tee for effortless street style</li><li>Roll up cuffed pants to showcase the iconic high-top silhouette</li><li>Layer under joggers for a modern athleisure look</li><li>Combine with tailored shorts for warm-weather edge</li></ul>
<p><strong>Fit & Sizing</strong></p>
<p>Available in sizes 7-13. Runs true to size for most wearers. For narrow feet, consider sizing down half a size. The lace-up closure allows for personalized fit adjustment throughout the day.</p>`,
    fr: d(`<p>Faites une d\\u00e9claration audacieuse avec la StreetFlex Montante, l\\u2019expression ultime du style urbain rencontrant le confort premium. Con\\u00e7ues pour ceux qui refusent de se fondre dans la masse, ces montantes combinent la construction toile intemporelle avec l\\u2019ing\\u00e9nierie athl\\u00e9tique moderne.</p>
<p><strong>Soutien de cheville renforc\\u00e9</strong></p>
<p>La silhouette montante distinctive ne se contente pas d\\u2019\\u00eatre belle, elle offre une stabilit\\u00e9 critique de la cheville que les mod\\u00e8les bas ne peuvent \\u00e9galer. Les cols de cheville rembourr\\u00e9s berc\\u00e9nt vos pieds tout en pr\\u00e9venant les entorses lors d\\u2019utilisation active.</p>
<p><strong>Construction en toile premium</strong></p>
<p>Fabriqu\\u00e9es en toile de coton \\u00e9paisse qui s\\u2019assouplit magnifiquement avec l\\u2019usure, ces baskets d\\u00e9veloppent du caract\\u00e8re tout en gardant leur int\\u00e9grit\\u00e9 structurelle. Les coutures doubles aux points de tension garantissent une long\\u00e9vit\\u00e9 exceptionnelle.</p>
<p><strong>Semelle rembourr\\u00e9e pour un confort toute la journ\\u00e9e</strong></p>
<p>Sous l\\u2019ext\\u00e9rieur en toile classique se trouve une semelle rembourr\\u00e9e amovible con\\u00e7ue pour un port prolong\\u00e9. La forme moul\\u00e9e offre un maintien de la vo\\u00fbte plantaire tandis que la mousse absorbante r\\u00e9duit la fatigue sur les surfaces urbaines.</p>
<p><strong>Coloris disponibles</strong></p>
<p>Choisissez parmi Blanc, Noir, Rouge et Vert pour compl\\u00e9ter toute garde-robe streetwear. Chaque coloris pr\\u00e9sente des coutures contrast\\u00e9es et des \\u0153illets m\\u00e9talliques qui apportent la juste touche d\\u2019int\\u00e9r\\u00eat visuel.</p>
<p><strong>Guide de style</strong></p>
<ul><li>Associez \\u00e0 un jean slim et un t-shirt graphique pour un style urbain sans effort</li><li>Retroussez les bas de pantalon pour mettre en valeur la silhouette montante</li><li>Portez sous un jogger pour un look ath-leisure moderne</li><li>Combinez avec un short sur mesure pour un style estival tranchant</li></ul>
<p><strong>Ajustement et taille</strong></p>
<p>Disponibles du 7 au 13. Chaussant fid\\u00e8le pour la plupart. Pour les pieds \\u00e9troits, envisagez une demi-taille en dessous.</p>`),
  },

  "e46a9018-f425-4fff-bbac-35cae4dea368": {
    en: `<p>Experience footwear reimagined with the Cloud Walker, featuring our revolutionary CloudFoam cushioning technology. This is not just another comfort shoe, it is a completely new standard for what all-day comfort should feel like.</p>
<p><strong>Proprietary CloudFoam Technology</strong></p>
<p>Years of research and development have produced our CloudFoam midsole, a material that responds to your body weight and stride, providing customized cushioning with every step. Unlike traditional foam that compresses over time, CloudFoam maintains its shape and support for years of consistent performance.</p>
<p><strong>Weightless Feel</strong></p>
<p>Despite its substantial cushioning, the Cloud Walker weighs remarkably little. The engineered upper uses a knit construction that flexes naturally with your foot, eliminating pressure points and hot spots that plague conventional walking shoes.</p>
<p><strong>Anatomically Correct Design</strong></p>
<p>Every curve of the Cloud Walker follows the natural anatomy of the human foot. The wide toe box allows your toes to splay naturally, promoting proper balance and reducing the risk of common foot ailments like bunions and hammertoes.</p>
<p><strong>Perfect For Extended Wear</strong></p>
<ul><li>Healthcare professionals on 12-hour shifts</li><li>Teachers and educators on their feet all day</li><li>Retail workers and hospitality staff</li><li>Travelers exploring cities on foot</li><li>Anyone recovering from foot injuries</li></ul>
<p><strong>Three Signature Colorways</strong></p>
<p>Available in Cloud White for a fresh, clean aesthetic, Sky Blue for a subtle pop of color, and Mist Gray for a versatile neutral that pairs with everything in your wardrobe.</p>
<p><strong>Care Instructions</strong></p>
<p>Machine washable in cold water on gentle cycle. Air dry only, never use a dryer. The knit upper will retain its shape and CloudFoam midsole will not degrade with regular washing.</p>`,
    fr: d(`<p>D\\u00e9couvrez la chaussure r\\u00e9invent\\u00e9e avec le Marcheur des Nuages, dot\\u00e9 de notre technologie r\\u00e9volutionnaire CloudFoam. Ce n\\u2019est pas juste une autre chaussure confortable, c\\u2019est un nouveau standard pour ce que devrait \\u00eatre le confort toute la journ\\u00e9e.</p>
<p><strong>Technologie CloudFoam exclusive</strong></p>
<p>Des ann\\u00e9es de recherche et d\\u00e9veloppement ont produit notre semelle interm\\u00e9diaire CloudFoam, un mat\\u00e9riau qui r\\u00e9pond \\u00e0 votre poids et votre foul\\u00e9e, offrant un amorti personnalis\\u00e9 \\u00e0 chaque pas. Contrairement \\u00e0 la mousse traditionnelle qui se compresse, CloudFoam garde sa forme et son soutien pendant des ann\\u00e9es.</p>
<p><strong>Sensation d\\u2019apesanteur</strong></p>
<p>Malgr\\u00e9 son amorti substantiel, le Marcheur des Nuages p\\u00e8se remarquablement peu. La tige technique utilise une construction tricot qui se plie naturellement avec votre pied, \\u00e9liminant les points de pression et les zones chaudes.</p>
<p><strong>Design anatomiquement correct</strong></p>
<p>Chaque courbe suit l\\u2019anatomie naturelle du pied humain. L\\u2019avant-pied large permet aux orteils de s\\u2019\\u00e9tendre naturellement, favorisant l\\u2019\\u00e9quilibre et r\\u00e9duisant le risque d\\u2019affections courantes.</p>
<p><strong>Parfait pour un port prolong\\u00e9</strong></p>
<ul><li>Professionnels de sant\\u00e9 sur des postes de 12 heures</li><li>Enseignants debout toute la journ\\u00e9e</li><li>Employ\\u00e9s de la restauration et h\\u00f4tellerie</li><li>Voyageurs explorant les villes \\u00e0 pied</li><li>Personnes en r\\u00e9cup\\u00e9ration de blessures aux pieds</li></ul>
<p><strong>Trois coloris signature</strong></p>
<p>Disponibles en Blanc Nuage pour une esth\\u00e9tique fra\\u00eeche, Bleu Ciel pour une touche de couleur subtile, et Gris Brume pour un neutre polyvalent qui s\\u2019associe avec tout.</p>
<p><strong>Instructions d\\u2019entretien</strong></p>
<p>Lavable en machine \\u00e0 froid sur cycle d\\u00e9licat. S\\u00e9chage \\u00e0 l\\u2019air uniquement.</p>`),
  },

  "e4349824-c6bf-4b35-9d78-c08ca8c48da4": {
    en: `<p>Illuminate the night with Neon Pulse sneakers, the ultimate footwear for those who refuse to fade into the background. These are not just shoes, they are a statement piece designed to command attention wherever you go.</p>
<p><strong>360-Degree Reflective Detailing</strong></p>
<p>Strategic placement of 3M reflective materials throughout the upper ensures visibility from every angle in low-light conditions. Whether you are night running, cycling, or heading to the club, these sneakers keep you seen and safe.</p>
<p><strong>Neon Colorways That Pop</strong></p>
<p>Available in three eye-catching options: electrifying Neon Green, vibrant Electric Blue, and unmissable Hot Pink. Each colorway uses premium dye processes that maintain their bold intensity wash after wash, wear after wear.</p>
<p><strong>Ultra-Responsive Foam Midsole</strong></p>
<p>Beneath the bold exterior lies serious performance technology. Our ultra-responsive foam midsole provides explosive energy return that makes every step feel bouncy and effortless, perfect for dancing all night or pounding the pavement.</p>
<p><strong>Perfect For</strong></p>
<ul><li>Music festivals and concerts</li><li>Late night runs and workouts</li><li>Club nights and events</li><li>Making a bold fashion statement</li><li>Street photography and content creation</li></ul>
<p><strong>Durability Meets Style</strong></p>
<p>The upper combines synthetic overlays with breathable mesh, creating a shoe that looks incredible but also stands up to real-world use. Reinforced toe caps and heel counters prevent premature wear in high-stress zones.</p>
<p><strong>Sizing Recommendation</strong></p>
<p>Available in sizes 7 through 12. True to size for most wearers. The shoe includes a padded tongue and collar that break in perfectly after just a few wears.</p>`,
    fr: d(`<p>Illuminez la nuit avec les baskets Neon Pulse, la chaussure ultime pour ceux qui refusent de dispara\\u00eetre dans le d\\u00e9cor. Ce ne sont pas seulement des chaussures, c\\u2019est une pi\\u00e8ce statement con\\u00e7ue pour attirer l\\u2019attention partout o\\u00f9 vous allez.</p>
<p><strong>D\\u00e9tails r\\u00e9fl\\u00e9chissants \\u00e0 360 degr\\u00e9s</strong></p>
<p>Le placement strat\\u00e9gique de mat\\u00e9riaux r\\u00e9fl\\u00e9chissants 3M sur toute la tige assure une visibilit\\u00e9 sous tous les angles dans les conditions de faible luminosit\\u00e9. Que vous couriez la nuit ou alliez en bo\\u00eete, ces baskets vous gardent visible et en s\\u00e9curit\\u00e9.</p>
<p><strong>Coloris n\\u00e9on qui \\u00e9clatent</strong></p>
<p>Disponibles en trois options accrocheuses : Vert N\\u00e9on \\u00e9lectrisant, Bleu \\u00c9lectrique vibrant, et Rose Vif immanquable. Chaque coloris utilise des proc\\u00e9d\\u00e9s de teinture premium qui gardent leur intensit\\u00e9 lavage apr\\u00e8s lavage.</p>
<p><strong>Semelle en mousse ultra-r\\u00e9active</strong></p>
<p>Sous l\\u2019ext\\u00e9rieur audacieux se cache une technologie s\\u00e9rieuse. Notre semelle interm\\u00e9diaire en mousse ultra-r\\u00e9active offre un retour d\\u2019\\u00e9nergie explosif qui rend chaque pas rebondissant et sans effort.</p>
<p><strong>Parfait pour</strong></p>
<ul><li>Festivals de musique et concerts</li><li>Courses et entra\\u00eenements nocturnes</li><li>Soir\\u00e9es en club et \\u00e9v\\u00e9nements</li><li>Faire une d\\u00e9claration mode audacieuse</li><li>Photographie de rue et cr\\u00e9ation de contenu</li></ul>
<p><strong>Durabilit\\u00e9 et style</strong></p>
<p>La tige combine des renforts synth\\u00e9tiques avec du mesh respirant. Les embouts renforc\\u00e9s emp\\u00eachent l\\u2019usure pr\\u00e9matur\\u00e9e.</p>
<p><strong>Recommandation de taille</strong></p>
<p>Disponibles du 7 au 12. Fid\\u00e8les \\u00e0 la taille pour la plupart. Langue et col rembourr\\u00e9s.</p>`),
  },

  "603a75fa-e244-4a0d-bd76-7173d355f730": {
    en: `<p>Step into sneaker history with the Retro Classic 88, a modern homage to the golden era of athletic footwear. These are not mere reproductions, they are carefully crafted tributes that combine vintage aesthetics with contemporary comfort technology.</p>
<p><strong>Authentic Vintage Design</strong></p>
<p>Every detail of the Retro Classic 88 pays homage to sneaker culture of the late 1980s. From the panel construction to the specific curve of the swoosh-inspired side stripe, these shoes capture the essence of that iconic era while remaining wearable and stylish today.</p>
<p><strong>Premium Suede and Leather Construction</strong></p>
<p>Unlike fast-fashion retro sneakers, the Classic 88 uses genuine premium suede overlays combined with full-grain leather panels. These materials develop a beautiful patina over time, meaning your shoes look better with age, not worse.</p>
<p><strong>Three Heritage Colorways</strong></p>
<ul><li><strong>Navy:</strong> A timeless choice that pairs with virtually anything in your wardrobe</li><li><strong>Cream:</strong> Vintage-inspired neutral perfect for warm weather styling</li><li><strong>Forest Green:</strong> Bold heritage colorway that stands out from the crowd</li></ul>
<p><strong>Modern Comfort Hidden Inside</strong></p>
<p>Do not let the vintage exterior fool you. Inside these shoes, you will find modern EVA foam cushioning, moisture-wicking linings, and padded collars that make them comfortable enough for all-day wear. This is not a shoe you save for special occasions, this is a daily driver.</p>
<p><strong>Sneakerhead Appeal</strong></p>
<p>The Retro Classic 88 has developed a cult following among sneaker enthusiasts who appreciate the attention to detail and quality materials. The limited color availability and premium construction mean these are pieces you can build outfits around, not just wear.</p>
<p><strong>Sizing & Care</strong></p>
<p>Available in sizes 7-11. True to size. Care for suede portions with a soft brush and specialized suede cleaner. Leather panels benefit from occasional conditioning to maintain suppleness and prevent cracking.</p>`,
    fr: d(`<p>Entrez dans l\\u2019histoire des sneakers avec les Retro Classique 88, un hommage moderne \\u00e0 l\\u2019\\u00e2ge d\\u2019or de la chaussure athl\\u00e9tique. Ce ne sont pas de simples reproductions, ce sont des tributs soigneusement con\\u00e7us combinant esth\\u00e9tique vintage et technologie de confort contemporaine.</p>
<p><strong>Design vintage authentique</strong></p>
<p>Chaque d\\u00e9tail des Retro Classique 88 rend hommage \\u00e0 la culture sneaker de la fin des ann\\u00e9es 1980. De la construction des panneaux \\u00e0 la courbe sp\\u00e9cifique de la bande lat\\u00e9rale, ces chaussures capturent l\\u2019essence de cette \\u00e9poque ic\\u00f4nique.</p>
<p><strong>Construction su\\u00e8de et cuir premium</strong></p>
<p>Contrairement aux sneakers r\\u00e9tro fast-fashion, les Classique 88 utilisent des empi\\u00e8cements en su\\u00e8de v\\u00e9ritable combin\\u00e9s \\u00e0 des panneaux en cuir pleine fleur. Ces mat\\u00e9riaux d\\u00e9veloppent une belle patine avec le temps.</p>
<p><strong>Trois coloris h\\u00e9ritage</strong></p>
<ul><li><strong>Marine :</strong> Un choix intemporel qui s\\u2019associe \\u00e0 pratiquement tout</li><li><strong>Cr\\u00e8me :</strong> Neutre d\\u2019inspiration vintage parfait pour l\\u2019\\u00e9t\\u00e9</li><li><strong>Vert For\\u00eat :</strong> Coloris h\\u00e9ritage audacieux qui se d\\u00e9marque</li></ul>
<p><strong>Confort moderne \\u00e0 l\\u2019int\\u00e9rieur</strong></p>
<p>Ne vous laissez pas tromper par l\\u2019ext\\u00e9rieur vintage. \\u00c0 l\\u2019int\\u00e9rieur, vous trouverez un amorti en mousse EVA moderne, des doublures respirantes et des cols rembourr\\u00e9s.</p>
<p><strong>Attrait pour les sneakerheads</strong></p>
<p>Les Retro Classique 88 ont d\\u00e9velopp\\u00e9 un culte parmi les enthousiastes de sneakers qui appr\\u00e9cient l\\u2019attention aux d\\u00e9tails et les mat\\u00e9riaux de qualit\\u00e9.</p>
<p><strong>Taille et entretien</strong></p>
<p>Disponibles du 7 au 11. Fid\\u00e8les \\u00e0 la taille. Entretien du su\\u00e8de avec brosse douce et nettoyant sp\\u00e9cialis\\u00e9.</p>`),
  },

  "a06e87e2-6430-40b1-b5ca-adc38560f52c": {
    en: `<p>Master the art of understated elegance with the Shadow Black Edition. In a world of loud logos and flashy designs, these sneakers speak in whispers of quiet luxury and refined taste. This is footwear for those who understand that true style needs no announcement.</p>
<p><strong>All-Black Monochrome Excellence</strong></p>
<p>Every element of these shoes, from the laces to the outsole, features a carefully coordinated black colorway. Matte and satin finishes are strategically combined to create visual interest without breaking the monochromatic aesthetic.</p>
<p><strong>Premium Matte Finish</strong></p>
<p>The upper features a specialized matte finish that resists scuffs and maintains its stealth appearance even after months of daily wear. Unlike glossy alternatives, matte black hides minor imperfections and looks better as it develops character.</p>
<p><strong>Two Refined Options</strong></p>
<ul><li><strong>Triple Black:</strong> The purest expression of stealth style with completely blacked-out construction</li><li><strong>Charcoal:</strong> Deep gray-black offering subtle variation while maintaining the dark aesthetic</li></ul>
<p><strong>Professional Versatility</strong></p>
<p>The all-black colorway makes these sneakers appropriate for settings where traditional athletic footwear would feel out of place. Pair them with dark denim and a blazer for smart-casual meetings, or with a fitted suit for creative workplace looks.</p>
<p><strong>Perfect For</strong></p>
<ul><li>Creative professionals in relaxed corporate settings</li><li>Weekend warriors who prefer subdued style</li><li>Anyone building a capsule wardrobe</li><li>Travel wear that pairs with everything</li><li>Photography and events where flashy shoes would distract</li></ul>
<p><strong>Construction Details</strong></p>
<p>Built from premium synthetic leather with reinforced stitching throughout, these shoes are built to last. The cushioned insole and padded collar provide day-long comfort while the flexible sole ensures natural movement.</p>
<p><strong>Care Guide</strong></p>
<p>Wipe clean with a damp cloth. For scuff marks on the matte finish, use a suede eraser or specialized matte leather cleaner. Available in sizes 8-12.</p>`,
    fr: d(`<p>Ma\\u00eetrisez l\\u2019art de l\\u2019\\u00e9l\\u00e9gance discr\\u00e8te avec l\\u2019Ombre Noir Edition. Dans un monde de logos bruyants et de designs voyants, ces baskets parlent en chuchotements de luxe discret et de go\\u00fbt raffin\\u00e9.</p>
<p><strong>Excellence monochrome tout noir</strong></p>
<p>Chaque \\u00e9l\\u00e9ment, des lacets \\u00e0 la semelle ext\\u00e9rieure, pr\\u00e9sente un coloris noir soigneusement coordonn\\u00e9. Les finitions mates et satin\\u00e9es sont combin\\u00e9es strat\\u00e9giquement.</p>
<p><strong>Finition mate premium</strong></p>
<p>La tige pr\\u00e9sente une finition mate sp\\u00e9cialis\\u00e9e qui r\\u00e9siste aux \\u00e9raflures et maintient son apparence discr\\u00e8te m\\u00eame apr\\u00e8s des mois de port quotidien.</p>
<p><strong>Deux options raffin\\u00e9es</strong></p>
<ul><li><strong>Triple Noir :</strong> L\\u2019expression la plus pure du style discret avec une construction enti\\u00e8rement noire</li><li><strong>Charbon :</strong> Gris-noir profond offrant une variation subtile</li></ul>
<p><strong>Polyvalence professionnelle</strong></p>
<p>Le coloris tout noir rend ces baskets appropri\\u00e9es pour des environnements o\\u00f9 la chaussure athl\\u00e9tique traditionnelle serait d\\u00e9plac\\u00e9e. Associez-les \\u00e0 un jean fonc\\u00e9 et un blazer.</p>
<p><strong>Parfaites pour</strong></p>
<ul><li>Professionnels cr\\u00e9atifs dans un cadre corporate d\\u00e9contract\\u00e9</li><li>Guerriers du week-end pr\\u00e9f\\u00e9rant un style sobre</li><li>Toute garde-robe capsule</li><li>Tenues de voyage qui s\\u2019accordent avec tout</li></ul>
<p><strong>D\\u00e9tails de construction</strong></p>
<p>Fabriqu\\u00e9es en cuir synth\\u00e9tique premium avec coutures renforc\\u00e9es. Semelle rembourr\\u00e9e et col rembourr\\u00e9.</p>
<p><strong>Guide d\\u2019entretien</strong></p>
<p>Nettoyez avec un chiffon humide. Disponibles du 8 au 12.</p>`),
  },

  "d44f0138-205e-4d2e-999b-3699a71fb05c": {
    en: `<p>Wear your personality on your feet with Canvas Culture sneakers. These are not just shoes, they are a canvas for self-expression, featuring vibrant patterns and colors that celebrate individuality and creative spirit.</p>
<p><strong>Vibrant Artistic Patterns</strong></p>
<p>Choose from three distinctive designs, each carefully created by our in-house artists to make a statement without being overwhelming. Every pattern is applied using colorfast printing techniques that maintain vibrancy through repeated wear and washing.</p>
<p><strong>Three Unique Colorways</strong></p>
<ul><li><strong>Tie-Dye:</strong> Explosive rainbow patterns reminiscent of festival culture and free spirit lifestyles</li><li><strong>Floral:</strong> Delicate botanical prints that bring nature\\u2019s beauty to your everyday style</li><li><strong>Abstract:</strong> Modern geometric designs perfect for the contemporary art lover</li></ul>
<p><strong>Lightweight Canvas Construction</strong></p>
<p>Built from breathable cotton canvas that molds to your feet with wear, these sneakers become more comfortable the more you wear them. The material breathes naturally, making them perfect for warm weather activities and extended wear.</p>
<p><strong>Perfect for Creative Souls</strong></p>
<ul><li>Art students and creative professionals</li><li>Music festivals and outdoor concerts</li><li>Beach days and boardwalk strolls</li><li>Coffee shops and creative workspaces</li><li>Anyone who refuses to wear boring shoes</li></ul>
<p><strong>Affordable Style Statement</strong></p>
<p>At an accessible price point, Canvas Culture proves that expressing your unique style does not require breaking the bank. These sneakers deliver premium print quality and construction at a fraction of designer prices.</p>
<p><strong>Care & Longevity</strong></p>
<p>Hand wash with cool water and mild detergent to preserve pattern vibrancy. Air dry only. With proper care, the patterns will remain bright and beautiful for years of creative expression. Available in sizes 6-11.</p>`,
    fr: d(`<p>Portez votre personnalit\\u00e9 sur vos pieds avec les baskets Toile Culture. Ce ne sont pas seulement des chaussures, c\\u2019est une toile pour l\\u2019expression de soi, pr\\u00e9sentant des motifs vibrants qui c\\u00e9l\\u00e8brent l\\u2019individualit\\u00e9.</p>
<p><strong>Motifs artistiques vibrants</strong></p>
<p>Choisissez parmi trois designs distinctifs, chacun soigneusement cr\\u00e9\\u00e9 par nos artistes internes. Chaque motif est appliqu\\u00e9 avec des techniques d\\u2019impression grand teint.</p>
<p><strong>Trois coloris uniques</strong></p>
<ul><li><strong>Tie-Dye :</strong> Motifs arc-en-ciel explosifs rappelant la culture festival</li><li><strong>Floral :</strong> Impressions botaniques d\\u00e9licates apportant la beaut\\u00e9 de la nature</li><li><strong>Abstrait :</strong> Designs g\\u00e9om\\u00e9triques modernes parfaits pour l\\u2019amateur d\\u2019art contemporain</li></ul>
<p><strong>Construction en toile l\\u00e9g\\u00e8re</strong></p>
<p>Fabriqu\\u00e9es en toile de coton respirante qui \\u00e9pouse vos pieds avec l\\u2019usure, ces baskets deviennent plus confortables plus vous les portez.</p>
<p><strong>Parfaites pour les \\u00e2mes cr\\u00e9atives</strong></p>
<ul><li>\\u00c9tudiants en art et professionnels cr\\u00e9atifs</li><li>Festivals de musique et concerts en plein air</li><li>Journ\\u00e9es \\u00e0 la plage et promenades</li><li>Caf\\u00e9s et espaces de travail cr\\u00e9atifs</li></ul>
<p><strong>Style abordable</strong></p>
<p>\\u00c0 un prix accessible, Toile Culture prouve qu\\u2019exprimer votre style unique ne n\\u00e9cessite pas de casser votre tirelire.</p>
<p><strong>Entretien et long\\u00e9vit\\u00e9</strong></p>
<p>Lavage \\u00e0 la main \\u00e0 l\\u2019eau froide avec d\\u00e9tergent doux. S\\u00e9chage \\u00e0 l\\u2019air uniquement. Disponibles du 6 au 11.</p>`),
  },

  "985530f4-1428-45d4-8381-0bade4a469e0": {
    en: `<p>Embrace the philosophy that less is more with the Minimalist One. In a world obsessed with excess and complication, these sneakers stand as a testament to the enduring power of simple, honest design.</p>
<p><strong>Pure Design Philosophy</strong></p>
<p>Every element that does not serve a functional or aesthetic purpose has been stripped away. What remains is a shoe of remarkable purity, where every curve, seam, and stitch has been carefully considered and refined.</p>
<p><strong>Uncompromising Comfort</strong></p>
<p>Do not mistake minimalism for austerity. These shoes feature premium cushioning, ergonomic footbeds, and breathable linings that deliver exceptional all-day comfort. The simplicity is in the appearance, not the engineering.</p>
<p><strong>Three Timeless Colorways</strong></p>
<ul><li><strong>White:</strong> The ultimate minimalist statement, pristine and versatile</li><li><strong>Black:</strong> Understated elegance that pairs with any outfit</li><li><strong>Gray:</strong> Sophisticated neutral offering subtle variation</li></ul>
<p><strong>Capsule Wardrobe Essential</strong></p>
<p>These are the sneakers you reach for when you want to look put-together without effort. They work with jeans, chinos, shorts, and even relaxed suits. If you are building a capsule wardrobe or minimalist lifestyle, these are the sneakers you need.</p>
<p><strong>Premium Materials Throughout</strong></p>
<p>Do not confuse minimalism with cheap. These shoes feature premium leather upper, soft memory foam insole, and durable rubber outsole. The materials are what elevate a simple design into something truly special.</p>
<p><strong>Perfect For</strong></p>
<ul><li>Building a minimalist wardrobe</li><li>Travel with limited packing</li><li>Business casual environments</li><li>Weekend outings and casual wear</li><li>Anyone who values quiet quality over loud branding</li></ul>
<p><strong>Sizing & Care</strong></p>
<p>Available in sizes 7-11. Runs true to size. Care instructions vary by colorway but generally include wiping with a damp cloth and periodic leather conditioning for the black and gray options.</p>`,
    fr: d(`<p>Adoptez la philosophie que moins c\\u2019est plus avec le Minimaliste One. Dans un monde obs\\u00e9d\\u00e9 par l\\u2019exc\\u00e8s, ces baskets sont un t\\u00e9moignage du pouvoir durable du design simple et honn\\u00eate.</p>
<p><strong>Philosophie de design pur</strong></p>
<p>Chaque \\u00e9l\\u00e9ment qui ne sert pas un but fonctionnel ou esth\\u00e9tique a \\u00e9t\\u00e9 supprim\\u00e9. Ce qui reste est une chaussure d\\u2019une puret\\u00e9 remarquable.</p>
<p><strong>Confort sans compromis</strong></p>
<p>Ne confondez pas minimalisme avec aust\\u00e9rit\\u00e9. Ces chaussures pr\\u00e9sentent un amorti premium, des semelles ergonomiques et des doublures respirantes.</p>
<p><strong>Trois coloris intemporels</strong></p>
<ul><li><strong>Blanc :</strong> La d\\u00e9claration minimaliste ultime, pure et polyvalente</li><li><strong>Noir :</strong> \\u00c9l\\u00e9gance discr\\u00e8te qui s\\u2019associe \\u00e0 toute tenue</li><li><strong>Gris :</strong> Neutre sophistiqu\\u00e9 offrant une variation subtile</li></ul>
<p><strong>Essentiel de garde-robe capsule</strong></p>
<p>Ce sont les baskets que vous choisirez quand vous voudrez avoir l\\u2019air soign\\u00e9 sans effort. Elles s\\u2019accordent aux jeans, chinos, shorts.</p>
<p><strong>Mat\\u00e9riaux premium</strong></p>
<p>Ne confondez pas minimalisme avec bon march\\u00e9. Ces chaussures pr\\u00e9sentent une tige en cuir premium et une semelle en mousse m\\u00e9moire.</p>
<p><strong>Parfaites pour</strong></p>
<ul><li>Construire une garde-robe minimaliste</li><li>Voyages avec bagages limit\\u00e9s</li><li>Environnements business casual</li><li>Sorties de week-end</li></ul>
<p><strong>Taille et entretien</strong></p>
<p>Disponibles du 7 au 11. Fid\\u00e8les \\u00e0 la taille.</p>`),
  },

  "5d985ff0-c702-4af3-a354-324bd61b74f6": {
    en: `<p>Rise above the ordinary with Platform Rise sneakers. These are not just shoes, they are a statement of confidence and style. The bold chunky platform sole adds physical height and undeniable attitude to every step you take.</p>
<p><strong>Bold Chunky Platform Design</strong></p>
<p>The signature platform sole measures 1.5 inches at its highest point, adding meaningful height while maintaining walkability. This is not an unwearable stiletto, this is elevated street style that works from morning meetings to evening dates.</p>
<p><strong>Premium Materials Throughout</strong></p>
<p>Built from a combination of genuine leather and premium synthetic materials, these sneakers are designed to withstand daily wear while maintaining their sculptural silhouette. The construction is substantial, giving these shoes real presence and weight.</p>
<p><strong>Three Fashion-Forward Colorways</strong></p>
<ul><li><strong>White/Pink:</strong> Ultra-feminine combination perfect for warm weather styling</li><li><strong>Black/Gold:</strong> Luxurious contrast that adds glamour to any outfit</li><li><strong>Beige:</strong> Neutral tonal design that pairs with everything</li></ul>
<p><strong>Confidence-Boosting Height</strong></p>
<p>Beyond the aesthetic appeal, the platform provides genuine height benefits. Whether you want to appear taller in photos, feel more commanding in professional settings, or simply enjoy a new perspective on the world, these shoes deliver.</p>
<p><strong>Surprisingly Comfortable</strong></p>
<p>Do not let the bold design fool you. These sneakers include memory foam insoles and shock-absorbing platform materials that make them wearable for hours. Many customers report being surprised by how comfortable they are once broken in.</p>
<p><strong>Style Guide</strong></p>
<ul><li>Pair with wide-leg pants for balanced proportions</li><li>Wear with midi skirts for modern retro vibes</li><li>Rock with shorts to elongate the leg line</li><li>Combine with oversized sweaters for cozy chic</li></ul>
<p><strong>Sizing Note</strong></p>
<p>Available in sizes 5-10. We recommend ordering true to size. The break-in period is typically 3-5 wears, after which they conform beautifully to your feet.</p>`,
    fr: d(`<p>\\u00c9levez-vous au-dessus de l\\u2019ordinaire avec les baskets Plateforme Montante. Ce ne sont pas seulement des chaussures, c\\u2019est une d\\u00e9claration de confiance et de style.</p>
<p><strong>Design plateforme chunky audacieux</strong></p>
<p>La semelle plateforme signature mesure 3,8 cm \\u00e0 son point le plus haut, ajoutant une hauteur significative tout en maintenant la marchabilit\\u00e9.</p>
<p><strong>Mat\\u00e9riaux premium</strong></p>
<p>Construites d\\u2019une combinaison de cuir v\\u00e9ritable et de mat\\u00e9riaux synth\\u00e9tiques premium.</p>
<p><strong>Trois coloris avant-gardistes</strong></p>
<ul><li><strong>Blanc/Rose :</strong> Combinaison ultra-f\\u00e9minine parfaite pour l\\u2019\\u00e9t\\u00e9</li><li><strong>Noir/Or :</strong> Contraste luxueux qui ajoute du glamour</li><li><strong>Beige :</strong> Design neutre tonal qui s\\u2019accorde avec tout</li></ul>
<p><strong>Hauteur qui booste la confiance</strong></p>
<p>Au-del\\u00e0 de l\\u2019attrait esth\\u00e9tique, la plateforme offre de vrais avantages de hauteur.</p>
<p><strong>Etonnamment confortables</strong></p>
<p>Ne vous laissez pas tromper par le design audacieux. Ces baskets incluent des semelles en mousse m\\u00e9moire.</p>
<p><strong>Guide de style</strong></p>
<ul><li>Associez \\u00e0 des pantalons larges pour des proportions \\u00e9quilibr\\u00e9es</li><li>Portez avec des jupes midi pour un style r\\u00e9tro moderne</li><li>Portez avec des shorts pour allonger la jambe</li><li>Combinez avec des pulls oversized</li></ul>
<p><strong>Note de taille</strong></p>
<p>Disponibles du 5 au 10. Fid\\u00e8les \\u00e0 la taille.</p>`),
  },

  "5ed02bba-dce7-4938-9d47-907d6f85cb60": {
    en: `<p>Breathe easy in every step with Knit Breeze sneakers. Featuring our advanced flyknit construction with true 360-degree ventilation, these sneakers redefine what breathable footwear means in the modern era.</p>
<p><strong>Full Flyknit Upper</strong></p>
<p>The one-piece flyknit upper eliminates traditional stitching and overlays that restrict airflow. Instead, precision-engineered knit patterns create zones of breathability, support, and flex exactly where your foot needs them.</p>
<p><strong>360-Degree Ventilation System</strong></p>
<p>Unlike shoes with mesh only at the toe box, Knit Breeze features ventilation zones throughout the entire upper. Air flows in from the sides, top, and even the collar, keeping your feet cool from every angle during activity.</p>
<p><strong>Three Fresh Colorways</strong></p>
<ul><li><strong>Ocean Blue:</strong> Refreshing marine tones inspired by summer coastlines</li><li><strong>Coral:</strong> Warm sunset colors that add personality to your outfit</li><li><strong>Mint:</strong> Cool spring greens perfect for the fashion-forward athlete</li></ul>
<p><strong>Ideal for Active Lifestyles</strong></p>
<p>The breathability makes these sneakers particularly suited to hot weather, humid climates, and high-intensity activities. If you struggle with sweaty feet or hot spots in traditional sneakers, Knit Breeze will transform your comfort level.</p>
<p><strong>Sock-Like Fit</strong></p>
<p>The stretchy flyknit material conforms to your foot like a premium sock, eliminating pressure points and hot spots. There is no break-in period, they feel great from the very first wear.</p>
<p><strong>Perfect For</strong></p>
<ul><li>Summer activities and hot weather</li><li>Gym workouts and cardio sessions</li><li>Walking tours and city exploration</li><li>People who suffer from sweaty feet</li><li>Anyone recovering from foot issues</li></ul>
<p><strong>Machine Washable</strong></p>
<p>The knit upper can be machine washed on gentle cycle with cold water. Air dry only. Available in sizes 7-12. True to size fit.</p>`,
    fr: d(`<p>Respirez facilement \\u00e0 chaque pas avec les baskets Tricote Brise. Avec notre construction flyknit avanc\\u00e9e et une v\\u00e9ritable ventilation \\u00e0 360 degr\\u00e9s.</p>
<p><strong>Tige flyknit int\\u00e9grale</strong></p>
<p>La tige flyknit d\\u2019une pi\\u00e8ce \\u00e9limine les coutures traditionnelles et les empi\\u00e8cements qui limitent la circulation d\\u2019air.</p>
<p><strong>Syst\\u00e8me de ventilation 360 degr\\u00e9s</strong></p>
<p>Contrairement aux chaussures avec mesh uniquement \\u00e0 l\\u2019avant-pied, Tricote Brise pr\\u00e9sente des zones de ventilation sur toute la tige.</p>
<p><strong>Trois coloris frais</strong></p>
<ul><li><strong>Bleu Oc\\u00e9an :</strong> Tons marins rafra\\u00eechissants inspir\\u00e9s des c\\u00f4tes estivales</li><li><strong>Corail :</strong> Couleurs chaudes de coucher de soleil</li><li><strong>Menthe :</strong> Verts printaniers frais parfaits pour l\\u2019athl\\u00e8te avant-gardiste</li></ul>
<p><strong>Id\\u00e9ales pour les modes de vie actifs</strong></p>
<p>La respirabilit\\u00e9 rend ces baskets particuli\\u00e8rement adapt\\u00e9es au temps chaud, aux climats humides et aux activit\\u00e9s de haute intensit\\u00e9.</p>
<p><strong>Ajustement chaussette</strong></p>
<p>Le mat\\u00e9riau flyknit extensible \\u00e9pouse votre pied comme une chaussette premium.</p>
<p><strong>Parfaites pour</strong></p>
<ul><li>Activit\\u00e9s estivales et temps chaud</li><li>Entra\\u00eenements en salle et cardio</li><li>Visites \\u00e0 pied et exploration urbaine</li><li>Personnes souffrant de pieds moites</li></ul>
<p><strong>Lavables en machine</strong></p>
<p>La tige tricot\\u00e9e peut \\u00eatre lav\\u00e9e en machine sur cycle d\\u00e9licat \\u00e0 froid. Disponibles du 7 au 12.</p>`),
  },

  "d7d745b3-7072-4ab2-84b6-387484c98fdb": {
    en: `<p>Bridge the gap between corporate polish and athletic comfort with Metro Flex sneakers. Designed for professionals who navigate multiple environments daily, these shoes bring genuine leather sophistication to sneaker-style comfort.</p>
<p><strong>Genuine Leather Construction</strong></p>
<p>The upper features full-grain leather that develops a rich patina over time. Unlike synthetic alternatives that look worn after a few months, genuine leather ages beautifully and can last for years with proper care.</p>
<p><strong>Memory Foam Insoles</strong></p>
<p>Beneath the sophisticated exterior lies athletic-grade comfort technology. The memory foam insoles conform to the unique shape of your feet, providing customized support and cushioning that reduces fatigue during long days.</p>
<p><strong>Smart Casual Perfection</strong></p>
<p>These sneakers occupy the sweet spot between formal shoes and athletic footwear. They are refined enough for creative agencies and startups, but comfortable enough for weekend adventures. Perfect for the modern professional.</p>
<p><strong>Three Sophisticated Colorways</strong></p>
<ul><li><strong>Tan:</strong> Warm neutral that pairs with browns, blues, and greens</li><li><strong>Navy:</strong> Deep classic tone that reads as an alternative to black</li><li><strong>Burgundy:</strong> Rich statement color for confident dressers</li></ul>
<p><strong>From Subway to Boardroom</strong></p>
<p>Whether you are commuting on public transit, walking client meetings, or attending after-work networking events, Metro Flex handles it all with style and comfort. No more carrying separate shoes for different parts of your day.</p>
<p><strong>Business Casual Perfection</strong></p>
<ul><li>Chinos and button-downs for the office</li><li>Dark jeans and blazers for client meetings</li><li>Quarter zips and joggers for creative days</li><li>Even suits in relaxed workplace environments</li></ul>
<p><strong>Investment-Grade Quality</strong></p>
<p>The combination of genuine leather and premium comfort technology means these are shoes you will own for years. Care for the leather occasionally, and they will look great long after fast-fashion alternatives have fallen apart. Available in sizes 7-12.</p>`,
    fr: d(`<p>Comblez l\\u2019\\u00e9cart entre l\\u2019\\u00e9l\\u00e9gance corporate et le confort athl\\u00e9tique avec les baskets Metro Flex. Con\\u00e7ues pour les professionnels qui naviguent entre multiples environnements.</p>
<p><strong>Construction en cuir v\\u00e9ritable</strong></p>
<p>La tige pr\\u00e9sente un cuir pleine fleur qui d\\u00e9veloppe une riche patine avec le temps.</p>
<p><strong>Semelles en mousse m\\u00e9moire</strong></p>
<p>Sous l\\u2019ext\\u00e9rieur sophistiqu\\u00e9 se trouve une technologie de confort de grade athl\\u00e9tique.</p>
<p><strong>Perfection smart casual</strong></p>
<p>Ces baskets occupent la zone id\\u00e9ale entre chaussures formelles et chaussures athl\\u00e9tiques.</p>
<p><strong>Trois coloris sophistiqu\\u00e9s</strong></p>
<ul><li><strong>Beige :</strong> Neutre chaud qui s\\u2019associe aux bruns, bleus et verts</li><li><strong>Marine :</strong> Ton classique profond comme alternative au noir</li><li><strong>Bordeaux :</strong> Couleur statement riche pour les dresseurs confiants</li></ul>
<p><strong>Du m\\u00e9tro au bureau</strong></p>
<p>Que vous fassiez la navette en transports publics, marchiez vers des r\\u00e9unions clients, Metro Flex g\\u00e8re tout.</p>
<p><strong>Perfection business casual</strong></p>
<ul><li>Chinos et chemises pour le bureau</li><li>Jeans fonc\\u00e9s et blazers pour les r\\u00e9unions clients</li><li>Quarter zips et joggers pour les jours cr\\u00e9atifs</li></ul>
<p><strong>Qualit\\u00e9 investissement</strong></p>
<p>Ces chaussures vous accompagneront pendant des ann\\u00e9es. Disponibles du 7 au 12.</p>`),
  },

};

export async function GET(request: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const results: { id: string; name: string; status: string; changes: string[] }[] = [];
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  try {
    const allProducts = await db.select().from(products);

    for (const product of allProducts) {
      const data = LONG_DESC[product.id];

      if (!data) {
        skipped++;
        results.push({ id: product.id, name: product.name, status: "skipped - no data yet", changes: [] });
        continue;
      }

      const updates: Record<string, unknown> = {};
      const changes: string[] = [];

      if (data.en && (!product.longDescription || product.longDescription.trim() === "")) {
        updates.longDescription = data.en;
        changes.push("longDescription added");
      }
      if (data.fr && (!product.longDescriptionFr || product.longDescriptionFr.trim() === "")) {
        updates.longDescriptionFr = data.fr;
        changes.push("longDescriptionFr added");
      }

      if (Object.keys(updates).length === 0) {
        skipped++;
        results.push({ id: product.id, name: product.name, status: "already has long desc", changes: [] });
        continue;
      }

      updates.updatedAt = new Date();

      try {
        await db.update(products).set(updates).where(eq(products.id, product.id));
        updated++;
        results.push({ id: product.id, name: product.name, status: "updated", changes });
      } catch (err) {
        errors++;
        results.push({ id: product.id, name: product.name, status: "error", changes: [String(err)] });
      }
    }

    return NextResponse.json({
      success: true,
      batch: 1,
      summary: { total: allProducts.length, updated, skipped, errors },
      results,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}