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
    const sourceUrl = "https://i.ibb.co/Xr7WnPCg/Whats-App-Image-2026-08-11-at-8-26-23-AM-1.jpg";
    const slug = "bold-buckle-zip-chelsea-boot-brown";
    const slugFr = "bottine-bold-chelsea-zip-boucle-marron";

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

    const costNgn = 35000;
    const sellingNgn = 40000;
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
          `products/bold-buckle-zip-chelsea-boot-brown-${Date.now()}.jpg`,
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
      { name: "Dark Brown", image: imageUrl },
    ];

    const sizes = ["40", "42"];
    const images = [imageUrl];

    const tagsEn = ["bold", "chelsea-boot", "zip", "buckle", "boots", "formal", "leather", "brown", "abuja"];
    const tagsFr = ["bold", "chelsea", "bottine", "zip", "boucle", "bottes", "formel", "cuir", "marron", "abuja"];

    const longDescEn = `<p>Step into refined confidence with the BOLD Buckle Zip Chelsea Boot in Dark Brown. Handcrafted from genuine leather, this ankle boot fuses classic British Chelsea silhouette with modern hardware details \u2013 the perfect balance of formal polish and everyday attitude.</p>
<h3>Key Features</h3>
<ul>
  <li>Genuine leather upper with rich dark brown finish</li>
  <li>Signature metal buckle strap on lateral side</li>
  <li>Convenient inner side zipper for easy entry</li>
  <li>Rear pull loop for effortless slip-on</li>
  <li>Low block heel with clean stacked profile</li>
  <li>Durable rubber outsole for grip and longevity</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>BOLD</td></tr>
  <tr><th>Model</th><td>Buckle Zip Chelsea Boot</td></tr>
  <tr><th>Colour</th><td>Dark Brown</td></tr>
  <tr><th>Material</th><td>Genuine Leather + Rubber Sole</td></tr>
  <tr><th>Cushioning/Sole</th><td>Low stacked block heel</td></tr>
  <tr><th>Signature Detail</th><td>Metal buckle + inner side zip</td></tr>
  <tr><th>Closure</th><td>Side zip with buckle strap</td></tr>
  <tr><th>Style</th><td>Formal Chelsea ankle boot</td></tr>
  <tr><th>Sizes</th><td>40, 42 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>BOLD branded box</td></tr>
</table>
<h3>Styling</h3>
<p>Pair with tailored trousers, dark denim, or chinos for a smart-casual look that works from office to evening. The rich brown leather complements navy, charcoal, cream, and olive palettes beautifully. A wardrobe classic that only gets better with age.</p>
<p><strong>Limited sizes available. Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>Adoptez une confiance raffin\u00e9e avec la Bottine BOLD Chelsea Zip \u00e0 Boucle en Marron Fonc\u00e9. Fabriqu\u00e9e artisanalement en cuir v\u00e9ritable, cette bottine cheville fusionne la silhouette Chelsea britannique classique avec des d\u00e9tails de ferrures modernes \u2013 l\u2019\u00e9quilibre parfait entre \u00e9l\u00e9gance formelle et attitude quotidienne.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Tige en cuir v\u00e9ritable avec finition marron fonc\u00e9 riche</li>
  <li>Sangle \u00e0 boucle m\u00e9tallique signature sur le c\u00f4t\u00e9</li>
  <li>Zip int\u00e9rieur pratique pour un enfilage facile</li>
  <li>Languette arri\u00e8re pour un enfilage sans effort</li>
  <li>Talon bas empil\u00e9 au profil \u00e9pur\u00e9</li>
  <li>Semelle ext\u00e9rieure en caoutchouc durable pour adh\u00e9rence et longue vie</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>BOLD</td></tr>
  <tr><th>Mod\u00e8le</th><td>Chelsea Zip Boucle</td></tr>
  <tr><th>Couleur</th><td>Marron Fonc\u00e9</td></tr>
  <tr><th>Mati\u00e8re</th><td>Cuir v\u00e9ritable + Semelle caoutchouc</td></tr>
  <tr><th>Amorti</th><td>Talon bas empil\u00e9</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Boucle m\u00e9tal + zip lat\u00e9ral</td></tr>
  <tr><th>Fermeture</th><td>Zip lat\u00e9ral avec sangle boucle</td></tr>
  <tr><th>Style</th><td>Bottine Chelsea formelle</td></tr>
  <tr><th>Tailles</th><td>40, 42 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete BOLD</td></tr>
</table>
<h3>Comment Porter</h3>
<p>\u00c0 associer avec un pantalon sur mesure, un jean fonc\u00e9 ou un chino pour un look smart-casual qui fonctionne du bureau au soir. Le cuir marron riche s\u2019accorde magnifiquement avec les palettes marine, anthracite, cr\u00e8me et olive. Un classique de garde-robe qui s\u2019embellit avec le temps.</p>
<p><strong>Tailles limit\u00e9es disponibles. Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "BOLD Buckle Zip Chelsea Boot - Dark Brown",
      nameFr: "Bottine BOLD Chelsea Zip Boucle - Marron Fonc\u00e9",
      slug,
      slugFr,
      description: "BOLD Chelsea ankle boot in Dark Brown genuine leather. Metal buckle detail, side zip, low block heel. Ships from Abuja.",
      descriptionFr: "Bottine Chelsea BOLD en cuir v\u00e9ritable marron fonc\u00e9. D\u00e9tail boucle m\u00e9tal, zip lat\u00e9ral, talon bas. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "BOLD Chelsea zip boot in dark brown genuine leather. Buckle detail, side zip. Ships from Abuja.",
      shortDescriptionFr: "Bottine BOLD Chelsea zip marron fonc\u00e9 en cuir. Boucle, zip lat\u00e9ral. Exp\u00e9di\u00e9 de Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: String(costNgn),
      supplierPrice: String(costNgn),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      brand: "BOLD",
      category: "boots",
      sku: "NDZ-BLD-CHZ-BR01",
      material: "Genuine Leather + Rubber Sole",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 10,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: false,
      seoTitle: "BOLD Buckle Zip Chelsea Boot Brown | New Deal Zone",
      seoTitleFr: "Bottine BOLD Chelsea Zip Marron | New Deal Zone",
      metaDescription: "BOLD Chelsea ankle boot in dark brown genuine leather. Metal buckle, side zip, low block heel. Fast delivery from Abuja.",
      metaDescriptionFr: "Bottine BOLD Chelsea en cuir marron fonc\u00e9. Boucle m\u00e9tal, zip lat\u00e9ral, talon bas. Livraison rapide depuis Abuja.",
      focusKeyphrase: "brown chelsea boot",
      focusKeyphraseFr: "bottine chelsea marron",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Adebayo Ogundipe", rating: 5, daysAgo: 5, verified: true,
        commentEn: "These BOLD boots are exactly what I needed for the office. Leather is genuine and thick, the buckle detail is subtle but classy. Fast Abuja delivery.",
        commentFr: "Ces bottines BOLD sont exactement ce qu\u2019il me fallait pour le bureau. Cuir v\u00e9ritable et \u00e9pais, le d\u00e9tail boucle est subtil mais classe. Livraison rapide \u00e0 Abuja." },
      { name: "Grace Ansah", rating: 5, daysAgo: 22, verified: true,
        commentEn: "Bought as a gift for my husband\u2019s 45th birthday. He loves them! Quality leather and the side zip makes them super easy to slip on.",
        commentFr: "Achet\u00e9es pour les 45 ans de mon mari. Il les adore! Cuir de qualit\u00e9 et le zip lat\u00e9ral les rend super faciles \u00e0 enfiler." },
      { name: "Amadou Diallo", rating: 5, daysAgo: 44, verified: true,
        commentEn: "Perfect Chelsea boots for the price. The brown color is rich and deep, exactly as pictured. Been wearing them daily for weeks, no wear issues.",
        commentFr: "Bottines Chelsea parfaites pour le prix. La couleur marron est riche et profonde, exactement comme sur la photo. Port\u00e9es tous les jours pendant des semaines, aucun probl\u00e8me d\u2019usure." },
      { name: "Julie Girard", rating: 4, daysAgo: 66, verified: false,
        commentEn: "Really nice looking boots, love the buckle. Took a couple days to fully break in but comfortable now. Great with jeans and chinos.",
        commentFr: "Vraiment belles bottines, j\u2019adore la boucle. Il a fallu quelques jours pour bien les casser mais confortables maintenant. Super avec jean et chino." },
      { name: "Kofi Boateng", rating: 5, daysAgo: 90, verified: true,
        commentEn: "Solid Chelsea boot for the price. Zipper works smoothly, buckle is real metal, and the rubber sole gives good grip. Highly recommend.",
        commentFr: "Bottine Chelsea solide pour le prix. Le zip fonctionne bien, la boucle est en vrai m\u00e9tal, et la semelle caoutchouc offre une bonne adh\u00e9rence. Je recommande." },
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