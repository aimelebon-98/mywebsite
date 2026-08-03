import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

function d(s: string): string {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

const LONG_DESC: Record<string, { en: string; fr: string }> = {

  // ==================== FORMAL (remaining) ====================

  "49025494-c0b0-4800-8443-ebab417635e5": {
    en: `<p>Command the room at your most important formal events with Patent Gala, the mirror-finish patent leather shoe designed for black tie occasions and evening elegance. When the invitation says formal, these shoes exceed expectations.</p>
<p><strong>Mirror-Finish Patent Leather</strong></p>
<p>The signature high-gloss patent leather reflects light with the intensity of polished marble. This distinctive finish is achieved through a specialized coating process that creates the smooth, mirror-like surface impossible to replicate with traditional leather polishing.</p>
<p><strong>Sleek Pointed Toe</strong></p>
<p>The elongated pointed toe creates a lengthening visual effect and communicates formal sophistication. This silhouette has been favored by fashion-forward men for evening wear for over a century.</p>
<p><strong>Occasion-Specific Excellence</strong></p>
<p>Patent Gala is engineered for events where standard dress shoes fall short. Black tie galas, formal weddings, opera premieres, and state dinners all demand the extra sophistication that patent leather provides.</p>
<p><strong>Two Evening Colorways</strong></p>
<ul><li><strong>Black Patent:</strong> The essential formal evening shoe, appropriate for all black tie affairs</li><li><strong>Midnight Blue:</strong> A modern alternative that photographs beautifully in artificial light</li></ul>
<p><strong>When to Wear Patent Gala</strong></p>
<ul><li>Black tie weddings and receptions</li><li>Charity galas and fundraisers</li><li>Opera premieres and theater openings</li><li>Award ceremonies and state functions</li><li>Formal New Year Eve celebrations</li></ul>
<p><strong>Care Requirements</strong></p>
<p>Patent leather requires different care than traditional leather. Wipe clean with a soft microfiber cloth. For scuffs, use a specialized patent leather cleaner. Store in the original box with the included shoe bags to prevent scratches. Available in sizes 8-12.</p>`,
    fr: d(`<p>Dominez la salle lors de vos \\u00e9v\\u00e9nements formels les plus importants avec Patent Gala, la chaussure en cuir verni miroir con\\u00e7ue pour les occasions en tenue de soir\\u00e9e.</p>
<p><strong>Cuir verni finition miroir</strong></p>
<p>Le cuir verni haute brillance signature refl\\u00e8te la lumi\\u00e8re avec l\\u2019intensit\\u00e9 du marbre poli. Cette finition distinctive est obtenue par un proc\\u00e9d\\u00e9 de rev\\u00eatement sp\\u00e9cialis\\u00e9.</p>
<p><strong>Bout pointu \\u00e9pur\\u00e9</strong></p>
<p>Le bout pointu allong\\u00e9 cr\\u00e9e un effet visuel d\\u2019allongement et communique une sophistication formelle. Cette silhouette est privil\\u00e9gi\\u00e9e par les hommes avant-gardistes pour les tenues de soir\\u00e9e depuis plus d\\u2019un si\\u00e8cle.</p>
<p><strong>Excellence sp\\u00e9cifique aux occasions</strong></p>
<p>Patent Gala est con\\u00e7ue pour les \\u00e9v\\u00e9nements o\\u00f9 les chaussures habill\\u00e9es standard sont insuffisantes.</p>
<p><strong>Deux coloris de soir\\u00e9e</strong></p>
<ul><li><strong>Noir Verni :</strong> La chaussure de soir\\u00e9e formelle essentielle</li><li><strong>Bleu Nuit :</strong> Alternative moderne qui photographie magnifiquement</li></ul>
<p><strong>Quand porter Patent Gala</strong></p>
<ul><li>Mariages en tenue de soir\\u00e9e</li><li>Galas de charit\\u00e9 et collectes de fonds</li><li>Premi\\u00e8res d\\u2019op\\u00e9ra et ouvertures de th\\u00e9\\u00e2tre</li><li>C\\u00e9r\\u00e9monies de remise de prix</li></ul>
<p><strong>Exigences d\\u2019entretien</strong></p>
<p>Nettoyez avec un chiffon microfibre doux. Pour les \\u00e9raflures, utilisez un nettoyant sp\\u00e9cialis\\u00e9 pour cuir verni. Disponibles du 8 au 12.</p>`),
  },

  "6e0f4f74-1159-440c-bc56-2d3952c28bc7": {
    en: `<p>Celebrate the golden era of British shoemaking with Brogue Heritage, a full-brogue wingtip that pays homage to over a century of formal footwear tradition. These shoes represent the perfect intersection of ornate craftsmanship and everyday wearability.</p>
<p><strong>Full-Brogue Wingtip Design</strong></p>
<p>The distinctive W-shaped toe cap extends along both sides of the shoe, decorated with intricate perforations known as broguing. Originally functional to allow water drainage in Scottish and Irish bogs, these perforations are now purely decorative and instantly recognizable.</p>
<p><strong>Cushioned Footbed</strong></p>
<p>Unlike traditional brogues that prioritize aesthetics over comfort, Brogue Heritage includes a fully cushioned footbed with arch support and heel padding. You get the classic look with modern comfort technology hidden inside.</p>
<p><strong>Flexible Dainite Sole</strong></p>
<p>The rubber studded Dainite sole provides better grip than leather while maintaining the formal appearance appropriate for business wear. This British-invented sole material has been the choice of discerning gentlemen since 1910.</p>
<p><strong>Three Heritage Colorways</strong></p>
<ul><li><strong>Walnut:</strong> Rich medium brown with warm amber undertones</li><li><strong>Black:</strong> Classic formal for the most conservative environments</li><li><strong>Tan:</strong> Light golden brown ideal for spring and summer wear</li></ul>
<p><strong>Traditional Occasions</strong></p>
<ul><li>Business meetings requiring polished professionalism</li><li>Country weddings and outdoor formal events</li><li>Race days and social sporting events</li><li>Weekend brunches with elevated dress codes</li><li>Traditional business casual environments</li></ul>
<p><strong>Sizing</strong></p>
<p>Available in sizes 8-12. True to size. The Goodyear welt construction allows for resoling, extending the life of these shoes to decades of wear.</p>`,
    fr: d(`<p>C\\u00e9l\\u00e9brez l\\u2019\\u00e2ge d\\u2019or de la cordonnerie britannique avec Brogue Heritage, un wingtip full-brogue rendant hommage \\u00e0 plus d\\u2019un si\\u00e8cle de tradition formelle.</p>
<p><strong>Design wingtip full-brogue</strong></p>
<p>Le distinctif bout en W s\\u2019\\u00e9tend le long des deux c\\u00f4t\\u00e9s de la chaussure, d\\u00e9cor\\u00e9 de perforations complexes appel\\u00e9es broguing. Ces perforations \\u00e9taient \\u00e0 l\\u2019origine fonctionnelles pour permettre le drainage de l\\u2019eau.</p>
<p><strong>Semelle int\\u00e9rieure rembourr\\u00e9e</strong></p>
<p>Contrairement aux brogues traditionnels, Brogue Heritage inclut une semelle enti\\u00e8rement rembourr\\u00e9e avec soutien de la vo\\u00fbte.</p>
<p><strong>Semelle Dainite flexible</strong></p>
<p>La semelle Dainite en caoutchouc offre une meilleure adh\\u00e9rence que le cuir tout en maintenant l\\u2019apparence formelle.</p>
<p><strong>Trois coloris h\\u00e9ritage</strong></p>
<ul><li><strong>Noyer :</strong> Brun moyen riche avec sous-tons ambre chauds</li><li><strong>Noir :</strong> Formel classique pour les environnements les plus conservateurs</li><li><strong>Beige :</strong> Brun dor\\u00e9 clair id\\u00e9al pour le printemps et l\\u2019\\u00e9t\\u00e9</li></ul>
<p><strong>Occasions traditionnelles</strong></p>
<ul><li>R\\u00e9unions d\\u2019affaires exigeant du professionnalisme poli</li><li>Mariages \\u00e0 la campagne et \\u00e9v\\u00e9nements formels ext\\u00e9rieurs</li><li>Jours de course et \\u00e9v\\u00e9nements sportifs sociaux</li></ul>
<p><strong>Taille</strong></p>
<p>Disponibles du 8 au 12. Fid\\u00e8les \\u00e0 la taille.</p>`),
  },

  "4d0d121c-bc16-4529-90a5-3a702c07b55a": {
    en: `<p>Bridge the gap between casual and formal with Chelsea Formal, versatile boots that transition effortlessly from business meetings to weekend social events. These are not just boots, they are the sophisticated solution for the modern gentleman.</p>
<p><strong>Elastic Side Panels</strong></p>
<p>The signature elastic gussets provide easy on-off functionality while creating a sleek silhouette that laced boots cannot match. The tension is calibrated to hug your foot securely without creating pressure points that plague cheaper Chelsea boots.</p>
<p><strong>Pull-Tab Convenience</strong></p>
<p>The rear pull tab makes putting on Chelsea Formal quick and effortless, even when your hands are full or you are in a hurry. This small detail transforms daily use from routine to enjoyable.</p>
<p><strong>Polished Leather Construction</strong></p>
<p>The upper features hand-polished full-grain leather with a subtle sheen that reads as sophisticated without being ostentatious. The leather develops character over years of wear, becoming more beautiful with age.</p>
<p><strong>Three Versatile Colorways</strong></p>
<ul><li><strong>Black:</strong> The most formal option, appropriate with suits and dark denim</li><li><strong>Espresso:</strong> Deep rich brown with universal versatility</li><li><strong>Sand:</strong> Light neutral perfect for warmer weather styling</li></ul>
<p><strong>Style Versatility</strong></p>
<ul><li>Business casual with chinos and blazers</li><li>Semi-formal with wool trousers and knitwear</li><li>Weekend elegant with dark denim</li><li>Layered under trouser hems for polished styling</li><li>Under suits for modern professional looks</li></ul>
<p><strong>Sizing</strong></p>
<p>Available in sizes 8-11. Chelsea boots should fit snugly at first as the elastic will relax and the leather will conform. Order true to size for optimal long-term fit.</p>`,
    fr: d(`<p>Comblez l\\u2019\\u00e9cart entre casual et formel avec Chelsea Formal, des bottes polyvalentes qui passent sans effort des r\\u00e9unions d\\u2019affaires aux \\u00e9v\\u00e9nements sociaux du week-end.</p>
<p><strong>Panneaux \\u00e9lastiques lat\\u00e9raux</strong></p>
<p>Les soufflets \\u00e9lastiques signature offrent une fonctionnalit\\u00e9 d\\u2019enfilage facile tout en cr\\u00e9ant une silhouette \\u00e9pur\\u00e9e que les bottes \\u00e0 lacets ne peuvent \\u00e9galer.</p>
<p><strong>Commodit\\u00e9 du tirant arri\\u00e8re</strong></p>
<p>Le tirant arri\\u00e8re rend l\\u2019enfilage rapide et sans effort.</p>
<p><strong>Construction cuir poli</strong></p>
<p>La tige pr\\u00e9sente un cuir pleine fleur poli \\u00e0 la main avec un l\\u00e9ger \\u00e9clat.</p>
<p><strong>Trois coloris polyvalents</strong></p>
<ul><li><strong>Noir :</strong> L\\u2019option la plus formelle</li><li><strong>Espresso :</strong> Brun profond riche</li><li><strong>Sable :</strong> Neutre clair parfait pour le temps chaud</li></ul>
<p><strong>Polyvalence de style</strong></p>
<ul><li>Business casual avec chinos et blazers</li><li>Semi-formel avec pantalons en laine</li><li>\\u00c9l\\u00e9gance week-end avec jean fonc\\u00e9</li></ul>
<p><strong>Taille</strong></p>
<p>Disponibles du 8 au 11.</p>`),
  },

  // ==================== BOOTS ====================

  "63bd9f53-bf11-49f5-b5a0-23c0dbc535ef": {
    en: `<p>Conquer any trail with Trail Blazer X, the waterproof hiking boot engineered for adventurers who refuse to let weather or terrain limit their explorations. From muddy trails to rocky ridges, these boots deliver confidence with every step.</p>
<p><strong>Waterproof Construction</strong></p>
<p>The seam-sealed waterproof membrane keeps water out during stream crossings, rain hikes, and wet grass mornings while allowing sweat vapor to escape. Your feet stay dry from both external moisture and internal perspiration.</p>
<p><strong>Aggressive Tread Pattern</strong></p>
<p>The multi-directional lug pattern is engineered for maximum traction on diverse terrain. Deep 6mm lugs bite into soft ground while the varied lug shapes provide grip on rocks, roots, and slick surfaces.</p>
<p><strong>Reinforced Toe Cap</strong></p>
<p>The rubberized toe cap protects your toes from impacts with rocks and roots on rough trails. This protection is critical for backpackers carrying heavy loads and hikers navigating technical terrain.</p>
<p><strong>Three Trail Colorways</strong></p>
<ul><li><strong>Brown:</strong> Classic hiking aesthetic that hides trail dust</li><li><strong>Dark Green:</strong> Natural camouflage for wildlife photography</li><li><strong>Black:</strong> Versatile choice for mixed adventure use</li></ul>
<p><strong>Perfect For</strong></p>
<ul><li>Day hiking and multi-day backpacking</li><li>Trail running with heavy grip needs</li><li>Camping and outdoor exploration</li><li>Snow and mud conditions</li><li>National park adventures</li></ul>
<p><strong>Sizing</strong></p>
<p>Available in sizes 8-12. We recommend going half a size up to accommodate thick hiking socks and foot swelling during long treks.</p>`,
    fr: d(`<p>Conqu\\u00e9rez tout sentier avec Pionnier de Sentier X, la botte de randonn\\u00e9e imperm\\u00e9able con\\u00e7ue pour les aventuriers.</p>
<p><strong>Construction imperm\\u00e9able</strong></p>
<p>La membrane imperm\\u00e9able \\u00e0 coutures scell\\u00e9es garde l\\u2019eau \\u00e0 l\\u2019ext\\u00e9rieur pendant les travers\\u00e9es de ruisseaux, les randonn\\u00e9es sous la pluie et les matins d\\u2019herbe mouill\\u00e9e.</p>
<p><strong>Motif de bande de roulement agressif</strong></p>
<p>Le motif multidirectionnel est con\\u00e7u pour une traction maximale sur terrains divers. Les crampons profonds de 6 mm s\\u2019enfoncent dans le sol meuble.</p>
<p><strong>Bout renforc\\u00e9</strong></p>
<p>Le bout caoutchout\\u00e9 prot\\u00e8ge vos orteils des impacts avec les rochers et les racines.</p>
<p><strong>Trois coloris sentier</strong></p>
<ul><li><strong>Marron :</strong> Esth\\u00e9tique randonn\\u00e9e classique qui cache la poussi\\u00e8re</li><li><strong>Vert Fonc\\u00e9 :</strong> Camouflage naturel pour la photographie animali\\u00e8re</li><li><strong>Noir :</strong> Choix polyvalent</li></ul>
<p><strong>Parfait pour</strong></p>
<ul><li>Randonn\\u00e9e d\\u2019une journ\\u00e9e et sur plusieurs jours</li><li>Trail avec besoins d\\u2019adh\\u00e9rence importants</li><li>Camping et exploration ext\\u00e9rieure</li></ul>
<p><strong>Taille</strong></p>
<p>Disponibles du 8 au 12. Prenez une demi-taille au-dessus.</p>`),
  },

  "5ce42e69-821b-434d-b704-50ea3d72005e": {
    en: `<p>Elevate your urban style with Urban Chelsea, premium suede Chelsea boots designed for the modern city dweller. These are the boots you reach for when you want to look effortlessly put-together without appearing overdressed.</p>
<p><strong>Premium Suede Construction</strong></p>
<p>The upper is crafted from luxurious full-grain suede that develops a rich patina over time. Unlike synthetic alternatives, genuine suede breathes naturally and can be refreshed with proper brushing.</p>
<p><strong>Elastic Side Panels</strong></p>
<p>The signature Chelsea elastic gussets provide easy on-off functionality while maintaining a secure fit. The clean silhouette works with both slim and straight-leg pants.</p>
<p><strong>Stacked Leather Heel</strong></p>
<p>The traditional stacked leather heel adds subtle height while providing durability and classic aesthetics. This construction method has been used in premium footwear for over a century.</p>
<p><strong>Three City-Ready Colorways</strong></p>
<ul><li><strong>Tan:</strong> Warm caramel tone perfect for autumn and spring styling</li><li><strong>Black:</strong> Ultimate versatility for any urban outfit</li><li><strong>Gray:</strong> Modern sophistication that pairs with contemporary wardrobes</li></ul>
<p><strong>Style Guide</strong></p>
<ul><li>Slim jeans and a bomber jacket for weekend cool</li><li>Chinos and a button-down for smart casual</li><li>Wool trousers and a blazer for elevated business casual</li><li>Under suit pants for a modern professional twist</li></ul>
<p><strong>Suede Care</strong></p>
<p>Brush regularly with a suede brush to maintain the nap. Use suede protector spray before first wear and reapply monthly. Available in sizes 7-12.</p>`,
    fr: d(`<p>\\u00c9levez votre style urbain avec Urbain Chelsea, des boots Chelsea en su\\u00e8de premium con\\u00e7ues pour le citadin moderne.</p>
<p><strong>Construction su\\u00e8de premium</strong></p>
<p>La tige est fabriqu\\u00e9e en su\\u00e8de pleine fleur luxueux qui d\\u00e9veloppe une riche patine avec le temps.</p>
<p><strong>Panneaux \\u00e9lastiques lat\\u00e9raux</strong></p>
<p>Les soufflets \\u00e9lastiques signature Chelsea offrent une fonctionnalit\\u00e9 d\\u2019enfilage facile.</p>
<p><strong>Talon en cuir empil\\u00e9</strong></p>
<p>Le talon traditionnel en cuir empil\\u00e9 ajoute une hauteur subtile tout en offrant durabilit\\u00e9 et esth\\u00e9tique classique.</p>
<p><strong>Trois coloris pr\\u00eats pour la ville</strong></p>
<ul><li><strong>Beige :</strong> Ton caramel chaud parfait pour l\\u2019automne et le printemps</li><li><strong>Noir :</strong> Polyvalence ultime</li><li><strong>Gris :</strong> Sophistication moderne</li></ul>
<p><strong>Guide de style</strong></p>
<ul><li>Jean slim et blouson pour un cool week-end</li><li>Chinos et chemise pour smart casual</li><li>Pantalons en laine et blazer pour business casual \\u00e9lev\\u00e9</li></ul>
<p><strong>Entretien du su\\u00e8de</strong></p>
<p>Brossez r\\u00e9guli\\u00e8rement avec une brosse \\u00e0 su\\u00e8de. Disponibles du 7 au 12.</p>`),
  },

  "c96bcec6-031c-402a-9ee7-ec0b65d0f084": {
    en: `<p>Never let rain ruin your day with Rain Guardian, waterproof rubber boots that keep you dry and stylish through the worst weather. These are not the utilitarian rain boots of your childhood, they are refined footwear engineered for adults who demand both function and fashion.</p>
<p><strong>Fully Waterproof Construction</strong></p>
<p>The seamless natural rubber construction provides absolute waterproofing that no membrane-based shoe can match. From puddle jumping to standing in torrential downpours, your feet stay completely dry.</p>
<p><strong>Neoprene Lining for Warmth</strong></p>
<p>The interior features a soft neoprene lining that provides insulation while wicking moisture away from your feet. This lining makes Rain Guardian appropriate for cold, wet conditions where standard rain boots would leave your feet freezing.</p>
<p><strong>Non-Slip Outsole</strong></p>
<p>The aggressive tread pattern provides exceptional grip on wet surfaces including tile, stone, and painted concrete. This safety feature is critical since many rain-related injuries occur from slipping, not from getting wet.</p>
<p><strong>Four Weather-Ready Colorways</strong></p>
<ul><li><strong>Hunter Green:</strong> Classic outdoor aesthetic with British countryside heritage</li><li><strong>Navy:</strong> Sophisticated deep blue that pairs with any wardrobe</li><li><strong>Black:</strong> Ultimate versatility for professional wear in bad weather</li><li><strong>Red:</strong> Bold statement color that brightens gloomy days</li></ul>
<p><strong>Perfect For</strong></p>
<ul><li>Rainy commutes and outdoor errands</li><li>Garden work and yard maintenance</li><li>Music festivals in wet conditions</li><li>Farmers markets and outdoor events</li><li>Boat trips and coastal walks</li></ul>
<p><strong>Sizing</strong></p>
<p>Available in sizes 6-12. Fits true to size with room for thick socks. Easy pull-on design with no laces or zippers to fail.</p>`,
    fr: d(`<p>Ne laissez jamais la pluie g\\u00e2cher votre journ\\u00e9e avec Gardien de Pluie, des bottes en caoutchouc imperm\\u00e9ables qui vous gardent au sec et stylish.</p>
<p><strong>Construction totalement imperm\\u00e9able</strong></p>
<p>La construction en caoutchouc naturel sans coutures offre une imperm\\u00e9abilit\\u00e9 absolue.</p>
<p><strong>Doublure n\\u00e9opr\\u00e8ne chaude</strong></p>
<p>L\\u2019int\\u00e9rieur pr\\u00e9sente une doublure en n\\u00e9opr\\u00e8ne souple qui fournit une isolation tout en \\u00e9vacuant l\\u2019humidit\\u00e9.</p>
<p><strong>Semelle antid\\u00e9rapante</strong></p>
<p>Le motif de bande de roulement agressif offre une adh\\u00e9rence exceptionnelle sur les surfaces mouill\\u00e9es.</p>
<p><strong>Quatre coloris pr\\u00eats pour la m\\u00e9t\\u00e9o</strong></p>
<ul><li><strong>Vert Chasseur :</strong> Esth\\u00e9tique outdoor classique</li><li><strong>Marine :</strong> Bleu profond sophistiqu\\u00e9</li><li><strong>Noir :</strong> Polyvalence ultime</li><li><strong>Rouge :</strong> Couleur statement audacieuse</li></ul>
<p><strong>Parfait pour</strong></p>
<ul><li>Trajets pluvieux et courses ext\\u00e9rieures</li><li>Travaux de jardinage</li><li>Festivals de musique par temps humide</li><li>March\\u00e9s de producteurs et \\u00e9v\\u00e9nements ext\\u00e9rieurs</li></ul>
<p><strong>Taille</strong></p>
<p>Disponibles du 6 au 12.</p>`),
  },

  "f0a78557-6e1f-4618-b6ff-9d2f4624eec2": {
    en: `<p>Reach new heights with Summit Peak, professional-grade mountaineering boots engineered for serious alpine adventures. When your objective is a peak, glacier, or technical climb, these boots deliver the performance and protection that lesser footwear simply cannot provide.</p>
<p><strong>Vibram Soles</strong></p>
<p>The legendary Vibram outsole is engineered specifically for mountaineering, with widely spaced lugs that grip rock and hard snow while shedding mud and debris. The rubber compound remains flexible in freezing temperatures.</p>
<p><strong>Crampon-Compatible Design</strong></p>
<p>The rigid sole and stiff heel welt accommodate both automatic and semi-automatic crampons, making Summit Peak appropriate for glacier travel, ice climbing, and technical winter ascents.</p>
<p><strong>Gore-Tex Waterproof Lining</strong></p>
<p>The Gore-Tex membrane provides absolute waterproofing while allowing perspiration to escape, keeping your feet dry in wet snow, rain, and stream crossings. This technology is essential for extended alpine efforts.</p>
<p><strong>Two Alpine Colorways</strong></p>
<ul><li><strong>Gray/Blue:</strong> Classic mountaineering aesthetic with modern styling</li><li><strong>Black/Orange:</strong> High-visibility option for rescue and safety-conscious climbers</li></ul>
<p><strong>Serious Adventure Applications</strong></p>
<ul><li>Alpine mountaineering and technical climbs</li><li>Glacier travel and crevasse rescue</li><li>Ice climbing and mixed routes</li><li>Winter backpacking and snowshoeing</li><li>Cold-weather expedition support</li></ul>
<p><strong>Break-In Required</strong></p>
<p>Unlike casual boots, Summit Peak requires a proper break-in period of 15-20 miles of easier hiking before serious alpine use. This allows the stiff construction to conform to your feet without creating pressure points during critical moments in the mountains.</p>
<p><strong>Sizing</strong></p>
<p>Available in sizes 8-12. Order half a size up to accommodate thick mountaineering socks and foot swelling at altitude.</p>`,
    fr: d(`<p>Atteignez de nouveaux sommets avec Summit Peak, des chaussures d\\u2019alpinisme de qualit\\u00e9 professionnelle con\\u00e7ues pour les aventures alpines s\\u00e9rieuses.</p>
<p><strong>Semelles Vibram</strong></p>
<p>La l\\u00e9gendaire semelle Vibram est con\\u00e7ue sp\\u00e9cifiquement pour l\\u2019alpinisme, avec des crampons espac\\u00e9s qui adh\\u00e8rent au rocher et \\u00e0 la neige dure.</p>
<p><strong>Design compatible crampons</strong></p>
<p>La semelle rigide accueille les crampons automatiques et semi-automatiques, rendant Summit Peak appropri\\u00e9e pour la travers\\u00e9e de glacier et l\\u2019escalade sur glace.</p>
<p><strong>Doublure imperm\\u00e9able Gore-Tex</strong></p>
<p>La membrane Gore-Tex offre une imperm\\u00e9abilit\\u00e9 absolue tout en permettant l\\u2019\\u00e9vacuation de la transpiration.</p>
<p><strong>Deux coloris alpins</strong></p>
<ul><li><strong>Gris/Bleu :</strong> Esth\\u00e9tique classique d\\u2019alpinisme</li><li><strong>Noir/Orange :</strong> Option haute visibilit\\u00e9</li></ul>
<p><strong>Applications d\\u2019aventure s\\u00e9rieuse</strong></p>
<ul><li>Alpinisme et escalades techniques</li><li>Travers\\u00e9e de glacier</li><li>Escalade sur glace et voies mixtes</li></ul>
<p><strong>Rodage requis</strong></p>
<p>Summit Peak n\\u00e9cessite une p\\u00e9riode de rodage de 25-30 km avant utilisation alpine s\\u00e9rieuse.</p>
<p><strong>Taille</strong></p>
<p>Disponibles du 8 au 12. Commandez une demi-taille au-dessus.</p>`),
  },

  "f850276f-1e53-4e2b-98fb-89e7dea20a08": {
    en: `<p>Work hard, look great with Lumberjack Pro, professional-grade work boots that combine safety features with rugged style. These are not just work boots, they are the reliable footwear that keeps you protected and comfortable through the most demanding jobs.</p>
<p><strong>Steel Toe Protection</strong></p>
<p>The ASTM-certified steel toe cap protects your toes from impact and compression injuries, meeting industrial safety standards for construction, warehouse, and manufacturing environments.</p>
<p><strong>Waterproof Leather Upper</strong></p>
<p>The full-grain leather upper is treated for waterproofing while retaining the natural breathability of leather. Your feet stay dry from external water while sweat can escape naturally.</p>
<p><strong>Anti-Fatigue Insole Technology</strong></p>
<p>The specially engineered insole reduces fatigue during long shifts by providing responsive cushioning that returns energy with each step. Workers report significantly less end-of-day foot fatigue compared to standard work boots.</p>
<p><strong>Three Professional Colorways</strong></p>
<ul><li><strong>Wheat:</strong> Classic work boot aesthetic that hides trail dust</li><li><strong>Dark Brown:</strong> Refined option that works from job site to social settings</li><li><strong>Black:</strong> Formal work boot for professional environments</li></ul>
<p><strong>Perfect For Work Environments</strong></p>
<ul><li>Construction sites requiring safety toe</li><li>Warehouse and logistics operations</li><li>Manufacturing and industrial settings</li><li>Landscaping and outdoor work</li><li>Ranch and agricultural duties</li></ul>
<p><strong>Oil and Slip Resistant</strong></p>
<p>The rubber outsole meets ASTM standards for slip and oil resistance, providing critical traction in wet, oily, or debris-covered work surfaces.</p>
<p><strong>Sizing</strong></p>
<p>Available in sizes 8-13. Runs true to size. Steel toe boots benefit from thick moisture-wicking socks for optimal comfort.</p>`,
    fr: d(`<p>Travaillez dur, ayez fi\\u00e8re allure avec Lumberjack Pro, des bottes de travail professionnelles qui combinent s\\u00e9curit\\u00e9 et style robuste.</p>
<p><strong>Protection bout acier</strong></p>
<p>Le bout en acier certifi\\u00e9 ASTM prot\\u00e8ge vos orteils des blessures par impact et compression.</p>
<p><strong>Tige en cuir imperm\\u00e9able</strong></p>
<p>La tige en cuir pleine fleur est trait\\u00e9e pour l\\u2019imperm\\u00e9abilit\\u00e9 tout en conservant la respirabilit\\u00e9 naturelle du cuir.</p>
<p><strong>Technologie semelle anti-fatigue</strong></p>
<p>La semelle sp\\u00e9cialement con\\u00e7ue r\\u00e9duit la fatigue durant les longs quarts de travail.</p>
<p><strong>Trois coloris professionnels</strong></p>
<ul><li><strong>Bl\\u00e9 :</strong> Esth\\u00e9tique botte de travail classique</li><li><strong>Marron Fonc\\u00e9 :</strong> Option raffin\\u00e9e</li><li><strong>Noir :</strong> Botte de travail formelle</li></ul>
<p><strong>Parfait pour les environnements de travail</strong></p>
<ul><li>Chantiers de construction</li><li>Op\\u00e9rations d\\u2019entrep\\u00f4t et logistique</li><li>Environnements de fabrication industrielle</li></ul>
<p><strong>R\\u00e9sistante \\u00e0 l\\u2019huile et antid\\u00e9rapante</strong></p>
<p>La semelle en caoutchouc r\\u00e9pond aux normes ASTM.</p>
<p><strong>Taille</strong></p>
<p>Disponibles du 8 au 13.</p>`),
  },

  "91863bdc-2550-474f-aaab-e57d13368d5e": {
    en: `<p>Embrace your rebellious spirit with Moto Rebel, motorcycle-inspired boots that combine functional protection with iconic biker aesthetics. Whether you ride motorcycles or just love the timeless attitude they represent, these boots deliver.</p>
<p><strong>Heavy-Duty Hardware</strong></p>
<p>The buckles, straps, and metal accents are crafted from heavy-gauge steel with black or antique brass finishes. These are not decorative elements, they are functional hardware built to last decades of hard use.</p>
<p><strong>Oil-Resistant Sole</strong></p>
<p>The specialized rubber sole resists degradation from motor oil, gasoline, and industrial chemicals that would destroy standard footwear. This makes Moto Rebel practical for garage work, mechanic duties, and industrial environments.</p>
<p><strong>Vintage-Distressed Leather</strong></p>
<p>The leather is pre-distressed using traditional techniques to give each pair a broken-in, lived-in appearance from day one. This process also softens the leather, making them comfortable immediately without breaking-in.</p>
<p><strong>Two Rebel Colorways</strong></p>
<ul><li><strong>Distressed Brown:</strong> Warm patina with authentic character</li><li><strong>Aged Black:</strong> Timeless outlaw aesthetic</li></ul>
<p><strong>Perfect For</strong></p>
<ul><li>Motorcycle riding and biker events</li><li>Rock concerts and music festivals</li><li>Custom garage and workshop wear</li><li>Making a bold personal style statement</li><li>Anyone who appreciates authentic craftsmanship</li></ul>
<p><strong>Ankle Support Where It Matters</strong></p>
<p>The tall shaft and reinforced ankle construction provide the protection motorcyclists need without sacrificing the wearability that everyday wearers appreciate.</p>
<p><strong>Sizing</strong></p>
<p>Available in sizes 8-12. True to size. The distressed leather has some initial flexibility that will develop character with your specific wear patterns.</p>`,
    fr: d(`<p>Adoptez votre esprit rebelle avec Moto Rebel, des bottes d\\u2019inspiration motard qui combinent protection fonctionnelle et esth\\u00e9tique biker ic\\u00f4nique.</p>
<p><strong>Quincaillerie robuste</strong></p>
<p>Les boucles, sangles et accents m\\u00e9talliques sont fabriqu\\u00e9s en acier haute r\\u00e9sistance.</p>
<p><strong>Semelle r\\u00e9sistante \\u00e0 l\\u2019huile</strong></p>
<p>La semelle en caoutchouc sp\\u00e9cialis\\u00e9e r\\u00e9siste \\u00e0 la d\\u00e9gradation par l\\u2019huile moteur, l\\u2019essence et les produits chimiques industriels.</p>
<p><strong>Cuir vieilli vintage</strong></p>
<p>Le cuir est pr\\u00e9-vieilli utilisant des techniques traditionnelles pour donner \\u00e0 chaque paire une apparence rod\\u00e9e d\\u00e8s le premier jour.</p>
<p><strong>Deux coloris rebelles</strong></p>
<ul><li><strong>Marron Vieilli :</strong> Patine chaude avec caract\\u00e8re authentique</li><li><strong>Noir Age :</strong> Esth\\u00e9tique hors-la-loi intemporelle</li></ul>
<p><strong>Parfait pour</strong></p>
<ul><li>Conduite de moto et \\u00e9v\\u00e9nements biker</li><li>Concerts rock et festivals de musique</li><li>Port en garage et atelier</li></ul>
<p><strong>Soutien de cheville</strong></p>
<p>La tige haute et la construction renforc\\u00e9e fournissent la protection dont les motards ont besoin.</p>
<p><strong>Taille</strong></p>
<p>Disponibles du 8 au 12.</p>`),
  },

  "b22bcbcb-29cf-4552-9981-88a0f904f47d": {
    en: `<p>Mission-ready and built for anything with Tactical Force, professional tactical boots designed for military personnel, security professionals, and outdoor enthusiasts who demand uncompromising performance in demanding environments.</p>
<p><strong>Side-Zip Entry</strong></p>
<p>The YKK military-grade side zipper allows fast entry and exit while remaining secure during active use. This feature is essential for quick response scenarios where seconds matter.</p>
<p><strong>Anti-Microbial Lining</strong></p>
<p>The interior features anti-microbial treatment that inhibits bacterial growth and odor even during extended wear in hot conditions. Your boots stay fresh through multi-day operations.</p>
<p><strong>Oil and Slip-Resistant Outsoles</strong></p>
<p>The rubber outsole meets ASTM standards for slip resistance while providing traction on wet, oily, and unstable surfaces. This dual-purpose design excels in urban tactical environments and wilderness terrain alike.</p>
<p><strong>Three Tactical Colorways</strong></p>
<ul><li><strong>Coyote:</strong> Standard military tan for desert and arid environments</li><li><strong>Black:</strong> Urban tactical for law enforcement and security</li><li><strong>Sage:</strong> Woodland green for forest and outdoor operations</li></ul>
<p><strong>Professional Applications</strong></p>
<ul><li>Military and defense operations</li><li>Law enforcement and security work</li><li>Search and rescue missions</li><li>Airsoft and tactical training</li><li>Hunting and outdoor adventures</li></ul>
<p><strong>Reinforced Construction</strong></p>
<p>Every stress point features reinforced stitching and heavy-duty materials. These boots are designed to survive years of hard use in the most demanding professional environments.</p>
<p><strong>Sizing</strong></p>
<p>Available in sizes 8-13. True to size. The side zip allows for adjustment during break-in period.</p>`,
    fr: d(`<p>Pr\\u00eates pour toute mission avec Force Tactique, des bottes tactiques professionnelles con\\u00e7ues pour militaires, professionnels de la s\\u00e9curit\\u00e9 et enthousiastes du plein air.</p>
<p><strong>Fermeture \\u00e9clair lat\\u00e9rale</strong></p>
<p>La fermeture \\u00e9clair lat\\u00e9rale YKK de grade militaire permet une entr\\u00e9e et sortie rapide tout en restant s\\u00e9curis\\u00e9e.</p>
<p><strong>Doublure anti-microbienne</strong></p>
<p>L\\u2019int\\u00e9rieur pr\\u00e9sente un traitement anti-microbien qui inhibe la croissance bact\\u00e9rienne et les odeurs.</p>
<p><strong>Semelles r\\u00e9sistantes \\u00e0 l\\u2019huile et antid\\u00e9rapantes</strong></p>
<p>La semelle caoutchouc r\\u00e9pond aux normes ASTM.</p>
<p><strong>Trois coloris tactiques</strong></p>
<ul><li><strong>Coyote :</strong> Beige militaire standard pour environnements arides</li><li><strong>Noir :</strong> Tactique urbain pour forces de l\\u2019ordre</li><li><strong>Sauge :</strong> Vert forestier pour op\\u00e9rations ext\\u00e9rieures</li></ul>
<p><strong>Applications professionnelles</strong></p>
<ul><li>Op\\u00e9rations militaires</li><li>Forces de l\\u2019ordre et travail de s\\u00e9curit\\u00e9</li><li>Missions de recherche et sauvetage</li></ul>
<p><strong>Construction renforc\\u00e9e</strong></p>
<p>Chaque point de tension pr\\u00e9sente des coutures renforc\\u00e9es.</p>
<p><strong>Taille</strong></p>
<p>Disponibles du 8 au 13.</p>`),
  },

  "12a975e1-5c16-4165-b560-8b516587eca0": {
    en: `<p>Combine retro aesthetics with modern trail performance in Vintage Hiker, hiking boots inspired by classic 1970s outdoor design updated with contemporary comfort technology. These are the boots for outdoor enthusiasts who appreciate heritage style.</p>
<p><strong>Retro Colorways</strong></p>
<p>The color combinations pay homage to the golden age of American outdoor recreation, when Sierra Club members and Appalachian Trail hikers wore boots that were as stylish as they were functional.</p>
<p><strong>Premium Suede Panels</strong></p>
<p>Genuine suede panels add both aesthetic character and functional durability. The material breathes naturally and develops a beautiful patina through years of trail use.</p>
<p><strong>EVA Midsole Cushioning</strong></p>
<p>Modern EVA foam cushioning provides the comfort that vintage-styled boots historically lacked. You get the classic look with contemporary comfort technology hidden inside.</p>
<p><strong>Three Heritage Colorways</strong></p>
<ul><li><strong>Rust/Green:</strong> Classic 1970s outdoor color combination</li><li><strong>Navy/Tan:</strong> Nautical-inspired traditional palette</li><li><strong>Gray/Yellow:</strong> Modern take on retro sports styling</li></ul>
<p><strong>Perfect For</strong></p>
<ul><li>Day hiking and light backpacking</li><li>Outdoor photography and nature exploration</li><li>Camping and glamping adventures</li><li>Cabin trips and outdoor social gatherings</li><li>Fashion-forward outdoor styling</li></ul>
<p><strong>Sizing</strong></p>
<p>Available in sizes 7-11. True to size. The padded ankle collar provides support without requiring lengthy break-in.</p>`,
    fr: d(`<p>Combinez l\\u2019esth\\u00e9tique r\\u00e9tro avec la performance moderne dans Vintage Randonneur, des bottes de randonn\\u00e9e inspir\\u00e9es du design outdoor classique des ann\\u00e9es 1970.</p>
<p><strong>Coloris r\\u00e9tro</strong></p>
<p>Les combinaisons de couleurs rendent hommage \\u00e0 l\\u2019\\u00e2ge d\\u2019or de la r\\u00e9cr\\u00e9ation en plein air am\\u00e9ricaine.</p>
<p><strong>Panneaux su\\u00e8de premium</strong></p>
<p>Des panneaux en su\\u00e8de v\\u00e9ritable ajoutent \\u00e0 la fois caract\\u00e8re esth\\u00e9tique et durabilit\\u00e9 fonctionnelle.</p>
<p><strong>Amorti semelle EVA</strong></p>
<p>Le rembourrage moderne en mousse EVA offre le confort que les bottes de style vintage manquaient historiquement.</p>
<p><strong>Trois coloris h\\u00e9ritage</strong></p>
<ul><li><strong>Rouille/Vert :</strong> Combinaison outdoor classique des ann\\u00e9es 1970</li><li><strong>Marine/Beige :</strong> Palette traditionnelle d\\u2019inspiration nautique</li><li><strong>Gris/Jaune :</strong> Vision moderne du style sport r\\u00e9tro</li></ul>
<p><strong>Parfait pour</strong></p>
<ul><li>Randonn\\u00e9e d\\u2019une journ\\u00e9e et backpacking l\\u00e9ger</li><li>Photographie outdoor et exploration nature</li><li>Camping et glamping</li></ul>
<p><strong>Taille</strong></p>
<p>Disponibles du 7 au 11.</p>`),
  },

  "5dc499ae-5489-4017-aa89-a096e029527c": {
    en: `<p>Brave the coldest conditions with Arctic Commander, insulated winter boots engineered for sub-zero temperatures and extreme weather. When winter shows no mercy, these boots deliver the warmth and protection you need to keep moving.</p>
<p><strong>Thinsulate Insulation</strong></p>
<p>The 400-gram Thinsulate insulation keeps your feet warm in temperatures down to -30F while remaining thin enough not to bulk out the boot silhouette. This technology traps body heat while wicking away moisture.</p>
<p><strong>Waterproof Leather Upper</strong></p>
<p>Full-grain leather is treated for absolute waterproofing, keeping snow, slush, and ice water out completely. This is essential for winter conditions where wet feet quickly become dangerously cold feet.</p>
<p><strong>Aggressive Winter Traction</strong></p>
<p>The specialized winter rubber compound remains flexible in extreme cold while the deep multi-directional tread pattern grips ice, packed snow, and slush. Traditional rubber compounds harden and lose grip in cold temperatures.</p>
<p><strong>Three Winter Colorways</strong></p>
<ul><li><strong>Black:</strong> Classic winter aesthetic with maximum versatility</li><li><strong>Brown:</strong> Warm earthy tone for outdoor and casual wear</li><li><strong>Olive:</strong> Military-inspired option for hunting and outdoor sports</li></ul>
<p><strong>Sub-Zero Applications</strong></p>
<ul><li>Winter hiking and snowshoeing</li><li>Ice fishing and winter camping</li><li>Snow removal and outdoor work</li><li>Cold climate commuting</li><li>Winter sports spectating</li></ul>
<p><strong>Temperature Rating</strong></p>
<p>Rated comfortable for temperatures from 20F down to -30F depending on activity level and sock combination. For extreme cold, we recommend wearing merino wool sock liners under thick outdoor socks.</p>
<p><strong>Sizing</strong></p>
<p>Available in sizes 8-12. Order half a size up to accommodate thick winter socks.</p>`,
    fr: d(`<p>Bravez les conditions les plus froides avec Arctic Commander, des bottes d\\u2019hiver isol\\u00e9es con\\u00e7ues pour les temp\\u00e9ratures sous z\\u00e9ro.</p>
<p><strong>Isolation Thinsulate</strong></p>
<p>L\\u2019isolation Thinsulate 400 grammes garde vos pieds au chaud dans des temp\\u00e9ratures jusqu\\u2019\\u00e0 -34\\u00b0C.</p>
<p><strong>Tige en cuir imperm\\u00e9able</strong></p>
<p>Le cuir pleine fleur est trait\\u00e9 pour une imperm\\u00e9abilit\\u00e9 absolue.</p>
<p><strong>Traction hivernale agressive</strong></p>
<p>Le compos\\u00e9 sp\\u00e9cialis\\u00e9 en caoutchouc d\\u2019hiver reste flexible par froid extr\\u00eame.</p>
<p><strong>Trois coloris hiver</strong></p>
<ul><li><strong>Noir :</strong> Esth\\u00e9tique hiver classique</li><li><strong>Marron :</strong> Ton terreux chaud</li><li><strong>Olive :</strong> Option inspir\\u00e9e militaire pour la chasse</li></ul>
<p><strong>Applications sous z\\u00e9ro</strong></p>
<ul><li>Randonn\\u00e9e hivernale et raquettes</li><li>P\\u00eache sur glace et camping hivernal</li><li>D\\u00e9neigement et travail ext\\u00e9rieur</li></ul>
<p><strong>Classification temp\\u00e9rature</strong></p>
<p>Confortable pour temp\\u00e9ratures de -7\\u00b0C \\u00e0 -34\\u00b0C.</p>
<p><strong>Taille</strong></p>
<p>Disponibles du 8 au 12. Prenez une demi-taille au-dessus.</p>`),
  },

  // ==================== SANDALS ====================

  "5d349dca-6822-427a-b058-6266b1aa9297": {
    en: `<p>Take your outdoor adventures to the next level with Adventure Trekker, hiking sandals engineered for warm-weather trail exploration and outdoor water activities. These are not beach sandals, they are technical footwear built for serious outdoor use.</p>
<p><strong>Adjustable Multi-Strap System</strong></p>
<p>Three independent adjustment points at the toe, midfoot, and ankle allow you to dial in a perfect fit that changes with your activity. Loosen for casual walking, cinch tight for scrambling and stream crossings.</p>
<p><strong>Reinforced Toe Protection</strong></p>
<p>The bumper toe cap protects your toes from rock strikes, root snags, and other trail hazards that would leave open sandals vulnerable. This protection makes Adventure Trekker safe for technical terrain.</p>
<p><strong>Rugged Outsole Grip</strong></p>
<p>The Vibram-inspired outsole features multi-directional lugs that grip wet rocks, dry trails, sandy beaches, and muddy paths with equal confidence. The rubber compound is optimized for wet conditions.</p>
<p><strong>Three Trail Colorways</strong></p>
<ul><li><strong>Olive/Black:</strong> Natural aesthetic for wilderness environments</li><li><strong>Brown/Tan:</strong> Classic outdoor colors for hiking and camping</li><li><strong>Gray/Blue:</strong> Modern styling for coastal and water activities</li></ul>
<p><strong>Perfect For</strong></p>
<ul><li>Light hiking and day exploration</li><li>Water activities like canyoning and kayaking</li><li>Beach and coastal walking</li><li>Travel and outdoor adventures</li><li>Camp and lodge wear</li></ul>
<p><strong>Water Ready</strong></p>
<p>All materials are quick-drying and resistant to water damage, making Adventure Trekker perfect for adventures involving stream crossings, beach walks, and boat trips.</p>
<p><strong>Sizing</strong></p>
<p>Available in sizes 7-12. The adjustable straps accommodate a wide range of foot shapes and sock preferences.</p>`,
    fr: d(`<p>Portez vos aventures outdoor au niveau sup\\u00e9rieur avec Randonneur Aventure, des sandales de randonn\\u00e9e con\\u00e7ues pour l\\u2019exploration de sentiers par temps chaud.</p>
<p><strong>Syst\\u00e8me multi-sangles ajustables</strong></p>
<p>Trois points d\\u2019ajustement ind\\u00e9pendants aux orteils, m\\u00e9diopied et cheville vous permettent d\\u2019obtenir un ajustement parfait.</p>
<p><strong>Protection des orteils renforc\\u00e9e</strong></p>
<p>Le bumper de bout prot\\u00e8ge vos orteils des chocs de rochers et des accrochages de racines.</p>
<p><strong>Adh\\u00e9rence robuste</strong></p>
<p>La semelle inspir\\u00e9e Vibram pr\\u00e9sente des crampons multidirectionnels.</p>
<p><strong>Trois coloris sentier</strong></p>
<ul><li><strong>Olive/Noir :</strong> Esth\\u00e9tique naturelle pour environnements sauvages</li><li><strong>Marron/Beige :</strong> Couleurs outdoor classiques</li><li><strong>Gris/Bleu :</strong> Style moderne pour activit\\u00e9s c\\u00f4ti\\u00e8res</li></ul>
<p><strong>Parfait pour</strong></p>
<ul><li>Randonn\\u00e9e l\\u00e9g\\u00e8re et exploration</li><li>Activit\\u00e9s aquatiques comme canyoning et kayak</li><li>Marche c\\u00f4ti\\u00e8re</li></ul>
<p><strong>Pr\\u00eat pour l\\u2019eau</strong></p>
<p>Tous les mat\\u00e9riaux s\\u00e8chent rapidement.</p>
<p><strong>Taille</strong></p>
<p>Disponibles du 7 au 12.</p>`),
  },

  "fe68e61c-18cf-4b36-b2a0-e0de6042eb32": {
    en: `<p>Recover faster and stay comfortable with Sport Slide Elite, athletic recovery sandals engineered for post-workout wear. These are not just casual slides, they are performance recovery tools that help your feet reset between training sessions.</p>
<p><strong>Massage-Point Footbed</strong></p>
<p>The specialized footbed features raised massage points that stimulate circulation and provide gentle acupressure to key areas of the foot. This design promotes recovery and reduces post-workout foot fatigue.</p>
<p><strong>Cushioned Arch Support</strong></p>
<p>Integrated arch support cradles your foot in the anatomically correct position, relieving pressure on the plantar fascia and promoting proper foot alignment during recovery periods.</p>
<p><strong>Athletic Recovery Focus</strong></p>
<p>Unlike casual slides that flatten your feet, Sport Slide Elite is engineered to actively support recovery from athletic activity. Wear them immediately after workouts to reduce inflammation and speed recovery.</p>
<p><strong>Three Athletic Colorways</strong></p>
<ul><li><strong>Black/White:</strong> Classic athletic aesthetic</li><li><strong>Navy/Gold:</strong> Premium sports colorway</li><li><strong>All Black:</strong> Understated professional gym look</li></ul>
<p><strong>Perfect For</strong></p>
<ul><li>Post-workout recovery wear</li><li>Gym locker room use</li><li>Home relaxation after long days</li><li>Poolside and shower wear</li><li>Travel comfort in hotels</li></ul>
<p><strong>Easy On, Easy Off</strong></p>
<p>The slip-on design lets you kick these off after a shower or slide them on before hitting the gym. No laces, no buckles, just instant comfort.</p>
<p><strong>Sizing</strong></p>
<p>Available in sizes 7-12. True to size for optimal recovery benefits.</p>`,
    fr: d(`<p>R\\u00e9cup\\u00e9rez plus vite avec Sandale Sport Elite, des sandales de r\\u00e9cup\\u00e9ration athl\\u00e9tique con\\u00e7ues pour le port post-entra\\u00eenement.</p>
<p><strong>Semelle avec points de massage</strong></p>
<p>La semelle sp\\u00e9cialis\\u00e9e pr\\u00e9sente des points de massage sur\\u00e9lev\\u00e9s qui stimulent la circulation.</p>
<p><strong>Soutien vo\\u00fbte plantaire rembourr\\u00e9</strong></p>
<p>Le soutien int\\u00e9gr\\u00e9 de la vo\\u00fbte berce votre pied dans la position anatomiquement correcte.</p>
<p><strong>Focus r\\u00e9cup\\u00e9ration athl\\u00e9tique</strong></p>
<p>Portez-les imm\\u00e9diatement apr\\u00e8s l\\u2019entra\\u00eenement pour r\\u00e9duire l\\u2019inflammation.</p>
<p><strong>Trois coloris athl\\u00e9tiques</strong></p>
<ul><li><strong>Noir/Blanc :</strong> Esth\\u00e9tique athl\\u00e9tique classique</li><li><strong>Marine/Or :</strong> Coloris sport premium</li><li><strong>Tout Noir :</strong> Look gym professionnel discret</li></ul>
<p><strong>Parfait pour</strong></p>
<ul><li>Port de r\\u00e9cup\\u00e9ration post-entra\\u00eenement</li><li>Vestiaires de salle de sport</li><li>Relaxation \\u00e0 la maison</li></ul>
<p><strong>Enfilage facile</strong></p>
<p>Le design slip-on permet une utilisation instantan\\u00e9e.</p>
<p><strong>Taille</strong></p>
<p>Disponibles du 7 au 12.</p>`),
  },

  "fff0864e-96b8-4883-baa4-9714deb32e37": {
    en: `<p>Experience ultimate relaxation with Slide Comfort Plus, memory foam slides designed to be your feet reward after long days. When you get home and want to slip into something that just feels amazing, these are what you reach for.</p>
<p><strong>Memory Foam Insole</strong></p>
<p>The signature memory foam footbed conforms to the unique shape of your feet, providing personalized cushioning that molds and remolds throughout wear. Every time you slip these on, they feel custom-made for your feet.</p>
<p><strong>Ergonomic Design</strong></p>
<p>The contoured footbed follows the natural anatomy of the human foot, with subtle arch support and heel cupping that provides comfort without medical shoe rigidity.</p>
<p><strong>Everyday Casual Wear</strong></p>
<p>Unlike shower slides that feel plasticky, Slide Comfort Plus is designed for extended casual wear. The materials breathe naturally and the construction supports your feet during light activity around the house.</p>
<p><strong>Three Classic Colorways</strong></p>
<ul><li><strong>Black:</strong> Versatile classic that hides everyday wear</li><li><strong>Navy:</strong> Subtle sophistication for the casual dresser</li><li><strong>Gray:</strong> Modern neutral that pairs with any home wardrobe</li></ul>
<p><strong>Perfect For</strong></p>
<ul><li>Coming home from work relaxation</li><li>Weekend around-the-house wear</li><li>Backyard barbecues and outdoor dining</li><li>Quick errands to the store or mailbox</li><li>Hotel and travel comfort</li></ul>
<p><strong>Care Instructions</strong></p>
<p>Wipe clean with a damp cloth. The memory foam retains its shape and cushioning properties for years of regular use. Available in sizes 7-11.</p>`,
    fr: d(`<p>Vivez la relaxation ultime avec Slide Confort Plus, des slides en mousse m\\u00e9moire con\\u00e7ues pour \\u00eatre la r\\u00e9compense de vos pieds apr\\u00e8s de longues journ\\u00e9es.</p>
<p><strong>Semelle mousse m\\u00e9moire</strong></p>
<p>La semelle signature en mousse m\\u00e9moire \\u00e9pouse la forme unique de vos pieds.</p>
<p><strong>Design ergonomique</strong></p>
<p>La semelle profil\\u00e9e suit l\\u2019anatomie naturelle du pied humain.</p>
<p><strong>Port quotidien casual</strong></p>
<p>Contrairement aux slides de douche, Slide Confort Plus est con\\u00e7ue pour le port prolong\\u00e9.</p>
<p><strong>Trois coloris classiques</strong></p>
<ul><li><strong>Noir :</strong> Classique polyvalent</li><li><strong>Marine :</strong> Sophistication subtile</li><li><strong>Gris :</strong> Neutre moderne</li></ul>
<p><strong>Parfait pour</strong></p>
<ul><li>Relaxation en rentrant du travail</li><li>Port du week-end \\u00e0 la maison</li><li>Barbecues et repas ext\\u00e9rieurs</li></ul>
<p><strong>Instructions d\\u2019entretien</strong></p>
<p>Nettoyez avec un chiffon humide. Disponibles du 7 au 11.</p>`),
  },

  "3cc5c59f-8465-44ae-822b-ecc2c4bdd88c": {
    en: `<p>Embrace summer style with Espadrille Summer, the timeless slip-on that captures the essence of Mediterranean coastal living. These are not just shoes, they are a passport to leisurely warm-weather days spent by the sea or on sunlit terraces.</p>
<p><strong>Woven Jute Sole</strong></p>
<p>The signature jute rope sole is handcrafted using traditional techniques that date back centuries in the Basque country. This natural fiber sole provides subtle cushioning while maintaining the authentic espadrille aesthetic.</p>
<p><strong>Canvas Upper</strong></p>
<p>The soft canvas upper breathes naturally, keeping feet cool in hot weather. The material softens with wear, becoming more comfortable each time you slip them on.</p>
<p><strong>Slip-On Convenience</strong></p>
<p>No laces, no straps, just easy on-off convenience perfect for beach days when you are constantly moving between sand, water, and boardwalk.</p>
<p><strong>Three Summer Colorways</strong></p>
<ul><li><strong>Natural:</strong> Classic unbleached canvas for authentic Mediterranean style</li><li><strong>Blue Stripe:</strong> Nautical-inspired pattern perfect for coastal outings</li><li><strong>Red:</strong> Bold color that stands out against summer whites</li></ul>
<p><strong>Perfect Summer Occasions</strong></p>
<ul><li>Beach vacations and coastal towns</li><li>Outdoor cafes and terrace dining</li><li>Boat trips and marina visits</li><li>Summer weddings on the coast</li><li>Casual poolside gatherings</li></ul>
<p><strong>Care Notes</strong></p>
<p>Jute sole should be protected from prolonged water exposure to maintain integrity. Spot clean canvas with cool water and mild soap. Available in sizes 6-11.</p>`,
    fr: d(`<p>Adoptez le style estival avec Espadrille Ete, le slip-on intemporel qui capture l\\u2019essence de la vie c\\u00f4ti\\u00e8re m\\u00e9diterran\\u00e9enne.</p>
<p><strong>Semelle jute tress\\u00e9e</strong></p>
<p>La semelle signature en corde de jute est artisanalement fabriqu\\u00e9e utilisant des techniques traditionnelles remontant \\u00e0 des si\\u00e8cles au Pays Basque.</p>
<p><strong>Tige en toile</strong></p>
<p>La tige souple en toile respire naturellement, gardant les pieds au frais.</p>
<p><strong>Commodit\\u00e9 slip-on</strong></p>
<p>Pas de lacets, pas de sangles, juste une commodit\\u00e9 d\\u2019enfilage facile.</p>
<p><strong>Trois coloris estivaux</strong></p>
<ul><li><strong>Naturel :</strong> Toile \\u00e9crue classique pour un style m\\u00e9diterran\\u00e9en authentique</li><li><strong>Rayure Bleue :</strong> Motif d\\u2019inspiration nautique</li><li><strong>Rouge :</strong> Couleur audacieuse</li></ul>
<p><strong>Occasions estivales parfaites</strong></p>
<ul><li>Vacances \\u00e0 la plage et villes c\\u00f4ti\\u00e8res</li><li>Caf\\u00e9s ext\\u00e9rieurs et d\\u00eener sur terrasse</li><li>Sorties en bateau et visites de marina</li></ul>
<p><strong>Notes d\\u2019entretien</strong></p>
<p>La semelle en jute doit \\u00eatre prot\\u00e9g\\u00e9e de l\\u2019exposition prolong\\u00e9e \\u00e0 l\\u2019eau. Disponibles du 6 au 11.</p>`),
  },

  // ==================== CASUAL ====================

  "f488dfb5-6560-46d3-b1cd-f13aa3146866": {
    en: `<p>Discover the perfect balance of refined style and everyday wearability with Suede Chukka Lagos, premium suede Chukka boots that transition effortlessly between smart casual and weekend styling. Named after the vibrant Nigerian city, these boots capture urban sophistication with a global perspective.</p>
<p><strong>Premium Suede Construction</strong></p>
<p>The upper is crafted from luxurious full-grain suede sourced from top tanneries. This premium material offers superior softness compared to synthetic alternatives and develops a beautiful patina that grows more distinguished with age.</p>
<p><strong>Clean Refined Lines</strong></p>
<p>The classic Chukka silhouette with two or three eyelet lacing creates a clean, refined appearance that works with virtually any outfit. This timeless design has been favored by style-conscious men for generations.</p>
<p><strong>Ankle-High Comfort</strong></p>
<p>The mid-height ankle construction provides subtle support while maintaining a low-profile silhouette that works with both trouser and jean styling. The padded collar prevents rubbing during extended wear.</p>
<p><strong>Three Versatile Colorways</strong></p>
<ul><li><strong>Desert:</strong> Warm sand tone perfect for spring and autumn styling</li><li><strong>Charcoal:</strong> Deep gray that pairs sophisticatedly with any color</li><li><strong>Forest:</strong> Rich green for those seeking distinctive personal style</li></ul>
<p><strong>Style Applications</strong></p>
<ul><li>Smart casual with chinos and button-downs</li><li>Weekend style with dark denim and knitwear</li><li>Business casual in creative offices</li><li>Date nights and evening events</li><li>Travel wear that pairs with multiple outfits</li></ul>
<p><strong>Suede Care</strong></p>
<p>Use a suede brush to maintain the nap. Apply suede protector spray before first wear and reapply monthly. Address stains immediately with specialized suede cleaner. Available in sizes 8-12.</p>`,
    fr: d(`<p>D\\u00e9couvrez l\\u2019\\u00e9quilibre parfait entre style raffin\\u00e9 et portabilit\\u00e9 quotidienne avec Chukka en Daim Lagos, des boots Chukka en su\\u00e8de premium qui passent sans effort entre smart casual et style week-end.</p>
<p><strong>Construction su\\u00e8de premium</strong></p>
<p>La tige est fabriqu\\u00e9e en su\\u00e8de pleine fleur luxueux provenant des meilleures tanneries.</p>
<p><strong>Lignes \\u00e9pur\\u00e9es raffin\\u00e9es</strong></p>
<p>La silhouette Chukka classique avec la\\u00e7age \\u00e0 deux ou trois \\u0153illets cr\\u00e9e une apparence propre et raffin\\u00e9e.</p>
<p><strong>Confort mi-cheville</strong></p>
<p>La construction \\u00e0 hauteur moyenne offre un soutien subtil tout en maintenant une silhouette basse.</p>
<p><strong>Trois coloris polyvalents</strong></p>
<ul><li><strong>D\\u00e9sert :</strong> Ton sable chaud parfait pour le printemps et l\\u2019automne</li><li><strong>Charbon :</strong> Gris profond qui s\\u2019associe sophistiquement</li><li><strong>For\\u00eat :</strong> Vert riche pour ceux cherchant un style personnel distinctif</li></ul>
<p><strong>Applications de style</strong></p>
<ul><li>Smart casual avec chinos et chemises</li><li>Style week-end avec jean fonc\\u00e9 et maille</li><li>Business casual dans les bureaux cr\\u00e9atifs</li><li>Soir\\u00e9es et \\u00e9v\\u00e9nements du soir</li></ul>
<p><strong>Entretien du su\\u00e8de</strong></p>
<p>Utilisez une brosse \\u00e0 su\\u00e8de. Disponibles du 8 au 12.</p>`),
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
        results.push({ id: product.id, name: product.name, status: "already has long desc", changes: [] });
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
      batch: 3,
      summary: { total: allProducts.length, updated, skipped, errors },
      results,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}