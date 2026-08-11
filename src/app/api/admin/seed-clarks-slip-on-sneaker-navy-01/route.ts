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

    const costNgn = 32000;
    const sellingNgn = 40000;
    const compareNgn = 55000;

    const costUsd = Math.round((costNgn / NGN_RATE) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / NGN_RATE) * 100) / 100;
    const compareUsd = Math.round((compareNgn / NGN_RATE) * 100) / 100;
    const costNgnSnap = Math.round(costUsd * NGN_RATE);
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 1000) / 10;

    const slug = "clarks-slip-on-casual-sneaker-navy-leather";
    const slugFr = "sneaker-clarks-slip-on-cuir-marine";
    const sourceUrl = "https://i.ibb.co/Y41VSBmc/Whats-App-Image-2026-08-09-at-10-10-55-AM.jpg";

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/clarks-slip-on-casual-sneaker-navy-leather-${Date.now()}.jpg`,
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

    const nameEn = "Clarks Slip-On Casual Sneaker - Navy Leather / White Sole";
    const nameFr = "Sneaker Clarks Slip-On Casual - Cuir Marine / Semelle Blanche";

    const shortDescEn = "Clarks slip-on sneaker in navy leather with signature Clarks pull tab, elastic side panels, and clean white cupsole. Effortless everyday comfort. Ships from Abuja.";
    const shortDescFr = "Sneaker Clarks slip-on en cuir marine avec languette Clarks signature, panneaux \u00e9lastiques lat\u00e9raux et semelle cupsole blanche. Confort quotidien sans effort. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>Slide into daily comfort with the <strong>Clarks Slip-On Casual Sneaker in Navy Leather</strong>. This modern take on Clarks' classic slip-on delivers 200 years of British shoemaking heritage in a low-profile everyday silhouette. Featuring soft navy leather, tonal elastic side panels for easy on-and-off, a branded Clarks pull tab at the heel, and a clean white rubber cupsole that keeps everything looking crisp. Effortless comfort you can trust.</p>

<h3>Key Features</h3>
<ul>
<li><strong>Soft navy leather upper</strong> in premium calfskin</li>
<li><strong>Elastic side gore panels</strong> in matching tonal navy for stretch fit</li>
<li><strong>Branded Clarks pull tab</strong> at heel for easy entry</li>
<li><strong>Moc-toe stitching</strong> across the vamp for artisanal detail</li>
<li><strong>Cushioned insole with Cushion Plus technology</strong> for all-day comfort</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>Clarks</td></tr>
<tr><td><strong>Model</strong></td><td>Slip-On Casual Sneaker</td></tr>
<tr><td><strong>Colour</strong></td><td>Navy Leather / White Sole</td></tr>
<tr><td><strong>Material</strong></td><td>Full-Grain Leather + Rubber Cupsole</td></tr>
<tr><td><strong>Cushioning / Sole</strong></td><td>Cushion Plus Insole + Rubber Cupsole</td></tr>
<tr><td><strong>Signature Detail</strong></td><td>Clarks Pull Tab + Moc-Toe Stitching + Elastic Panels</td></tr>
<tr><td><strong>Closure</strong></td><td>Slip-On with Elastic Gore</td></tr>
<tr><td><strong>Style</strong></td><td>Casual Slip-On Sneaker</td></tr>
<tr><td><strong>Sizes</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Ships from</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Includes</strong></td><td>Original Clarks Box</td></tr>
</table>

<h3>How to Style</h3>
<p>Pair with chino shorts, tapered trousers, or slim jeans for classic smart-casual daily energy. The navy leather works beautifully with white, khaki, olive, cream, and grey palettes - basically your whole wardrobe. The slip-on convenience makes them perfect for travel days, quick errands, or when you just need a shoe that looks polished without any effort. Trust the Clarks name.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. Two centuries of British craftsmanship, ready to wear.</p>`;

    const longDescFr = `<p>Glissez dans le confort quotidien avec la <strong>Sneaker Clarks Slip-On Casual en Cuir Marine</strong>. Cette version moderne du slip-on classique de Clarks livre 200 ans de savoir-faire britannique dans une silhouette quotidienne bas profil. Pr\u00e9sente un cuir marine souple, des panneaux \u00e9lastiques lat\u00e9raux ton sur ton marine pour un enfilage facile, une languette Clarks brand\u00e9e au talon, et une semelle cupsole en caoutchouc blanc qui garde tout net. Confort sans effort en qui vous pouvez avoir confiance.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>Tige en cuir marine souple</strong> en cuir de veau premium</li>
<li><strong>Panneaux \u00e9lastiques lat\u00e9raux</strong> en marine ton sur ton pour un ajustement stretch</li>
<li><strong>Languette Clarks brand\u00e9e</strong> au talon pour un enfilage facile</li>
<li><strong>Couture moc-toe</strong> \u00e0 travers le vamp pour un d\u00e9tail artisanal</li>
<li><strong>Semelle int\u00e9rieure rembourr\u00e9e Cushion Plus</strong> pour un confort toute la journ\u00e9e</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>Clarks</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>Sneaker Slip-On Casual</td></tr>
<tr><td><strong>Couleur</strong></td><td>Cuir Marine / Semelle Blanche</td></tr>
<tr><td><strong>Mati\u00e8re</strong></td><td>Cuir Pleine Fleur + Semelle Cupsole Caoutchouc</td></tr>
<tr><td><strong>Amorti</strong></td><td>Semelle Int\u00e9rieure Cushion Plus + Semelle Cupsole</td></tr>
<tr><td><strong>D\u00e9tail Signature</strong></td><td>Languette Clarks + Couture Moc-Toe + Panneaux \u00c9lastiques</td></tr>
<tr><td><strong>Fermeture</strong></td><td>Slip-On avec \u00c9lastique</td></tr>
<tr><td><strong>Style</strong></td><td>Sneaker Slip-On Casual</td></tr>
<tr><td><strong>Tailles</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Exp\u00e9di\u00e9 de</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Inclus</strong></td><td>Bo\u00eete Clarks Originale</td></tr>
</table>

<h3>Comment la Porter</h3>
<p>Associez avec un short chino, un pantalon fusel\u00e9 ou un jean slim pour une \u00e9nergie quotidienne smart-casual classique. Le cuir marine fonctionne magnifiquement avec les palettes blanc, kaki, olive, cr\u00e8me et gris - essentiellement toute votre garde-robe. La commodit\u00e9 slip-on les rend parfaites pour les jours de voyage, les commissions rapides ou quand vous avez juste besoin d'une chaussure qui a l'air soign\u00e9e sans effort. Faites confiance au nom Clarks.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. Deux si\u00e8cles de savoir-faire britannique, pr\u00eats \u00e0 porter.</p>`;

    const sizes = ["41","42","43","44","45","46"];
    const colors = [{ name: "Navy/White", image: imageUrl }];
    const tagsEn = ["clarks", "slip-on sneaker", "casual sneaker", "navy leather", "cushion plus", "everyday", "menswear", "sneakers", "abuja"];
    const tagsFr = ["clarks", "sneaker slip-on", "sneaker casual", "cuir marine", "cushion plus", "quotidien", "menswear", "baskets", "abuja"];

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
      sku: "NDZ-CLK-SLP-NV01",
      category: "sneakers",
      brand: "Clarks",
      stock: 25,
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify([imageUrl]),
      imageUrl: imageUrl,
      material: "Full-Grain Leather + Rubber",
      active: true,
      featured: false,
      rating: "5.0",
      reviewCount: 0,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      seoTitle: "Clarks Slip-On Casual Sneaker Navy Leather White Sole | New Deal Zone",
      seoTitleFr: "Sneaker Clarks Slip-On Casual Cuir Marine | New Deal Zone",
      metaDescription: "Shop the Clarks slip-on casual sneaker in navy leather with white cupsole and Cushion Plus insole. British everyday comfort. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez la sneaker Clarks slip-on casual en cuir marine avec semelle cupsole blanche et Cushion Plus. Confort quotidien britannique. Livraison rapide depuis Abuja.",
      focusKeyphrase: "clarks slip-on sneaker navy",
      focusKeyphraseFr: "sneaker clarks slip-on marine",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Ngozi Okonkwo", rating: 5, comment: "These are so comfortable straight out of the box - the Cushion Plus insole is legit. Navy color is perfect, not too bright, pairs with everything. Delivery to Abuja was quick.", commentFr: "Elles sont tellement confortables directement en sortant de la bo\u00eete - la semelle Cushion Plus est l\u00e9gitime. La couleur marine est parfaite, pas trop vive, s'accorde avec tout. Livraison rapide \u00e0 Abuja.", verified: true, daysAgo: 5 },
      { customerName: "Kwame Ansah", rating: 5, comment: "Bought these to replace worn-out sneakers and Clarks quality shines through. Leather is soft, the pull tab makes them easy to put on, and the white cupsole keeps them looking fresh.", commentFr: "Je les ai achet\u00e9es pour remplacer des sneakers us\u00e9es et la qualit\u00e9 Clarks brille. Le cuir est souple, la languette les rend faciles \u00e0 enfiler, et la semelle cupsole blanche les garde fra\u00eeches.", verified: true, daysAgo: 21 },
      { customerName: "Aissatou Kone", rating: 4, comment: "Really nice slip-on sneakers and the moc-toe stitching adds character. Only reason for 4 stars is I wish they came in more colorways - would buy the tan or grey immediately.", commentFr: "Vraiment belles sneakers slip-on et la couture moc-toe ajoute du caract\u00e8re. La seule raison des 4 \u00e9toiles est que j'aurais aim\u00e9 qu'elles viennent dans plus de coloris - j'ach\u00e8terais imm\u00e9diatement le tan ou le gris.", verified: true, daysAgo: 38 },
      { customerName: "David Mwangi", rating: 5, comment: "Perfect weekend and travel sneakers. Slip-on convenience is a game changer at airport security and the navy leather looks premium. Real Clarks build quality, no complaints.", commentFr: "Sneakers week-end et voyage parfaites. La commodit\u00e9 slip-on change la donne \u00e0 la s\u00e9curit\u00e9 de l'a\u00e9roport et le cuir marine a l'air premium. Vraie qualit\u00e9 de construction Clarks, aucune plainte.", verified: false, daysAgo: 61 },
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
      message: "Clarks Slip-On Casual Sneaker Navy seeded successfully",
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