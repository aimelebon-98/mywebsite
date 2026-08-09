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
    let NGN = 1364;
    try {
      const r = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
      const d = await r.json();
      if (d.rates?.NGN) NGN = d.rates.NGN;
    } catch {}

    const costNgn = 38000, sellingNgn = 45000, compareNgn = 52000;
    const costUsd    = Math.round((costNgn / NGN) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / NGN) * 100) / 100;
    const compareUsd = Math.round((compareNgn / NGN) * 100) / 100;

    const slugEn = "chunky-platform-penny-loafer-black-patent";
    const slugFr = "mocassin-plateforme-chunky-noir-verni";

    const existing = await db.select().from(products)
      .where(or(eq(products.slug, slugEn), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
      await db.delete(products).where(eq(products.id, p.id));
    }

    const sourceUrl = "https://i.ibb.co/rR56sZ2C/Whats-App-Image-2026-08-09-at-10-11-21-AM-2.jpg";
    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/chunky-platform-penny-loafer-black-patent-embossed-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) { console.error("Blob upload failed:", e); }

    const sizes = JSON.stringify(["40","41","42","43","44","45"]);
    const colors = JSON.stringify([{ name: "Black", image: imageUrl }]);
    const images = JSON.stringify([imageUrl]);
    const tagsEn = JSON.stringify(["loafers","penny-loafer","chunky-sole","platform","black-patent","formal","smart-casual","modern-formal","embossed-leather"]);
    const tagsFr = JSON.stringify(["mocassins","penny-loafer","semelle-chunky","plateforme","verni-noir","formel","smart-casual","formel-moderne","cuir-emboss\u00e9"]);

    const longDescEn = `<p>The Chunky Platform Penny Loafer in Black Patent - a modern reinterpretation of the classic penny loafer silhouette elevated with a thick lug platform sole. Crafted from premium patent leather with subtle embossed texture panels, this piece bridges the gap between traditional formal wear and contemporary streetwear seamlessly.</p>
<ul>
<li>Premium patent leather upper with high-gloss mirror finish</li>
<li>Subtle embossed leather texture panels for dimensional interest</li>
<li>Classic penny slot strap detail (fill with a coin for tradition)</li>
<li>Chunky lug platform sole for added height and modern edge</li>
<li>Padded insole for all-day comfort</li>
<li>Slip-on construction for effortless wear</li>
<li>Ships in original box</li>
</ul>
<table class="product-spec-table">
<tr><th>Style</th><td>Chunky Platform Penny Loafer</td></tr>
<tr><th>Colour</th><td>Black Patent + Embossed</td></tr>
<tr><th>Material</th><td>Premium patent leather with embossed texture panels</td></tr>
<tr><th>Sole</th><td>Chunky lug platform</td></tr>
<tr><th>Signature Detail</th><td>Penny slot strap + high-gloss finish</td></tr>
<tr><th>Closure</th><td>Slip-on</td></tr>
<tr><th>Style</th><td>Modern formal / Smart-casual / Elevated streetwear</td></tr>
<tr><th>Sizes</th><td>40-45 EU</td></tr>
<tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
<tr><th>Includes</th><td>Original box</td></tr>
</table>
<p>These loafers work across every occasion. Wear them with tailored trousers and a crisp shirt for office wear, pair with straight-leg jeans and a fitted knit for smart-casual weekend looks, or dress them up with dark denim and a leather jacket for elevated streetwear energy. The chunky platform adds modern height without sacrificing the loafer's timeless sophistication.</p>
<p><strong>Modern classic - same-day delivery Abuja before 11 AM. Fast nationwide shipping.</strong></p>`;

    const longDescFr = `<p>Le Mocassin Plateforme Chunky en Verni Noir - une r\u00e9interpr\u00e9tation moderne de la silhouette classique du penny loafer, sublim\u00e9e par une semelle plateforme \u00e9paisse. Confectionn\u00e9 en cuir verni premium avec des panneaux \u00e0 texture emboss\u00e9e subtile, cette pi\u00e8ce fait le pont entre le formel traditionnel et le streetwear contemporain de mani\u00e8re fluide.</p>
<ul>
<li>Empeigne en cuir verni premium avec finition miroir haute brillance</li>
<li>Panneaux texture emboss\u00e9e subtile en cuir pour effet dimensionnel</li>
<li>D\u00e9tail classique de la sangle avec fente \u00e0 penny</li>
<li>Semelle plateforme chunky \u00e0 crampons pour hauteur et modernit\u00e9</li>
<li>Semelle int\u00e9rieure rembourr\u00e9e pour un confort toute la journ\u00e9e</li>
<li>Construction slip-on pour un port sans effort</li>
<li>Livr\u00e9 dans sa bo\u00eete d'origine</li>
</ul>
<table class="product-spec-table">
<tr><th>Style</th><td>Mocassin Plateforme Chunky Penny</td></tr>
<tr><th>Couleur</th><td>Noir Verni + Emboss\u00e9</td></tr>
<tr><th>Mati\u00e8re</th><td>Cuir verni premium avec panneaux emboss\u00e9s</td></tr>
<tr><th>Semelle</th><td>Plateforme chunky \u00e0 crampons</td></tr>
<tr><th>D\u00e9tail Signature</th><td>Sangle penny + finition haute brillance</td></tr>
<tr><th>Fermeture</th><td>Slip-on</td></tr>
<tr><th>Style</th><td>Formel moderne / Smart-casual / Streetwear \u00e9lev\u00e9</td></tr>
<tr><th>Tailles</th><td>40-45 EU</td></tr>
<tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
<tr><th>Inclus</th><td>Bo\u00eete d'origine</td></tr>
</table>
<p>Ces mocassins fonctionnent pour toutes les occasions. Portez-les avec un pantalon ajust\u00e9 et une chemise crisp pour le bureau, associez-les \u00e0 un jean droit et un pull ajust\u00e9 pour un look smart-casual le week-end, ou habillez-les avec un jean sombre et une veste en cuir pour une \u00e9nergie streetwear \u00e9lev\u00e9e. La plateforme chunky ajoute une hauteur moderne sans sacrifier la sophistication intemporelle du mocassin.</p>
<p><strong>Classique moderne - livraison same-day Abuja avant 11h. Livraison rapide dans tout le Nigeria.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "Chunky Platform Penny Loafer - Black Patent",
      nameFr: "Mocassin Plateforme Chunky - Noir Verni",
      slug: slugEn,
      slugFr: slugFr,
      description: "Modern chunky platform penny loafer in black patent leather with embossed texture panels. Formal-meets-streetwear silhouette.",
      descriptionFr: "Mocassin plateforme chunky moderne en cuir verni noir avec panneaux emboss\u00e9s. Silhouette formel-streetwear.",
      shortDescription: "Chunky platform penny loafer in black patent leather. Modern formal-streetwear hybrid. Sizes 40-45. Ships from Abuja.",
      shortDescriptionFr: "Mocassin plateforme chunky en cuir verni noir. Hybride formel-streetwear moderne. Tailles 40-45. Exp\u00e9di\u00e9 d'Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: costNgn.toString(),
      supplierPrice: costNgn.toString(),
      supplierCurrency: "NGN",
      category: "formal",
      brand: "New Deal",
      sizes: sizes,
      colors: colors,
      imageUrl: imageUrl,
      images: images,
      stock: 20,
      featured: false,
      active: true,
      material: "Premium patent leather with embossed texture panels",
      sku: "NDZ-NDL-CPL-BK01",
      tags: tagsEn,
      tagsFr: tagsFr,
      seoTitle: "Chunky Platform Penny Loafer Black Patent Modern | New Deal Zone",
      seoTitleFr: "Mocassin Plateforme Chunky Noir Verni Moderne | New Deal Zone",
      metaDescription: "Shop chunky platform penny loafer in black patent leather with embossed panels. Modern formal-streetwear hybrid. Sizes 40-45. Same-day delivery Abuja.",
      metaDescriptionFr: "Mocassin plateforme chunky en cuir verni noir avec panneaux emboss\u00e9s. Hybride formel-streetwear moderne. Tailles 40-45. Livraison same-day \u00e0 Abuja.",
      focusKeyphrase: "chunky platform penny loafer black",
      focusKeyphraseFr: "mocassin plateforme chunky noir",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slugEn}`,
      originCountry: "NG",
      originCity: "Abuja",
    }).returning();

    const product = inserted[0];
    if (!product) throw new Error("Insert failed");

    const reviewData = [
      { name: "Emeka Nwachukwu",     daysAgo: 3,   rating: 5, en: "These loafers are STUNNING! The patent leather has that mirror finish that pops in every photo. Chunky sole gives me an extra 2 inches of height without feeling awkward. Perfect for the office and weekend fits.", fr: "Ces mocassins sont MAGNIFIQUES ! Le cuir verni a cette finition miroir qui ressort sur chaque photo. La semelle chunky me donne 2 pouces de hauteur en plus sans para\u00eetre bizarre. Parfait pour le bureau et les tenues week-end.", verified: true },
      { name: "Chidinma Adeyemi",    daysAgo: 15,  rating: 5, en: "Bought for my husband and he's been wearing them non-stop. He said the fit is perfect and the platform is comfortable even during long meetings. Quality feels premium. Best purchase this year.", fr: "Achet\u00e9s pour mon mari et il ne les quitte plus. Il dit que l'ajustement est parfait et que la plateforme est confortable m\u00eame pendant les longues r\u00e9unions. La qualit\u00e9 semble premium. Meilleur achat de l'ann\u00e9e.", verified: true },
      { name: "Bola Adegoke",        daysAgo: 34,  rating: 5, en: "Ordered on Friday, arrived Saturday morning in Abuja. Same-day delivery is real! The embossed texture panels add a nice detail that photos don't fully capture. Sizing runs true, went with my usual 42 EU.", fr: "Command\u00e9s vendredi, arriv\u00e9s samedi matin \u00e0 Abuja. La livraison same-day est r\u00e9elle ! Les panneaux emboss\u00e9s ajoutent un beau d\u00e9tail que les photos ne captent pas enti\u00e8rement. La taille est juste, j'ai pris mon 42 EU habituel.", verified: true },
      { name: "Antoine Girard",      daysAgo: 71,  rating: 4, en: "Really versatile shoe - I've worn them to business meetings and casual dinners. The patent leather does need occasional wiping to keep the shine but it's easy to maintain. Overall very happy with the purchase.", fr: "Chaussure vraiment polyvalente - je les ai port\u00e9es \u00e0 des r\u00e9unions d'affaires et \u00e0 des d\u00eeners casual. Le cuir verni n\u00e9cessite un essuyage occasionnel pour garder son \u00e9clat mais c'est facile \u00e0 entretenir. Globalement tr\u00e8s content de l'achat.", verified: false },
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
      message: "Chunky Platform Penny Loafer Black Patent seeded successfully",
      product: { id: product.id, slug: slugEn, slugFr: slugFr, imageUrl, blobUsed },
      pricing: {
        costNgn, sellingNgn, compareNgn,
        costUsd, sellingUsd, compareUsd,
        profitNgn: sellingNgn - costNgn,
        marginPct: Math.round(((sellingNgn - costNgn) / sellingNgn) * 1000) / 10,
        ngnRate: NGN,
      },
      reviews: {
        count: reviewData.length,
        avg: avgRating,
        breakdown: `${reviewData.filter(r => r.rating === 5).length}x 5-star, ${reviewData.filter(r => r.rating === 4).length}x 4-star`,
      },
      origin: { country: "NG", city: "Abuja" },
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