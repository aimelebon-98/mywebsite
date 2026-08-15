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
    const sourceUrl = "https://i.ibb.co/GQ7t5nWs/Whats-App-Image-2026-08-11-at-8-26-23-AM.jpg";
    const slug = "fendi-ff-chunky-platform-loafer-black";
    const slugFr = "mocassin-fendi-ff-plateforme-noir";

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

    const costNgn = 36000;
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
          `products/fendi-ff-chunky-platform-loafer-black-${Date.now()}.jpg`,
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
      { name: "Black Patent", image: imageUrl },
    ];

    const sizes = ["44", "45", "46"];
    const images = [imageUrl];

    const tagsEn = ["fendi", "ff-logo", "loafer", "platform", "formal", "patent-leather", "chunky", "luxury", "designer", "abuja"];
    const tagsFr = ["fendi", "ff-logo", "mocassin", "plateforme", "formel", "cuir-verni", "\u00e9paisses", "luxe", "designer", "abuja"];

    const longDescEn = `<p>Step up in serious luxury with the Fendi FF Chunky Platform Loafer in Black Patent \u2013 an unmistakable Italian designer piece that fuses classic loafer sophistication with bold streetwear proportions. Signature FF hardware and an FF-embossed lug sole make every step a statement.</p>
<h3>Key Features</h3>
<ul>
  <li>High-shine black patent leather upper</li>
  <li>Silver-tone Fendi FF metal buckle on vamp strap</li>
  <li>Chunky rubber platform sole with embossed FF logo tread</li>
  <li>Classic loafer slip-on construction</li>
  <li>Padded leather insole for luxurious wear</li>
  <li>Reinforced heel counter for lasting shape</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>Fendi</td></tr>
  <tr><th>Model</th><td>FF Chunky Platform Loafer</td></tr>
  <tr><th>Colour</th><td>Black Patent</td></tr>
  <tr><th>Material</th><td>Patent Leather + Rubber FF Lug Sole</td></tr>
  <tr><th>Cushioning/Sole</th><td>Chunky rubber platform with FF tread</td></tr>
  <tr><th>Signature Detail</th><td>Silver FF buckle + embossed sole</td></tr>
  <tr><th>Closure</th><td>Slip-on loafer</td></tr>
  <tr><th>Style</th><td>Luxury designer platform loafer</td></tr>
  <tr><th>Sizes</th><td>44, 45, 46 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>Fendi branded box, dust bag</td></tr>
</table>
<h3>Styling</h3>
<p>Pair with tailored trousers, cropped chinos, or wide-leg denim to showcase the chunky sole. The high-gloss patent finish elevates evening looks, while the FF hardware ensures designer recognition. Versatile enough for office wear or nightlife.</p>
<p><strong>Limited sizes available. Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>Passez au luxe s\u00e9rieux avec le Mocassin Fendi FF Plateforme en Verni Noir \u2013 une pi\u00e8ce designer italienne incontournable qui fusionne la sophistication classique du mocassin avec des proportions streetwear audacieuses. Les ferrures FF signature et la semelle crampons\u00e9e estampill\u00e9e FF font de chaque pas une d\u00e9claration.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Tige en cuir verni noir haute brillance</li>
  <li>Boucle m\u00e9tallique Fendi FF argent\u00e9e sur la bride</li>
  <li>Semelle plateforme \u00e9paisse en caoutchouc avec crampons FF estampill\u00e9s</li>
  <li>Construction mocassin classique \u00e0 enfiler</li>
  <li>Semelle int\u00e9rieure en cuir rembourr\u00e9e pour un port luxueux</li>
  <li>Contrefort renforc\u00e9 pour une tenue durable</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>Fendi</td></tr>
  <tr><th>Mod\u00e8le</th><td>Mocassin FF Plateforme</td></tr>
  <tr><th>Couleur</th><td>Verni Noir</td></tr>
  <tr><th>Mati\u00e8re</th><td>Cuir verni + Semelle caoutchouc FF</td></tr>
  <tr><th>Amorti</th><td>Plateforme caoutchouc avec crampons FF</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Boucle FF argent\u00e9e + semelle estampill\u00e9e</td></tr>
  <tr><th>Fermeture</th><td>Mocassin \u00e0 enfiler</td></tr>
  <tr><th>Style</th><td>Mocassin designer de luxe plateforme</td></tr>
  <tr><th>Tailles</th><td>44, 45, 46 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete Fendi, sac \u00e0 poussi\u00e8re</td></tr>
</table>
<h3>Comment Porter</h3>
<p>\u00c0 associer avec un pantalon sur mesure, un chino court ou un jean large pour mettre en valeur la semelle \u00e9paisse. La finition verni haute brillance rehausse les looks du soir, tandis que les ferrures FF assurent la reconnaissance designer. Assez polyvalent pour le bureau ou la nuit.</p>
<p><strong>Tailles limit\u00e9es disponibles. Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Fendi FF Chunky Platform Loafer - Black Patent",
      nameFr: "Mocassin Fendi FF Plateforme - Verni Noir",
      slug,
      slugFr,
      description: "Fendi FF Chunky Platform Loafer in Black Patent. Silver FF buckle, chunky rubber sole with FF-embossed tread. Ships from Abuja.",
      descriptionFr: "Mocassin Fendi FF Plateforme en Verni Noir. Boucle FF argent\u00e9e, semelle \u00e9paisse en caoutchouc \u00e0 crampons FF. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "Fendi FF chunky platform loafer in black patent. Silver FF buckle, FF-embossed sole. Ships from Abuja.",
      shortDescriptionFr: "Mocassin Fendi FF plateforme verni noir. Boucle FF argent\u00e9e, semelle FF. Exp\u00e9di\u00e9 de Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: String(costNgn),
      supplierPrice: String(costNgn),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      brand: "Fendi",
      category: "formal",
      sku: "NDZ-FEN-DOM-BK01",
      material: "Patent Leather + Rubber FF Lug Sole",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 10,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: true,
      seoTitle: "Fendi FF Chunky Platform Loafer Black | New Deal Zone",
      seoTitleFr: "Mocassin Fendi FF Plateforme Verni Noir | New Deal Zone",
      metaDescription: "Fendi FF Chunky Platform Loafer in Black Patent. Silver FF buckle, embossed FF sole, chunky platform. Fast delivery from Abuja.",
      metaDescriptionFr: "Mocassin Fendi FF Plateforme verni noir. Boucle FF argent\u00e9e, semelle estampill\u00e9e FF, plateforme \u00e9paisse. Livraison rapide depuis Abuja.",
      focusKeyphrase: "fendi ff platform loafer",
      focusKeyphraseFr: "mocassin fendi ff plateforme",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Emeka Ibekwe", rating: 5, daysAgo: 4, verified: true,
        commentEn: "These Fendi loafers are heat! The silver FF buckle catches attention and the chunky sole gives me such presence. Delivered fast in Abuja.",
        commentFr: "Ces mocassins Fendi sont incroyables! La boucle FF argent\u00e9e attire l\u2019attention et la semelle \u00e9paisse me donne une vraie pr\u00e9sence. Livr\u00e9 rapidement \u00e0 Abuja." },
      { name: "Priscilla Owusu", rating: 5, daysAgo: 20, verified: true,
        commentEn: "Bought as a gift for my brother and he\u2019s in love. Patent leather is glossy, the FF sole imprint is such a nice detail. Quality is legit.",
        commentFr: "Achet\u00e9s en cadeau pour mon fr\u00e8re et il les adore. Cuir verni brillant, l\u2019impression FF sur la semelle est un beau d\u00e9tail. Qualit\u00e9 authentique." },
      { name: "David Chen", rating: 5, daysAgo: 42, verified: true,
        commentEn: "Wore these to a business dinner and they were the talk of the table. Perfect balance of formal and edgy. Comfortable to walk in too.",
        commentFr: "Port\u00e9s pour un d\u00eener d\u2019affaires et tout le monde en parlait. Parfait \u00e9quilibre entre formel et audacieux. Confortable \u00e0 porter." },
      { name: "Aissatou Diagne", rating: 4, daysAgo: 63, verified: false,
        commentEn: "Really beautiful loafers, love the chunky sole. Sizing was fine at 45. Only wish the box arrived in better condition but the shoes are perfect.",
        commentFr: "Vraiment beaux mocassins, j\u2019adore la semelle \u00e9paisse. Taille bonne en 45. Le seul regret c\u2019est que la bo\u00eete est arriv\u00e9e un peu ab\u00eem\u00e9e mais les chaussures sont parfaites." },
      { name: "Tunde Ogundipe", rating: 5, daysAgo: 87, verified: true,
        commentEn: "Fendi platform loafers with the FF hardware = instant flex. Patent is deep glossy black, sole is heavy and premium feeling. Worth it.",
        commentFr: "Mocassin Fendi plateforme avec ferrures FF = flex instantan\u00e9. Le verni est d\u2019un noir profond brillant, la semelle est lourde et premium. \u00c7a en vaut la peine." },
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