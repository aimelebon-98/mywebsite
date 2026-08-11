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

    const slug = "new-rock-spike-stud-platform-derby-black";
    const slugFr = "derby-new-rock-clous-plateforme-noir";
    const sourceUrl = "https://i.ibb.co/k2dcmsgC/Whats-App-Image-2026-08-09-at-10-10-58-AM.jpg";

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/new-rock-spike-stud-platform-derby-black-${Date.now()}.jpg`,
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

    const nameEn = "New Rock Spike-Stud Platform Derby - Matte Black";
    const nameFr = "Derby New Rock \u00c0 Clous Plateforme - Noir Mat";

    const shortDescEn = "New Rock chunky platform Derby with double spike-stud strap, skull hardware, and signature metal heel plate. Matte black leather goth-punk statement. Ships from Abuja.";
    const shortDescFr = "Derby New Rock plateforme chunky avec double lani\u00e8re \u00e0 clous, quincaillerie t\u00eate de mort et plaque m\u00e9tallique talon signature. D\u00e9claration goth-punk en cuir noir mat. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>Enter the underworld with the <strong>New Rock Spike-Stud Platform Derby in Matte Black</strong>. The Spanish gothic footwear house is legendary for handcrafted metal-armored footwear worn by rock icons, alt-fashion insiders, and gothic subculture veterans since 1988. This chunky platform Derby features their signature spike-stud strap, silver skull rivets, and the unmistakable metal heel plate that confirms authentic New Rock pedigree.</p>

<h3>Key Features</h3>
<ul>
<li><strong>Matte black leather upper</strong> with clean Derby lace-up construction</li>
<li><strong>Double leather strap</strong> layered with silver conical spike studs</li>
<li><strong>Skull-embossed silver rivets</strong> along the strap - the goth signature</li>
<li><strong>Chunky rubber platform sole</strong> for maximum lift and street presence</li>
<li><strong>Signature metal heel plate</strong> confirming authentic New Rock craftsmanship</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>New Rock</td></tr>
<tr><td><strong>Model</strong></td><td>Spike-Stud Platform Derby</td></tr>
<tr><td><strong>Colour</strong></td><td>Matte Black</td></tr>
<tr><td><strong>Material</strong></td><td>Full Leather + Metal Hardware + Rubber</td></tr>
<tr><td><strong>Cushioning / Sole</strong></td><td>Cushioned Insole + Chunky Platform Rubber</td></tr>
<tr><td><strong>Signature Detail</strong></td><td>Spike Studs + Skull Rivets + Metal Heel Plate</td></tr>
<tr><td><strong>Closure</strong></td><td>Lace-Up + Decorative Buckle Strap</td></tr>
<tr><td><strong>Style</strong></td><td>Gothic Platform Derby</td></tr>
<tr><td><strong>Sizes</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Ships from</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Includes</strong></td><td>Original New Rock Box</td></tr>
</table>

<h3>How to Style</h3>
<p>Pair with black skinny jeans, a band tee, and a leather biker jacket for classic goth-punk energy. Also killer with midi skirts, fishnets, and oversized coats for alt-fashion power dressing. The platform adds serious height while the spike hardware ensures nobody mistakes you for wearing basic footwear. Best worn with intention - these are not shoes to blend in.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. Handcrafted rebellion, straight from Spain to your feet.</p>`;

    const longDescFr = `<p>Entrez dans le monde souterrain avec le <strong>Derby New Rock \u00c0 Clous Plateforme en Noir Mat</strong>. La maison de chaussures gothiques espagnole est l\u00e9gendaire pour ses chaussures blind\u00e9es de m\u00e9tal faites main port\u00e9es par les ic\u00f4nes du rock, les initi\u00e9s de la mode alt et les v\u00e9t\u00e9rans de la subculture gothique depuis 1988. Ce Derby plateforme chunky pr\u00e9sente leur lani\u00e8re \u00e0 clous signature, des rivets t\u00eate de mort argent\u00e9s et l'incomparable plaque m\u00e9tallique au talon qui confirme le pedigree New Rock authentique.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>Tige en cuir noir mat</strong> avec construction Derby laçage propre</li>
<li><strong>Double lani\u00e8re en cuir</strong> superpos\u00e9e de clous coniques argent\u00e9s</li>
<li><strong>Rivets argent\u00e9s grav\u00e9s t\u00eate de mort</strong> le long de la lani\u00e8re - la signature goth</li>
<li><strong>Semelle plateforme chunky en caoutchouc</strong> pour une hauteur et une pr\u00e9sence street maximales</li>
<li><strong>Plaque m\u00e9tallique talon signature</strong> confirmant le savoir-faire New Rock authentique</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>New Rock</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>Derby \u00c0 Clous Plateforme</td></tr>
<tr><td><strong>Couleur</strong></td><td>Noir Mat</td></tr>
<tr><td><strong>Mati\u00e8re</strong></td><td>Cuir Pleine + Quincaillerie M\u00e9tal + Caoutchouc</td></tr>
<tr><td><strong>Amorti</strong></td><td>Semelle Rembourr\u00e9e + Plateforme Caoutchouc Chunky</td></tr>
<tr><td><strong>D\u00e9tail Signature</strong></td><td>Clous + Rivets T\u00eate de Mort + Plaque M\u00e9tal Talon</td></tr>
<tr><td><strong>Fermeture</strong></td><td>Laçage + Lani\u00e8re D\u00e9corative</td></tr>
<tr><td><strong>Style</strong></td><td>Derby Plateforme Gothique</td></tr>
<tr><td><strong>Tailles</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Exp\u00e9di\u00e9 de</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Inclus</strong></td><td>Bo\u00eete New Rock Originale</td></tr>
</table>

<h3>Comment le Porter</h3>
<p>Associez avec un jean skinny noir, un t-shirt de groupe et un blouson biker en cuir pour une \u00e9nergie goth-punk classique. \u00c9galement tueur avec des jupes midi, des r\u00e9sille et des manteaux oversized pour un power-dressing alt-fashion. La plateforme ajoute une hauteur s\u00e9rieuse tandis que la quincaillerie \u00e0 clous s'assure que personne ne vous prend pour quelqu'un qui porte des chaussures basiques. Mieux port\u00e9 avec intention - ce ne sont pas des chaussures pour se fondre dans la masse.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. R\u00e9bellion faite main, tout droit d'Espagne \u00e0 vos pieds.</p>`;

    const sizes = ["41","42","43","44","45","46"];
    const colors = [{ name: "Matte Black", image: imageUrl }];
    const tagsEn = ["new rock", "gothic shoes", "spike studs", "platform derby", "punk boots", "matte black", "alt fashion", "goth", "abuja"];
    const tagsFr = ["new rock", "chaussures gothiques", "clous", "derby plateforme", "bottes punk", "noir mat", "mode alt", "goth", "abuja"];

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
      sku: "NDZ-NRC-SPK-BK01",
      category: "casual",
      brand: "New Rock",
      stock: 15,
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify([imageUrl]),
      imageUrl: imageUrl,
      material: "Full Leather + Metal Hardware",
      active: true,
      featured: true,
      rating: "5.0",
      reviewCount: 0,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      seoTitle: "New Rock Spike-Stud Platform Derby Matte Black | New Deal Zone",
      seoTitleFr: "Derby New Rock Clous Plateforme Noir Mat | New Deal Zone",
      metaDescription: "Shop the New Rock spike-stud platform Derby in matte black with skull rivets and signature metal heel plate. Spanish gothic rebellion. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez le Derby New Rock \u00e0 clous plateforme en noir mat avec rivets t\u00eate de mort et plaque m\u00e9tallique talon. R\u00e9bellion gothique espagnole. Livraison rapide depuis Abuja.",
      focusKeyphrase: "new rock spike platform derby",
      focusKeyphraseFr: "derby new rock clous plateforme",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Bola Kunle", rating: 5, comment: "These are IT. The spike studs are proper metal not plastic, the metal heel plate is heavy quality, and the matte black finish is exactly the goth aesthetic I wanted. Abuja delivery was fast.", commentFr: "Ce sont ELLES. Les clous sont en vrai m\u00e9tal pas en plastique, la plaque m\u00e9tallique au talon est de qualit\u00e9 lourde, et la finition noir mat est exactement l'esth\u00e9tique goth que je voulais. Livraison rapide \u00e0 Abuja.", verified: true, daysAgo: 8 },
      { customerName: "Claire Lefebvre", rating: 5, comment: "New Rock quality has not slipped - these feel like the pair I bought 10 years ago. The double strap with skull rivets makes them stand out even in a goth crowd. Total statement.", commentFr: "La qualit\u00e9 New Rock n'a pas baiss\u00e9 - celles-ci se sentent comme la paire que j'ai achet\u00e9e il y a 10 ans. La double lani\u00e8re avec rivets t\u00eate de mort les fait ressortir m\u00eame dans une foule goth. Statement total.", verified: true, daysAgo: 21 },
      { customerName: "Ansah Mensah", rating: 4, comment: "Absolute killer platform Derby but they are HEAVY - takes a couple weeks to build up the leg strength. Worth it once you adjust. Skull hardware is a great conversation starter.", commentFr: "Derby plateforme tueur absolu mais ils sont LOURDS - il faut quelques semaines pour d\u00e9velopper la force des jambes. \u00c7a vaut le coup une fois qu'on s'adapte. La quincaillerie t\u00eate de mort est un excellent sujet de conversation.", verified: true, daysAgo: 40 },
      { customerName: "Marie Roberts", rating: 5, comment: "Bought these for my daughter who is deep in alt fashion and she screams every time she wears them. The platform is dramatic without being unwalkable. Real New Rock energy.", commentFr: "Je les ai achet\u00e9s pour ma fille qui est \u00e0 fond dans la mode alt et elle crie \u00e0 chaque fois qu'elle les porte. La plateforme est dramatique sans \u00eatre inmarchable. Vraie \u00e9nergie New Rock.", verified: false, daysAgo: 63 },
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
      message: "New Rock Spike-Stud Platform Derby Black seeded successfully",
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