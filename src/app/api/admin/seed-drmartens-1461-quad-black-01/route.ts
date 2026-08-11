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

    const costNgn = 35000;
    const sellingNgn = 45000;
    const compareNgn = 55000;

    const costUsd = Math.round((costNgn / NGN_RATE) * 100) / 100;
    const sellingUsd = Math.round((sellingNgn / NGN_RATE) * 100) / 100;
    const compareUsd = Math.round((compareNgn / NGN_RATE) * 100) / 100;
    const costNgnSnap = Math.round(costUsd * NGN_RATE);
    const profitNgn = sellingNgn - costNgn;
    const marginPct = Math.round((profitNgn / sellingNgn) * 1000) / 10;

    const slug = "dr-martens-1461-quad-platform-black";
    const slug_fr = "chaussure-dr-martens-1461-quad-plateforme-noir";
    const slugFr = slug_fr;
    const sourceUrl = "https://i.ibb.co/84R5B3fM/Whats-App-Image-2026-08-09-at-10-11-02-AM.jpg";

    let imageUrl = sourceUrl;
    let blobUsed = false;
    try {
      const imgRes = await fetch(sourceUrl);
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const blob = await put(
          `products/dr-martens-1461-quad-platform-black-${Date.now()}.jpg`,
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

    const nameEn = "Dr. Martens 1461 Quad Platform 4-Eye Shoe - Black Smooth";
    const nameFr = "Chaussure Dr. Martens 1461 Quad Plateforme 4 Oeillets - Noir Lisse";

    const shortDescEn = "Dr. Martens 1461 Quad in black smooth leather - the iconic 3-eye shoe elevated on the chunky Quad platform with signature yellow welt stitch. Ships from Abuja.";
    const shortDescFr = "Dr. Martens 1461 Quad en cuir noir lisse - la chaussure ic\u00f4nique 3 oeillets \u00e9lev\u00e9e sur la plateforme chunky Quad avec surpiq\u00fbre jaune signature. Exp\u00e9di\u00e9 d'Abuja.";

    const longDescEn = `<p>Give the icon a lift with the <strong>Dr. Martens 1461 Quad Platform Shoe in Black Smooth Leather</strong>. Built on the exaggerated Quad platform sole, this reimagined 1461 keeps everything you love about the original 3-eye shoe - smooth black leather upper, grooved edges, iconic yellow welt stitching - and adds serious lift for maximum street impact. The yellow AirWair tag on the laces confirms authentic Doc's pedigree.</p>

<h3>Key Features</h3>
<ul>
<li><strong>Smooth black leather upper</strong> with mirror polish finish</li>
<li><strong>Signature yellow welt stitching</strong> - the iconic Dr. Martens marker</li>
<li><strong>Chunky Quad platform sole</strong> for maximum height and presence</li>
<li><strong>Grooved sole edge</strong> - the classic Doc's design detail</li>
<li><strong>Yellow AirWair tag</strong> on the laces confirms the pedigree</li>
</ul>

<h3>Product Specifications</h3>
<table class="product-spec-table">
<tr><td><strong>Brand</strong></td><td>Dr. Martens</td></tr>
<tr><td><strong>Model</strong></td><td>1461 Quad Platform</td></tr>
<tr><td><strong>Colour</strong></td><td>Black Smooth</td></tr>
<tr><td><strong>Material</strong></td><td>Smooth Leather + Quad Platform Rubber Sole</td></tr>
<tr><td><strong>Cushioning / Sole</strong></td><td>Chunky Quad Platform + Air-Cushioned Insole</td></tr>
<tr><td><strong>Signature Detail</strong></td><td>Yellow Welt Stitch + AirWair Tag + Grooved Sole</td></tr>
<tr><td><strong>Closure</strong></td><td>4-Eyelet Lace-Up</td></tr>
<tr><td><strong>Style</strong></td><td>Platform Derby Shoe</td></tr>
<tr><td><strong>Sizes</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Ships from</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Includes</strong></td><td>Original Dr. Martens Box + Care Card</td></tr>
</table>

<h3>How to Style</h3>
<p>Pair with skinny jeans or cropped tapered trousers to show off the platform lift, or go full punk-luxe with a midi skirt and oversized coat. The Quad platform adds inches without the buckle-heavy boot look, making these an easier daily driver than the 1460 boot. Wear with white socks intentionally exposed for that Doc's-purist look, or with slouchy socks for grunge energy.</p>

<p><strong>Order now</strong> for fast delivery from our Abuja warehouse. British rebellion, six decades strong.</p>`;

    const longDescFr = `<p>Donnez de la hauteur \u00e0 l'ic\u00f4ne avec la <strong>Chaussure Dr. Martens 1461 Quad Plateforme en Cuir Noir Lisse</strong>. Construite sur la semelle plateforme Quad exag\u00e9r\u00e9e, cette 1461 r\u00e9imagin\u00e9e garde tout ce que vous aimez de la chaussure originale 3 oeillets - tige en cuir noir lisse, bords rainur\u00e9s, surpiq\u00fbre jaune ic\u00f4nique - et ajoute une hauteur s\u00e9rieuse pour un impact street maximal. L'\u00e9tiquette jaune AirWair sur les lacets confirme le pedigree Doc's authentique.</p>

<h3>Caract\u00e9ristiques Cl\u00e9s</h3>
<ul>
<li><strong>Tige en cuir noir lisse</strong> avec finition polie miroir</li>
<li><strong>Surpiq\u00fbre jaune signature</strong> - le marqueur ic\u00f4nique Dr. Martens</li>
<li><strong>Semelle plateforme chunky Quad</strong> pour hauteur et pr\u00e9sence maximales</li>
<li><strong>Bord de semelle rainur\u00e9</strong> - le d\u00e9tail design Doc's classique</li>
<li><strong>\u00c9tiquette jaune AirWair</strong> sur les lacets confirme le pedigree</li>
</ul>

<h3>Fiche Technique</h3>
<table class="product-spec-table">
<tr><td><strong>Marque</strong></td><td>Dr. Martens</td></tr>
<tr><td><strong>Mod\u00e8le</strong></td><td>1461 Quad Plateforme</td></tr>
<tr><td><strong>Couleur</strong></td><td>Noir Lisse</td></tr>
<tr><td><strong>Mati\u00e8re</strong></td><td>Cuir Lisse + Semelle Plateforme Quad Caoutchouc</td></tr>
<tr><td><strong>Amorti</strong></td><td>Plateforme Chunky Quad + Semelle Int\u00e9rieure Air-Cushion</td></tr>
<tr><td><strong>D\u00e9tail Signature</strong></td><td>Surpiq\u00fbre Jaune + \u00c9tiquette AirWair + Semelle Rainur\u00e9e</td></tr>
<tr><td><strong>Fermeture</strong></td><td>Laçage 4 Oeillets</td></tr>
<tr><td><strong>Style</strong></td><td>Chaussure Derby Plateforme</td></tr>
<tr><td><strong>Tailles</strong></td><td>EU 41-46</td></tr>
<tr><td><strong>Exp\u00e9di\u00e9 de</strong></td><td>Abuja, Nigeria</td></tr>
<tr><td><strong>Inclus</strong></td><td>Bo\u00eete Dr. Martens Originale + Carte d'Entretien</td></tr>
</table>

<h3>Comment la Porter</h3>
<p>Associez avec un jean slim ou un pantalon fusel\u00e9 court pour montrer la hauteur plateforme, ou faites full punk-luxe avec une jupe midi et un manteau oversized. La plateforme Quad ajoute des centim\u00e8tres sans l'aspect botte lourde \u00e0 boucles, ce qui les rend plus faciles \u00e0 porter au quotidien que la botte 1460. Portez avec des chaussettes blanches intentionnellement expos\u00e9es pour le look Doc's-puriste, ou avec des chaussettes flottantes pour une \u00e9nergie grunge.</p>

<p><strong>Commandez maintenant</strong> pour une livraison rapide depuis notre entrep\u00f4t d'Abuja. R\u00e9bellion britannique, six d\u00e9cennies de force.</p>`;

    const sizes = ["41","42","43","44","45","46"];
    const colors = [{ name: "Black Smooth", image: imageUrl }];
    const tagsEn = ["dr martens", "doc martens", "1461 quad", "platform shoe", "4-eye", "black leather", "chunky platform", "punk", "abuja"];
    const tagsFr = ["dr martens", "doc martens", "1461 quad", "chaussure plateforme", "4 oeillets", "cuir noir", "plateforme chunky", "punk", "abuja"];

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
      sku: "NDZ-DRM-1461Q-BK01",
      category: "casual",
      brand: "Dr. Martens",
      stock: 20,
      sizes: JSON.stringify(sizes),
      colors: JSON.stringify(colors),
      images: JSON.stringify([imageUrl]),
      imageUrl: imageUrl,
      material: "Smooth Leather + Rubber",
      active: true,
      featured: true,
      rating: "5.0",
      reviewCount: 0,
      tags: JSON.stringify(tagsEn),
      tagsFr: JSON.stringify(tagsFr),
      seoTitle: "Dr. Martens 1461 Quad Platform Shoe Black Smooth | New Deal Zone",
      seoTitleFr: "Chaussure Dr. Martens 1461 Quad Plateforme Noir | New Deal Zone",
      metaDescription: "Shop the Dr. Martens 1461 Quad platform shoe in black smooth leather with yellow welt stitch and chunky Quad sole. Iconic Docs elevated. Fast delivery from Abuja.",
      metaDescriptionFr: "Achetez la chaussure Dr. Martens 1461 Quad plateforme en cuir noir lisse avec surpiq\u00fbre jaune et semelle chunky Quad. Docs ic\u00f4niques \u00e9lev\u00e9es. Livraison rapide depuis Abuja.",
      focusKeyphrase: "dr martens 1461 quad platform",
      focusKeyphraseFr: "dr martens 1461 quad plateforme",
      canonicalUrl: `https://www.newdealzone.com/en/product/${slug}`,
      ogImage: imageUrl,
    }).returning();

    const now = Date.now();
    const day = 86400000;
    const reviewsData = [
      { customerName: "Blessing Owusu", rating: 5, comment: "The Quad platform gives serious height and I love that it is the shoe version, not the boot. Yellow welt stitch is picture-perfect. Delivery to Abuja was fast.", commentFr: "La plateforme Quad donne une hauteur s\u00e9rieuse et j'adore que ce soit la version chaussure, pas la botte. La surpiq\u00fbre jaune est parfaite. Livraison rapide \u00e0 Abuja.", verified: true, daysAgo: 6 },
      { customerName: "Julie Martin", rating: 5, comment: "Been Doc's loyal for years and the Quad platform is my new favorite. Easier to walk in than the 1460 boot with the same iconic look. Yellow AirWair tag confirms real deal.", commentFr: "Fid\u00e8le Doc's depuis des ann\u00e9es et la plateforme Quad est ma nouvelle favorite. Plus facile \u00e0 marcher que la botte 1460 avec le m\u00eame look ic\u00f4nique. L'\u00e9tiquette jaune AirWair confirme le vrai deal.", verified: true, daysAgo: 22 },
      { customerName: "Diallo Sy", rating: 4, comment: "Great shoes and the platform is a game changer for adding height without wearing heels. Only reason for 4 stars is standard Doc's break-in period - stiff for the first two weeks.", commentFr: "Super chaussures et la plateforme change la donne pour ajouter de la hauteur sans porter de talons. La seule raison des 4 \u00e9toiles est la p\u00e9riode d'assouplissement standard Doc's - rigide les deux premi\u00e8res semaines.", verified: true, daysAgo: 38 },
      { customerName: "Steven Kamau", rating: 5, comment: "Bought these for my sister and she wears them constantly. The grooved sole edge is a nice detail and the smooth leather takes polish beautifully. Timeless piece.", commentFr: "Je les ai achet\u00e9es pour ma soeur et elle les porte constamment. Le bord de semelle rainur\u00e9 est un joli d\u00e9tail et le cuir lisse prend le cirage magnifiquement. Pi\u00e8ce intemporelle.", verified: false, daysAgo: 61 },
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
      message: "Dr. Martens 1461 Quad Platform Black seeded successfully",
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