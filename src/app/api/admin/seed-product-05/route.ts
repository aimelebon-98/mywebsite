import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { or, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const slug = "off-white-chunky-trail-boot-tan";
    const slugFr = "off-white-boot-chunky-trail-fauve";

    await db.delete(products).where(
      or(eq(products.slug, slug), eq(products.slugFr, slugFr))
    );

    const image1 = "https://i.ibb.co/7Jk02gpx/off-white-chunky-trail-boot-tan-front.jpg";
    const image2 = "https://i.ibb.co/Vc0t3HZf/off-white-chunky-trail-boot-tan-side.jpg";

    const shortDescription = "Off-White chunky trail low boot in tan nubuck with signature zip-tie tag, orange arrow charm and dramatic black lug platform sole. Statement streetwear.";

    const longDescription = `<p>Meet the <strong>Off-White Chunky Trail Low Boot</strong> in Tan - a bold streetwear statement that fuses rugged utility with the signature Off-White design language. The warm nubuck upper delivers that premium hiking-inspired look, while the aggressive chunky black outsole grounds the silhouette with unmistakable presence.</p>
<p>Every Off-White signature detail is here: the famous <strong>white zip-tie industrial tag</strong>, the <strong>orange arrow charm</strong> hanging from the laces, and the subtle side branding. The <strong>chunky black lug outsole</strong> adds serious height and grip, while the <strong>lace-up front with black round laces</strong> keeps the fit locked in tight.</p>
<p><strong>Why this boot commands attention:</strong></p>
<ul>
<li>Premium tan nubuck leather upper with clean stitching</li>
<li>Signature Off-White white zip-tie tag included</li>
<li>Iconic orange arrow charm on laces</li>
<li>Dramatic chunky black rubber lug outsole</li>
<li>Padded ankle collar for comfort and support</li>
<li>Reinforced toe cap for durability</li>
<li>Round black laces for that utility-luxe finish</li>
<li>Ships with the original Off-White box + accessories</li>
</ul>
<table>
<tbody>
<tr><td>Brand</td><td>Off-White</td></tr>
<tr><td>Style</td><td>Chunky Trail Low Boot</td></tr>
<tr><td>Colour</td><td>Tan / Wheat</td></tr>
<tr><td>Upper Material</td><td>Premium Nubuck Leather</td></tr>
<tr><td>Sole</td><td>Chunky Black Rubber Lug Platform</td></tr>
<tr><td>Closure</td><td>Lace-Up</td></tr>
<tr><td>Signature Details</td><td>White Zip-Tie Tag + Orange Arrow Charm</td></tr>
<tr><td>Style Category</td><td>Streetwear / Utility Luxe</td></tr>
<tr><td>Available Sizes</td><td>EU 41 - 46</td></tr>
<tr><td>Includes</td><td>Original Box + Off-White Accessories</td></tr>
</tbody>
</table>
<p>Pair with slim tapered pants and an oversized graphic tee for classic streetwear, or lean into the utility vibe with cargo trousers and a technical jacket. The tan/black color combo makes this boot work across seasons - from autumn rotation to spring statement pieces.</p>
<p>Available in <strong>EU sizes 41 to 46</strong>. Order today from <strong>New Deal Zone</strong> and add one of Off-White\u2019s most versatile chunky silhouettes to your wardrobe - now at 17% off.</p>`;

    const shortDescriptionFr = "Boot chunky trail basse Off-White en nubuck fauve avec \u00e9tiquette zip-tie signature, breloque fl\u00e8che orange et semelle plateforme \u00e0 crampons noirs spectaculaire. Streetwear statement.";

    const longDescriptionFr = `<p>D\u00e9couvrez la <strong>Boot Chunky Trail Basse Off-White</strong> en Fauve - un statement streetwear audacieux qui fusionne l\u2019utilit\u00e9 robuste avec le langage design signature Off-White. La tige en nubuck chaud offre ce look premium inspir\u00e9 de la randonn\u00e9e, tandis que la semelle noire chunky agressive ancre la silhouette avec une pr\u00e9sence incomparable.</p>
<p>Chaque d\u00e9tail signature Off-White est pr\u00e9sent : la c\u00e9l\u00e8bre <strong>\u00e9tiquette industrielle zip-tie blanche</strong>, la <strong>breloque fl\u00e8che orange</strong> pendue aux lacets et le marquage lat\u00e9ral subtil. La <strong>semelle ext\u00e9rieure noire chunky \u00e0 crampons</strong> ajoute une hauteur consid\u00e9rable et de l\u2019adh\u00e9rence, tandis que le <strong>laage \u00e0 lacets ronds noirs</strong> garde le fit bien ajust\u00e9.</p>
<p><strong>Pourquoi cette boot commande l\u2019attention :</strong></p>
<ul>
<li>Tige en nubuck fauve premium avec coutures impeccables</li>
<li>\u00c9tiquette zip-tie blanche Off-White signature incluse</li>
<li>Breloque fl\u00e8che orange ic\u00f4nique sur les lacets</li>
<li>Semelle ext\u00e9rieure en caoutchouc noir \u00e0 crampons chunky</li>
<li>Col cheville rembourr\u00e9 pour confort et maintien</li>
<li>Bout renforc\u00e9 pour la durabilit\u00e9</li>
<li>Lacets ronds noirs pour cette finition utility-luxe</li>
<li>Livr\u00e9e avec la bo\u00eete Off-White d\u2019origine et les accessoires</li>
</ul>
<table>
<tbody>
<tr><td>Marque</td><td>Off-White</td></tr>
<tr><td>Style</td><td>Boot Chunky Trail Basse</td></tr>
<tr><td>Couleur</td><td>Fauve / Bl\u00e9</td></tr>
<tr><td>Mati\u00e8re</td><td>Nubuck Premium</td></tr>
<tr><td>Semelle</td><td>Plateforme Caoutchouc Noir \u00e0 Crampons Chunky</td></tr>
<tr><td>Fermeture</td><td>\u00c0 Lacets</td></tr>
<tr><td>D\u00e9tails Signature</td><td>\u00c9tiquette Zip-Tie Blanche + Fl\u00e8che Orange</td></tr>
<tr><td>Cat\u00e9gorie</td><td>Streetwear / Utility Luxe</td></tr>
<tr><td>Pointures</td><td>EU 41 - 46</td></tr>
<tr><td>Inclus</td><td>Bo\u00eete d\u2019origine + Accessoires Off-White</td></tr>
</tbody>
</table>
<p>Associez-la avec un pantalon slim tapered et un t-shirt graphique oversize pour un streetwear classique, ou penchez vers le vibe utility avec un pantalon cargo et une veste technique. La combinaison fauve/noir fait de cette boot une pi\u00e8ce polyvalente toute saison - de la rotation automnale aux pi\u00e8ces statement printani\u00e8res.</p>
<p>Disponible en <strong>pointures EU 41 \u00e0 46</strong>. Commandez aujourd\u2019hui sur <strong>New Deal Zone</strong> et ajoutez l\u2019une des silhouettes chunky Off-White les plus polyvalentes \u00e0 votre garde-robe - maintenant \u00e0 -17 %.</p>`;

    await db.insert(products).values({
      name: "Off-White Chunky Trail Low Boot - Tan",
      nameFr: "Off-White Boot Chunky Trail Basse - Fauve",
      slug,
      slugFr,
      description: shortDescription,
      shortDescription,
      longDescription,
      descriptionFr: shortDescriptionFr,
      shortDescriptionFr,
      longDescriptionFr,
      // Selling 29000 NGN / 1650 = ~17.58 USD
      price: "21.26",
      // Compare 35000 NGN / 1650 = ~21.21 USD -> shows -17% SAVE badge
      comparePrice: "25.66",
      // Cost 20000 NGN stored as-is (admin-only, profit tracking)
      costprice: "21.26",
      category: "boots",
      brand: "Off-White",
      sizes: JSON.stringify(["41", "42", "43", "44", "45", "46"]),
      colors: JSON.stringify([{ name: "Tan", image: image1 }]),
      imageUrl: image1,
      images: JSON.stringify([image1, image2]),
      stock: 25,
      featured: false,
      active: true,
      material: "Premium Nubuck Leather with Chunky Rubber Lug Sole",
      sku: "NDZ-OFW-CTB-TN01",
      tags: JSON.stringify(["off-white", "chunky boots", "trail boots", "tan boots", "designer boots", "streetwear", "platform boots", "utility footwear"]),
      tagsFr: JSON.stringify(["off-white", "boots chunky", "boots trail", "boots fauves", "boots designer", "streetwear", "boots plateforme", "chaussures utility"]),
      seoTitle: "Off-White Chunky Trail Boot Tan | New Deal Zone",
      metaDescription: "Shop the Off-White Chunky Trail Low Boot in Tan nubuck. Signature zip-tie tag + orange arrow charm. Sizes 41-46. 17% off now on New Deal Zone.",
      focusKeyphrase: "off-white chunky trail boot",
      ogImage: image1,
      canonicalUrl: "https://www.newdealzone.com/en/product/" + slug,
      noIndex: false,
      seoTitleFr: "Off-White Boot Chunky Trail Fauve | New Deal Zone",
      metaDescriptionFr: "D\u00e9couvrez la Boot Chunky Trail Basse Off-White en nubuck fauve. \u00c9tiquette zip-tie + fl\u00e8che orange. Pointures 41-46. -17 % sur New Deal Zone.",
      focusKeyphraseFr: "off-white boot chunky trail",
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