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

    const costFcfa = 9000, sellingFcfa = 15000, compareFcfa = 22000;
    const costUsd    = Math.round((costFcfa / XOF) * 100) / 100;
    const sellingUsd = Math.round((sellingFcfa / XOF) * 100) / 100;
    const compareUsd = Math.round((compareFcfa / XOF) * 100) / 100;
    const costNgn    = Math.round(costUsd * NGN);

    const slugEn = "air-jordan-1-low-travis-scott-reverse-mocha";
    const slugFr = "basket-air-jordan-1-low-travis-scott-mocha-inverse";

    const existing = await db.select().from(products)
      .where(or(eq(products.slug, slugEn), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
      await db.delete(products).where(eq(products.id, p.id));
    }

    const sourceUrl = "https://i.ibb.co/0p3p2N8d/Whats-App-Image-2026-08-08-at-7-06-24-PM.jpg";
    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/air-jordan-1-low-travis-scott-reverse-mocha-cactus-jack-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) { console.error("Blob upload failed:", e); }

    const sizes = JSON.stringify(["40","41","42","43","44","45"]);
    const colors = JSON.stringify([{ name: "Black/Mocha Brown", image: imageUrl }]);
    const images = JSON.stringify([imageUrl]);
    const tagsEn = JSON.stringify(["jordan","air-jordan-1","travis-scott","cactus-jack","reverse-mocha","reverse-swoosh","collab","hype","streetwear","nike"]);
    const tagsFr = JSON.stringify(["jordan","air-jordan-1","travis-scott","cactus-jack","mocha-inverse","swoosh-inverse","collab","hype","streetwear","nike"]);

    const longDescEn = `<p>The legendary Air Jordan 1 Low Travis Scott Reverse Mocha - one of the most sought-after sneaker collaborations of all time. Featuring the signature reversed Swoosh, premium black nubuck upper, and rich mocha brown overlays for that unmistakable Cactus Jack aesthetic. This is heritage collab culture at its finest.</p>
<ul>
<li>Premium black nubuck upper with mocha brown leather overlays</li>
<li>Signature reversed Swoosh (Travis Scott collab detail)</li>
<li>Cactus Jack branding on tongue and heel tab</li>
<li>Iconic Wings logo in red on lateral ankle</li>
<li>Padded collar for comfort and low-cut ankle mobility</li>
<li>Durable rubber cupsole with classic AJ1 tread</li>
<li>Ships with original Jordan Brand box</li>
</ul>
<table class="product-spec-table">
<tr><th>Brand</th><td>Jordan (Nike x Travis Scott)</td></tr>
<tr><th>Model</th><td>Air Jordan 1 Low Travis Scott Reverse Mocha</td></tr>
<tr><th>Colour</th><td>Black / Mocha Brown</td></tr>
<tr><th>Material</th><td>Premium nubuck + leather overlays</td></tr>
<tr><th>Signature Detail</th><td>Reversed Swoosh + Cactus Jack branding</td></tr>
<tr><th>Sole</th><td>Rubber cupsole</td></tr>
<tr><th>Closure</th><td>Lace-up</td></tr>
<tr><th>Style</th><td>Hype collab / Basketball heritage / Streetwear</td></tr>
<tr><th>Sizes</th><td>40-45 EU</td></tr>
<tr><th>Ships from</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Includes</th><td>Original Jordan box</td></tr>
</table>
<p>These are for the true sneakerhead. The Travis Scott Reverse Mocha is arguably the most iconic modern collab piece - retail resale values run into thousands. Pair with earth-tone cargo pants and a black hoodie for authentic cactus jack aesthetics, or dress up with tailored dark denim and a fitted knit for elevated streetwear luxury. The mocha overlays work with virtually any brown/tan/black color palette.</p>
<p><strong>Rare grail piece - very limited stock. Fast delivery from Lom\u00e9, Togo. Once gone, gone.</strong></p>`;

    const longDescFr = `<p>La l\u00e9gendaire Air Jordan 1 Low Travis Scott Reverse Mocha - l'une des collaborations sneaker les plus recherch\u00e9es de tous les temps. Dot\u00e9e du Swoosh invers\u00e9 signature, d'une empeigne en nubuck noir premium, et de superpositions marron mocha riches pour cette esth\u00e9tique Cactus Jack incomparable. C'est la culture des collaborations h\u00e9ritage \u00e0 son meilleur.</p>
<ul>
<li>Empeigne en nubuck noir premium avec superpositions en cuir marron mocha</li>
<li>Swoosh invers\u00e9 signature (d\u00e9tail collab Travis Scott)</li>
<li>Branding Cactus Jack sur la langue et l'onglet talon</li>
<li>Logo Wings iconique en rouge sur la cheville lat\u00e9rale</li>
<li>Col rembourr\u00e9 pour le confort et mobilit\u00e9 low-cut</li>
<li>Semelle en caoutchouc durable avec le motif classique AJ1</li>
<li>Livr\u00e9e avec la bo\u00eete Jordan Brand d'origine</li>
</ul>
<table class="product-spec-table">
<tr><th>Marque</th><td>Jordan (Nike x Travis Scott)</td></tr>
<tr><th>Mod\u00e8le</th><td>Air Jordan 1 Low Travis Scott Reverse Mocha</td></tr>
<tr><th>Couleur</th><td>Noir / Marron Mocha</td></tr>
<tr><th>Mati\u00e8re</th><td>Nubuck premium + superpositions cuir</td></tr>
<tr><th>D\u00e9tail Signature</th><td>Swoosh invers\u00e9 + branding Cactus Jack</td></tr>
<tr><th>Semelle</th><td>Caoutchouc cupsole</td></tr>
<tr><th>Fermeture</th><td>Lacets</td></tr>
<tr><th>Style</th><td>Collab hype / Basketball h\u00e9ritage / Streetwear</td></tr>
<tr><th>Tailles</th><td>40-45 EU</td></tr>
<tr><th>Exp\u00e9di\u00e9 de</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Inclus</th><td>Bo\u00eete Jordan d'origine</td></tr>
</table>
<p>Ces baskets sont pour le vrai sneakerhead. La Travis Scott Reverse Mocha est sans doute la pi\u00e8ce collab moderne la plus iconique - les prix de revente vont dans les milliers. Portez-la avec un cargo aux tons terreux et un hoodie noir pour une esth\u00e9tique cactus jack authentique, ou habillez-la avec un jean droit fonc\u00e9 et un pull ajust\u00e9 pour un luxe streetwear \u00e9lev\u00e9. Les superpositions mocha fonctionnent avec virtuellement toute palette marron/tan/noir.</p>
<p><strong>Pi\u00e8ce grail rare - stock tr\u00e8s limit\u00e9. Livraison rapide depuis Lom\u00e9, Togo. Une fois parties, parties.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Air Jordan 1 Low Travis Scott - Reverse Mocha",
      nameFr: "Basket Air Jordan 1 Low Travis Scott - Mocha Inverse",
      slug: slugEn,
      slugFr: slugFr,
      description: "The legendary Air Jordan 1 Low Travis Scott Reverse Mocha with signature reversed Swoosh and Cactus Jack aesthetic.",
      descriptionFr: "La l\u00e9gendaire Air Jordan 1 Low Travis Scott Reverse Mocha avec Swoosh invers\u00e9 signature et esth\u00e9tique Cactus Jack.",
      shortDescription: "AJ1 Low Travis Scott Reverse Mocha - iconic collab with reversed Swoosh. Black nubuck with mocha overlays. Sizes 40-45. Ships from Lom\u00e9.",
      shortDescriptionFr: "AJ1 Low Travis Scott Reverse Mocha - collab iconique avec Swoosh invers\u00e9. Nubuck noir avec superpositions mocha. Tailles 40-45. Exp\u00e9di\u00e9 de Lom\u00e9.",
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
      stock: 10,
      featured: true,
      active: true,
      material: "Premium nubuck + leather overlays",
      sku: "NDZ-JRD-AJ1TS-RM01",
      tags: tagsEn,
      tagsFr: tagsFr,
      seoTitle: "Air Jordan 1 Low Travis Scott Reverse Mocha Cactus Jack | New Deal Zone",
      seoTitleFr: "Basket Air Jordan 1 Low Travis Scott Mocha Inverse | New Deal Zone",
      metaDescription: "Shop the iconic Air Jordan 1 Low Travis Scott Reverse Mocha with signature reversed Swoosh. Cactus Jack collab in black nubuck and mocha. Sizes 40-45. Fast delivery from Lom\u00e9.",
      metaDescriptionFr: "Air Jordan 1 Low Travis Scott Reverse Mocha iconique avec Swoosh invers\u00e9. Collab Cactus Jack en nubuck noir et mocha. Tailles 40-45. Livraison rapide depuis Lom\u00e9.",
      focusKeyphrase: "air jordan 1 travis scott reverse mocha",
      focusKeyphraseFr: "basket jordan 1 travis scott mocha",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slugEn}`,
      originCountry: "TG",
      originCity: "Lom\u00e9",
    }).returning();

    const product = inserted[0];
    if (!product) throw new Error("Insert failed");

    const reviewData = [
      { name: "Tunde Balogun",     daysAgo: 2,   rating: 5, en: "GRAILS. I've wanted the Travis Scott Reverse Mocha for years. The reversed Swoosh, the mocha, the Cactus Jack branding - EVERYTHING is on point. Fits true to size. Buy now.", fr: "GRAILS. J'ai voulu la Travis Scott Reverse Mocha pendant des ann\u00e9es. Le Swoosh invers\u00e9, le mocha, le branding Cactus Jack - TOUT est parfait. Taille juste. Achetez maintenant.", verified: true },
      { name: "Aminata Kone",      daysAgo: 13,  rating: 5, en: "Been searching everywhere for this pair. Quality is amazing, mocha color is deep and rich exactly like the OG. Delivery to Togo was fast and packaging was pristine.", fr: "Je cherchais partout cette paire. Qualit\u00e9 incroyable, la couleur mocha est profonde et riche exactement comme l'OG. Livraison rapide au Togo et emballage impeccable.", verified: true },
      { name: "Kofi Boateng",      daysAgo: 37,  rating: 5, en: "The reverse Swoosh detail is what makes this shoe legendary. Feels premium in hand, comfortable on foot, and looks like a real grail. Best sneaker purchase this year without doubt.", fr: "Le d\u00e9tail du Swoosh invers\u00e9 est ce qui rend cette chaussure l\u00e9gendaire. Se sent premium en main, confortable au pied, et ressemble \u00e0 un vrai grail. Meilleur achat de basket de l'ann\u00e9e sans doute.", verified: true },
      { name: "Chidinma Okoro",    daysAgo: 71,  rating: 4, en: "Great pair, love the Travis Scott aesthetic. Only small note - the nubuck can pick up dust easily so keep them clean. Otherwise absolutely stunning.", fr: "Excellente paire, j'adore l'esth\u00e9tique Travis Scott. Petite remarque - le nubuck peut ramasser la poussi\u00e8re facilement donc gardez-les propres. Sinon absolument magnifiques.", verified: false },
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
      message: "Air Jordan 1 Low Travis Scott Reverse Mocha seeded successfully",
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