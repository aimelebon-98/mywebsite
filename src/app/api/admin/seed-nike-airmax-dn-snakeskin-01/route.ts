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

    const costFcfa = 11000, sellingFcfa = 18000, compareFcfa = 25000;
    const costUsd    = Math.round((costFcfa / XOF) * 100) / 100;
    const sellingUsd = Math.round((sellingFcfa / XOF) * 100) / 100;
    const compareUsd = Math.round((compareFcfa / XOF) * 100) / 100;
    const costNgn    = Math.round(costUsd * NGN);

    const slugEn = "nike-air-max-dn-snakeskin-pink-lavender";
    const slugFr = "basket-nike-air-max-dn-snakeskin-rose-lavande";

    const existing = await db.select().from(products)
      .where(or(eq(products.slug, slugEn), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
      await db.delete(products).where(eq(products.id, p.id));
    }

    const sourceUrl = "https://i.ibb.co/67DB3RdR/Whats-App-Image-2026-08-08-at-7-06-27-PM-2.jpg";
    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/nike-air-max-dn-snakeskin-pink-lavender-dynamic-air-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) { console.error("Blob upload failed:", e); }

    const sizes = JSON.stringify(["40","41","42","43","44","45"]);
    const colors = JSON.stringify([{ name: "Pink/Lavender Snakeskin", image: imageUrl }]);
    const images = JSON.stringify([imageUrl]);
    const tagsEn = JSON.stringify(["nike","air-max-dn","dynamic-air","snakeskin","pink","lavender","running","streetwear","womens-inspired"]);
    const tagsFr = JSON.stringify(["nike","air-max-dn","dynamic-air","snakeskin","rose","lavande","running","streetwear","femme"]);

    const longDescEn = `<p>The Nike Air Max DN drops in a stunning Pink/Lavender snakeskin colorway - Nike's newest generation of Air Max technology featuring the revolutionary Dynamic Air 4-pod cushioning system visible through the transparent midsole. This bold, high-fashion silhouette pairs premium snakeskin-printed upper with soft pink and lavender pastels for an unforgettable streetwear statement.</p>
<ul>
<li>Snakeskin-textured upper in pink and lavender tones</li>
<li>Signature 4-pod Dynamic Air cushioning visible in midsole</li>
<li>Structured TPU midfoot cage for enhanced support</li>
<li>Mesh tongue for premium breathability</li>
<li>Padded collar for all-day comfort</li>
<li>Sculpted rubber outsole with excellent traction</li>
<li>Ships with original Nike box</li>
</ul>
<table class="product-spec-table">
<tr><th>Brand</th><td>Nike</td></tr>
<tr><th>Model</th><td>Air Max DN (Dynamic Air)</td></tr>
<tr><th>Colour</th><td>Pale Pink / Lavender / Snakeskin</td></tr>
<tr><th>Material</th><td>Snakeskin-print textile + mesh + TPU</td></tr>
<tr><th>Cushioning</th><td>4-Pod Dynamic Air System</td></tr>
<tr><th>Sole</th><td>Sculpted rubber outsole</td></tr>
<tr><th>Closure</th><td>Lace-up</td></tr>
<tr><th>Style</th><td>Running / High-fashion streetwear</td></tr>
<tr><th>Sizes</th><td>40-45 EU</td></tr>
<tr><th>Ships from</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Includes</th><td>Original Nike box</td></tr>
</table>
<p>The Air Max DN represents Nike's boldest step forward in Air Max innovation, and this snakeskin colorway makes it truly one-of-a-kind. Pair with cropped joggers and a cropped hoodie for an effortless athleisure look, or with cargo pants and an oversized bomber for a high-fashion streetwear moment. The visible Air pods and pastel tones ensure heads will turn.</p>
<p><strong>Fast delivery from Lom\u00e9, Togo. This drop is limited - grab it now.</strong></p>`;

    const longDescFr = `<p>La Nike Air Max DN sort dans un magnifique coloris snakeskin Rose/Lavande - la nouvelle g\u00e9n\u00e9ration Air Max de Nike dot\u00e9e du r\u00e9volutionnaire syst\u00e8me d'amorti Dynamic Air \u00e0 4 pods visibles \u00e0 travers la semelle interm\u00e9diaire transparente. Cette silhouette audacieuse et haute couture associe une empeigne imprim\u00e9e peau de serpent premium \u00e0 des tons pastel rose et lavande pour une d\u00e9claration streetwear inoubliable.</p>
<ul>
<li>Empeigne texture peau de serpent en tons rose et lavande</li>
<li>Amorti Dynamic Air \u00e0 4 pods signature visible dans la semelle</li>
<li>Cage TPU structur\u00e9e au milieu du pied pour un support accru</li>
<li>Langue en maille pour une respirabilit\u00e9 premium</li>
<li>Col rembourr\u00e9 pour un confort toute la journ\u00e9e</li>
<li>Semelle ext\u00e9rieure en caoutchouc sculpt\u00e9e avec excellente adh\u00e9rence</li>
<li>Livr\u00e9e avec la bo\u00eete Nike d'origine</li>
</ul>
<table class="product-spec-table">
<tr><th>Marque</th><td>Nike</td></tr>
<tr><th>Mod\u00e8le</th><td>Air Max DN (Dynamic Air)</td></tr>
<tr><th>Couleur</th><td>Rose P\u00e2le / Lavande / Snakeskin</td></tr>
<tr><th>Mati\u00e8re</th><td>Textile imprim\u00e9 peau de serpent + maille + TPU</td></tr>
<tr><th>Amorti</th><td>Syst\u00e8me Dynamic Air 4 pods</td></tr>
<tr><th>Semelle</th><td>Caoutchouc sculpt\u00e9</td></tr>
<tr><th>Fermeture</th><td>Lacets</td></tr>
<tr><th>Style</th><td>Running / Streetwear haute couture</td></tr>
<tr><th>Tailles</th><td>40-45 EU</td></tr>
<tr><th>Exp\u00e9di\u00e9 de</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Inclus</th><td>Bo\u00eete Nike d'origine</td></tr>
</table>
<p>L'Air Max DN repr\u00e9sente le pas le plus audacieux de Nike dans l'innovation Air Max, et ce coloris snakeskin le rend v\u00e9ritablement unique. Portez-la avec un jogger court et un hoodie court pour un look athleisure sans effort, ou avec un pantalon cargo et un blouson bomber oversize pour un moment streetwear haute couture. Les pods Air visibles et les tons pastel garantissent que les regards se tourneront.</p>
<p><strong>Livraison rapide depuis Lom\u00e9, Togo. Drop limit\u00e9 - saisissez-le maintenant.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Nike Air Max DN - Snakeskin Pink/Lavender",
      nameFr: "Basket Nike Air Max DN - Snakeskin Rose/Lavande",
      slug: slugEn,
      slugFr: slugFr,
      description: "Nike Air Max DN with revolutionary Dynamic Air cushioning in stunning pink/lavender snakeskin colorway.",
      descriptionFr: "Nike Air Max DN avec amorti Dynamic Air r\u00e9volutionnaire en magnifique coloris snakeskin rose/lavande.",
      shortDescription: "Nike Air Max DN in pink/lavender snakeskin with visible 4-pod Dynamic Air cushioning. Sizes 40-45. Ships from Lom\u00e9.",
      shortDescriptionFr: "Nike Air Max DN en snakeskin rose/lavande avec amorti Dynamic Air 4 pods visible. Tailles 40-45. Exp\u00e9di\u00e9 de Lom\u00e9.",
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
      stock: 25,
      featured: false,
      active: true,
      material: "Snakeskin-print textile + mesh + TPU cage",
      sku: "NDZ-NKE-ADN-PL01",
      tags: tagsEn,
      tagsFr: tagsFr,
      seoTitle: "Nike Air Max DN Snakeskin Pink Lavender | New Deal Zone",
      seoTitleFr: "Basket Nike Air Max DN Snakeskin Rose Lavande | New Deal Zone",
      metaDescription: "Shop Nike Air Max DN in stunning snakeskin pink/lavender with visible Dynamic Air pods. Bold high-fashion sneaker. Sizes 40-45. Fast delivery from Lom\u00e9.",
      metaDescriptionFr: "Nike Air Max DN en magnifique snakeskin rose/lavande avec pods Dynamic Air visibles. Basket haute couture audacieuse. Tailles 40-45. Livraison rapide depuis Lom\u00e9.",
      focusKeyphrase: "nike air max dn snakeskin",
      focusKeyphraseFr: "basket nike air max dn snakeskin",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slugEn}`,
      originCountry: "TG",
      originCity: "Lom\u00e9",
    }).returning();

    const product = inserted[0];
    if (!product) throw new Error("Insert failed");

    const reviewData = [
      { name: "Halima Mwangi",   daysAgo: 3,   rating: 5, en: "OBSESSED with these! The snakeskin print in pink and lavender is stunning. The visible Air pods are so bouncy and comfortable. Getting compliments everywhere.", fr: "OBSED\u00c9E par ces baskets ! L'imprim\u00e9 snakeskin en rose et lavande est magnifique. Les pods Air visibles sont si rebondissants et confortables. Je re\u00e7ois des compliments partout.", verified: true },
      { name: "Rachel Thompson", daysAgo: 16,  rating: 5, en: "The Air Max DN is on another level. Cushioning feels like walking on clouds and this colorway is a whole vibe. Sizing is spot on, super comfy.", fr: "L'Air Max DN est \u00e0 un autre niveau. L'amorti donne l'impression de marcher sur des nuages et ce coloris est un vibe complet. La taille est parfaite, super confortable.", verified: true },
      { name: "Blessing Okoro",  daysAgo: 35,  rating: 5, en: "Been waiting for a pastel Air Max drop and this delivered! Quality is incredible - the TPU cage feels premium, the snakeskin texture is authentic. Delivery to Togo was fast.", fr: "J'attendais un drop Air Max pastel et celui-ci a livr\u00e9 ! La qualit\u00e9 est incroyable - la cage TPU est premium, la texture snakeskin est authentique. Livraison rapide au Togo.", verified: true },
      { name: "Isabelle Rousseau", daysAgo: 68, rating: 4, en: "Love the design and comfort. The Air pods really do provide amazing bounce. Only wish they came in more sizes - I got my correct size but they went fast.", fr: "J'adore le design et le confort. Les pods Air offrent vraiment un rebond incroyable. J'aurais juste aim\u00e9 qu'elles soient disponibles dans plus de tailles - j'ai eu ma taille mais elles sont parties vite.", verified: false },
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
      message: "Nike Air Max DN Snakeskin Pink/Lavender seeded successfully",
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