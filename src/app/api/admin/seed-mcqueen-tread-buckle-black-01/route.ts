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

    const costNgn = 40000;
    const sellingNgn = 50000;
    const compareNgn = 55000;

    const costUsd = Math.round((costNgn / NGN_RATE) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / NGN_RATE) * 100) / 100;
    const compareUsd = Math.round((compareNgn / NGN_RATE) * 100) / 100;
    const costNgnSnap = Math.round(costUsd * NGN_RATE);
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 1000) / 10;

    const slug = "mcqueen-tread-double-buckle-black";
    const slugFr = "sandale-mcqueen-tread-double-boucle-noir";
    const sourceUrl = "https://i.ibb.co/VWQscqYG/Whats-App-Image-2026-08-09-at-10-11-19-AM-2.jpg";

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/mcqueen-tread-double-buckle-black-${Date.now()}.jpg`,
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

    const nameEn = "Alexander McQueen Tread Double-Buckle Sandal - Black";
    const nameFr = "Sandale Alexander McQueen Tread Double Boucle - Noir";

    const shortDescEn = "Alexander McQueen Tread platform sandal with double silver buckles and signature skull-tread sole. Ships from Abuja.";
    const shortDescFr = "Sandale plateforme Alexander McQueen Tread avec doubles boucles argent\u00e9es et semelle signature crane. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>Command the street in the <strong>Alexander McQueen Tread Double-Buckle Sandal in Black</strong>. Drawing from the house's iconic Tread silhouette, this sandal brings couture-grade craftsmanship to summer footwear. The exaggerated chunky sole, silver-tone buckle hardware, and signature skull-embossed tread make this a statement piece straight from the McQueen archive.</p>

<h3>Key Features</h3>
<ul>
<li><strong>Smooth black leather straps</strong> with double adjustable buckles</li>
<li><strong>Oversized silver-tone hardware</strong> - the McQueen luxury signature</li>
<li><strong>Chunky lugged platform sole</strong> for maximum street presence</li>
<li><strong>Iconic skull-embossed outsole</strong> - the house's runway signature</li>
<li><strong>Reinforced side buckle detail</strong> for structural attitude</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>Alexander McQueen</td></tr>
<tr><td><strong>Model</strong></td><td>Tread Double-Buckle</td></tr>
<tr><td><strong>Colour</strong></td><td>Black / Silver Hardware</td></tr>
<tr><td><strong>Material</strong></td><td>Smooth Calfskin Leather + Rubber Sole</td></tr>
<tr><td><strong>Cushioning / Sole</strong></td><td>Chunky Lugged Rubber Platform</td></tr>
<tr><td><strong>Signature Detail</strong></td><td>Skull-Embossed Tread + Oversized Buckles</td></tr>
<tr><td><strong>Closure</strong></td><td>Double Adjustable Buckle Straps</td></tr>
<tr><td><strong>Style</strong></td><td>Designer Platform Sandal</td></tr>
<tr><td><strong>Sizes</strong></td><td>EU 40-46</td></tr>
<tr><td><strong>Ships from</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Includes</strong></td><td>Original McQueen Box + Dust Bag</td></tr>
</table>

<h3>How to Style</h3>
<p>Wear with tailored black shorts, distressed denim, or oversized cargos for full McQueen edge. The lugged platform reads gothic-luxe against monochrome black, and the silver buckles pop against neutral cream or khaki palettes. Perfect for statement summer looks that mean business.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. Couture-grade streetwear, straight from the runway.</p>`;

    const longDescFr = `<p>Dominez la rue avec la <strong>Sandale Alexander McQueen Tread Double Boucle en Noir</strong>. Inspir\u00e9e de la silhouette Tread ic\u00f4nique de la maison, cette sandale apporte un savoir-faire couture au footwear estival. La semelle chunky exag\u00e9r\u00e9e, la quincaillerie argent\u00e9e et la semelle signature grav\u00e9e du crane en font une pi\u00e8ce statement tout droit sortie des archives McQueen.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>Lani\u00e8res en cuir noir lisse</strong> avec doubles boucles r\u00e9glables</li>
<li><strong>Quincaillerie surdimensionn\u00e9e argent\u00e9e</strong> - la signature luxe McQueen</li>
<li><strong>Semelle plateforme crampons chunky</strong> pour une pr\u00e9sence street maximale</li>
<li><strong>Semelle iconique grav\u00e9e du crane</strong> - la signature runway de la maison</li>
<li><strong>D\u00e9tail lat\u00e9ral boucle renforc\u00e9</strong> pour une attitude structur\u00e9e</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>Alexander McQueen</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>Tread Double Boucle</td></tr>
<tr><td><strong>Couleur</strong></td><td>Noir / Quincaillerie Argent\u00e9e</td></tr>
<tr><td><strong>Mati\u00e8re</strong></td><td>Cuir de Veau Lisse + Semelle Caoutchouc</td></tr>
<tr><td><strong>Amorti</strong></td><td>Plateforme Caoutchouc Crampons Chunky</td></tr>
<tr><td><strong>D\u00e9tail Signature</strong></td><td>Semelle Crane Grav\u00e9e + Boucles Surdimensionn\u00e9es</td></tr>
<tr><td><strong>Fermeture</strong></td><td>Doubles Lani\u00e8res Boucles R\u00e9glables</td></tr>
<tr><td><strong>Style</strong></td><td>Sandale Plateforme Designer</td></tr>
<tr><td><strong>Tailles</strong></td><td>EU 40-46</td></tr>
<tr><td><strong>Exp\u00e9di\u00e9 de</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Inclus</strong></td><td>Bo\u00eete McQueen Originale + Housse</td></tr>
</table>

<h3>Comment la Porter</h3>
<p>Portez avec un short noir taill\u00e9, un jean d\u00e9chir\u00e9 ou des cargos oversized pour un edge McQueen total. La plateforme crampons lit gothique-luxe contre le noir monochrome, et les boucles argent\u00e9es ressortent sur des palettes cr\u00e8me ou kaki. Parfait pour des looks d'\u00e9t\u00e9 statement qui en imposent.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. Streetwear couture, tout droit du podium.</p>`;

    const sizes = ["40","41","42","43","44","45","46"];
    const colors = [{ name: "Black", image: imageUrl }];
    const tagsEn = ["alexander mcqueen", "mcqueen", "tread sandal", "platform sandal", "double buckle", "black leather", "luxury", "designer sandals", "abuja"];
    const tagsFr = ["alexander mcqueen", "mcqueen", "sandale tread", "sandale plateforme", "double boucle", "cuir noir", "luxe", "sandales designer", "abuja"];

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
      sku: "NDZ-MCQ-TRD-BK01",
      category: "sandals",
      brand: "Alexander McQueen",
      stock: 20,
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify([imageUrl]),
      imageUrl: imageUrl,
      material: "Calfskin Leather + Rubber",
      active: true,
      featured: true,
      rating: "5.0",
      reviewCount: 0,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      seoTitle: "Alexander McQueen Tread Double-Buckle Sandal Black | New Deal Zone",
      seoTitleFr: "Sandale McQueen Tread Double Boucle Noir | New Deal Zone",
      metaDescription: "Shop Alexander McQueen Tread double-buckle sandal in black leather with skull-tread sole. Couture-grade luxury streetwear. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez la sandale Alexander McQueen Tread double boucle en cuir noir avec semelle crane. Streetwear luxe couture. Livraison rapide depuis Abuja.",
      focusKeyphrase: "alexander mcqueen tread sandal",
      focusKeyphraseFr: "sandale alexander mcqueen tread",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Adaora Nnamdi", rating: 5, comment: "Absolutely obsessed! The buckles feel super heavy and premium, and the skull tread on the sole is such a McQueen signature. Fits true to size. Arrived Abuja next day.", commentFr: "Absolument obs\u00e9d\u00e9e! Les boucles sont super lourdes et premium, et la semelle grav\u00e9e du crane est une vraie signature McQueen. Taille normale. Arriv\u00e9 \u00e0 Abuja le lendemain.", verified: true, daysAgo: 5 },
      { customerName: "Thomas Rousseau", rating: 5, comment: "The build quality is next level. Leather is smooth, buckles are proper metal not plastic, and the platform gives serious height. Worth every naira for a luxury piece.", commentFr: "La qualit\u00e9 de fabrication est au niveau sup\u00e9rieur. Le cuir est lisse, les boucles sont en vrai m\u00e9tal pas en plastique, et la plateforme donne une belle hauteur. Chaque naira vaut la peine pour une pi\u00e8ce de luxe.", verified: true, daysAgo: 18 },
      { customerName: "Awa Camara", rating: 4, comment: "Stunning sandals but they are quite heavy - takes a day to get used to the weight. Once broken in they are super comfortable and the compliments never stop.", commentFr: "Sandales magnifiques mais assez lourdes - il faut une journ\u00e9e pour s'habituer au poids. Une fois faites au pied elles sont super confortables et les compliments ne s'arr\u00eatent jamais.", verified: true, daysAgo: 39 },
      { customerName: "Blessing Adjei", rating: 5, comment: "Got these to elevate my summer wardrobe and wow. The dust bag and box came included, packaging felt very legit. Pairs perfectly with everything black.", commentFr: "Je les ai prises pour \u00e9lever ma garde-robe d'\u00e9t\u00e9 et wow. La housse et la bo\u00eete \u00e9taient incluses, l'emballage semblait tr\u00e8s l\u00e9gitime. S'accorde parfaitement avec tout ce qui est noir.", verified: false, daysAgo: 71 },
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
      message: "Alexander McQueen Tread Double-Buckle Sandal seeded successfully",
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