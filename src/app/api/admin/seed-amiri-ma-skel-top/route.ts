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
    const sourceUrl = "https://i.ibb.co/d46FVNcv/Whats-App-Image-2026-08-14-at-11-59-27-AM.jpg";
    const slug = "amiri-ma-skel-top-sneaker-black-white";
    const slugFr = "basket-amiri-ma-skel-top-noir-blanc";

    let ngnRate = 1364;
    let xofRate = 568;
    try {
      const rateRes = await fetch("https://www.newdealzone.com/api/exchange-rates", { cache: "no-store" });
      if (rateRes.ok) {
        const rateData = await rateRes.json();
        ngnRate = Number(rateData?.rates?.NGN) || 1364;
        xofRate = Number(rateData?.rates?.XOF) || 568;
      }
    } catch (e) { console.error("Rate fetch failed:", e); }

    const costNgn = 23000;
    const sellingNgn = 28000;
    const compareNgn = 32000;

    const costUsd = Math.round((costNgn / ngnRate) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / ngnRate) * 100) / 100;
    const compareUsd = Math.round((compareNgn / ngnRate) * 100) / 100;
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 100);

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/amiri-ma-skel-top-black-white-${Date.now()}.jpg`,
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
      await db.delete(products).where(eq(products.id, p.id));
    }

    const colors = [
      { name: "Black/White", image: imageUrl },
    ];

    const sizes = ["40", "41", "42", "43", "44", "45", "46"];
    const images = [imageUrl];

    const tagsEn = ["amiri", "sneakers", "skel-top", "luxury", "streetwear", "chunky", "designer", "abuja"];
    const tagsFr = ["amiri", "baskets", "skel-top", "luxe", "streetwear", "\u00e9paisses", "designer", "abuja"];

    const longDescEn = `<p>Step into luxury streetwear with the AMIRI MA Skel-Top Sneaker in Black & White. Combining bold skate silhouettes with premium Italian craftsmanship, this iconic pair features the signature MA logo tab, zigzag midsole ribbing, and chunky proportions that define modern designer footwear.</p>
<h3>Key Features</h3>
<ul>
  <li>Premium leather and suede upper with patent panels</li>
  <li>Signature AMIRI MA logo tab on tongue and heel</li>
  <li>Iconic zigzag rib chunky midsole</li>
  <li>Five-star Skel-Top badge on lateral side</li>
  <li>Padded ankle collar for skate comfort</li>
  <li>Thick round laces with tonal woven eyelets</li>
</ul>
<table class="product-spec-table">
  <tr><th>Brand</th><td>AMIRI</td></tr>
  <tr><th>Model</th><td>MA Skel-Top</td></tr>
  <tr><th>Colour</th><td>Black & White</td></tr>
  <tr><th>Material</th><td>Leather + Suede + Patent + Rubber</td></tr>
  <tr><th>Cushioning/Sole</th><td>Chunky rubber with zigzag rib midsole</td></tr>
  <tr><th>Signature Detail</th><td>MA logo tab + star badge</td></tr>
  <tr><th>Closure</th><td>Chunky round lace-up</td></tr>
  <tr><th>Style</th><td>Luxury skate sneaker</td></tr>
  <tr><th>Sizes</th><td>40 to 46 EU</td></tr>
  <tr><th>Ships from</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Includes</th><td>AMIRI box, dust bag, authenticity cards</td></tr>
</table>
<h3>Styling</h3>
<p>Pair with wide-leg denim, cargo trousers, or oversized graphic tees for authentic AMIRI streetwear vibes. The high-contrast black and white palette works with everything from monochrome fits to bold colored pieces.</p>
<p><strong>Order today and enjoy fast delivery from Abuja \u2013 same-day for FCT residents.</strong></p>`;

    const longDescFr = `<p>Entrez dans le streetwear de luxe avec la Basket AMIRI MA Skel-Top en Noir et Blanc. Alliant silhouettes skate audacieuses et savoir-faire italien premium, cette pi\u00e8ce iconique pr\u00e9sente le tab logo MA signature, la semelle interm\u00e9diaire en zigzag et les proportions \u00e9paisses qui d\u00e9finissent la chaussure designer moderne.</p>
<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
  <li>Tige en cuir et daim premium avec panneaux vernis</li>
  <li>Tab logo AMIRI MA signature sur langue et talon</li>
  <li>Semelle interm\u00e9diaire \u00e9paisse iconique en zigzag</li>
  <li>Badge Skel-Top cinq \u00e9toiles sur le c\u00f4t\u00e9</li>
  <li>Col cheville rembourr\u00e9 pour le confort skate</li>
  <li>Lacets ronds \u00e9pais avec \u0153illets tiss\u00e9s ton sur ton</li>
</ul>
<table class="product-spec-table">
  <tr><th>Marque</th><td>AMIRI</td></tr>
  <tr><th>Mod\u00e8le</th><td>MA Skel-Top</td></tr>
  <tr><th>Couleur</th><td>Noir et Blanc</td></tr>
  <tr><th>Mati\u00e8re</th><td>Cuir + Daim + Vernis + Caoutchouc</td></tr>
  <tr><th>Amorti</th><td>Semelle caoutchouc \u00e9paisse avec zigzag</td></tr>
  <tr><th>D\u00e9tail Signature</th><td>Tab logo MA + badge \u00e9toile</td></tr>
  <tr><th>Fermeture</th><td>Lacets ronds \u00e9pais</td></tr>
  <tr><th>Style</th><td>Basket skate de luxe</td></tr>
  <tr><th>Tailles</th><td>40 \u00e0 46 EU</td></tr>
  <tr><th>Exp\u00e9di\u00e9 de</th><td>Abuja, Nigeria</td></tr>
  <tr><th>Inclus</th><td>Bo\u00eete AMIRI, sac \u00e0 poussi\u00e8re, cartes d\u2019authenticit\u00e9</td></tr>
</table>
<h3>Comment Porter</h3>
<p>Associez avec un jean large, un pantalon cargo ou un t-shirt graphique oversize pour un look AMIRI streetwear authentique. Le contraste noir et blanc s\u2019accorde avec tout, du monochrome aux pi\u00e8ces color\u00e9es.</p>
<p><strong>Commandez aujourd\u2019hui et profitez d\u2019une livraison rapide depuis Abuja.</strong></p>`;

    const inserted = await db.insert(products).values({
      name: "AMIRI MA Skel-Top Sneaker - Black & White",
      nameFr: "Basket AMIRI MA Skel-Top - Noir et Blanc",
      slug,
      slugFr,
      description: "AMIRI MA Skel-Top luxury skate sneaker in Black & White. Premium leather, suede, patent panels, chunky zigzag sole. Ships from Abuja.",
      descriptionFr: "Basket AMIRI MA Skel-Top de luxe en Noir et Blanc. Cuir premium, daim, panneaux vernis, semelle \u00e9paisse en zigzag. Exp\u00e9di\u00e9 depuis Abuja.",
      shortDescription: "AMIRI MA Skel-Top luxury sneaker. Leather + suede + patent, chunky zigzag sole. Ships from Abuja.",
      shortDescriptionFr: "Basket de luxe AMIRI MA Skel-Top. Cuir, daim et vernis, semelle \u00e9paisse. Exp\u00e9di\u00e9 de Abuja.",
      longDescription: longDescEn,
      longDescriptionFr: longDescFr,
      price: sellingUsd.toFixed(2),
      comparePrice: compareUsd.toFixed(2),
      costPrice: String(costNgn),
      supplierPrice: String(costNgn),
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      brand: "AMIRI",
      category: "sneakers",
      sku: "NDZ-AMR-SKL-BW01",
      material: "Leather + Suede + Patent + Rubber",
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify(images),
      imageUrl,
      stock: 15,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      active: true,
      featured: true,
      seoTitle: "AMIRI MA Skel-Top Sneaker Black & White | New Deal Zone",
      seoTitleFr: "Basket AMIRI MA Skel-Top Noir Blanc | New Deal Zone",
      metaDescription: "AMIRI MA Skel-Top luxury skate sneaker. Premium leather + suede + patent panels, chunky zigzag sole. Fast delivery from Abuja.",
      metaDescriptionFr: "Basket AMIRI MA Skel-Top de luxe. Cuir premium, daim, vernis, semelle \u00e9paisse zigzag. Livraison rapide depuis Abuja.",
      focusKeyphrase: "amiri skel-top sneaker",
      focusKeyphraseFr: "basket amiri skel-top",
      ogImage: imageUrl,
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
    }).returning();

    const product = inserted[0];

    const reviewData = [
      { name: "Marcus Thompson", rating: 5, daysAgo: 4, verified: true,
        commentEn: "Insane quality for the price. Feels exactly like AMIRI, the zigzag sole is fire and the MA logo is on point. Shipped to Abuja in 2 days.",
        commentFr: "Qualit\u00e9 dingue pour le prix. On dirait vraiment du AMIRI, la semelle zigzag est parfaite et le logo MA est nickel. Livr\u00e9 \u00e0 Abuja en 2 jours." },
      { name: "Aissatou Diagne", rating: 5, daysAgo: 19, verified: true,
        commentEn: "These are stunning! Chunky and comfortable, the black and white contrast is beautiful. Got so many compliments already.",
        commentFr: "Elles sont magnifiques! \u00c9paisses et confortables, le contraste noir et blanc est superbe. J\u2019ai d\u00e9j\u00e0 re\u00e7u plein de compliments." },
      { name: "Adeboye Ogunlesi", rating: 5, daysAgo: 38, verified: true,
        commentEn: "Best skate sneaker I own. The padding on the ankle is comfy for long walks and the leather feels premium.",
        commentFr: "La meilleure basket skate que j\u2019ai. Le rembourrage \u00e0 la cheville est confortable pour marcher longtemps et le cuir est premium." },
      { name: "Camille Rousseau", rating: 4, daysAgo: 55, verified: false,
        commentEn: "Really nice sneakers, love the design and star badge. Sizing runs slightly large, so consider going one down. Otherwise perfect.",
        commentFr: "Tr\u00e8s belles baskets, j\u2019adore le design et le badge \u00e9toile. Taille un peu grand, prenez une pointure en dessous. Sinon parfait." },
      { name: "Yusuf Ibrahim", rating: 5, daysAgo: 78, verified: true,
        commentEn: "Legit look, everyone thinks these are the real AMIRI. Sole is heavy and solid, laces are quality. Worth every naira.",
        commentFr: "Aspect authentique, tout le monde pense que c\u2019est des vraies AMIRI. Semelle lourde et solide, lacets de qualit\u00e9. Vaut chaque naira." },
    ];

    let totalRating = 0;
    for (const r of reviewData) {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - r.daysAgo);
      await db.insert(reviews).values({
        productId: product.id,
        customerName: r.name,
        rating: r.rating,
        comment: r.commentEn,
        commentFr: r.commentFr,
        avatar: getInitials(r.name),
        verified: r.verified,
        createdAt,
      });
      totalRating += r.rating;
    }

    const avgRating = Math.round((totalRating / reviewData.length) * 10) / 10;
    await db.update(products).set({
      rating: avgRating.toFixed(1),
      reviewCount: reviewData.length,
    }).where(eq(products.id, product.id));

    return NextResponse.json({
      success: true,
      message: "Product + reviews seeded",
      product: { id: product.id, slug, slugFr, imageUrl, blobUsed },
      pricing: { costNgn, sellingNgn, compareNgn, costUsd, sellingUsd, compareUsd, profitNgn, marginPct, ngnRate, xofRate },
      reviews: { count: reviewData.length, avg: avgRating },
      origin: { country: "NG", city: "Abuja" },
      urls: {
        en: `https://www.newdealzone.com/en/product/${slug}`,
        fr: `https://www.newdealzone.com/fr/product/${slugFr}`,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}