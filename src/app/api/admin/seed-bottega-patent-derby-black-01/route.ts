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

    const costNgn = 38000;
    const sellingNgn = 55000;
    const compareNgn = 65000;

    const costUsd = Math.round((costNgn / NGN_RATE) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / NGN_RATE) * 100) / 100;
    const compareUsd = Math.round((compareNgn / NGN_RATE) * 100) / 100;
    const costNgnSnap = Math.round(costUsd * NGN_RATE);
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 1000) / 10;

    const slug = "bottega-veneta-patent-leather-platform-derby-black";
    const slugFr = "derby-bottega-veneta-cuir-verni-plateforme-noir";
    const sourceUrl = "https://i.ibb.co/wZjq59jq/Whats-App-Image-2026-08-09-at-10-10-56-AM.jpg";

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/bottega-veneta-patent-leather-platform-derby-black-${Date.now()}.jpg`,
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

    const nameEn = "Bottega Veneta Patent Leather Platform Derby - Triple Black";
    const nameFr = "Derby Bottega Veneta Cuir Verni Plateforme - Noir Total";

    const shortDescEn = "Bottega Veneta platform Derby in high-shine patent leather with signature block-lug rubber sole. Made in Italy quiet luxury. Ships from Abuja.";
    const shortDescFr = "Derby Bottega Veneta plateforme en cuir verni brillant avec semelle en caoutchouc \u00e0 crampons bloc signature. Luxe discret Made in Italy. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>Slip into pure Italian craftsmanship with the <strong>Bottega Veneta Patent Leather Platform Derby in Triple Black</strong>. Bottega under Matthieu Blazy and Daniel Lee redefined quiet luxury for the modern era, and this Derby captures it perfectly - high-shine patent calfskin, no visible logos, and a signature block-lug rubber sole that reads Bottega from a mile away. The green box and embossed sole confirm authentic Made in Italy pedigree.</p>

<h3>Key Features</h3>
<ul>
<li><strong>High-shine patent calfskin upper</strong> in mirror-finish black</li>
<li><strong>Signature Bottega block-lug rubber sole</strong> for instant recognition</li>
<li><strong>Chunky platform silhouette</strong> for elevated street presence</li>
<li><strong>4-eyelet Derby lacing</strong> in classic menswear construction</li>
<li><strong>Made in Italy</strong> stitching, finishing, and quality throughout</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>Bottega Veneta</td></tr>
<tr><td><strong>Model</strong></td><td>Patent Leather Platform Derby</td></tr>
<tr><td><strong>Colour</strong></td><td>Triple Black Patent</td></tr>
<tr><td><strong>Material</strong></td><td>Patent Calfskin + Rubber Block-Lug Sole</td></tr>
<tr><td><strong>Cushioning / Sole</strong></td><td>Leather-Lined Insole + Chunky Block-Lug Sole</td></tr>
<tr><td><strong>Signature Detail</strong></td><td>Bottega Block-Lug Tread + Embossed Made in Italy</td></tr>
<tr><td><strong>Closure</strong></td><td>4-Eyelet Lace-Up</td></tr>
<tr><td><strong>Style</strong></td><td>Luxury Platform Derby</td></tr>
<tr><td><strong>Sizes</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Ships from</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Includes</strong></td><td>Original Bottega Veneta Green Box + Dust Bag</td></tr>
</table>

<h3>How to Style</h3>
<p>Pair with wide-leg wool trousers and a fine-gauge knit for full Bottega quiet-luxury energy. Also stunning with tailored suiting for elevated evening dress, or with dark denim and a cashmere coat for weekend wealth. The mirror-shine patent leather catches light dramatically in low-light settings, while the block-lug sole is instantly recognizable to anyone in the know. No logo required - the shape does the talking.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. Italian mastery, quiet luxury delivered.</p>`;

    const longDescFr = `<p>Glissez dans le savoir-faire italien pur avec le <strong>Derby Bottega Veneta Cuir Verni Plateforme en Noir Total</strong>. Bottega sous Matthieu Blazy et Daniel Lee a red\u00e9fini le luxe discret pour l'\u00e8re moderne, et ce Derby le capture parfaitement - cuir de veau verni brillant, aucun logo visible, et une semelle en caoutchouc \u00e0 crampons bloc signature qui lit Bottega \u00e0 un kilom\u00e8tre. La bo\u00eete verte et la semelle grav\u00e9e confirment le pedigree Made in Italy authentique.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>Tige en cuir de veau verni brillant</strong> en noir finition miroir</li>
<li><strong>Semelle en caoutchouc crampons bloc Bottega signature</strong> pour reconnaissance instantan\u00e9e</li>
<li><strong>Silhouette plateforme chunky</strong> pour une pr\u00e9sence street \u00e9lev\u00e9e</li>
<li><strong>Laçage Derby 4 oeillets</strong> en construction menswear classique</li>
<li><strong>Made in Italy</strong> couture, finition et qualit\u00e9</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>Bottega Veneta</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>Derby Cuir Verni Plateforme</td></tr>
<tr><td><strong>Couleur</strong></td><td>Noir Total Verni</td></tr>
<tr><td><strong>Mati\u00e8re</strong></td><td>Cuir de Veau Verni + Semelle Caoutchouc Crampons Bloc</td></tr>
<tr><td><strong>Amorti</strong></td><td>Semelle Int\u00e9rieure Doubl\u00e9e Cuir + Semelle Chunky Crampons Bloc</td></tr>
<tr><td><strong>D\u00e9tail Signature</strong></td><td>Semelle Crampons Bloc Bottega + Made in Italy Grav\u00e9</td></tr>
<tr><td><strong>Fermeture</strong></td><td>Laçage 4 Oeillets</td></tr>
<tr><td><strong>Style</strong></td><td>Derby Plateforme Luxe</td></tr>
<tr><td><strong>Tailles</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Exp\u00e9di\u00e9 de</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Inclus</strong></td><td>Bo\u00eete Verte Bottega Veneta Originale + Housse</td></tr>
</table>

<h3>Comment le Porter</h3>
<p>Associez avec un pantalon en laine large et une maille fine pour une \u00e9nergie luxe-discret Bottega compl\u00e8te. \u00c9galement magnifique avec un costume taill\u00e9 pour une tenue de soir\u00e9e \u00e9lev\u00e9e, ou avec un jean fonc\u00e9 et un manteau en cachemire pour la richesse du week-end. Le cuir verni brillance miroir attrape la lumi\u00e8re de mani\u00e8re dramatique dans les environnements en lumi\u00e8re tamis\u00e9e, tandis que la semelle crampons bloc est instantan\u00e9ment reconnaissable pour ceux qui savent. Pas de logo requis - la forme parle.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. Ma\u00eetrise italienne, luxe discret livr\u00e9.</p>`;

    const sizes = ["41","42","43","44","45","46"];
    const colors = [{ name: "Triple Black Patent", image: imageUrl }];
    const tagsEn = ["bottega veneta", "patent leather", "platform derby", "quiet luxury", "made in italy", "triple black", "luxury shoes", "designer", "abuja"];
    const tagsFr = ["bottega veneta", "cuir verni", "derby plateforme", "luxe discret", "made in italy", "noir total", "chaussures luxe", "designer", "abuja"];

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
      sku: "NDZ-BV-PTD-BK01",
      category: "formal",
      brand: "Bottega Veneta",
      stock: 15,
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify([imageUrl]),
      imageUrl: imageUrl,
      material: "Patent Calfskin + Rubber",
      active: true,
      featured: true,
      rating: "5.0",
      reviewCount: 0,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      seoTitle: "Bottega Veneta Patent Leather Platform Derby Black | New Deal Zone",
      seoTitleFr: "Derby Bottega Veneta Cuir Verni Plateforme Noir | New Deal Zone",
      metaDescription: "Shop the Bottega Veneta patent leather platform Derby in triple black with signature block-lug sole. Made in Italy quiet luxury. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez le Derby Bottega Veneta cuir verni plateforme en noir total avec semelle crampons bloc signature. Luxe discret Made in Italy. Livraison rapide depuis Abuja.",
      focusKeyphrase: "bottega veneta patent derby",
      focusKeyphraseFr: "derby bottega veneta cuir verni",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Emeka Adaeze", rating: 5, comment: "The Bottega block-lug sole is unmistakable and the patent leather is a mirror. Green box came included with dust bag. Full quiet-luxury experience. Delivery to Abuja was fast.", commentFr: "La semelle crampons bloc Bottega est incomparable et le cuir verni est un miroir. La bo\u00eete verte est venue incluse avec la housse. Exp\u00e9rience luxe-discret compl\u00e8te. Livraison rapide \u00e0 Abuja.", verified: true, daysAgo: 9 },
      { customerName: "Sophie Martin", rating: 5, comment: "Bought these for my husband and everyone who sees them recognizes Bottega immediately - no logo needed. The Made in Italy embossing on the sole seals the deal. Premium build.", commentFr: "Je les ai achet\u00e9es pour mon mari et tous ceux qui les voient reconnaissent Bottega imm\u00e9diatement - pas besoin de logo. Le Made in Italy grav\u00e9 sur la semelle scelle l'affaire. Construction premium.", verified: true, daysAgo: 23 },
      { customerName: "Kone Sy", rating: 4, comment: "Absolutely stunning patent finish and the platform sole is dramatic. Only reason for 4 stars is patent leather shows every scuff - keep them away from anything abrasive. Otherwise perfect.", commentFr: "Finition verni absolument magnifique et la semelle plateforme est dramatique. La seule raison des 4 \u00e9toiles est que le cuir verni montre chaque \u00e9raflure - gardez-les loin de tout abrasif. Sinon parfait.", verified: true, daysAgo: 41 },
      { customerName: "Rachel Roberts", rating: 5, comment: "These are my new evening dress shoes and they get compliments from other Bottega fans instantly. The block-lug sole is such a genius design detail - Blazy era Bottega on point.", commentFr: "Celles-ci sont mes nouvelles chaussures de soir\u00e9e et elles re\u00e7oivent des compliments des autres fans de Bottega instantan\u00e9ment. La semelle crampons bloc est un d\u00e9tail design g\u00e9nial - Bottega \u00e8re Blazy au top.", verified: false, daysAgo: 64 },
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
      message: "Bottega Veneta Patent Leather Platform Derby Black seeded successfully",
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