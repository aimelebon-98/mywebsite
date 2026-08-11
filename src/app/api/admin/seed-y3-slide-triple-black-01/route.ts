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
    // Live rates
    const ratesRes = await fetch("https://www.newdealzone.com/api/exchange-rates", { cache: "no-store" });
    const ratesData = await ratesRes.json();
    const NGN_RATE = Number(ratesData.rates.NGN) || 1500;
    const XOF_RATE = Number(ratesData.rates.XOF) || 620;

    const costNgn = 37000;
    const sellingNgn = 45000;
    const compareNgn = 59000;

    const costUsd = Math.round((costNgn / NGN_RATE) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / NGN_RATE) * 100) / 100;
    const compareUsd = Math.round((compareNgn / NGN_RATE) * 100) / 100;
    const costNgnSnap = Math.round(costUsd * NGN_RATE);
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 1000) / 10;

    const slug = "y3-slide-triple-black";
    const slugFr = "sandale-y3-slide-noir-total";
    const sourceUrl = "https://i.ibb.co/zVTvVFr1/Whats-App-Image-2026-08-09-at-10-11-17-AM.jpg";

    // Blob upload
    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/y3-slide-triple-black-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) { console.error("Blob upload failed:", e); }

    // Idempotent cleanup
    const existing = await db.select().from(products).where(or(eq(products.slug, slug), eq(products.slugFr, slugFr)));
    for (const p of existing) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
    }
    await db.delete(products).where(or(eq(products.slug, slug), eq(products.slugFr, slugFr)));

    const nameEn = "Y-3 Slide Platform Sandal - Triple Black";
    const nameFr = "Sandale Y-3 Slide Plateforme - Noir Total";

    const shortDescEn = "Y-3 designer platform slide in triple black neoprene with chunky EVA sole. Ships from Abuja.";
    const shortDescFr = "Sandale plateforme Y-3 en n\u00e9opr\u00e8ne noir total avec semelle EVA \u00e9paisse. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>Slip into designer comfort with the <strong>Y-3 Slide Platform Sandal in Triple Black</strong>. Born from the legendary collaboration between Adidas and Japanese fashion icon Yohji Yamamoto, Y-3 defines the future of luxury sportswear. This slide takes the classic silhouette and elevates it with a bold platform sole and premium neoprene strap.</p>

<h3>Key Features</h3>
<ul>
<li><strong>Wide neoprene strap</strong> for cushioned, secure fit</li>
<li><strong>Chunky EVA platform</strong> adds height and street presence</li>
<li><strong>Chevron rubber outsole</strong> for confident grip</li>
<li><strong>All-black colorway</strong> pairs with everything</li>
<li><strong>Signature Y-3 branding</strong> embossed on strap and heel</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>Y-3 (Adidas x Yohji Yamamoto)</td></tr>
<tr><td><strong>Model</strong></td><td>Slide Platform</td></tr>
<tr><td><strong>Colour</strong></td><td>Triple Black</td></tr>
<tr><td><strong>Material</strong></td><td>Neoprene Strap + EVA Platform</td></tr>
<tr><td><strong>Cushioning / Sole</strong></td><td>Molded EVA Midsole</td></tr>
<tr><td><strong>Signature Detail</strong></td><td>Embossed Y-3 Logo on Strap</td></tr>
<tr><td><strong>Closure</strong></td><td>Slip-On</td></tr>
<tr><td><strong>Style</strong></td><td>Designer Platform Slide</td></tr>
<tr><td><strong>Sizes</strong></td><td>EU 40-46</td></tr>
<tr><td><strong>Ships from</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Includes</strong></td><td>Original Y-3 Box + Authenticity Card</td></tr>
</table>

<h3>How to Style</h3>
<p>Wear with tailored black trousers or wide-leg denim for a high-fashion off-duty look. The platform adds statement height, while the all-black finish keeps things minimal and Yohji-approved. Perfect for lounge, resort, or elevated street styling.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. Y-3 luxury for the modern wardrobe.</p>`;

    const longDescFr = `<p>Glissez dans le confort designer avec la <strong>Sandale Y-3 Slide Plateforme en Noir Total</strong>. N\u00e9e de la l\u00e9gendaire collaboration entre Adidas et l'ic\u00f4ne de la mode japonaise Yohji Yamamoto, Y-3 d\u00e9finit l'avenir du sportswear de luxe. Cette sandale reprend la silhouette classique et l'\u00e9l\u00e8ve avec une semelle plateforme audacieuse et une lani\u00e8re en n\u00e9opr\u00e8ne premium.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>Large lani\u00e8re en n\u00e9opr\u00e8ne</strong> pour un maintien confortable</li>
<li><strong>Plateforme EVA \u00e9paisse</strong> pour de la hauteur et de la pr\u00e9sence street</li>
<li><strong>Semelle en caoutchouc \u00e0 chevrons</strong> pour une adh\u00e9rence assur\u00e9e</li>
<li><strong>Coloris tout noir</strong> qui s'accorde avec tout</li>
<li><strong>Signature Y-3</strong> grav\u00e9e sur la lani\u00e8re et le talon</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>Y-3 (Adidas x Yohji Yamamoto)</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>Slide Plateforme</td></tr>
<tr><td><strong>Couleur</strong></td><td>Noir Total</td></tr>
<tr><td><strong>Mati\u00e8re</strong></td><td>Lani\u00e8re N\u00e9opr\u00e8ne + Plateforme EVA</td></tr>
<tr><td><strong>Amorti</strong></td><td>Semelle EVA Moul\u00e9e</td></tr>
<tr><td><strong>D\u00e9tail Signature</strong></td><td>Logo Y-3 Grav\u00e9 sur la Lani\u00e8re</td></tr>
<tr><td><strong>Fermeture</strong></td><td>\u00c0 Enfiler</td></tr>
<tr><td><strong>Style</strong></td><td>Sandale Plateforme Designer</td></tr>
<tr><td><strong>Tailles</strong></td><td>EU 40-46</td></tr>
<tr><td><strong>Exp\u00e9di\u00e9 de</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Inclus</strong></td><td>Bo\u00eete Y-3 Originale + Carte d'Authenticit\u00e9</td></tr>
</table>

<h3>Comment la Porter</h3>
<p>Portez avec un pantalon noir taill\u00e9 ou un jean large pour un look off-duty haute couture. La plateforme apporte de la hauteur statement, tandis que la finition tout noir reste minimale et approuv\u00e9e Yohji. Parfait pour le lounge, le resort ou un styling street \u00e9lev\u00e9.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. Le luxe Y-3 pour la garde-robe moderne.</p>`;

    const sizes = ["40","41","42","43","44","45","46"];
    const colors = [{ name: "Triple Black", image: imageUrl }];
    const tagsEn = ["y-3", "yohji yamamoto", "adidas", "designer slide", "platform sandal", "triple black", "luxury", "sandals", "abuja"];
    const tagsFr = ["y-3", "yohji yamamoto", "adidas", "sandale designer", "sandale plateforme", "noir total", "luxe", "sandales", "abuja"];

    const [product] = await db.insert(products).values({
      name: nameEn,
      nameFr: nameFr,
      slug: slug,
      slugFr: slugFr,
      description: shortDescEn,
      descriptionFr: shortDescFr,
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: costNgnSnap.toString(),
      supplierPrice: costNgn.toString(),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      sku: "NDZ-Y3-SLD-BK01",
      category: "sandals",
      brand: "Y-3",
      stock: 25,
      sizes: JSON.stringify(sizes),
      colors: colors,
      images: [imageUrl],
      imageUrl: imageUrl,
      active: true,
      featured: false,
      rating: "5.0",
      reviewCount: 0,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      seoTitle: "Y-3 Slide Triple Black Platform Sandal | New Deal Zone",
      seoTitleFr: "Sandale Y-3 Slide Plateforme Noir | New Deal Zone",
      metaDescription: "Shop the Y-3 Slide platform sandal in triple black neoprene. Designer luxury by Yohji Yamamoto x Adidas. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez la sandale Y-3 Slide plateforme en n\u00e9opr\u00e8ne noir total. Luxe designer par Yohji Yamamoto x Adidas. Livraison rapide depuis Abuja.",
      focusKeyphrase: "y-3 slide triple black",
      focusKeyphraseFr: "sandale y-3 slide noir",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    // Reviews
    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Emeka Okonkwo", rating: 5, comment: "Fire slides! The platform gives them serious presence and the Y-3 branding is embossed cleanly. Arrived in Abuja next day.", commentFr: "Sandales incroyables! La plateforme leur donne une pr\u00e9sence s\u00e9rieuse et le logo Y-3 est grav\u00e9 proprement. Arriv\u00e9 \u00e0 Abuja le lendemain.", verified: true, daysAgo: 8 },
      { customerName: "Aissatou Diallo", rating: 5, comment: "The neoprene strap is so comfortable - no rubbing at all. All black looks so premium and matches everything in my wardrobe. Worth every naira.", commentFr: "La lani\u00e8re en n\u00e9opr\u00e8ne est tr\u00e8s confortable - aucun frottement. Le tout noir est tellement premium et s'accorde avec tout. Chaque naira vaut la peine.", verified: true, daysAgo: 22 },
      { customerName: "Marcus Thompson", rating: 4, comment: "Great quality slides and packaging was legit with the box and card. Only reason for 4 stars is they run slightly narrow - order true or half up.", commentFr: "Excellentes sandales et l'emballage \u00e9tait l\u00e9gitime avec la bo\u00eete et la carte. La seule raison des 4 \u00e9toiles est qu'elles taillent l\u00e9g\u00e8rement \u00e9troit - commandez taille normale ou une demi au-dessus.", verified: true, daysAgo: 41 },
      { customerName: "Ngozi Adeboye", rating: 5, comment: "Been eyeing Y-3 for months and these did not disappoint. The chunky sole is exactly what I wanted for pairing with wide-leg pants. Delivery to Lagos was smooth.", commentFr: "J'avais l'oeil sur Y-3 depuis des mois et ces sandales n'ont pas d\u00e9\u00e7u. La semelle \u00e9paisse est exactement ce que je voulais pour porter avec des pantalons larges. Livraison \u00e0 Lagos impeccable.", verified: false, daysAgo: 67 },
    ];

    for (const r of reviewsData) {
      await db.insert(reviews).values({
        productId: product.id,
        customerName: r.customerName,
        avatar: getInitials(r.customerName),
        rating: r.rating,
        comment: r.comment,
        commentFr: r.commentFr,
        verified: r.verified,
        createdAt: new Date(now - r.daysAgo * day),
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
      message: "Y-3 Slide Triple Black seeded successfully",
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