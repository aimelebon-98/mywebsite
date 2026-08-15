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
    const sourceUrl = "https://i.ibb.co/6RppMH8C/Whats-App-Image-2026-08-11-at-8-26-34-AM.jpg";
    const slug = "ferragamo-gancini-croc-loafer";
    const slugFr = "mocassin-ferragamo-gancini-croco";

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

    const costNgn = 36000;
    const sellingNgn = 42000;
    const compareNgn = 47000;

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
          `products/ferragamo-gancini-croc-loafer-${Date.now()}.jpg`,
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
      { name: "Brown", image: imageUrl },
    ];

    const sizes = ["41", "42", "43", "44", "45"];
    const images = [imageUrl];

    const tagsEn = ["ferragamo", "salvatore-ferragamo", "gancini", "loafer", "penny-loafer", "croc-embossed", "formal", "leather", "designer", "luxury", "italian", "abuja"];
    const tagsFr = ["ferragamo", "salvatore-ferragamo", "gancini", "mocassin", "penny", "croco", "formel", "cuir", "designer", "luxe", "italien", "abuja"];

    const longDescEn = `<p>Step into Italian luxury heritage with the Salvatore Ferragamo Gancini Croc-Embossed Loafer \u2013 available in both classic Black and rich Brown. Handcrafted with premium croc-embossed leather and finished with the iconic silver Gancini hook hardware, this timeless penny loafer is the epitome of refined designer craftsmanship.</p>
<h3>Key Features</h3>
<ul>
  <li>Premium croc-embossed genuine leather upper</li>
  <li>Signature silver-tone Ferragamo Gancini hook on penny strap</li>
  <li>Classic slim penny loafer silhouette</li>
  <li>Low stacked leather heel for polished profile</li>
  <li>Genuine leather sole with rubber grip inserts</li>
  <li>Cushioned leather-lined footbed with Ferragamo branding</li>
  <li>Available in Black and Brown colorways</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>Salvatore Ferragamo</td></tr>
  <tr><th>Model</th><td>Gancini Croc-Embossed Penny Loafer</td></tr>
  <tr><th>Colour</th><td>Black, Brown</td></tr>
  <tr><th>Material</th><td>Croc-Embossed Leather + Leather Sole</td></tr>
  <tr><th>Cushioning/Sole</th><td>Low stacked leather heel</td></tr>
  <tr><th>Signature Detail</th><td>Silver Gancini hook + croc texture</td></tr>
  <tr><th>Closure</th><td>Slip-on penny loafer</td></tr>
  <tr><th>Style</th><td>Luxury Italian dress loafer</td></tr>
  <tr><th>Sizes</th><td>41 to 45 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>Ferragamo branded box, dust bag</td></tr>
</table>
<h3>Styling</h3>
<p>Pair with slim tailored suits, cropped chinos, or fine wool trousers for effortless Italian gentleman style. The Black works with charcoal, navy, and monochrome business fits, while the Brown pairs beautifully with cream, olive, and warm-toned tailoring. Ferragamo Gancini hardware signals refined designer taste.</p>
<p><strong>Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>Entrez dans l\u2019h\u00e9ritage du luxe italien avec le Mocassin Salvatore Ferragamo Gancini Croco \u2013 disponible en Noir classique et Marron riche. Fabriqu\u00e9 artisanalement en cuir croco premium et fini avec le crochet Gancini argent\u00e9 iconique, ce mocassin penny intemporel est l\u2019incarnation du savoir-faire designer raffin\u00e9.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Tige en cuir v\u00e9ritable croco estampill\u00e9 premium</li>
  <li>Crochet Gancini Ferragamo argent\u00e9 signature sur la bride penny</li>
  <li>Silhouette mocassin penny mince classique</li>
  <li>Talon bas empil\u00e9 en cuir pour un profil raffin\u00e9</li>
  <li>Semelle en cuir v\u00e9ritable avec inserts caoutchouc antid\u00e9rapants</li>
  <li>Semelle int\u00e9rieure doubl\u00e9e cuir rembourr\u00e9e avec branding Ferragamo</li>
  <li>Disponible en Noir et Marron</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>Salvatore Ferragamo</td></tr>
  <tr><th>Mod\u00e8le</th><td>Mocassin Gancini Penny Croco</td></tr>
  <tr><th>Couleur</th><td>Noir, Marron</td></tr>
  <tr><th>Mati\u00e8re</th><td>Cuir croco estampill\u00e9 + Semelle cuir</td></tr>
  <tr><th>Amorti</th><td>Talon bas empil\u00e9 cuir</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Crochet Gancini argent + texture croco</td></tr>
  <tr><th>Fermeture</th><td>Mocassin penny \u00e0 enfiler</td></tr>
  <tr><th>Style</th><td>Mocassin habill\u00e9 italien de luxe</td></tr>
  <tr><th>Tailles</th><td>41 \u00e0 45 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete Ferragamo, sac \u00e0 poussi\u00e8re</td></tr>
</table>
<h3>Comment Porter</h3>
<p>\u00c0 associer avec un costume slim sur mesure, un chino court ou un pantalon en laine fine pour un style gentleman italien sans effort. Le Noir va avec les tenues business anthracite, marine et monochrome, tandis que le Marron s\u2019accorde magnifiquement avec le tailoring cr\u00e8me, olive et tons chauds. La ferrure Gancini Ferragamo signale un go\u00fbt designer raffin\u00e9.</p>
<p><strong>Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Salvatore Ferragamo Gancini Croc Loafer - Black & Brown",
      nameFr: "Mocassin Salvatore Ferragamo Gancini Croco - Noir et Marron",
      slug,
      slugFr,
      description: "Salvatore Ferragamo Gancini Croc-Embossed Penny Loafer. Available in Black and Brown. Silver Gancini hook, croc leather, Italian craftsmanship. Ships from Abuja.",
      descriptionFr: "Mocassin Salvatore Ferragamo Gancini Penny Croco. Disponible en Noir et Marron. Crochet Gancini argent, cuir croco, savoir-faire italien. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "Ferragamo Gancini croc penny loafer. Silver Gancini hook, croc leather. Black + Brown. Ships from Abuja.",
      shortDescriptionFr: "Mocassin Ferragamo Gancini croco. Crochet argent, cuir croco. Noir et Marron. Exp\u00e9di\u00e9 de Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: String(costNgn),
      supplierPrice: String(costNgn),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      brand: "Salvatore Ferragamo",
      category: "formal",
      sku: "NDZ-FRG-GNC-BB01",
      material: "Croc-Embossed Leather + Leather Sole",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 15,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: true,
      seoTitle: "Ferragamo Gancini Croc Loafer Black Brown | New Deal Zone",
      seoTitleFr: "Mocassin Ferragamo Gancini Croco Noir Marron | New Deal Zone",
      metaDescription: "Salvatore Ferragamo Gancini Croc-Embossed Penny Loafer. Silver Gancini hook, croc leather, Italian craftsmanship. Black + Brown. Fast delivery from Abuja.",
      metaDescriptionFr: "Mocassin Salvatore Ferragamo Gancini Croco. Crochet Gancini argent, cuir croco, savoir-faire italien. Noir et Marron. Livraison rapide depuis Abuja.",
      focusKeyphrase: "ferragamo gancini loafer",
      focusKeyphraseFr: "mocassin ferragamo gancini",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Chioma Adeboye", rating: 5, daysAgo: 5, verified: true,
        commentEn: "Bought the black Ferragamos for my husband. He loves them! Silver Gancini hook is elegant and the croc texture adds premium feel. Fast Abuja delivery.",
        commentFr: "Achet\u00e9 les Ferragamo noirs pour mon mari. Il les adore! Le crochet Gancini argent\u00e9 est \u00e9l\u00e9gant et la texture croco donne un aspect premium. Livraison rapide Abuja." },
      { name: "Andre Mensah", rating: 5, daysAgo: 22, verified: true,
        commentEn: "Got the brown version - stunning! Perfect with tan chinos and navy blazer. Leather is genuine quality, Gancini hardware is real metal. Recommend.",
        commentFr: "J\u2019ai pris le marron - magnifique! Parfait avec chino beige et blazer marine. Cuir de qualit\u00e9 v\u00e9ritable, ferrure Gancini en vrai m\u00e9tal. Je recommande." },
      { name: "Adaeze Okonkwo", rating: 5, daysAgo: 44, verified: true,
        commentEn: "Bought for my brother\u2019s corporate promotion. Classic Ferragamo look, timeless design. Croc embossing is subtle but adds so much character.",
        commentFr: "Achet\u00e9 pour la promotion de mon fr\u00e8re. Look Ferragamo classique, design intemporel. L\u2019estampage croco est subtil mais ajoute tellement de caract\u00e8re." },
      { name: "Isabelle Bernard", rating: 4, daysAgo: 66, verified: false,
        commentEn: "Beautiful Italian loafers. Bought the black pair, sizing was accurate. Only issue is they took about a week to fully break in. Now super comfy.",
        commentFr: "Beaux mocassins italiens. Achet\u00e9 la paire noire, taille exacte. Le seul souci c\u2019est qu\u2019il a fallu environ une semaine pour bien les casser. Maintenant super confortables." },
      { name: "Kwabena Owusu", rating: 5, daysAgo: 89, verified: true,
        commentEn: "Timeless Ferragamo craftsmanship. Wore them to a wedding and got compliments all night. Both colors are stunning, hard to pick a favorite.",
        commentFr: "Savoir-faire Ferragamo intemporel. Port\u00e9s \u00e0 un mariage et compliments toute la soir\u00e9e. Les deux couleurs sont magnifiques, dur de choisir une favorite." },
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