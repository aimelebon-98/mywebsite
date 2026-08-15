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
    const sourceUrl = "https://i.ibb.co/TDwjSL8z/Whats-App-Image-2026-08-13-at-12-35-29-PM.jpg";
    const slug = "nike-air-force-1-low-triple-white";
    const slugFr = "basket-nike-air-force-1-basse-blanc";

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

    const costNgn = 21000;
    const sellingNgn = 27000;
    const compareNgn = 35000;

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
          `products/nike-air-force-1-low-triple-white-${Date.now()}.jpg`,
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
      { name: "Triple White", image: imageUrl },
    ];

    const sizes = ["40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"];
    const images = [imageUrl];

    const tagsEn = ["nike", "air-force-1", "af1", "sneakers", "white", "leather", "classic", "lifestyle", "abuja"];
    const tagsFr = ["nike", "air-force-1", "af1", "baskets", "blanc", "cuir", "classique", "lifestyle", "abuja"];

    const longDescEn = `<p>The undefeated classic \u2013 Nike Air Force 1 Low in Triple White. Since 1982, the AF1 has been the gold standard of sneaker culture, worn by hip-hop legends, streetwear icons, and everyday sneakerheads alike. Clean, versatile, timeless.</p>
<h3>Key Features</h3>
<ul>
  <li>Full premium leather upper with perforated toe box</li>
  <li>Iconic Nike Swoosh on the side panels</li>
  <li>Air-Sole unit in heel for legendary cushioning</li>
  <li>Rubber cupsole with pivot points for durability</li>
  <li>Signature "AIR" script embossed on midsole</li>
  <li>Deubr\u00e9 metal tag on laces</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>Nike</td></tr>
  <tr><th>Model</th><td>Air Force 1 Low '07</td></tr>
  <tr><th>Colour</th><td>Triple White</td></tr>
  <tr><th>Material</th><td>Full Leather + Rubber Cupsole</td></tr>
  <tr><th>Cushioning/Sole</th><td>Nike Air unit in heel</td></tr>
  <tr><th>Signature Detail</th><td>Swoosh + AIR script + deubr\u00e9</td></tr>
  <tr><th>Closure</th><td>Flat lace-up</td></tr>
  <tr><th>Style</th><td>Iconic lifestyle</td></tr>
  <tr><th>Sizes</th><td>40 to 50 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>Nike box, spare laces, deubr\u00e9 tag</td></tr>
</table>
<h3>Styling</h3>
<p>The ultimate blank canvas \u2013 pairs with denim, joggers, cargos, dresses, suits\u2026 literally everything. The all-white finish is a wardrobe non-negotiable. Keep them fresh with a suede brush and sneaker cleaner for maximum longevity.</p>
<p><strong>Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>Le classique invaincu \u2013 Nike Air Force 1 Low en Blanc Int\u00e9gral. Depuis 1982, l\u2019AF1 est la r\u00e9f\u00e9rence absolue de la culture sneaker, port\u00e9e par les l\u00e9gendes du hip-hop, les ic\u00f4nes streetwear et les sneakerheads du quotidien. Propre, polyvalente, intemporelle.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Tige en cuir premium int\u00e9gral avec bo\u00eete \u00e0 orteils perfor\u00e9e</li>
  <li>Swoosh Nike iconique sur les c\u00f4t\u00e9s</li>
  <li>Unit\u00e9 Air-Sole dans le talon pour un amorti l\u00e9gendaire</li>
  <li>Semelle en caoutchouc cupsole avec points pivots pour la durabilit\u00e9</li>
  <li>Inscription "AIR" grav\u00e9e sur la semelle interm\u00e9diaire</li>
  <li>Tab m\u00e9tallique deubr\u00e9 sur les lacets</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>Nike</td></tr>
  <tr><th>Mod\u00e8le</th><td>Air Force 1 Low '07</td></tr>
  <tr><th>Couleur</th><td>Blanc Int\u00e9gral</td></tr>
  <tr><th>Mati\u00e8re</th><td>Cuir int\u00e9gral + Semelle caoutchouc</td></tr>
  <tr><th>Amorti</th><td>Unit\u00e9 Nike Air dans le talon</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Swoosh + inscription AIR + deubr\u00e9</td></tr>
  <tr><th>Fermeture</th><td>Lacets plats</td></tr>
  <tr><th>Style</th><td>Lifestyle iconique</td></tr>
  <tr><th>Tailles</th><td>40 \u00e0 50 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete Nike, lacets de rechange, tab deubr\u00e9</td></tr>
</table>
<h3>Comment Porter</h3>
<p>La toile vierge ultime \u2013 s\u2019associe avec jean, jogging, cargo, robes, costumes\u2026 vraiment tout. La finition blanche int\u00e9grale est un incontournable de la garde-robe. Gardez-les fra\u00eeches avec une brosse et un nettoyant sneaker pour une longue dur\u00e9e de vie.</p>
<p><strong>Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Nike Air Force 1 Low - Triple White",
      nameFr: "Basket Nike Air Force 1 Basse - Blanc Int\u00e9gral",
      slug,
      slugFr,
      description: "Nike Air Force 1 Low '07 in Triple White. Full leather upper, Nike Air cushioning, iconic AF1 silhouette. Ships from Abuja.",
      descriptionFr: "Nike Air Force 1 Basse '07 en Blanc Int\u00e9gral. Tige cuir int\u00e9gral, amorti Nike Air, silhouette AF1 iconique. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "Nike Air Force 1 Low Triple White. Full leather, Nike Air cushioning, timeless classic. Ships from Abuja.",
      shortDescriptionFr: "Nike Air Force 1 basse blanc int\u00e9gral. Cuir premium, amorti Nike Air, classique intemporel. Exp\u00e9di\u00e9 de Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: String(costNgn),
      supplierPrice: String(costNgn),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      brand: "Nike",
      category: "sneakers",
      sku: "NDZ-NKE-AF1-WH01",
      material: "Full Leather + Rubber Cupsole",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 30,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: true,
      seoTitle: "Nike Air Force 1 Low Triple White | New Deal Zone",
      seoTitleFr: "Nike Air Force 1 Basse Blanc | New Deal Zone",
      metaDescription: "Nike Air Force 1 Low Triple White. Full leather, Nike Air cushioning, iconic AF1 classic. Sizes 40-50. Fast delivery from Abuja.",
      metaDescriptionFr: "Nike Air Force 1 basse blanc int\u00e9gral. Cuir premium, amorti Air, classique AF1. Tailles 40-50. Livraison rapide depuis Abuja.",
      focusKeyphrase: "nike air force 1 white",
      focusKeyphraseFr: "nike air force 1 blanc",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Bola Adeyinka", rating: 5, daysAgo: 3, verified: true,
        commentEn: "You can never go wrong with AF1s! These are legit, leather is thick and quality is spot on. Delivered next day in Abuja.",
        commentFr: "On ne se trompe jamais avec des AF1! Elles sont authentiques, le cuir est \u00e9pais et la qualit\u00e9 est parfaite. Livr\u00e9 le lendemain \u00e0 Abuja." },
      { name: "Kofi Ansah", rating: 5, daysAgo: 18, verified: true,
        commentEn: "Cleanest sneakers I own. The all white is perfect and the leather doesn't crease easily. Definitely ordering another pair.",
        commentFr: "Les baskets les plus propres que j\u2019ai. Le blanc int\u00e9gral est parfait et le cuir ne se plisse pas facilement. Je commande une autre paire c\u2019est s\u00fbr." },
      { name: "Rachel Johnson", rating: 5, daysAgo: 35, verified: true,
        commentEn: "AF1s never fail! These fit true to size and are super comfortable straight out of the box. Perfect with jeans or leggings.",
        commentFr: "Les AF1 ne d\u00e9\u00e7oivent jamais! Elles taillent bien et sont super confortables d\u00e8s la sortie de la bo\u00eete. Parfait avec jean ou legging." },
      { name: "Ibrahim Ba", rating: 4, daysAgo: 58, verified: false,
        commentEn: "Really nice AF1s, comfy and clean. Only thing is I wish the box arrived in better shape but the shoes themselves are great.",
        commentFr: "Vraiment belles AF1, confortables et propres. Le seul truc c\u2019est que la bo\u00eete est arriv\u00e9e un peu ab\u00eem\u00e9e mais les chaussures sont super." },
      { name: "Halima Njeri", rating: 5, daysAgo: 84, verified: true,
        commentEn: "Been rocking AF1s since forever. This pair matches my collection perfectly. Sole is thick and Air unit gives great support.",
        commentFr: "Je porte des AF1 depuis toujours. Cette paire s\u2019accorde parfaitement \u00e0 ma collection. Semelle \u00e9paisse et l\u2019unit\u00e9 Air offre un super soutien." },
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