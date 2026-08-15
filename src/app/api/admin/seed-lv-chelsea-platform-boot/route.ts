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
    const sourceUrl = "https://i.ibb.co/RkZJ28hk/Whats-App-Image-2026-08-11-at-8-26-21-AM-1.jpg";
    const slug = "louis-vuitton-chelsea-platform-boot-black-glossy";
    const slugFr = "bottine-louis-vuitton-chelsea-plateforme-noir-brillant";

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

    const costNgn = 39000;
    const sellingNgn = 45000;
    const compareNgn = 48000;

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
          `products/louis-vuitton-chelsea-platform-boot-black-${Date.now()}.jpg`,
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
      { name: "Black Glossy", image: imageUrl },
    ];

    const sizes = ["41"];
    const images = [imageUrl];

    const tagsEn = ["louis-vuitton", "lv", "chelsea-boot", "platform", "boots", "leather", "designer", "luxury", "black", "glossy", "abuja"];
    const tagsFr = ["louis-vuitton", "lv", "chelsea", "plateforme", "bottines", "cuir", "designer", "luxe", "noir", "brillant", "abuja"];

    const longDescEn = `<p>Command every step with the Louis Vuitton Chelsea Platform Boot in Glossy Black \u2013 an unmistakable statement of French luxury heritage meets bold streetwear proportions. High-shine glazed leather, silver buckle detailing, and a commanding chunky platform sole create instant designer presence.</p>
<h3>Key Features</h3>
<ul>
  <li>Premium glazed high-shine black leather upper</li>
  <li>Signature silver-tone buckle strap on top of elastic gussets</li>
  <li>Chunky rubber platform sole for height and attitude</li>
  <li>Elastic side gussets for effortless slip-on wear</li>
  <li>Rear pull tab for easy entry</li>
  <li>Cushioned insole with LV branding for luxury comfort</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>Louis Vuitton</td></tr>
  <tr><th>Model</th><td>Chelsea Platform Ankle Boot</td></tr>
  <tr><th>Colour</th><td>Black Glossy</td></tr>
  <tr><th>Material</th><td>Glazed Leather + Rubber Platform Sole</td></tr>
  <tr><th>Cushioning/Sole</th><td>Chunky rubber platform</td></tr>
  <tr><th>Signature Detail</th><td>Silver buckle + high-shine finish</td></tr>
  <tr><th>Closure</th><td>Slip-on elastic Chelsea with buckle</td></tr>
  <tr><th>Style</th><td>Luxury designer platform Chelsea</td></tr>
  <tr><th>Sizes</th><td>41 EU (3 pairs available)</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>Louis Vuitton branded box, dust bag</td></tr>
</table>
<h3>Styling</h3>
<p>Pair with tapered denim, wide-leg trousers, or tailored suits for a razor-sharp designer look. The high-shine finish elevates evening ensembles while the chunky platform adds streetwear edge to formal fits. Perfect for statement moments where quiet luxury meets modern boldness.</p>
<p><strong>Only 3 pairs available in size 41. Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>Imposez chaque pas avec la Bottine Louis Vuitton Chelsea Plateforme en Noir Brillant \u2013 une d\u00e9claration incontournable de l\u2019h\u00e9ritage de luxe fran\u00e7ais rencontrant les proportions streetwear audacieuses. Cuir gla\u00e7\u00e9 haute brillance, d\u00e9tail boucle argent\u00e9e et semelle plateforme \u00e9paisse imposante cr\u00e9ent une pr\u00e9sence designer instantan\u00e9e.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Tige en cuir gla\u00e7\u00e9 haute brillance noir premium</li>
  <li>Sangle boucle argent\u00e9e signature au-dessus des soufflets \u00e9lastiques</li>
  <li>Semelle plateforme \u00e9paisse en caoutchouc pour hauteur et attitude</li>
  <li>Soufflets \u00e9lastiques pour enfilage sans effort</li>
  <li>Languette arri\u00e8re pour un enfilage facile</li>
  <li>Semelle int\u00e9rieure rembourr\u00e9e avec branding LV pour un confort luxueux</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>Louis Vuitton</td></tr>
  <tr><th>Mod\u00e8le</th><td>Bottine Chelsea Plateforme</td></tr>
  <tr><th>Couleur</th><td>Noir Brillant</td></tr>
  <tr><th>Mati\u00e8re</th><td>Cuir gla\u00e7\u00e9 + Semelle caoutchouc plateforme</td></tr>
  <tr><th>Amorti</th><td>Plateforme caoutchouc \u00e9paisse</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Boucle argent\u00e9e + finition haute brillance</td></tr>
  <tr><th>Fermeture</th><td>Chelsea \u00e0 enfiler avec boucle</td></tr>
  <tr><th>Style</th><td>Chelsea plateforme designer de luxe</td></tr>
  <tr><th>Tailles</th><td>41 EU (3 paires disponibles)</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete Louis Vuitton, sac \u00e0 poussi\u00e8re</td></tr>
</table>
<h3>Comment Porter</h3>
<p>\u00c0 associer avec un jean fusel\u00e9, un pantalon large ou un costume sur mesure pour un look designer tranchant. La finition haute brillance rehausse les tenues du soir tandis que la plateforme \u00e9paisse ajoute une touche streetwear aux tenues formelles. Parfait pour les moments qui marquent o\u00f9 luxe discret rencontre audace moderne.</p>
<p><strong>Seulement 3 paires disponibles en taille 41. Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Louis Vuitton Chelsea Platform Boot - Black Glossy",
      nameFr: "Bottine Louis Vuitton Chelsea Plateforme - Noir Brillant",
      slug,
      slugFr,
      description: "Louis Vuitton Chelsea Platform Boot in Glossy Black. Glazed leather, silver buckle, chunky platform sole. Designer luxury. Ships from Abuja.",
      descriptionFr: "Bottine Louis Vuitton Chelsea Plateforme en Noir Brillant. Cuir gla\u00e7\u00e9, boucle argent\u00e9e, semelle plateforme \u00e9paisse. Luxe designer. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "LV Chelsea platform boot in glossy black. Glazed leather, silver buckle, chunky sole. Ships from Abuja.",
      shortDescriptionFr: "Bottine LV Chelsea plateforme noire brillante. Cuir gla\u00e7\u00e9, boucle argent, semelle \u00e9paisse. Exp\u00e9di\u00e9 de Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: String(costNgn),
      supplierPrice: String(costNgn),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      brand: "Louis Vuitton",
      category: "boots",
      sku: "NDZ-LV-CHP-BK01",
      material: "Glazed Leather + Rubber Platform Sole",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 3,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: true,
      seoTitle: "Louis Vuitton Chelsea Platform Boot Black | New Deal Zone",
      seoTitleFr: "Bottine LV Chelsea Plateforme Noir Brillant | New Deal Zone",
      metaDescription: "Louis Vuitton Chelsea Platform Boot in Glossy Black. Glazed leather, silver buckle detail, chunky platform sole. Fast delivery from Abuja.",
      metaDescriptionFr: "Bottine Louis Vuitton Chelsea Plateforme noire brillante. Cuir gla\u00e7\u00e9, boucle argent, semelle \u00e9paisse. Livraison rapide depuis Abuja.",
      focusKeyphrase: "louis vuitton chelsea boot",
      focusKeyphraseFr: "bottine louis vuitton chelsea",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Emeka Ogundipe", rating: 5, daysAgo: 5, verified: true,
        commentEn: "These LV Chelsea platforms are absolute fire! The glossy finish catches every light and the silver buckle is such a nice designer touch. Fast Abuja delivery.",
        commentFr: "Ces LV Chelsea plateformes sont incroyables! La finition brillante capte chaque lumi\u00e8re et la boucle argent\u00e9e est une belle touche designer. Livraison rapide Abuja." },
      { name: "Isabelle Martin", rating: 5, daysAgo: 22, verified: true,
        commentEn: "Bought as anniversary gift for my husband. He\u2019s completely in love. Quality is exceptional and the chunky sole adds serious presence.",
        commentFr: "Achet\u00e9es pour l\u2019anniversaire de mariage de mon mari. Il en est fou. Qualit\u00e9 exceptionnelle et la semelle \u00e9paisse ajoute une vraie pr\u00e9sence." },
      { name: "Nnamdi Okafor", rating: 5, daysAgo: 44, verified: true,
        commentEn: "Wore these to a wedding and got constant compliments. Slip-on fit is perfect, glossy leather looks premium, chunky sole is comfortable.",
        commentFr: "Port\u00e9es \u00e0 un mariage et compliments constants. Enfilage parfait, le cuir brillant est premium, la semelle \u00e9paisse est confortable." },
      { name: "Julie Rousseau", rating: 4, daysAgo: 66, verified: false,
        commentEn: "Really beautiful boots, love the LV branding on the insole. Sizing was accurate. Only wish they had a wider size range but glad I got mine.",
        commentFr: "Bottines vraiment belles, j\u2019adore le branding LV sur la semelle. Taille exacte. Je regrette juste que la gamme de tailles soit limit\u00e9e mais content d\u2019avoir eu la mienne." },
      { name: "Ibrahim Toure", rating: 5, daysAgo: 90, verified: true,
        commentEn: "Best luxury Chelsea I own. High-shine leather elevates any outfit and the platform sole is chunky but not too aggressive. Worth every naira.",
        commentFr: "Meilleure Chelsea de luxe que j\u2019ai. Le cuir brillant rehausse toute tenue et la semelle plateforme est \u00e9paisse mais pas trop agressive. Vaut chaque naira." },
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