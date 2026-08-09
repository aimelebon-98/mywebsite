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

    const costFcfa = 10000, sellingFcfa = 15000, compareFcfa = 22000;
    const costUsd    = Math.round((costFcfa / XOF) * 100) / 100;
    const sellingUsd = Math.round((sellingFcfa / XOF) * 100) / 100;
    const compareUsd = Math.round((compareFcfa / XOF) * 100) / 100;
    const costNgn    = Math.round(costUsd * NGN);

    const slugEn = "air-jordan-4-retro-royal-blue";
    const slugFr = "basket-air-jordan-4-retro-bleu-royal";

    const existing = await db.select().from(products)
      .where(or(eq(products.slug, slugEn), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
      await db.delete(products).where(eq(products.id, p.id));
    }

    const sourceUrl = "https://i.ibb.co/svvYqj4K/Whats-App-Image-2026-08-08-at-7-06-27-PM.jpg";
    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/air-jordan-4-retro-royal-blue-nubuck-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) { console.error("Blob upload failed:", e); }

    const sizes = JSON.stringify(["40","41","42","43","44","45"]);
    const colors = JSON.stringify([{ name: "Royal Blue", image: imageUrl }]);
    const images = JSON.stringify([imageUrl]);
    const tagsEn = JSON.stringify(["jordan","air-jordan-4","retro","royal-blue","basketball","jumpman","streetwear","nike"]);
    const tagsFr = JSON.stringify(["jordan","air-jordan-4","retro","bleu-royal","basketball","jumpman","streetwear","nike"]);

    const longDescEn = `<p>The iconic Air Jordan 4 Retro drops in a bold monochromatic Royal Blue colorway that makes an unforgettable statement. Featuring premium nubuck upper, signature mesh wings for breathability, and Nike's visible Air cushioning in the heel - this is basketball heritage meets modern streetwear at its finest.</p>
<ul>
<li>Premium nubuck upper with all-over royal blue treatment</li>
<li>Signature Jumpman logo on tongue and heel</li>
<li>Mesh side panels for enhanced breathability</li>
<li>Visible Air-Sole cushioning in the heel</li>
<li>Classic AJ4 wings and eyelets design</li>
<li>Durable rubber cupsole with excellent traction</li>
<li>Ships with original Jordan Brand box</li>
</ul>
<table class="product-spec-table">
<tr><th>Brand</th><td>Jordan (Nike)</td></tr>
<tr><th>Model</th><td>Air Jordan 4 Retro</td></tr>
<tr><th>Colour</th><td>Royal Blue (monochrome)</td></tr>
<tr><th>Material</th><td>Premium nubuck + mesh side panels</td></tr>
<tr><th>Cushioning</th><td>Visible Air-Sole heel unit</td></tr>
<tr><th>Sole</th><td>Rubber cupsole</td></tr>
<tr><th>Closure</th><td>Lace-up with signature eyelet wings</td></tr>
<tr><th>Style</th><td>Basketball / Streetwear heritage</td></tr>
<tr><th>Sizes</th><td>40-45 EU</td></tr>
<tr><th>Ships from</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Includes</th><td>Original Jordan box</td></tr>
</table>
<p>The perfect statement sneaker for basketball fans and streetwear enthusiasts alike. Style with light-wash denim and a white tee for a clean everyday look, or pair with black joggers and a matching blue accent piece for an elevated color-coordinated fit. The all-blue monochrome design commands attention.</p>
<p><strong>Fast delivery from Lom\u00e9, Togo. Limited stock - grab yours today.</strong></p>`;

    const longDescFr = `<p>L'iconique Air Jordan 4 Retro sort dans un audacieux coloris monochrome Bleu Royal qui fait une d\u00e9claration inoubliable. Dot\u00e9e d'une empeigne en nubuck premium, des ailes en maille signature pour la respirabilit\u00e9, et de l'amorti Air visible de Nike au talon - c'est l'h\u00e9ritage du basketball qui rencontre le streetwear moderne dans sa plus belle expression.</p>
<ul>
<li>Empeigne en nubuck premium avec traitement bleu royal integral</li>
<li>Logo Jumpman signature sur la langue et le talon</li>
<li>Panneaux lat\u00e9raux en maille pour une respirabilit\u00e9 accrue</li>
<li>Amorti Air-Sole visible au talon</li>
<li>Design classique AJ4 avec ailes et \u0153illets</li>
<li>Semelle en caoutchouc durable avec excellente adh\u00e9rence</li>
<li>Livr\u00e9e avec la bo\u00eete Jordan Brand d'origine</li>
</ul>
<table class="product-spec-table">
<tr><th>Marque</th><td>Jordan (Nike)</td></tr>
<tr><th>Mod\u00e8le</th><td>Air Jordan 4 Retro</td></tr>
<tr><th>Couleur</th><td>Bleu Royal (monochrome)</td></tr>
<tr><th>Mati\u00e8re</th><td>Nubuck premium + panneaux maille</td></tr>
<tr><th>Amorti</th><td>Unit\u00e9 Air-Sole visible au talon</td></tr>
<tr><th>Semelle</th><td>Caoutchouc cupsole</td></tr>
<tr><th>Fermeture</th><td>Lacets avec ailes signature</td></tr>
<tr><th>Style</th><td>Basketball / Streetwear h\u00e9ritage</td></tr>
<tr><th>Tailles</th><td>40-45 EU</td></tr>
<tr><th>Exp\u00e9di\u00e9 de</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Inclus</th><td>Bo\u00eete Jordan d'origine</td></tr>
</table>
<p>La basket d\u00e9claration parfaite pour les fans de basketball et les amateurs de streetwear. Portez-la avec un jean clair et un tee-shirt blanc pour un look quotidien \u00e9pur\u00e9, ou associez-la \u00e0 un jogger noir et une pi\u00e8ce d'accent bleu assortie pour un ensemble \u00e9lev\u00e9 aux couleurs coordonn\u00e9es. Le design monochrome tout bleu attire l'attention.</p>
<p><strong>Livraison rapide depuis Lom\u00e9, Togo. Stock limit\u00e9 - obtenez la v\u00f4tre aujourd'hui.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Air Jordan 4 Retro - Royal Blue",
      nameFr: "Basket Air Jordan 4 Retro - Bleu Royal",
      slug: slugEn,
      slugFr: slugFr,
      description: "Bold monochrome Royal Blue Air Jordan 4 Retro. Premium nubuck upper, mesh wings, visible Air-Sole heel unit.",
      descriptionFr: "Audacieux Air Jordan 4 Retro Bleu Royal monochrome. Empeigne nubuck premium, ailes maille, unit\u00e9 Air-Sole visible.",
      shortDescription: "Air Jordan 4 Retro Royal Blue - all-over blue nubuck with visible Air heel. Sizes 40-45. Ships from Lom\u00e9.",
      shortDescriptionFr: "Air Jordan 4 Retro Bleu Royal - nubuck bleu integral avec Air visible au talon. Tailles 40-45. Exp\u00e9di\u00e9 de Lom\u00e9.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: costNgn.toString(),
      supplierPrice: costFcfa.toString(),
      supplierCurrency: "XOF",
      category: "sneakers",
      brand: "Jordan",
      sizes: sizes,
      colors: colors,
      imageUrl: imageUrl,
      images: images,
      stock: 25,
      featured: false,
      active: true,
      material: "Premium nubuck with mesh wings",
      sku: "NDZ-JRD-AJ4-RB01",
      tags: tagsEn,
      tagsFr: tagsFr,
      seoTitle: "Air Jordan 4 Retro Royal Blue Sneakers | New Deal Zone",
      seoTitleFr: "Basket Air Jordan 4 Retro Bleu Royal | New Deal Zone",
      metaDescription: "Shop the Air Jordan 4 Retro in bold Royal Blue monochrome. Premium nubuck, mesh wings, visible Air heel. Sizes 40-45. Fast delivery from Lom\u00e9.",
      metaDescriptionFr: "Air Jordan 4 Retro en audacieux Bleu Royal monochrome. Nubuck premium, ailes maille, Air visible. Tailles 40-45. Livraison rapide depuis Lom\u00e9.",
      focusKeyphrase: "air jordan 4 royal blue",
      focusKeyphraseFr: "basket air jordan 4 bleu royal",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slugEn}`,
      originCountry: "TG",
      originCity: "Lom\u00e9",
    }).returning();

    const product = inserted[0];
    if (!product) throw new Error("Insert failed");

    const reviewData = [
      { name: "Emmanuel Adjei",  daysAgo: 6,   rating: 5, en: "The all-blue Jordan 4 is FIRE! Nubuck feels premium, Air unit is visible and clean. Boxed and delivered like an art piece. Best sneaker cop this year.", fr: "La Jordan 4 tout bleu est FEU ! Le nubuck est premium, l'unit\u00e9 Air est visible et propre. Emball\u00e9e et livr\u00e9e comme une \u0153uvre d'art. Meilleur achat sneaker de l'ann\u00e9e.", verified: true },
      { name: "Aissatou Ba",     daysAgo: 21,  rating: 5, en: "Been chasing this colorway for months. Fits perfectly, comfortable enough for all-day wear. The blue is exactly what I hoped - vibrant but classy.", fr: "Je chassais ce coloris depuis des mois. Ajustement parfait, assez confortable pour un port toute la journ\u00e9e. Le bleu est exactement ce que j'esp\u00e9rais - vibrant mais classe.", verified: true },
      { name: "Kunle Adebayo",   daysAgo: 44,  rating: 5, en: "Bought as a gift for my son. He was speechless. Quality is outstanding, packaging came sealed with original Jumpman box. Everything premium.", fr: "Achet\u00e9es en cadeau pour mon fils. Il en est rest\u00e9 bouche b\u00e9e. Qualit\u00e9 exceptionnelle, emballage scell\u00e9 avec bo\u00eete Jumpman d'origine. Tout est premium.", verified: true },
      { name: "Julie Martin",    daysAgo: 79,  rating: 4, en: "Gorgeous shoe, love the monochrome vibe. Slightly stiff at first but breaks in well after a few wears. Recommend true to size.", fr: "Belle chaussure, j'adore le c\u00f4t\u00e9 monochrome. L\u00e9g\u00e8rement rigide au d\u00e9but mais s'assouplit bien apr\u00e8s quelques ports. Je recommande sa taille habituelle.", verified: false },
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
      message: "Air Jordan 4 Retro Royal Blue seeded successfully",
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