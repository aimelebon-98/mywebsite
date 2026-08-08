import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { or, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const slug = "gucci-chunky-platform-loafer-bee-black";
    const slugFr = "mocassin-gucci-plateforme-chunky-abeille-noir";

    await db.delete(products).where(
      or(eq(products.slug, slug), eq(products.slugFr, slugFr))
    );

    const imageUrl = "https://i.ibb.co/Fqs6ySCT/gucci-chunky-platform-loafer-bee-black.jpg";

    const shortDescription = "Gucci chunky platform loafer in black with signature GG monogram canvas, gold bee and horsebit hardware, and dramatic lug sole. Luxury statement footwear.";

    const longDescription = `<p>Meet the <strong>Gucci Chunky Platform Loafer</strong> in Black - a house-icon reimagined for the era of maximalist streetwear. This piece fuses timeless Gucci craftsmanship with a rebellious chunky lug sole, delivering a loafer that walks confidently between the boardroom and the runway.</p>
<p>The upper is a masterclass in Gucci detail: <strong>patent leather</strong> wraps the toe and heel, framing the unmistakable <strong>GG monogram canvas</strong> vamp. The centerpiece is the signature <strong>gold-tone bee with pearl accent</strong>, paired with the iconic <strong>horsebit hardware</strong> - each element hand-finished for that unmistakable Maison Gucci polish.</p>
<p><strong>Why this loafer stands out:</strong></p>
<ul>
<li>Signature GG monogram canvas vamp - instantly recognizable</li>
<li>Gold-tone bee embellishment with pearl detail</li>
<li>Iconic Gucci horsebit hardware in aged gold</li>
<li>Patent leather toe cap and heel for high shine</li>
<li>Dramatic chunky rubber lug outsole for grip and height</li>
<li>Slip-on convenience with structured back for support</li>
<li>Ships with the iconic green Gucci box</li>
</ul>
<table>
<tbody>
<tr><td>Brand</td><td>Gucci</td></tr>
<tr><td>Style</td><td>Chunky Platform Loafer</td></tr>
<tr><td>Colour</td><td>Black</td></tr>
<tr><td>Upper Material</td><td>Patent Leather + GG Monogram Canvas</td></tr>
<tr><td>Hardware</td><td>Gold Bee with Pearl + Horsebit</td></tr>
<tr><td>Sole</td><td>Chunky Rubber Lug Platform</td></tr>
<tr><td>Closure</td><td>Slip-On Loafer</td></tr>
<tr><td>Category</td><td>Luxury Lifestyle</td></tr>
<tr><td>Available Sizes</td><td>EU 43 - 47</td></tr>
<tr><td>Includes</td><td>Original Gucci Green Box</td></tr>
</tbody>
</table>
<p>Wear them with tailored trousers and a crisp white tee for elevated smart-casual, or push the fashion envelope with wide-leg denim and an oversized blazer. The chunky sole means this loafer plays hard - all-day comfort under head-turning silhouette.</p>
<p>Available in <strong>EU sizes 43 to 47</strong>. Order today from <strong>New Deal Zone</strong> and step into one of the most talked-about luxury silhouettes of the season.</p>`;

    const shortDescriptionFr = "Mocassin Gucci \u00e0 plateforme chunky en noir avec toile monogramme GG signature, mat\u00e9riel abeille et mors dor\u00e9s, et semelle crampons spectaculaire. Chaussure de luxe statement.";

    const longDescriptionFr = `<p>D\u00e9couvrez le <strong>Mocassin Gucci \u00e0 Plateforme Chunky</strong> en Noir - une ic\u00f4ne de la maison r\u00e9imagin\u00e9e pour l\u2019\u00e8re du streetwear maximaliste. Cette pi\u00e8ce fusionne l\u2019artisanat intemporel de Gucci avec une semelle chunky rebelle, offrant un mocassin qui \u00e9volue avec assurance entre le bureau et le podium.</p>
<p>La tige est une masterclass du d\u00e9tail Gucci : le <strong>cuir verni</strong> enveloppe la pointe et le talon, encadrant l\u2019incomparable <strong>toile monogramme GG</strong> sur l\u2019empeigne. La pi\u00e8ce ma\u00eetresse est l\u2019<strong>abeille ton or avec accent perle</strong> signature, associ\u00e9e au c\u00e9l\u00e8bre <strong>mors Gucci</strong> - chaque \u00e9l\u00e9ment fini \u00e0 la main pour cette finition inimitable de la Maison Gucci.</p>
<p><strong>Pourquoi ce mocassin se d\u00e9marque :</strong></p>
<ul>
<li>Toile monogramme GG signature - instantan\u00e9ment reconnaissable</li>
<li>Embellissement abeille ton or avec d\u00e9tail perle</li>
<li>Mors Gucci ic\u00f4nique en or vieilli</li>
<li>Bout et talon en cuir verni pour un \u00e9clat maximal</li>
<li>Semelle ext\u00e9rieure en caoutchouc \u00e0 crampons chunky pour l\u2019adh\u00e9rence et la hauteur</li>
<li>Confort \u00e0 enfiler avec dos structur\u00e9 pour le maintien</li>
<li>Livr\u00e9 dans l\u2019ic\u00f4nique bo\u00eete verte Gucci</li>
</ul>
<table>
<tbody>
<tr><td>Marque</td><td>Gucci</td></tr>
<tr><td>Style</td><td>Mocassin Plateforme Chunky</td></tr>
<tr><td>Couleur</td><td>Noir</td></tr>
<tr><td>Mati\u00e8re</td><td>Cuir Verni + Toile Monogramme GG</td></tr>
<tr><td>Mat\u00e9riel</td><td>Abeille Dor\u00e9e avec Perle + Mors</td></tr>
<tr><td>Semelle</td><td>Plateforme Caoutchouc \u00e0 Crampons</td></tr>
<tr><td>Fermeture</td><td>Mocassin \u00e0 Enfiler</td></tr>
<tr><td>Cat\u00e9gorie</td><td>Lifestyle de Luxe</td></tr>
<tr><td>Pointures</td><td>EU 43 - 47</td></tr>
<tr><td>Inclus</td><td>Bo\u00eete Verte Gucci d\u2019Origine</td></tr>
</tbody>
</table>
<p>Portez-le avec un pantalon tailleur et un t-shirt blanc impeccable pour un smart-casual \u00e9lev\u00e9, ou repoussez les limites de la mode avec un jean large et un blazer oversize. La semelle chunky signifie que ce mocassin joue dur - confort toute la journ\u00e9e sous une silhouette qui fait tourner les t\u00eates.</p>
<p>Disponible en <strong>pointures EU 43 \u00e0 47</strong>. Commandez aujourd\u2019hui sur <strong>New Deal Zone</strong> et adoptez l\u2019une des silhouettes de luxe les plus discut\u00e9es de la saison.</p>`;

    await db.insert(products).values({
      name: "Gucci Chunky Platform Loafer with Bee - Black",
      nameFr: "Mocassin Gucci Plateforme Chunky avec Abeille - Noir",
      slug,
      slugFr,
      description: shortDescription,
      shortDescription,
      longDescription,
      descriptionFr: shortDescriptionFr,
      shortDescriptionFr,
      longDescriptionFr,
      // Selling 45000 NGN / 1650 = ~27.27 USD
      price: "32.99",
      // Compare 49000 NGN / 1650 = ~29.70 USD -> shows -8% SAVE badge
      comparePrice: "35.92",
      // Cost 36000 NGN stored as-is (admin-only, profit tracking)
      costPrice: "36000",
      category: "sneakers",
      brand: "Gucci",
      sizes: JSON.stringify(["43", "44", "45", "46", "47"]),
      colors: JSON.stringify([{ name: "Black", image: imageUrl }]),
      imageUrl,
      images: JSON.stringify([imageUrl]),
      stock: 25,
      featured: false,
      active: true,
      material: "Patent Leather with GG Monogram Canvas and Rubber Lug Sole",
      sku: "NDZ-GCC-CPL-BK01",
      tags: JSON.stringify(["gucci", "gucci loafer", "chunky loafer", "platform loafer", "luxury loafer", "black loafer", "designer footwear", "gg monogram"]),
      tagsFr: JSON.stringify(["gucci", "mocassin gucci", "mocassin chunky", "mocassin plateforme", "mocassin luxe", "mocassin noir", "chaussure designer", "monogramme gg"]),
      seoTitle: "Gucci Chunky Platform Loafer Black with Bee | New Deal Zone",
      metaDescription: "Shop the Gucci Chunky Platform Loafer in Black with GG monogram, gold bee and horsebit. Sizes 43-47. Original Gucci box included. Luxury statement.",
      focusKeyphrase: "gucci chunky platform loafer",
      ogImage: imageUrl,
      canonicalUrl: "https://www.newdealzone.com/en/product/" + slug,
      noIndex: false,
      seoTitleFr: "Mocassin Gucci Plateforme Chunky Noir Abeille | New Deal Zone",
      metaDescriptionFr: "D\u00e9couvrez le Mocassin Gucci Plateforme Chunky Noir avec monogramme GG, abeille dor\u00e9e et mors. Pointures 43-47. Bo\u00eete Gucci d\u2019origine incluse.",
      focusKeyphraseFr: "mocassin gucci plateforme chunky",
    });

    return NextResponse.json({
      success: true,
      message: "Product seeded successfully",
      slug,
      slugFr,
      urls: {
        en: "https://www.newdealzone.com/en/product/" + slug,
        fr: "https://www.newdealzone.com/fr/product/" + slugFr,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}