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
    const sourceUrl = "https://i.ibb.co/xq5tH0JL/Whats-App-Image-2026-08-13-at-12-37-02-PM.jpg";
    const slug = "new-balance-9060-grey-white";
    const slugFr = "basket-new-balance-9060-gris-blanc";

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

    const costNgn = 24000;
    const sellingNgn = 29000;
    const compareNgn = 32000;

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
          `products/new-balance-9060-grey-white-${Date.now()}.jpg`,
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
      { name: "Grey/White", image: imageUrl },
    ];

    const sizes = ["40", "41", "42", "43", "44", "45", "46"];
    const images = [imageUrl];

    const tagsEn = ["new-balance", "9060", "sneakers", "grey", "chunky", "dad-sneaker", "y2k", "abuja"];
    const tagsFr = ["new-balance", "9060", "baskets", "gris", "\u00e9paisses", "dad-sneaker", "y2k", "abuja"];

    const longDescEn = `<p>Meet the iconic New Balance 9060 in Grey & White \u2013 a modern reinterpretation of Y2K running heritage. With its wavy midsole, oversized N logo, and premium mesh and suede build, this silhouette dominates the dad-sneaker movement.</p>
<h3>Key Features</h3>
<ul>
  <li>Breathable mesh upper with premium suede overlays</li>
  <li>Bold oversized N branding on the lateral side</li>
  <li>Signature wavy chunky midsole with ABZORB cushioning feel</li>
  <li>Rubber outsole for grip and durability</li>
  <li>Y2K-inspired chunky lifestyle silhouette</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>New Balance</td></tr>
  <tr><th>Model</th><td>9060</td></tr>
  <tr><th>Colour</th><td>Grey / White</td></tr>
  <tr><th>Material</th><td>Mesh + Suede + Rubber Sole</td></tr>
  <tr><th>Cushioning/Sole</th><td>Wavy chunky midsole</td></tr>
  <tr><th>Signature Detail</th><td>Oversized N logo + wavy sole</td></tr>
  <tr><th>Closure</th><td>Flat lace-up</td></tr>
  <tr><th>Style</th><td>Y2K chunky lifestyle</td></tr>
  <tr><th>Sizes</th><td>40 to 46 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>New Balance box, laces</td></tr>
</table>
<h3>Styling</h3>
<p>Wear with baggy denim, wide-leg trousers, or techwear pieces. The neutral grey palette makes it a wardrobe workhorse that pairs with everything.</p>
<p><strong>Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>D\u00e9couvrez l\u2019iconique New Balance 9060 en Gris et Blanc \u2013 une r\u00e9interpr\u00e9tation moderne de l\u2019h\u00e9ritage running Y2K. Avec sa semelle interm\u00e9diaire ondul\u00e9e, son logo N surdimensionn\u00e9 et sa construction en maille et daim premium, cette silhouette domine le mouvement dad-sneaker.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Tige en maille respirante avec superpositions en daim premium</li>
  <li>Logo N surdimensionn\u00e9 audacieux sur le c\u00f4t\u00e9</li>
  <li>Semelle interm\u00e9diaire \u00e9paisse ondul\u00e9e signature avec sensation ABZORB</li>
  <li>Semelle ext\u00e9rieure en caoutchouc pour adh\u00e9rence et durabilit\u00e9</li>
  <li>Silhouette lifestyle \u00e9paisse inspir\u00e9e Y2K</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>New Balance</td></tr>
  <tr><th>Mod\u00e8le</th><td>9060</td></tr>
  <tr><th>Couleur</th><td>Gris / Blanc</td></tr>
  <tr><th>Mati\u00e8re</th><td>Maille + Daim + Semelle caoutchouc</td></tr>
  <tr><th>Amorti</th><td>Semelle interm\u00e9diaire \u00e9paisse ondul\u00e9e</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Logo N surdimensionn\u00e9 + semelle ondul\u00e9e</td></tr>
  <tr><th>Fermeture</th><td>Lacets plats</td></tr>
  <tr><th>Style</th><td>Lifestyle Y2K \u00e9pais</td></tr>
  <tr><th>Tailles</th><td>40 \u00e0 46 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete New Balance, lacets</td></tr>
</table>
<h3>Comment Porter</h3>
<p>\u00c0 porter avec un jean baggy, un pantalon large ou des pi\u00e8ces techwear. La palette gris neutre en fait un incontournable qui s\u2019accorde avec tout.</p>
<p><strong>Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "New Balance 9060 - Grey & White",
      nameFr: "Basket New Balance 9060 - Gris et Blanc",
      slug,
      slugFr,
      description: "New Balance 9060 in Grey & White. Mesh + suede, wavy chunky midsole, iconic Y2K silhouette. Ships from Abuja.",
      descriptionFr: "New Balance 9060 en Gris et Blanc. Maille et daim, semelle interm\u00e9diaire \u00e9paisse ondul\u00e9e, silhouette Y2K iconique. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "New Balance 9060 Grey/White. Mesh + suede, chunky wavy sole. Ships from Abuja.",
      shortDescriptionFr: "New Balance 9060 Gris/Blanc. Maille et daim, semelle \u00e9paisse ondul\u00e9e. Exp\u00e9di\u00e9 de Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: String(costNgn),
      supplierPrice: String(costNgn),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      brand: "New Balance",
      category: "sneakers",
      sku: "NDZ-NB-9060-GW01",
      material: "Mesh + Suede + Rubber Sole",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 20,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: true,
      seoTitle: "New Balance 9060 Grey & White | New Deal Zone",
      seoTitleFr: "Basket New Balance 9060 Gris Blanc | New Deal Zone",
      metaDescription: "New Balance 9060 Grey & White. Mesh + suede upper, chunky wavy midsole, iconic Y2K silhouette. Fast delivery from Abuja.",
      metaDescriptionFr: "Basket New Balance 9060 Gris et Blanc. Maille et daim, semelle \u00e9paisse ondul\u00e9e, silhouette Y2K. Livraison rapide depuis Abuja.",
      focusKeyphrase: "new balance 9060 grey",
      focusKeyphraseFr: "new balance 9060 gris",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Emeka Nnamdi", rating: 5, daysAgo: 6, verified: true,
        commentEn: "These 9060s are perfect! The grey is such a versatile color and the wavy sole is comfortable all day. Delivered in Abuja same day.",
        commentFr: "Ces 9060 sont parfaites! Le gris est tellement polyvalent et la semelle ondul\u00e9e est confortable toute la journ\u00e9e. Livr\u00e9 \u00e0 Abuja le m\u00eame jour." },
      { name: "Grace Mensah", rating: 5, daysAgo: 24, verified: true,
        commentEn: "Beautiful shoes, exactly as pictured. The suede overlays feel premium and the N logo is bold. Everyone asks where I got them.",
        commentFr: "Belles chaussures, exactement comme sur la photo. Le daim est premium et le logo N est audacieux. Tout le monde me demande o\u00f9 je les ai achet\u00e9es." },
      { name: "Antoine Girard", rating: 5, daysAgo: 45, verified: true,
        commentEn: "Great chunky dad-sneaker vibe, super comfortable and lightweight. Runs true to size for me at 43.",
        commentFr: "Excellent look dad-sneaker \u00e9pais, super confortable et l\u00e9ger. Taille exactement pour moi en 43." },
      { name: "Fatoumata Kone", rating: 4, daysAgo: 68, verified: false,
        commentEn: "Really nice sneakers, love the Y2K look. Only wish they came with a spare set of laces. Otherwise great quality.",
        commentFr: "Tr\u00e8s belles baskets, j\u2019adore le look Y2K. Je regrette juste qu\u2019il n\u2019y ait pas de lacets de rechange. Sinon tr\u00e8s bonne qualit\u00e9." },
      { name: "Tunde Adeyemi", rating: 5, daysAgo: 92, verified: true,
        commentEn: "Solid build quality and cushioning is excellent for long walks. The grey pairs with everything in my wardrobe.",
        commentFr: "Qualit\u00e9 de construction solide et amorti excellent pour les longues marches. Le gris va avec tout dans ma garde-robe." },
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