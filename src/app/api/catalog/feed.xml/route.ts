// route: catalog/feed.xml (cache bust 2026-08-17T00:00:00Z - locale-suffix fix)
import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export const revalidate = 3600;
export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.newdealzone.com";

const CATEGORY_GPC: Record<string, string> = {
  sneakers: "187", running: "187", formal: "187",
  boots: "187", sandals: "187", casual: "187",
};

function xmlEscape(s: string | null | undefined): string {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

function stripHtml(s: string | null | undefined): string {
  if (!s) return "";
  return String(s)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function safeJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function buildItem(opts: {
  id: string; itemGroupId: string; title: string; description: string;
  link: string; imageLink: string; additionalImages: string[];
  availability: string; price: string; salePrice: string | null;
  brand: string; category: string; gpc: string; productType: string;
  mpn: string; material: string; color: string; sizes: string[];
  customLabel0: string; customLabel1: string; customLabel2: string;
  customLabel3: string; customLabel4: string;
}): string {
  const sizesXml = opts.sizes.length > 0
    ? `    <g:size>${xmlEscape(opts.sizes.join(", "))}</g:size>\n`
    : "";
  const additionalImagesXml = opts.additionalImages
    .slice(0, 10)
    .map(url => `    <g:additional_image_link>${xmlEscape(url)}</g:additional_image_link>`)
    .join("\n");

  return `  <item>
    <g:id>${xmlEscape(opts.id)}</g:id>
    <g:item_group_id>${xmlEscape(opts.itemGroupId)}</g:item_group_id>
    <g:title>${xmlEscape(opts.title)}</g:title>
    <g:description>${xmlEscape(opts.description)}</g:description>
    <g:link>${xmlEscape(opts.link)}</g:link>
    <g:image_link>${xmlEscape(opts.imageLink)}</g:image_link>
${additionalImagesXml}
    <g:availability>${opts.availability}</g:availability>
    <g:price>${opts.price}</g:price>
${opts.salePrice ? `    <g:sale_price>${opts.salePrice}</g:sale_price>\n` : ""}    <g:brand>${xmlEscape(opts.brand)}</g:brand>
    <g:condition>new</g:condition>
    <g:google_product_category>${opts.gpc}</g:google_product_category>
    <g:product_type>${xmlEscape(opts.productType)}</g:product_type>
    <g:mpn>${xmlEscape(opts.mpn)}</g:mpn>
    <g:identifier_exists>false</g:identifier_exists>
${opts.customLabel0 ? `    <g:custom_label_0>${xmlEscape(opts.customLabel0)}</g:custom_label_0>\n` : ""}${opts.customLabel1 ? `    <g:custom_label_1>${xmlEscape(opts.customLabel1)}</g:custom_label_1>\n` : ""}${opts.customLabel2 ? `    <g:custom_label_2>${xmlEscape(opts.customLabel2)}</g:custom_label_2>\n` : ""}${opts.customLabel3 ? `    <g:custom_label_3>${xmlEscape(opts.customLabel3)}</g:custom_label_3>\n` : ""}${opts.customLabel4 ? `    <g:custom_label_4>${xmlEscape(opts.customLabel4)}</g:custom_label_4>\n` : ""}
${opts.material ? `    <g:material>${xmlEscape(opts.material)}</g:material>\n` : ""}${opts.color ? `    <g:color>${xmlEscape(opts.color)}</g:color>\n` : ""}${sizesXml}    <g:shipping>
      <g:country>NG</g:country>
      <g:service>Standard</g:service>
      <g:price>0.00 USD</g:price>
    </g:shipping>
  </item>`;
}

export async function GET() {
  try {
    const rows = await db.select().from(products).where(eq(products.active, true));
    const items: string[] = [];

    for (const p of rows) {
      const images = safeJson<string[]>(p.images, []);
      const colors = safeJson<Array<{ name?: string; image?: string }>>(p.colors, []);
      const sizes = safeJson<string[]>(p.sizes, []);
      const primaryImage = p.imageUrl || images[0] || "";
      if (!primaryImage) continue;

      const additionalImages = images.filter(img => img && img !== primaryImage).slice(0, 10);
      const availability = (p.stock ?? 0) > 0 ? "in stock" : "out of stock";
      const priceNum = Number(p.price ?? 0);
      const compareNum = p.comparePrice ? Number(p.comparePrice) : 0;
      let regularPrice = priceNum;
      let salePrice: number | null = null;
      if (compareNum > priceNum) {
        regularPrice = compareNum;
        salePrice = priceNum;
      }

      const brand = p.brand || "New Deal Zone";
      const category = p.category || "sneakers";
      const gpc = CATEGORY_GPC[category] || "187";
      const productType = `Footwear > ${category.charAt(0).toUpperCase() + category.slice(1)}`;
      const mpn = p.sku || String(p.id);
      const primaryColor = colors[0]?.name || "";

      const enSlug = p.slug || String(p.id);
      const enTitle = (p.name || "").slice(0, 150);
      const enDesc = stripHtml(p.shortDescription || p.description || p.name || "").slice(0, 5000);

      const labelFeatured = p.featured === true ? "featured" : "";
      const labelPremium = priceNum > 50 ? "premium" : priceNum >= 30 ? "mid" : "starter";
      const labelSale = salePrice !== null ? "sale" : "";
      const labelOrigin = (p.originCountry || "").toUpperCase();
      const labelCategory = category;

      // EN variant: id MUST differ from item_group_id (Meta rule)
      items.push(buildItem({
        id: `${p.id}_en`, itemGroupId: String(p.id),
        title: enTitle, description: enDesc,
        link: `${SITE_URL}/en/product/${enSlug}`,
        imageLink: primaryImage, additionalImages,
        availability, price: `${regularPrice.toFixed(2)} USD`,
        salePrice: salePrice !== null ? `${salePrice.toFixed(2)} USD` : null,
        brand, category, gpc, productType, mpn,
        material: p.material || "", color: primaryColor, sizes,
        customLabel0: labelFeatured, customLabel1: labelPremium,
        customLabel2: labelSale, customLabel3: labelOrigin,
        customLabel4: labelCategory,
      }));

      // FR variant
      if (p.nameFr || p.slugFr) {
        const frSlug = p.slugFr || enSlug;
        const frTitle = (p.nameFr || p.name || "").slice(0, 150);
        const frDesc = stripHtml(p.shortDescriptionFr || p.descriptionFr || p.nameFr || p.name || "").slice(0, 5000);

        items.push(buildItem({
          id: `${p.id}_fr`, itemGroupId: String(p.id),
          title: frTitle, description: frDesc,
          link: `${SITE_URL}/fr/product/${frSlug}`,
          imageLink: primaryImage, additionalImages,
          availability, price: `${regularPrice.toFixed(2)} USD`,
          salePrice: salePrice !== null ? `${salePrice.toFixed(2)} USD` : null,
          brand, category, gpc, productType, mpn,
          material: p.material || "", color: primaryColor, sizes,
          customLabel0: labelFeatured, customLabel1: labelPremium,
          customLabel2: labelSale, customLabel3: labelOrigin,
          customLabel4: labelCategory,
        }));
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>New Deal Zone Product Feed</title>
  <link>${SITE_URL}</link>
  <description>Authentic footwear catalog for New Deal Zone - fast delivery across Africa</description>
${items.join("\n")}
</channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("Catalog feed error:", err);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>\n<error>Failed to build feed</error>`,
      { status: 500, headers: { "Content-Type": "application/xml" } }
    );
  }
}
