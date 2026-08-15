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
    const sourceUrl = "https://i.ibb.co/BVDgjW4d/Whats-App-Image-2026-08-11-at-8-26-20-AM-1.jpg";
    const slug = "bottega-veneta-chunky-hiker-derby-black";
    const slugFr = "derby-bottega-veneta-hiker-plateforme-noir";

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

    const costNgn = 37000;
    const sellingNgn = 45000;
    const compareNgn = 49000;

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
          `products/bottega-veneta-chunky-hiker-derby-black-${Date.now()}.jpg`,
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

    const sizes = ["44", "45"];
    const images = [imageUrl];

    const tagsEn = ["bottega-veneta", "derby", "hiker", "chunky", "formal", "leather", "designer", "luxury", "black", "abuja"];
    const tagsFr = ["bottega-veneta", "derby", "hiker", "\u00e9paisses", "formel", "cuir", "designer", "luxe", "noir", "abuja"];

    const longDescEn = `<p>Redefine luxury craftsmanship with the Bottega Veneta Chunky Hiker Derby in Black \u2013 an inventive fusion of alpine mountaineering hardware and refined Italian derby tailoring. Featuring signature silver metal hiker hooks, contrast climbing laces, and a commanding chunky lug sole, this pair blurs the line between formal and outdoor with distinct designer edge.</p>
<h3>Key Features</h3>
<ul>
  <li>Premium smooth glazed black leather upper</li>
  <li>Signature silver-tone metal hiker hooks and eyelets</li>
  <li>Contrast black and white speckled climbing-style laces</li>
  <li>Chunky rubber lug platform sole for grip and modern proportions</li>
  <li>Modern square-toe silhouette</li>
  <li>Padded collar for all-day comfort</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>Bottega Veneta</td></tr>
  <tr><th>Model</th><td>Chunky Hiker Derby</td></tr>
  <tr><th>Colour</th><td>Black</td></tr>
  <tr><th>Material</th><td>Glazed Leather + Rubber Lug Sole</td></tr>
  <tr><th>Cushioning/Sole</th><td>Chunky rubber lug platform</td></tr>
  <tr><th>Signature Detail</th><td>Silver hiker hooks + climbing laces</td></tr>
  <tr><th>Closure</th><td>Speckled climbing lace-up</td></tr>
  <tr><th>Style</th><td>Luxury designer hiker-derby hybrid</td></tr>
  <tr><th>Sizes</th><td>44, 45 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>Bottega Veneta branded box, dust bag</td></tr>
</table>
<h3>Styling</h3>
<p>Pair with slim tapered trousers, wide-leg wool pants, or cropped denim to spotlight the chunky lug sole. The mountaineering-inspired hooks and speckled laces add unexpected texture to formal fits, making these versatile for creative business settings, weekend cocktails, or bold streetwear moments.</p>
<p><strong>Limited sizes available. Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>Red\u00e9finissez le savoir-faire de luxe avec le Derby Bottega Veneta Hiker Plateforme en Noir \u2013 une fusion inventive entre le mat\u00e9riel d\u2019alpinisme et le tailoring derby italien raffin\u00e9. Avec ses crochets hiker en m\u00e9tal argent\u00e9 signature, ses lacets d\u2019escalade contrast\u00e9s et sa semelle crampons\u00e9e imposante, cette paire brouille la ligne entre formel et outdoor avec un style designer distinct.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Tige en cuir gla\u00e7\u00e9 noir premium lisse</li>
  <li>Crochets hiker et \u0153illets en m\u00e9tal argent\u00e9 signature</li>
  <li>Lacets style escalade mouchet\u00e9s noir et blanc contrast\u00e9s</li>
  <li>Semelle plateforme \u00e9paisse en caoutchouc crampons\u00e9 pour adh\u00e9rence et proportions modernes</li>
  <li>Silhouette moderne bout carr\u00e9</li>
  <li>Col rembourr\u00e9 pour un confort toute la journ\u00e9e</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>Bottega Veneta</td></tr>
  <tr><th>Mod\u00e8le</th><td>Derby Hiker Plateforme</td></tr>
  <tr><th>Couleur</th><td>Noir</td></tr>
  <tr><th>Mati\u00e8re</th><td>Cuir gla\u00e7\u00e9 + Semelle caoutchouc crampons\u00e9e</td></tr>
  <tr><th>Amorti</th><td>Plateforme \u00e9paisse crampons\u00e9e</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Crochets hiker argent + lacets d\u2019escalade</td></tr>
  <tr><th>Fermeture</th><td>Lacets escalade mouchet\u00e9s</td></tr>
  <tr><th>Style</th><td>Derby-hiker designer de luxe</td></tr>
  <tr><th>Tailles</th><td>44, 45 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete Bottega Veneta, sac \u00e0 poussi\u00e8re</td></tr>
</table>
<h3>Comment Porter</h3>
<p>\u00c0 associer avec un pantalon fusel\u00e9, un pantalon large en laine ou un jean court pour mettre en valeur la semelle \u00e9paisse. Les crochets d\u2019alpinisme et lacets mouchet\u00e9s ajoutent une texture inattendue aux tenues formelles, les rendant polyvalents pour les milieux business cr\u00e9atifs, les cocktails de weekend ou les moments streetwear audacieux.</p>
<p><strong>Tailles limit\u00e9es disponibles. Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Bottega Veneta Chunky Hiker Derby - Black",
      nameFr: "Derby Bottega Veneta Hiker Plateforme - Noir",
      slug,
      slugFr,
      description: "Bottega Veneta Chunky Hiker Derby in Black. Glazed leather, silver hiker hooks, speckled climbing laces, chunky lug sole. Ships from Abuja.",
      descriptionFr: "Derby Bottega Veneta Hiker Plateforme en Noir. Cuir gla\u00e7\u00e9, crochets hiker argent\u00e9s, lacets escalade mouchet\u00e9s, semelle crampons\u00e9e. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "Bottega Veneta hiker derby in black. Glazed leather, silver hooks, chunky lug sole. Ships from Abuja.",
      shortDescriptionFr: "Derby Bottega Veneta hiker noir. Cuir gla\u00e7\u00e9, crochets argent\u00e9s, semelle \u00e9paisse. Exp\u00e9di\u00e9 de Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: String(costNgn),
      supplierPrice: String(costNgn),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      brand: "Bottega Veneta",
      category: "formal",
      sku: "NDZ-BV-HKR-BK01",
      material: "Glazed Leather + Rubber Lug Sole",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 8,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: true,
      seoTitle: "Bottega Veneta Chunky Hiker Derby Black | New Deal Zone",
      seoTitleFr: "Derby Bottega Veneta Hiker Plateforme Noir | New Deal Zone",
      metaDescription: "Bottega Veneta Chunky Hiker Derby in Black. Glazed leather, silver metal hooks, speckled laces, chunky lug sole. Fast delivery from Abuja.",
      metaDescriptionFr: "Derby Bottega Veneta Hiker plateforme noir. Cuir gla\u00e7\u00e9, crochets argent, lacets mouchet\u00e9s, semelle \u00e9paisse. Livraison rapide depuis Abuja.",
      focusKeyphrase: "bottega veneta hiker derby",
      focusKeyphraseFr: "derby bottega veneta hiker",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Tunde Adeboye", rating: 5, daysAgo: 5, verified: true,
        commentEn: "These Bottega hiker derbys are next level! The silver hooks are so unique and the chunky sole is heavy premium quality. Turn heads guaranteed.",
        commentFr: "Ces derbys Bottega hiker sont incroyables! Les crochets argent\u00e9s sont uniques et la semelle \u00e9paisse est premium. Regards garantis." },
      { name: "Claire Lefebvre", rating: 5, daysAgo: 22, verified: true,
        commentEn: "Bought as birthday gift for my brother, he\u2019s obsessed. Leather is glazed and smooth, laces are unique, chunky sole is comfortable to walk in.",
        commentFr: "Achet\u00e9s en cadeau d\u2019anniversaire pour mon fr\u00e8re, il en est fou. Cuir gla\u00e7\u00e9 lisse, lacets uniques, semelle \u00e9paisse confortable \u00e0 porter." },
      { name: "Kwabena Owusu", rating: 5, daysAgo: 45, verified: true,
        commentEn: "Perfect blend of formal and streetwear. Wore these to a creative agency meeting and everyone noticed. Bottega quality shows.",
        commentFr: "Parfait m\u00e9lange formel et streetwear. Port\u00e9s pour un meeting en agence cr\u00e9ative et tout le monde les a remarqu\u00e9s. La qualit\u00e9 Bottega se voit." },
      { name: "Aissatou Sy", rating: 4, daysAgo: 66, verified: false,
        commentEn: "Really beautiful shoes, love the hiker hook detail. Sizing was accurate but they need a couple wears to break in fully. Great designer piece.",
        commentFr: "Vraiment belles chaussures, j\u2019adore le d\u00e9tail des crochets hiker. Taille exacte mais il faut quelques ports pour les casser. Superbe pi\u00e8ce designer." },
      { name: "Michael Roberts", rating: 5, daysAgo: 89, verified: true,
        commentEn: "Absolutely obsessed with these. The mix of formal derby with hiker hardware is genius. Chunky sole gives serious streetwear energy. Worth it.",
        commentFr: "Absolument fan. Le m\u00e9lange derby formel et mat\u00e9riel hiker est g\u00e9nial. La semelle \u00e9paisse donne une vraie \u00e9nergie streetwear. \u00c7a vaut le coup." },
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