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

    const slug = "clarks-driver-penny-loafer-dark-brown";
    const slugFr = "mocassin-clarks-driver-penny-marron-fonce";
    const sourceUrl = "https://i.ibb.co/4nsNsSHN/Whats-App-Image-2026-08-09-at-10-11-08-AM-4.jpg";

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/clarks-driver-penny-loafer-dark-brown-${Date.now()}.jpg`,
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

    const nameEn = "Clarks Driver Penny Loafer - Dark Brown Leather";
    const nameFr = "Mocassin Clarks Driver Penny - Cuir Marron Fonc\u00e9";

    const shortDescEn = "Clarks driver-style penny loafer in dark brown leather with tan contrast whipstitch and rubber pebble driving sole. Ships from Abuja.";
    const shortDescFr = "Mocassin Clarks style driver penny en cuir marron fonc\u00e9 avec surpiq\u00fbre contrastante tan et semelle en caoutchouc \u00e0 picots. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>Slip into refined comfort with the <strong>Clarks Driver Penny Loafer in Dark Brown Leather</strong>. Blending Clarks' 200-year British craftsmanship with a modern driver silhouette, this loafer features a supple full-leather upper, decorative tan contrast whipstitching, the classic penny keeper strap, and a rubber pebble sole perfectly designed for both driving and walking. The signature red Clarks script embroidery on the heel confirms authentic pedigree.</p>

<h3>Key Features</h3>
<ul>
<li><strong>Full leather upper</strong> in rich dark chocolate brown</li>
<li><strong>Contrast tan whipstitching</strong> around the moc-toe for artisanal detail</li>
<li><strong>Classic penny keeper strap</strong> - the timeless slot for lucky pennies</li>
<li><strong>Rubber pebble driving sole</strong> wraps up the heel for grip and comfort</li>
<li><strong>Signature Clarks red script</strong> embroidered on the heel counter</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>Clarks</td></tr>
<tr><td><strong>Model</strong></td><td>Driver Penny Loafer</td></tr>
<tr><td><strong>Colour</strong></td><td>Dark Brown / Tan Stitch</td></tr>
<tr><td><strong>Material</strong></td><td>Full-Grain Leather + Rubber Pebble Sole</td></tr>
<tr><td><strong>Cushioning / Sole</strong></td><td>Cushioned Insole + Wraparound Pebble Sole</td></tr>
<tr><td><strong>Signature Detail</strong></td><td>Penny Keeper Strap + Red Clarks Heel Script</td></tr>
<tr><td><strong>Closure</strong></td><td>Slip-On</td></tr>
<tr><td><strong>Style</strong></td><td>Driver Moccasin Loafer</td></tr>
<tr><td><strong>Sizes</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Ships from</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Includes</strong></td><td>Original Packaging</td></tr>
</table>

<h3>How to Style</h3>
<p>Pair with chinos in cream, navy, or olive for classic prep-menswear, or dress down with rolled-up jeans and a linen shirt for effortless weekend energy. The dark brown reads warm and versatile - equally at home in the office, at Sunday brunch, or behind the wheel. Wear sockless in summer and with cashmere socks when the weather cools. A wardrobe workhorse.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. Two centuries of British shoemaking, ready to wear.</p>`;

    const longDescFr = `<p>Glissez dans un confort raffin\u00e9 avec le <strong>Mocassin Clarks Driver Penny en Cuir Marron Fonc\u00e9</strong>. M\u00e9langeant les 200 ans de savoir-faire britannique de Clarks avec une silhouette driver moderne, ce mocassin pr\u00e9sente une tige en cuir souple, une surpiq\u00fbre d\u00e9corative contrastante tan, la bride penny classique et une semelle en caoutchouc \u00e0 picots parfaitement con\u00e7ue pour la conduite comme pour la marche. La broderie script Clarks rouge signature sur le talon confirme le pedigree authentique.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>Tige en cuir pleine fleur</strong> dans un riche marron chocolat fonc\u00e9</li>
<li><strong>Surpiq\u00fbre contrastante tan</strong> autour du moc-toe pour un d\u00e9tail artisanal</li>
<li><strong>Bride penny keeper classique</strong> - la fente intemporelle pour les pi\u00e8ces porte-bonheur</li>
<li><strong>Semelle driver caoutchouc \u00e0 picots</strong> qui remonte sur le talon pour l'adh\u00e9rence et le confort</li>
<li><strong>Signature script Clarks rouge</strong> brod\u00e9e sur le contrefort</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>Clarks</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>Mocassin Driver Penny</td></tr>
<tr><td><strong>Couleur</strong></td><td>Marron Fonc\u00e9 / Couture Tan</td></tr>
<tr><td><strong>Mati\u00e8re</strong></td><td>Cuir Pleine Fleur + Semelle Caoutchouc \u00e0 Picots</td></tr>
<tr><td><strong>Amorti</strong></td><td>Semelle Int\u00e9rieure Rembourr\u00e9e + Semelle Envelop</td></tr>
<tr><td><strong>D\u00e9tail Signature</strong></td><td>Bride Penny Keeper + Script Rouge Clarks au Talon</td></tr>
<tr><td><strong>Fermeture</strong></td><td>\u00c0 Enfiler</td></tr>
<tr><td><strong>Style</strong></td><td>Mocassin Driver</td></tr>
<tr><td><strong>Tailles</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Exp\u00e9di\u00e9 de</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Inclus</strong></td><td>Emballage Original</td></tr>
</table>

<h3>Comment le Porter</h3>
<p>Associez avec un chino cr\u00e8me, marine ou olive pour un menswear prep classique, ou d\u00e9contractez avec un jean retrouss\u00e9 et une chemise en lin pour une \u00e9nergie week-end sans effort. Le marron fonc\u00e9 est chaud et polyvalent - aussi \u00e0 l'aise au bureau, au brunch du dimanche ou au volant. Portez pieds nus en \u00e9t\u00e9 et avec des chaussettes en cachemire quand le temps se rafra\u00eechit. Un incontournable de la garde-robe.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. Deux si\u00e8cles de chaussures britanniques, pr\u00eats \u00e0 porter.</p>`;

    const sizes = ["41","42","43","44","45","46"];
    const colors = [{ name: "Dark Brown", image: imageUrl }];
    const tagsEn = ["clarks", "driver loafer", "penny loafer", "dark brown", "leather loafer", "driving shoe", "menswear", "loafers", "abuja"];
    const tagsFr = ["clarks", "mocassin driver", "mocassin penny", "marron fonc\u00e9", "mocassin cuir", "chaussure conduite", "menswear", "mocassins", "abuja"];

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
      sku: "NDZ-CLK-DRV-DB01",
      category: "casual",
      brand: "Clarks",
      stock: 25,
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify([imageUrl]),
      imageUrl: imageUrl,
      material: "Full-Grain Leather + Rubber",
      active: true,
      featured: false,
      rating: "5.0",
      reviewCount: 0,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      seoTitle: "Clarks Driver Penny Loafer Dark Brown Leather | New Deal Zone",
      seoTitleFr: "Mocassin Clarks Driver Penny Marron Fonc\u00e9 | New Deal Zone",
      metaDescription: "Shop the Clarks driver penny loafer in dark brown leather with tan contrast stitching and rubber pebble sole. British menswear classic. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez le mocassin Clarks driver penny en cuir marron fonc\u00e9 avec surpiq\u00fbre tan et semelle \u00e0 picots. Classique menswear britannique. Livraison rapide depuis Abuja.",
      focusKeyphrase: "clarks driver penny loafer",
      focusKeyphraseFr: "mocassin clarks driver penny",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Kunle Blessing", rating: 5, comment: "Classic Clarks quality - the leather is soft right out the box and the tan stitching is a beautiful contrast. Perfect fit true to size. Delivered to Abuja in 2 days.", commentFr: "Qualit\u00e9 Clarks classique - le cuir est souple directement en sortant de la bo\u00eete et la couture tan est un beau contraste. Taille parfaite normale. Livr\u00e9 \u00e0 Abuja en 2 jours.", verified: true, daysAgo: 8 },
      { customerName: "Jordan Johnson", rating: 5, comment: "Bought these to replace an old pair of drivers and they are miles better. The pebble sole gives real grip and the color is a rich deep brown, not too red like some pics show.", commentFr: "Je les ai achet\u00e9s pour remplacer une vieille paire de drivers et ils sont bien meilleurs. La semelle \u00e0 picots donne une vraie adh\u00e9rence et la couleur est un marron profond riche, pas trop rouge comme certaines photos montrent.", verified: true, daysAgo: 23 },
      { customerName: "Ama Adjei", rating: 4, comment: "Gorgeous loafers for my brother's birthday. He loves the red Clarks embroidery on the heel and wears them everywhere. Only reason for 4 stars is the box was a bit basic - shoes make up for it.", commentFr: "Magnifiques mocassins pour l'anniversaire de mon fr\u00e8re. Il adore la broderie Clarks rouge sur le talon et les porte partout. La seule raison des 4 \u00e9toiles est que la bo\u00eete \u00e9tait un peu basique - les chaussures compensent.", verified: true, daysAgo: 40 },
      { customerName: "Andre Diagne", rating: 5, comment: "Perfect driving shoes and equally great for casual office wear. The moc-toe stitching is done cleanly and the leather smells like real quality Clarks. Comfortable all day.", commentFr: "Chaussures de conduite parfaites et tout aussi excellentes pour le port au bureau. La couture moc-toe est faite proprement et le cuir sent la vraie qualit\u00e9 Clarks. Confortable toute la journ\u00e9e.", verified: false, daysAgo: 63 },
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
      message: "Clarks Driver Penny Loafer Dark Brown seeded successfully",
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