import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { or, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const slug = "nike-air-force-1-cream-grey-rope-laces";
    const slugFr = "nike-air-force-1-creme-gris-lacets-corde";

    await db.delete(products).where(
      or(eq(products.slug, slug), eq(products.slugFr, slugFr))
    );

    const image1 = "https://i.ibb.co/x86FBYHX/nike-air-force-1-cream-grey-rope-laces-detail.jpg";
    const image2 = "https://i.ibb.co/pBXMPxrj/nike-air-force-1-cream-grey-rope-laces-box.jpg";

    const shortDescription = "Nike Air Force 1 low in cream and grey premium leather with chunky rope laces, dark grey Swoosh and gum-accent midsole. The AF1 icon, elevated.";

    const longDescription = `<p>Meet the <strong>Nike Air Force 1 Cream/Grey</strong> - a fresh premium take on the sneaker that has defined street culture for over four decades. This colorway leans luxe: a warm cream leather base is layered with cool grey suede overlays, anchored by a bold <strong>dark grey Swoosh</strong> that catches the eye without shouting.</p>
<p>The real showstoppers are the <strong>chunky natural rope laces</strong> - a nod to the current dad-shoe and workwear trend, replacing the standard flat laces with textured statement cord. Underfoot, the classic Air Force 1 midsole gets a subtle <strong>gum-tinted edge</strong> for warmth and vintage character, sitting on Nike\u2019s legendary responsive Air cushioning.</p>
<p><strong>Why this AF1 stands out:</strong></p>
<ul>
<li>Premium cream leather + grey suede overlay construction</li>
<li>Bold dark grey Swoosh for maximum contrast</li>
<li>Signature chunky natural rope laces (statement upgrade)</li>
<li>Gum-tinted midsole edge for vintage warmth</li>
<li>Classic AIR heel branding embossed</li>
<li>Nike Air cushioning for all-day comfort</li>
<li>Perforated toe box for breathability</li>
<li>Ships in the original Nike box with authenticity tag</li>
</ul>
<table>
<tbody>
<tr><td>Brand</td><td>Nike</td></tr>
<tr><td>Model</td><td>Air Force 1 Low</td></tr>
<tr><td>Colour</td><td>Cream/Grey</td></tr>
<tr><td>Upper Material</td><td>Premium Leather with Suede Overlays</td></tr>
<tr><td>Laces</td><td>Chunky Natural Rope</td></tr>
<tr><td>Sole</td><td>Nike Air Cushioning with Gum-Tinted Edge</td></tr>
<tr><td>Closure</td><td>Lace-Up</td></tr>
<tr><td>Style</td><td>Lifestyle / Streetwear</td></tr>
<tr><td>Available Sizes</td><td>EU 40 - 46</td></tr>
<tr><td>Includes</td><td>Original Nike Box + Authenticity Tag</td></tr>
</tbody>
</table>
<p>Style it with cream chinos and a knit polo for that clean off-duty look, or bring the streetwear energy with baggy denim and an oversized hoodie. The neutral cream/grey palette makes this AF1 the most versatile grail in your rotation - it goes with everything, elevates everything.</p>
<p>Available in <strong>EU sizes 40 to 46</strong>. Order today from <strong>New Deal Zone</strong> and lock in one of the most quietly stylish Air Force 1 colorways of the season - now at 29% off.</p>`;

    const shortDescriptionFr = "Nike Air Force 1 basse en cuir cr\u00e8me et gris premium avec lacets corde \u00e9pais, Swoosh gris fonc\u00e9 et semelle interm\u00e9diaire \u00e0 touche gomme. L\u2019ic\u00f4ne AF1, r\u00e9invent\u00e9e.";

    const longDescriptionFr = `<p>D\u00e9couvrez la <strong>Nike Air Force 1 Cr\u00e8me/Gris</strong> - une r\u00e9interpr\u00e9tation premium fra\u00eeche de la basket qui d\u00e9finit la culture street depuis plus de quatre d\u00e9cennies. Cette palette de couleurs mise sur le luxe : une base en cuir cr\u00e8me chaud superpos\u00e9e de couches de daim gris frais, ancr\u00e9e par un audacieux <strong>Swoosh gris fonc\u00e9</strong> qui attire le regard sans crier.</p>
<p>Les v\u00e9ritables vedettes sont les <strong>lacets naturels \u00e9pais en corde</strong> - un clin d\u2019\u0153il \u00e0 la tendance dad-shoe et workwear actuelle, rempla\u00e7ant les lacets plats standard par un cordon texturis\u00e9 statement. Dessous, la semelle interm\u00e9diaire classique de l\u2019Air Force 1 re\u00e7oit une <strong>touche gomme subtile</strong> sur le bord pour la chaleur et le caract\u00e8re vintage, pos\u00e9e sur l\u2019amorti Air l\u00e9gendaire et r\u00e9actif de Nike.</p>
<p><strong>Pourquoi cette AF1 se d\u00e9marque :</strong></p>
<ul>
<li>Construction premium en cuir cr\u00e8me + surcouche daim gris</li>
<li>Swoosh gris fonc\u00e9 audacieux pour un contraste maximal</li>
<li>Lacets naturels \u00e9pais en corde signature (upgrade statement)</li>
<li>Bord de semelle interm\u00e9diaire teint\u00e9 gomme pour la chaleur vintage</li>
<li>Marquage AIR classique embossage talon</li>
<li>Amorti Nike Air pour un confort toute la journ\u00e9e</li>
<li>Bout perfor\u00e9 pour la respirabilit\u00e9</li>
<li>Livr\u00e9e dans la bo\u00eete Nike d\u2019origine avec \u00e9tiquette d\u2019authenticit\u00e9</li>
</ul>
<table>
<tbody>
<tr><td>Marque</td><td>Nike</td></tr>
<tr><td>Mod\u00e8le</td><td>Air Force 1 Basse</td></tr>
<tr><td>Couleur</td><td>Cr\u00e8me/Gris</td></tr>
<tr><td>Mati\u00e8re</td><td>Cuir Premium avec Surcouche Daim</td></tr>
<tr><td>Lacets</td><td>Corde Naturelle \u00c9paisse</td></tr>
<tr><td>Semelle</td><td>Amorti Nike Air avec Bord Teint\u00e9 Gomme</td></tr>
<tr><td>Fermeture</td><td>\u00c0 Lacets</td></tr>
<tr><td>Style</td><td>Lifestyle / Streetwear</td></tr>
<tr><td>Pointures</td><td>EU 40 - 46</td></tr>
<tr><td>Inclus</td><td>Bo\u00eete Nike d\u2019origine + \u00c9tiquette</td></tr>
</tbody>
</table>
<p>Associez-la avec un chino cr\u00e8me et un polo en maille pour un look off-duty impeccable, ou apportez l\u2019\u00e9nergie streetwear avec un jean baggy et un sweat \u00e0 capuche oversize. La palette neutre cr\u00e8me/gris fait de cette AF1 le grail le plus polyvalent de votre collection - elle va avec tout, \u00e9l\u00e8ve tout.</p>
<p>Disponible en <strong>pointures EU 40 \u00e0 46</strong>. Commandez aujourd\u2019hui sur <strong>New Deal Zone</strong> et adoptez l\u2019une des palettes Air Force 1 les plus discr\u00e8tement stylish\u00e9es de la saison - maintenant \u00e0 -29 %.</p>`;

    await db.insert(products).values({
      name: "Nike Air Force 1 Low - Cream/Grey with Rope Laces",
      nameFr: "Nike Air Force 1 Basse - Cr\u00e8me/Gris Lacets Corde",
      slug,
      slugFr,
      description: shortDescription,
      shortDescription,
      longDescription,
      descriptionFr: shortDescriptionFr,
      shortDescriptionFr,
      longDescriptionFr,
      // Selling 25000 NGN / 1650 = ~15.15 USD
      price: "18.33",
      // Compare 35000 NGN / 1650 = ~21.21 USD -> shows -29% SAVE badge
      comparePrice: "25.66",
      // Cost 17000 NGN stored as-is (admin-only, profit tracking)
      costprice: "18.33",
      category: "sneakers",
      brand: "Nike",
      sizes: JSON.stringify(["40", "41", "42", "43", "44", "45", "46"]),
      colors: JSON.stringify([{ name: "Cream/Grey", image: image1 }]),
      imageUrl: image1,
      images: JSON.stringify([image1, image2]),
      stock: 25,
      featured: false,
      active: true,
      material: "Premium Leather with Suede Overlays and Nike Air Sole",
      sku: "NDZ-NKE-AF1-CG01",
      tags: JSON.stringify(["nike", "air force 1", "af1", "cream sneakers", "grey sneakers", "rope laces", "lifestyle sneakers", "streetwear"]),
      tagsFr: JSON.stringify(["nike", "air force 1", "af1", "baskets cr\u00e8me", "baskets grises", "lacets corde", "baskets lifestyle", "streetwear"]),
      seoTitle: "Nike Air Force 1 Cream/Grey Rope Laces | New Deal Zone",
      metaDescription: "Shop the Nike Air Force 1 Low in Cream/Grey with chunky rope laces and gum-accent sole. Premium leather + suede. Sizes 40-46. 29% off now on New Deal Zone.",
      focusKeyphrase: "nike air force 1 cream grey",
      ogImage: image1,
      canonicalUrl: "https://www.newdealzone.com/en/product/" + slug,
      noIndex: false,
      seoTitleFr: "Nike Air Force 1 Cr\u00e8me/Gris Lacets Corde | New Deal Zone",
      metaDescriptionFr: "D\u00e9couvrez la Nike Air Force 1 Basse Cr\u00e8me/Gris avec lacets corde \u00e9pais et semelle teint\u00e9e gomme. Cuir premium + daim. Pointures 40-46. -29 % sur New Deal Zone.",
      focusKeyphraseFr: "nike air force 1 creme gris",
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