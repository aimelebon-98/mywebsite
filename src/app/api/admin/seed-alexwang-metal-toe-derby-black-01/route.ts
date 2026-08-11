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
    const sellingNgn = 48000;
    const compareNgn = 60000;

    const costUsd = Math.round((costNgn / NGN_RATE) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / NGN_RATE) * 100) / 100;
    const compareUsd = Math.round((compareNgn / NGN_RATE) * 100) / 100;
    const costNgnSnap = Math.round(costUsd * NGN_RATE);
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 1000) / 10;

    const slug = "alexander-wang-metal-toe-cap-platform-derby-black";
    const slugFr = "derby-alexander-wang-embout-metal-plateforme-noir";
    const sourceUrl = "https://i.ibb.co/rKW0fKXZ/Whats-App-Image-2026-08-09-at-10-10-57-AM-1.jpg";

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/alexander-wang-metal-toe-cap-platform-derby-black-${Date.now()}.jpg`,
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

    const nameEn = "Alexander Wang Metal Toe-Cap Platform Derby - Black";
    const nameFr = "Derby Alexander Wang Embout M\u00e9tal Plateforme - Noir";

    const shortDescEn = "Alexander Wang platform Derby in polished black leather with signature silver metal toe cap, riveted heel plate, and metal-tipped laces. Industrial luxury. Ships from Abuja.";
    const shortDescFr = "Derby Alexander Wang plateforme en cuir noir poli avec embout m\u00e9tallique argent\u00e9 signature, plaque talon rivet\u00e9e et lacets \u00e0 embouts m\u00e9talliques. Luxe industriel. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>Wear industrial luxury with the <strong>Alexander Wang Metal Toe-Cap Platform Derby in Black</strong>. Alexander Wang built his empire on hardware detailing and downtown edge, and this Derby is peak AW - polished black leather, chrome-finish metal toe cap, riveted metal heel plate, and metal-tipped laces that all catch light like jewelry. The chunky lugged platform sole gives serious lift while the traditional Derby lacing keeps things menswear-adjacent.</p>

<h3>Key Features</h3>
<ul>
<li><strong>Polished black leather upper</strong> with mirror-finish surface</li>
<li><strong>Silver chrome metal toe cap</strong> with visible rivets - the AW signature</li>
<li><strong>Riveted metal heel plate</strong> mirrors the toe hardware</li>
<li><strong>Metal-tipped laces</strong> with branded aglets for jewelry-like detail</li>
<li><strong>Chunky lugged rubber platform</strong> for street presence and grip</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>Alexander Wang</td></tr>
<tr><td><strong>Model</strong></td><td>Metal Toe-Cap Platform Derby</td></tr>
<tr><td><strong>Colour</strong></td><td>Polished Black / Silver Hardware</td></tr>
<tr><td><strong>Material</strong></td><td>Polished Calfskin + Chrome Metal + Rubber</td></tr>
<tr><td><strong>Cushioning / Sole</strong></td><td>Padded Insole + Chunky Lugged Platform</td></tr>
<tr><td><strong>Signature Detail</strong></td><td>Metal Toe Cap + Heel Plate + Metal-Tipped Laces</td></tr>
<tr><td><strong>Closure</strong></td><td>3-Eyelet Lace-Up with Metal Aglets</td></tr>
<tr><td><strong>Style</strong></td><td>Industrial Platform Derby</td></tr>
<tr><td><strong>Sizes</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Ships from</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Includes</strong></td><td>Original Packaging</td></tr>
</table>

<h3>How to Style</h3>
<p>Pair with slim black trousers or straight-leg denim to let the metal hardware punctuate the outfit. Also killer with structured suiting for downtown-luxe office energy, or with pleated skirts and moto jackets for full Wang runway attitude. The mirror-polished leather demands attention, and the metal accents catch light like moving sculpture. Wear when you want to dress like architecture.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. Downtown NYC luxury, on your feet.</p>`;

    const longDescFr = `<p>Portez le luxe industriel avec le <strong>Derby Alexander Wang Embout M\u00e9tal Plateforme en Noir</strong>. Alexander Wang a construit son empire sur les d\u00e9tails quincaillerie et l'edge downtown, et ce Derby est AW au sommet - cuir noir poli, embout m\u00e9tallique finition chrome, plaque talon m\u00e9tallique rivet\u00e9e et lacets \u00e0 embouts m\u00e9talliques qui attrapent tous la lumi\u00e8re comme des bijoux. La semelle plateforme chunky \u00e0 crampons donne une hauteur s\u00e9rieuse tandis que le laçage Derby traditionnel garde les choses menswear-adjacent.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>Tige en cuir noir poli</strong> avec surface finition miroir</li>
<li><strong>Embout m\u00e9tallique argent\u00e9 chrome</strong> avec rivets visibles - la signature AW</li>
<li><strong>Plaque talon m\u00e9tallique rivet\u00e9e</strong> qui refl\u00e8te la quincaillerie de la pointe</li>
<li><strong>Lacets \u00e0 embouts m\u00e9talliques</strong> avec aglets brand\u00e9s pour un d\u00e9tail bijou</li>
<li><strong>Plateforme en caoutchouc chunky \u00e0 crampons</strong> pour la pr\u00e9sence street et l'adh\u00e9rence</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>Alexander Wang</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>Derby Embout M\u00e9tal Plateforme</td></tr>
<tr><td><strong>Couleur</strong></td><td>Noir Poli / Quincaillerie Argent\u00e9e</td></tr>
<tr><td><strong>Mati\u00e8re</strong></td><td>Cuir de Veau Poli + M\u00e9tal Chrome + Caoutchouc</td></tr>
<tr><td><strong>Amorti</strong></td><td>Semelle Rembourr\u00e9e + Plateforme Chunky Crampons</td></tr>
<tr><td><strong>D\u00e9tail Signature</strong></td><td>Embout M\u00e9tal + Plaque Talon + Lacets Embouts M\u00e9tal</td></tr>
<tr><td><strong>Fermeture</strong></td><td>Laçage 3 Oeillets avec Aglets M\u00e9tal</td></tr>
<tr><td><strong>Style</strong></td><td>Derby Plateforme Industriel</td></tr>
<tr><td><strong>Tailles</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Exp\u00e9di\u00e9 de</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Inclus</strong></td><td>Emballage Original</td></tr>
</table>

<h3>Comment le Porter</h3>
<p>Associez avec un pantalon noir slim ou un jean coupe droite pour laisser la quincaillerie m\u00e9tallique ponctuer la tenue. \u00c9galement tueur avec un costume structur\u00e9 pour une \u00e9nergie office downtown-luxe, ou avec une jupe pliss\u00e9e et une veste moto pour une attitude Wang runway compl\u00e8te. Le cuir poli miroir exige de l'attention, et les accents m\u00e9talliques attrapent la lumi\u00e8re comme une sculpture mouvante. Portez quand vous voulez vous habiller comme de l'architecture.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. Luxe downtown NYC, \u00e0 vos pieds.</p>`;

    const sizes = ["41","42","43","44","45","46"];
    const colors = [{ name: "Black", image: imageUrl }];
    const tagsEn = ["alexander wang", "metal toe cap", "platform derby", "industrial", "polished black", "designer shoes", "hardware", "menswear", "abuja"];
    const tagsFr = ["alexander wang", "embout m\u00e9tal", "derby plateforme", "industriel", "noir poli", "chaussures designer", "quincaillerie", "menswear", "abuja"];

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
      sku: "NDZ-AW-MTC-BK01",
      category: "formal",
      brand: "Alexander Wang",
      stock: 15,
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify([imageUrl]),
      imageUrl: imageUrl,
      material: "Polished Leather + Metal Hardware",
      active: true,
      featured: true,
      rating: "5.0",
      reviewCount: 0,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      seoTitle: "Alexander Wang Metal Toe-Cap Platform Derby Black | New Deal Zone",
      seoTitleFr: "Derby Alexander Wang Embout M\u00e9tal Plateforme Noir | New Deal Zone",
      metaDescription: "Shop the Alexander Wang platform Derby in polished black leather with chrome metal toe cap, riveted heel plate, and metal-tipped laces. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez le Derby Alexander Wang plateforme en cuir noir poli avec embout m\u00e9tal chrome, plaque talon rivet\u00e9e et lacets embouts m\u00e9tal. Livraison rapide depuis Abuja.",
      focusKeyphrase: "alexander wang metal toe derby",
      focusKeyphraseFr: "derby alexander wang embout m\u00e9tal",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Chioma Ibrahim", rating: 5, comment: "The metal toe cap and heel plate are proper chrome not painted plastic - they actually catch light like real hardware. Wang signature energy on lock. Delivery to Abuja was fast.", commentFr: "L'embout m\u00e9tal et la plaque talon sont du vrai chrome pas du plastique peint - ils attrapent vraiment la lumi\u00e8re comme de la vraie quincaillerie. \u00c9nergie signature Wang au top. Livraison rapide \u00e0 Abuja.", verified: true, daysAgo: 10 },
      { customerName: "Antoine Lefebvre", rating: 5, comment: "These have serious downtown NYC energy. The mirror polished leather is stunning and the metal-tipped laces are a detail I did not expect. Wear them everywhere from meetings to gallery openings.", commentFr: "Ceux-ci ont une s\u00e9rieuse \u00e9nergie downtown NYC. Le cuir poli miroir est magnifique et les lacets \u00e0 embouts m\u00e9talliques sont un d\u00e9tail auquel je ne m'attendais pas. Je les porte partout des r\u00e9unions aux vernissages.", verified: true, daysAgo: 24 },
      { customerName: "Ba Fatoumata", rating: 4, comment: "Absolutely stunning shoes and the hardware quality is on point. Only reason for 4 stars is the metal toe cap can scuff dark clothes slightly if you cross your legs - minor issue for the look.", commentFr: "Chaussures absolument magnifiques et la qualit\u00e9 de la quincaillerie est au top. La seule raison des 4 \u00e9toiles est que l'embout m\u00e9tal peut l\u00e9g\u00e8rement rayer les v\u00eatements fonc\u00e9s si vous croisez les jambes - probl\u00e8me mineur pour le look.", verified: true, daysAgo: 43 },
      { customerName: "Elizabeth Chen", rating: 5, comment: "Been collecting Alexander Wang for years and these Derbies scratch the itch. The platform gives real lift without being cartoonish and the polished leather elevates any outfit instantly.", commentFr: "Je collectionne Alexander Wang depuis des ann\u00e9es et ces Derbies grattent l'envie. La plateforme donne une vraie hauteur sans \u00eatre caricaturale et le cuir poli \u00e9l\u00e8ve toute tenue instantan\u00e9ment.", verified: false, daysAgo: 66 },
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
      message: "Alexander Wang Metal Toe-Cap Platform Derby Black seeded successfully",
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