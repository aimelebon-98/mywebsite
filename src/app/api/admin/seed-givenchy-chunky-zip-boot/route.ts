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
    const sourceUrl = "https://i.ibb.co/JwY6NgBH/Whats-App-Image-2026-08-11-at-8-26-22-AM.jpg";
    const slug = "givenchy-chunky-zip-ankle-boot-black";
    const slugFr = "bottine-givenchy-zip-plateforme-noir";

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

    const costNgn = 33000;
    const sellingNgn = 42000;
    const compareNgn = 50000;

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
          `products/givenchy-chunky-zip-ankle-boot-black-${Date.now()}.jpg`,
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

    const sizes = ["40", "41", "42", "43", "44", "45", "46"];
    const images = [imageUrl];

    const tagsEn = ["givenchy", "boots", "chunky", "zip-boot", "combat-boot", "designer", "luxury", "leather", "black", "abuja"];
    const tagsFr = ["givenchy", "bottes", "\u00e9paisses", "bottine-zip", "combat", "designer", "luxe", "cuir", "noir", "abuja"];

    const longDescEn = `<p>Command every room with the Givenchy Chunky Zip Ankle Boot in Black \u2013 a bold designer statement combining Parisian luxury heritage with rugged streetwear proportions. Featuring a signature front zip, GIVENCHY logo patch, and an aggressive chunky lug sole for commanding presence.</p>
<h3>Key Features</h3>
<ul>
  <li>Premium genuine leather upper with matte and polished panel contrast</li>
  <li>Signature front zip closure for edgy modern styling</li>
  <li>GIVENCHY logo patch on vamp strap</li>
  <li>Chunky rubber lug outsole for grip and streetwear presence</li>
  <li>Padded ankle collar for all-day comfort</li>
  <li>Reinforced heel and toe box for durability</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>Givenchy</td></tr>
  <tr><th>Model</th><td>Chunky Zip Ankle Boot</td></tr>
  <tr><th>Colour</th><td>Black</td></tr>
  <tr><th>Material</th><td>Genuine Leather + Rubber Lug Sole</td></tr>
  <tr><th>Cushioning/Sole</th><td>Chunky rubber lug platform</td></tr>
  <tr><th>Signature Detail</th><td>Front zip + Givenchy logo patch</td></tr>
  <tr><th>Closure</th><td>Front zip with side elastic</td></tr>
  <tr><th>Style</th><td>Luxury combat / streetwear boot</td></tr>
  <tr><th>Sizes</th><td>40 to 46 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>Givenchy branded box, dust bag</td></tr>
</table>
<h3>Styling</h3>
<p>Pair with slim tapered denim, cargo trousers, or tailored joggers for a designer streetwear finish. The chunky lug sole adds serious height and attitude, while the front zip offers a modern minimalist edge. Perfect for statement fits and edgy formal moments alike.</p>
<p><strong>Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>Imposez-vous dans toute pi\u00e8ce avec la Bottine Givenchy Zip Plateforme en Noir \u2013 une d\u00e9claration designer audacieuse alliant l\u2019h\u00e9ritage de luxe parisien aux proportions streetwear robustes. Avec sa fermeture \u00e9clair avant signature, son patch logo GIVENCHY et sa semelle crampons\u00e9e agressive pour une pr\u00e9sence imposante.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Tige en cuir v\u00e9ritable premium avec contraste panneaux mats et brillants</li>
  <li>Fermeture zip avant signature pour un style moderne audacieux</li>
  <li>Patch logo GIVENCHY sur la bride</li>
  <li>Semelle ext\u00e9rieure caoutchouc crampons\u00e9e pour adh\u00e9rence et pr\u00e9sence streetwear</li>
  <li>Col cheville rembourr\u00e9 pour un confort toute la journ\u00e9e</li>
  <li>Talon et bout renforc\u00e9s pour la durabilit\u00e9</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>Givenchy</td></tr>
  <tr><th>Mod\u00e8le</th><td>Bottine Zip Plateforme</td></tr>
  <tr><th>Couleur</th><td>Noir</td></tr>
  <tr><th>Mati\u00e8re</th><td>Cuir v\u00e9ritable + Semelle caoutchouc</td></tr>
  <tr><th>Amorti</th><td>Plateforme caoutchouc crampons\u00e9e</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Zip avant + patch logo Givenchy</td></tr>
  <tr><th>Fermeture</th><td>Zip avant avec \u00e9lastique lat\u00e9ral</td></tr>
  <tr><th>Style</th><td>Bottine combat / streetwear de luxe</td></tr>
  <tr><th>Tailles</th><td>40 \u00e0 46 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete Givenchy, sac \u00e0 poussi\u00e8re</td></tr>
</table>
<h3>Comment Porter</h3>
<p>\u00c0 associer avec un jean slim, un pantalon cargo ou un jogging sur mesure pour une finition streetwear designer. La semelle crampons\u00e9e \u00e9paisse ajoute hauteur et attitude, tandis que le zip avant offre une touche minimaliste moderne. Parfait pour les tenues audacieuses comme pour les moments formels audacieux.</p>
<p><strong>Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Givenchy Chunky Zip Ankle Boot - Black",
      nameFr: "Bottine Givenchy Zip Plateforme - Noir",
      slug,
      slugFr,
      description: "Givenchy Chunky Zip Ankle Boot in Black. Genuine leather, front zip, logo patch, chunky lug sole. Designer statement piece. Ships from Abuja.",
      descriptionFr: "Bottine Givenchy Zip Plateforme en Noir. Cuir v\u00e9ritable, zip avant, patch logo, semelle crampons\u00e9e. Pi\u00e8ce designer audacieuse. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "Givenchy zip ankle boot in black. Genuine leather, front zip, chunky lug sole. Ships from Abuja.",
      shortDescriptionFr: "Bottine Givenchy zip cheville noire. Cuir v\u00e9ritable, zip avant, semelle \u00e9paisse. Exp\u00e9di\u00e9 de Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: String(costNgn),
      supplierPrice: String(costNgn),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      brand: "Givenchy",
      category: "boots",
      sku: "NDZ-GVN-CZB-BK01",
      material: "Genuine Leather + Rubber Lug Sole",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 12,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: true,
      seoTitle: "Givenchy Chunky Zip Ankle Boot Black | New Deal Zone",
      seoTitleFr: "Bottine Givenchy Zip Plateforme Noir | New Deal Zone",
      metaDescription: "Givenchy Chunky Zip Ankle Boot in Black. Genuine leather, front zip closure, logo patch, chunky lug sole. Fast delivery from Abuja.",
      metaDescriptionFr: "Bottine Givenchy zip plateforme noire. Cuir v\u00e9ritable, zip avant, patch logo, semelle crampons\u00e9e. Livraison rapide depuis Abuja.",
      focusKeyphrase: "givenchy chunky zip boot",
      focusKeyphraseFr: "bottine givenchy zip plateforme",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Nnamdi Chukwu", rating: 5, daysAgo: 5, verified: true,
        commentEn: "These Givenchy boots are absolute heat! The front zip is unique and the chunky sole gives serious presence. Fast Abuja delivery, boxed nicely.",
        commentFr: "Ces bottines Givenchy sont incroyables! Le zip avant est unique et la semelle \u00e9paisse donne une vraie pr\u00e9sence. Livraison rapide Abuja, bien emball\u00e9es." },
      { name: "Rachel Owens", rating: 5, daysAgo: 21, verified: true,
        commentEn: "Wife bought these for me and they instantly became my favorites. Leather is thick, zip is smooth, logo patch is a nice touch. Comfortable too.",
        commentFr: "Ma femme me les a achet\u00e9es et elles sont devenues mes pr\u00e9f\u00e9r\u00e9es. Cuir \u00e9pais, zip fluide, patch logo tr\u00e8s beau. Confortables aussi." },
      { name: "Osei Mensah", rating: 5, daysAgo: 43, verified: true,
        commentEn: "Wore these to a night out and got constant compliments. Chunky sole adds serious inches. Front zip makes them super easy to put on.",
        commentFr: "Port\u00e9es pour une sortie et compliments constants. La semelle \u00e9paisse ajoute des centim\u00e8tres. Le zip avant les rend super faciles \u00e0 enfiler." },
      { name: "Aminata Sy", rating: 4, daysAgo: 63, verified: false,
        commentEn: "Really cool boots, love the design. Took a couple wears to break in fully. Once broken in, they\u2019re comfortable and look amazing.",
        commentFr: "Bottines vraiment cool, j\u2019adore le design. Il a fallu quelques ports pour bien les casser. Une fois cass\u00e9es, elles sont confortables et magnifiques." },
      { name: "Yusuf Adeyemi", rating: 5, daysAgo: 88, verified: true,
        commentEn: "Best designer boot purchase this year. The mix of matte and polished leather is beautiful, sole is aggressive but not tacky. Worth it.",
        commentFr: "Meilleur achat de bottine designer de l\u2019ann\u00e9e. Le m\u00e9lange cuir mat et brillant est magnifique, semelle agressive mais pas vulgaire. \u00c7a en vaut la peine." },
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