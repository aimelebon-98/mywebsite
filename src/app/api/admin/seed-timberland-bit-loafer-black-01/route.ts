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
    const ratesRes = await fetch("https://www.newdealzone.com/api/exchange-rates", { cache: "no-store" });
    const ratesData = await ratesRes.json();
    const NGN_RATE = Number(ratesData.rates.NGN) || 1500;
    const XOF_RATE = Number(ratesData.rates.XOF) || 620;

    const costNgn = 28000;
    const sellingNgn = 35000;
    const compareNgn = 42000;

    const costUsd = Math.round((costNgn / NGN_RATE) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / NGN_RATE) * 100) / 100;
    const compareUsd = Math.round((compareNgn / NGN_RATE) * 100) / 100;
    const costNgnSnap = Math.round(costUsd * NGN_RATE);
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 1000) / 10;

    const slug = "timberland-bit-detail-nubuck-loafer-black";
    const slugFr = "mocassin-timberland-mors-nubuck-noir";
    const sourceUrl = "https://i.ibb.co/VYyRK2V7/Whats-App-Image-2026-08-09-at-10-11-08-AM-3.jpg";

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/timberland-bit-detail-nubuck-loafer-black-${Date.now()}.jpg`,
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
    }
    await db.delete(products).where(or(eq(products.slug, slug), eq(products.slugFr, slugFr)));

    const nameEn = "Timberland Bit-Detail Nubuck Loafer - Matte Black";
    const nameFr = "Mocassin Timberland Mors D\u00e9tail Nubuck - Noir Mat";

    const shortDescEn = "Timberland bit-detail loafer in matte black nubuck with signature tree logo tongue tag and dark chain hardware. Lugged tonal sole. Ships from Abuja.";
    const shortDescFr = "Mocassin Timberland d\u00e9tail mors en nubuck noir mat avec \u00e9tiquette langue logo arbre signature et quincaillerie cha\u00eene sombre. Semelle crampons ton sur ton. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>Meet the <strong>Timberland Bit-Detail Nubuck Loafer in Matte Black</strong>. Blending Timberland's outdoor heritage with elevated menswear tailoring, this loafer features a soft matte nubuck upper, an equestrian-inspired bit-and-chain hardware detail, and the brand's signature lugged sole for grip. The tree logo tongue tag confirms the pedigree - a modern classic built for the workweek and beyond.</p>

<h3>Key Features</h3>
<ul>
<li><strong>Premium matte nubuck upper</strong> in deep saturated black</li>
<li><strong>Bit-and-chain hardware</strong> across the vamp for equestrian elegance</li>
<li><strong>Signature Timberland tree logo</strong> tongue tag - the authentic marker</li>
<li><strong>Lugged tonal rubber sole</strong> for grip in any weather</li>
<li><strong>Cushioned insole</strong> for all-day office comfort</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>Timberland</td></tr>
<tr><td><strong>Model</strong></td><td>Bit-Detail Loafer</td></tr>
<tr><td><strong>Colour</strong></td><td>Matte Black</td></tr>
<tr><td><strong>Material</strong></td><td>Nubuck Leather + Rubber Lugged Sole</td></tr>
<tr><td><strong>Cushioning / Sole</strong></td><td>Padded Insole + Lugged Rubber Outsole</td></tr>
<tr><td><strong>Signature Detail</strong></td><td>Bit-and-Chain Hardware + Tree Logo Tongue Tag</td></tr>
<tr><td><strong>Closure</strong></td><td>Slip-On</td></tr>
<tr><td><strong>Style</strong></td><td>Casual Bit Loafer</td></tr>
<tr><td><strong>Sizes</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Ships from</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Includes</strong></td><td>Original Timberland Box</td></tr>
</table>

<h3>How to Style</h3>
<p>Pair with dark denim, chinos, or tailored trousers for a smart-casual look that reads polished without trying too hard. The matte finish means these work in low-light business settings and outdoor weekend fits alike. Wear with no-show socks in warm weather, or with textured merino socks when temperatures drop. Modern menswear essential.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. Heritage craftsmanship, everyday versatility.</p>`;

    const longDescFr = `<p>D\u00e9couvrez le <strong>Mocassin Timberland D\u00e9tail Mors en Nubuck Noir Mat</strong>. M\u00e9langeant l'h\u00e9ritage outdoor de Timberland avec le tailoring menswear \u00e9lev\u00e9, ce mocassin pr\u00e9sente une tige en nubuck mat souple, un d\u00e9tail quincaillerie mors-et-cha\u00eene inspir\u00e9 de l'\u00e9questre, et la semelle crampons signature de la marque pour l'adh\u00e9rence. L'\u00e9tiquette langue avec logo arbre confirme le pedigree - un classique moderne construit pour la semaine de travail et au-del\u00e0.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>Tige en nubuck premium</strong> noir mat profond satur\u00e9</li>
<li><strong>Quincaillerie mors-et-cha\u00eene</strong> sur le cou-de-pied pour une \u00e9l\u00e9gance \u00e9questre</li>
<li><strong>\u00c9tiquette langue logo arbre Timberland signature</strong> - la marque authentique</li>
<li><strong>Semelle en caoutchouc crampons ton sur ton</strong> pour l'adh\u00e9rence par tous les temps</li>
<li><strong>Semelle int\u00e9rieure rembourr\u00e9e</strong> pour un confort de bureau toute la journ\u00e9e</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>Timberland</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>Mocassin D\u00e9tail Mors</td></tr>
<tr><td><strong>Couleur</strong></td><td>Noir Mat</td></tr>
<tr><td><strong>Mati\u00e8re</strong></td><td>Cuir Nubuck + Semelle Caoutchouc Crampons</td></tr>
<tr><td><strong>Amorti</strong></td><td>Semelle Int\u00e9rieure Rembourr\u00e9e + Semelle Ext\u00e9rieure Crampons</td></tr>
<tr><td><strong>D\u00e9tail Signature</strong></td><td>Quincaillerie Mors-et-Cha\u00eene + \u00c9tiquette Logo Arbre</td></tr>
<tr><td><strong>Fermeture</strong></td><td>\u00c0 Enfiler</td></tr>
<tr><td><strong>Style</strong></td><td>Mocassin Mors Casual</td></tr>
<tr><td><strong>Tailles</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Exp\u00e9di\u00e9 de</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Inclus</strong></td><td>Bo\u00eete Timberland Originale</td></tr>
</table>

<h3>Comment le Porter</h3>
<p>Associez avec un jean fonc\u00e9, un chino ou un pantalon taill\u00e9 pour un look smart-casual qui lit poli sans en faire trop. La finition mate signifie que ceux-ci fonctionnent dans les environnements business en lumi\u00e8re tamis\u00e9e et les tenues outdoor de week-end. Portez avec des chaussettes invisibles par temps chaud, ou avec des chaussettes m\u00e9rinos textur\u00e9es quand les temp\u00e9ratures baissent. Essentiel du menswear moderne.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. Savoir-faire h\u00e9ritage, polyvalence quotidienne.</p>`;

    const sizes = ["41","42","43","44","45","46"];
    const colors = [{ name: "Matte Black", image: imageUrl }];
    const tagsEn = ["timberland", "bit loafer", "nubuck loafer", "matte black", "chain detail", "casual loafer", "menswear", "loafers", "abuja"];
    const tagsFr = ["timberland", "mocassin mors", "mocassin nubuck", "noir mat", "d\u00e9tail cha\u00eene", "mocassin casual", "menswear", "mocassins", "abuja"];

    const [product] = await db.insert(products).values({
      name: nameEn,
      nameFr: nameFr,
      slug: slug,
      slugFr: slugFr,
      description: shortDescEn,
      shortDescription: shortDescEn,
      longDescription: longDescEn,
      descriptionFr: shortDescFr,
      shortDescriptionFr: shortDescFr,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: costNgnSnap.toString(),
      supplierPrice: costNgn.toString(),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      sku: "NDZ-TBL-BIT-BK01",
      category: "casual",
      brand: "Timberland",
      stock: 25,
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify([imageUrl]),
      imageUrl: imageUrl,
      material: "Nubuck Leather + Rubber",
      active: true,
      featured: false,
      rating: "5.0",
      reviewCount: 0,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      seoTitle: "Timberland Bit-Detail Nubuck Loafer Matte Black | New Deal Zone",
      seoTitleFr: "Mocassin Timberland Mors Nubuck Noir Mat | New Deal Zone",
      metaDescription: "Shop the Timberland bit-detail loafer in matte black nubuck with chain hardware and lugged sole. Modern menswear essential. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez le mocassin Timberland d\u00e9tail mors en nubuck noir mat avec quincaillerie cha\u00eene et semelle crampons. Essentiel menswear moderne. Livraison rapide depuis Abuja.",
      focusKeyphrase: "timberland bit loafer black",
      focusKeyphraseFr: "mocassin timberland mors noir",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Adeboye Nnamdi", rating: 5, comment: "The matte nubuck finish looks so premium in person - much better than shiny leather. Chain detail adds just enough edge without being flashy. Delivery to Abuja was quick.", commentFr: "La finition nubuck mate est tellement premium en vrai - bien mieux que le cuir brillant. Le d\u00e9tail cha\u00eene ajoute juste assez de style sans \u00eatre voyant. Livraison rapide \u00e0 Abuja.", verified: true, daysAgo: 11 },
      { customerName: "Priscilla Owusu", rating: 5, comment: "Bought these for my husband and he wears them everywhere now. Comfortable from day one, the lugged sole gives real grip, and the tree logo confirms real Timberland quality. Highly recommend.", commentFr: "Je les ai achet\u00e9s pour mon mari et il les porte partout maintenant. Confortables d\u00e8s le premier jour, la semelle crampons donne une vraie adh\u00e9rence, et le logo arbre confirme la vraie qualit\u00e9 Timberland. Je recommande fortement.", verified: true, daysAgo: 27 },
      { customerName: "Amadou Toure", rating: 4, comment: "Beautiful loafers and the matte black is versatile with everything in my wardrobe. Only reason for 4 stars is I wish the chain hardware was a bit more substantial - feels slightly light.", commentFr: "Beaux mocassins et le noir mat est polyvalent avec tout dans ma garde-robe. La seule raison des 4 \u00e9toiles est que j'aurais aim\u00e9 que la quincaillerie cha\u00eene soit un peu plus substantielle - semble l\u00e9g\u00e8rement l\u00e9g\u00e8re.", verified: true, daysAgo: 45 },
      { customerName: "Halima Mwangi", rating: 5, comment: "These have replaced my dress shoes for smart-casual Friday looks. The nubuck softens beautifully after a couple wears and the padded insole means no foot fatigue after long days.", commentFr: "Ceux-ci ont remplac\u00e9 mes chaussures de ville pour les looks smart-casual du vendredi. Le nubuck s'assouplit magnifiquement apr\u00e8s quelques ports et la semelle rembourr\u00e9e signifie pas de fatigue des pieds apr\u00e8s de longues journ\u00e9es.", verified: false, daysAgo: 69 },
    ];

    for (const rev of reviewsData) {
      await db.insert(reviews).values({
        productId: product.id,
        customerName: rev.customerName,
        avatar: getInitials(rev.customerName),
        rating: rev.rating,
        comment: rev.comment,
        commentFr: rev.commentFr,
        verified: rev.verified,
        createdAt: new Date(now - rev.daysAgo * day),
      });
    }

    const totalRating = reviewsData.reduce((s, r) => s + r.rating, 0);
    const avgRating = Math.round((totalRating / reviewsData.length) * 10) / 10;
    await db.update(products).set({
      rating: avgRating.toFixed(1),
      reviewCount: reviewsData.length,
    }).where(eq(products.id, product.id));

    return NextResponse.json({
      success: true,
      message: "Timberland Bit-Detail Nubuck Loafer seeded successfully",
      product: { id: product.id, slug, slugFr, imageUrl, blobUsed },
      pricing: {
        costNgn, sellingNgn, compareNgn,
        costUsd, sellingUsd, compareUsd,
        costNgnSnapshot: costNgnSnap,
        profitNgn, marginPct,
        ngnRate: NGN_RATE, xofRate: XOF_RATE,
      },
      reviews: {
        count: reviewsData.length,
        avg: avgRating,
        breakdown: { five: reviewsData.filter(r => r.rating === 5).length, four: reviewsData.filter(r => r.rating === 4).length },
      },
      origin: { country: "NG", city: "Abuja" },
      urls: {
        en: `https://www.newdealzone.com/en/product/${slug}`,
        fr: `https://www.newdealzone.com/fr/product/${slugFr}`,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}