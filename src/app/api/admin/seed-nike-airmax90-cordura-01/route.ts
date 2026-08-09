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

    const slugEn = "nike-air-max-90-cordura-desert-sand";
    const slugFr = "basket-nike-air-max-90-cordura-sable-desert";

    const existing = await db.select().from(products)
      .where(or(eq(products.slug, slugEn), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
      await db.delete(products).where(eq(products.id, p.id));
    }

    const sourceUrl = "https://i.ibb.co/vKXj2Fy/Whats-App-Image-2026-08-08-at-7-06-24-PM-1.jpg";
    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/nike-air-max-90-cordura-desert-sand-tactical-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) { console.error("Blob upload failed:", e); }

    const sizes = JSON.stringify(["40","41","42","43","44","45"]);
    const colors = JSON.stringify([{ name: "Desert Sand", image: imageUrl }]);
    const images = JSON.stringify([imageUrl]);
    const tagsEn = JSON.stringify(["nike","air-max-90","cordura","desert-sand","tan","tactical","military","streetwear","running","suede"]);
    const tagsFr = JSON.stringify(["nike","air-max-90","cordura","sable-desert","tan","tactique","militaire","streetwear","running","daim"]);

    const longDescEn = `<p>The Nike Air Max 90 CORDURA in Desert Sand - a premium tactical-inspired take on the iconic Air Max 90 silhouette. Featuring military-grade CORDURA fabric known for its exceptional durability and abrasion resistance, combined with premium suede and leather overlays in warm tan and beige tones. The signature visible Air Max unit and orange back tab accent complete this must-have piece.</p>
<ul>
<li>Durable CORDURA fabric panels (military-grade abrasion resistance)</li>
<li>Premium tan suede and beige leather overlays</li>
<li>Signature visible Air-Max cushioning unit in heel</li>
<li>Contrasting orange back tab accent</li>
<li>Tan Nike Swoosh branding</li>
<li>CORDURA branded tag detail</li>
<li>Chunky rubber outsole with excellent traction</li>
<li>Ships with original Nike box</li>
</ul>
<table class="product-spec-table">
<tr><th>Brand</th><td>Nike</td></tr>
<tr><th>Model</th><td>Air Max 90 CORDURA</td></tr>
<tr><th>Colour</th><td>Desert Sand / Tan / Beige</td></tr>
<tr><th>Material</th><td>CORDURA fabric + premium suede + leather</td></tr>
<tr><th>Cushioning</th><td>Visible Air-Max unit in heel</td></tr>
<tr><th>Signature Detail</th><td>Orange back tab + CORDURA branding tag</td></tr>
<tr><th>Sole</th><td>Chunky rubber outsole</td></tr>
<tr><th>Closure</th><td>Lace-up</td></tr>
<tr><th>Style</th><td>Tactical / Military-inspired streetwear</td></tr>
<tr><th>Sizes</th><td>40-45 EU</td></tr>
<tr><th>Ships from</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Includes</th><td>Original Nike box</td></tr>
</table>
<p>The CORDURA edition brings serious tactical DNA to the beloved Air Max 90 platform. Perfect for those who want their sneakers to combine style with real-world durability. Pair with olive cargo pants and a fitted crew tee for authentic military-inspired streetwear, or with warm-tone chinos and a beige knit for elevated smart-casual desert vibes. The neutral desert sand palette works with virtually every earth tone in your wardrobe.</p>
<p><strong>Premium tactical build - limited stock. Fast delivery from Lom\u00e9, Togo.</strong></p>`;

    const longDescFr = `<p>La Nike Air Max 90 CORDURA en Sable D\u00e9sert - une interpr\u00e9tation tactique premium de l'iconique silhouette Air Max 90. Dot\u00e9e du tissu CORDURA de qualit\u00e9 militaire connu pour sa durabilit\u00e9 et sa r\u00e9sistance \u00e0 l'abrasion exceptionnelles, combin\u00e9 avec du daim et du cuir premium dans des tons tan et beige chaleureux. L'unit\u00e9 Air-Max visible signature et l'accent orange sur le talon compl\u00e8tent cette pi\u00e8ce incontournable.</p>
<ul>
<li>Panneaux en tissu CORDURA durable (r\u00e9sistance \u00e0 l'abrasion de qualit\u00e9 militaire)</li>
<li>Superpositions premium en daim tan et cuir beige</li>
<li>Unit\u00e9 d'amorti Air-Max visible signature au talon</li>
<li>Accent orange contrastant sur le talon</li>
<li>Swoosh Nike en tan</li>
<li>D\u00e9tail \u00e9tiquette CORDURA</li>
<li>Semelle ext\u00e9rieure en caoutchouc chunky avec excellente adh\u00e9rence</li>
<li>Livr\u00e9e avec la bo\u00eete Nike d'origine</li>
</ul>
<table class="product-spec-table">
<tr><th>Marque</th><td>Nike</td></tr>
<tr><th>Mod\u00e8le</th><td>Air Max 90 CORDURA</td></tr>
<tr><th>Couleur</th><td>Sable D\u00e9sert / Tan / Beige</td></tr>
<tr><th>Mati\u00e8re</th><td>Tissu CORDURA + daim premium + cuir</td></tr>
<tr><th>Amorti</th><td>Unit\u00e9 Air-Max visible au talon</td></tr>
<tr><th>D\u00e9tail Signature</th><td>Talon orange + \u00e9tiquette CORDURA</td></tr>
<tr><th>Semelle</th><td>Caoutchouc chunky</td></tr>
<tr><th>Fermeture</th><td>Lacets</td></tr>
<tr><th>Style</th><td>Tactique / Streetwear inspir\u00e9 militaire</td></tr>
<tr><th>Tailles</th><td>40-45 EU</td></tr>
<tr><th>Exp\u00e9di\u00e9 de</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Inclus</th><td>Bo\u00eete Nike d'origine</td></tr>
</table>
<p>L'\u00e9dition CORDURA apporte un ADN tactique s\u00e9rieux \u00e0 la plateforme Air Max 90 tant appr\u00e9ci\u00e9e. Parfaite pour ceux qui veulent que leurs baskets combinent style et durabilit\u00e9 r\u00e9elle. Portez-la avec un cargo olive et un tee-shirt ajust\u00e9 pour un streetwear militaire authentique, ou avec un chino aux tons chaleureux et un pull beige pour un smart-casual desert \u00e9lev\u00e9. La palette neutre sable d\u00e9sert fonctionne avec virtuellement chaque ton terreux de votre garde-robe.</p>
<p><strong>Construction tactique premium - stock limit\u00e9. Livraison rapide depuis Lom\u00e9, Togo.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Nike Air Max 90 CORDURA - Desert Sand",
      nameFr: "Basket Nike Air Max 90 CORDURA - Sable D\u00e9sert",
      slug: slugEn,
      slugFr: slugFr,
      description: "Nike Air Max 90 CORDURA in Desert Sand - tactical-inspired build with military-grade CORDURA fabric, premium suede, visible Air-Max heel.",
      descriptionFr: "Nike Air Max 90 CORDURA en Sable D\u00e9sert - construction tactique avec tissu CORDURA militaire, daim premium, Air-Max visible.",
      shortDescription: "Nike Air Max 90 CORDURA Desert Sand - CORDURA fabric, suede overlays, visible Air heel. Sizes 40-45. Ships from Lom\u00e9.",
      shortDescriptionFr: "Nike Air Max 90 CORDURA Sable D\u00e9sert - tissu CORDURA, superpositions daim, Air visible. Tailles 40-45. Exp\u00e9di\u00e9 de Lom\u00e9.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: costNgn.toString(),
      supplierPrice: costFcfa.toString(),
      supplierCurrency: "XOF",
      category: "running",
      brand: "Nike",
      sizes: sizes,
      colors: colors,
      imageUrl: imageUrl,
      images: images,
      stock: 20,
      featured: false,
      active: true,
      material: "CORDURA fabric + premium suede + leather",
      sku: "NDZ-NKE-AM90-DS01",
      tags: tagsEn,
      tagsFr: tagsFr,
      seoTitle: "Nike Air Max 90 CORDURA Desert Sand Tactical Tan | New Deal Zone",
      seoTitleFr: "Basket Nike Air Max 90 CORDURA Sable D\u00e9sert | New Deal Zone",
      metaDescription: "Shop Nike Air Max 90 CORDURA in Desert Sand. Tactical-inspired with CORDURA fabric, premium suede, visible Air heel. Sizes 40-45. Fast delivery from Lom\u00e9.",
      metaDescriptionFr: "Nike Air Max 90 CORDURA en Sable D\u00e9sert. Inspir\u00e9e tactique avec tissu CORDURA, daim premium, Air visible. Tailles 40-45. Livraison rapide depuis Lom\u00e9.",
      focusKeyphrase: "nike air max 90 cordura desert sand",
      focusKeyphraseFr: "basket nike air max 90 cordura",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slugEn}`,
      originCountry: "TG",
      originCity: "Lom\u00e9",
    }).returning();

    const product = inserted[0];
    if (!product) throw new Error("Insert failed");

    const reviewData = [
      { name: "Blessing Adeyemi",  daysAgo: 5,   rating: 5, en: "The CORDURA build is next level - feels like it will last forever. Desert sand color is warm and versatile. Perfect for fall/winter earth tone fits.", fr: "La construction CORDURA est de niveau sup\u00e9rieur - on dirait qu'elle durera pour toujours. La couleur sable d\u00e9sert est chaleureuse et polyvalente. Parfait pour les tenues aux tons terreux d'automne/hiver.", verified: true },
      { name: "Kunle Adeboye",     daysAgo: 22,  rating: 5, en: "Been wanting an Air Max 90 in a tan/desert colorway for years. This CORDURA version delivers. Quality is exactly what you expect from Nike Premium. Big win.", fr: "Je voulais une Air Max 90 dans un coloris tan/d\u00e9sert depuis des ann\u00e9es. Cette version CORDURA livre. Qualit\u00e9 exactement comme attendue de Nike Premium. Grande victoire.", verified: true },
      { name: "Ama Kwarteng",      daysAgo: 43,  rating: 5, en: "The orange back tab detail is a small but perfect touch. CORDURA fabric feels rugged but stylish. Comfortable straight out the box. Recommended.", fr: "Le d\u00e9tail orange au talon est petit mais parfait. Le tissu CORDURA est robuste mais stylish. Confortable d\u00e8s la sortie de la bo\u00eete. Recommand\u00e9.", verified: true },
      { name: "Isabelle Rousseau", daysAgo: 76,  rating: 4, en: "Great sneakers with a really cool tactical vibe. The suede sections need a bit of care to keep clean but overall very happy with the purchase.", fr: "Belles baskets avec un vibe tactique vraiment cool. Les sections en daim n\u00e9cessitent un peu de soin pour rester propres mais globalement tr\u00e8s heureuse de l'achat.", verified: false },
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
      message: "Nike Air Max 90 CORDURA Desert Sand seeded successfully",
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