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

    const costFcfa = 15000, sellingFcfa = 23000, compareFcfa = 29000;
    const costUsd    = Math.round((costFcfa / XOF) * 100) / 100;
    const sellingUsd = Math.round((sellingFcfa / XOF) * 100) / 100;
    const compareUsd = Math.round((compareFcfa / XOF) * 100) / 100;
    const costNgn    = Math.round(costUsd * NGN);

    const slugEn = "numeris-low-top-mint-green-floral-embroidered";
    const slugFr = "basket-numeris-low-top-vert-menthe-broderie-florale";

    const existing = await db.select().from(products)
      .where(or(eq(products.slug, slugEn), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
      await db.delete(products).where(eq(products.id, p.id));
    }

    const sourceUrl = "https://i.ibb.co/yF0gS84H/Whats-App-Image-2026-08-08-at-7-06-25-PM.jpg";
    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/numeris-low-top-mint-green-floral-embroidered-luxury-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) { console.error("Blob upload failed:", e); }

    const sizes = JSON.stringify(["40","41","42","43","44","45"]);
    const colors = JSON.stringify([{ name: "Mint Green/Cream Floral", image: imageUrl }]);
    const images = JSON.stringify([imageUrl]);
    const tagsEn = JSON.stringify(["numeris","luxury","mint-green","floral","embroidered","low-top","boutique","designer-inspired","womens"]);
    const tagsFr = JSON.stringify(["numeris","luxe","vert-menthe","floral","broderie","low-top","boutique","inspiration-designer","femme"]);

    const longDescEn = `<p>The Numeris Low-Top Sneaker in Mint Green with delicate floral embroidered patches - a rare boutique piece that combines romantic femininity with premium streetwear construction. Comes with the full Numeris luxury experience: signature dust bag, branded box, and authenticity card.</p>
<ul>
<li>Mint green embroidered canvas upper with subtle floral patches</li>
<li>Cream premium leather toe cap and heel counter</li>
<li>Numeris branded heel tab and embossed logo</li>
<li>Oversized flat cream cotton laces</li>
<li>Chunky serrated white cupsole with ribbed detailing</li>
<li>Padded collar and tongue for supreme comfort</li>
<li>Complete luxury packaging: dust bag + box + authenticity card</li>
</ul>
<table class="product-spec-table">
<tr><th>Brand</th><td>Numeris</td></tr>
<tr><th>Model</th><td>Low-Top Floral Embroidered Edition</td></tr>
<tr><th>Colour</th><td>Mint Green / Cream</td></tr>
<tr><th>Material</th><td>Embroidered canvas + premium leather</td></tr>
<tr><th>Details</th><td>Delicate floral embroidery, luxury packaging</td></tr>
<tr><th>Sole</th><td>Chunky serrated white cupsole</td></tr>
<tr><th>Closure</th><td>Lace-up with oversized flat laces</td></tr>
<tr><th>Style</th><td>Boutique luxury / Feminine streetwear</td></tr>
<tr><th>Sizes</th><td>40-45 EU</td></tr>
<tr><th>Ships from</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Includes</th><td>Original box, dust bag, authenticity card</td></tr>
</table>
<p>These are for the customer who appreciates the delicate details - the tiny embroidered florals, the softness of mint green, the crisp contrast of cream leather against the chunky white sole. Pair with a flowing midi dress and a denim jacket for a modern romantic look, or with cropped white jeans and a fitted knit tee for elevated everyday styling. The mint tone is unexpectedly versatile - perfect for spring and summer palettes.</p>
<p><strong>Rare piece - limited stock. Fast delivery from Lom\u00e9, Togo.</strong></p>`;

    const longDescFr = `<p>La Basket Numeris Low-Top en Vert Menthe avec des patchs brod\u00e9s floraux d\u00e9licats - une pi\u00e8ce boutique rare qui combine la f\u00e9minit\u00e9 romantique et la construction streetwear premium. Livr\u00e9e avec l'exp\u00e9rience de luxe Numeris compl\u00e8te: sac \u00e0 poussi\u00e8re signature, bo\u00eete de marque et carte d'authenticit\u00e9.</p>
<ul>
<li>Empeigne en toile brod\u00e9e vert menthe avec patchs floraux subtils</li>
<li>Bout et talon en cuir cr\u00e8me premium</li>
<li>Onglet talon Numeris et logo emboss\u00e9</li>
<li>Lacets plats surdimensionn\u00e9s en coton cr\u00e8me</li>
<li>Cupsole blanche chunky dentel\u00e9e avec d\u00e9tails nervur\u00e9s</li>
<li>Col et langue rembourr\u00e9s pour un confort supr\u00eame</li>
<li>Emballage luxe complet: sac \u00e0 poussi\u00e8re + bo\u00eete + carte d'authenticit\u00e9</li>
</ul>
<table class="product-spec-table">
<tr><th>Marque</th><td>Numeris</td></tr>
<tr><th>Mod\u00e8le</th><td>Low-Top \u00c9dition Broderie Florale</td></tr>
<tr><th>Couleur</th><td>Vert Menthe / Cr\u00e8me</td></tr>
<tr><th>Mati\u00e8re</th><td>Toile brod\u00e9e + cuir premium</td></tr>
<tr><th>D\u00e9tails</th><td>Broderie florale d\u00e9licate, emballage luxe</td></tr>
<tr><th>Semelle</th><td>Cupsole blanche chunky dentel\u00e9e</td></tr>
<tr><th>Fermeture</th><td>Lacets plats surdimensionn\u00e9s</td></tr>
<tr><th>Style</th><td>Luxe boutique / Streetwear f\u00e9minin</td></tr>
<tr><th>Tailles</th><td>40-45 EU</td></tr>
<tr><th>Exp\u00e9di\u00e9 de</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Inclus</th><td>Bo\u00eete d'origine, sac \u00e0 poussi\u00e8re, carte d'authenticit\u00e9</td></tr>
</table>
<p>Ces baskets sont pour la cliente qui appr\u00e9cie les d\u00e9tails d\u00e9licats - les petites broderies florales, la douceur du vert menthe, le contraste net du cuir cr\u00e8me contre la semelle blanche chunky. Portez-les avec une robe midi fluide et une veste en jean pour un look romantique moderne, ou avec un jean blanc court et un tee-shirt ajust\u00e9 pour un style quotidien \u00e9lev\u00e9. Le ton menthe est \u00e9tonnamment polyvalent - parfait pour les palettes printemps et \u00e9t\u00e9.</p>
<p><strong>Pi\u00e8ce rare - stock limit\u00e9. Livraison rapide depuis Lom\u00e9, Togo.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Numeris Low-Top - Mint Green Floral Embroidered",
      nameFr: "Basket Numeris Low-Top - Vert Menthe Broderie Florale",
      slug: slugEn,
      slugFr: slugFr,
      description: "Rare Numeris Low-Top in Mint Green with delicate floral embroidered patches. Complete with dust bag, box, and authenticity card.",
      descriptionFr: "Basket Numeris Low-Top rare en Vert Menthe avec patchs brod\u00e9s floraux d\u00e9licats. Compl\u00e8te avec sac \u00e0 poussi\u00e8re, bo\u00eete et carte d'authenticit\u00e9.",
      shortDescription: "Numeris Low-Top in mint green with floral embroidery. Cream leather details, chunky sole, full luxury packaging. Sizes 40-45. Ships from Lom\u00e9.",
      shortDescriptionFr: "Basket Numeris Low-Top en vert menthe avec broderie florale. D\u00e9tails cuir cr\u00e8me, semelle chunky, emballage luxe complet. Tailles 40-45. Exp\u00e9di\u00e9 de Lom\u00e9.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: costNgn.toString(),
      supplierPrice: costFcfa.toString(),
      supplierCurrency: "XOF",
      category: "sneakers",
      brand: "Numeris",
      sizes: sizes,
      colors: colors,
      imageUrl: imageUrl,
      images: images,
      stock: 15,
      featured: true,
      active: true,
      material: "Embroidered canvas + premium cream leather",
      sku: "NDZ-NUM-LTF-MG02",
      tags: tagsEn,
      tagsFr: tagsFr,
      seoTitle: "Numeris Low-Top Mint Green Floral Embroidered Luxury | New Deal Zone",
      seoTitleFr: "Basket Numeris Low-Top Vert Menthe Broderie Florale | New Deal Zone",
      metaDescription: "Shop rare Numeris Low-Top in Mint Green with floral embroidery. Cream leather, luxury packaging with dust bag and authenticity card. Sizes 40-45. Fast delivery from Lom\u00e9.",
      metaDescriptionFr: "Basket Numeris Low-Top rare en Vert Menthe avec broderie florale. Cuir cr\u00e8me, emballage luxe avec sac \u00e0 poussi\u00e8re et carte d'authenticit\u00e9. Tailles 40-45. Livraison rapide depuis Lom\u00e9.",
      focusKeyphrase: "numeris mint green floral sneaker",
      focusKeyphraseFr: "basket numeris vert menthe brod\u00e9e",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slugEn}`,
      originCountry: "TG",
      originCity: "Lom\u00e9",
    }).returning();

    const product = inserted[0];
    if (!product) throw new Error("Insert failed");

    const reviewData = [
      { name: "Awa Diagne",       daysAgo: 2,   rating: 5, en: "OBSESSED. The mint green is dreamy and the tiny floral embroidery is so delicate and beautiful. Feels like a real designer piece. Came with the full luxury packaging.", fr: "OBSED\u00c9E. Le vert menthe est de r\u00eave et la petite broderie florale est si d\u00e9licate et belle. On dirait une vraie pi\u00e8ce de designer. Livr\u00e9e avec l'emballage luxe complet.", verified: true },
      { name: "Elizabeth Chen",   daysAgo: 15,  rating: 5, en: "This is my new favorite sneaker! The color palette is perfect for spring and the embroidery adds so much character. Comfortable enough to wear all day long.", fr: "C'est ma nouvelle basket pr\u00e9f\u00e9r\u00e9e ! La palette de couleurs est parfaite pour le printemps et la broderie ajoute tellement de caract\u00e8re. Assez confortables pour porter toute la journ\u00e9e.", verified: true },
      { name: "Ngozi Adichie",    daysAgo: 38,  rating: 5, en: "Bought as a gift for my sister and she absolutely loves them. The packaging alone made her cry - dust bag, box, authenticity card, all beautifully done. Quality is superb.", fr: "Achet\u00e9es en cadeau pour ma s\u0153ur et elle les adore. L'emballage seul l'a fait pleurer - sac \u00e0 poussi\u00e8re, bo\u00eete, carte d'authenticit\u00e9, tout est magnifiquement fait. Qualit\u00e9 superbe.", verified: true },
      { name: "Claire Moreau",    daysAgo: 66,  rating: 4, en: "Gorgeous shoes and the mint color is exactly as pictured. Only small concern is the embroidered details need careful cleaning - use a soft brush only. Otherwise perfect.", fr: "Superbes chaussures et la couleur menthe est exactement comme sur les photos. Petit souci, les d\u00e9tails brod\u00e9s n\u00e9cessitent un nettoyage soigneux - utilisez uniquement une brosse douce. Sinon parfait.", verified: false },
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
      message: "Numeris Mint Green Floral seeded successfully",
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