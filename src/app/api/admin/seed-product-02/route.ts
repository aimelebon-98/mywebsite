import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { or, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const slug = "alexander-mcqueen-tread-slick-black-white";
    const slugFr = "alexander-mcqueen-tread-slick-noir-blanc";

    await db.delete(products).where(
      or(eq(products.slug, slug), eq(products.slugFr, slugFr))
    );

    const imageUrl = "https://i.ibb.co/YTdpq5dT/alexander-mcqueen-tread-slick-black-white.jpg";

    const shortDescription = "Alexander McQueen Tread Slick slip-on sneaker in black and white. Chunky platform sole, rubber upper, side-zip closure. Luxury streetwear icon.";

    const longDescription = `<p>Meet the <strong>Alexander McQueen Tread Slick</strong> in Black/White - the runway-born sneaker that turned chunky-sole streetwear into high fashion. This slip-on interpretation of the iconic McQueen tread strips away the laces for a cleaner, faster silhouette without losing a single ounce of drama.</p>
<p>The <strong>rubber-molded black upper</strong> features architectural relief lines and a functional <strong>side-zip closure</strong> for effortless on/off. Sitting atop the signature <strong>oversized white treaded platform sole</strong>, the shoe adds serious height while grounding you with grip-heavy traction. The McQueen pull-tab branding on the tongue seals the luxury detail.</p>
<p><strong>Why sneakerheads love it:</strong></p>
<ul>
<li>Iconic Alexander McQueen chunky tread platform</li>
<li>Slip-on convenience with side-zip - no laces to tie</li>
<li>Rubberized upper resists scuffs and weather</li>
<li>Padded collar for all-day comfort</li>
<li>Bold black/white contrast that pairs with everything</li>
<li>Ships with original Alexander McQueen box + branded dust bag</li>
</ul>
<table>
<tbody>
<tr><td>Brand</td><td>Alexander McQueen</td></tr>
<tr><td>Model</td><td>Tread Slick Slip-On</td></tr>
<tr><td>Colour</td><td>Black/White</td></tr>
<tr><td>Upper Material</td><td>Rubberized Leather with Molded Panels</td></tr>
<tr><td>Sole</td><td>Oversized Rubber Treaded Platform</td></tr>
<tr><td>Closure</td><td>Slip-On with Side Zip</td></tr>
<tr><td>Style</td><td>Chunky Luxury Streetwear</td></tr>
<tr><td>Available Sizes</td><td>EU 40 - 46</td></tr>
<tr><td>Includes</td><td>Original Box + Branded Dust Bag</td></tr>
</tbody>
</table>
<p>Style it with tapered black trousers and an oversized tee for that off-duty McQueen model look, or throw it under joggers and a bomber for elevated street ease. The chunky sole does the heavy lifting - your fit just has to keep up.</p>
<p>Available in <strong>EU sizes 40 to 46</strong>. Order today from <strong>New Deal Zone</strong> and add one of luxury sneakerhood's most recognizable silhouettes to your rotation.</p>`;

    const shortDescriptionFr = "Basket Alexander McQueen Tread Slick \u00e0 enfiler en noir et blanc. Semelle plateforme chunky, tige en caoutchouc, fermeture zipp\u00e9e lat\u00e9rale. Ic\u00f4ne du streetwear de luxe.";

    const longDescriptionFr = `<p>D\u00e9couvrez la <strong>Alexander McQueen Tread Slick</strong> en Noir/Blanc - la basket n\u00e9e sur le podium qui a transform\u00e9 le streetwear \u00e0 semelle chunky en haute couture. Cette interpr\u00e9tation \u00e0 enfiler de l\u2019ic\u00f4nique tread McQueen supprime les lacets pour une silhouette plus \u00e9pur\u00e9e et rapide, sans perdre une once de drame.</p>
<p>La <strong>tige noire en caoutchouc moul\u00e9</strong> pr\u00e9sente des reliefs architecturaux et une <strong>fermeture zipp\u00e9e lat\u00e9rale</strong> fonctionnelle pour un enfilage sans effort. Pos\u00e9e sur l\u2019embl\u00e9matique <strong>semelle plateforme blanche \u00e0 crampons surdimensionn\u00e9e</strong>, la chaussure ajoute une hauteur consid\u00e9rable tout en assurant une adh\u00e9rence maximale. Le pull-tab McQueen sur la languette parach\u00e8ve le d\u00e9tail luxe.</p>
<p><strong>Pourquoi les sneakerheads l\u2019adorent :</strong></p>
<ul>
<li>Plateforme chunky Alexander McQueen ic\u00f4nique</li>
<li>Confort \u00e0 enfiler avec zip lat\u00e9ral - fini les lacets</li>
<li>Tige caoutchout\u00e9e r\u00e9sistante aux rayures et \u00e0 la m\u00e9t\u00e9o</li>
<li>Col rembourr\u00e9 pour un confort toute la journ\u00e9e</li>
<li>Contraste noir/blanc audacieux qui va avec tout</li>
<li>Livr\u00e9e avec la bo\u00eete Alexander McQueen d\u2019origine + housse de protection griff\u00e9e</li>
</ul>
<table>
<tbody>
<tr><td>Marque</td><td>Alexander McQueen</td></tr>
<tr><td>Mod\u00e8le</td><td>Tread Slick \u00c0 Enfiler</td></tr>
<tr><td>Couleur</td><td>Noir/Blanc</td></tr>
<tr><td>Mati\u00e8re</td><td>Cuir Caoutchout\u00e9 avec Panneaux Moul\u00e9s</td></tr>
<tr><td>Semelle</td><td>Plateforme Caoutchouc \u00e0 Crampons Surdimensionn\u00e9e</td></tr>
<tr><td>Fermeture</td><td>\u00c0 Enfiler avec Zip Lat\u00e9ral</td></tr>
<tr><td>Style</td><td>Streetwear Luxe Chunky</td></tr>
<tr><td>Pointures</td><td>EU 40 - 46</td></tr>
<tr><td>Inclus</td><td>Bo\u00eete d\u2019origine + Housse griff\u00e9e</td></tr>
</tbody>
</table>
<p>Associez-la \u00e0 un pantalon noir slim et un t-shirt oversize pour ce look mannequin off-duty McQueen, ou glissez-la sous un jogger et un bomber pour un style street \u00e9lev\u00e9. La semelle chunky fait le gros du travail - votre tenue n\u2019a qu\u2019\u00e0 suivre.</p>
<p>Disponible en <strong>pointures EU 40 \u00e0 46</strong>. Commandez aujourd\u2019hui sur <strong>New Deal Zone</strong> et ajoutez l\u2019une des silhouettes les plus reconnaissables de la sneakerie de luxe \u00e0 votre collection.</p>`;

    await db.insert(products).values({
      name: "Alexander McQueen Tread Slick - Black/White",
      nameFr: "Alexander McQueen Tread Slick - Noir/Blanc",
      slug,
      slugFr,
      description: shortDescription,
      shortDescription,
      longDescription,
      descriptionFr: shortDescriptionFr,
      shortDescriptionFr,
      longDescriptionFr,
      // Price in USD (base). Selling 29500 NGN / 1650 = ~17.88 -> "17.88"
      price: "21.63",
      // Compare price 35000 NGN / 1650 = ~21.21 -> "21.21"
      comparePrice: "25.66",
      // Cost price stored in NGN as-is (admin-only, for profit tracking)
      costprice: "21.63",
      category: "sneakers",
      brand: "Alexander McQueen",
      sizes: JSON.stringify(["40", "41", "42", "43", "44", "45", "46"]),
      colors: JSON.stringify([{ name: "Black/White", image: imageUrl }]),
      imageUrl,
      images: JSON.stringify([imageUrl]),
      stock: 25,
      featured: false,
      active: true,
      material: "Rubberized Leather with Rubber Treaded Platform Sole",
      sku: "NDZ-AMQ-TSS-BW01",
      tags: JSON.stringify(["alexander mcqueen", "tread slick", "chunky sneakers", "platform sneakers", "luxury sneakers", "slip-on sneakers", "black and white sneakers"]),
      tagsFr: JSON.stringify(["alexander mcqueen", "tread slick", "baskets chunky", "baskets plateforme", "baskets luxe", "baskets \u00e0 enfiler", "baskets noir et blanc"]),
      seoTitle: "Alexander McQueen Tread Slick Black/White | New Deal Zone",
      metaDescription: "Shop the Alexander McQueen Tread Slick slip-on in Black/White. Chunky platform sole, side-zip closure. Sizes 40-46. Original box + dust bag included.",
      focusKeyphrase: "alexander mcqueen tread slick",
      ogImage: imageUrl,
      canonicalUrl: "https://www.newdealzone.com/en/product/" + slug,
      noIndex: false,
      seoTitleFr: "Alexander McQueen Tread Slick Noir/Blanc | New Deal Zone",
      metaDescriptionFr: "D\u00e9couvrez la basket Alexander McQueen Tread Slick \u00e0 enfiler Noir/Blanc. Semelle plateforme chunky, fermeture zipp\u00e9e. Pointures 40-46. Bo\u00eete + housse incluses.",
      focusKeyphraseFr: "alexander mcqueen tread slick",
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