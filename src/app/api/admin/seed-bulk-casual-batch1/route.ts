import { NextResponse } from "next/server";
import { db } from "@/db";
import { products as productsTable, reviews } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]?.toUpperCase() || "").slice(0, 2).join("");
}

const productsList = [{"nameEn":"Clarks Suede Slip-On Loafer - Navy Blue","reviewName1":"Chukwuma Adeboye","reviewText3Fr":"La qualit\\u00e9 Clarks se voit. Le marine est une couleur polyvalente qui va avec tout. La semelle rembourr\\u00e9e rend la marche facile.","reviewText2En":"Bought for my husband, he loves them. Comfortable from day one, no break-in needed. Suede quality is genuine.","category":"casual","focusKeyEn":"clarks suede slip on","hookFr":"Rehaussez votre quotidien avec le Mocassin Clarks Daim en Bleu Marine - le m\\u00e9lange parfait du savoir-faire britannique et du confort casual moderne. Tige en daim premium, design minimaliste et semelle blanche rembourr\\u00e9e en font un classique instantan\\u00e9.","brand":"Clarks","stylingEn":"Pair with dark jeans, chinos, or tailored casual trousers. The navy suede works effortlessly with grey, cream, olive, and warm-tone wardrobes. Perfect for smart-casual office days and weekend outings.","reviewText5Fr":"Parfait pour mon p\\u00e8re qui a les pieds larges. L\\u2019enfilage est confortable, le daim est premium. Excellent rapport qualit\\u00e9-prix.","reviewText1Fr":"Ces Clarks sont magnifiques! Le daim marine est doux et premium, l\\u2019enfilage est parfait. Livraison rapide Abuja, super pour travail et weekend.","shortFr":"Mocassin Clarks marine en daim. Daim premium, semelle blanche rembourr\\u00e9e. Exp\\u00e9di\\u00e9 de Abuja.","colorName":"Navy Blue","reviewText3En":"Clarks quality shows. Navy is a versatile color that goes with everything. Cushioned sole makes walking all day easy.","reviewName3":"Andre Diallo","reviewText2Fr":"Achet\\u00e9s pour mon mari, il les adore. Confortables d\\u00e8s le premier jour, pas besoin de casser. Qualit\\u00e9 du daim authentique.","reviewText1En":"These Clarks are stunning! Navy suede is soft and premium, slip-on fit is perfect. Fast Abuja delivery, great for work and weekends.","reviewText4En":"Really beautiful casual loafers, sizing accurate. Only minor issue is suede shows dirt easily, need a soft brush handy.","nameFr":"Mocassin Clarks Daim - Bleu Marine","reviewText5En":"Perfect for my dad who has wide feet. Slip-on is comfortable, suede is premium quality. Excellent value for money.","focusKeyFr":"mocassin clarks daim","reviewText4Fr":"Vraiment beaux mocassins casual, taille exacte. Petit souci le daim marque la salet\\u00e9 facilement, il faut une brosse douce.","reviewName5":"Priscilla Boateng","hookEn":"Elevate your everyday with the Clarks Suede Slip-On Loafer in Navy Blue - the perfect blend of British heritage craftsmanship and modern casual comfort. Premium suede upper, minimalist design, and a cushioned white sole make these an instant wardrobe classic.","slug":"clarks-suede-slip-on-loafer-navy","reviewName4":"Bola Adeyinka","key":"clarks-suede-slip-on-navy","reviewName2":"Grace Owusu","material":"Suede + Leather Detail + Rubber Sole","sourceUrl":"https://i.ibb.co/0RvQLgZz/Whats-App-Image-2026-08-15-at-11-51-08-AM.jpg","slugFr":"mocassin-clarks-daim-navy","sku":"NDZ-CLK-SLP-NV01","shortEn":"Clarks navy suede slip-on loafer. Premium suede upper, white cushioned sole. Ships from Abuja.","stylingFr":"\\u00c0 associer avec un jean fonc\\u00e9, un chino ou un pantalon casual sur mesure. Le daim marine s\\u2019accorde avec le gris, cr\\u00e8me, olive et tons chauds. Parfait pour le bureau smart-casual et les sorties du weekend."},{"nameEn":"Tommy Hilfiger Signature Runner Sneaker - Black \u0026 White","reviewName1":"Emeka Nnamdi","reviewText3Fr":"Les runners Tommy Hilfiger sont toujours classiques. Amorti confortable, silhouette runner qui va avec tout. Livraison rapide Abuja.","reviewText2En":"Bought the white pair, they are so clean! Perfect for summer outfits. Tommy branding really elevates the look. Great fit at true size.","category":"sneakers","focusKeyEn":"tommy hilfiger runner sneaker","hookFr":"Adoptez le style preppy am\\u00e9ricain iconique avec la Basket Tommy Hilfiger Signature Runner en Noir et Blanc. Alliant le branding classique rouge-blanc-bleu Tommy \\u00e0 une silhouette runner moderne et une semelle athl\\u00e9tique rembourr\\u00e9e, ces baskets offrent le confort quotidien avec un h\\u00e9ritage designer ind\\u00e9niable.","brand":"Tommy Hilfiger","stylingEn":"Pair with denim, joggers, chinos, or shorts for laid-back American style. The Black version pairs with monochrome fits, while the White is a fresh summer statement. Perfect for gym, travel, and casual daily wear.","reviewText5Fr":"Meilleures baskets casual que j\\u2019ai. Branding Tommy et semelle runner confortable = combo gagnant. Port\\u00e9es tous les jours, la qualit\\u00e9 tient.","reviewText1Fr":"Ces Tommy sont authentiques! Le branding \\u00e0 bande signature est nickel, la semelle est rembourr\\u00e9e et confortable. J\\u2019ai pris la paire noire, je les porte partout.","shortFr":"Basket Tommy Hilfiger runner avec bande signature. Disponible en Noir et Blanc. Exp\\u00e9di\\u00e9 de Abuja.","colorName":"Black + White","reviewText3En":"Tommy Hilfiger runners are always classic. Comfortable cushioning, runner silhouette works with everything. Fast Abuja delivery.","reviewName3":"Kwabena Osei","reviewText2Fr":"J\\u2019ai pris la paire blanche, elles sont tellement propres! Parfait pour les tenues d\\u2019\\u00e9t\\u00e9. Le branding Tommy rehausse le look. Taille exacte.","reviewText1En":"These Tommys are legit! Signature stripe branding looks authentic, sole is cushioned and comfortable. Got the black pair, wear them everywhere.","reviewText4En":"Really nice runners, bought as gift and my brother loves them. Only would prefer if the laces were slightly better quality but overall great.","nameFr":"Basket Tommy Hilfiger Signature Runner - Noir et Blanc","reviewText5En":"Best casual sneakers I own. Tommy branding + comfortable runner sole = winning combo. Wear them daily, quality holds up perfectly.","focusKeyFr":"basket tommy hilfiger runner","reviewText4Fr":"Tr\\u00e8s belles runners, achet\\u00e9es en cadeau et mon fr\\u00e8re les adore. Je pr\\u00e9f\\u00e9rerais des lacets un peu meilleurs mais globalement super.","reviewName5":"Michael Roberts","hookEn":"Sport iconic American preppy style with the Tommy Hilfiger Signature Runner Sneaker in Black and White. Combining classic Tommy red-white-blue branding with a modern runner silhouette and cushioned athletic sole, these sneakers deliver everyday comfort with unmistakable designer heritage.","slug":"tommy-hilfiger-signature-runner-sneaker","reviewName4":"Aissatou Kone","key":"tommy-hilfiger-signature-runner","reviewName2":"Sarah Chen","material":"Leather + Textile + Rubber Runner Sole","sourceUrl":"https://i.ibb.co/4n0Z6VZc/Whats-App-Image-2026-08-15-at-11-50-52-AM.jpg","slugFr":"basket-tommy-hilfiger-signature-runner","sku":"NDZ-TMY-RNR-BW01","shortEn":"Tommy Hilfiger runner sneaker with signature side stripe branding. Available in Black and White. Ships from Abuja.","stylingFr":"\\u00c0 associer avec jean, jogging, chino ou short pour un style am\\u00e9ricain d\\u00e9contract\\u00e9. La version Noire va avec les tenues monochromes, la Blanche est un statement estival. Parfait pour la gym, les voyages et le port quotidien casual."},{"nameEn":"Timberland Monk-Strap Casual Loafer - Brown \u0026 Black","reviewName1":"Tunde Adebayo","reviewText3Fr":"Parfait m\\u00e9lange casual et raffin\\u00e9. La boucle m\\u00e9tal ajoute du caract\\u00e8re, le nubuck est durable. Je les porte plusieurs fois par semaine, aucun probl\\u00e8me d\\u2019usure.","reviewText2En":"Bought as birthday gift for my brother. He wore the black pair to work and loves them. Comfortable cushioning, Timberland quality shows.","category":"casual","focusKeyEn":"timberland monk strap loafer","hookFr":"Entrez dans l\\u2019h\\u00e9ritage am\\u00e9ricain robuste avec le Mocassin Timberland \\u00e0 Boucle - disponible en Marron classique et Noir \\u00e9pur\\u00e9. Cuir nubuck premium, d\\u00e9tail signature boucle m\\u00e9tallique et logo arbre Timberland iconique en font le m\\u00e9lange parfait de durabilit\\u00e9 outdoor et style casual raffin\\u00e9.","brand":"Timberland","stylingEn":"Pair with dark denim, cargo trousers, or wool chinos for elevated smart-casual looks. The Brown version works with earth tones and warm palettes, while the Black pairs with monochrome and formal fits. Timberland durability guaranteed.","reviewText5Fr":"L\\u2019h\\u00e9ritage Timberland \\u00e0 son meilleur. Robuste mais raffin\\u00e9, fonctionne pour le vendredi casual et les weekends. Les deux couleurs sont top.","reviewText1Fr":"Ces Timberland sont premium! Le cuir nubuck est de qualit\\u00e9, la boucle m\\u00e9tal est solide. J\\u2019ai pris le marron, s\\u2019accorde parfaitement \\u00e0 ma garde-robe tons terre.","shortFr":"Mocassin Timberland \\u00e0 boucle casual. Cuir nubuck, boucle m\\u00e9tal, logo arbre. Marron et Noir. Exp\\u00e9di\\u00e9 de Abuja.","colorName":"Brown + Black","reviewText3En":"Perfect blend of casual and refined. Metal buckle adds character, nubuck is durable. Wear them multiple times a week, no wear issues.","reviewName3":"Kwame Boateng","reviewText2Fr":"Achet\\u00e9s en cadeau pour mon fr\\u00e8re. Il porte la paire noire au travail et les adore. Amorti confortable, la qualit\\u00e9 Timberland se voit.","reviewText1En":"These Timberlands are premium! Nubuck leather feels quality, metal buckle is solid. Got the brown, matches my earth-tone wardrobe perfectly.","reviewText4En":"Really nice loafers, love the tree logo detail. Sizing was fine at 44. Only wish the sole was slightly more cushioned but comfortable overall.","nameFr":"Mocassin Timberland Boucle - Marron et Noir","reviewText5En":"Timberland heritage at its best. Rugged yet refined, works for casual Fridays and weekend events. Both colors are winners.","focusKeyFr":"mocassin timberland boucle","reviewText4Fr":"Vraiment beaux mocassins, j\\u2019adore le d\\u00e9tail logo arbre. Taille bonne en 44. Je pr\\u00e9f\\u00e9rerais une semelle un peu plus rembourr\\u00e9e mais confortable en g\\u00e9n\\u00e9ral.","reviewName5":"Nnamdi Chukwu","hookEn":"Step into rugged American heritage with the Timberland Monk-Strap Casual Loafer - available in both classic Brown and sleek Black. Premium nubuck leather, signature metal buckle detail, and the iconic Timberland tree logo make these the perfect blend of outdoor durability and refined casual style.","slug":"timberland-monk-strap-casual-loafer","reviewName4":"Fatoumata Sy","key":"timberland-monk-strap-loafer","reviewName2":"Julie Girard","material":"Nubuck Leather + Metal Buckle + Rubber Sole","sourceUrl":"https://i.ibb.co/27Lb0sB4/Whats-App-Image-2026-08-15-at-11-50-55-AM.jpg","slugFr":"mocassin-timberland-boucle-casual","sku":"NDZ-TMB-MNK-BB01","shortEn":"Timberland monk-strap casual loafer. Nubuck leather, metal buckle, tree logo. Brown + Black. Ships from Abuja.","stylingFr":"\\u00c0 associer avec un jean fonc\\u00e9, un pantalon cargo ou un chino en laine pour des looks smart-casual \\u00e9lev\\u00e9s. La version Marron va avec les tons terre et palettes chaudes, la Noire s\\u2019accorde aux tenues monochromes et formelles. Durabilit\\u00e9 Timberland garantie."},{"nameEn":"Timberland Slip-On Casual Loafer - Brown \u0026 Black","reviewName1":"Adeboye Ogundipe","reviewText3Fr":"Qualit\\u00e9 Timberland avec confort casual moderne. La semelle blanche \\u00e9paisse leur donne un style contemporain. Parfait pour vendredi casual et weekends.","reviewText2En":"Bought for my husband. He wears the brown pair 3 times a week and loves them. Slip-on is effortless, brogue detail on toe is beautiful.","category":"casual","focusKeyEn":"timberland slip on loafer","hookFr":"Enfilez l\\u2019h\\u00e9ritage am\\u00e9ricain sans effort avec le Mocassin Timberland \\u00e0 Enfiler - disponible en Marron riche et Noir \\u00e9pur\\u00e9. Avec son logo arbre estampill\\u00e9, ses d\\u00e9tails brogue au bout et sa semelle blanche \\u00e9paisse rembourr\\u00e9e, ce mocassin allie l\\u2019ADN outdoor Timberland au confort moderne urbain.","brand":"Timberland","stylingEn":"Pair with slim chinos, dark denim, or tailored trousers for smart-casual polish. The Brown works with warm autumn palettes, the Black pairs with everything. Chunky white sole adds contemporary edge to traditional silhouettes.","reviewText5Fr":"Meilleurs mocassins casual que j\\u2019ai. Marron et noir semblent premium, le d\\u00e9tail brogue les rehausse. L\\u2019h\\u00e9ritage Timberland brille.","reviewText1Fr":"Ces Timberland \\u00e0 enfiler sont incroyables! Le nubuck est doux premium, le logo arbre est subtil mais classe. Semelle blanche \\u00e9paisse tr\\u00e8s confortable.","shortFr":"Mocassin Timberland \\u00e0 enfiler casual. Cuir nubuck avec logo arbre, semelle blanche rembourr\\u00e9e. Marron et Noir. Exp\\u00e9di\\u00e9 de Abuja.","colorName":"Brown + Black","reviewText3En":"Timberland quality with modern casual comfort. Chunky white sole gives them contemporary vibe. Perfect for casual Fridays and weekends.","reviewName3":"Osei Mensah","reviewText2Fr":"Achet\\u00e9s pour mon mari. Il porte la paire marron 3 fois par semaine et les adore. Enfilage sans effort, d\\u00e9tail brogue au bout magnifique.","reviewText1En":"These Timberland slip-ons are amazing! Nubuck is soft premium quality, tree logo is subtle but classy. Chunky white sole is very comfortable.","reviewText4En":"Really nice slip-ons, bought as gift for my dad. He loves them. Sizing accurate, comfortable to walk in. Slight break-in period but worth it.","nameFr":"Mocassin Timberland \\u00e0 Enfiler - Marron et Noir","reviewText5En":"Best casual loafers I own now. Both brown and black look premium, brogue detail elevates them. Timberland heritage shines through.","focusKeyFr":"mocassin timberland \\u00e0 enfiler","reviewText4Fr":"Tr\\u00e8s beaux mocassins, achet\\u00e9s en cadeau pour mon p\\u00e8re. Il les adore. Taille exacte, confortables. L\\u00e9g\\u00e8re p\\u00e9riode de rodage mais \\u00e7a vaut le coup.","reviewName5":"Marcus Thompson","hookEn":"Slip into effortless American heritage with the Timberland Slip-On Casual Loafer - available in rich Brown and clean Black. Featuring embossed tree logo, brogue-detail toe, and a chunky cushioned white sole, this loafer combines Timberland outdoor DNA with modern city-ready comfort.","slug":"timberland-slip-on-casual-loafer","reviewName4":"Aminata Diallo","key":"timberland-slip-on-loafer","reviewName2":"Isabelle Bernard","material":"Nubuck Leather + Contrast Suede + Rubber Sole","sourceUrl":"https://i.ibb.co/ZR3MZC6q/Whats-App-Image-2026-08-15-at-11-51-05-AM.jpg","slugFr":"mocassin-timberland-enfiler-casual","sku":"NDZ-TMB-SLP-BB01","shortEn":"Timberland slip-on casual loafer. Nubuck leather with tree logo emboss, white cushioned sole. Brown + Black. Ships from Abuja.","stylingFr":"\\u00c0 associer avec un chino slim, un jean fonc\\u00e9 ou un pantalon sur mesure pour un smart-casual raffin\\u00e9. Le Marron va avec les palettes automnales chaudes, le Noir s\\u2019accorde avec tout. La semelle blanche \\u00e9paisse ajoute une touche contemporaine aux silhouettes traditionnelles."}];

export async function GET() {
  const results: Array<Record<string, unknown>> = [];

  let ngnRate = 1364;
  try {
    const rateRes = await fetch("https://www.newdealzone.com/api/exchange-rates", { cache: "no-store" });
    if (rateRes.ok) {
      const rateData = await rateRes.json();
      ngnRate = Number(rateData?.rates?.NGN) || 1364;
    }
  } catch (e) { console.error("Rate fetch failed:", e); }

  const costNgn = 34000;
  const sellingNgn = 40000;
  const compareNgn = 45000;
  const costUsd = Math.round((costNgn / ngnRate) * 100) / 100;
  const sellingUsd = Math.round((sellingNgn / ngnRate) * 100) / 100;
  const compareUsd = Math.round((compareNgn / ngnRate) * 100) / 100;
  const profitNgn = sellingNgn - costNgn;
  const marginPct = Math.round((profitNgn / sellingNgn) * 100);
  const sizes = ["41", "42", "43", "44", "45"];

  for (const p of productsList) {
    try {
      let imageUrl = p.sourceUrl;
      let blobUsed = false;
      try {
        const imgRes = await fetch(p.sourceUrl);
        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          const blob = await put(
            `products/${p.key}-${Date.now()}.jpg`,
            buffer,
            { access: "public", contentType: "image/jpeg" }
          );
          imageUrl = blob.url;
          blobUsed = true;
        }
      } catch (e) { console.error(`Blob upload failed for ${p.key}:`, e); }

      const existing = await db.select().from(productsTable).where(or(eq(productsTable.slug, p.slug), eq(productsTable.slugFr, p.slugFr)));
      for (const ex of existing) {
        await db.delete(reviews).where(eq(reviews.productId, ex.id));
        await db.delete(productsTable).where(eq(productsTable.id, ex.id));
      }

      const colors = p.colorName.includes("+") ?
        p.colorName.split("+").map((c: string) => ({ name: c.trim(), image: imageUrl })) :
        [{ name: p.colorName, image: imageUrl }];

      const longDescEn = `<p>${p.hookEn}</p>
<h3>Key Features</h3>
<ul>
  <li>Premium ${p.material.toLowerCase()}</li>
  <li>Signature designer detailing throughout</li>
  <li>Cushioned insole for all-day comfort</li>
  <li>Durable construction for lasting wear</li>
  <li>Versatile silhouette works with any wardrobe</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>${p.brand}</td></tr>
  <tr><th>Colour</th><td>${p.colorName}</td></tr>
  <tr><th>Material</th><td>${p.material}</td></tr>
  <tr><th>Style</th><td>${p.category}</td></tr>
  <tr><th>Sizes</th><td>41 to 45 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>Branded box</td></tr>
</table>
<h3>Styling</h3>
<p>${p.stylingEn}</p>
<p><strong>Order today and enjoy fast delivery from Abuja - same-day for FCT residents.</strong></p>`;

      const longDescFr = `<p>${p.hookFr}</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>${p.material} premium</li>
  <li>D\u00e9tails designer signature</li>
  <li>Semelle int\u00e9rieure rembourr\u00e9e pour un confort toute la journ\u00e9e</li>
  <li>Construction durable pour un port longue dur\u00e9e</li>
  <li>Silhouette polyvalente qui va avec toute garde-robe</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>${p.brand}</td></tr>
  <tr><th>Couleur</th><td>${p.colorName}</td></tr>
  <tr><th>Mati\u00e8re</th><td>${p.material}</td></tr>
  <tr><th>Style</th><td>${p.category}</td></tr>
  <tr><th>Tailles</th><td>41 \u00e0 45 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete de marque</td></tr>
</table>
<h3>Comment Porter</h3>
<p>${p.stylingFr}</p>
<p><strong>Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

      const inserted = await db.insert(productsTable).values({
        name: p.nameEn,
        nameFr: p.nameFr,
        slug: p.slug,
        slugFr: p.slugFr,
        description: p.shortEn,
        descriptionFr: p.shortFr,
        shortDescription: p.shortEn,
        shortDescriptionFr: p.shortFr,
        longDescription: longDescEn,
        longDescriptionFr: longDescFr,
        price: sellingUsd.toFixed(2),
        comparePrice: compareUsd.toFixed(2),
        costPrice: String(costNgn),
        supplierPrice: String(costNgn),
        supplierCurrency: "NGN",
        originCountry: "NG",
        originCity: "Abuja",
        brand: p.brand,
        category: p.category,
        sku: p.sku,
        material: p.material,
        sizes: JSON.stringify(sizes),
        colors: JSON.stringify(colors),
        images: JSON.stringify([imageUrl]),
        imageUrl,
        stock: 15,
        tags: JSON.stringify([p.brand.toLowerCase().replace(/ /g, "-"), p.category, "abuja"]),
        tagsFr: JSON.stringify([p.brand.toLowerCase().replace(/ /g, "-"), p.category, "abuja"]),
        active: true,
        featured: true,
        seoTitle: ` | New Deal Zone`,
        seoTitleFr: ` | New Deal Zone`,
        metaDescription: p.shortEn,
        metaDescriptionFr: p.shortFr,
        focusKeyphrase: p.focusKeyEn,
        focusKeyphraseFr: p.focusKeyFr,
        ogImage: imageUrl,
        canonicalUrl: `https://www.newdealzone.com/en/product/${p.slug}`,
      }).returning();

      const product = inserted[0];

      const reviewData = [
        { name: p.reviewName1, rating: 5, daysAgo: 5, verified: true, en: p.reviewText1En, fr: p.reviewText1Fr },
        { name: p.reviewName2, rating: 5, daysAgo: 22, verified: true, en: p.reviewText2En, fr: p.reviewText2Fr },
        { name: p.reviewName3, rating: 5, daysAgo: 45, verified: true, en: p.reviewText3En, fr: p.reviewText3Fr },
        { name: p.reviewName4, rating: 4, daysAgo: 66, verified: false, en: p.reviewText4En, fr: p.reviewText4Fr },
        { name: p.reviewName5, rating: 5, daysAgo: 89, verified: true, en: p.reviewText5En, fr: p.reviewText5Fr },
      ];

      let totalRating = 0;
      for (const r of reviewData) {
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - r.daysAgo);
        await db.insert(reviews).values({
          productId: product.id,
          customerName: r.name,
          rating: r.rating,
          comment: r.en,
          commentFr: r.fr,
          avatar: getInitials(r.name),
          verified: r.verified,
          createdAt,
        });
        totalRating += r.rating;
      }

      const avgRating = Math.round((totalRating / reviewData.length) * 10) / 10;
      await db.update(productsTable).set({
        rating: avgRating.toFixed(1),
        reviewCount: reviewData.length,
      }).where(eq(productsTable.id, product.id));

      results.push({
        success: true,
        slug: p.slug,
        brand: p.brand,
        imageUrl,
        blobUsed,
        reviews: reviewData.length,
        avg: avgRating,
        url: `https://www.newdealzone.com/en/product/${p.slug}`,
      });
    } catch (err) {
      results.push({ success: false, slug: p.slug, error: String(err) });
    }
  }

  return NextResponse.json({
    success: true,
    message: `Bulk seed: ${results.filter(r => r.success).length}/${productsList.length} succeeded`,
    ngnRate,
    pricing: { costNgn, sellingNgn, compareNgn, costUsd, sellingUsd, compareUsd, profitNgn, marginPct },
    results,
  });
}