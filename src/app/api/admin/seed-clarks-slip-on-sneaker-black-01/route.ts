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

    const slug = "clarks-slip-on-casual-sneaker-black-leather";
    const slugFr = "sneaker-clarks-slip-on-cuir-noir";
    const sourceUrl = "https://i.ibb.co/J0jH371/Whats-App-Image-2026-08-09-at-10-10-54-AM.jpg";

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/clarks-slip-on-casual-sneaker-black-leather-${Date.now()}.jpg`,
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

    const nameEn = "Clarks Slip-On Casual Sneaker - Black Leather / White Sole";
    const nameFr = "Sneaker Clarks Slip-On Casual - Cuir Noir / Semelle Blanche";

    const shortDescEn = "Clarks slip-on sneaker in premium black leather with signature Clarks logo pull tab, elastic side panels, and crisp white cupsole. Effortless daily wear. Ships from Abuja.";
    const shortDescFr = "Sneaker Clarks slip-on en cuir noir premium avec languette logo Clarks signature, panneaux \u00e9lastiques lat\u00e9raux et semelle cupsole blanche nette. Port quotidien sans effort. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>Slide into everyday elegance with the <strong>Clarks Slip-On Casual Sneaker in Black Leather</strong>. This modern take on Clarks' iconic slip-on delivers 200 years of British shoemaking heritage in a versatile everyday silhouette. Featuring soft premium black leather, tonal elastic side panels for easy on-and-off, a branded Clarks pull tab at the heel, and a clean white rubber cupsole that keeps the fit looking sharp. High-contrast black-and-white simplicity that works everywhere.</p>

<h3>Key Features</h3>
<ul>
<li><strong>Premium black leather upper</strong> in soft calfskin</li>
<li><strong>Tonal black elastic side gore panels</strong> for stretch-fit convenience</li>
<li><strong>Branded Clarks logo pull tab</strong> at heel for easy entry</li>
<li><strong>Moc-toe stitching</strong> across the vamp for artisanal detail</li>
<li><strong>Cushion Plus insole technology</strong> for all-day comfort</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>Clarks</td></tr>
<tr><td><strong>Model</strong></td><td>Slip-On Casual Sneaker</td></tr>
<tr><td><strong>Colour</strong></td><td>Black Leather / White Sole</td></tr>
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
<p>Pair with dark denim, tailored chinos, or cropped trousers for classic smart-casual daily energy. The black leather with white sole contrast is a timeless combination that works with virtually every outfit in the closet - from monochrome black fits to color-blocked casual looks. Slip-on convenience makes them perfect for travel, quick errands, or when you just need a polished shoe without fuss. Trust the Clarks name.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. Two centuries of British craftsmanship, ready to wear.</p>`;

    const longDescFr = `<p>Glissez dans l'\u00e9l\u00e9gance quotidienne avec la <strong>Sneaker Clarks Slip-On Casual en Cuir Noir</strong>. Cette version moderne du slip-on ic\u00f4nique de Clarks livre 200 ans de savoir-faire britannique dans une silhouette quotidienne polyvalente. Pr\u00e9sente un cuir noir souple premium, des panneaux \u00e9lastiques lat\u00e9raux ton sur ton pour un enfilage facile, une languette Clarks brand\u00e9e au talon, et une semelle cupsole en caoutchouc blanc qui garde l'ensemble net. Simplicit\u00e9 noir-et-blanc contrast\u00e9e qui fonctionne partout.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>Tige en cuir noir premium</strong> en cuir de veau souple</li>
<li><strong>Panneaux \u00e9lastiques lat\u00e9raux noirs ton sur ton</strong> pour un ajustement stretch pratique</li>
<li><strong>Languette logo Clarks brand\u00e9e</strong> au talon pour un enfilage facile</li>
<li><strong>Couture moc-toe</strong> \u00e0 travers le vamp pour un d\u00e9tail artisanal</li>
<li><strong>Technologie semelle Cushion Plus</strong> pour un confort toute la journ\u00e9e</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>Clarks</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>Sneaker Slip-On Casual</td></tr>
<tr><td><strong>Couleur</strong></td><td>Cuir Noir / Semelle Blanche</td></tr>
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
<p>Associez avec un jean fonc\u00e9, un chino taill\u00e9 ou un pantalon court pour une \u00e9nergie quotidienne smart-casual classique. Le contraste cuir noir avec semelle blanche est une combinaison intemporelle qui fonctionne avec virtuellement toutes les tenues du placard - des looks noirs monochromes aux looks casual color-blocked. La commodit\u00e9 slip-on les rend parfaites pour voyager, les commissions rapides ou quand vous avez juste besoin d'une chaussure soign\u00e9e sans tracas. Faites confiance au nom Clarks.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. Deux si\u00e8cles de savoir-faire britannique, pr\u00eats \u00e0 porter.</p>`;

    const sizes = ["41","42","43","44","45","46"];
    const colors = [{ name: "Black/White", image: imageUrl }];
    const tagsEn = ["clarks", "slip-on sneaker", "casual sneaker", "black leather", "cushion plus", "everyday", "menswear", "sneakers", "abuja"];
    const tagsFr = ["clarks", "sneaker slip-on", "sneaker casual", "cuir noir", "cushion plus", "quotidien", "menswear", "baskets", "abuja"];

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
      sku: "NDZ-CLK-SLP-BK01",
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
      seoTitle: "Clarks Slip-On Casual Sneaker Black Leather White Sole | New Deal Zone",
      seoTitleFr: "Sneaker Clarks Slip-On Casual Cuir Noir | New Deal Zone",
      metaDescription: "Shop the Clarks slip-on casual sneaker in black leather with white cupsole and Cushion Plus insole. British everyday comfort. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez la sneaker Clarks slip-on casual en cuir noir avec semelle cupsole blanche et Cushion Plus. Confort quotidien britannique. Livraison rapide depuis Abuja.",
      focusKeyphrase: "clarks slip-on sneaker black",
      focusKeyphraseFr: "sneaker clarks slip-on noir",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Kunle Chioma", rating: 5, comment: "Ordered these after loving the navy version - the black-and-white contrast is even more versatile. Cushion Plus insole is truly comfortable from day one. Delivery to Abuja was fast.", commentFr: "Command\u00e9es apr\u00e8s avoir ador\u00e9 la version marine - le contraste noir-et-blanc est encore plus polyvalent. La semelle Cushion Plus est vraiment confortable d\u00e8s le premier jour. Livraison rapide \u00e0 Abuja.", verified: true, daysAgo: 6 },
      { customerName: "Rachel Bernard", rating: 5, comment: "Bought these for my brother who wears black everything. The leather is soft, the white cupsole pops against the black, and the Clarks pull tab confirms authentic quality.", commentFr: "Je les ai achet\u00e9es pour mon fr\u00e8re qui porte tout en noir. Le cuir est souple, la semelle cupsole blanche ressort contre le noir, et la languette Clarks confirme la qualit\u00e9 authentique.", verified: true, daysAgo: 22 },
      { customerName: "Adjei Ba", rating: 4, comment: "Really solid slip-on sneakers and the black leather cleans up easily with a damp cloth. Only reason for 4 stars is I wish the white sole was a bit more scuff-resistant - shows dirt quickly.", commentFr: "Sneakers slip-on vraiment solides et le cuir noir se nettoie facilement avec un chiffon humide. La seule raison des 4 \u00e9toiles est que j'aurais aim\u00e9 que la semelle blanche soit un peu plus r\u00e9sistante aux rayures - montre la salet\u00e9 rapidement.", verified: true, daysAgo: 39 },
      { customerName: "James Kamau", rating: 5, comment: "Perfect for smart-casual daily wear. Black leather looks polished with jeans or chinos and the slip-on convenience is unbeatable. Real Clarks quality, honest pricing.", commentFr: "Parfait pour le port quotidien smart-casual. Le cuir noir a l'air soign\u00e9 avec un jean ou un chino et la commodit\u00e9 slip-on est imbattable. Vraie qualit\u00e9 Clarks, prix honn\u00eate.", verified: false, daysAgo: 62 },
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
      message: "Clarks Slip-On Casual Sneaker Black seeded successfully",
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