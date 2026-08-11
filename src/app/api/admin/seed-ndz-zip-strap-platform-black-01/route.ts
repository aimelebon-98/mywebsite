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
    const sellingNgn = 48000;
    const compareNgn = 60000;

    const costUsd = Math.round((costNgn / NGN_RATE) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / NGN_RATE) * 100) / 100;
    const compareUsd = Math.round((compareNgn / NGN_RATE) * 100) / 100;
    const costNgnSnap = Math.round(costUsd * NGN_RATE);
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 1000) / 10;

    const slug = "ndz-chunky-zip-strap-platform-derby-black";
    const slugFr = "derby-ndz-plateforme-chunky-zip-noir";
    const sourceUrl = "https://i.ibb.co/hzcCB01/Whats-App-Image-2026-08-09-at-10-10-57-AM.jpg";

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/ndz-chunky-zip-strap-platform-derby-black-${Date.now()}.jpg`,
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

    const nameEn = "NDZ Chunky Zip-Strap Platform Derby - Matte Black";
    const nameFr = "Derby NDZ Plateforme Chunky Zip - Noir Mat";

    const shortDescEn = "NDZ chunky platform Derby with decorative zip-detail strap in matte black leather. Utility lugged sole, minimalist techwear silhouette. Ships from Abuja.";
    const shortDescFr = "Derby NDZ plateforme chunky avec lani\u00e8re \u00e0 zip d\u00e9coratif en cuir noir mat. Semelle crampons utilitaire, silhouette techwear minimaliste. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>Step into modern utility with the <strong>NDZ Chunky Zip-Strap Platform Derby in Matte Black</strong>. This exclusive silhouette fuses classic Derby construction with contemporary techwear detailing - a wide decorative zip strap crosses the vamp, the chunky platform sole delivers street presence, and the matte black leather keeps everything read as stealth-luxe. Perfect for anyone seeking designer-adjacent style without the designer logo tax.</p>

<h3>Key Features</h3>
<ul>
<li><strong>Matte black leather upper</strong> with clean minimalist finish</li>
<li><strong>Decorative silver zip strap</strong> across the vamp for techwear edge</li>
<li><strong>Chunky lugged rubber platform</strong> for maximum lift and grip</li>
<li><strong>Round toe box</strong> for a modern relaxed silhouette</li>
<li><strong>Padded collar and tongue</strong> for all-day comfort</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>NDZ Exclusive</td></tr>
<tr><td><strong>Model</strong></td><td>Chunky Zip-Strap Platform Derby</td></tr>
<tr><td><strong>Colour</strong></td><td>Matte Black</td></tr>
<tr><td><strong>Material</strong></td><td>Smooth Leather + Chunky Rubber Sole</td></tr>
<tr><td><strong>Cushioning / Sole</strong></td><td>Padded Insole + Chunky Lugged Platform</td></tr>
<tr><td><strong>Signature Detail</strong></td><td>Silver Zip Strap + Platform Lugged Sole</td></tr>
<tr><td><strong>Closure</strong></td><td>Slip-On with Decorative Strap</td></tr>
<tr><td><strong>Style</strong></td><td>Techwear Platform Derby</td></tr>
<tr><td><strong>Sizes</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Ships from</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Includes</strong></td><td>Original Packaging</td></tr>
</table>

<h3>How to Style</h3>
<p>Pair with tapered black cargo pants, techwear layers, or drop-crotch trousers for full modern-utility energy. Also works with slim black denim and an oversized bomber for elevated streetwear. The matte finish reads sophisticated in low-light settings while the zip detail catches attention up close. Ideal for anyone building a designer-inspired wardrobe on a smart budget.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. Contemporary silhouette, exclusive to New Deal Zone.</p>`;

    const longDescFr = `<p>Entrez dans l'utilit\u00e9 moderne avec le <strong>Derby NDZ Plateforme Chunky Zip en Noir Mat</strong>. Cette silhouette exclusive fusionne la construction Derby classique avec les d\u00e9tails techwear contemporains - une large lani\u00e8re zip d\u00e9corative traverse le vamp, la semelle plateforme chunky apporte une pr\u00e9sence street, et le cuir noir mat garde tout dans un registre stealth-luxe. Parfait pour quiconque cherche un style designer-adjacent sans la taxe du logo designer.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>Tige en cuir noir mat</strong> avec finition minimaliste propre</li>
<li><strong>Lani\u00e8re zip argent\u00e9e d\u00e9corative</strong> \u00e0 travers le vamp pour un edge techwear</li>
<li><strong>Plateforme en caoutchouc chunky \u00e0 crampons</strong> pour hauteur et adh\u00e9rence maximales</li>
<li><strong>Pointe arrondie</strong> pour une silhouette moderne d\u00e9contract\u00e9e</li>
<li><strong>Col et languette rembourr\u00e9s</strong> pour un confort toute la journ\u00e9e</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>NDZ Exclusif</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>Derby Plateforme Chunky Zip</td></tr>
<tr><td><strong>Couleur</strong></td><td>Noir Mat</td></tr>
<tr><td><strong>Mati\u00e8re</strong></td><td>Cuir Lisse + Semelle Chunky Caoutchouc</td></tr>
<tr><td><strong>Amorti</strong></td><td>Semelle Rembourr\u00e9e + Plateforme Chunky Crampons</td></tr>
<tr><td><strong>D\u00e9tail Signature</strong></td><td>Lani\u00e8re Zip Argent\u00e9e + Semelle Plateforme Crampons</td></tr>
<tr><td><strong>Fermeture</strong></td><td>Slip-On avec Lani\u00e8re D\u00e9corative</td></tr>
<tr><td><strong>Style</strong></td><td>Derby Plateforme Techwear</td></tr>
<tr><td><strong>Tailles</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Exp\u00e9di\u00e9 de</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Inclus</strong></td><td>Emballage Original</td></tr>
</table>

<h3>Comment le Porter</h3>
<p>Associez avec un pantalon cargo noir fusel\u00e9, des couches techwear ou un pantalon drop-crotch pour une \u00e9nergie utilit\u00e9-moderne compl\u00e8te. Fonctionne aussi avec un jean noir slim et un bomber oversized pour un streetwear \u00e9lev\u00e9. La finition mate lit sophistiqu\u00e9 dans les environnements en lumi\u00e8re tamis\u00e9e tandis que le d\u00e9tail zip attire l'attention de pr\u00e8s. Id\u00e9al pour quiconque construit une garde-robe designer-inspir\u00e9e avec un budget malin.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. Silhouette contemporaine, exclusive \u00e0 New Deal Zone.</p>`;

    const sizes = ["41","42","43","44","45","46"];
    const colors = [{ name: "Matte Black", image: imageUrl }];
    const tagsEn = ["ndz exclusive", "platform derby", "chunky derby", "zip strap", "techwear", "matte black", "utility shoes", "casual", "abuja"];
    const tagsFr = ["ndz exclusif", "derby plateforme", "derby chunky", "lani\u00e8re zip", "techwear", "noir mat", "chaussures utilitaires", "casual", "abuja"];

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
      sku: "NDZ-EXC-ZSP-BK01",
      category: "casual",
      brand: "NDZ",
      stock: 20,
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify([imageUrl]),
      imageUrl: imageUrl,
      material: "Smooth Leather + Rubber",
      active: true,
      featured: false,
      rating: "5.0",
      reviewCount: 0,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      seoTitle: "NDZ Chunky Zip-Strap Platform Derby Matte Black | New Deal Zone",
      seoTitleFr: "Derby NDZ Plateforme Chunky Zip Noir Mat | New Deal Zone",
      metaDescription: "Shop the NDZ exclusive chunky platform Derby with silver zip strap in matte black. Designer-inspired techwear silhouette. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez le Derby NDZ exclusif plateforme chunky avec lani\u00e8re zip argent\u00e9e en noir mat. Silhouette techwear designer-inspir\u00e9e. Livraison rapide depuis Abuja.",
      focusKeyphrase: "chunky platform derby black",
      focusKeyphraseFr: "derby plateforme chunky noir",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Tunde Adaora", rating: 5, comment: "These have serious designer energy without the price tag. The zip strap is functional and looks premium, the platform gives real lift. Delivery to Abuja was quick.", commentFr: "Celles-ci ont une s\u00e9rieuse \u00e9nergie designer sans l'\u00e9tiquette de prix. La lani\u00e8re zip est fonctionnelle et a l'air premium, la plateforme donne une vraie hauteur. Livraison rapide \u00e0 Abuja.", verified: true, daysAgo: 8 },
      { customerName: "Julie Bernard", rating: 5, comment: "Bought these for a friend who lives in techwear and he loves them. The matte black is exactly the finish he wanted, and the chunky sole works with his baggy cargo pants perfectly.", commentFr: "Je les ai achet\u00e9es pour un ami qui vit en techwear et il les adore. Le noir mat est exactement la finition qu'il voulait, et la semelle chunky fonctionne parfaitement avec ses cargos larges.", verified: true, daysAgo: 22 },
      { customerName: "Diagne Awa", rating: 4, comment: "Really cool shoes and the zip detail is a great conversation starter. Only reason for 4 stars is they run a hair large - order half size down if between sizes for a snug fit.", commentFr: "Chaussures vraiment cool et le d\u00e9tail zip est un excellent sujet de conversation. La seule raison des 4 \u00e9toiles est qu'elles taillent un poil grand - prenez une demi-taille en dessous si entre deux tailles pour un ajustement serr\u00e9.", verified: true, daysAgo: 39 },
      { customerName: "Mwangi Wanjiru", rating: 5, comment: "Perfect for anyone wanting a designer-adjacent silhouette without the four-digit price. Build quality is solid and the platform sole is comfortable straight out the box.", commentFr: "Parfait pour quiconque veut une silhouette designer-adjacente sans le prix \u00e0 quatre chiffres. La qualit\u00e9 de construction est solide et la semelle plateforme est confortable directement en sortant de la bo\u00eete.", verified: false, daysAgo: 62 },
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
      message: "NDZ Chunky Zip-Strap Platform Derby seeded successfully",
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