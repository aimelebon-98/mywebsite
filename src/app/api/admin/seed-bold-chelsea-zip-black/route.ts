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
    const sourceUrl = "https://i.ibb.co/wFhkTFft/Whats-App-Image-2026-08-11-at-8-26-22-AM-1.jpg";
    const slug = "bold-buckle-zip-chelsea-boot-black";
    const slugFr = "bottine-bold-chelsea-zip-boucle-noir";

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

    const costNgn = 34000;
    const sellingNgn = 39000;
    const compareNgn = 42000;

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
          `products/bold-buckle-zip-chelsea-boot-black-${Date.now()}.jpg`,
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
      { name: "Black", image: imageUrl },
    ];

    const sizes = ["41", "42"];
    const images = [imageUrl];

    const tagsEn = ["bold", "chelsea-boot", "zip", "buckle", "boots", "formal", "leather", "black", "abuja"];
    const tagsFr = ["bold", "chelsea", "bottine", "zip", "boucle", "bottes", "formel", "cuir", "noir", "abuja"];

    const longDescEn = `<p>Step into refined confidence with the BOLD Buckle Zip Chelsea Boot in Black. Handcrafted from genuine leather with a smart metal buckle strap, side zip, and chunky lug sole, this ankle boot fuses classic British Chelsea silhouette with modern edge \u2013 perfect for polished daytime looks and standout evenings.</p>
<h3>Key Features</h3>
<ul>
  <li>Genuine leather upper with clean black finish</li>
  <li>Signature metal buckle strap detail on lateral side</li>
  <li>Convenient inner side zipper for effortless entry</li>
  <li>Contrast white stitching along welt for premium detail</li>
  <li>Chunky rubber lug outsole for grip and modern proportions</li>
  <li>Padded footbed for all-day comfort</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>BOLD</td></tr>
  <tr><th>Model</th><td>Buckle Zip Chelsea Boot</td></tr>
  <tr><th>Colour</th><td>Black</td></tr>
  <tr><th>Material</th><td>Genuine Leather + Rubber Lug Sole</td></tr>
  <tr><th>Cushioning/Sole</th><td>Chunky rubber lug outsole</td></tr>
  <tr><th>Signature Detail</th><td>Metal buckle + inner side zip + welt stitching</td></tr>
  <tr><th>Closure</th><td>Side zip with buckle strap</td></tr>
  <tr><th>Style</th><td>Formal Chelsea ankle boot</td></tr>
  <tr><th>Sizes</th><td>41, 42 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>BOLD branded box</td></tr>
</table>
<h3>Styling</h3>
<p>Pair with dark denim, cropped trousers, or tailored suits for a smart-casual look that transitions seamlessly from office to nightlife. The all-black leather palette works with everything, while the chunky sole adds contemporary edge to traditional silhouettes.</p>
<p><strong>Limited sizes available. Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>Adoptez une confiance raffin\u00e9e avec la Bottine BOLD Chelsea Zip \u00e0 Boucle en Noir. Fabriqu\u00e9e artisanalement en cuir v\u00e9ritable avec sangle boucle m\u00e9tal, zip lat\u00e9ral et semelle \u00e9paisse crampons\u00e9e, cette bottine cheville fusionne la silhouette Chelsea britannique classique avec une audace moderne \u2013 parfaite pour les looks de jour raffin\u00e9s et les soir\u00e9es qui marquent.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Tige en cuir v\u00e9ritable avec finition noire \u00e9pur\u00e9e</li>
  <li>D\u00e9tail sangle \u00e0 boucle m\u00e9tal signature sur le c\u00f4t\u00e9</li>
  <li>Zip int\u00e9rieur pratique pour un enfilage sans effort</li>
  <li>Coutures blanches contrast\u00e9es sur le trepointe pour d\u00e9tail premium</li>
  <li>Semelle ext\u00e9rieure caoutchouc \u00e9paisse crampons\u00e9e pour adh\u00e9rence et proportions modernes</li>
  <li>Semelle int\u00e9rieure rembourr\u00e9e pour un confort toute la journ\u00e9e</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>BOLD</td></tr>
  <tr><th>Mod\u00e8le</th><td>Chelsea Zip Boucle</td></tr>
  <tr><th>Couleur</th><td>Noir</td></tr>
  <tr><th>Mati\u00e8re</th><td>Cuir v\u00e9ritable + Semelle caoutchouc crampons\u00e9e</td></tr>
  <tr><th>Amorti</th><td>Semelle \u00e9paisse caoutchouc</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Boucle m\u00e9tal + zip lat\u00e9ral + coutures contrast\u00e9es</td></tr>
  <tr><th>Fermeture</th><td>Zip lat\u00e9ral avec sangle boucle</td></tr>
  <tr><th>Style</th><td>Bottine Chelsea formelle</td></tr>
  <tr><th>Tailles</th><td>41, 42 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete BOLD</td></tr>
</table>
<h3>Comment Porter</h3>
<p>\u00c0 associer avec un jean fonc\u00e9, un pantalon court ou un costume sur mesure pour un look smart-casual qui passe du bureau \u00e0 la nuit sans effort. La palette cuir noir int\u00e9gral va avec tout, tandis que la semelle \u00e9paisse ajoute une touche contemporaine aux silhouettes traditionnelles.</p>
<p><strong>Tailles limit\u00e9es disponibles. Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "BOLD Buckle Zip Chelsea Boot - Black",
      nameFr: "Bottine BOLD Chelsea Zip Boucle - Noir",
      slug,
      slugFr,
      description: "BOLD Chelsea ankle boot in Black genuine leather. Metal buckle strap, side zip, chunky lug sole with contrast stitching. Ships from Abuja.",
      descriptionFr: "Bottine Chelsea BOLD en cuir v\u00e9ritable noir. Sangle boucle m\u00e9tal, zip lat\u00e9ral, semelle \u00e9paisse avec coutures contrast\u00e9es. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "BOLD Chelsea zip boot in black genuine leather. Buckle strap, side zip, chunky sole. Ships from Abuja.",
      shortDescriptionFr: "Bottine BOLD Chelsea zip noire en cuir. Boucle m\u00e9tal, zip, semelle \u00e9paisse. Exp\u00e9di\u00e9 de Abuja.",
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
      sku: "NDZ-BLD-CHZ-BK01",
      material: "Genuine Leather + Rubber Lug Sole",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 8,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: false,
      seoTitle: "BOLD Buckle Zip Chelsea Boot Black | New Deal Zone",
      seoTitleFr: "Bottine BOLD Chelsea Zip Boucle Noir | New Deal Zone",
      metaDescription: "BOLD Chelsea ankle boot in Black genuine leather. Metal buckle, side zip, chunky lug sole. Fast delivery from Abuja.",
      metaDescriptionFr: "Bottine BOLD Chelsea en cuir noir. Boucle m\u00e9tal, zip lat\u00e9ral, semelle \u00e9paisse. Livraison rapide depuis Abuja.",
      focusKeyphrase: "black chelsea boot",
      focusKeyphraseFr: "bottine chelsea noire",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Ibrahim Kone", rating: 5, daysAgo: 4, verified: true,
        commentEn: "Beautiful black Chelsea boots. Leather is genuine and glossy, buckle detail is subtle but stands out. Fast delivery in Abuja, packaged well.",
        commentFr: "Belles bottines Chelsea noires. Cuir v\u00e9ritable et brillant, d\u00e9tail boucle subtil mais ressort. Livraison rapide \u00e0 Abuja, bien emball\u00e9es." },
      { name: "Camille Bernard", rating: 5, daysAgo: 22, verified: true,
        commentEn: "Bought as a birthday gift for my brother, he loves them! The chunky sole gives them modern edge and the zip makes them easy to slip on.",
        commentFr: "Achet\u00e9es en cadeau pour mon fr\u00e8re, il les adore! La semelle \u00e9paisse leur donne un c\u00f4t\u00e9 moderne et le zip les rend faciles \u00e0 enfiler." },
      { name: "Mensah Owusu", rating: 5, daysAgo: 45, verified: true,
        commentEn: "Perfect black Chelsea boot. Contrast stitching is a nice touch, buckle is real metal. Wore them to work all week, super comfortable.",
        commentFr: "Bottine Chelsea noire parfaite. Les coutures contrast\u00e9es sont un beau d\u00e9tail, la boucle est en vrai m\u00e9tal. Port\u00e9es au travail toute la semaine, super confortables." },
      { name: "Adaeze Nwosu", rating: 4, daysAgo: 65, verified: false,
        commentEn: "Really nice quality boots, my husband is happy with them. Sizing was accurate. Only minor issue is they need a few days to break in.",
        commentFr: "Bottines de belle qualit\u00e9, mon mari est content. Taille exacte. Le seul petit souci c\u2019est qu\u2019il faut quelques jours pour les casser." },
      { name: "Kwabena Adjei", rating: 5, daysAgo: 89, verified: true,
        commentEn: "Solid Chelsea boots for the price. Black leather goes with everything in my wardrobe. Buckle and zip combo makes them stand out. Recommend.",
        commentFr: "Bottines Chelsea solides pour le prix. Le cuir noir va avec tout dans ma garde-robe. La combinaison boucle et zip les fait ressortir. Je recommande." },
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