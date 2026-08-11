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

    const costNgn = 18000;
    const sellingNgn = 25000;
    const compareNgn = 32000;

    const costUsd = Math.round((costNgn / NGN_RATE) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / NGN_RATE) * 100) / 100;
    const compareUsd = Math.round((compareNgn / NGN_RATE) * 100) / 100;
    const costNgnSnap = Math.round(costUsd * NGN_RATE);
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 1000) / 10;

    const slug = "yeezy-slide-strap-sand";
    const slugFr = "sandale-yeezy-slide-strap-sable";
    const sourceUrl = "https://i.ibb.co/MyxFsHhH/Whats-App-Image-2026-08-09-at-10-11-17-AM-2.jpg";

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/yeezy-slide-strap-sand-${Date.now()}.jpg`,
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

    const nameEn = "Yeezy Slide Adjustable Strap - Sand";
    const nameFr = "Sandale Yeezy Slide \u00c0 Sangle R\u00e9glable - Sable";

    const shortDescEn = "Yeezy Slide in sand-tone EVA with adjustable velcro strap and signature massage footbed. Ships from Abuja.";
    const shortDescFr = "Sandale Yeezy Slide en EVA sable avec sangle velcro r\u00e9glable et semelle massante signature. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>Meet the <strong>Yeezy Slide Adjustable Strap in Sand</strong> - the cult-favorite silhouette from Kanye West redefined for maximum comfort. Featuring a sculpted one-piece EVA construction, an adjustable velcro strap for a personalized fit, and Yeezy's iconic massage-nub footbed, this slide brings runway-worthy design to your everyday rotation.</p>

<h3>Key Features</h3>
<ul>
<li><strong>One-piece molded EVA</strong> construction for lightweight cloud-like feel</li>
<li><strong>Adjustable velcro strap</strong> - the upgrade over the classic strapless Yeezy Slide</li>
<li><strong>Textured massage footbed</strong> with rubberized nubs stimulates the sole</li>
<li><strong>Sculpted cutout midsole</strong> - the Yeezy design signature</li>
<li><strong>Monochromatic sand colorway</strong> for effortless neutral styling</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>Yeezy</td></tr>
<tr><td><strong>Model</strong></td><td>Slide Adjustable Strap</td></tr>
<tr><td><strong>Colour</strong></td><td>Sand / Bone</td></tr>
<tr><td><strong>Material</strong></td><td>Molded EVA Foam</td></tr>
<tr><td><strong>Cushioning / Sole</strong></td><td>One-Piece Sculpted EVA</td></tr>
<tr><td><strong>Signature Detail</strong></td><td>Massage-Nub Footbed + Sculpted Midsole</td></tr>
<tr><td><strong>Closure</strong></td><td>Adjustable Velcro Strap</td></tr>
<tr><td><strong>Style</strong></td><td>Designer Slide</td></tr>
<tr><td><strong>Sizes</strong></td><td>EU 41-45</td></tr>
<tr><td><strong>Ships from</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Includes</strong></td><td>Original Packaging</td></tr>
</table>

<h3>How to Style</h3>
<p>Pair with washed denim, wide-leg cargos, or tapered joggers for a Yeezy-authentic look. The sand tone reads warm and versatile - perfect against black, cream, olive, and rust palettes. Wear them from apartment to airport with equal confidence.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. Cult-status comfort, ready to ship.</p>`;

    const longDescFr = `<p>D\u00e9couvrez la <strong>Sandale Yeezy Slide \u00c0 Sangle R\u00e9glable en Sable</strong> - la silhouette culte de Kanye West revisit\u00e9e pour un confort maximal. Avec sa construction moul\u00e9e en EVA d'une seule pi\u00e8ce, sa sangle velcro r\u00e9glable pour un ajustement personnalis\u00e9 et la semelle massante ic\u00f4nique Yeezy, cette sandale apporte un design digne des podiums \u00e0 votre routine quotidienne.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>EVA moul\u00e9e d'une pi\u00e8ce</strong> pour une sensation l\u00e9g\u00e8re comme un nuage</li>
<li><strong>Sangle velcro r\u00e9glable</strong> - l'upgrade sur la Yeezy Slide classique sans sangle</li>
<li><strong>Semelle massante textur\u00e9e</strong> avec des picots en caoutchouc qui stimulent la voute plantaire</li>
<li><strong>Semelle sculpt\u00e9e ajour\u00e9e</strong> - la signature design Yeezy</li>
<li><strong>Coloris sable monochromatique</strong> pour un styling neutre sans effort</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>Yeezy</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>Slide Sangle R\u00e9glable</td></tr>
<tr><td><strong>Couleur</strong></td><td>Sable / Bone</td></tr>
<tr><td><strong>Mati\u00e8re</strong></td><td>Mousse EVA Moul\u00e9e</td></tr>
<tr><td><strong>Amorti</strong></td><td>EVA Sculpt\u00e9e Une Pi\u00e8ce</td></tr>
<tr><td><strong>D\u00e9tail Signature</strong></td><td>Semelle Massante + Semelle Sculpt\u00e9e</td></tr>
<tr><td><strong>Fermeture</strong></td><td>Sangle Velcro R\u00e9glable</td></tr>
<tr><td><strong>Style</strong></td><td>Sandale Designer</td></tr>
<tr><td><strong>Tailles</strong></td><td>EU 41-45</td></tr>
<tr><td><strong>Exp\u00e9di\u00e9 de</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Inclus</strong></td><td>Emballage Original</td></tr>
</table>

<h3>Comment la Porter</h3>
<p>Associez avec un jean d\u00e9lav\u00e9, un cargo large ou un jogger fusel\u00e9 pour un look authentique Yeezy. Le ton sable est chaud et polyvalent - parfait avec des palettes noir, cr\u00e8me, olive et rouille. Portez-les de la maison \u00e0 l'a\u00e9roport avec la m\u00eame assurance.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. Confort culte, pr\u00eat \u00e0 exp\u00e9dier.</p>`;

    const sizes = ["41","42","43","44","45"];
    const colors = [{ name: "Sand", image: imageUrl }];
    const tagsEn = ["yeezy", "yeezy slide", "kanye west", "adjustable strap", "sand", "bone", "designer slide", "sandals", "abuja"];
    const tagsFr = ["yeezy", "yeezy slide", "kanye west", "sangle r\u00e9glable", "sable", "bone", "sandale designer", "sandales", "abuja"];

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
      sku: "NDZ-YZY-SLD-SD01",
      category: "sandals",
      brand: "Yeezy",
      stock: 25,
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify([imageUrl]),
      imageUrl: imageUrl,
      material: "Molded EVA Foam",
      active: true,
      featured: false,
      rating: "5.0",
      reviewCount: 0,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      seoTitle: "Yeezy Slide Adjustable Strap Sand Bone | New Deal Zone",
      seoTitleFr: "Sandale Yeezy Slide Sangle R\u00e9glable Sable | New Deal Zone",
      metaDescription: "Shop the Yeezy Slide adjustable strap in sand-tone EVA with massage footbed. Cult Kanye West design. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez la sandale Yeezy Slide sangle r\u00e9glable en EVA sable avec semelle massante. Design culte Kanye West. Livraison rapide depuis Abuja.",
      focusKeyphrase: "yeezy slide sand strap",
      focusKeyphraseFr: "sandale yeezy slide sable",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Yusuf Ibrahim", rating: 5, comment: "Copped these instead of the OG Yeezy Slide because of the strap - game changer. Sand color is exactly like the pics. Arrived to Abuja in 2 days.", commentFr: "J'ai pris celles-ci au lieu de la Yeezy Slide OG \u00e0 cause de la sangle - un game changer. La couleur sable est exactement comme sur les photos. Arriv\u00e9 \u00e0 Abuja en 2 jours.", verified: true, daysAgo: 6 },
      { customerName: "Camille Moreau", rating: 5, comment: "The massage footbed is legit therapeutic after a long day. Super lightweight and the velcro holds firm. Would buy again in every color.", commentFr: "La semelle massante est vraiment th\u00e9rapeutique apr\u00e8s une longue journ\u00e9e. Super l\u00e9ger et le velcro tient fermement. J'en rach\u00e8terais dans toutes les couleurs.", verified: true, daysAgo: 19 },
      { customerName: "Priscilla Boateng", rating: 4, comment: "Love the sand color and the adjustable strap works perfectly for my narrow feet. Only reason for 4 stars is I wish they came in half sizes.", commentFr: "J'adore la couleur sable et la sangle r\u00e9glable fonctionne parfaitement pour mes pieds \u00e9troits. La seule raison des 4 \u00e9toiles est que j'aurais aim\u00e9 des demi-pointures.", verified: true, daysAgo: 34 },
      { customerName: "Nnamdi Adeboye", rating: 5, comment: "Been wearing Yeezy Slides for years - this strap version is way more secure for walking around. Quality of the EVA is on point. Delivery to Lagos was quick.", commentFr: "Je porte des Yeezy Slides depuis des ann\u00e9es - cette version avec sangle est bien plus s\u00e9curis\u00e9e pour marcher. La qualit\u00e9 de l'EVA est au top. Livraison rapide \u00e0 Lagos.", verified: false, daysAgo: 58 },
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
      message: "Yeezy Slide Strap Sand seeded successfully",
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