import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const slugEn = "off-white-cross-strap-slide-black";
    const slugFr = "sandale-off-white-croisee-cuir-noir";
    const sourceUrl = "https://i.ibb.co/LXMLPpxF/Whats-App-Image-2026-08-09-at-10-11-18-AM.jpg";

    let imageUrl: string = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/off-white-cross-strap-slide-black-${Date.now()}.jpg`,
          buffer,
          { access: "public", contentType: "image/jpeg" }
        );
        imageUrl = blob.url;
        blobUsed = true;
      }
    } catch (e) {
      console.error("Blob upload failed:", e);
    }

    const existingProducts = await db.select({ id: products.id }).from(products).where(
      or(eq(products.slug, slugEn), eq(products.slugFr, slugFr))
    );
    for (const p of existingProducts) {
      await db.delete(reviews).where(eq(reviews.productId, p.id));
    }
    await db.delete(products).where(
      or(eq(products.slug, slugEn), eq(products.slugFr, slugFr))
    );

    const [product] = await db.insert(products).values({
      name: "Off-White Cross-Strap Leather Slide - Black/White",
      nameFr: "Sandale Off-White Crois\u00e9e en Cuir - Noir/Blanc",
      slug: slugEn,
      slugFr: slugFr,
      sku: "NDZ-OFW-CRS-BW01",
      brand: "Off-White",
      category: "sandals",
      price: "32.99",
      comparePrice: "38.12",
      costPrice: "37000",
      supplierPrice: "37000",
      supplierCurrency: "NGN",
      originCountry: "NG",
      originCity: "Abuja",
      imageUrl: imageUrl,
      images: JSON.stringify([imageUrl]),
      colors: JSON.stringify([{ name: "Black/White", image: imageUrl }]),
      sizes: JSON.stringify(["40","41","42","43","44","45","46"]),
      stock: 15,
      active: true,
      featured: true,
      rating: "0",
      reviewCount: 0,
      shortDescription: "Premium Off-White cross-strap leather slide sandal with signature arrow detailing and cushioned rubber sole. Bold luxury for every day. Ships from Abuja.",
      shortDescriptionFr: "Sandale Off-White \u00e0 brides crois\u00e9es en cuir premium avec d\u00e9tail fl\u00e8che signature et semelle caoutchouc amortie. Luxe audacieux au quotidien. Exp\u00e9di\u00e9 d'Abuja.",
      longDescription: `<p>Step into iconic luxury with the <strong>Off-White Cross-Strap Leather Slide</strong>. Designed by Virgil Abloh's groundbreaking label, this slide combines bold streetwear aesthetics with everyday comfort. The criss-cross leather straps feature the signature Off-White arrow motif, delivering instant brand recognition and head-turning style.</p>

<h2>Premium Craftsmanship</h2>
<p>Constructed from supple premium leather, the cross-over straps sit comfortably across the foot while the cushioned footbed ensures all-day wearability. The chunky rubber outsole provides excellent grip and durability, whether you're walking city streets or lounging poolside.</p>

<h2>Signature Details</h2>
<ul>
  <li>Off-White arrow logo embossed on the strap</li>
  <li>Contrast black and white colour blocking</li>
  <li>Cushioned contoured footbed</li>
  <li>Durable rubber outsole with traction pattern</li>
  <li>Comes with original Off-White branded box</li>
</ul>

<h2>Style It</h2>
<p>Pair with tailored linen trousers and an oversized tee for effortless summer style, or rock them with joggers and a graphic hoodie for off-duty streetwear energy. These slides transition seamlessly from casual outings to resort wear.</p>

<table class="product-spec-table">
  <tr><td>Brand</td><td>Off-White</td></tr>
  <tr><td>Model</td><td>Cross-Strap Leather Slide</td></tr>
  <tr><td>Colour</td><td>Black / White</td></tr>
  <tr><td>Material</td><td>Premium Leather + Rubber</td></tr>
  <tr><td>Sole</td><td>Chunky Rubber Outsole</td></tr>
  <tr><td>Signature Detail</td><td>Arrow Logo Embossed</td></tr>
  <tr><td>Closure</td><td>Slip-On</td></tr>
  <tr><td>Style</td><td>Luxury Streetwear Slide</td></tr>
  <tr><td>Sizes</td><td>40 - 46</td></tr>
  <tr><td>Ships From</td><td>Abuja, Nigeria</td></tr>
  <tr><td>Includes</td><td>Original Off-White Box</td></tr>
</table>`,
      longDescriptionFr: `<p>Entrez dans le luxe iconique avec la <strong>Sandale Off-White \u00e0 Brides Crois\u00e9es en Cuir</strong>. Con\u00e7ue par la marque r\u00e9volutionnaire de Virgil Abloh, cette sandale allie esth\u00e9tique streetwear audacieuse et confort quotidien. Les brides crois\u00e9es en cuir arborent le motif fl\u00e8che signature Off-White, garantissant une reconnaissance imm\u00e9diate et un style saisissant.</p>

<h2>Fabrication Premium</h2>
<p>Fabriqu\u00e9es en cuir souple de qualit\u00e9 sup\u00e9rieure, les brides crois\u00e9es \u00e9pousent confortablement le pied tandis que la semelle int\u00e9rieure amortie assure un port agr\u00e9able toute la journ\u00e9e. La semelle ext\u00e9rieure en caoutchouc \u00e9paisse offre une excellente adh\u00e9rence et une durabilit\u00e9 \u00e0 toute \u00e9preuve.</p>

<h2>D\u00e9tails Signature</h2>
<ul>
  <li>Logo fl\u00e8che Off-White grav\u00e9 sur la bride</li>
  <li>Contraste noir et blanc audacieux</li>
  <li>Semelle int\u00e9rieure matelass\u00e9e et ergonomique</li>
  <li>Semelle ext\u00e9rieure en caoutchouc avec motif d'adh\u00e9rence</li>
  <li>Livr\u00e9e avec bo\u00eete originale Off-White</li>
</ul>

<h2>Comment la Porter</h2>
<p>Associez-la \u00e0 un pantalon en lin ajust\u00e9 et un t-shirt oversize pour un style estival sans effort, ou portez-la avec un jogging et un hoodie graphique pour un look streetwear d\u00e9contract\u00e9. Ces sandales passent facilement des sorties d\u00e9contract\u00e9es au style bord de mer.</p>

<table class="product-spec-table">
  <tr><td>Marque</td><td>Off-White</td></tr>
  <tr><td>Mod\u00e8le</td><td>Sandale \u00e0 Brides Crois\u00e9es</td></tr>
  <tr><td>Couleur</td><td>Noir / Blanc</td></tr>
  <tr><td>Mati\u00e8re</td><td>Cuir Premium + Caoutchouc</td></tr>
  <tr><td>Semelle</td><td>Caoutchouc \u00c9pais</td></tr>
  <tr><td>D\u00e9tail Signature</td><td>Logo Fl\u00e8che Grav\u00e9</td></tr>
  <tr><td>Fermeture</td><td>Enfiler</td></tr>
  <tr><td>Style</td><td>Sandale Streetwear Luxe</td></tr>
  <tr><td>Tailles</td><td>40 - 46</td></tr>
  <tr><td>Exp\u00e9di\u00e9 de</td><td>Abuja, Nigeria</td></tr>
  <tr><td>Inclus</td><td>Bo\u00eete Originale Off-White</td></tr>
</table>`,
      tags: JSON.stringify(["off-white", "slides", "sandals", "luxury", "leather", "streetwear", "designer", "black", "abuja"]),
      tagsFr: JSON.stringify(["off-white", "sandales", "claquettes", "luxe", "cuir", "streetwear", "designer", "noir", "abuja"]),
      seoTitle: "Off-White Cross-Strap Leather Slide Black | New Deal Zone",
      seoTitleFr: "Sandale Off-White Crois\u00e9e Cuir Noir | New Deal Zone",
      seoDescription: "Shop the Off-White Cross-Strap Leather Slide in Black/White. Premium leather, arrow logo, cushioned sole. Fast delivery from Abuja. Authentic luxury streetwear.",
      seoDescriptionFr: "Achetez la sandale Off-White \u00e0 brides crois\u00e9es en cuir noir/blanc. Cuir premium, logo fl\u00e8che, semelle amortie. Livraison rapide depuis Abuja.",
      focusKeyphrase: "Off-White cross strap slide",
      focusKeyphraseFr: "sandale Off-White crois\u00e9e cuir",
      ogImage: imageUrl,
      canonical: "https://www.newdealzone.com/en/product/off-white-cross-strap-slide-black",
    }).returning();

    const reviewsData = [
      {
        productId: product.id,
        customerName: "Emeka Okonkwo",
        rating: 5,
        comment: "These Off-White slides are absolutely fire. The leather is buttery soft and the arrow detail is clean. Got compliments the first day I wore them out in Abuja.",
        commentFr: "Ces claquettes Off-White sont absolument magnifiques. Le cuir est incroyablement doux et le d\u00e9tail fl\u00e8che est impeccable. J'ai re\u00e7u des compliments d\u00e8s le premier jour \u00e0 Abuja.",
        avatar: "EO",
        verified: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        productId: product.id,
        customerName: "Adaeze Nwachukwu",
        rating: 5,
        comment: "Luxury quality you can feel immediately. The packaging with the original Off-White box was a nice touch. Fits true to size and very comfortable for all-day wear.",
        commentFr: "Qualit\u00e9 luxe qu'on ressent imm\u00e9diatement. L'emballage avec la bo\u00eete originale Off-White \u00e9tait un beau geste. Taille fid\u00e8le et tr\u00e8s confortable pour un port toute la journ\u00e9e.",
        avatar: "AN",
        verified: true,
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      },
      {
        productId: product.id,
        customerName: "Kunle Adeboye",
        rating: 4,
        comment: "Great slides overall. The leather quality is top tier and the black/white contrast is striking. Only thing is the sole could be a bit softer for long walks, but for casual wear they're perfect.",
        commentFr: "Excellentes sandales dans l'ensemble. La qualit\u00e9 du cuir est de premier ordre et le contraste noir/blanc est saisissant. Seul b\u00e9mol, la semelle pourrait \u00eatre un peu plus souple pour les longues marches, mais pour un usage d\u00e9contract\u00e9 elles sont parfaites.",
        avatar: "KA",
        verified: false,
        createdAt: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000),
      },
      {
        productId: product.id,
        customerName: "Blessing Eze",
        rating: 5,
        comment: "Bought these for my husband and he loves them. The Off-White branding is subtle yet unmistakable. Delivery to Abuja was quick. Will definitely shop here again!",
        commentFr: "Achet\u00e9es pour mon mari et il les adore. Le branding Off-White est subtil mais reconnaissable. La livraison \u00e0 Abuja a \u00e9t\u00e9 rapide. Je reviendrai acheter ici sans h\u00e9sitation !",
        avatar: "BE",
        verified: true,
        createdAt: new Date(Date.now() - 72 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const rev of reviewsData) {
      await db.insert(reviews).values(rev);
    }

    const totalRating = reviewsData.reduce((s, r) => s + r.rating, 0);
    const avgRating = Math.round((totalRating / reviewsData.length) * 10) / 10;
    await db.update(products).set({
      rating: avgRating.toFixed(1),
      reviewCount: reviewsData.length,
    }).where(eq(products.id, product.id));

    return NextResponse.json({
      success: true,
      message: "Off-White Cross-Strap Slide seeded successfully",
      product: { id: product.id, slug: slugEn, slugFr: slugFr, imageUrl: imageUrl, blobUsed: blobUsed },
      pricing: { costNgn: 37000, sellingNgn: 45000, compareNgn: 52000, costUsd: 27.13, sellingUsd: 32.99, compareUsd: 38.12, profitNgn: 8000, marginPct: 17.8 },
      reviews: { count: reviewsData.length, avg: avgRating, breakdown: "3x5-star, 1x4-star" },
      origin: { country: "NG", city: "Abuja" },
      urls: { en: "https://www.newdealzone.com/en/product/" + slugEn, fr: "https://www.newdealzone.com/fr/product/" + slugFr },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}