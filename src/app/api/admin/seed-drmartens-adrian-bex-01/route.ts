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

    const costNgn = 33000;
    const sellingNgn = 45000;
    const compareNgn = 54000;

    const costUsd = Math.round((costNgn / NGN_RATE) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / NGN_RATE) * 100) / 100;
    const compareUsd = Math.round((compareNgn / NGN_RATE) * 100) / 100;
    const costNgnSnap = Math.round(costUsd * NGN_RATE);
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 1000) / 10;

    const slug = "dr-martens-adrian-bex-penny-loafer-black";
    const slugFr = "mocassin-dr-martens-adrian-bex-noir";
    const sourceUrl = "https://i.ibb.co/FkWZ4WhS/Whats-App-Image-2026-08-09-at-10-11-09-AM-1.jpg";

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/dr-martens-adrian-bex-penny-loafer-black-${Date.now()}.jpg`,
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

    const nameEn = "Dr. Martens Adrian Bex Penny Loafer - Black / White Stitch";
    const nameFr = "Mocassin Dr. Martens Adrian Bex Penny - Noir / Couture Blanche";

    const shortDescEn = "Dr. Martens Adrian Bex chunky penny loafer in black smooth leather with contrast white stitching, white penny strap, and iconic Bex platform sole. Ships from Abuja.";
    const shortDescFr = "Mocassin Dr. Martens Adrian Bex penny chunky en cuir noir lisse avec couture blanche contrastante, bride penny blanche et semelle plateforme Bex ic\u00f4nique. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>The <strong>Dr. Martens Adrian Bex Penny Loafer in Black with White Stitch</strong> takes the timeless penny loafer and gives it the unmistakable Doc Martens treatment. Built on the chunky Bex platform sole with dramatic contrast stitching and a bold white leather penny strap, this shoe fuses prep-school heritage with British punk attitude for a look that lands anywhere from campus to the club.</p>

<h3>Key Features</h3>
<ul>
<li><strong>Smooth black leather upper</strong> with mirror-polish finish</li>
<li><strong>Bold contrast white stitching</strong> throughout the moc-toe construction</li>
<li><strong>White leather penny strap</strong> for signature high-contrast pop</li>
<li><strong>Chunky Bex platform sole</strong> for lift and street presence</li>
<li><strong>Slip-on construction</strong> with padded topline for all-day wear</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>Dr. Martens</td></tr>
<tr><td><strong>Model</strong></td><td>Adrian Bex Penny Loafer</td></tr>
<tr><td><strong>Colour</strong></td><td>Black / White Stitch</td></tr>
<tr><td><strong>Material</strong></td><td>Smooth Leather + Air-Cushioned Sole</td></tr>
<tr><td><strong>Cushioning / Sole</strong></td><td>Bex Chunky Platform with Air-Cushion</td></tr>
<tr><td><strong>Signature Detail</strong></td><td>Contrast White Stitching + White Penny Strap</td></tr>
<tr><td><strong>Closure</strong></td><td>Slip-On</td></tr>
<tr><td><strong>Style</strong></td><td>Chunky Penny Loafer</td></tr>
<tr><td><strong>Sizes</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Ships from</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Includes</strong></td><td>Original Dr. Martens Box</td></tr>
</table>

<h3>How to Style</h3>
<p>Pair with rolled-up jeans and white socks for classic prep-punk energy, or dress up with tailored trousers and an oversized blazer for elevated menswear. The white stitching lets you go bold with monochrome outfits, while the Bex platform adds height without sacrificing comfort. A statement piece that reads polished and rebellious in equal measure.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. British heritage, remixed for the modern wardrobe.</p>`;

    const longDescFr = `<p>Le <strong>Mocassin Dr. Martens Adrian Bex Penny en Noir avec Couture Blanche</strong> reprend le mocassin penny intemporel et lui donne le traitement Doc Martens incomparable. Construit sur la semelle plateforme chunky Bex avec une couture contrastante spectaculaire et une bride penny audacieuse en cuir blanc, cette chaussure fusionne l'h\u00e9ritage prep-school avec l'attitude punk britannique pour un look qui fonctionne du campus au club.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>Tige en cuir noir lisse</strong> avec finition polie miroir</li>
<li><strong>Couture blanche contrastante audacieuse</strong> sur toute la construction moc-toe</li>
<li><strong>Bride penny en cuir blanc</strong> pour le pop contrastant signature</li>
<li><strong>Semelle plateforme chunky Bex</strong> pour la hauteur et la pr\u00e9sence street</li>
<li><strong>Construction \u00e0 enfiler</strong> avec col rembourr\u00e9 pour un port toute la journ\u00e9e</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>Dr. Martens</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>Adrian Bex Penny Loafer</td></tr>
<tr><td><strong>Couleur</strong></td><td>Noir / Couture Blanche</td></tr>
<tr><td><strong>Mati\u00e8re</strong></td><td>Cuir Lisse + Semelle Air-Cushioned</td></tr>
<tr><td><strong>Amorti</strong></td><td>Plateforme Chunky Bex avec Air-Cushion</td></tr>
<tr><td><strong>D\u00e9tail Signature</strong></td><td>Couture Blanche Contrastante + Bride Penny Blanche</td></tr>
<tr><td><strong>Fermeture</strong></td><td>\u00c0 Enfiler</td></tr>
<tr><td><strong>Style</strong></td><td>Mocassin Penny Chunky</td></tr>
<tr><td><strong>Tailles</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Exp\u00e9di\u00e9 de</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Inclus</strong></td><td>Bo\u00eete Dr. Martens Originale</td></tr>
</table>

<h3>Comment le Porter</h3>
<p>Portez avec un jean retrouss\u00e9 et des chaussettes blanches pour une \u00e9nergie prep-punk classique, ou habillez avec un pantalon taill\u00e9 et un blazer oversized pour un menswear \u00e9lev\u00e9. La couture blanche vous permet d'oser avec des tenues monochromes, tandis que la plateforme Bex ajoute de la hauteur sans sacrifier le confort. Une pi\u00e8ce statement qui lit poli et rebelle \u00e0 parts \u00e9gales.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. H\u00e9ritage britannique, remix\u00e9 pour la garde-robe moderne.</p>`;

    const sizes = ["41","42","43","44","45","46"];
    const colors = [{ name: "Black/White", image: imageUrl }];
    const tagsEn = ["dr martens", "doc martens", "adrian bex", "penny loafer", "chunky loafer", "black leather", "white stitch", "platform loafer", "abuja"];
    const tagsFr = ["dr martens", "doc martens", "adrian bex", "mocassin penny", "mocassin chunky", "cuir noir", "couture blanche", "mocassin plateforme", "abuja"];

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
      sku: "NDZ-DRM-ADR-BW01",
      category: "casual",
      brand: "Dr. Martens",
      stock: 20,
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify([imageUrl]),
      imageUrl: imageUrl,
      material: "Smooth Leather + Rubber",
      active: true,
      featured: true,
      rating: "5.0",
      reviewCount: 0,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      seoTitle: "Dr. Martens Adrian Bex Penny Loafer Black White | New Deal Zone",
      seoTitleFr: "Mocassin Dr. Martens Adrian Bex Penny Noir Blanc | New Deal Zone",
      metaDescription: "Shop the Dr. Martens Adrian Bex chunky penny loafer in black leather with bold white contrast stitch. Bex platform sole. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez le mocassin Dr. Martens Adrian Bex chunky en cuir noir avec couture blanche contrastante. Semelle plateforme Bex. Livraison rapide depuis Abuja.",
      focusKeyphrase: "dr martens adrian bex loafer",
      focusKeyphraseFr: "mocassin dr martens adrian bex",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Grace Ansah", rating: 5, comment: "The contrast white stitch is EVERYTHING. So much personality compared to plain loafers. Bex sole gives just the right amount of chunk. Delivery to Abuja was quick.", commentFr: "La couture blanche contrastante est TOUT. Beaucoup plus de personnalit\u00e9 que les mocassins classiques. La semelle Bex donne juste la bonne dose de chunk. Livraison rapide \u00e0 Abuja.", verified: true, daysAgo: 9 },
      { customerName: "Kofi Mensah", rating: 5, comment: "Genuine Docs quality - the leather is thick and the air-cushion sole is comfortable straight out the box. White penny strap is a killer detail. Bought a size up as recommended.", commentFr: "Vraie qualit\u00e9 Docs - le cuir est \u00e9pais et la semelle air-cushion est confortable directement en sortant de la bo\u00eete. La bride penny blanche est un d\u00e9tail tueur. J'ai pris une taille au-dessus comme recommand\u00e9.", verified: true, daysAgo: 26 },
      { customerName: "Fatoumata Ba", rating: 4, comment: "Absolutely stunning shoes and they pair with everything from jeans to suits. Only downside is they take about a week to fully break in - stiff at the start.", commentFr: "Chaussures absolument magnifiques et elles s'accordent avec tout, du jean au costume. Le seul b\u00e9mol est qu'elles prennent environ une semaine pour se faire compl\u00e8tement au pied - rigides au d\u00e9but.", verified: true, daysAgo: 44 },
      { customerName: "Bola Adeboye", rating: 5, comment: "Been eyeing the Adrian Bex for months. The contrast stitching sold me and I was not disappointed. Weight and build feel proper Doc Martens. Instant favorite.", commentFr: "J'avais l'oeil sur l'Adrian Bex depuis des mois. La couture contrastante m'a convaincu et je n'ai pas \u00e9t\u00e9 d\u00e9\u00e7u. Le poids et la construction sont bien Dr. Martens. Coup de coeur instantan\u00e9.", verified: false, daysAgo: 68 },
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
      message: "Dr. Martens Adrian Bex Penny Loafer seeded successfully",
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