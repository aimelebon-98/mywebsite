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
    let XOF = 568, NGN = 1364;
    try {
      const r = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
      const d = await r.json();
      if (d.rates) { XOF = d.rates.XOF || XOF; NGN = d.rates.NGN || NGN; }
    } catch {}

    const costFcfa = 9000, sellingFcfa = 15000, compareFcfa = 18000;
    const costUsd    = Math.round((costFcfa / XOF) * 100) / 100;
    const sellingUsd = Math.round((sellingFcfa / XOF) * 100) / 100;
    const compareUsd = Math.round((compareFcfa / XOF) * 100) / 100;
    const costNgn    = Math.round(costUsd * NGN);

    const slugEn = "nike-dunk-low-camo-grey-black";
    const slugFr = "basket-nike-dunk-low-camo-gris-noir";

    const existing = await db.select().from(products)
      .where(or(eq(products.slug, slugEn), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
      await db.delete(products).where(eq(products.id, p.id));
    }

    const sourceUrl = "https://i.ibb.co/KjxNzZRy/Whats-App-Image-2026-08-08-at-7-06-28-PM.jpg";
    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/nike-dunk-low-camo-grey-black-swoosh-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) { console.error("Blob upload failed:", e); }

    const sizes = JSON.stringify(["40","41","42","43","44","45","46"]);
    const colors = JSON.stringify([{ name: "Grey/Black Camo", image: imageUrl }]);
    const images = JSON.stringify([imageUrl]);
    const tagsEn = JSON.stringify(["nike","dunk-low","grey","camo","streetwear","sneakers","black-swoosh"]);
    const tagsFr = JSON.stringify(["nike","dunk-low","gris","camo","streetwear","baskets","swoosh-noir"]);

    const longDescEn = `<p>Meet the Nike Dunk Low in Grey Camo - a versatile classic silhouette featuring a soft grey base with subtle camo pattern overlays and bold black Swoosh accents. This modern take on the iconic Dunk delivers premium urban style perfect for daily wear.</p>
<ul>
<li>Premium grey leather upper with subtle camo texture</li>
<li>Contrasting black Swoosh branding on lateral and medial sides</li>
<li>Padded collar and tongue for all-day comfort</li>
<li>Durable rubber cupsole with classic pivot circle heel</li>
<li>Perforated toe box for breathability</li>
<li>Ships with original Nike box</li>
</ul>
<table class="product-spec-table">
<tr><th>Brand</th><td>Nike</td></tr>
<tr><th>Model</th><td>Dunk Low</td></tr>
<tr><th>Colour</th><td>Grey / Black</td></tr>
<tr><th>Material</th><td>Leather with camo texture</td></tr>
<tr><th>Sole</th><td>Rubber cupsole</td></tr>
<tr><th>Closure</th><td>Lace-up</td></tr>
<tr><th>Style</th><td>Streetwear / Lifestyle</td></tr>
<tr><th>Sizes</th><td>40-46 EU</td></tr>
<tr><th>Ships from</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Includes</th><td>Original Nike box</td></tr>
</table>
<p>Pair with slim jeans and an oversized graphic tee for casual weekend outings, or dress them up with joggers and a bomber jacket for an elevated streetwear look. The neutral grey palette makes them incredibly versatile - they go with virtually anything in your wardrobe.</p>
<p><strong>Fast delivery from Lom\u00e9, Togo. Order today.</strong></p>`;

    const longDescFr = `<p>D\u00e9couvrez la Nike Dunk Low en Gris Camo - une silhouette classique polyvalente avec une base grise douce, des motifs camo subtils et un audacieux Swoosh noir en accent. Cette interpr\u00e9tation moderne de l'ic\u00f4nique Dunk offre un style urbain premium parfait pour un usage quotidien.</p>
<ul>
<li>Empeigne en cuir gris premium avec texture camo subtile</li>
<li>Swoosh noir contrastant sur les c\u00f4t\u00e9s lat\u00e9raux et m\u00e9dial</li>
<li>Col et langue rembourr\u00e9s pour un confort toute la journ\u00e9e</li>
<li>Semelle en caoutchouc durable avec cercle pivot classique au talon</li>
<li>Bout perfor\u00e9 pour la respirabilit\u00e9</li>
<li>Livr\u00e9e avec la bo\u00eete Nike d'origine</li>
</ul>
<table class="product-spec-table">
<tr><th>Marque</th><td>Nike</td></tr>
<tr><th>Mod\u00e8le</th><td>Dunk Low</td></tr>
<tr><th>Couleur</th><td>Gris / Noir</td></tr>
<tr><th>Mati\u00e8re</th><td>Cuir avec texture camo</td></tr>
<tr><th>Semelle</th><td>Caoutchouc</td></tr>
<tr><th>Fermeture</th><td>Lacets</td></tr>
<tr><th>Style</th><td>Streetwear / Lifestyle</td></tr>
<tr><th>Tailles</th><td>40-46 EU</td></tr>
<tr><th>Exp\u00e9di\u00e9 de</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Inclus</th><td>Bo\u00eete Nike d'origine</td></tr>
</table>
<p>Portez-la avec un jean slim et un tee-shirt oversize \u00e0 imprim\u00e9 pour une sortie casual le week-end, ou avec un jogger et un blouson bomber pour un look streetwear \u00e9lev\u00e9. La palette grise neutre les rend incroyablement polyvalentes - elles s'accordent avec pratiquement tout dans votre garde-robe.</p>
<p><strong>Livraison rapide depuis Lom\u00e9, Togo. Commandez aujourd'hui.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Nike Dunk Low Camo - Grey/Black",
      nameFr: "Basket Nike Dunk Low Camo - Gris/Noir",
      slug: slugEn,
      slugFr: slugFr,
      description: "Classic Nike Dunk Low in soft grey with subtle camo texture and bold black Swoosh. Perfect streetwear versatility.",
      descriptionFr: "Basket Nike Dunk Low classique en gris doux avec texture camo subtile et Swoosh noir audacieux. Polyvalence streetwear parfaite.",
      shortDescription: "Nike Dunk Low in grey with subtle camo pattern and black Swoosh accents. Sizes 40-46. Ships from Lom\u00e9.",
      shortDescriptionFr: "Nike Dunk Low en gris avec motif camo subtil et accents Swoosh noir. Tailles 40-46. Exp\u00e9di\u00e9 de Lom\u00e9.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: costNgn.toString(),
      supplierPrice: costFcfa.toString(),
      supplierCurrency: "XOF",
      category: "sneakers",
      brand: "Nike",
      sizes: sizes,
      colors: colors,
      imageUrl: imageUrl,
      images: images,
      stock: 25,
      featured: false,
      active: true,
      material: "Leather with camo texture",
      sku: "NDZ-NKE-DKC-GB02",
      tags: tagsEn,
      tagsFr: tagsFr,
      seoTitle: "Nike Dunk Low Grey Camo Black Swoosh | New Deal Zone",
      seoTitleFr: "Basket Nike Dunk Low Gris Camo Swoosh Noir | New Deal Zone",
      metaDescription: "Shop Nike Dunk Low Grey Camo with black Swoosh accents. Classic streetwear silhouette in premium leather. Sizes 40-46. Fast delivery from Lom\u00e9.",
      metaDescriptionFr: "Basket Nike Dunk Low Gris Camo avec Swoosh noir. Silhouette streetwear classique en cuir premium. Tailles 40-46. Livraison rapide depuis Lom\u00e9.",
      focusKeyphrase: "nike dunk low grey camo",
      focusKeyphraseFr: "basket nike dunk gris camo",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slugEn}`,
      originCountry: "TG",
      originCity: "Lom\u00e9",
    }).returning();

    const product = inserted[0];
    if (!product) throw new Error("Product insert returned nothing");

    const reviewData = [
      { name: "Ibrahim Toure",    rating: 5, en: "Perfect Dunks! The grey camo texture is so unique - it catches the eye without being loud. Fits true to size and comfy right out of the box.", fr: "Dunk parfaites ! La texture camo grise est si unique - elle attire l'\u0153il sans \u00eatre trop voyante. Taille juste et confortable d\u00e8s la sortie de la bo\u00eete.", daysAgo: 8, verified: true },
      { name: "Priscilla Owusu", rating: 5, en: "Been looking for versatile Dunks and these are it. The grey base goes with everything and the black Swoosh really pops. Received super fast in Lom\u00e9!", fr: "Je cherchais des Dunk polyvalentes et voici. La base grise s'accorde avec tout et le Swoosh noir ressort vraiment. Re\u00e7u tr\u00e8s rapidement \u00e0 Lom\u00e9 !", daysAgo: 22, verified: true },
      { name: "Kofi Adjei",      rating: 5, en: "Quality is exactly what you expect from Nike. Leather feels premium, stitching is clean, box came sealed. Perfect condition. Big respect.", fr: "Qualit\u00e9 exactement comme attendue de Nike. Le cuir est premium, les coutures propres, la bo\u00eete est arriv\u00e9e scell\u00e9e. Parfait \u00e9tat. Grand respect.", daysAgo: 47, verified: true },
      { name: "Camille Bernard",  rating: 4, en: "Beautiful sneakers, love the camo detail. Slight break-in period needed but they're comfortable after a few wears. Recommend going true to size.", fr: "Belles baskets, j'adore le d\u00e9tail camo. Petite p\u00e9riode d'adaptation n\u00e9cessaire mais confortables apr\u00e8s quelques ports. Je recommande de prendre sa taille habituelle.", daysAgo: 89, verified: false },
    ];

    for (const r of reviewData) {
      const date = new Date();
      date.setDate(date.getDate() - r.daysAgo);
      await db.insert(reviews).values({
        productId: product.id,
        customerName: r.name,
        rating: r.rating,
        comment: r.en,
        commentFr: r.fr,
        avatar: getInitials(r.name),
        verified: r.verified,
        createdAt: date,
      });
    }

    const totalRating = reviewData.reduce((s, r) => s + r.rating, 0);
    const avgRating = Math.round((totalRating / reviewData.length) * 10) / 10;
    await db.update(products).set({
      rating: avgRating.toFixed(1),
      reviewCount: reviewData.length,
    }).where(eq(products.id, product.id));

    return NextResponse.json({
      success: true,
      message: "Nike Dunk Low Camo Grey/Black seeded successfully",
      product: { id: product.id, slug: slugEn, slugFr: slugFr, imageUrl, blobUsed },
      pricing: {
        costFcfa, sellingFcfa, compareFcfa,
        costUsd, sellingUsd, compareUsd, costNgn,
        profitNgn: Math.round((sellingUsd - costUsd) * NGN),
        marginPct: Math.round(((sellingUsd - costUsd) / sellingUsd) * 1000) / 10,
        xofRate: XOF, ngnRate: NGN,
      },
      reviews: {
        count: reviewData.length,
        avg: avgRating,
        breakdown: `${reviewData.filter(r => r.rating === 5).length}x 5-star, ${reviewData.filter(r => r.rating === 4).length}x 4-star`,
      },
      origin: { country: "TG", city: "Lom\u00e9" },
      urls: {
        en: `https://www.newdealzone.com/en/product/${slugEn}`,
        fr: `https://www.newdealzone.com/fr/product/${slugFr}`,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}