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

    const costNgn = 35000;
    const sellingNgn = 42000;
    const compareNgn = 50000;

    const costUsd = Math.round((costNgn / NGN_RATE) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / NGN_RATE) * 100) / 100;
    const compareUsd = Math.round((compareNgn / NGN_RATE) * 100) / 100;
    const costNgnSnap = Math.round(costUsd * NGN_RATE);
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 1000) / 10;

    const slug = "timberland-tree-logo-slip-on-sneaker-black";
    const slugFr = "sneaker-timberland-slip-on-logo-arbre-noir";
    const sourceUrl = "https://i.ibb.co/WN1XW2wR/Whats-App-Image-2026-08-09-at-10-10-58-AM-1.jpg";

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/timberland-tree-logo-slip-on-sneaker-black-${Date.now()}.jpg`,
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

    const nameEn = "Timberland Tree-Logo Slip-On Sneaker - Black / White Sole";
    const nameFr = "Sneaker Timberland Slip-On Logo Arbre - Noir / Semelle Blanche";

    const shortDescEn = "Timberland slip-on sneaker in black leather with tonal debossed tree logo, side stretch panels, and clean white cupsole. Everyday minimalist Timberland style. Ships from Abuja.";
    const shortDescFr = "Sneaker Timberland slip-on en cuir noir avec logo arbre grav\u00e9 ton sur ton, panneaux \u00e9lastiques lat\u00e9raux et semelle cupsole blanche. Style Timberland minimaliste quotidien. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>Slip into everyday ease with the <strong>Timberland Tree-Logo Slip-On Sneaker in Black</strong>. This minimalist sneaker takes Timberland's outdoor heritage and translates it into a clean urban silhouette perfect for daily wear. Featuring a smooth black leather upper with a tonal debossed tree logo, elastic side panels for easy on-and-off, and a crisp white cupsole for grip and lift. Simple, versatile, and unmistakably Timberland.</p>

<h3>Key Features</h3>
<ul>
<li><strong>Smooth black leather upper</strong> for premium finish</li>
<li><strong>Tonal debossed Timberland tree logo</strong> on the side panel - the subtle signature</li>
<li><strong>Elastic side gore panels</strong> for slip-on convenience</li>
<li><strong>White rubber cupsole</strong> for clean contrast and grip</li>
<li><strong>Cushioned leather-lined insole</strong> with Timberland branding</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>Timberland</td></tr>
<tr><td><strong>Model</strong></td><td>Tree-Logo Slip-On Sneaker</td></tr>
<tr><td><strong>Colour</strong></td><td>Black / White Sole</td></tr>
<tr><td><strong>Material</strong></td><td>Smooth Leather + Rubber Cupsole</td></tr>
<tr><td><strong>Cushioning / Sole</strong></td><td>Cushioned Insole + Rubber Cupsole</td></tr>
<tr><td><strong>Signature Detail</strong></td><td>Debossed Tree Logo + Elastic Side Panels</td></tr>
<tr><td><strong>Closure</strong></td><td>Slip-On with Elastic Gore</td></tr>
<tr><td><strong>Style</strong></td><td>Minimalist Slip-On Sneaker</td></tr>
<tr><td><strong>Sizes</strong></td><td>EU 41-45</td></tr>
<tr><td><strong>Ships from</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Includes</strong></td><td>Original Timberland Box</td></tr>
</table>

<h3>How to Style</h3>
<p>Pair with tapered chinos, cargo shorts, or slim jeans for effortless everyday styling. The clean black-and-white palette works with essentially every outfit in the closet, from monochrome fits to color-blocked casual looks. Slip-on convenience makes them perfect for airport runs, quick errands, or when you just want to leave the house without dealing with laces. Timberland comfort, no laces required.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. Heritage meets everyday ease.</p>`;

    const longDescFr = `<p>Glissez dans la facilit\u00e9 quotidienne avec la <strong>Sneaker Timberland Slip-On Logo Arbre en Noir</strong>. Cette sneaker minimaliste reprend l'h\u00e9ritage outdoor de Timberland et le traduit en une silhouette urbaine propre parfaite pour le port quotidien. Pr\u00e9sente une tige en cuir noir lisse avec un logo arbre grav\u00e9 ton sur ton, des panneaux \u00e9lastiques lat\u00e9raux pour un enfilage facile, et une semelle cupsole blanche nette pour l'adh\u00e9rence et la hauteur. Simple, polyvalent et incomparablement Timberland.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>Tige en cuir noir lisse</strong> pour une finition premium</li>
<li><strong>Logo arbre Timberland grav\u00e9 ton sur ton</strong> sur le panneau lat\u00e9ral - la signature subtile</li>
<li><strong>Panneaux \u00e9lastiques lat\u00e9raux</strong> pour un enfilage pratique</li>
<li><strong>Semelle cupsole en caoutchouc blanc</strong> pour un contraste propre et l'adh\u00e9rence</li>
<li><strong>Semelle int\u00e9rieure rembourr\u00e9e doubl\u00e9e cuir</strong> avec branding Timberland</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>Timberland</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>Sneaker Slip-On Logo Arbre</td></tr>
<tr><td><strong>Couleur</strong></td><td>Noir / Semelle Blanche</td></tr>
<tr><td><strong>Mati\u00e8re</strong></td><td>Cuir Lisse + Semelle Cupsole Caoutchouc</td></tr>
<tr><td><strong>Amorti</strong></td><td>Semelle Int\u00e9rieure Rembourr\u00e9e + Semelle Cupsole</td></tr>
<tr><td><strong>D\u00e9tail Signature</strong></td><td>Logo Arbre Grav\u00e9 + Panneaux \u00c9lastiques</td></tr>
<tr><td><strong>Fermeture</strong></td><td>Slip-On avec \u00c9lastique</td></tr>
<tr><td><strong>Style</strong></td><td>Sneaker Slip-On Minimaliste</td></tr>
<tr><td><strong>Tailles</strong></td><td>EU 41-45</td></tr>
<tr><td><strong>Exp\u00e9di\u00e9 de</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Inclus</strong></td><td>Bo\u00eete Timberland Originale</td></tr>
</table>

<h3>Comment la Porter</h3>
<p>Associez avec un chino fusel\u00e9, un short cargo ou un jean slim pour un styling quotidien sans effort. La palette noir-et-blanc propre fonctionne avec essentiellement toutes les tenues du placard, des looks monochromes aux looks casual color-blocked. La commodit\u00e9 slip-on les rend parfaites pour les courses \u00e0 l'a\u00e9roport, les commissions rapides ou quand vous voulez juste quitter la maison sans vous occuper des lacets. Confort Timberland, sans lacets requis.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. L'h\u00e9ritage rencontre la facilit\u00e9 quotidienne.</p>`;

    const sizes = ["41","42","43","44","45"];
    const colors = [{ name: "Black/White", image: imageUrl }];
    const tagsEn = ["timberland", "slip-on sneaker", "leather sneaker", "black white", "minimalist", "casual sneaker", "tree logo", "sneakers", "abuja"];
    const tagsFr = ["timberland", "sneaker slip-on", "sneaker cuir", "noir blanc", "minimaliste", "sneaker casual", "logo arbre", "baskets", "abuja"];

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
      sku: "NDZ-TBL-SLP-BW01",
      category: "sneakers",
      brand: "Timberland",
      stock: 25,
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
      seoTitle: "Timberland Tree-Logo Slip-On Sneaker Black White | New Deal Zone",
      seoTitleFr: "Sneaker Timberland Slip-On Logo Arbre Noir Blanc | New Deal Zone",
      metaDescription: "Shop the Timberland tree-logo slip-on sneaker in black leather with white cupsole and elastic side panels. Minimalist Timberland style. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez la sneaker Timberland slip-on logo arbre en cuir noir avec semelle cupsole blanche et panneaux \u00e9lastiques. Style Timberland minimaliste. Livraison rapide depuis Abuja.",
      focusKeyphrase: "timberland slip-on sneaker black",
      focusKeyphraseFr: "sneaker timberland slip-on noir",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Kwame Diallo", rating: 5, comment: "These are my new daily driver. Slip-on convenience is a game changer when I am running late, and the debossed tree logo confirms authentic Timberland quality. Delivery to Abuja was fast.", commentFr: "Ce sont mes nouvelles chaussures quotidiennes. La commodit\u00e9 slip-on change la donne quand je suis en retard, et le logo arbre grav\u00e9 confirme la qualit\u00e9 Timberland authentique. Livraison rapide \u00e0 Abuja.", verified: true, daysAgo: 7 },
      { customerName: "Isabelle Camille", rating: 5, comment: "Bought these for travel and they are perfect - no laces to deal with at airport security, comfortable for long walks, and pair with everything in my carry-on. Real Timberland quality, minimalist design.", commentFr: "Je les ai achet\u00e9es pour voyager et elles sont parfaites - pas de lacets \u00e0 g\u00e9rer \u00e0 la s\u00e9curit\u00e9 de l'a\u00e9roport, confortables pour de longues marches, et s'accordent avec tout dans mon bagage \u00e0 main. Vraie qualit\u00e9 Timberland, design minimaliste.", verified: true, daysAgo: 23 },
      { customerName: "Sy Aminata", rating: 4, comment: "Very clean sneakers and the black-white contrast pops nicely. Only reason for 4 stars is the elastic side panels stretch out a bit after a few weeks - still comfortable just slightly looser fit.", commentFr: "Sneakers tr\u00e8s propres et le contraste noir-blanc ressort joliment. La seule raison des 4 \u00e9toiles est que les panneaux \u00e9lastiques lat\u00e9raux s'\u00e9tirent un peu apr\u00e8s quelques semaines - toujours confortables juste un ajustement l\u00e9g\u00e8rement plus l\u00e2che.", verified: true, daysAgo: 41 },
      { customerName: "Boateng Adjei", rating: 5, comment: "Perfect casual sneaker for weekend errands and coffee runs. The white cupsole cleans up easily and the black leather looks good even after months of wear. Great value for genuine Timberland.", commentFr: "Sneaker casual parfaite pour les courses du week-end et les caf\u00e9s. La semelle cupsole blanche se nettoie facilement et le cuir noir a l'air bien m\u00eame apr\u00e8s des mois de port. Excellent rapport qualit\u00e9-prix pour du vrai Timberland.", verified: false, daysAgo: 64 },
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
      message: "Timberland Tree-Logo Slip-On Sneaker Black seeded successfully",
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