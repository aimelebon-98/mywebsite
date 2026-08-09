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

    const slugEn = "fdcp-chunky-platform-studded-lace-up";
    const slugFr = "chaussure-fdcp-plateforme-chunky-cloutee";

    const existing = await db.select().from(products)
      .where(or(eq(products.slug, slugEn), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
      await db.delete(products).where(eq(products.id, p.id));
    }

    const sourceUrl = "https://i.ibb.co/R4dZrR9v/Whats-App-Image-2026-08-09-at-10-11-21-AM.jpg";
    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/fdcp-chunky-platform-studded-lace-up-alt-punk-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) { console.error("Blob upload failed:", e); }

    const sizes = JSON.stringify(["40","41","42","43","44","45"]);
    const colors = JSON.stringify([{ name: "Black/Burgundy", image: imageUrl }]);
    const images = JSON.stringify([imageUrl]);
    const tagsEn = JSON.stringify(["fdcp","chunky-platform","studded","lace-up","alt-fashion","y2k","punk","goth","statement","dark-academia"]);
    const tagsFr = JSON.stringify(["fdcp","plateforme-chunky","cloutee","lacets","alt-fashion","y2k","punk","goth","statement","dark-academia"]);

    const longDescEn = `<p>The FDCP Chunky Platform Studded Lace-Up - a bold statement piece that channels Y2K punk aesthetics, dark academia, and alternative fashion into one unforgettable silhouette. Available in dramatic Black and Burgundy patent leather with silver-studded metal straps, chunky serrated platform sole, and signature FDCP branded packaging.</p>
<ul>
<li>Premium patent leather upper with high-gloss mirror finish</li>
<li>Dual silver-studded metal cross straps for edgy detail</li>
<li>Metallic silver tongue accent</li>
<li>Chunky serrated platform sole for added height and street presence</li>
<li>Classic lace-up closure with black cotton laces</li>
<li>FDCP branded metal plate on heel</li>
<li>Ships with iconic FDCP lightning bolt printed box</li>
</ul>
<table class="product-spec-table">
<tr><th>Brand</th><td>FDCP</td></tr>
<tr><th>Model</th><td>Chunky Platform Studded Lace-Up</td></tr>
<tr><th>Colour</th><td>Black / Burgundy Patent</td></tr>
<tr><th>Material</th><td>Patent leather + silver-studded metal straps</td></tr>
<tr><th>Sole</th><td>Chunky serrated platform</td></tr>
<tr><th>Signature Detail</th><td>Studded straps + metallic tongue + platform</td></tr>
<tr><th>Closure</th><td>Lace-up + decorative studded straps</td></tr>
<tr><th>Style</th><td>Alt-fashion / Y2K punk / Dark academia</td></tr>
<tr><th>Sizes</th><td>40-45 EU</td></tr>
<tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
<tr><th>Includes</th><td>Original FDCP branded box</td></tr>
</table>
<p>These are for the customer who refuses to blend in. Pair with a plaid mini skirt and fishnet tights for authentic Y2K goth energy, tuck them under wide-leg cargo pants for dark academia streetwear, or dress them with a tailored blazer and black jeans for elevated punk sophistication. The high-shine patent leather catches light beautifully, and the studded straps add serious edge to any outfit.</p>
<p><strong>Statement piece - limited stock. Same-day delivery Abuja before 11 AM. Fast nationwide shipping.</strong></p>`;

    const longDescFr = `<p>La Chaussure FDCP Plateforme Chunky Clout\u00e9e \u00e0 Lacets - une pi\u00e8ce d\u00e9claration audacieuse qui canalise l'esth\u00e9tique punk Y2K, le dark academia, et la mode alternative en une silhouette inoubliable. Disponible en cuir verni Noir et Bordeaux spectaculaire avec sangles m\u00e9talliques clout\u00e9es argent\u00e9es, semelle plateforme chunky dentel\u00e9e, et emballage FDCP signature.</p>
<ul>
<li>Empeigne en cuir verni premium avec finition miroir haute brillance</li>
<li>Doubles sangles m\u00e9talliques crois\u00e9es clout\u00e9es argent</li>
<li>Accent m\u00e9tallique argent\u00e9 sur la langue</li>
<li>Semelle plateforme chunky dentel\u00e9e pour hauteur et pr\u00e9sence street</li>
<li>Fermeture \u00e0 lacets classiques avec cordons noirs en coton</li>
<li>Plaque m\u00e9tallique FDCP sur le talon</li>
<li>Livr\u00e9e avec la bo\u00eete iconique FDCP imprim\u00e9e \u00e9clair</li>
</ul>
<table class="product-spec-table">
<tr><th>Marque</th><td>FDCP</td></tr>
<tr><th>Mod\u00e8le</th><td>Plateforme Chunky Clout\u00e9e \u00e0 Lacets</td></tr>
<tr><th>Couleur</th><td>Noir / Bordeaux Verni</td></tr>
<tr><th>Mati\u00e8re</th><td>Cuir verni + sangles m\u00e9talliques clout\u00e9es argent</td></tr>
<tr><th>Semelle</th><td>Plateforme chunky dentel\u00e9e</td></tr>
<tr><th>D\u00e9tail Signature</th><td>Sangles clout\u00e9es + langue m\u00e9tallique + plateforme</td></tr>
<tr><th>Fermeture</th><td>Lacets + sangles clout\u00e9es d\u00e9coratives</td></tr>
<tr><th>Style</th><td>Alt-fashion / Punk Y2K / Dark academia</td></tr>
<tr><th>Tailles</th><td>40-45 EU</td></tr>
<tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
<tr><th>Inclus</th><td>Bo\u00eete FDCP d'origine</td></tr>
</table>
<p>Ces chaussures sont pour la cliente qui refuse de passer inaper\u00e7ue. Portez-les avec une mini-jupe \u00e0 carreaux et des collants r\u00e9sille pour une \u00e9nergie goth Y2K authentique, glissez-les sous un pantalon cargo large pour un streetwear dark academia, ou associez-les \u00e0 un blazer ajust\u00e9 et un jean noir pour une sophistication punk \u00e9lev\u00e9e. Le cuir verni haute brillance capte magnifiquement la lumi\u00e8re, et les sangles clout\u00e9es ajoutent un s\u00e9rieux edge \u00e0 toute tenue.</p>
<p><strong>Pi\u00e8ce d\u00e9claration - stock limit\u00e9. Livraison same-day Abuja avant 11h. Livraison rapide dans tout le Nigeria.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "FDCP Chunky Platform Studded Lace-Up - Black/Burgundy",
      nameFr: "Chaussure FDCP Plateforme Chunky Clout\u00e9e - Noir/Bordeaux",
      slug: slugEn,
      slugFr: slugFr,
      description: "Bold FDCP chunky platform lace-up with silver-studded straps in Black/Burgundy patent. Y2K punk statement piece.",
      descriptionFr: "Audacieuse chaussure FDCP plateforme chunky \u00e0 lacets avec sangles clout\u00e9es argent en verni Noir/Bordeaux. Pi\u00e8ce d\u00e9claration punk Y2K.",
      shortDescription: "FDCP Chunky Platform Lace-Up in Black/Burgundy patent with silver studded straps. Y2K alt-fashion. Sizes 40-45. Ships from Abuja.",
      shortDescriptionFr: "Chaussure FDCP Plateforme Chunky \u00e0 Lacets en verni Noir/Bordeaux avec sangles clout\u00e9es argent. Alt-fashion Y2K. Tailles 40-45. Exp\u00e9di\u00e9 d'Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: costNgn.toString(),
      supplierPrice: costNgn.toString(),
      supplierCurrency: "NGN",
      category: "casual",
      brand: "FDCP",
      sizes: sizes,
      colors: colors,
      imageUrl: imageUrl,
      images: images,
      stock: 15,
      featured: true,
      active: true,
      material: "Patent leather + silver-studded metal straps",
      sku: "NDZ-FDC-CPS-BB01",
      tags: tagsEn,
      tagsFr: tagsFr,
      seoTitle: "FDCP Chunky Platform Studded Lace-Up Black Burgundy | New Deal Zone",
      seoTitleFr: "Chaussure FDCP Plateforme Chunky Clout\u00e9e Noir Bordeaux | New Deal Zone",
      metaDescription: "Shop FDCP chunky platform studded lace-up in Black/Burgundy patent. Y2K punk alt-fashion statement piece. Sizes 40-45. Same-day delivery in Abuja.",
      metaDescriptionFr: "Chaussure FDCP plateforme chunky clout\u00e9e en verni Noir/Bordeaux. Pi\u00e8ce d\u00e9claration alt-fashion punk Y2K. Tailles 40-45. Livraison same-day \u00e0 Abuja.",
      focusKeyphrase: "fdcp chunky platform studded shoes",
      focusKeyphraseFr: "chaussure fdcp plateforme clout\u00e9e",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slugEn}`,
      originCountry: "NG",
      originCity: "Abuja",
    }).returning();

    const product = inserted[0];
    if (!product) throw new Error("Insert failed");

    const reviewData = [
      { name: "Adaora Nnaji",       daysAgo: 4,   rating: 5, en: "These are SO different from anything else I own! The patent leather is glossy perfection and the studded straps give the perfect edge. Chunky platform is comfortable too. Compliments non-stop in Abuja!", fr: "Elles sont tellement diff\u00e9rentes de tout ce que je poss\u00e8de ! Le cuir verni est d'une brillance parfaite et les sangles clout\u00e9es donnent l'edge parfait. La plateforme chunky est confortable aussi. Compliments non-stop \u00e0 Abuja !", verified: true },
      { name: "Ngozi Okafor",       daysAgo: 17,  rating: 5, en: "Been looking for authentic Y2K goth pieces and these deliver. The build quality is impressive - the studs are properly attached, the leather feels premium. Perfect for my dark academia aesthetic.", fr: "Je cherchais des pi\u00e8ces goth Y2K authentiques et celles-ci livrent. La qualit\u00e9 de fabrication est impressionnante - les clous sont bien attach\u00e9s, le cuir semble premium. Parfait pour mon esth\u00e9tique dark academia.", verified: true },
      { name: "Blessing Adekunle",  daysAgo: 32,  rating: 5, en: "Ordered on Sunday, delivered Monday morning in Abuja. Same-day service is real! The shoes look even better in person. Sizing is spot on, went with my usual EU 41 and they fit perfectly.", fr: "Command\u00e9es dimanche, livr\u00e9es lundi matin \u00e0 Abuja. Le service same-day est r\u00e9el ! Les chaussures sont encore plus belles en vrai. Taille juste, j'ai pris ma taille habituelle EU 41 et elles vont parfaitement.", verified: true },
      { name: "Marie Lefebvre",     daysAgo: 68,  rating: 4, en: "Love the alt-fashion vibe and the platform gives great height. Patent leather does show fingerprints easily so keep a cloth handy. Otherwise absolutely stunning and unique.", fr: "J'adore le vibe alt-fashion et la plateforme donne une belle hauteur. Le cuir verni montre facilement les empreintes donc gardez un chiffon \u00e0 port\u00e9e. Sinon absolument magnifiques et uniques.", verified: false },
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
      message: "FDCP Chunky Platform Studded Lace-Up seeded successfully",
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