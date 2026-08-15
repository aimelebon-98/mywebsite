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
    const sourceUrl = "https://i.ibb.co/1Yhg9S8K/Whats-App-Image-2026-08-11-at-8-26-28-AM-1.jpg";
    const slug = "urban-elevate-chelsea-platform-boot-black";
    const slugFr = "bottine-urban-elevate-chelsea-plateforme-noir";

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
    const compareNgn = 55000;

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
          `products/urban-elevate-chelsea-platform-boot-black-${Date.now()}.jpg`,
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
      { name: "Black", image: imageUrl },
    ];

    const sizes = ["41", "42", "43"];
    const images = [imageUrl];

    const tagsEn = ["chelsea-boot", "platform", "urban-elevate", "boots", "genuine-leather", "chunky", "black", "streetwear", "abuja"];
    const tagsFr = ["chelsea", "bottine", "plateforme", "urban-elevate", "bottes", "cuir-v\u00e9ritable", "\u00e9paisses", "noir", "streetwear", "abuja"];

    const longDescEn = `<p>Elevate every step with the Urban Elevate Chelsea Platform Boot in Black \u2013 the iconic step-up crafted from 100% genuine leather. Combining British Chelsea heritage with modern chunky proportions, this boot delivers commanding presence and everyday wearability.</p>
<h3>Key Features</h3>
<ul>
  <li>100% genuine leather upper with clean minimalist finish</li>
  <li>Signature elastic side gussets for easy slip-on wear</li>
  <li>Chunky lug rubber platform sole for height and grip</li>
  <li>Modern square-toe silhouette</li>
  <li>Rear pull tab for effortless entry</li>
  <li>Cushioned insole for all-day comfort</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>Urban Elevate</td></tr>
  <tr><th>Model</th><td>Chelsea Platform Boot</td></tr>
  <tr><th>Colour</th><td>Black</td></tr>
  <tr><th>Material</th><td>100% Genuine Leather + Rubber Lug Sole</td></tr>
  <tr><th>Cushioning/Sole</th><td>Chunky rubber lug platform</td></tr>
  <tr><th>Signature Detail</th><td>Elastic gussets + chunky lug sole</td></tr>
  <tr><th>Closure</th><td>Elastic slip-on with pull tab</td></tr>
  <tr><th>Style</th><td>Chelsea platform streetwear</td></tr>
  <tr><th>Sizes</th><td>41, 42, 43 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>Urban Elevate branded box</td></tr>
</table>
<h3>Styling</h3>
<p>Pair with slim jeans, wide-leg trousers, or cropped chinos to showcase the chunky platform. Works equally well with tailored fits and casual streetwear looks. The all-black leather is a wardrobe non-negotiable for autumn and winter dressing.</p>
<p><strong>Limited sizes available. Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>\u00c9levez chaque pas avec la Bottine Urban Elevate Chelsea Plateforme en Noir \u2013 l\u2019iconique montre en cuir 100% v\u00e9ritable. Alliant l\u2019h\u00e9ritage britannique Chelsea aux proportions \u00e9paisses modernes, cette bottine offre une pr\u00e9sence imposante et un port quotidien.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Tige en cuir 100% v\u00e9ritable avec finition minimaliste \u00e9pur\u00e9e</li>
  <li>Soufflets \u00e9lastiques signature pour enfilage facile</li>
  <li>Semelle plateforme \u00e9paisse en caoutchouc crampons\u00e9 pour hauteur et adh\u00e9rence</li>
  <li>Silhouette moderne bout carr\u00e9</li>
  <li>Languette arri\u00e8re pour un enfilage sans effort</li>
  <li>Semelle int\u00e9rieure rembourr\u00e9e pour un confort toute la journ\u00e9e</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>Urban Elevate</td></tr>
  <tr><th>Mod\u00e8le</th><td>Chelsea Plateforme</td></tr>
  <tr><th>Couleur</th><td>Noir</td></tr>
  <tr><th>Mati\u00e8re</th><td>Cuir v\u00e9ritable 100% + Semelle caoutchouc</td></tr>
  <tr><th>Amorti</th><td>Plateforme caoutchouc crampons\u00e9e</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Soufflets \u00e9lastiques + semelle crampons\u00e9e</td></tr>
  <tr><th>Fermeture</th><td>Enfilage \u00e9lastique avec languette</td></tr>
  <tr><th>Style</th><td>Chelsea plateforme streetwear</td></tr>
  <tr><th>Tailles</th><td>41, 42, 43 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete de marque Urban Elevate</td></tr>
</table>
<h3>Comment Porter</h3>
<p>\u00c0 associer avec un jean slim, un pantalon large ou un chino court pour mettre en valeur la plateforme \u00e9paisse. Fonctionne aussi bien avec les tenues sur mesure qu\u2019avec les looks streetwear casual. Le cuir noir int\u00e9gral est un incontournable de la garde-robe automne-hiver.</p>
<p><strong>Tailles limit\u00e9es disponibles. Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Urban Elevate Chelsea Platform Boot - Black",
      nameFr: "Bottine Urban Elevate Chelsea Plateforme - Noir",
      slug,
      slugFr,
      description: "Urban Elevate Chelsea Platform Boot in Black. 100% genuine leather, chunky lug sole, elastic gussets, square toe. Ships from Abuja.",
      descriptionFr: "Bottine Urban Elevate Chelsea Plateforme en Noir. Cuir v\u00e9ritable 100%, semelle crampons\u00e9e \u00e9paisse, soufflets \u00e9lastiques. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "Urban Elevate Chelsea Platform Boot in black. 100% genuine leather, chunky lug sole. Ships from Abuja.",
      shortDescriptionFr: "Bottine Chelsea plateforme Urban Elevate noire. Cuir v\u00e9ritable, semelle \u00e9paisse. Exp\u00e9di\u00e9 de Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: String(costNgn),
      supplierPrice: String(costNgn),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      brand: "Urban Elevate",
      category: "boots",
      sku: "NDZ-URB-CHP-BK01",
      material: "100% Genuine Leather + Rubber Lug Sole",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 12,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: true,
      seoTitle: "Urban Elevate Chelsea Platform Boot Black | New Deal Zone",
      seoTitleFr: "Bottine Chelsea Plateforme Urban Elevate Noir | New Deal Zone",
      metaDescription: "Urban Elevate Chelsea Platform Boot in black. 100% genuine leather, chunky lug sole, elastic gussets. Fast delivery from Abuja.",
      metaDescriptionFr: "Bottine Urban Elevate Chelsea Plateforme noire. Cuir v\u00e9ritable, semelle crampons\u00e9e, soufflets \u00e9lastiques. Livraison rapide depuis Abuja.",
      focusKeyphrase: "chelsea platform boot",
      focusKeyphraseFr: "bottine chelsea plateforme",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Adeboye Ogundipe", rating: 5, daysAgo: 6, verified: true,
        commentEn: "These boots are absolutely fire! The leather is genuinely thick and premium, and the chunky sole gives me the extra height I love. Fast delivery in Abuja.",
        commentFr: "Ces bottines sont incroyables! Le cuir est vraiment \u00e9pais et premium, et la semelle \u00e9paisse me donne la hauteur en plus que j\u2019adore. Livraison rapide \u00e0 Abuja." },
      { name: "Elizabeth Rousseau", rating: 5, daysAgo: 24, verified: true,
        commentEn: "Perfect Chelsea boots! Leather smells amazing and quality is top-tier. The platform is comfortable and gives so much presence. Highly recommend.",
        commentFr: "Bottines Chelsea parfaites! Le cuir sent bon et la qualit\u00e9 est au top. La plateforme est confortable et donne beaucoup de pr\u00e9sence. Je recommande." },
      { name: "Michael Owusu", rating: 5, daysAgo: 47, verified: true,
        commentEn: "Been looking for chunky Chelseas for a while, these deliver. Genuine leather feels expensive, sole is heavy duty. Great with jeans.",
        commentFr: "Je cherchais des Chelsea \u00e9paisses depuis un moment, celles-ci sont parfaites. Cuir v\u00e9ritable qui semble cher, semelle robuste. Super avec un jean." },
      { name: "Andre Ba", rating: 4, daysAgo: 68, verified: false,
        commentEn: "Really quality boots, love the design. Sizing is accurate but they need about a week to fully break in. Once broken in, super comfortable.",
        commentFr: "Bottines de vraie qualit\u00e9, j\u2019adore le design. Taille exacte mais il faut environ une semaine pour bien les casser. Une fois cass\u00e9es, super confortable." },
      { name: "Thomas Bernard", rating: 5, daysAgo: 91, verified: true,
        commentEn: "Best Chelsea boots I own. The platform elevates any outfit and the black leather goes with everything. Investment piece for sure.",
        commentFr: "Les meilleures Chelsea que j\u2019ai. La plateforme rehausse toute tenue et le cuir noir va avec tout. Un vrai investissement." },
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