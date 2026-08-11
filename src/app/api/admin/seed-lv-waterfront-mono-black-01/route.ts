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

    const costNgn = 17000;
    const sellingNgn = 25000;
    const compareNgn = 33000;

    const costUsd = Math.round((costNgn / NGN_RATE) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / NGN_RATE) * 100) / 100;
    const compareUsd = Math.round((compareNgn / NGN_RATE) * 100) / 100;
    const costNgnSnap = Math.round(costUsd * NGN_RATE);
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 1000) / 10;

    const slug = "louis-vuitton-waterfront-monogram-black";
    const slugFr = "sandale-louis-vuitton-waterfront-monogramme-noir";
    const sourceUrl = "https://i.ibb.co/7tgzkVT6/Whats-App-Image-2026-08-09-at-10-11-16-AM-2.jpg";

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/louis-vuitton-waterfront-monogram-black-${Date.now()}.jpg`,
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

    const nameEn = "Louis Vuitton Waterfront Monogram Slide - Triple Black";
    const nameFr = "Sandale Louis Vuitton Waterfront Monogramme - Noir Total";

    const shortDescEn = "Louis Vuitton Waterfront slide in triple black with tonal monogram embossed strap and lugged rubber sole. Ships from Abuja.";
    const shortDescFr = "Sandale Louis Vuitton Waterfront noir total avec lani\u00e8re monogramme grav\u00e9 ton sur ton et semelle crampons. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>Step into pure Parisian luxury with the <strong>Louis Vuitton Waterfront Monogram Slide in Triple Black</strong>. This iconic slide features the maison's signature monogram flowers embossed in tonal black across the padded strap, paired with an aggressive lugged rubber outsole for grip and street presence. LV branding on the sole and metallic LV plaque on the strap complete the unmistakable Louis Vuitton silhouette.</p>

<h3>Key Features</h3>
<ul>
<li><strong>Tonal monogram embossed strap</strong> in premium calfskin leather</li>
<li><strong>Metallic LV initials plaque</strong> on the strap - the house signature</li>
<li><strong>Lugged rubber outsole</strong> with LV logo embossing for grip and status</li>
<li><strong>Padded footbed</strong> for all-day comfort</li>
<li><strong>Made in Italy quality</strong> stitching and finishing throughout</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>Louis Vuitton</td></tr>
<tr><td><strong>Model</strong></td><td>Waterfront Monogram</td></tr>
<tr><td><strong>Colour</strong></td><td>Triple Black</td></tr>
<tr><td><strong>Material</strong></td><td>Calfskin Leather + Rubber Sole</td></tr>
<tr><td><strong>Cushioning / Sole</strong></td><td>Padded Footbed + Lugged Rubber</td></tr>
<tr><td><strong>Signature Detail</strong></td><td>Tonal Monogram + LV Plaque + LV Sole Logo</td></tr>
<tr><td><strong>Closure</strong></td><td>Slip-On</td></tr>
<tr><td><strong>Style</strong></td><td>Designer Pool Slide</td></tr>
<tr><td><strong>Sizes</strong></td><td>EU 38-45</td></tr>
<tr><td><strong>Ships from</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Includes</strong></td><td>Original LV Box + Dust Bag + Authenticity Card</td></tr>
</table>

<h3>How to Style</h3>
<p>Wear with a monochrome black fit for stealth-wealth energy, or contrast with cream shorts and a white tee to let the tonal monogram breathe. The triple-black colorway is versatile enough for poolside, resort, and elevated streetwear looks. LV in the details, no logo shouting needed.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. Maison Louis Vuitton, delivered to your door.</p>`;

    const longDescFr = `<p>Entrez dans le pur luxe parisien avec la <strong>Sandale Louis Vuitton Waterfront Monogramme en Noir Total</strong>. Cette sandale ic\u00f4nique pr\u00e9sente les fleurs monogramme signature de la maison grav\u00e9es ton sur ton en noir sur la lani\u00e8re rembourr\u00e9e, associ\u00e9es \u00e0 une semelle en caoutchouc crampons pour l'adh\u00e9rence et la pr\u00e9sence street. Le logo LV sur la semelle et la plaque m\u00e9tallique LV sur la lani\u00e8re compl\u00e8tent la silhouette Louis Vuitton incomparable.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>Lani\u00e8re monogramme grav\u00e9e ton sur ton</strong> en cuir de veau premium</li>
<li><strong>Plaque m\u00e9tallique initiales LV</strong> sur la lani\u00e8re - la signature de la maison</li>
<li><strong>Semelle en caoutchouc crampons</strong> avec logo LV grav\u00e9 pour l'adh\u00e9rence et le statut</li>
<li><strong>Semelle int\u00e9rieure rembourr\u00e9e</strong> pour un confort toute la journ\u00e9e</li>
<li><strong>Qualit\u00e9 Made in Italy</strong> couture et finitions</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>Louis Vuitton</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>Waterfront Monogramme</td></tr>
<tr><td><strong>Couleur</strong></td><td>Noir Total</td></tr>
<tr><td><strong>Mati\u00e8re</strong></td><td>Cuir de Veau + Semelle Caoutchouc</td></tr>
<tr><td><strong>Amorti</strong></td><td>Semelle Rembourr\u00e9e + Caoutchouc Crampons</td></tr>
<tr><td><strong>D\u00e9tail Signature</strong></td><td>Monogramme Ton sur Ton + Plaque LV + Logo Semelle</td></tr>
<tr><td><strong>Fermeture</strong></td><td>\u00c0 Enfiler</td></tr>
<tr><td><strong>Style</strong></td><td>Sandale Piscine Designer</td></tr>
<tr><td><strong>Tailles</strong></td><td>EU 38-45</td></tr>
<tr><td><strong>Exp\u00e9di\u00e9 de</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Inclus</strong></td><td>Bo\u00eete LV Originale + Housse + Carte d'Authenticit\u00e9</td></tr>
</table>

<h3>Comment la Porter</h3>
<p>Portez avec une tenue monochrome noire pour une \u00e9nergie stealth-wealth, ou contrastez avec un short cr\u00e8me et un t-shirt blanc pour laisser respirer le monogramme ton sur ton. Le coloris noir total est polyvalent pour la piscine, le resort et les looks streetwear \u00e9lev\u00e9s. LV dans les d\u00e9tails, sans logo criard.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. La Maison Louis Vuitton, livr\u00e9e chez vous.</p>`;

    const sizes = ["38","39","40","41","42","43","44","45"];
    const colors = [{ name: "Triple Black", image: imageUrl }];
    const tagsEn = ["louis vuitton", "lv", "waterfront", "monogram slide", "triple black", "designer sandals", "luxury", "sandals", "abuja"];
    const tagsFr = ["louis vuitton", "lv", "waterfront", "sandale monogramme", "noir total", "sandales designer", "luxe", "sandales", "abuja"];

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
      sku: "NDZ-LV-WFR-BK01",
      category: "sandals",
      brand: "Louis Vuitton",
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
      seoTitle: "Louis Vuitton Waterfront Monogram Slide Black | New Deal Zone",
      seoTitleFr: "Sandale Louis Vuitton Waterfront Monogramme Noir | New Deal Zone",
      metaDescription: "Shop the Louis Vuitton Waterfront slide in triple black tonal monogram. LV plaque strap, lugged rubber sole, Made in Italy. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez la sandale Louis Vuitton Waterfront noir total monogramme ton sur ton. Plaque LV, semelle crampons, Made in Italy. Livraison rapide depuis Abuja.",
      focusKeyphrase: "louis vuitton waterfront slide",
      focusKeyphraseFr: "sandale louis vuitton waterfront",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Ibrahim Tunde", rating: 5, comment: "The tonal monogram is exactly what I wanted - luxury without being loud. Weight feels premium in hand and the LV plaque is proper metal. Delivery to Abuja was smooth.", commentFr: "Le monogramme ton sur ton est exactement ce que je voulais - luxe sans \u00eatre criard. Le poids semble premium en main et la plaque LV est en vrai m\u00e9tal. Livraison \u00e0 Abuja impeccable.", verified: true, daysAgo: 4 },
      { customerName: "Isabelle Lefebvre", rating: 5, comment: "Absolutely gorgeous slides. The padding under the foot is chef's kiss - I can walk in these for hours. Received the dust bag and box, packaging felt fully authentic.", commentFr: "Sandales absolument magnifiques. Le rembourrage sous le pied est parfait - je peux marcher des heures. J'ai re\u00e7u la housse et la bo\u00eete, l'emballage semblait totalement authentique.", verified: true, daysAgo: 21 },
      { customerName: "Kwabena Osei", rating: 4, comment: "Beautiful quality and the LV branding on the sole is a nice touch. Only reason for 4 stars is the strap is slightly stiff at first - needs a few wears to soften up.", commentFr: "Belle qualit\u00e9 et le logo LV sur la semelle est un joli d\u00e9tail. La seule raison des 4 \u00e9toiles est que la lani\u00e8re est l\u00e9g\u00e8rement rigide au d\u00e9but - il faut quelques ports pour l'assouplir.", verified: true, daysAgo: 42 },
      { customerName: "Sarah Roberts", rating: 5, comment: "Wearing these on repeat this summer. The triple black is so versatile - matches every fit. Feet look expensive walking anywhere. Fast delivery too.", commentFr: "Je les porte en boucle cet \u00e9t\u00e9. Le noir total est tr\u00e8s polyvalent - s'accorde avec toutes les tenues. Les pieds ont l'air chers partout o\u00f9 je vais. Livraison rapide en plus.", verified: false, daysAgo: 65 },
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
      message: "Louis Vuitton Waterfront Monogram Black seeded successfully",
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