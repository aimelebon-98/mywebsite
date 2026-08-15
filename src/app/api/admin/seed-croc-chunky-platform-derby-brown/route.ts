import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]?.toUpperCase() || "").slice(0, 2).join("");
}

export async function GET() {
  try {
    const sourceUrl = "https://i.ibb.co/0j80BymM/Whats-App-Image-2026-08-11-at-8-26-33-AM-1.jpg";
    const slug = "croc-panel-chunky-platform-derby-brown";
    const slugFr = "derby-croco-plateforme-marron";

    let ngnRate = 1364;
    let xofRate = 568;
    try {
      const rateRes = await fetch("https://www.newdealzone.com/api/exchange-rates", { cache: "no-store" });
      if (rateRes.ok) {
        const rateData = await rateRes.json();
        ngnRate = Number(rateData?.rates?.NGN) || 1364;
        xofRate = Number(rateData?.rates?.XOF) || 568;
      }
    } catch (e) { console.error("Rate fetch failed:", e); }

    const costNgn = 38000;
    const sellingNgn = 45000;
    const compareNgn = 52000;

    const costUsd = Math.round((costNgn / ngnRate) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / ngnRate) * 100) / 100;
    const compareUsd = Math.round((compareNgn / ngnRate) * 100) / 100;
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 100);

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/croc-panel-chunky-platform-derby-brown-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) { console.error("Blob upload failed:", e); }

    const existing = await db.select().from(products).where(or(eq(products.slug, slug), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
      await db.delete(products).where(eq(products.id, p.id));
    }

    const colors = [
      { name: "Rich Brown", image: imageUrl },
    ];

    const sizes = ["41", "42", "43", "44", "45"];
    const images = [imageUrl];

    const tagsEn = ["derby", "chunky", "platform", "croc-embossed", "snake-print", "formal", "streetwear", "brown", "cognac", "abuja"];
    const tagsFr = ["derby", "\u00e9paisses", "plateforme", "croco", "serpent", "formel", "streetwear", "marron", "cognac", "abuja"];

    const longDescEn = `<p>Command every step with the Croc-Panel Chunky Platform Derby in Rich Brown \u2013 a striking formal-meets-streetwear silhouette that transforms any outfit. Polished cognac leather vamp contrasts beautifully with snake-embossed side and heel panels, all set atop a bold chunky rubber lug platform that adds serious height and edge.</p>
<h3>Key Features</h3>
<ul>
  <li>Premium polished rich brown leather vamp and tongue</li>
  <li>Contrasting snake-embossed leather side and heel panels</li>
  <li>Chunky rubber lug platform sole for commanding height and grip</li>
  <li>Modern square-toe silhouette</li>
  <li>Traditional 4-eyelet derby lace-up with tonal brown laces</li>
  <li>Padded collar for all-day wear comfort</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>Prestige</td></tr>
  <tr><th>Model</th><td>Croc-Panel Chunky Platform Derby</td></tr>
  <tr><th>Colour</th><td>Rich Brown</td></tr>
  <tr><th>Material</th><td>Polished + Snake-Embossed Leather + Rubber Lug Sole</td></tr>
  <tr><th>Cushioning/Sole</th><td>Chunky rubber lug platform</td></tr>
  <tr><th>Signature Detail</th><td>Snake-embossed side + heel panels</td></tr>
  <tr><th>Closure</th><td>4-eyelet derby lace-up</td></tr>
  <tr><th>Style</th><td>Chunky platform derby / streetwear formal</td></tr>
  <tr><th>Sizes</th><td>41 to 45 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>Branded box, shoehorn</td></tr>
</table>
<h3>Styling</h3>
<p>Pair with olive tailored trousers, cream chinos, wide-leg denim, or dark suits for elevated smart-casual looks. The rich brown palette works exceptionally with autumn/winter tones, while the snake texture adds unexpected designer flair. Perfect for weddings, creative business settings, or bold statement moments.</p>
<p><strong>Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>Imposez chaque pas avec le Derby Croco Plateforme en Marron Riche \u2013 une silhouette saisissante formel-streetwear qui transforme toute tenue. L\u2019empeigne en cuir cognac poli contraste magnifiquement avec les panneaux c\u00f4t\u00e9 et talon estampill\u00e9s serpent, le tout sur une audacieuse semelle plateforme \u00e9paisse en caoutchouc qui ajoute hauteur et caract\u00e8re.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Empeigne et languette en cuir marron riche poli premium</li>
  <li>Panneaux c\u00f4t\u00e9 et talon contrast\u00e9s en cuir estampill\u00e9 serpent</li>
  <li>Semelle plateforme \u00e9paisse en caoutchouc crampons\u00e9 pour hauteur imposante et adh\u00e9rence</li>
  <li>Silhouette moderne bout carr\u00e9</li>
  <li>Lacet derby traditionnel \u00e0 4 \u0153illets avec lacets marron ton sur ton</li>
  <li>Col rembourr\u00e9 pour un confort toute la journ\u00e9e</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>Prestige</td></tr>
  <tr><th>Mod\u00e8le</th><td>Derby Croco Plateforme</td></tr>
  <tr><th>Couleur</th><td>Marron Riche</td></tr>
  <tr><th>Mati\u00e8re</th><td>Cuir poli + Estampill\u00e9 serpent + Semelle caoutchouc</td></tr>
  <tr><th>Amorti</th><td>Plateforme caoutchouc crampons\u00e9e</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Panneaux serpent c\u00f4t\u00e9 et talon</td></tr>
  <tr><th>Fermeture</th><td>Derby \u00e0 4 \u0153illets</td></tr>
  <tr><th>Style</th><td>Derby plateforme / streetwear formel</td></tr>
  <tr><th>Tailles</th><td>41 \u00e0 45 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete de marque, chausse-pied</td></tr>
</table>
<h3>Comment Porter</h3>
<p>\u00c0 associer avec un pantalon sur mesure olive, un chino cr\u00e8me, un jean large ou un costume fonc\u00e9 pour des looks smart-casual \u00e9lev\u00e9s. La palette marron riche fonctionne exceptionnellement avec les tons automne-hiver, tandis que la texture serpent ajoute une touche designer inattendue. Parfait pour les mariages, milieux business cr\u00e9atifs ou moments d\u00e9claration audacieux.</p>
<p><strong>Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Croc-Panel Chunky Platform Derby - Rich Brown",
      nameFr: "Derby Croco Plateforme - Marron Riche",
      slug,
      slugFr,
      description: "Croc-Panel Chunky Platform Derby in Rich Brown. Polished + snake-embossed leather panels, chunky lug platform sole. Ships from Abuja.",
      descriptionFr: "Derby Croco Plateforme en Marron Riche. Panneaux cuir poli et estampill\u00e9 serpent, semelle plateforme \u00e9paisse. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "Croc-panel chunky platform derby in rich brown. Polished + snake leather, chunky lug sole. Ships from Abuja.",
      shortDescriptionFr: "Derby croco plateforme marron riche. Cuir poli et serpent, semelle \u00e9paisse. Exp\u00e9di\u00e9 de Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: String(costNgn),
      supplierPrice: String(costNgn),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      brand: "Prestige",
      category: "formal",
      sku: "NDZ-PRE-DBY-BR01",
      material: "Polished + Snake-Embossed Leather + Rubber Lug Sole",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 15,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: true,
      seoTitle: "Croc-Panel Chunky Platform Derby Brown | New Deal Zone",
      seoTitleFr: "Derby Croco Plateforme Marron Riche | New Deal Zone",
      metaDescription: "Croc-Panel Chunky Platform Derby in Rich Brown. Polished + snake-embossed leather mix, chunky lug sole. Fast delivery from Abuja.",
      metaDescriptionFr: "Derby croco plateforme marron riche. M\u00e9lange cuir poli et serpent, semelle \u00e9paisse. Livraison rapide depuis Abuja.",
      focusKeyphrase: "brown platform derby",
      focusKeyphraseFr: "derby marron plateforme",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Tunde Ogundipe", rating: 5, daysAgo: 5, verified: true,
        commentEn: "These brown derbys are stunning! The snake panels add so much character and the chunky sole is comfortable. Perfect with olive suits. Fast Abuja delivery.",
        commentFr: "Ces derbys marron sont magnifiques! Les panneaux serpent ajoutent tellement de caract\u00e8re et la semelle \u00e9paisse est confortable. Parfait avec les costumes olive. Livraison rapide Abuja." },
      { name: "Aminata Toure", rating: 5, daysAgo: 22, verified: true,
        commentEn: "Bought for my brother\u2019s wedding as groomsman shoes. Perfect fit and rich brown color matches the tan suits beautifully. Quality is exceptional.",
        commentFr: "Achet\u00e9s pour le mariage de mon fr\u00e8re comme chaussures de gar\u00e7on d\u2019honneur. Taille parfaite et le marron riche s\u2019accorde superbement aux costumes beiges. Qualit\u00e9 exceptionnelle." },
      { name: "Kwame Boateng", rating: 5, daysAgo: 45, verified: true,
        commentEn: "Rich brown polished finish is gorgeous and the snake embossed panels give designer vibes. Chunky sole gives me presence and comfort. Recommend.",
        commentFr: "La finition marron riche polie est superbe et les panneaux serpent estampill\u00e9s donnent un style designer. La semelle \u00e9paisse me donne pr\u00e9sence et confort. Je recommande." },
      { name: "Sophie Rousseau", rating: 4, daysAgo: 66, verified: false,
        commentEn: "Really beautiful derbys, bought for my husband. Sizing was accurate. Only needed a few days to break in the leather. Overall very happy with purchase.",
        commentFr: "Vraiment beaux derbys, achet\u00e9s pour mon mari. Taille exacte. Il fallait juste quelques jours pour casser le cuir. Globalement tr\u00e8s contente de l\u2019achat." },
      { name: "Yusuf Adebayo", rating: 5, daysAgo: 89, verified: true,
        commentEn: "Best brown formal shoes I own. Rich cognac color, unique snake texture, and chunky sole = winning combo. Wear them with everything from suits to jeans.",
        commentFr: "Meilleures chaussures habill\u00e9es marron que j\u2019ai. Couleur cognac riche, texture serpent unique, semelle \u00e9paisse = combo gagnant. Je les porte avec tout, du costume au jean." },
    ];

    let totalRating = 0;
    for (const r of reviewData) {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - r.daysAgo);
      await db.insert(reviews).values({
        productId: product.id,
        customerName: r.name,
        rating: r.rating,
        comment: r.commentEn,
        commentFr: r.commentFr,
        avatar: getInitials(r.name),
        verified: r.verified,
        createdAt,
      });
      totalRating += r.rating;
    }

    const avgRating = Math.round((totalRating / reviewData.length) * 10) / 10;
    await db.update(products).set({
      rating: avgRating.toFixed(1),
      reviewCount: reviewData.length,
    }).where(eq(products.id, product.id));

    return NextResponse.json({
      success: true,
      message: "Product + reviews seeded",
      product: { id: product.id, slug, slugFr, imageUrl, blobUsed },
      pricing: { costNgn, sellingNgn, compareNgn, costUsd, sellingUsd, compareUsd, profitNgn, marginPct, ngnRate, xofRate },
      reviews: { count: reviewData.length, avg: avgRating },
      origin: { country: "NG", city: "Abuja" },
      urls: {
        en: `https://www.newdealzone.com/en/product/${slug}`,
        fr: `https://www.newdealzone.com/fr/product/${slugFr}`,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}