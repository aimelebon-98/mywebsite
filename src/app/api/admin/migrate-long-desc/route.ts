import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

function d(s: string): string {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

const LONG_DESC: Record<string, { en: string; fr: string }> = {

  // ==================== RUNNING ====================

  "5637c0b5-2e1b-45bf-a92d-5903e7c75328": {
    en: `<p>Push the limits of speed with the Velocity Pro X, a racing-inspired sneaker built for athletes who demand peak performance from their footwear. This is not an evolution of existing technology, it is a revolution in how fast a shoe can make you feel.</p>
<p><strong>Carbon Fiber Plate Technology</strong></p>
<p>Embedded within the midsole is a full-length carbon fiber plate that acts as a spring, propelling you forward with each stride. This technology, previously reserved for elite marathon racers, is now accessible to performance-minded runners and speed enthusiasts at every level.</p>
<p><strong>ZoomX Responsive Foam</strong></p>
<p>The ZoomX foam midsole delivers an incredible 85% energy return, meaning you get back nearly all the energy you put into each step. The result is a shoe that feels faster the longer you run, reducing fatigue during high-intensity efforts and competitive events.</p>
<p><strong>Aerodynamic Upper Design</strong></p>
<p>Every curve of the upper has been wind-tunnel tested to reduce drag. The seamless construction eliminates unnecessary material while maintaining structural support, creating a shoe that cuts through the air with minimal resistance.</p>
<p><strong>Three Race-Ready Colorways</strong></p>
<ul><li><strong>Volt:</strong> High-visibility neon that commands attention on the track</li><li><strong>Racing Red:</strong> Bold crimson that channels competitive fire</li><li><strong>Black:</strong> Stealth performance for focused athletes</li></ul>
<p><strong>Built for Competition</strong></p>
<ul><li>5K and 10K races where every second matters</li><li>Half marathon and marathon personal bests</li><li>Track workouts and interval training</li><li>Time trials and competitive club runs</li><li>Speed-focused training sessions</li></ul>
<p><strong>Technical Specifications</strong></p>
<p>Weight: 198g per shoe in size 10. Drop: 8mm heel-to-toe. Stack height: 39mm heel, 31mm forefoot. The engineered mesh upper features targeted support zones that lock your foot in place during aggressive cornering and sprint finishes.</p>
<p><strong>Sizing & Fit</strong></p>
<p>Available in sizes 7-12. The racing fit runs snug, providing lockdown performance. If you prefer a more relaxed fit, consider sizing up half a size. These are performance tools designed for race day and speed sessions, not casual daily wear.</p>`,
    fr: d(`<p>Repoussez les limites de la vitesse avec les Velocite Pro X, des baskets inspir\\u00e9es de la course con\\u00e7ues pour les athl\\u00e8tes qui exigent le meilleur de leurs chaussures.</p>
<p><strong>Technologie plaque fibre de carbone</strong></p>
<p>Int\\u00e9gr\\u00e9e dans la semelle interm\\u00e9diaire, une plaque en fibre de carbone pleine longueur agit comme un ressort, vous propulsant vers l\\u2019avant \\u00e0 chaque foul\\u00e9e. Cette technologie, autrefois r\\u00e9serv\\u00e9e aux marathoniens d\\u2019\\u00e9lite, est d\\u00e9sormais accessible.</p>
<p><strong>Mousse ZoomX r\\u00e9active</strong></p>
<p>La semelle en mousse ZoomX offre un retour d\\u2019\\u00e9nergie de 85%, ce qui signifie que vous r\\u00e9cup\\u00e9rez presque toute l\\u2019\\u00e9nergie investie \\u00e0 chaque pas. Le r\\u00e9sultat est une chaussure qui semble plus rapide plus vous courez longtemps.</p>
<p><strong>Design a\\u00e9rodynamique</strong></p>
<p>Chaque courbe de la tige a \\u00e9t\\u00e9 test\\u00e9e en soufflerie pour r\\u00e9duire la tra\\u00een\\u00e9e.</p>
<p><strong>Trois coloris pr\\u00eats pour la course</strong></p>
<ul><li><strong>Volt :</strong> N\\u00e9on haute visibilit\\u00e9 qui attire l\\u2019attention</li><li><strong>Rouge Course :</strong> Cramoisi audacieux qui canalise le feu comp\\u00e9titif</li><li><strong>Noir :</strong> Performance discr\\u00e8te pour athl\\u00e8tes concentr\\u00e9s</li></ul>
<p><strong>Con\\u00e7ues pour la comp\\u00e9tition</strong></p>
<ul><li>Courses 5K et 10K o\\u00f9 chaque seconde compte</li><li>Records personnels en semi-marathon et marathon</li><li>Entra\\u00eenements de vitesse et intervalles</li></ul>
<p><strong>Taille et ajustement</strong></p>
<p>Disponibles du 7 au 12. L\\u2019ajustement course est serr\\u00e9 pour un maintien optimal. Envisagez une demi-taille au-dessus pour un ajustement plus d\\u00e9tendu.</p>`),
  },

  "089dce91-5ac4-426f-8382-cad4ad3a2944": {
    en: `<p>Meet the Urban Runner Pro, the shoe designed specifically for runners who call the city their track. Whether you are weaving through pedestrian traffic, pounding concrete sidewalks, or sprinting through crosswalks, these shoes deliver athletic performance with street-savvy style.</p>
<p><strong>Lightweight Urban Construction</strong></p>
<p>At just 245 grams per shoe, the Urban Runner Pro provides substantial cushioning without the bulk that slows you down. The mesh upper is reinforced at critical points but remains breathable, perfect for the temperature swings you encounter moving between air-conditioned buildings and summer streets.</p>
<p><strong>Durable Outsole Grip</strong></p>
<p>City running demands a sole that handles wet tile, painted crosswalks, metal grates, and concrete with equal confidence. Our multi-compound rubber outsole features micro-grooves that channel water and grip textured surfaces, providing traction regardless of urban terrain.</p>
<p><strong>Modern Athletic Aesthetic</strong></p>
<p>These shoes look as good at a coffee shop as they do on a morning run. The clean, modern silhouette transitions seamlessly from workout to casual wear, eliminating the need for multiple pairs throughout your day.</p>
<p><strong>Three Urban Colorways</strong></p>
<ul><li><strong>Blue:</strong> Fresh and energetic, perfect for standing out on gray city streets</li><li><strong>Gray:</strong> Versatile neutral that pairs with any athletic or casual outfit</li><li><strong>Black:</strong> Classic stealth for early morning and after-dark runs</li></ul>
<p><strong>Perfect For Urban Athletes</strong></p>
<ul><li>Pre-work morning runs through city streets</li><li>Lunchtime jogs around the office district</li><li>Weekend park runs and urban exploration</li><li>Commuting by foot or public transit</li><li>Casual everyday wear after your workout</li></ul>
<p><strong>Sizing & Care</strong></p>
<p>Available in sizes 7-11. True to size for most runners. The breathable mesh upper can be spot-cleaned with a damp cloth and mild soap. Air dry away from direct heat to maintain cushioning performance. Backed by our 14-day comfort guarantee.</p>`,
    fr: d(`<p>D\\u00e9couvrez le Coureur Urbain Pro, la chaussure con\\u00e7ue sp\\u00e9cifiquement pour les coureurs qui font de la ville leur piste. Que vous naviguiez entre les pi\\u00e9tons, couriez sur le b\\u00e9ton ou spriniez aux passages pi\\u00e9tons.</p>
<p><strong>Construction urbaine l\\u00e9g\\u00e8re</strong></p>
<p>\\u00c0 seulement 245 grammes par chaussure, le Coureur Urbain Pro offre un amorti substantiel sans le volume qui vous ralentit. La tige en mesh est renforc\\u00e9e mais reste respirante.</p>
<p><strong>Adh\\u00e9rence durable de la semelle</strong></p>
<p>La course en ville exige une semelle qui g\\u00e8re le carrelage mouill\\u00e9, les passages pi\\u00e9tons peints, les grilles m\\u00e9talliques et le b\\u00e9ton avec la m\\u00eame assurance. Notre semelle multi-compos\\u00e9 offre une traction sur tous les terrains urbains.</p>
<p><strong>Esth\\u00e9tique athl\\u00e9tique moderne</strong></p>
<p>Ces chaussures sont aussi belles dans un caf\\u00e9 que lors d\\u2019une course matinale.</p>
<p><strong>Trois coloris urbains</strong></p>
<ul><li><strong>Bleu :</strong> Frais et \\u00e9nergique, parfait pour se d\\u00e9marquer dans les rues grises</li><li><strong>Gris :</strong> Neutre polyvalent</li><li><strong>Noir :</strong> Discr\\u00e9tion classique pour les courses matinales et nocturnes</li></ul>
<p><strong>Parfaites pour les athl\\u00e8tes urbains</strong></p>
<ul><li>Courses matinales avant le travail</li><li>Jogging du d\\u00e9jeuner autour du quartier des affaires</li><li>Courses du week-end au parc</li><li>D\\u00e9placements \\u00e0 pied ou transports</li></ul>
<p><strong>Taille et entretien</strong></p>
<p>Disponibles du 7 au 11. Fid\\u00e8les \\u00e0 la taille. Nettoyage avec un chiffon humide. Garantie confort 14 jours.</p>`),
  },

  "df1e55fc-a2f6-40cf-bcce-ab623672a991": {
    en: `<p>Go the distance with Marathon Elite, the long-distance running shoe engineered for endurance athletes who refuse to settle for ordinary. Every element of this shoe has been optimized for the unique demands of extended running, from 10K training to full marathon competition.</p>
<p><strong>Energy Return Technology</strong></p>
<p>Our advanced energy return foam captures and redirects the kinetic energy from each footstrike, converting what would normally be wasted impact into forward propulsion. The result is measurably reduced fatigue in the late miles when it matters most.</p>
<p><strong>Ultra-Lightweight Mesh Upper</strong></p>
<p>The engineered mesh upper weighs almost nothing while providing targeted support where your foot needs it. Seamless construction eliminates friction points that cause blisters during long runs, keeping you comfortable from mile one to mile twenty-six.</p>
<p><strong>Arch Support Engineered for Endurance</strong></p>
<p>Unlike shoes designed for short bursts of speed, Marathon Elite features graduated arch support that maintains its shape throughout extended wear. The medial post prevents excessive pronation that can lead to knee and hip issues during long training blocks.</p>
<p><strong>Three Performance Colorways</strong></p>
<ul><li><strong>Neon Yellow:</strong> Maximum visibility for early morning and evening training runs</li><li><strong>Black/Red:</strong> Aggressive race-day aesthetics that channel competitive energy</li><li><strong>White/Blue:</strong> Clean, classic marathon styling</li></ul>
<p><strong>Distance Runner Essentials</strong></p>
<ul><li>Marathon and half-marathon race day performance</li><li>Long training runs exceeding 15 miles</li><li>Progressive distance building programs</li><li>Running club group training</li><li>Ultra-distance preparation</li></ul>
<p><strong>Durability for High Mileage</strong></p>
<p>The carbon rubber outsole is rated for 500+ miles of pavement running, making Marathon Elite an excellent value for serious runners who track their mileage. Strategic placement of harder compounds in high-wear zones extends the life of each pair significantly.</p>
<p><strong>Sizing</strong></p>
<p>Available in sizes 7-12. We recommend going half a size up from your casual shoe size for long-distance running to accommodate foot swelling during extended efforts.</p>`,
    fr: d(`<p>Allez au bout de la distance avec Marathon Elite, la chaussure de course longue distance con\\u00e7ue pour les athl\\u00e8tes d\\u2019endurance. Chaque \\u00e9l\\u00e9ment a \\u00e9t\\u00e9 optimis\\u00e9 pour les exigences de la course prolong\\u00e9e.</p>
<p><strong>Technologie de retour d\\u2019\\u00e9nergie</strong></p>
<p>Notre mousse avanc\\u00e9e capture et redirige l\\u2019\\u00e9nergie cin\\u00e9tique de chaque foul\\u00e9e, convertissant l\\u2019impact en propulsion. Le r\\u00e9sultat est une fatigue r\\u00e9duite dans les derniers kilom\\u00e8tres.</p>
<p><strong>Tige mesh ultra-l\\u00e9g\\u00e8re</strong></p>
<p>La tige en mesh technique ne p\\u00e8se presque rien tout en fournissant un soutien cibl\\u00e9. La construction sans coutures \\u00e9limine les points de friction qui causent des ampoules.</p>
<p><strong>Maintien de la vo\\u00fbte plantaire pour l\\u2019endurance</strong></p>
<p>Contrairement aux chaussures con\\u00e7ues pour la vitesse, Marathon Elite pr\\u00e9sente un soutien progressif de la vo\\u00fbte qui maintient sa forme durant le port prolong\\u00e9.</p>
<p><strong>Trois coloris performance</strong></p>
<ul><li><strong>Jaune N\\u00e9on :</strong> Visibilit\\u00e9 maximale pour les courses matinales et nocturnes</li><li><strong>Noir/Rouge :</strong> Esth\\u00e9tique de jour de course agressive</li><li><strong>Blanc/Bleu :</strong> Style marathon classique et \\u00e9pur\\u00e9</li></ul>
<p><strong>Essentiels pour coureurs de distance</strong></p>
<ul><li>Performance en marathon et semi-marathon</li><li>Longues sorties d\\u2019entra\\u00eenement d\\u00e9passant 25 km</li><li>Programmes de progression en distance</li></ul>
<p><strong>Taille</strong></p>
<p>Disponibles du 7 au 12. Nous recommandons une demi-taille au-dessus de votre taille habituelle pour la course longue distance.</p>`),
  },

  "5dc6d298-20a0-47bb-9630-756b96e6110f": {
    en: `<p>Discover the most comfortable running shoe you have ever worn. Comfort Stride is engineered from the ground up for runners and walkers who prioritize cushioning and support above all else, delivering a plush ride that feels like walking on pillows.</p>
<p><strong>Triple-Density Foam System</strong></p>
<p>Three layers of progressively responsive foam work together to create a cushioning system greater than the sum of its parts. The soft top layer provides immediate comfort, the medium-density middle layer absorbs impact, and the firm base layer ensures stability and energy return.</p>
<p><strong>Wide Toe Box Design</strong></p>
<p>Unlike narrow-fit running shoes that compress your toes, Comfort Stride features a generous toe box that allows natural toe splay. This anatomical design reduces pressure on metatarsal joints and helps prevent common foot issues associated with tight footwear.</p>
<p><strong>Plush Collar Padding</strong></p>
<p>The ankle collar features premium foam padding that cradles the Achilles tendon without creating pressure points. The result is a secure fit that does not sacrifice comfort, even during extended wear sessions.</p>
<p><strong>Three Clean Colorways</strong></p>
<ul><li><strong>White:</strong> Fresh and clinical, perfect for healthcare and service professionals</li><li><strong>Black:</strong> Classic versatility for any outfit or occasion</li><li><strong>Navy:</strong> Rich depth that pairs with professional and casual attire</li></ul>
<p><strong>Who Should Wear Comfort Stride</strong></p>
<ul><li>Runners transitioning to higher-cushion shoes</li><li>Walkers covering significant daily distance</li><li>Professionals standing for long shifts</li><li>Anyone with plantar fasciitis or heel sensitivity</li><li>Recovery days between harder training sessions</li></ul>
<p><strong>Removable Insole</strong></p>
<p>The cushioned insole can be removed and replaced with custom orthotics if needed, making Comfort Stride a medical-grade comfort option for those with specific foot requirements.</p>
<p><strong>Sizing</strong></p>
<p>Available in sizes 6-13, including wide sizing options. True to size for most wearers. The wide toe box means most people do not need to size up.</p>`,
    fr: d(`<p>D\\u00e9couvrez la chaussure de course la plus confortable que vous ayez jamais port\\u00e9e. Foulee Confort est con\\u00e7ue pour ceux qui privil\\u00e9gient l\\u2019amorti et le soutien par-dessus tout.</p>
<p><strong>Syst\\u00e8me de mousse triple densit\\u00e9</strong></p>
<p>Trois couches de mousse progressivement r\\u00e9active travaillent ensemble. La couche sup\\u00e9rieure souple offre un confort imm\\u00e9diat, la couche interm\\u00e9diaire absorbe les chocs, et la base ferme assure stabilit\\u00e9 et retour d\\u2019\\u00e9nergie.</p>
<p><strong>Avant-pied large</strong></p>
<p>Contrairement aux chaussures \\u00e9troites qui compriment les orteils, Foulee Confort offre un avant-pied g\\u00e9n\\u00e9reux permettant l\\u2019extension naturelle des orteils.</p>
<p><strong>Rembourrage collar en mousse</strong></p>
<p>Le col de cheville pr\\u00e9sente un rembourrage premium qui berce le tendon d\\u2019Achille sans cr\\u00e9er de points de pression.</p>
<p><strong>Trois coloris</strong></p>
<ul><li><strong>Blanc :</strong> Frais et net, parfait pour les professionnels de sant\\u00e9</li><li><strong>Noir :</strong> Polyvalence classique</li><li><strong>Marine :</strong> Profondeur riche qui s\\u2019accorde avec tenues professionnelles et casual</li></ul>
<p><strong>Qui devrait porter la Foulee Confort</strong></p>
<ul><li>Coureurs en transition vers plus d\\u2019amorti</li><li>Marcheurs couvrant de grandes distances quotidiennes</li><li>Professionnels debout de longues heures</li><li>Personnes souffrant de fasciite plantaire</li></ul>
<p><strong>Semelle amovible</strong></p>
<p>La semelle rembourr\\u00e9e peut \\u00eatre remplac\\u00e9e par des ortho\\u00e8ses personnalis\\u00e9es.</p>
<p><strong>Taille</strong></p>
<p>Disponibles du 6 au 13. Fid\\u00e8les \\u00e0 la taille.</p>`),
  },

  "e0d886dd-b37d-4566-addb-545faad67dd7": {
    en: `<p>Experience the next generation of running shoe technology with HyperBoost Max. Powered by revolutionary Boost foam, these shoes deliver unmatched energy return and responsiveness that serious runners can feel from the first step.</p>
<p><strong>Revolutionary Boost Foam</strong></p>
<p>Each Boost midsole contains thousands of individually fused TPU energy capsules that compress under impact and spring back with explosive force. This creates a unique bouncy feeling that never flattens out, maintaining performance for hundreds of miles.</p>
<p><strong>Unmatched Energy Return</strong></p>
<p>Independent lab testing confirms HyperBoost Max delivers up to 80% energy return, meaning minimal energy is lost with each footstrike. The practical result is less fatigue, faster paces, and more enjoyable runs at every distance.</p>
<p><strong>Temperature Independent Performance</strong></p>
<p>Unlike traditional EVA foams that stiffen in cold weather, Boost foam maintains consistent cushioning properties from freezing to hot conditions. Whether you run in winter or summer, the ride remains the same.</p>
<p><strong>Three Performance Colorways</strong></p>
<ul><li><strong>Core Black:</strong> Timeless versatility for any running kit</li><li><strong>Cloud White:</strong> Clean premium aesthetic</li><li><strong>Solar Red:</strong> Eye-catching energy for competitive runners</li></ul>
<p><strong>Versatile Training Partner</strong></p>
<ul><li>Daily training runs and easy recovery sessions</li><li>Tempo workouts and progressive runs</li><li>Long runs and marathon preparation</li><li>Gym cross-training and fitness classes</li><li>All-day wear for active lifestyles</li></ul>
<p><strong>Continental Rubber Outsole</strong></p>
<p>The outsole features Continental rubber, the same material used in premium car tires, providing exceptional grip in wet and dry conditions. You can trust your footing on rain-slicked roads or dry trails.</p>
<p><strong>Sizing</strong></p>
<p>Available in sizes 7-12. Fits true to size. The Primeknit upper adapts to your foot shape, providing a personalized fit that improves with wear.</p>`,
    fr: d(`<p>Vivez la prochaine g\\u00e9n\\u00e9ration de technologie avec HyperBoost Max. Propuls\\u00e9es par la mousse Boost r\\u00e9volutionnaire, ces chaussures offrent un retour d\\u2019\\u00e9nergie et une r\\u00e9activit\\u00e9 in\\u00e9gal\\u00e9s.</p>
<p><strong>Mousse Boost r\\u00e9volutionnaire</strong></p>
<p>Chaque semelle Boost contient des milliers de capsules \\u00e9nerg\\u00e9tiques TPU fusionn\\u00e9es qui se compriment sous l\\u2019impact et rebondissent avec une force explosive.</p>
<p><strong>Retour d\\u2019\\u00e9nergie in\\u00e9gal\\u00e9</strong></p>
<p>Les tests en laboratoire confirment que HyperBoost Max offre jusqu\\u2019\\u00e0 80% de retour d\\u2019\\u00e9nergie. Moins de fatigue, des allures plus rapides, des courses plus agr\\u00e9ables.</p>
<p><strong>Performance ind\\u00e9pendante de la temp\\u00e9rature</strong></p>
<p>Contrairement aux mousses EVA qui durcissent par temps froid, la mousse Boost maintient ses propri\\u00e9t\\u00e9s d\\u2019amorti du gel \\u00e0 la chaleur.</p>
<p><strong>Trois coloris performance</strong></p>
<ul><li><strong>Noir :</strong> Polyvalence intemporelle</li><li><strong>Blanc :</strong> Esth\\u00e9tique premium \\u00e9pur\\u00e9e</li><li><strong>Rouge Solaire :</strong> \\u00c9nergie accrocheuse pour les comp\\u00e9titeurs</li></ul>
<p><strong>Partenaire d\\u2019entra\\u00eenement polyvalent</strong></p>
<ul><li>Courses d\\u2019entra\\u00eenement quotidiennes</li><li>S\\u00e9ances tempo et courses progressives</li><li>Longues sorties et pr\\u00e9paration marathon</li></ul>
<p><strong>Semelle caoutchouc Continental</strong></p>
<p>La semelle ext\\u00e9rieure en caoutchouc Continental offre une adh\\u00e9rence exceptionnelle sur sol mouill\\u00e9 et sec.</p>
<p><strong>Taille</strong></p>
<p>Disponibles du 7 au 12. Fid\\u00e8les \\u00e0 la taille.</p>`),
  },

  "b0cfff4c-a728-4c92-948a-afdc79ee922c": {
    en: `<p>Reconnect with the natural way your body was designed to move with Flex Motion running shoes. Inspired by barefoot running science, these shoes strip away unnecessary cushioning and structure to promote natural foot mechanics and strengthen the muscles that conventional shoes weaken.</p>
<p><strong>Barefoot-Inspired Design</strong></p>
<p>With a minimal 4mm heel-to-toe drop, Flex Motion encourages a natural midfoot strike pattern that reduces impact forces on joints. The ultra-thin midsole provides ground feedback that helps you develop better running form over time.</p>
<p><strong>Ultra-Flexible Sole</strong></p>
<p>The outsole features deep flex grooves that allow the shoe to bend and twist in every direction your foot moves naturally. Unlike rigid shoes that fight your foot, Flex Motion works with your biomechanics for a more efficient stride.</p>
<p><strong>Essential Protection</strong></p>
<p>While mimicking the barefoot experience, Flex Motion still provides essential protection from rocks, glass, and rough surfaces. The thin but durable outsole shields your feet without blocking the ground feel that makes barefoot-style running so effective.</p>
<p><strong>Three Natural Colorways</strong></p>
<ul><li><strong>Black:</strong> Understated and versatile</li><li><strong>White:</strong> Clean minimalist aesthetic</li><li><strong>Olive:</strong> Earth-toned option for trail and nature runners</li></ul>
<p><strong>Transition Guide</strong></p>
<p>If you are transitioning from traditional cushioned shoes, we recommend a gradual approach. Start with short runs of 1-2 miles and increase distance by no more than 10% per week. Your feet and calves will need time to adapt to the lower-drop design.</p>
<p><strong>Perfect For</strong></p>
<ul><li>Runners seeking to strengthen foot muscles</li><li>Barefoot running enthusiasts wanting protection</li><li>Cross-training and gym workouts</li><li>Recovery runs on easy days</li><li>Walking and casual daily wear</li></ul>
<p><strong>Sizing</strong></p>
<p>Available in sizes 7-11. Some runners prefer sizing up half a size to allow natural toe splay.</p>`,
    fr: d(`<p>Reconnectez avec le mouvement naturel de votre corps avec les Flex Motion. Inspir\\u00e9es de la science de la course pieds nus, ces chaussures \\u00e9liminent l\\u2019amorti et la structure inutiles pour promouvoir une m\\u00e9canique naturelle du pied.</p>
<p><strong>Design inspir\\u00e9 du pied nu</strong></p>
<p>Avec un d\\u00e9nivel\\u00e9 minimal de 4 mm, Flex Motion encourage une attaque naturelle du m\\u00e9diopied qui r\\u00e9duit les forces d\\u2019impact sur les articulations.</p>
<p><strong>Semelle ultra-flexible</strong></p>
<p>La semelle ext\\u00e9rieure pr\\u00e9sente des rainures de flexion profondes permettant \\u00e0 la chaussure de se plier dans toutes les directions o\\u00f9 votre pied bouge naturellement.</p>
<p><strong>Protection essentielle</strong></p>
<p>Tout en imitant l\\u2019exp\\u00e9rience pieds nus, Flex Motion fournit une protection essentielle contre les cailloux, le verre et les surfaces rugueuses.</p>
<p><strong>Trois coloris naturels</strong></p>
<ul><li><strong>Noir :</strong> Discret et polyvalent</li><li><strong>Blanc :</strong> Esth\\u00e9tique minimaliste</li><li><strong>Olive :</strong> Tonal terreux pour la course nature</li></ul>
<p><strong>Guide de transition</strong></p>
<p>Si vous transitionnez depuis des chaussures \\u00e0 fort amorti, nous recommandons une approche progressive. Commencez par des courses courtes de 2-3 km et augmentez de 10% par semaine maximum.</p>
<p><strong>Taille</strong></p>
<p>Disponibles du 7 au 11. Certains coureurs pr\\u00e9f\\u00e8rent une demi-taille au-dessus.</p>`),
  },

  "ee741750-eba2-48d4-aed8-bfb13446d3fa": {
    en: `<p>Break through your speed barriers with Tempo Racer, the running shoe engineered specifically for high-intensity tempo runs and interval training. When your workout demands speed and your feet demand comfort, Tempo Racer delivers both without compromise.</p>
<p><strong>Propulsive Forefoot Design</strong></p>
<p>The innovative rocker geometry in the forefoot creates a natural rolling motion that propels you forward at the toe-off phase. This mechanical advantage translates to faster paces with less perceived effort, helping you maintain aggressive splits through your entire workout.</p>
<p><strong>Snug Racing Fit</strong></p>
<p>The engineered upper wraps your foot securely with a precision fit that eliminates internal movement. No sliding, no hot spots, just locked-in performance that lets you focus entirely on your effort and pace.</p>
<p><strong>Responsive Cushioning</strong></p>
<p>The midsole strikes the perfect balance between soft landing and firm push-off, providing enough cushioning for comfort while remaining responsive enough for speed work. This dual-purpose design makes Tempo Racer ideal for workouts that mix easy and hard efforts.</p>
<p><strong>Three Race-Day Colorways</strong></p>
<ul><li><strong>Racing Red:</strong> Bold statement for competitive sessions</li><li><strong>Electric Blue:</strong> Cool confidence for interval days</li><li><strong>Black/Gold:</strong> Premium sophistication for race morning</li></ul>
<p><strong>Designed For Speed Workouts</strong></p>
<ul><li>Tempo runs at threshold pace</li><li>Track intervals from 400m to mile repeats</li><li>Fartlek and progression runs</li><li>Race-day performance for 5K through half marathon</li><li>Uptempo steady-state sessions</li></ul>
<p><strong>Sizing</strong></p>
<p>Available in sizes 7-11. Runs slightly narrow for a secure racing fit. If you typically prefer a roomier shoe, consider sizing up half a size.</p>`,
    fr: d(`<p>Brisez vos barri\\u00e8res de vitesse avec Tempo Racer, la chaussure de course con\\u00e7ue pour les sorties tempo haute intensit\\u00e9 et l\\u2019entra\\u00eenement par intervalles.</p>
<p><strong>Design avant-pied propulsif</strong></p>
<p>La g\\u00e9om\\u00e9trie rocker innovante \\u00e0 l\\u2019avant-pied cr\\u00e9e un mouvement de roulement naturel qui vous propulse vers l\\u2019avant. Cet avantage m\\u00e9canique se traduit par des allures plus rapides avec moins d\\u2019effort per\\u00e7u.</p>
<p><strong>Ajustement racing serr\\u00e9</strong></p>
<p>La tige technique enveloppe votre pied avec un ajustement pr\\u00e9cis qui \\u00e9limine les mouvements internes. Pas de glissement, pas de zones chaudes.</p>
<p><strong>Amorti r\\u00e9actif</strong></p>
<p>La semelle interm\\u00e9diaire trouve l\\u2019\\u00e9quilibre parfait entre atterrissage souple et pouss\\u00e9e ferme.</p>
<p><strong>Trois coloris jour de course</strong></p>
<ul><li><strong>Rouge Course :</strong> D\\u00e9claration audacieuse pour les s\\u00e9ances comp\\u00e9titives</li><li><strong>Bleu \\u00c9lectrique :</strong> Confiance fra\\u00eeche pour les jours d\\u2019intervalles</li><li><strong>Noir/Or :</strong> Sophistication premium pour le matin de course</li></ul>
<p><strong>Con\\u00e7ues pour les entra\\u00eenements de vitesse</strong></p>
<ul><li>Sorties tempo \\u00e0 allure au seuil</li><li>Intervalles sur piste du 400m au mile</li><li>Fartlek et courses progressives</li></ul>
<p><strong>Taille</strong></p>
<p>Disponibles du 7 au 11. Chaussant l\\u00e9g\\u00e8rement \\u00e9troit. Consid\\u00e9rez une demi-taille au-dessus si vous pr\\u00e9f\\u00e9rez plus d\\u2019espace.</p>`),
  },

  "9f7f3763-e682-4b09-a1ab-671718065549": {
    en: `<p>Run safely after dark with Night Glow Runner, the visibility-first running shoe designed for athletes who train before sunrise and after sunset. When conditions demand you be seen, these shoes make sure drivers, cyclists, and other runners notice you.</p>
<p><strong>3M Reflective Materials</strong></p>
<p>Industrial-grade 3M reflective strips are integrated throughout the upper, catching headlights and streetlights from every angle. When light hits these shoes, they glow brilliantly, making your feet visible from over 200 meters away in dark conditions.</p>
<p><strong>LED-Compatible Lace Loops</strong></p>
<p>Special loops are integrated into the lacing system, designed to accommodate LED clip-on lights for maximum visibility. This innovative feature lets you add active lighting for the darkest conditions without modifying the shoe.</p>
<p><strong>High-Visibility Colorways</strong></p>
<ul><li><strong>Hi-Vis Yellow:</strong> Maximum daytime and nighttime visibility</li><li><strong>Reflective Silver:</strong> Mirror-like finish that captures all ambient light</li><li><strong>Neon Orange:</strong> Construction-zone visibility for the most cautious runners</li></ul>
<p><strong>Performance Underneath</strong></p>
<p>Safety features aside, Night Glow Runner is a fully capable running shoe with responsive cushioning, breathable mesh, and durable outsole grip. You are not sacrificing performance for visibility, you get both.</p>
<p><strong>Essential For</strong></p>
<ul><li>Early morning pre-dawn runners</li><li>After-work evening training sessions</li><li>Winter running when daylight is limited</li><li>Road running on busy streets</li><li>Night race events and fun runs</li></ul>
<p><strong>Sizing</strong></p>
<p>Available in sizes 7-11. True to size. The reflective materials are embedded in the fabric, so they do not add bulk or affect the fit compared to standard running shoes.</p>`,
    fr: d(`<p>Courez en s\\u00e9curit\\u00e9 apr\\u00e8s la tomb\\u00e9e de la nuit avec Nuit Glow Coureur, la chaussure de course con\\u00e7ue pour les athl\\u00e8tes qui s\\u2019entra\\u00eenent avant l\\u2019aube et apr\\u00e8s le coucher du soleil.</p>
<p><strong>Mat\\u00e9riaux r\\u00e9fl\\u00e9chissants 3M</strong></p>
<p>Des bandes r\\u00e9fl\\u00e9chissantes 3M de grade industriel sont int\\u00e9gr\\u00e9es sur toute la tige, captant les phares et l\\u2019\\u00e9clairage public sous tous les angles. Vos pieds sont visibles \\u00e0 plus de 200 m\\u00e8tres dans l\\u2019obscurit\\u00e9.</p>
<p><strong>Boucles compatibles LED</strong></p>
<p>Des boucles sp\\u00e9ciales sont int\\u00e9gr\\u00e9es au syst\\u00e8me de la\\u00e7age pour accueillir des lumi\\u00e8res LED clip-on pour une visibilit\\u00e9 maximale.</p>
<p><strong>Coloris haute visibilit\\u00e9</strong></p>
<ul><li><strong>Jaune Haute Visibilit\\u00e9 :</strong> Visibilit\\u00e9 maximale jour et nuit</li><li><strong>Argent R\\u00e9fl\\u00e9chissant :</strong> Finition miroir captant toute lumi\\u00e8re ambiante</li><li><strong>Orange N\\u00e9on :</strong> Visibilit\\u00e9 de zone de chantier pour les coureurs les plus prudents</li></ul>
<p><strong>Performance incluse</strong></p>
<p>Au-del\\u00e0 de la s\\u00e9curit\\u00e9, Nuit Glow Coureur est une chaussure de course capable avec amorti r\\u00e9actif, mesh respirant et adh\\u00e9rence durable.</p>
<p><strong>Essentielle pour</strong></p>
<ul><li>Coureurs matinaux avant l\\u2019aube</li><li>Entra\\u00eenements du soir apr\\u00e8s le travail</li><li>Course hivernale quand la lumi\\u00e8re est limit\\u00e9e</li></ul>
<p><strong>Taille</strong></p>
<p>Disponibles du 7 au 11. Fid\\u00e8les \\u00e0 la taille.</p>`),
  },

  "ff8f0c92-78eb-47e4-8297-32d03e2d79e7": {
    en: `<p>Start your running journey or maintain your daily training habit with EasyRun Daily, the no-nonsense running shoe that delivers excellent performance at a price that respects your budget. These shoes prove that quality running footwear does not have to cost a fortune.</p>
<p><strong>Balanced Cushioning</strong></p>
<p>The midsole uses a carefully calibrated foam density that provides enough cushioning for comfortable daily running while maintaining the responsiveness needed for tempo efforts. This balance makes EasyRun Daily versatile enough to be your one-shoe solution.</p>
<p><strong>Durable Construction</strong></p>
<p>Despite the accessible price, there are no shortcuts in construction. Reinforced toe caps, double-stitched overlays, and a high-abrasion rubber outsole ensure these shoes deliver hundreds of miles of reliable service.</p>
<p><strong>Three Versatile Colorways</strong></p>
<ul><li><strong>Black:</strong> Classic choice that hides dirt and scuffs</li><li><strong>White:</strong> Clean aesthetic for style-conscious runners</li><li><strong>Gray/Teal:</strong> Subtle pop of color for those who want something different</li></ul>
<p><strong>Who Is EasyRun Daily For</strong></p>
<ul><li>Beginning runners building their first training habit</li><li>Budget-conscious athletes who still want quality</li><li>Gym members needing reliable cross-training shoes</li><li>Casual runners who run 2-4 times per week</li><li>Anyone wanting a comfortable daily shoe that can also run</li></ul>
<p><strong>Exceptional Value</strong></p>
<p>We believe everyone deserves quality running shoes regardless of budget. EasyRun Daily brings the same engineering attention as our premium models at a fraction of the price, making proper running footwear accessible to all.</p>
<p><strong>Sizing</strong></p>
<p>Available in sizes 6-12. True to size. The padded tongue and collar provide a secure yet comfortable fit right out of the box with minimal break-in required.</p>`,
    fr: d(`<p>Commencez votre parcours de course ou maintenez votre habitude d\\u2019entra\\u00eenement quotidien avec EasyRun Daily, la chaussure de course sans fioritures qui offre d\\u2019excellentes performances \\u00e0 un prix respectueux de votre budget.</p>
<p><strong>Amorti \\u00e9quilibr\\u00e9</strong></p>
<p>La semelle interm\\u00e9diaire utilise une densit\\u00e9 de mousse soigneusement calibr\\u00e9e offrant assez d\\u2019amorti pour la course quotidienne tout en maintenant la r\\u00e9activit\\u00e9 n\\u00e9cessaire pour les efforts tempo.</p>
<p><strong>Construction durable</strong></p>
<p>Malgr\\u00e9 le prix accessible, aucun raccourci n\\u2019a \\u00e9t\\u00e9 pris. Embouts renforc\\u00e9s, doubles coutures et semelle caoutchouc haute abrasion garantissent des centaines de kilom\\u00e8tres de service fiable.</p>
<p><strong>Trois coloris polyvalents</strong></p>
<ul><li><strong>Noir :</strong> Choix classique qui cache la salet\\u00e9</li><li><strong>Blanc :</strong> Esth\\u00e9tique propre pour les coureurs soucieux du style</li><li><strong>Gris/Turquoise :</strong> Touche de couleur subtile</li></ul>
<p><strong>Pour qui est EasyRun Daily</strong></p>
<ul><li>Coureurs d\\u00e9butants construisant leur premi\\u00e8re routine</li><li>Athl\\u00e8tes soucieux du budget voulant de la qualit\\u00e9</li><li>Membres de salle de sport cherchant des chaussures polyvalentes</li><li>Coureurs occasionnels 2 \\u00e0 4 fois par semaine</li></ul>
<p><strong>Valeur exceptionnelle</strong></p>
<p>Nous croyons que tout le monde m\\u00e9rite des chaussures de course de qualit\\u00e9 quel que soit le budget.</p>
<p><strong>Taille</strong></p>
<p>Disponibles du 6 au 12. Fid\\u00e8les \\u00e0 la taille.</p>`),
  },

  "f56b4cb8-f630-4cb5-9002-aceadc3ef808": {
    en: `<p>Conquer any surface with Trail Runner GT, the versatile running shoe that transitions seamlessly from paved roads to rugged trails. If your running route includes both asphalt and dirt, these shoes handle both with equal confidence and comfort.</p>
<p><strong>Aggressive Lug Outsole</strong></p>
<p>The 5mm multi-directional lugs dig into soft ground and grip loose surfaces while remaining comfortable on pavement. Unlike pure trail shoes that feel awkward on roads, Trail Runner GT is engineered for mixed-surface running.</p>
<p><strong>Rock Plate Protection</strong></p>
<p>A flexible rock plate embedded in the midsole shields your feet from sharp stones and roots without sacrificing the ground feel that trail runners rely on for confident foot placement on technical terrain.</p>
<p><strong>Waterproof Membrane</strong></p>
<p>The integrated waterproof membrane keeps water out while allowing moisture vapor to escape, keeping your feet dry when splashing through puddles, crossing streams, or running in rain. Your feet stay dry without overheating.</p>
<p><strong>Three Trail-Ready Colorways</strong></p>
<ul><li><strong>Forest:</strong> Natural camouflage for woodland trails</li><li><strong>Gray/Orange:</strong> High visibility for exposed mountain terrain</li><li><strong>Black:</strong> Versatile option for mixed use</li></ul>
<p><strong>Perfect For Mixed Terrain</strong></p>
<ul><li>Road-to-trail running adventures</li><li>Hiking and fast-packing</li><li>Muddy or wet trail conditions</li><li>Adventure races and obstacle courses</li><li>Light mountaineering approaches</li></ul>
<p><strong>Sizing</strong></p>
<p>Available in sizes 8-12. We recommend going half a size up from your road running size to accommodate thicker trail socks and foot swelling on longer adventures.</p>`,
    fr: d(`<p>Conqu\\u00e9rez toutes les surfaces avec le Sentier Coureur GT, la chaussure polyvalente qui passe sans effort de la route aux sentiers accident\\u00e9s.</p>
<p><strong>Semelle \\u00e0 crampons agressifs</strong></p>
<p>Les crampons multidirectionnels de 5 mm s\\u2019enfoncent dans le sol meuble et agrippent les surfaces instables tout en restant confortables sur le bitume.</p>
<p><strong>Plaque anti-roche</strong></p>
<p>Une plaque flexible int\\u00e9gr\\u00e9e dans la semelle prot\\u00e8ge vos pieds des pierres tranchantes et des racines sans sacrifier le ressenti du sol.</p>
<p><strong>Membrane imperm\\u00e9able</strong></p>
<p>La membrane imperm\\u00e9able int\\u00e9gr\\u00e9e garde l\\u2019eau \\u00e0 l\\u2019ext\\u00e9rieur tout en laissant la vapeur d\\u2019humidit\\u00e9 s\\u2019\\u00e9chapper.</p>
<p><strong>Trois coloris pr\\u00eats pour le sentier</strong></p>
<ul><li><strong>For\\u00eat :</strong> Camouflage naturel pour les sentiers bois\\u00e9s</li><li><strong>Gris/Orange :</strong> Haute visibilit\\u00e9 pour la montagne</li><li><strong>Noir :</strong> Option polyvalente pour usage mixte</li></ul>
<p><strong>Parfait pour terrain mixte</strong></p>
<ul><li>Aventures course route-sentier</li><li>Randonn\\u00e9e et fast-packing</li><li>Conditions de sentier boueuses ou humides</li></ul>
<p><strong>Taille</strong></p>
<p>Disponibles du 8 au 12. Nous recommandons une demi-taille au-dessus de votre taille route.</p>`),
  },

  "66ec11c0-7e3b-45ad-a36e-eac3e9674148": {
    en: `<p>Born to race. SpeedStrike is the pinnacle of racing shoe technology, delivering the ultimate combination of carbon-plate propulsion, lightweight construction, and responsive cushioning for athletes pursuing their fastest times.</p>
<p><strong>Carbon-Plate Midsole</strong></p>
<p>The full-length carbon fiber plate embedded in the midsole acts as a lever, reducing energy loss at the ankle joint and creating a snappy toe-off that propels you forward with mechanical efficiency. Studies show this technology can improve running economy by 2-4 percent.</p>
<p><strong>Ultra-Lightweight Construction</strong></p>
<p>At just 185 grams per shoe in size 10, SpeedStrike is among the lightest performance running shoes available. Every gram saved is energy conserved over the course of a race, and SpeedStrike saves more grams than almost any competitor.</p>
<p><strong>Race-Day Colorways</strong></p>
<ul><li><strong>Volt/Black:</strong> Maximum visibility and aggressive styling</li><li><strong>Red/White:</strong> Classic racing aesthetic</li><li><strong>Blue/Silver:</strong> Cool confidence for championship events</li></ul>
<p><strong>Competition Focused</strong></p>
<ul><li>Marathon and half-marathon personal records</li><li>Track racing from 5K to 10K</li><li>Championship events and competitive series</li><li>Time trials and official race days</li><li>Speed sessions where every second counts</li></ul>
<p><strong>Limited Lifespan by Design</strong></p>
<p>Like all elite racing shoes, SpeedStrike prioritizes performance over durability. The responsive foam and lightweight construction are optimized for approximately 200 miles of racing and speed work. Reserve these for your most important sessions and races.</p>
<p><strong>Sizing</strong></p>
<p>Available in sizes 7-11. Runs true to size with a snug racing fit. The sock-like collar eliminates the need for a traditional tongue, reducing weight and improving comfort.</p>`,
    fr: d(`<p>N\\u00e9e pour la course. SpeedStrike est le sommet de la technologie de chaussure de course, offrant la combinaison ultime de propulsion plaque carbone, construction l\\u00e9g\\u00e8re et amorti r\\u00e9actif.</p>
<p><strong>Semelle plaque carbone</strong></p>
<p>La plaque en fibre de carbone pleine longueur agit comme un levier, r\\u00e9duisant la perte d\\u2019\\u00e9nergie \\u00e0 la cheville et cr\\u00e9ant un d\\u00e9collage vif. Les \\u00e9tudes montrent une am\\u00e9lioration de 2 \\u00e0 4% de l\\u2019\\u00e9conomie de course.</p>
<p><strong>Construction ultra-l\\u00e9g\\u00e8re</strong></p>
<p>\\u00c0 seulement 185 grammes par chaussure en taille 10, SpeedStrike est parmi les plus l\\u00e9g\\u00e8res du march\\u00e9.</p>
<p><strong>Coloris jour de course</strong></p>
<ul><li><strong>Volt/Noir :</strong> Visibilit\\u00e9 maximale et style agressif</li><li><strong>Rouge/Blanc :</strong> Esth\\u00e9tique course classique</li><li><strong>Bleu/Argent :</strong> Confiance fra\\u00eeche pour les championnats</li></ul>
<p><strong>Focalis\\u00e9es sur la comp\\u00e9tition</strong></p>
<ul><li>Records personnels en marathon et semi-marathon</li><li>Courses sur piste du 5K au 10K</li><li>\\u00c9v\\u00e9nements de championnat</li></ul>
<p><strong>Taille</strong></p>
<p>Disponibles du 7 au 11. Fid\\u00e8les \\u00e0 la taille avec ajustement racing serr\\u00e9.</p>`),
  },

  // ==================== FORMAL ====================

  "30509eaa-9666-4241-8aa3-bf909f3c5d4c": {
    en: `<p>Invest in timeless elegance with Classic Leather Elite, handcrafted dress shoes that represent the pinnacle of traditional shoemaking. These are not merely shoes, they are heirloom-quality pieces designed to be worn, cherished, and even passed down through generations.</p>
<p><strong>Premium Italian Leather</strong></p>
<p>Sourced from the renowned tanneries of Tuscany, the full-grain calfskin leather used in Classic Leather Elite develops a beautiful patina over years of wear. Each pair tells its own story, becoming more distinguished and personal with time.</p>
<p><strong>Handcrafted Excellence</strong></p>
<p>Skilled artisans hand-finish every pair, applying multiple layers of color and polish to achieve the rich, multidimensional shine that distinguishes handmade shoes from factory-produced footwear. No two pairs are exactly alike.</p>
<p><strong>Modern Comfort Inside</strong></p>
<p>Despite the traditional exterior, hidden inside is a fully cushioned leather insole with arch support, a shock-absorbing heel pad, and breathable lining that keeps your feet comfortable through the longest business days and formal events.</p>
<p><strong>Three Sophisticated Colorways</strong></p>
<ul><li><strong>Brown:</strong> Warm medium brown ideal for business and social occasions</li><li><strong>Black:</strong> The essential formal shoe for the most important events</li><li><strong>Tan:</strong> Light golden hue perfect for summer weddings and daytime events</li></ul>
<p><strong>Dress Code Versatility</strong></p>
<ul><li>Business professional meetings and presentations</li><li>Weddings and formal celebrations</li><li>Black tie events with the appropriate colorway</li><li>Job interviews where first impressions matter</li><li>Church services and religious ceremonies</li></ul>
<p><strong>Care & Longevity</strong></p>
<p>With proper care using quality shoe cream and regular polishing, these shoes will maintain their beauty for decades. Store on cedar shoe trees to maintain shape and absorb moisture. Available in sizes 8-12.</p>`,
    fr: d(`<p>Investissez dans l\\u2019\\u00e9l\\u00e9gance intemporelle avec Cuir Classique Elite, des chaussures habill\\u00e9es manufactur\\u00e9es qui repr\\u00e9sentent le sommet de la cordonnerie traditionnelle.</p>
<p><strong>Cuir italien premium</strong></p>
<p>Provenant des tanneries renomm\\u00e9es de Toscane, le cuir pleine fleur de veau d\\u00e9veloppe une belle patine au fil des ann\\u00e9es de port. Chaque paire raconte sa propre histoire.</p>
<p><strong>Excellence artisanale</strong></p>
<p>Des artisans qualifi\\u00e9s finissent chaque paire \\u00e0 la main, appliquant plusieurs couches de couleur et de cirage pour obtenir le brillant multidimensionnel qui distingue les chaussures artisanales.</p>
<p><strong>Confort moderne \\u00e0 l\\u2019int\\u00e9rieur</strong></p>
<p>Malgr\\u00e9 l\\u2019ext\\u00e9rieur traditionnel, l\\u2019int\\u00e9rieur est enti\\u00e8rement rembourr\\u00e9 avec soutien de la vo\\u00fbte, talon absorbant les chocs et doublure respirante.</p>
<p><strong>Trois coloris sophistiqu\\u00e9s</strong></p>
<ul><li><strong>Marron :</strong> Brun moyen chaud pour occasions professionnelles et sociales</li><li><strong>Noir :</strong> La chaussure formelle essentielle pour les \\u00e9v\\u00e9nements importants</li><li><strong>Beige :</strong> Teinte dor\\u00e9e claire pour mariages d\\u2019\\u00e9t\\u00e9</li></ul>
<p><strong>Polyvalence vestimentaire</strong></p>
<ul><li>R\\u00e9unions et pr\\u00e9sentations professionnelles</li><li>Mariages et c\\u00e9l\\u00e9brations formelles</li><li>\\u00c9v\\u00e9nements en tenue de soir\\u00e9e</li><li>Entretiens d\\u2019embauche</li></ul>
<p><strong>Entretien et long\\u00e9vit\\u00e9</strong></p>
<p>Avec un entretien r\\u00e9gulier au cirage de qualit\\u00e9, ces chaussures garderont leur beaut\\u00e9 pendant des d\\u00e9cennies. Disponibles du 8 au 12.</p>`),
  },

  "20a86447-3627-4e1d-aec5-1b14a59b818d": {
    en: `<p>The Oxford Gentleman is the definitive gentleman shoe, the single pair every man should own. Built with Goodyear welt construction and full-grain leather, these Oxfords represent centuries of shoemaking tradition refined for the modern era.</p>
<p><strong>Goodyear Welt Construction</strong></p>
<p>The Goodyear welt method involves stitching the upper to a leather welt strip, which is then stitched to the outsole. This three-layer construction allows for resoling, meaning these shoes can literally last a lifetime with proper care. It also creates a natural water barrier around the foot.</p>
<p><strong>Full-Grain Leather Excellence</strong></p>
<p>The upper uses the finest grade of leather available, with the full natural grain intact. This material is stronger, more breathable, and develops a more beautiful patina than corrected-grain leather used in lesser shoes.</p>
<p><strong>Closed-Lacing Oxford Design</strong></p>
<p>The quintessential closed-lacing system, where the facing is stitched under the vamp, creates the clean, formal appearance that makes Oxfords the most appropriate shoe for formal occasions.</p>
<p><strong>Three Distinguished Colorways</strong></p>
<ul><li><strong>Black Polish:</strong> The most formal option, appropriate for black tie and boardrooms</li><li><strong>Cognac:</strong> Rich warm brown with amber undertones for daytime elegance</li><li><strong>Oxblood:</strong> Deep burgundy that commands attention while remaining refined</li></ul>
<p><strong>When to Wear Oxfords</strong></p>
<ul><li>Business suits in corporate environments</li><li>Weddings and formal social events</li><li>Black tie affairs paired with a tuxedo</li><li>Job interviews and important meetings</li><li>Religious ceremonies and memorial services</li></ul>
<p><strong>Investment Value</strong></p>
<p>A quality Goodyear-welted Oxford can be resoled 3-5 times during its lifetime, making the cost-per-wear remarkably low compared to cheaper shoes that need replacing annually. These are the most cost-effective dress shoes you will ever own.</p>
<p><strong>Sizing</strong></p>
<p>Available in sizes 8-12. Runs true to size. The leather will stretch slightly to conform to your foot shape during the first weeks of wear.</p>`,
    fr: d(`<p>L\\u2019Oxford Gentleman est la chaussure d\\u00e9finitive de tout gentleman, la paire que chaque homme devrait poss\\u00e9der. Construite en Goodyear welt et cuir pleine fleur, elle repr\\u00e9sente des si\\u00e8cles de tradition cordonni\\u00e8re.</p>
<p><strong>Construction Goodyear welt</strong></p>
<p>La m\\u00e9thode Goodyear welt implique de coudre la tige \\u00e0 une bande tr\\u00e9pointe, puis \\u00e0 la semelle. Cette construction en trois couches permet le ressemelage, ce qui signifie que ces chaussures peuvent litt\\u00e9ralement durer toute une vie.</p>
<p><strong>Excellence cuir pleine fleur</strong></p>
<p>La tige utilise le grade le plus fin de cuir disponible, avec le grain naturel intact. Ce mat\\u00e9riau est plus r\\u00e9sistant, plus respirant et d\\u00e9veloppe une plus belle patine.</p>
<p><strong>Design Oxford \\u00e0 lacets ferm\\u00e9s</strong></p>
<p>Le syst\\u00e8me de lacets ferm\\u00e9s quintessentiel cr\\u00e9e l\\u2019apparence formelle propre qui fait des Oxfords la chaussure la plus appropri\\u00e9e pour les occasions formelles.</p>
<p><strong>Trois coloris distingu\\u00e9s</strong></p>
<ul><li><strong>Noir Poli :</strong> L\\u2019option la plus formelle, pour tenue de soir\\u00e9e et conseil d\\u2019administration</li><li><strong>Cognac :</strong> Brun chaud riche avec des sous-tons ambre</li><li><strong>Bordeaux :</strong> Bourgogne profond qui attire l\\u2019attention tout en restant raffin\\u00e9</li></ul>
<p><strong>Quand porter des Oxfords</strong></p>
<ul><li>Costumes d\\u2019affaires en environnement corporate</li><li>Mariages et \\u00e9v\\u00e9nements sociaux formels</li><li>Soir\\u00e9es en tenue de soir\\u00e9e avec smoking</li><li>Entretiens d\\u2019embauche et r\\u00e9unions importantes</li></ul>
<p><strong>Valeur d\\u2019investissement</strong></p>
<p>Une Oxford Goodyear-welt\\u00e9e de qualit\\u00e9 peut \\u00eatre ressemel\\u00e9e 3 \\u00e0 5 fois durant sa dur\\u00e9e de vie.</p>
<p><strong>Taille</strong></p>
<p>Disponibles du 8 au 12. Fid\\u00e8les \\u00e0 la taille.</p>`),
  },

  "cf3923ed-c866-4abf-9ada-265feeaad757": {
    en: `<p>Step into professional elegance with Derby Prestige, the open-laced dress shoe that combines formal appearance with all-day wearing comfort. Unlike rigid traditional formal shoes, Derby Prestige features design innovations that make professional dressing a pleasure rather than a compromise.</p>
<p><strong>Open-Lacing Versatility</strong></p>
<p>The Derby open-lacing system, where the facing is stitched on top of the vamp, provides a wider opening for easy entry and allows adjustment throughout the day as your feet naturally swell. This construction is slightly less formal than an Oxford but significantly more comfortable for extended wear.</p>
<p><strong>Padded Insole Technology</strong></p>
<p>Hidden beneath the classic leather exterior is a fully cushioned insole with targeted arch support and heel padding. Unlike traditional dress shoes with hard leather soles, Derby Prestige provides athletic-grade comfort for professionals who spend their days on their feet.</p>
<p><strong>Flexible Leather Construction</strong></p>
<p>The specially treated leather upper is softer and more pliable than standard dress shoe leather, requiring virtually no break-in period. Most wearers report full comfort from day one, a rarity in the formal footwear world.</p>
<p><strong>Two Essential Colorways</strong></p>
<ul><li><strong>Black:</strong> The ultimate professional essential that pairs with every suit color</li><li><strong>Dark Brown:</strong> Warm versatility for business casual and formal settings alike</li></ul>
<p><strong>Professional Wear Situations</strong></p>
<ul><li>Daily office wear in corporate environments</li><li>Client meetings and business lunches</li><li>Conference presentations and networking events</li><li>Business casual offices seeking polish</li><li>Semi-formal social events</li></ul>
<p><strong>Sizing</strong></p>
<p>Available in sizes 8-11. True to size with a generous fit that accommodates most foot widths comfortably.</p>`,
    fr: d(`<p>Entrez dans l\\u2019\\u00e9l\\u00e9gance professionnelle avec Derby Prestige, la chaussure habill\\u00e9e \\u00e0 lacets ouverts qui allie apparence formelle et confort toute la journ\\u00e9e.</p>
<p><strong>Polyvalence des lacets ouverts</strong></p>
<p>Le syst\\u00e8me \\u00e0 lacets ouverts du Derby offre une ouverture plus large pour un enfilage facile et un ajustement tout au long de la journ\\u00e9e lorsque vos pieds gonflent naturellement.</p>
<p><strong>Technologie de semelle rembourr\\u00e9e</strong></p>
<p>Cach\\u00e9e sous l\\u2019ext\\u00e9rieur en cuir classique se trouve une semelle enti\\u00e8rement rembourr\\u00e9e avec soutien de la vo\\u00fbte cibl\\u00e9 et rembourrage du talon.</p>
<p><strong>Construction en cuir flexible</strong></p>
<p>Le cuir sp\\u00e9cialement trait\\u00e9 est plus souple que le cuir standard des chaussures habill\\u00e9es, ne n\\u00e9cessitant pratiquement aucune p\\u00e9riode de rodage.</p>
<p><strong>Deux coloris essentiels</strong></p>
<ul><li><strong>Noir :</strong> L\\u2019essentiel professionnel qui s\\u2019accorde avec chaque couleur de costume</li><li><strong>Marron fonc\\u00e9 :</strong> Polyvalence chaleureuse pour les cadres business casual et formels</li></ul>
<p><strong>Situations professionnelles</strong></p>
<ul><li>Port quotidien au bureau corporate</li><li>R\\u00e9unions clients et d\\u00e9jeuners d\\u2019affaires</li><li>Pr\\u00e9sentations en conf\\u00e9rence</li><li>\\u00c9v\\u00e9nements sociaux semi-formels</li></ul>
<p><strong>Taille</strong></p>
<p>Disponibles du 8 au 11. Fid\\u00e8les \\u00e0 la taille avec un ajustement g\\u00e9n\\u00e9reux.</p>`),
  },

  "7af849d3-31b0-460c-81de-7ba9101a6bdd": {
    en: `<p>Slip into effortless sophistication with Loafer Luxe, the penny loafer that elevates casual elegance to an art form. Handcrafted from butter-soft calfskin leather, these loafers deliver the kind of refined comfort that makes you want to wear them every single day.</p>
<p><strong>Butter-Soft Calfskin</strong></p>
<p>The upper is crafted from the finest calfskin leather, selected for its exceptionally soft hand feel and natural luster. Unlike stiff leather that requires weeks of painful break-in, calfskin molds to your foot shape almost immediately, providing a personalized fit from the first wear.</p>
<p><strong>Hand-Stitched Penny Detail</strong></p>
<p>The iconic penny strap is hand-stitched by skilled craftsmen, a time-consuming process that results in superior durability and aesthetic refinement compared to machine-stitched alternatives. This detail is the hallmark of genuine quality.</p>
<p><strong>Slip-On Convenience</strong></p>
<p>No laces, no buckles, no fuss. Simply slide your foot in and you are ready for whatever the day brings. The elasticized throat ensures a secure fit while making removal equally effortless at the end of a long day.</p>
<p><strong>Three Luxury Colorways</strong></p>
<ul><li><strong>Burgundy:</strong> Rich wine tones that command attention in any room</li><li><strong>Navy:</strong> Sophisticated alternative to black for creative professionals</li><li><strong>Camel:</strong> Warm tan perfect for summer suits and resort wear</li></ul>
<p><strong>Styling Versatility</strong></p>
<ul><li>Business casual with chinos and a blazer</li><li>Smart casual with tailored shorts</li><li>Weekend elegance with jeans and a polo</li><li>Resort wear with linen trousers</li><li>Sockless summer style for the confident dresser</li></ul>
<p><strong>Sizing</strong></p>
<p>Available in sizes 8-12. Loafers should fit snugly at first as the leather will stretch and mold. We recommend ordering your exact size or half a size down from your sneaker size.</p>`,
    fr: d(`<p>Glissez dans une sophistication sans effort avec Loafer Luxe, le mocassin penny qui \\u00e9l\\u00e8ve l\\u2019\\u00e9l\\u00e9gance d\\u00e9contract\\u00e9e au rang d\\u2019art. Manufactur\\u00e9 en cuir de veau ultra-souple.</p>
<p><strong>Cuir de veau ultra-souple</strong></p>
<p>La tige est fabriqu\\u00e9e dans le plus fin cuir de veau, s\\u00e9lectionn\\u00e9 pour son toucher exceptionnellement doux et son lustre naturel. Contrairement au cuir rigide, le cuir de veau \\u00e9pouse la forme de votre pied presque imm\\u00e9diatement.</p>
<p><strong>D\\u00e9tail penny cousu main</strong></p>
<p>La bande penny iconique est cousue main par des artisans qualifi\\u00e9s, garantissant une durabilit\\u00e9 et un raffinement esth\\u00e9tique sup\\u00e9rieurs.</p>
<p><strong>Commodit\\u00e9 slip-on</strong></p>
<p>Pas de lacets, pas de boucles, aucun souci. Glissez simplement votre pied et vous \\u00eates pr\\u00eat.</p>
<p><strong>Trois coloris luxueux</strong></p>
<ul><li><strong>Bordeaux :</strong> Tons vin riches qui attirent l\\u2019attention</li><li><strong>Marine :</strong> Alternative sophistiqu\\u00e9e au noir</li><li><strong>Camel :</strong> Beige chaud parfait pour les costumes d\\u2019\\u00e9t\\u00e9</li></ul>
<p><strong>Polyvalence de style</strong></p>
<ul><li>Business casual avec chinos et blazer</li><li>Smart casual avec shorts sur mesure</li><li>\\u00c9l\\u00e9gance week-end avec jean et polo</li><li>Tenues de vill\\u00e9giature avec pantalons en lin</li></ul>
<p><strong>Taille</strong></p>
<p>Disponibles du 8 au 12. Les mocassins doivent \\u00eatre ajust\\u00e9s car le cuir va s\\u2019\\u00e9tirer.</p>`),
  },

  "18a3e8dd-a83a-4b97-8af3-757f4cf7cfdd": {
    en: `<p>Command attention in the boardroom and beyond with Monk Strap Master, the double monk strap shoe that combines bold design with impeccable craftsmanship. For the professional who considers shoes a statement of character, these deliver authority and refinement in equal measure.</p>
<p><strong>Double Monk Strap Design</strong></p>
<p>Two adjustable buckle straps replace traditional laces, creating a distinctive silhouette that sets you apart from colleagues in conventional Oxfords and Derbies. The monk strap design is both fashion-forward and historically rooted, tracing its origins to 15th-century European monasteries.</p>
<p><strong>Premium Buckle Hardware</strong></p>
<p>The polished metal buckles are crafted from solid brass with premium plating, designed to resist tarnishing and maintain their shine through years of daily use. Each buckle is hand-set and tested for smooth operation.</p>
<p><strong>Hand-Burnished Leather Finish</strong></p>
<p>The leather undergoes a hand-burnishing process where craftsmen apply and blend multiple layers of pigment to create a rich, dimensional color that cannot be replicated by machines. The result is a finish with depth and character.</p>
<p><strong>Two Statement Colorways</strong></p>
<ul><li><strong>Mahogany:</strong> Deep reddish-brown with warm undertones for maximum visual impact</li><li><strong>Black:</strong> Formal and authoritative for the most important occasions</li></ul>
<p><strong>Style Authority</strong></p>
<ul><li>Corporate environments where you want to stand out tastefully</li><li>Client-facing roles where confidence matters</li><li>Fashion-forward professional settings</li><li>Evening events and cocktail parties</li><li>Creative industries that value personal expression</li></ul>
<p><strong>Sizing</strong></p>
<p>Available in sizes 8-11. The buckle closure allows for fit adjustment throughout the day. True to dress shoe sizing, order your normal formal shoe size.</p>`,
    fr: d(`<p>Attirez l\\u2019attention dans la salle de conf\\u00e9rence et au-del\\u00e0 avec Monk Strap Master, la chaussure \\u00e0 double boucle qui allie design audacieux et artisanat impeccable.</p>
<p><strong>Design double boucle monk strap</strong></p>
<p>Deux brides \\u00e0 boucle ajustables remplacent les lacets traditionnels, cr\\u00e9ant une silhouette distinctive qui vous d\\u00e9marque. Le design monk strap est \\u00e0 la fois avant-gardiste et historiquement ancr\\u00e9, tra\\u00e7ant ses origines dans les monast\\u00e8res europ\\u00e9ens du XVe si\\u00e8cle.</p>
<p><strong>Quincaillerie boucle premium</strong></p>
<p>Les boucles en m\\u00e9tal poli sont fabriqu\\u00e9es en laiton massif avec plaquage premium, con\\u00e7ues pour r\\u00e9sister au ternissement.</p>
<p><strong>Finition cuir bross\\u00e9 main</strong></p>
<p>Le cuir subit un processus de brossage \\u00e0 la main o\\u00f9 les artisans appliquent plusieurs couches de pigment pour cr\\u00e9er une couleur riche et dimensionnelle.</p>
<p><strong>Deux coloris statement</strong></p>
<ul><li><strong>Acajou :</strong> Brun-rouge profond avec sous-tons chauds pour un impact visuel maximum</li><li><strong>Noir :</strong> Formel et autoritaire pour les occasions les plus importantes</li></ul>
<p><strong>Autorit\\u00e9 de style</strong></p>
<ul><li>Environnements corporate o\\u00f9 vous voulez vous d\\u00e9marquer avec go\\u00fbt</li><li>R\\u00f4les face au client o\\u00f9 la confiance compte</li><li>Industries cr\\u00e9atives valorisant l\\u2019expression personnelle</li></ul>
<p><strong>Taille</strong></p>
<p>Disponibles du 8 au 11. La fermeture \\u00e0 boucle permet un ajustement tout au long de la journ\\u00e9e.</p>`),
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
        results.push({ id: product.id, name: product.name, status: "skipped - batch 3", changes: [] });
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
        results.push({ id: product.id, name: product.name, status: "already has content", changes: [] });
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
      batch: 2,
      summary: { total: allProducts.length, updated, skipped, errors },
      results,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}