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
    const sourceUrl = "https://i.ibb.co/XZDn2R8T/Whats-App-Image-2026-08-11-at-8-26-36-AM-1.jpg";
    const slug = "two-tone-spectator-penny-loafer-burgundy-white";
    const slugFr = "mocassin-spectateur-bicolore-bordeaux-blanc";

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
    const sellingNgn = 45000;
    const compareNgn = 52000;

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
          `products/two-tone-spectator-penny-loafer-burgundy-white-${Date.now()}.jpg`,
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
      { name: "Burgundy/White", image: imageUrl },
    ];

    const sizes = ["41", "42", "43", "44", "45"];
    const images = [imageUrl];

    const tagsEn = ["loafer", "penny-loafer", "spectator", "two-tone", "formal", "leather", "burgundy", "white", "vintage", "dress-shoe", "abuja"];
    const tagsFr = ["mocassin", "penny", "spectateur", "bicolore", "formel", "cuir", "bordeaux", "blanc", "vintage", "chaussure-habill\u00e9e", "abuja"];

    const longDescEn = `<p>Step back into golden-era elegance with the Two-Tone Spectator Penny Loafer in Burgundy & White \u2013 a vintage-inspired dress shoe reimagined for the modern gentleman. Handcrafted from genuine leather with a striking two-tone design, penny keeper strap, and refined slim silhouette, this loafer is a bold statement of timeless sophistication.</p>
<h3>Key Features</h3>
<ul>
  <li>Premium smooth burgundy leather saddle, heel, and tongue</li>
  <li>Contrasting crisp white leather vamp for spectator styling</li>
  <li>Signature burgundy penny keeper strap detail</li>
  <li>Classic slip-on loafer construction</li>
  <li>Low stacked leather heel for polished profile</li>
  <li>Cushioned leather-lined footbed for all-day comfort</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>Prestige</td></tr>
  <tr><th>Model</th><td>Two-Tone Spectator Penny Loafer</td></tr>
  <tr><th>Colour</th><td>Burgundy / White</td></tr>
  <tr><th>Material</th><td>Genuine Leather + Leather Sole</td></tr>
  <tr><th>Cushioning/Sole</th><td>Low stacked leather heel</td></tr>
  <tr><th>Signature Detail</th><td>Two-tone spectator + penny keeper</td></tr>
  <tr><th>Closure</th><td>Slip-on penny loafer</td></tr>
  <tr><th>Style</th><td>Vintage spectator dress loafer</td></tr>
  <tr><th>Sizes</th><td>41 to 45 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>Branded box, shoehorn</td></tr>
</table>
<h3>Styling</h3>
<p>Pair with slim burgundy or navy suits, cream chinos, or tailored wool trousers for classic gentleman looks. The two-tone spectator design pays homage to jazz-era style icons while working seamlessly with modern tailored fits. Perfect for weddings, formal dinners, and standout occasions.</p>
<p><strong>Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>Revenez \u00e0 l\u2019\u00e9l\u00e9gance de l\u2019\u00e2ge d\u2019or avec le Mocassin Spectateur Penny Bicolore en Bordeaux et Blanc \u2013 une chaussure habill\u00e9e vintage repens\u00e9e pour le gentleman moderne. Fabriqu\u00e9 artisanalement en cuir v\u00e9ritable avec un design bicolore saisissant, une bride penny et une silhouette mince raffin\u00e9e, ce mocassin est une d\u00e9claration audacieuse de sophistication intemporelle.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Bride, talon et languette en cuir bordeaux premium lisse</li>
  <li>Empeigne contrast\u00e9e en cuir blanc \u00e9clatant pour le style spectateur</li>
  <li>D\u00e9tail bride penny bordeaux signature</li>
  <li>Construction mocassin \u00e0 enfiler classique</li>
  <li>Talon bas empil\u00e9 en cuir pour un profil raffin\u00e9</li>
  <li>Semelle int\u00e9rieure doubl\u00e9e cuir rembourr\u00e9e pour un confort toute la journ\u00e9e</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>Prestige</td></tr>
  <tr><th>Mod\u00e8le</th><td>Mocassin Spectateur Penny Bicolore</td></tr>
  <tr><th>Couleur</th><td>Bordeaux / Blanc</td></tr>
  <tr><th>Mati\u00e8re</th><td>Cuir v\u00e9ritable + Semelle cuir</td></tr>
  <tr><th>Amorti</th><td>Talon bas empil\u00e9 cuir</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Bicolore spectateur + bride penny</td></tr>
  <tr><th>Fermeture</th><td>Mocassin penny \u00e0 enfiler</td></tr>
  <tr><th>Style</th><td>Mocassin habill\u00e9 spectateur vintage</td></tr>
  <tr><th>Tailles</th><td>41 \u00e0 45 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete de marque, chausse-pied</td></tr>
</table>
<h3>Comment Porter</h3>
<p>\u00c0 associer avec un costume slim bordeaux ou marine, un chino cr\u00e8me ou un pantalon en laine sur mesure pour des looks classiques de gentleman. Le design spectateur bicolore rend hommage aux ic\u00f4nes de style de l\u2019\u00e9poque du jazz tout en s\u2019int\u00e9grant parfaitement aux tenues sur mesure modernes. Parfait pour les mariages, d\u00eeners formels et occasions marquantes.</p>
<p><strong>Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Two-Tone Spectator Penny Loafer - Burgundy & White",
      nameFr: "Mocassin Spectateur Penny Bicolore - Bordeaux et Blanc",
      slug,
      slugFr,
      description: "Two-Tone Spectator Penny Loafer in Burgundy & White. Genuine leather, vintage-inspired spectator design, penny keeper. Ships from Abuja.",
      descriptionFr: "Mocassin Spectateur Penny Bicolore en Bordeaux et Blanc. Cuir v\u00e9ritable, design spectateur vintage, bride penny. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "Two-tone spectator penny loafer in burgundy & white. Genuine leather, vintage dress shoe. Ships from Abuja.",
      shortDescriptionFr: "Mocassin spectateur penny bicolore bordeaux et blanc. Cuir v\u00e9ritable, chaussure habill\u00e9e vintage. Exp\u00e9di\u00e9 de Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: String(costNgn),
      supplierPrice: String(costNgn),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      brand: "Prestige",
      category: "formal",
      sku: "NDZ-PRE-SPC-BW01",
      material: "Genuine Leather + Leather Sole",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 15,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: true,
      seoTitle: "Two-Tone Spectator Penny Loafer Burgundy White | New Deal Zone",
      seoTitleFr: "Mocassin Spectateur Penny Bordeaux Blanc | New Deal Zone",
      metaDescription: "Two-Tone Spectator Penny Loafer in Burgundy & White. Genuine leather, vintage jazz-era design, penny keeper strap. Fast delivery from Abuja.",
      metaDescriptionFr: "Mocassin spectateur penny bicolore bordeaux et blanc. Cuir v\u00e9ritable, design vintage \u00e9poque jazz, bride penny. Livraison rapide depuis Abuja.",
      focusKeyphrase: "two tone spectator loafer",
      focusKeyphraseFr: "mocassin spectateur bicolore",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Bola Adeyinka", rating: 5, daysAgo: 5, verified: true,
        commentEn: "These spectator loafers are stunning! The burgundy and white combo is unique and elegant. Wore them to a wedding, got endless compliments.",
        commentFr: "Ces mocassins spectateurs sont magnifiques! Le combo bordeaux et blanc est unique et \u00e9l\u00e9gant. Port\u00e9s \u00e0 un mariage, compliments sans fin." },
      { name: "Adeboye Ogunlesi", rating: 5, daysAgo: 22, verified: true,
        commentEn: "Vintage gentleman vibes at their finest. Leather quality is exceptional, contrast stitching is clean, and they fit like a glove. Highly recommend.",
        commentFr: "Style vintage gentleman \u00e0 son meilleur. Qualit\u00e9 cuir exceptionnelle, coutures contrast\u00e9es propres, et taille parfaitement. Je recommande." },
      { name: "Kofi Mensah", rating: 5, daysAgo: 44, verified: true,
        commentEn: "Bought for my father\u2019s 60th birthday. He was so happy! The classic penny loafer design with the two-tone finish is timeless. Great quality.",
        commentFr: "Achet\u00e9s pour les 60 ans de mon p\u00e8re. Il \u00e9tait tellement content! Le design penny classique avec la finition bicolore est intemporel. Belle qualit\u00e9." },
      { name: "Sarah Roberts", rating: 4, daysAgo: 66, verified: false,
        commentEn: "Really beautiful loafers. Bought for my husband and he loves the vintage look. Sizing was accurate, only needs a couple days to break in fully.",
        commentFr: "Vraiment beaux mocassins. Achet\u00e9s pour mon mari qui adore le look vintage. Taille exacte, il faut juste quelques jours pour bien les casser." },
      { name: "Amadou Ba", rating: 5, daysAgo: 90, verified: true,
        commentEn: "Standout shoes for formal events. The two-tone spectator design is a conversation starter. Leather is smooth and premium, sole is solid.",
        commentFr: "Chaussures qui ressortent pour les \u00e9v\u00e9nements formels. Le design spectateur bicolore attire l\u2019attention. Cuir lisse et premium, semelle solide." },
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