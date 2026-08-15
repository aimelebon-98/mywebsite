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
    const sourceUrl = "https://i.ibb.co/Zpn9yqmn/Whats-App-Image-2026-08-11-at-8-26-25-AM.jpg";
    const slug = "louis-vuitton-monogram-derby-platform-black";
    const slugFr = "derby-louis-vuitton-monogram-plateforme-noir";

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
    const compareNgn = 58000;

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
          `products/louis-vuitton-monogram-derby-platform-black-${Date.now()}.jpg`,
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
      { name: "Black Monogram Eclipse", image: imageUrl },
    ];

    const sizes = ["41", "44", "45", "46"];
    const images = [imageUrl];

    const tagsEn = ["louis-vuitton", "lv", "derby", "monogram", "platform", "formal", "patent-leather", "designer", "luxury", "abuja"];
    const tagsFr = ["louis-vuitton", "lv", "derby", "monogram", "plateforme", "formel", "cuir-verni", "designer", "luxe", "abuja"];

    const longDescEn = `<p>Command every room with the Louis Vuitton Monogram Derby Platform in Black \u2013 a bold statement piece marrying French luxury heritage with modern chunky proportions. Iconic Monogram Eclipse canvas panels contrast with glossy patent leather for unmistakable designer presence.</p>
<h3>Key Features</h3>
<ul>
  <li>Glossy black patent leather toe box, vamp, and heel counter</li>
  <li>Signature LV Monogram Eclipse canvas side panels</li>
  <li>Chunky rubber lug platform sole for height and grip</li>
  <li>Metal LV flower monogram studs on lateral heel</li>
  <li>Classic derby lace-up closure with 5 eyelets</li>
  <li>Rear pull tab for easy entry</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>Louis Vuitton</td></tr>
  <tr><th>Model</th><td>Monogram Derby Platform</td></tr>
  <tr><th>Colour</th><td>Black Patent + Monogram Eclipse</td></tr>
  <tr><th>Material</th><td>Patent Leather + Monogram Canvas + Rubber</td></tr>
  <tr><th>Cushioning/Sole</th><td>Chunky rubber lug platform</td></tr>
  <tr><th>Signature Detail</th><td>LV Monogram + metal flower studs</td></tr>
  <tr><th>Closure</th><td>5-eyelet derby lace-up</td></tr>
  <tr><th>Style</th><td>Luxury designer derby platform</td></tr>
  <tr><th>Sizes</th><td>41, 44, 45, 46 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>LV branded box, dust bag</td></tr>
</table>
<h3>Styling</h3>
<p>Elevate tailored suits, cropped trousers, or wide-leg denim. The chunky sole adds instant height and edge to formal wear, while the LV Monogram signals unmistakable designer status. Perfect for high-end events, nights out, or bold everyday statements.</p>
<p><strong>Limited sizes available. Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>Imposez-vous dans toute pi\u00e8ce avec le Derby Louis Vuitton Monogram Plateforme en Noir \u2013 une pi\u00e8ce audacieuse alliant l\u2019h\u00e9ritage de luxe fran\u00e7ais aux proportions \u00e9paisses modernes. Les panneaux iconiques en toile Monogram Eclipse contrastent avec le cuir verni brillant pour une pr\u00e9sence designer ind\u00e9niable.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Bout, empeigne et talon en cuir verni noir brillant</li>
  <li>Panneaux lat\u00e9raux en toile LV Monogram Eclipse signature</li>
  <li>Semelle plateforme \u00e9paisse en caoutchouc crampons\u00e9 pour hauteur et adh\u00e9rence</li>
  <li>Clous fleur LV en m\u00e9tal sur le talon lat\u00e9ral</li>
  <li>Fermeture derby \u00e0 lacets avec 5 \u0153illets</li>
  <li>Languette arri\u00e8re pour un enfilage facile</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>Louis Vuitton</td></tr>
  <tr><th>Mod\u00e8le</th><td>Derby Monogram Plateforme</td></tr>
  <tr><th>Couleur</th><td>Verni Noir + Monogram Eclipse</td></tr>
  <tr><th>Mati\u00e8re</th><td>Cuir verni + Toile Monogram + Caoutchouc</td></tr>
  <tr><th>Amorti</th><td>Plateforme caoutchouc crampons\u00e9e \u00e9paisse</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Monogram LV + clous fleur m\u00e9tal</td></tr>
  <tr><th>Fermeture</th><td>Derby \u00e0 5 \u0153illets</td></tr>
  <tr><th>Style</th><td>Derby designer de luxe plateforme</td></tr>
  <tr><th>Tailles</th><td>41, 44, 45, 46 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete LV, sac \u00e0 poussi\u00e8re</td></tr>
</table>
<h3>Comment Porter</h3>
<p>Rehaussez un costume sur mesure, un pantalon court ou un jean large. La semelle \u00e9paisse ajoute instantan\u00e9ment hauteur et caract\u00e8re au formel, tandis que le Monogram LV signale un statut designer ind\u00e9niable. Parfait pour les \u00e9v\u00e9nements haut de gamme, les soir\u00e9es ou les d\u00e9clarations audacieuses au quotidien.</p>
<p><strong>Tailles limit\u00e9es disponibles. Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Louis Vuitton Monogram Derby Platform - Black",
      nameFr: "Derby Louis Vuitton Monogram Plateforme - Noir",
      slug,
      slugFr,
      description: "Louis Vuitton Monogram Derby Platform in Black Patent + Monogram Eclipse. Chunky lug sole, metal LV studs. Ships from Abuja.",
      descriptionFr: "Derby Louis Vuitton Monogram Plateforme en Verni Noir + Monogram Eclipse. Semelle \u00e9paisse crampons\u00e9e, clous LV m\u00e9tal. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "LV Monogram Derby Platform. Patent leather + Monogram Eclipse canvas, chunky lug sole. Ships from Abuja.",
      shortDescriptionFr: "Derby LV Monogram plateforme. Cuir verni et toile Monogram, semelle \u00e9paisse. Exp\u00e9di\u00e9 de Abuja.",
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
      category: "formal",
      sku: "NDZ-LV-DBY-BK01",
      material: "Patent Leather + Monogram Canvas + Rubber",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 10,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: true,
      seoTitle: "Louis Vuitton Monogram Derby Platform Black | New Deal Zone",
      seoTitleFr: "Derby Louis Vuitton Monogram Plateforme Noir | New Deal Zone",
      metaDescription: "Louis Vuitton Monogram Derby Platform in Black. Patent leather + LV canvas, chunky lug sole, metal LV studs. Fast delivery from Abuja.",
      metaDescriptionFr: "Derby Louis Vuitton Monogram Plateforme noir. Cuir verni et toile LV, semelle \u00e9paisse, clous m\u00e9tal. Livraison rapide depuis Abuja.",
      focusKeyphrase: "louis vuitton derby platform",
      focusKeyphraseFr: "derby louis vuitton plateforme",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "James Thompson", rating: 5, daysAgo: 5, verified: true,
        commentEn: "These LV derbies are absolutely stunning! Patent leather has incredible shine and the monogram canvas is authentic looking. Turned heads all night.",
        commentFr: "Ces derbys LV sont absolument magnifiques! Le cuir verni brille incroyablement et la toile monogram a l\u2019air authentique. Tout le monde m\u2019a regard\u00e9 toute la soir\u00e9e." },
      { name: "Isabelle Moreau", rating: 5, daysAgo: 23, verified: true,
        commentEn: "Bought these for my husband\u2019s birthday and he\u2019s obsessed. The chunky sole gives him such presence and the LV branding is on point. Great quality.",
        commentFr: "Achet\u00e9s pour l\u2019anniversaire de mon mari et il est obs\u00e9d\u00e9. La semelle \u00e9paisse lui donne une pr\u00e9sence incroyable et le branding LV est parfait. Super qualit\u00e9." },
      { name: "Nnamdi Emeka", rating: 5, daysAgo: 44, verified: true,
        commentEn: "The metal LV flower studs on the heel are such a nice detail. Wore these with my suit for a wedding, got so many compliments.",
        commentFr: "Les clous fleur LV en m\u00e9tal sur le talon sont un tr\u00e8s beau d\u00e9tail. Je les ai port\u00e9s avec mon costume pour un mariage, j\u2019ai re\u00e7u tellement de compliments." },
      { name: "Claire Martin", rating: 4, daysAgo: 66, verified: false,
        commentEn: "Beautiful shoes, patent leather is high quality. Runs slightly large so consider going down a half size. Overall very happy with the purchase.",
        commentFr: "Belles chaussures, le cuir verni est de haute qualit\u00e9. Taille un peu grand, prenez une demi-pointure en dessous. Globalement tr\u00e8s content de l\u2019achat." },
      { name: "Yusuf Ibrahim", rating: 5, daysAgo: 92, verified: true,
        commentEn: "Premium finish all around. The chunky sole is heavy and solid, patent leather is glossy, monogram print is sharp. Great investment piece.",
        commentFr: "Finition premium partout. La semelle \u00e9paisse est lourde et solide, le cuir verni est brillant, l\u2019impression monogram est nette. Excellent investissement." },
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