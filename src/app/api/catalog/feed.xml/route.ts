// route: catalog/feed.xml - multi-currency + backward-compat bare-UUID mode
// Behavior:
//   ?lang=en           -> emits {id}_en items only
//   ?lang=fr           -> emits {id}_fr items only
//   (no lang param)    -> emits bare {id} items only (backward-compat with old catalog)
import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.newdealzone.com";

const CATEGORY_GPC: Record<string, string> = {
  sneakers: "187", running: "187", formal: "187",
  boots: "187", sandals: "187", casual: "187",
};

const CURRENCY_COUNTRY: Record<string, string> = {
  NGN: "NG", GHS: "GH", KES: "KE", ZAR: "ZA",
  XOF: "TG", EUR: "FR", GBP: "GB", USD: "US",
};

interface CurrencyMeta { decimals: number; roundTo?: number }
const CURRENCY_META: Record<string, CurrencyMeta> = {
  USD: { decimals: 2 },
  EUR: { decimals: 2 },
  GBP: { decimals: 2 },
  NGN: { decimals: 0, roundTo: 100 },
  GHS: { decimals: 2 },
  XOF: { decimals: 0, roundTo: 100 },
  KES: { decimals: 0, roundTo: 10 },
  ZAR: { decimals: 2 },
};
const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_META);

const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79,
  NGN: 1500, GHS: 12.5, XOF: 600, KES: 128, ZAR: 18.5,
};

function xmlEscape(s: string | null | undefined): string {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

function stripHtml(s: string | null | undefined): string {
  if (!s) return "";
  return String(s)
    .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
}

function safeJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function convertPrice(usdPrice: number, currency: string, rates: Record<string, number>): string {
  const meta = CURRENCY_META[currency] || { decimals: 2 };
  const rate = rates[currency] || 1;
  let converted = usdPrice * rate;
  if (meta.roundTo && meta.roundTo > 1) {
    converted = Math.round(converted / meta.roundTo) * meta.roundTo;
  }
  return converted.toFixed(meta.decimals);
}

function buildItem(opts: {
  id: string; itemGroupId: string; title: string; description: string;
  link: string; imageLink: string; additionalImages: string[];
  availability: string; price: string; salePrice: string | null;
  brand: string; category: string; gpc: string; productType: string;
  mpn: string; material: string; color: string; sizes: string[];
  customLabel0: string; customLabel1: string; customLabel2: string;
  customLabel3: string; customLabel4: string;
  currency: string;
}): string {
  const sizesXml = opts.sizes.length > 0
    ? `    <g:size>${xmlEscape(opts.sizes.join(", "))}</g:size>\n`
    : "";
  const additionalImagesXml = opts.additionalImages
    .slice(0, 10)
    .map(url => `    <g:additional_image_link>${xmlEscape(url)}</g:additional_image_link>`)
    .join("\n");

  const shippingCountry = CURRENCY_COUNTRY[opts.currency] || "NG";

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
      <g:country>${shippingCountry}</g:country>
      <g:service>Standard</g:service>
      <g:price>0 ${opts.currency}</g:price>
    </g:shipping>
  </item>`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const langParam = (url.searchParams.get("lang") || "").toLowerCase();

  // Mode detection:
  //   no lang param      -> "bare" mode (backward-compat, IDs unsuffixed)
  //   lang=en            -> "en" mode
  //   lang=fr            -> "fr" mode
  type Mode = "bare" | "en" | "fr";
  let mode: Mode;
  if (langParam === "en") mode = "en";
  else if (langParam === "fr") mode = "fr";
  else mode = "bare";

  // Bare mode (old catalog) defaults to NGN. Per-language modes default to USD.
  const defaultCurrency = mode === "bare" ? "NGN" : "USD";
  const rawCurrency = (url.searchParams.get("currency") || defaultCurrency).toUpperCase();
  const currency = SUPPORTED_CURRENCIES.includes(rawCurrency) ? rawCurrency : defaultCurrency;

  // Live rates
  let rates: Record<string, number> = { ...FALLBACK_RATES };
  try {
    const rateRes = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: AbortSignal.timeout(5000),
    });
    if (rateRes.ok) {
      const data = await rateRes.json();
      if (data.result === "success" && data.rates) {
        for (const code of SUPPORTED_CURRENCIES) {
          if (typeof data.rates[code] === "number") {
            rates[code] = data.rates[code];
          }
        }
      }
    }
  } catch { /* use fallback */ }

  try {
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.active, true), eq(products.metaEligible, true)));

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
      let regularUsd = priceNum;
      let saleUsd: number | null = null;
      if (compareNum > priceNum) {
        regularUsd = compareNum;
        saleUsd = priceNum;
      }

      const regularConverted = `${convertPrice(regularUsd, currency, rates)} ${currency}`;
      const saleConverted = saleUsd !== null ? `${convertPrice(saleUsd, currency, rates)} ${currency}` : null;

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
      const labelOrigin = (p.originCountry || "").toUpperCase();
      const labelCategory = category;

      const hasFr = !!(p.nameFr || p.slugFr);
      const frSlug = p.slugFr || enSlug;
      const frTitle = (p.nameFr || p.name || "").slice(0, 150);
      const frDesc = stripHtml(p.shortDescriptionFr || p.descriptionFr || p.nameFr || p.name || "").slice(0, 5000);

      // BARE mode: emit ID without suffix (backward-compat with old catalog + old pixel events)
      if (mode === "bare") {
        items.push(buildItem({
          id: String(p.id),
          itemGroupId: String(p.id),
          title: enTitle,
          description: enDesc,
          link: `${SITE_URL}/en/product/${enSlug}`,
          imageLink: primaryImage,
          additionalImages,
          availability,
          price: regularConverted,
          salePrice: saleConverted,
          brand, category, gpc, productType, mpn,
          material: p.material || "",
          color: primaryColor,
          sizes,
          customLabel0: labelFeatured,
          customLabel1: labelPremium,
          customLabel2: "",
          customLabel3: labelOrigin,
          customLabel4: labelCategory,
          currency,
        }));
      }

      // EN mode: emit {id}_en
      if (mode === "en") {
        items.push(buildItem({
          id: `${p.id}_en`,
          itemGroupId: String(p.id),
          title: enTitle,
          description: enDesc,
          link: `${SITE_URL}/en/product/${enSlug}`,
          imageLink: primaryImage,
          additionalImages,
          availability,
          price: regularConverted,
          salePrice: saleConverted,
          brand, category, gpc, productType, mpn,
          material: p.material || "",
          color: primaryColor,
          sizes,
          customLabel0: labelFeatured,
          customLabel1: labelPremium,
          customLabel2: "en",
          customLabel3: labelOrigin,
          customLabel4: labelCategory,
          currency,
        }));
      }

      // FR mode: emit {id}_fr (only if product has FR translation)
      if (mode === "fr" && hasFr) {
        items.push(buildItem({
          id: `${p.id}_fr`,
          itemGroupId: String(p.id),
          title: frTitle,
          description: frDesc,
          link: `${SITE_URL}/fr/product/${frSlug}`,
          imageLink: primaryImage,
          additionalImages,
          availability,
          price: regularConverted,
          salePrice: saleConverted,
          brand, category, gpc, productType, mpn,
          material: p.material || "",
          color: primaryColor,
          sizes,
          customLabel0: labelFeatured,
          customLabel1: labelPremium,
          customLabel2: "fr",
          customLabel3: labelOrigin,
          customLabel4: labelCategory,
          currency,
        }));
      }
    }

    const feedTitle = [
      "New Deal Zone Product Feed",
      mode === "en" ? "(English)" : mode === "fr" ? "(Francais)" : "(Bare IDs)",
      currency !== "USD" ? `- ${currency}` : "",
    ].filter(Boolean).join(" ");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${feedTitle}</title>
  <link>${SITE_URL}</link>
  <description>Authentic footwear catalog for New Deal Zone - fast delivery across Africa</description>
${items.join("\n")}
</channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Feed-Mode": mode,
        "X-Feed-Currency": currency,
        "X-Feed-Items": String(items.length),
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