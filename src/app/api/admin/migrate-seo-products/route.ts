import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-auth";

const SEO_DATA: Record<string, {
  name?: string;
  slug?: string;
  shortDescription?: string;
  shortDescriptionFr?: string;
  seoTitle?: string;
  metaDescription?: string;
  focusKeyphrase?: string;
  seoTitleFr?: string;
  metaDescriptionFr?: string;
  focusKeyphraseFr?: string;
  imageUrl?: string;
  images?: string;
}> = {
  // SNEAKERS
  "c80ce47b-dca5-43e0-8023-d34752ced1c4": {
    shortDescription: "Premium sneakers with responsive cushioning and breathable mesh upper. Gym to street in one sleek design.",
    seoTitle: "Air Max Velocity Sneakers - Premium Cushioned Footwear | NewDealZone",
    metaDescription: "Shop Air Max Velocity sneakers featuring responsive cushioning, breathable mesh upper and modern design. Perfect for gym, running and everyday street style. Free shipping available.",
    focusKeyphrase: "air max velocity sneakers",
    shortDescriptionFr: "Baskets premium avec amorti r\u00e9actif et tige en mesh respirant. Du sport \u00e0 la rue sans effort.",
    seoTitleFr: "Baskets Air Max Vitesse - Chaussures Amorti Premium | NewDealZone",
    metaDescriptionFr: "Achetez les baskets Air Max Vitesse avec amorti r\u00e9actif, tige en mesh respirant et design moderne. Parfaites pour la salle de sport et la rue. Livraison gratuite disponible.",
    focusKeyphraseFr: "baskets air max vitesse",
  },
  "495f6a05-522b-4e96-96f9-16eb6f09bb8c": {
    shortDescription: "Bold high-top sneakers with ankle support and premium canvas construction. The streetwear staple.",
    seoTitle: "StreetFlex High-Top Sneakers - Urban Canvas Shoes | NewDealZone",
    metaDescription: "StreetFlex High-Top sneakers with reinforced ankle support, cushioned insole and premium canvas. Available in White, Black, Red and Green. Shop streetwear footwear at NewDealZone.",
    focusKeyphrase: "high top canvas sneakers streetwear",
    shortDescriptionFr: "Sneaker montante audacieuse avec soutien de cheville et toile premium. Le must du streetwear.",
    seoTitleFr: "StreetFlex Montante - Baskets Toile Urbaine | NewDealZone",
    metaDescriptionFr: "Baskets montantes StreetFlex avec soutien de cheville renforc\u00e9, semelle rembourr\u00e9e et toile premium. Disponibles en Blanc, Noir, Rouge et Vert.",
    focusKeyphraseFr: "baskets montantes streetwear toile",
  },
  "e46a9018-f425-4fff-bbac-35cae4dea368": {
    shortDescription: "Walk on cloud-like comfort all day. Proprietary CloudFoam technology delivers unmatched cushioning.",
    seoTitle: "Cloud Walker Sneakers - Ultra Comfort CloudFoam Shoes | NewDealZone",
    metaDescription: "Experience the Cloud Walker sneakers with exclusive CloudFoam cushioning technology. Perfect for long walks and all-day wear. Available in Cloud White, Sky Blue and Mist Gray.",
    focusKeyphrase: "cloud foam comfort sneakers walking shoes",
    shortDescriptionFr: "Confort nuage toute la journ\u00e9e. La technologie CloudFoam exclusive offre un amorti incomparable.",
    seoTitleFr: "Marcheur des Nuages - Baskets Ultra Confort CloudFoam | NewDealZone",
    metaDescriptionFr: "Vivez l\u2019exp\u00e9rience du Marcheur des Nuages avec la technologie exclusive CloudFoam. Parfaites pour les longues marches et le port toute la journ\u00e9e.",
    focusKeyphraseFr: "baskets confort cloudfoam chaussures marche",
  },
  "e4349824-c6bf-4b35-9d78-c08ca8c48da4": {
    shortDescription: "Stand out with reflective accents and neon colorways. Ultra-responsive foam makes every step pop.",
    seoTitle: "Neon Pulse Sneakers - Reflective Neon Athletic Shoes | NewDealZone",
    metaDescription: "Neon Pulse sneakers with reflective accents, neon colorways and ultra-responsive foam midsole. Available in Neon Green, Electric Blue and Hot Pink. Make your style unmissable.",
    focusKeyphrase: "neon sneakers reflective athletic shoes",
    shortDescriptionFr: "D\u00e9marquez-vous avec des accents r\u00e9fl\u00e9chissants et des coloris fluo. Mousse ultra-r\u00e9active \u00e0 chaque pas.",
    seoTitleFr: "Baskets Neon Pulse - Chaussures Fluo R\u00e9fl\u00e9chissantes | NewDealZone",
    metaDescriptionFr: "Baskets Neon Pulse avec accents r\u00e9fl\u00e9chissants, coloris n\u00e9on et semelle en mousse ultra-r\u00e9active. Disponibles en Vert Neon, Bleu \u00e9lectrique et Rose vif.",
    focusKeyphraseFr: "baskets neon reflechissantes chaussures sport",
  },
  "603a75fa-e244-4a0d-bd76-7173d355f730": {
    shortDescription: "Vintage sneaker culture reimagined. Premium suede and leather with modern comfort technology.",
    seoTitle: "Retro Classic 88 Sneakers - Vintage Style Premium Suede | NewDealZone",
    metaDescription: "Shop Retro Classic 88 sneakers with vintage styling, premium suede and leather construction and modern comfort. Available in Navy, Cream and Forest Green. Throwback style meets today.",
    focusKeyphrase: "retro classic sneakers vintage suede shoes",
    shortDescriptionFr: "La culture sneaker vintage r\u00e9imagin\u00e9e. Su\u00e8de premium et cuir avec technologie de confort moderne.",
    seoTitleFr: "Retro Classique 88 - Baskets Vintage Su\u00e8de Premium | NewDealZone",
    metaDescriptionFr: "Achetez les Retro Classique 88 avec style vintage, su\u00e8de premium et construction cuir avec confort moderne. Disponibles en Marine, Cr\u00e8me et Vert For\u00eat.",
    focusKeyphraseFr: "baskets retro classiques suede vintage",
  },
  "a06e87e2-6430-40b1-b5ca-adc38560f52c": {
    shortDescription: "All-black monochrome design with matte finishes. Understated elegance for those who prefer quiet style.",
    seoTitle: "Shadow Black Edition Sneakers - All Black Monochrome Shoes | NewDealZone",
    metaDescription: "Shadow Black Edition sneakers featuring all-black monochrome design with matte finishes. Available in Triple Black and Charcoal. Stealth style meets premium footwear at NewDealZone.",
    focusKeyphrase: "all black sneakers monochrome shadow shoes",
    shortDescriptionFr: "Design monochrome tout noir avec finitions matte. \u00c9l\u00e9gance discr\u00e8te pour ceux qui pr\u00e9f\u00e8rent un style sobre.",
    seoTitleFr: "Ombre Noir Edition - Baskets Monochrome Tout Noir | NewDealZone",
    metaDescriptionFr: "Baskets Ombre Noir Edition avec design monochrome tout noir et finitions matte. Disponibles en Triple Noir et Charbon. Style discret et premium.",
    focusKeyphraseFr: "baskets tout noir monochrome chaussures shadow",
  },
  "d44f0138-205e-4d2e-999b-3699a71fb05c": {
    shortDescription: "Lightweight canvas sneakers in vibrant patterns. Express your creativity with every step.",
    seoTitle: "Canvas Culture Sneakers - Artistic Patterned Canvas Shoes | NewDealZone",
    metaDescription: "Canvas Culture sneakers in vibrant tie-dye, floral and abstract patterns. Lightweight canvas construction for creative souls. Express yourself with unique footwear from NewDealZone.",
    focusKeyphrase: "canvas sneakers artistic patterned shoes",
    shortDescriptionFr: "Baskets en toile l\u00e9g\u00e8re avec motifs vibrants. Exprimez votre cr\u00e9ativit\u00e9 \u00e0 chaque pas.",
    seoTitleFr: "Toile Culture - Baskets Toile Artistique | NewDealZone",
    metaDescriptionFr: "Baskets Toile Culture en motifs tie-dye, floral et abstrait. Construction en toile l\u00e9g\u00e8re pour les \u00e2mes cr\u00e9atives. Exprimez-vous avec NewDealZone.",
    focusKeyphraseFr: "baskets toile artistique motifs chaussures",
  },
  "985530f4-1428-45d4-8381-0bade4a469e0": {
    shortDescription: "Clean design, zero distractions. Pure minimalist sneakers built for those who value simplicity.",
    seoTitle: "Minimalist One Sneakers - Clean Minimal White Shoes | NewDealZone",
    metaDescription: "Minimalist One sneakers with clean lines and pure design. Available in White, Black and Gray. Uncompromising comfort with zero unnecessary details. Shop minimalist footwear at NewDealZone.",
    focusKeyphrase: "minimalist sneakers clean white shoes",
    shortDescriptionFr: "Design pur, z\u00e9ro distraction. Baskets minimalistes pour ceux qui appr\u00e9cient la simplicit\u00e9.",
    seoTitleFr: "Minimaliste One - Baskets Minimalistes Blanches | NewDealZone",
    metaDescriptionFr: "Baskets Minimaliste One avec lignes \u00e9pur\u00e9es et design pur. Disponibles en Blanc, Noir et Gris. Confort sans compromis.",
    focusKeyphraseFr: "baskets minimalistes blanches chaussures epurees",
  },
  "5d985ff0-c702-4af3-a354-324bd61b74f6": {
    shortDescription: "Chunky platform sole adds bold height and attitude. Premium materials for a fashion-forward statement.",
    seoTitle: "Platform Rise Chunky Sneakers - Bold Platform Shoes | NewDealZone",
    metaDescription: "Platform Rise sneakers with bold chunky platform sole and premium materials. Available in White/Pink, Black/Gold and Beige. Elevate your style with NewDealZone platform footwear.",
    focusKeyphrase: "platform sneakers chunky sole shoes",
    shortDescriptionFr: "Semelle plateforme chunky pour un look audacieux. Mat\u00e9riaux premium pour un style avant-gardiste.",
    seoTitleFr: "Plateforme Montante - Baskets Semelle Plateforme Chunky | NewDealZone",
    metaDescriptionFr: "Baskets Plateforme Montante avec semelle chunky audacieuse et mat\u00e9riaux premium. Disponibles en Blanc/Rose, Noir/Or et Beige.",
    focusKeyphraseFr: "baskets plateforme chunky chaussures semelle epaisse",
  },
  "5ed02bba-dce7-4938-9d47-907d6f85cb60": {
    shortDescription: "Full flyknit upper with 360-degree ventilation. Your feet stay cool, dry and comfortable all day.",
    seoTitle: "Knit Breeze Sneakers - Breathable Flyknit Athletic Shoes | NewDealZone",
    metaDescription: "Knit Breeze sneakers with full flyknit upper and 360-degree ventilation technology. Available in Ocean Blue, Coral and Mint. Ultimate breathability for active lifestyles at NewDealZone.",
    focusKeyphrase: "breathable knit sneakers flyknit shoes",
    shortDescriptionFr: "Tige flyknit int\u00e9grale avec ventilation 360 degr\u00e9s. Pieds frais, secs et confortables toute la journ\u00e9e.",
    seoTitleFr: "Tricote Brise - Baskets Flyknit Respirantes | NewDealZone",
    metaDescriptionFr: "Baskets Tricote Brise avec tige flyknit et technologie de ventilation 360 degr\u00e9s. Disponibles en Bleu Oc\u00e9an, Corail et Menthe.",
    focusKeyphraseFr: "baskets respirantes flyknit chaussures ventilees",
  },
  "d7d745b3-7072-4ab2-84b6-387484c98fdb": {
    shortDescription: "Genuine leather sneakers with memory foam insoles. Professional styling meets athletic comfort.",
    seoTitle: "Metro Flex Leather Sneakers - Smart Casual Athletic Shoes | NewDealZone",
    metaDescription: "Metro Flex sneakers blend professional leather styling with athletic comfort and memory foam insoles. Available in Tan, Navy and Burgundy. From subway to boardroom at NewDealZone.",
    focusKeyphrase: "leather sneakers smart casual professional shoes",
    shortDescriptionFr: "Baskets en cuir v\u00e9ritable avec semelles m\u00e9moire de forme. Style professionnel et confort athl\u00e9tique.",
    seoTitleFr: "Metro Flex Cuir - Baskets Smart Casual Professionnelles | NewDealZone",
    metaDescriptionFr: "Baskets Metro Flex alliant cuir professionnel et confort athl\u00e9tique avec semelles m\u00e9moire de forme. Disponibles en Beige, Marine et Bordeaux.",
    focusKeyphraseFr: "baskets cuir smart casual chaussures professionnelles",
  },
  "5637c0b5-2e1b-45bf-a92d-5903e7c75328": {
    shortDescription: "Carbon fiber plate and ZoomX foam for peak speed performance. Built for racers and record-breakers.",
    seoTitle: "Velocity Pro X Racing Sneakers - Carbon Plate Speed Shoes | NewDealZone",
    metaDescription: "Velocity Pro X sneakers with carbon fiber plate, responsive ZoomX foam and aerodynamic design for peak performance. Available in Volt, Racing Red and Black. Built for speed at NewDealZone.",
    focusKeyphrase: "carbon plate speed sneakers racing shoes performance",
    shortDescriptionFr: "Plaque carbone et mousse ZoomX pour des performances de pointe. Con\u00e7ues pour les coureurs et briseurs de records.",
    seoTitleFr: "Velocite Pro X - Baskets Plaque Carbone Vitesse | NewDealZone",
    metaDescriptionFr: "Baskets Velocite Pro X avec plaque en fibre de carbone, mousse ZoomX r\u00e9active et design a\u00e9rodynamique. Disponibles en Volt, Rouge Course et Noir.",
    focusKeyphraseFr: "baskets plaque carbone vitesse chaussures course performance",
  },
  // RUNNING
  "df1e55fc-a2f6-40cf-bcce-ab623672a991": {
    shortDescription: "Long-distance running shoes with energy-return tech and lightweight mesh. Go further, faster.",
    seoTitle: "Marathon Elite Running Shoes - Long Distance Energy Return | NewDealZone",
    metaDescription: "Marathon Elite running shoes designed for long-distance runners with energy-return technology, ultra-lightweight mesh and arch support. Available in Neon Yellow, Black/Red and White/Blue.",
    focusKeyphrase: "marathon running shoes long distance energy return",
    shortDescriptionFr: "Chaussures de course longue distance avec retour d\u2019\u00e9nergie et mesh ultra-l\u00e9ger. Allez plus loin, plus vite.",
    seoTitleFr: "Marathon Elite - Chaussures Course Longue Distance | NewDealZone",
    metaDescriptionFr: "Chaussures Marathon Elite con\u00e7ues pour les coureurs de longue distance avec retour d\u2019\u00e9nergie, mesh ultra-l\u00e9ger et maintien de la vo\u00fbte. Disponibles en Jaune Fluo, Noir/Rouge et Blanc/Bleu.",
    focusKeyphraseFr: "chaussures marathon course longue distance retour energie",
  },
  "089dce91-5ac4-426f-8382-cad4ad3a2944": {
    shortDescription: "Lightweight urban runners with durable outsole grip. Built for daily runs and casual city outings.",
    seoTitle: "Urban Runner Pro Shoes - Lightweight Daily Running Shoes | NewDealZone",
    metaDescription: "Urban Runner Pro combines lightweight construction with durable outsole grip for daily running and city exploration. Available in Blue, Gray and Black. Modern athletic aesthetics at NewDealZone.",
    focusKeyphrase: "urban running shoes lightweight daily trainer",
    shortDescriptionFr: "Chaussures de course urbaines l\u00e9g\u00e8res avec excellente adh\u00e9rence. Id\u00e9ales pour les sorties quotidiennes.",
    seoTitleFr: "Coureur Urbain Pro - Chaussures Course Legeres Quotidiennes | NewDealZone",
    metaDescriptionFr: "Le Coureur Urbain Pro combine construction l\u00e9g\u00e8re et adh\u00e9rence durable pour la course et l\u2019exploration urbaine. Disponibles en Bleu, Gris et Noir.",
    focusKeyphraseFr: "chaussures course urbaine legeres entrainement quotidien",
  },
  "5dc6d298-20a0-47bb-9630-756b96e6110f": {
    shortDescription: "Triple-density foam, wide toe box and plush collar padding. Maximum cushioning for long walks and easy runs.",
    seoTitle: "Comfort Stride Running Shoes - Maximum Cushion Walking Shoes | NewDealZone",
    metaDescription: "Comfort Stride running shoes with triple-density foam, wide toe box and plush collar padding for long walks and daily runs. Available in White, Black and Navy. Shop comfort footwear at NewDealZone.",
    focusKeyphrase: "comfort running shoes maximum cushion walking",
    shortDescriptionFr: "Mousse triple densit\u00e9, avant-pied large et rembourrage collar. Amorti maximum pour marches et courses tranquilles.",
    seoTitleFr: "Foulee Confort - Chaussures Course Amorti Maximum | NewDealZone",
    metaDescriptionFr: "Chaussures Foulee Confort avec mousse triple densit\u00e9, avant-pied large et rembourrage collar pour longues marches et courses. Disponibles en Blanc, Noir et Marine.",
    focusKeyphraseFr: "chaussures course confort amorti maximum marche",
  },
  "e0d886dd-b37d-4566-addb-545faad67dd7": {
    shortDescription: "Revolutionary Boost foam for explosive energy return. Feel the difference with every stride.",
    seoTitle: "HyperBoost Max Running Shoes - Boost Foam Energy Return | NewDealZone",
    metaDescription: "HyperBoost Max running shoes with revolutionary Boost foam technology for unmatched responsiveness and energy return. Available in Core Black, Cloud White and Solar Red. Run faster at NewDealZone.",
    focusKeyphrase: "boost foam running shoes energy return responsive",
    shortDescriptionFr: "Mousse Boost r\u00e9volutionnaire pour un retour d\u2019\u00e9nergie explosif. Ressentez la diff\u00e9rence \u00e0 chaque foul\u00e9e.",
    seoTitleFr: "HyperBoost Max - Chaussures Course Mousse Boost | NewDealZone",
    metaDescriptionFr: "Chaussures HyperBoost Max avec technologie Boost r\u00e9volutionnaire pour une r\u00e9activit\u00e9 et un retour d\u2019\u00e9nergie incomparables. Disponibles en Noir, Blanc et Rouge Solaire.",
    focusKeyphraseFr: "chaussures course mousse boost retour energie reactif",
  },
  "b0cfff4c-a728-4c92-948a-afdc79ee922c": {
    shortDescription: "Barefoot-inspired running with essential protection. Ultra-flexible sole bends naturally with every step.",
    seoTitle: "Flex Motion Running Shoes - Barefoot Natural Movement Shoes | NewDealZone",
    metaDescription: "Flex Motion running shoes mimic natural barefoot movement with ultra-flexible sole and essential protection. Available in Black, White and Olive. Natural running experience at NewDealZone.",
    focusKeyphrase: "barefoot running shoes natural movement flexible",
    shortDescriptionFr: "Course inspir\u00e9e du pied nu avec protection essentielle. Semelle ultra-flexible qui se plie naturellement.",
    seoTitleFr: "Flex Motion - Chaussures Course Mouvement Naturel | NewDealZone",
    metaDescriptionFr: "Chaussures Flex Motion imitant le mouvement naturel pieds nus avec semelle ultra-flexible. Disponibles en Noir, Blanc et Olive.",
    focusKeyphraseFr: "chaussures course pieds nus mouvement naturel flexibles",
  },
  "ee741750-eba2-48d4-aed8-bfb13446d3fa": {
    shortDescription: "Propulsive forefoot design and snug racing fit for tempo runs. Set your personal best.",
    seoTitle: "Tempo Racer Running Shoes - Speed Training Race Shoes | NewDealZone",
    metaDescription: "Tempo Racer running shoes engineered for tempo runs and intervals with propulsive forefoot design and snug racing fit. Available in Racing Red, Electric Blue and Black/Gold at NewDealZone.",
    focusKeyphrase: "tempo racing shoes speed training interval running",
    shortDescriptionFr: "Design avant-pied propulsif et ajustement racing serr\u00e9 pour les sorties tempo. Battez votre record personnel.",
    seoTitleFr: "Tempo Racer - Chaussures Course Vitesse Entrainement | NewDealZone",
    metaDescriptionFr: "Chaussures Tempo Racer con\u00e7ues pour les sorties tempo avec design avant-pied propulsif. Disponibles en Rouge Course, Bleu \u00e9lectrique et Noir/Or.",
    focusKeyphraseFr: "chaussures course tempo vitesse entrainement interval",
  },
  "9f7f3763-e682-4b09-a1ab-671718065549": {
    shortDescription: "3M reflective materials and LED-compatible lace loops for safe, visible night running.",
    seoTitle: "Night Glow Runner - Reflective Night Running Shoes | NewDealZone",
    metaDescription: "Night Glow Runner with 3M reflective upper materials and LED-compatible lace loops for high-visibility safe night running. Available in Hi-Vis Yellow, Reflective Silver and Neon Orange.",
    focusKeyphrase: "night running shoes reflective high visibility safety",
    shortDescriptionFr: "Mat\u00e9riaux r\u00e9fl\u00e9chissants 3M et boucles LED pour courir en s\u00e9curit\u00e9 la nuit. Soyez visible apr\u00e8s la tomb\u00e9e de la nuit.",
    seoTitleFr: "Nuit Glow Coureur - Chaussures Course Nuit Reflechissantes | NewDealZone",
    metaDescriptionFr: "Chaussures Nuit Glow Coureur avec mat\u00e9riaux r\u00e9fl\u00e9chissants 3M et boucles LED pour une course nocturne s\u00e9curis\u00e9e. Disponibles en Jaune Haute Visibilit\u00e9, Argent et Orange Fluo.",
    focusKeyphraseFr: "chaussures course nuit reflechissantes haute visibilite",
  },
  "ff8f0c92-78eb-47e4-8297-32d03e2d79e7": {
    shortDescription: "Perfect balance of cushioning and responsiveness for daily training. Great performance at an accessible price.",
    seoTitle: "EasyRun Daily Training Shoes - Everyday Running Shoes | NewDealZone",
    metaDescription: "EasyRun Daily running shoes provide the perfect balance of cushioning and responsiveness for daily training. Available in Black, White and Gray/Teal. Affordable everyday running at NewDealZone.",
    focusKeyphrase: "daily running shoes training cushioning affordable",
    shortDescriptionFr: "Parfait \u00e9quilibre entre amorti et r\u00e9activit\u00e9 pour l\u2019entra\u00eenement quotidien. Performance \u00e0 prix accessible.",
    seoTitleFr: "EasyRun Daily - Chaussures Course Quotidienne | NewDealZone",
    metaDescriptionFr: "Chaussures EasyRun Daily offrant l\u2019\u00e9quilibre parfait entre amorti et r\u00e9activit\u00e9 pour l\u2019entra\u00eenement quotidien. Disponibles en Noir, Blanc et Gris/Turquoise.",
    focusKeyphraseFr: "chaussures course quotidienne entrainement amorti abordables",
  },
  "f56b4cb8-f630-4cb5-9002-aceadc3ef808": {
    shortDescription: "Aggressive lugs, rock plate protection and waterproof membrane. Handles pavement and trail with confidence.",
    seoTitle: "Trail Runner GT Shoes - Waterproof Trail Running Shoes | NewDealZone",
    metaDescription: "Trail Runner GT with aggressive lug outsole, rock plate protection and waterproof membrane for pavement and trail running. Available in Forest, Gray/Orange and Black at NewDealZone.",
    focusKeyphrase: "trail running shoes waterproof rock plate aggressive",
    shortDescriptionFr: "Crampons agressifs, plaque anti-roche et membrane imperm\u00e9able. Bitume ou sentier, toujours confiant.",
    seoTitleFr: "Sentier Coureur GT - Chaussures Trail Impermeables | NewDealZone",
    metaDescriptionFr: "Chaussures Sentier Coureur GT avec semelle crampons agressifs, plaque anti-roche et membrane imperm\u00e9able. Disponibles en For\u00eat, Gris/Orange et Noir.",
    focusKeyphraseFr: "chaussures trail impermeables plaque anti-roche course sentier",
  },
  "66ec11c0-7e3b-45ad-a36e-eac3e9674148": {
    shortDescription: "Carbon-plate midsole, ultra-lightweight mesh and responsive cushioning for race-day performance.",
    seoTitle: "SpeedStrike Carbon Racing Shoes - Race Day Performance | NewDealZone",
    metaDescription: "SpeedStrike racing shoes with carbon-plate midsole, ultra-lightweight mesh upper and responsive cushioning. Available in Volt/Black, Red/White and Blue/Silver. Born to race at NewDealZone.",
    focusKeyphrase: "carbon plate racing shoes marathon performance speed",
    shortDescriptionFr: "Semelle interm\u00e9diaire plaque carbone, mesh ultra-l\u00e9ger et amorti r\u00e9actif pour les jours de comp\u00e9tition.",
    seoTitleFr: "SpeedStrike Carbone - Chaussures Course Competition | NewDealZone",
    metaDescriptionFr: "Chaussures SpeedStrike avec semelle plaque carbone, mesh ultra-l\u00e9ger et amorti r\u00e9actif. Disponibles en Volt/Noir, Rouge/Blanc et Bleu/Argent.",
    focusKeyphraseFr: "chaussures course competition plaque carbone marathon vitesse",
  },
  // FORMAL
  "30509eaa-9666-4241-8aa3-bf909f3c5d4c": {
    shortDescription: "Handcrafted premium Italian leather dress shoes. Timeless elegance for business meetings and special occasions.",
    seoTitle: "Classic Leather Elite Dress Shoes - Italian Leather Formal | NewDealZone",
    metaDescription: "Classic Leather Elite dress shoes handcrafted from premium Italian leather. Perfect for business meetings and formal occasions. Available in Brown, Black and Tan at NewDealZone.",
    focusKeyphrase: "italian leather dress shoes formal handcrafted",
    shortDescriptionFr: "Chaussures habill\u00e9es en cuir italien manufactur\u00e9es \u00e0 la main. \u00c9l\u00e9gance in\u00e9temporelle pour r\u00e9unions et occasions sp\u00e9ciales.",
    seoTitleFr: "Cuir Classique Elite - Chaussures Habillees Cuir Italien | NewDealZone",
    metaDescriptionFr: "Chaussures Cuir Classique Elite manufactur\u00e9es en cuir italien premium. Parfaites pour r\u00e9unions professionnelles et occasions formelles. Disponibles en Marron, Noir et Beige.",
    focusKeyphraseFr: "chaussures habillees cuir italien formelles manufacturees main",
  },
  "20a86447-3627-4e1d-aec5-1b14a59b818d": {
    shortDescription: "Full-grain leather Oxford with Goodyear welt construction. The quintessential gentleman shoe built to last.",
    seoTitle: "Oxford Gentleman Dress Shoes - Goodyear Welt Leather Oxfords | NewDealZone",
    metaDescription: "Oxford Gentleman shoes in full-grain leather with Goodyear welt construction for longevity and timeless style. Available in Black Polish, Cognac and Oxblood. Classic formal footwear at NewDealZone.",
    focusKeyphrase: "oxford shoes goodyear welt leather gentleman formal",
    shortDescriptionFr: "Oxford en cuir pleine fleur avec construction Goodyear welt. La chaussure de gentleman par excellence.",
    seoTitleFr: "Oxford Gentleman - Chaussures Habillees Goodyear Welt | NewDealZone",
    metaDescriptionFr: "Chaussures Oxford Gentleman en cuir pleine fleur avec construction Goodyear welt. Disponibles en Noir, Cognac et Bordeaux. Style formel in\u00e9temporel.",
    focusKeyphraseFr: "chaussures oxford goodyear welt cuir gentleman formelles",
  },
  "cf3923ed-c866-4abf-9ada-265feeaad757": {
    shortDescription: "Open-laced derby shoes combining comfort and formality. Padded insoles and flexible leather for all-day wear.",
    seoTitle: "Derby Prestige Formal Shoes - Professional Open-Lace Derby | NewDealZone",
    metaDescription: "Derby Prestige formal shoes with open-laced design, padded insoles and flexible leather for professional wear. Available in Black and Dark Brown. Modern professional elegance at NewDealZone.",
    focusKeyphrase: "derby shoes formal professional open lace leather",
    shortDescriptionFr: "Derbies \u00e0 lacets ouverts alliant confort et formalit\u00e9. Semelles rembourr\u00e9es et cuir flexible pour le port toute la journ\u00e9e.",
    seoTitleFr: "Derby Prestige - Chaussures Formelles Professionnelles | NewDealZone",
    metaDescriptionFr: "Chaussures Derby Prestige \u00e0 lacets ouverts avec semelles rembourr\u00e9es et cuir flexible. Disponibles en Noir et Marron Fonc\u00e9. El\u00e9gance professionnelle moderne.",
    focusKeyphraseFr: "chaussures derby formelles professionnelles lacets cuir",
  },
  "7af849d3-31b0-460c-81de-7ba9101a6bdd": {
    shortDescription: "Hand-stitched penny loafer detailing in butter-soft calfskin leather. Effortless sophistication.",
    seoTitle: "Loafer Luxe Penny Loafers - Calfskin Leather Luxury Shoes | NewDealZone",
    metaDescription: "Loafer Luxe penny loafers with hand-stitched detailing and butter-soft calfskin leather. Available in Burgundy, Navy and Camel. Shop luxury loafers at NewDealZone.",
    focusKeyphrase: "penny loafers calfskin leather luxury formal shoes",
    shortDescriptionFr: "Mocassins penny loafer cousu main en cuir de veau ultra-souple. Sophistication sans effort.",
    seoTitleFr: "Loafer Luxe - Mocassins Cuir Veau Luxueux | NewDealZone",
    metaDescriptionFr: "Mocassins Loafer Luxe avec d\u00e9tail penny cousu main en cuir de veau. Disponibles en Bordeaux, Marine et Camel.",
    focusKeyphraseFr: "mocassins cuir veau luxueux chaussures formelles",
  },
  "18a3e8dd-a83a-4b97-8af3-757f4cf7cfdd": {
    shortDescription: "Double monk strap with premium buckle hardware and hand-burnished leather. For the fashion-forward professional.",
    seoTitle: "Monk Strap Master Shoes - Double Monk Strap Dress Shoes | NewDealZone",
    metaDescription: "Monk Strap Master double monk strap shoes with premium buckle hardware and hand-burnished leather finish. Available in Mahogany and Black. Bold formal footwear at NewDealZone.",
    focusKeyphrase: "monk strap shoes double strap formal leather professional",
    shortDescriptionFr: "Double boucle monk strap avec quincaillerie premium et cuir bross\u00e9 main. Pour le professionnel avant-gardiste.",
    seoTitleFr: "Monk Strap Master - Chaussures Double Boucle Formelles | NewDealZone",
    metaDescriptionFr: "Chaussures Monk Strap Master \u00e0 double boucle avec quincaillerie premium et cuir bross\u00e9 main. Disponibles en Acajou et Noir.",
    focusKeyphraseFr: "chaussures monk strap double boucle formelles cuir",
  },
  "49025494-c0b0-4800-8443-ebab417635e5": {
    shortDescription: "Mirror-finish patent leather with sleek pointed toe. The ultimate formal evening shoe for black tie events.",
    seoTitle: "Patent Gala Formal Shoes - Patent Leather Evening Dress Shoes | NewDealZone",
    metaDescription: "Patent Gala formal shoes with mirror-finish patent leather and sleek pointed toe for black tie events. Available in Black Patent and Midnight Blue at NewDealZone.",
    focusKeyphrase: "patent leather formal shoes evening black tie dress shoes",
    shortDescriptionFr: "Cuir verni miroir avec bout pointu \u00e9pur\u00e9. La chaussure de soir\u00e9e formelle ultime pour les \u00e9v\u00e9nements en tenue de soir\u00e9e.",
    seoTitleFr: "Patent Gala - Chaussures Cuir Verni Soiree Formelle | NewDealZone",
    metaDescriptionFr: "Chaussures Patent Gala en cuir verni miroir avec bout pointu pour soir\u00e9es habill\u00e9es. Disponibles en Noir Verni et Bleu Nuit.",
    focusKeyphraseFr: "chaussures cuir verni soiree formelle bout pointu",
  },
  "6e0f4f74-1159-440c-bc56-2d3952c28bc7": {
    shortDescription: "Full-brogue wingtip design with cushioned footbed and flexible Dainite sole. Classic heritage style.",
    seoTitle: "Brogue Heritage Shoes - Full Brogue Wingtip Leather Shoes | NewDealZone",
    metaDescription: "Brogue Heritage shoes with classic full-brogue wingtip design, cushioned footbed and flexible Dainite sole. Available in Walnut, Black and Tan. Timeless brogue footwear at NewDealZone.",
    focusKeyphrase: "brogue shoes wingtip leather heritage formal classic",
    shortDescriptionFr: "Design wingtip full-brogue avec semelle int\u00e9rieure rembourr\u00e9e et semelle Dainite flexible. Style h\u00e9ritage classique.",
    seoTitleFr: "Brogue Heritage - Chaussures Full Brogue Wingtip Cuir | NewDealZone",
    metaDescriptionFr: "Chaussures Brogue Heritage avec design wingtip classique, semelle rembourr\u00e9e et semelle Dainite flexible. Disponibles en Noyer, Noir et Beige.",
    focusKeyphraseFr: "chaussures brogue wingtip cuir heritage classiques formelles",
  },
  "4d0d121c-bc16-4529-90a5-3a702c07b55a": {
    shortDescription: "Elastic side panels and pull tabs on polished leather. Chelsea boots bridging casual and formal effortlessly.",
    seoTitle: "Chelsea Formal Boots - Polished Leather Chelsea Dress Boots | NewDealZone",
    metaDescription: "Chelsea Formal boots with elastic side panels, pull tabs and polished leather for versatile casual-to-formal styling. Available in Black, Espresso and Sand at NewDealZone.",
    focusKeyphrase: "chelsea formal boots polished leather dress boots",
    shortDescriptionFr: "Panneaux \u00e9lastiques et tirants sur cuir poli. Chelsea boots faisant le pont entre d\u00e9contract\u00e9 et formel.",
    seoTitleFr: "Chelsea Formal - Boots Chelsea Cuir Poli Habillees | NewDealZone",
    metaDescriptionFr: "Boots Chelsea Formal avec panneaux \u00e9lastiques et cuir poli pour un style polyvalent casual-formel. Disponibles en Noir, Espresso et Sable.",
    focusKeyphraseFr: "boots chelsea formelles cuir poli habillees",
  },
  // BOOTS
  "63bd9f53-bf11-49f5-b5a0-23c0dbc535ef": {
    shortDescription: "Waterproof hiking boots with aggressive tread and reinforced toe cap. Built for any terrain.",
    seoTitle: "Trail Blazer X Hiking Boots - Waterproof All-Terrain Boots | NewDealZone",
    metaDescription: "Trail Blazer X waterproof hiking boots with aggressive tread pattern and reinforced toe cap for any terrain. Available in Brown, Dark Green and Black. Conquer every trail at NewDealZone.",
    focusKeyphrase: "waterproof hiking boots trail all terrain aggressive tread",
    shortDescriptionFr: "Chaussures de randonn\u00e9e imperm\u00e9ables avec semelle agressive et bout renforc\u00e9. Con\u00e7ues pour n\u2019importe quel terrain.",
    seoTitleFr: "Pionnier de Sentier X - Boots Randonnee Impermeables | NewDealZone",
    metaDescriptionFr: "Boots Pionnier de Sentier X imperm\u00e9ables avec semelle agressive et bout renforc\u00e9 pour tout terrain. Disponibles en Marron, Vert Fonc\u00e9 et Noir.",
    focusKeyphraseFr: "boots randonnee impermeables terrain agressif",
  },
  "5ce42e69-821b-434d-b704-50ea3d72005e": {
    shortDescription: "Premium suede Chelsea boots with elastic panels, pull tab and stacked leather heel. City-ready style.",
    seoTitle: "Urban Chelsea Boots - Premium Suede Chelsea Boots | NewDealZone",
    metaDescription: "Urban Chelsea boots in premium suede with elastic side panels, pull tab and stacked leather heel. Available in Tan, Black and Gray. City-ready footwear at NewDealZone.",
    focusKeyphrase: "suede chelsea boots men urban city fashion",
    shortDescriptionFr: "Boots Chelsea en su\u00e8de premium avec panneaux \u00e9lastiques et talon empit\u00e9ment. Style urbain pr\u00eat-\u00e0-porter.",
    seoTitleFr: "Urbain Chelsea - Boots Chelsea Suede Homme | NewDealZone",
    metaDescriptionFr: "Boots Urbain Chelsea en su\u00e8de premium avec panneaux \u00e9lastiques et talon empit\u00e9ment. Disponibles en Beige, Noir et Gris.",
    focusKeyphraseFr: "boots chelsea suede homme urbain mode",
  },
  "c96bcec6-031c-402a-9ee7-ec0b65d0f084": {
    shortDescription: "Fully waterproof rubber rain boots with neoprene lining for warmth and non-slip outsole. Stay dry in style.",
    seoTitle: "Rain Guardian Waterproof Rain Boots - Rubber Neoprene Boots | NewDealZone",
    metaDescription: "Rain Guardian fully waterproof rubber rain boots with neoprene lining for warmth and non-slip outsole. Available in Hunter Green, Navy, Black and Red. Stay dry at NewDealZone.",
    focusKeyphrase: "waterproof rain boots rubber neoprene lining non-slip",
    shortDescriptionFr: "Bottes de pluie en caoutchouc imperm\u00e9able avec doublure n\u00e9opr\u00e8ne et semelle antid\u00e9rapante. Restez au sec avec style.",
    seoTitleFr: "Gardien de Pluie - Bottes Pluie Impermeables Caoutchouc | NewDealZone",
    metaDescriptionFr: "Bottes Gardien de Pluie en caoutchouc imperm\u00e9able avec doublure n\u00e9opr\u00e8ne et semelle antid\u00e9rapante. Disponibles en Vert Chasseur, Marine, Noir et Rouge.",
    focusKeyphraseFr: "bottes pluie impermeables caoutchouc neoprene antiderapantes",
  },
  "f0a78557-6e1f-4618-b6ff-9d2f4624eec2": {
    shortDescription: "Vibram soles, crampon-compatible design and Gore-Tex waterproof lining for serious mountaineering.",
    seoTitle: "Summit Peak Mountaineering Boots - Vibram Gore-Tex Alpine Boots | NewDealZone",
    metaDescription: "Summit Peak mountaineering boots with Vibram soles, crampon-compatible design and Gore-Tex waterproof lining for alpine climbing. Available in Gray/Blue and Black/Orange at NewDealZone.",
    focusKeyphrase: "mountaineering boots vibram gore-tex crampon alpine climbing",
    shortDescriptionFr: "Semelles Vibram, design compatible crampons et doublure Gore-Tex imperm\u00e9able pour l\u2019alpinisme s\u00e9rieux.",
    seoTitleFr: "Summit Peak - Chaussures Alpinisme Vibram Gore-Tex | NewDealZone",
    metaDescriptionFr: "Chaussures d\u2019alpinisme Summit Peak avec semelles Vibram, compatible crampons et doublure Gore-Tex. Disponibles en Gris/Bleu et Noir/Orange.",
    focusKeyphraseFr: "chaussures alpinisme vibram gore-tex crampons escalade alpine",
  },
  "f850276f-1e53-4e2b-98fb-89e7dea20a08": {
    shortDescription: "Steel toe protection, waterproof leather and anti-fatigue insole. Built tough for demanding work environments.",
    seoTitle: "Lumberjack Pro Work Boots - Steel Toe Waterproof Work Boots | NewDealZone",
    metaDescription: "Lumberjack Pro work boots with steel toe protection, waterproof leather upper and anti-fatigue insole technology. Available in Wheat, Dark Brown and Black. Safety work boots at NewDealZone.",
    focusKeyphrase: "steel toe work boots waterproof anti-fatigue safety",
    shortDescriptionFr: "Protection bout acier, cuir imperm\u00e9able et semelle anti-fatigue. Bottes robustes pour environnements de travail exigeants.",
    seoTitleFr: "Lumberjack Pro - Bottes Travail Bout Acier Impermeables | NewDealZone",
    metaDescriptionFr: "Bottes de travail Lumberjack Pro avec protection bout acier, cuir imperm\u00e9able et semelle anti-fatigue. Disponibles en Bl\u00e9, Marron Fonc\u00e9 et Noir.",
    focusKeyphraseFr: "bottes travail bout acier impermeables anti-fatigue securite",
  },
  "91863bdc-2550-474f-aaab-e57d13368d5e": {
    shortDescription: "Heavy-duty hardware, oil-resistant sole and vintage-distressed leather. Rebel spirit meets refined design.",
    seoTitle: "Moto Rebel Motorcycle Boots - Distressed Leather Biker Boots | NewDealZone",
    metaDescription: "Moto Rebel motorcycle boots with heavy-duty hardware, oil-resistant sole and vintage-distressed leather. Available in Distressed Brown and Aged Black. Shop biker boots at NewDealZone.",
    focusKeyphrase: "motorcycle boots distressed leather biker oil resistant",
    shortDescriptionFr: "Quincaillerie robuste, semelle r\u00e9sistante \u00e0 l\u2019huile et cuir vieilli vintage. Esprit rebelle rencontre design raffin\u00e9.",
    seoTitleFr: "Moto Rebel - Bottes Moto Cuir Vieilli Biker | NewDealZone",
    metaDescriptionFr: "Bottes moto Moto Rebel avec quincaillerie robuste, semelle r\u00e9sistante et cuir vieilli. Disponibles en Marron Vieilli et Noir Age.",
    focusKeyphraseFr: "bottes moto cuir vieilli biker resistante",
  },
  "b22bcbcb-29cf-4552-9981-88a0f904f47d": {
    shortDescription: "Side-zip tactical boots with anti-microbial lining and oil/slip-resistant outsoles. Mission-ready.",
    seoTitle: "Tactical Force Boots - Side Zip Military Tactical Work Boots | NewDealZone",
    metaDescription: "Tactical Force tactical boots with side-zip entry, anti-microbial lining and oil/slip-resistant outsoles. Available in Coyote, Black and Sage. Built for demanding environments at NewDealZone.",
    focusKeyphrase: "tactical boots military side zip anti-microbial slip resistant",
    shortDescriptionFr: "Bottes tactiques \u00e0 fermeture \u00e9clair avec doublure anti-microbienne et semelle antid\u00e9rapante. Pr\u00eates pour toutes les missions.",
    seoTitleFr: "Force Tactique - Bottes Tactiques Militaires Fermeture Eclair | NewDealZone",
    metaDescriptionFr: "Bottes Force Tactique avec fermeture \u00e9clair lat\u00e9rale, doublure anti-microbienne et semelle antid\u00e9rapante. Disponibles en Coyote, Noir et Sauge.",
    focusKeyphraseFr: "bottes tactiques militaires fermeture eclair antiderapantes",
  },
  "12a975e1-5c16-4165-b560-8b516587eca0": {
    shortDescription: "Retro hiking colorways with suede panels and EVA midsole cushioning. Old-school aesthetics, modern comfort.",
    seoTitle: "Vintage Hiker Boots - Retro Suede Hiking Boots with EVA Cushion | NewDealZone",
    metaDescription: "Vintage Hiker boots with retro colorways, suede panels and EVA midsole cushioning for style and trail comfort. Available in Rust/Green, Navy/Tan and Gray/Yellow at NewDealZone.",
    focusKeyphrase: "vintage hiking boots retro suede EVA cushion trail",
    shortDescriptionFr: "Coloris randonn\u00e9e r\u00e9tro avec panneaux su\u00e8de et semelle EVA. Esth\u00e9tique old-school, confort moderne.",
    seoTitleFr: "Vintage Randonneur - Boots Randonnee Retro Suede | NewDealZone",
    metaDescriptionFr: "Boots Vintage Randonneur avec coloris r\u00e9tro, panneaux su\u00e8de et semelle EVA. Disponibles en Rouille/Vert, Marine/Beige et Gris/Jaune.",
    focusKeyphraseFr: "boots randonnee vintage retro suede EVA confort sentier",
  },
  "5dc499ae-5489-4017-aa89-a096e029527c": {
    shortDescription: "Thinsulate insulation, waterproof leather and aggressive winter traction for sub-zero conditions.",
    seoTitle: "Arctic Commander Winter Boots - Insulated Waterproof Snow Boots | NewDealZone",
    metaDescription: "Arctic Commander insulated winter boots with Thinsulate lining, waterproof leather upper and aggressive winter traction for sub-zero conditions. Available in Black, Brown and Olive at NewDealZone.",
    focusKeyphrase: "insulated winter boots waterproof snow thinsulate sub-zero",
    shortDescriptionFr: "Isolation Thinsulate, cuir imperm\u00e9able et cramponage hivernal agressif pour conditions polaires.",
    seoTitleFr: "Arctic Commander - Bottes Hiver Isolees Impermeables | NewDealZone",
    metaDescriptionFr: "Bottes d\u2019hiver Arctic Commander avec doublure Thinsulate, cuir imperm\u00e9able et traction hivernale agressive. Disponibles en Noir, Marron et Olive.",
    focusKeyphraseFr: "bottes hiver isolees impermeables neige thinsulate",
  },
  // SANDALS
  "5d349dca-6822-427a-b058-6266b1aa9297": {
    shortDescription: "Adjustable straps, reinforced toe protection and rugged outsole for light hiking and outdoor adventures.",
    seoTitle: "Adventure Trekker Hiking Sandals - Outdoor Trail Sandals | NewDealZone",
    metaDescription: "Adventure Trekker hiking sandals with adjustable straps, toe protection and rugged outsole grip for trails and outdoor activities. Available in Olive/Black, Brown/Tan and Gray/Blue at NewDealZone.",
    focusKeyphrase: "hiking sandals outdoor trail adjustable toe protection",
    shortDescriptionFr: "Sangles ajustables, protection des orteils renforc\u00e9e et semelle robuste pour randonn\u00e9e l\u00e9g\u00e8re et aventures en plein air.",
    seoTitleFr: "Randonneur Aventure - Sandales Randonnee Exterieur | NewDealZone",
    metaDescriptionFr: "Sandales Randonneur Aventure avec sangles ajustables, protection des orteils et semelle robuste. Disponibles en Olive/Noir, Marron/Beige et Gris/Bleu.",
    focusKeyphraseFr: "sandales randonnee exterieur ajustables protection orteils",
  },
  "fe68e61c-18cf-4b36-b2a0-e0de6042eb32": {
    shortDescription: "Massage-point footbed and cushioned arch support for optimal recovery after intense workouts.",
    seoTitle: "Sport Slide Elite Recovery Sandals - Massage Footbed Slides | NewDealZone",
    metaDescription: "Sport Slide Elite recovery sandals with massage-point footbed and cushioned arch support. Perfect after workouts. Available in Black/White, Navy/Gold and All Black at NewDealZone.",
    focusKeyphrase: "recovery sandals sport slides massage footbed arch support",
    shortDescriptionFr: "Semelle int\u00e9rieure massante et soutien vo\u00fbte plant\u00e9e rembourr\u00e9 pour une r\u00e9cup\u00e9ration optimale apr\u00e8s vos s\u00e9ances.",
    seoTitleFr: "Sandale Sport Elite - Sandales Recuperation Semelle Massage | NewDealZone",
    metaDescriptionFr: "Sandales Sport Elite avec semelle massante et soutien de la vo\u00fbte rembourr\u00e9 pour la r\u00e9cup\u00e9ration post-entra\u00eenement. Disponibles en Noir/Blanc, Marine/Or et Tout Noir.",
    focusKeyphraseFr: "sandales recuperation sport semelle massage soutien voute",
  },
  "fff0864e-96b8-4883-baa4-9714deb32e37": {
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
    images: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
    shortDescription: "Memory foam insole and ergonomic design for ultimate relaxation. The perfect everyday slide sandal.",
    seoTitle: "Slide Comfort Plus Sandals - Memory Foam Comfort Slides | NewDealZone",
    metaDescription: "Slide Comfort Plus sandals with memory foam insole and ergonomic design for maximum comfort during casual wear. Available in Black, Navy and Gray. Shop comfort slides at NewDealZone.",
    focusKeyphrase: "memory foam slide sandals comfort ergonomic",
    shortDescriptionFr: "Semelle m\u00e9moire de forme et design ergonomique pour une relaxation ultime. La sandale slide parfaite pour tous les jours.",
    seoTitleFr: "Slide Confort Plus - Sandales Slides Memoire de Forme | NewDealZone",
    metaDescriptionFr: "Sandales Slide Confort Plus avec semelle m\u00e9moire de forme et design ergonomique pour un confort maximum. Disponibles en Noir, Marine et Gris.",
    focusKeyphraseFr: "sandales slides memoire de forme confort ergonomique",
  },
  "3cc5c59f-8465-44ae-822b-ecc2c4bdd88c": {
    shortDescription: "Woven jute sole and canvas slip-on upper. The go-to warm-weather espadrille for beach and terrace days.",
    seoTitle: "Espadrille Summer Sandals - Woven Jute Canvas Slip-On Shoes | NewDealZone",
    metaDescription: "Espadrille Summer shoes with woven jute sole, canvas upper and slip-on design for breezy warm-weather style. Available in Natural, Blue Stripe and Red. Shop summer footwear at NewDealZone.",
    focusKeyphrase: "espadrille summer jute canvas slip-on warm weather shoes",
    shortDescriptionFr: "Semelle jute tress\u00e9e et tige en toile slip-on. L\u2019espadrille in\u00e9vitable pour la plage et la terrasse.",
    seoTitleFr: "Espadrille Ete - Espadrilles Jute Toile Slip-On | NewDealZone",
    metaDescriptionFr: "Espadrilles d\u2019\u00e9t\u00e9 avec semelle en jute tress\u00e9e, tige en toile et design slip-on. Disponibles en Naturel, Rayure Bleue et Rouge.",
    focusKeyphraseFr: "espadrilles ete jute toile slip-on chaussures temps chaud",
  },
  // CASUAL - fix name for Weight Lifting Shoe
  "f488dfb5-6560-46d3-b1cd-f13aa3146866": {
    name: "Suede Chukka Lagos",
    slug: "suede-chukka-lagos",
    shortDescription: "Premium suede Chukka boot with clean refined lines. Transitions seamlessly from smart casual to weekend wear.",
    seoTitle: "Suede Chukka Lagos Boots - Premium Casual Chukka Boots | NewDealZone",
    metaDescription: "Suede Chukka Lagos boots in premium suede with clean refined lines. Available in Desert, Charcoal and Forest. Versatile smart casual to weekend footwear at NewDealZone.",
    focusKeyphrase: "suede chukka boots casual premium smart casual",
    shortDescriptionFr: "Chukka en su\u00e8de premium avec lignes \u00e9pur\u00e9es. Passe sans effort du smart casual au week-end.",
    seoTitleFr: "Chukka en Daim Lagos - Boots Casual Suede Premium | NewDealZone",
    metaDescriptionFr: "Boots Chukka en Daim Lagos en su\u00e8de premium avec lignes raffin\u00e9es. Disponibles en D\u00e9sert, Charbon et For\u00eat. Polyvalence du smart casual au week-end.",
    focusKeyphraseFr: "boots chukka suede casual premium smart casual",
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
      const seoData = SEO_DATA[product.id];

      if (!seoData) {
        skipped++;
        results.push({ id: product.id, name: product.name, status: "skipped - no data", changes: [] });
        continue;
      }

      const updates: Record<string, unknown> = {};
      const changes: string[] = [];

      if (seoData.name && product.name !== seoData.name) {
        updates.name = seoData.name;
        changes.push("name fixed");
      }
      if (seoData.slug && product.slug !== seoData.slug) {
        updates.slug = seoData.slug;
        changes.push("slug fixed");
      }
      if (seoData.shortDescription && (!product.shortDescription || product.shortDescription.trim() === "")) {
        updates.shortDescription = seoData.shortDescription;
        changes.push("shortDescription added");
      }
      if (seoData.shortDescriptionFr && (!product.shortDescriptionFr || product.shortDescriptionFr.trim() === "")) {
        updates.shortDescriptionFr = seoData.shortDescriptionFr;
        changes.push("shortDescriptionFr added");
      }
      if (seoData.seoTitle && !product.seoTitle) {
        updates.seoTitle = seoData.seoTitle;
        changes.push("seoTitle added");
      }
      if (seoData.metaDescription && !product.metaDescription) {
        updates.metaDescription = seoData.metaDescription;
        changes.push("metaDescription added");
      }
      if (seoData.focusKeyphrase && !product.focusKeyphrase) {
        updates.focusKeyphrase = seoData.focusKeyphrase;
        changes.push("focusKeyphrase added");
      }
      if (seoData.seoTitleFr && !product.seoTitleFr) {
        updates.seoTitleFr = seoData.seoTitleFr;
        changes.push("seoTitleFr added");
      }
      if (seoData.metaDescriptionFr && !product.metaDescriptionFr) {
        updates.metaDescriptionFr = seoData.metaDescriptionFr;
        changes.push("metaDescriptionFr added");
      }
      if (seoData.focusKeyphraseFr && !product.focusKeyphraseFr) {
        updates.focusKeyphraseFr = seoData.focusKeyphraseFr;
        changes.push("focusKeyphraseFr added");
      }
      if (seoData.imageUrl) {
        updates.imageUrl = seoData.imageUrl;
        updates.images = JSON.stringify([seoData.imageUrl]);
        changes.push("imageUrl fixed");
      }

      if (Object.keys(updates).length === 0) {
        skipped++;
        results.push({ id: product.id, name: product.name, status: "no-change", changes: [] });
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
      summary: { total: allProducts.length, updated, skipped, errors },
      results,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}