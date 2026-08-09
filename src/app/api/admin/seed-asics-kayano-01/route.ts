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

    const slugEn = "asics-gel-kayano-legacy-black-silver";
    const slugFr = "basket-asics-gel-kayano-legacy-noir-argent";

    const existing = await db.select().from(products)
      .where(or(eq(products.slug, slugEn), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
      await db.delete(products).where(eq(products.id, p.id));
    }

    const sourceUrl = "https://i.ibb.co/1YpySLSZ/Whats-App-Image-2026-08-08-at-7-06-28-PM-1.jpg";
    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/asics-gel-kayano-legacy-black-silver-y2k-running-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) { console.error("Blob upload failed:", e); }

    const sizes = JSON.stringify(["40","41","42","43","44","45","46"]);
    const colors = JSON.stringify([{ name: "Black/Silver", image: imageUrl }]);
    const images = JSON.stringify([imageUrl]);
    const tagsEn = JSON.stringify(["asics","gel-kayano","y2k","running","dad-shoe","silver","black","streetwear"]);
    const tagsFr = JSON.stringify(["asics","gel-kayano","y2k","running","dad-shoe","argent","noir","streetwear"]);

    const longDescEn = `<p>The iconic ASICS Gel-Kayano Legacy returns in a premium Black/Silver colorway - the Y2K running silhouette that took over streetwear. Featuring signature GEL cushioning technology, retro-futuristic metallic overlays, and the classic Kayano stability system that made this shoe legendary in the early 2000s.</p>
<ul>
<li>Premium mesh upper with metallic silver TPU overlays</li>
<li>Signature ASICS GEL cushioning in heel for superior shock absorption</li>
<li>DUOMAX support system for enhanced stability</li>
<li>Chunky retro sole with modern tread pattern</li>
<li>Padded collar and tongue for all-day comfort</li>
<li>Ships with original ASICS box</li>
</ul>
<table class="product-spec-table">
<tr><th>Brand</th><td>ASICS</td></tr>
<tr><th>Model</th><td>Gel-Kayano Legacy</td></tr>
<tr><th>Colour</th><td>Black / Pure Silver</td></tr>
<tr><th>Material</th><td>Mesh + synthetic leather + metallic TPU</td></tr>
<tr><th>Cushioning</th><td>GEL technology</td></tr>
<tr><th>Support</th><td>DUOMAX stability system</td></tr>
<tr><th>Closure</th><td>Lace-up</td></tr>
<tr><th>Style</th><td>Y2K running / Retro streetwear</td></tr>
<tr><th>Sizes</th><td>40-46 EU</td></tr>
<tr><th>Ships from</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Includes</th><td>Original ASICS box</td></tr>
</table>
<p>Perfect for both athletic wear and elevated casual streetwear looks. Pair with cargo pants and a graphic tee for that authentic Y2K aesthetic, or with joggers and an oversized hoodie for modern dad-shoe styling. The metallic silver details catch light beautifully - definitely a head-turner.</p>
<p><strong>Fast delivery from Lom\u00e9, Togo. Order today before this drop is gone.</strong></p>`;

    const longDescFr = `<p>L'iconique ASICS Gel-Kayano Legacy revient dans un coloris Noir/Argent premium - la silhouette running Y2K qui a envahi le streetwear. Dot\u00e9e de la technologie d'amorti GEL signature, de superpositions m\u00e9talliques r\u00e9tro-futuristes, et du syst\u00e8me de stabilit\u00e9 Kayano classique qui a rendu cette chaussure l\u00e9gendaire au d\u00e9but des ann\u00e9es 2000.</p>
<ul>
<li>Empeigne en maille premium avec superpositions TPU argent m\u00e9tallique</li>
<li>Amorti ASICS GEL signature au talon pour une absorption des chocs sup\u00e9rieure</li>
<li>Syst\u00e8me de support DUOMAX pour une stabilit\u00e9 accrue</li>
<li>Semelle chunky r\u00e9tro avec motif moderne</li>
<li>Col et langue rembourr\u00e9s pour un confort toute la journ\u00e9e</li>
<li>Livr\u00e9e avec la bo\u00eete ASICS d'origine</li>
</ul>
<table class="product-spec-table">
<tr><th>Marque</th><td>ASICS</td></tr>
<tr><th>Mod\u00e8le</th><td>Gel-Kayano Legacy</td></tr>
<tr><th>Couleur</th><td>Noir / Argent Pur</td></tr>
<tr><th>Mati\u00e8re</th><td>Maille + cuir synth\u00e9tique + TPU m\u00e9tallique</td></tr>
<tr><th>Amorti</th><td>Technologie GEL</td></tr>
<tr><th>Support</th><td>Syst\u00e8me de stabilit\u00e9 DUOMAX</td></tr>
<tr><th>Fermeture</th><td>Lacets</td></tr>
<tr><th>Style</th><td>Y2K running / Streetwear r\u00e9tro</td></tr>
<tr><th>Tailles</th><td>40-46 EU</td></tr>
<tr><th>Exp\u00e9di\u00e9 de</th><td>Lom\u00e9, Togo</td></tr>
<tr><th>Inclus</th><td>Bo\u00eete ASICS d'origine</td></tr>
</table>
<p>Parfaite pour la tenue athl\u00e9tique et les looks streetwear casual \u00e9lev\u00e9s. Portez-la avec un cargo et un tee-shirt graphique pour cette esth\u00e9tique Y2K authentique, ou avec un jogger et un hoodie oversize pour un style dad-shoe moderne. Les d\u00e9tails argent m\u00e9tallique captent magnifiquement la lumi\u00e8re - un vrai regard-tourneur.</p>
<p><strong>Livraison rapide depuis Lom\u00e9, Togo. Commandez avant \u00e9puisement.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "ASICS Gel-Kayano Legacy - Black/Silver",
      nameFr: "Basket ASICS Gel-Kayano Legacy - Noir/Argent",
      slug: slugEn,
      slugFr: slugFr,
      description: "Iconic Y2K ASICS Gel-Kayano Legacy in Black/Silver. GEL cushioning, retro-futuristic metallic overlays, chunky dad-shoe sole.",
      descriptionFr: "L'iconique ASICS Gel-Kayano Legacy Y2K en Noir/Argent. Amorti GEL, superpositions m\u00e9talliques r\u00e9tro-futuristes, semelle chunky dad-shoe.",
      shortDescription: "ASICS Gel-Kayano Legacy in Black/Silver - the Y2K running shoe that owns streetwear. GEL cushion. Sizes 40-46. Ships from Lom\u00e9.",
      shortDescriptionFr: "ASICS Gel-Kayano Legacy en Noir/Argent - la chaussure running Y2K qui r\u00e8gne sur le streetwear. Amorti GEL. Tailles 40-46. Exp\u00e9di\u00e9 de Lom\u00e9.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: costNgn.toString(),
      supplierPrice: costFcfa.toString(),
      supplierCurrency: "XOF",
      category: "running",
      brand: "ASICS",
      sizes: sizes,
      colors: colors,
      imageUrl: imageUrl,
      images: images,
      stock: 25,
      featured: false,
      active: true,
      material: "Mesh + synthetic leather + metallic TPU",
      sku: "NDZ-ASX-KAY-BS01",
      tags: tagsEn,
      tagsFr: tagsFr,
      seoTitle: "ASICS Gel-Kayano Legacy Black Silver Y2K | New Deal Zone",
      seoTitleFr: "Basket ASICS Gel-Kayano Legacy Noir Argent Y2K | New Deal Zone",
      metaDescription: "Shop ASICS Gel-Kayano Legacy Black/Silver Y2K running shoe. Iconic GEL cushioning, metallic overlays. Sizes 40-46. Fast delivery from Lom\u00e9.",
      metaDescriptionFr: "Basket ASICS Gel-Kayano Legacy Y2K Noir/Argent. Amorti GEL iconique, superpositions m\u00e9talliques. Tailles 40-46. Livraison rapide depuis Lom\u00e9.",
      focusKeyphrase: "asics gel-kayano legacy",
      focusKeyphraseFr: "basket asics gel-kayano",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slugEn}`,
      originCountry: "TG",
      originCity: "Lom\u00e9",
    }).returning();

    const product = inserted[0];
    if (!product) throw new Error("Insert failed");

    const reviewData = [
      { name: "Marcus Nkosi",    daysAgo: 7,   rating: 5, en: "The Y2K vibe on these is unmatched. Silver overlays catch light perfectly, GEL cushion feels amazing all day. Copped these before they sold out.", fr: "Le vibe Y2K de ces baskets est incomparable. Les superpositions argent captent parfaitement la lumi\u00e8re, l'amorti GEL est incroyable toute la journ\u00e9e. Achet\u00e9es avant \u00e9puisement.", verified: true },
      { name: "Priscilla Owusu", daysAgo: 24,  rating: 5, en: "Perfect chunky retro runner. Fits true to size, super comfortable straight out the box. Been getting compliments everywhere I go with these!", fr: "Parfaite runner r\u00e9tro chunky. Taille juste, super confortable d\u00e8s la sortie de la bo\u00eete. Je re\u00e7ois des compliments partout o\u00f9 je vais avec !", verified: true },
      { name: "Aissatou Diallo", daysAgo: 51,  rating: 5, en: "Been waiting for the Kayano Legacy in this colorway forever. Quality is exactly what you expect from ASICS. Delivery to Lom\u00e9 was fast and packaging was premium.", fr: "J'attendais la Kayano Legacy dans ce coloris depuis toujours. Qualit\u00e9 exactement comme attendue d'ASICS. Livraison rapide \u00e0 Lom\u00e9 et emballage premium.", verified: true },
      { name: "Camille Bernard", daysAgo: 84,  rating: 4, en: "Love the design and the Y2K aesthetic. Only small thing is they run slightly narrow, so consider half size up if you have wide feet. Otherwise perfect.", fr: "J'adore le design et l'esth\u00e9tique Y2K. Petit b\u00e9mol, elles taillent un peu serr\u00e9, donc prendre une demi-taille au-dessus si vous avez les pieds larges. Sinon parfait.", verified: false },
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
      message: "ASICS Gel-Kayano Legacy seeded successfully",
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