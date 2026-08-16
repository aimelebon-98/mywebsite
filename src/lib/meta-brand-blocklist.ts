// Meta Ads brand blocklist - products with these brands are auto-excluded
// from the Meta catalog feed to prevent counterfeit rejections.
// They REMAIN fully visible on the website; only Meta feed hides them.

export const META_BLOCKED_BRANDS: string[] = [
  // Sportswear (highest rejection rate)
  "nike",
  "adidas",
  "jordan",
  "air jordan",
  "yeezy",
  "puma",
  "new balance",
  "asics",
  "converse",
  "vans",
  "reebok",

  // Luxury (auto-rejected 100% of time)
  "louis vuitton",
  "lv",
  "gucci",
  "prada",
  "dior",
  "christian dior",
  "balenciaga",
  "off-white",
  "off white",
  "supreme",
  "bape",
  "a bathing ape",
  "fendi",
  "chanel",
  "hermes",
  "hermès",
  "versace",
  "armani",
  "giorgio armani",
  "burberry",
  "valentino",
  "ysl",
  "yves saint laurent",
  "saint laurent",
  "givenchy",
  "celine",
  "céline",
  "dolce & gabbana",
  "dolce and gabbana",
  "d&g",
  "dg",
  "moncler",
  "loewe",
  "goyard",
  "bulgari",
  "bvlgari",
];

// Case-insensitive match: returns true if brand should be excluded from Meta
export function isBrandBlockedFromMeta(brand: string | null | undefined): boolean {
  if (!brand) return false;
  const normalized = String(brand).trim().toLowerCase();
  if (!normalized) return false;
  return META_BLOCKED_BRANDS.some(blocked => {
    if (normalized === blocked) return true;
    // Also block if brand contains blocked name (e.g., "Nike Sportswear" -> Nike)
    if (normalized.includes(blocked)) return true;
    return false;
  });
}

// Also check product name for brand mentions (some products have empty brand
// field but brand name in product title - still risky for Meta)
export function isProductNameBlockedFromMeta(name: string | null | undefined): boolean {
  if (!name) return false;
  const normalized = String(name).trim().toLowerCase();
  if (!normalized) return false;
  return META_BLOCKED_BRANDS.some(blocked => normalized.includes(blocked));
}

// Combined check: excludes if EITHER brand OR name matches
export function shouldExcludeFromMeta(
  brand: string | null | undefined,
  name: string | null | undefined
): { excluded: boolean; reason: string } {
  const brandBlocked = isBrandBlockedFromMeta(brand);
  const nameBlocked = isProductNameBlockedFromMeta(name);

  if (brandBlocked) {
    return { excluded: true, reason: `Brand '${brand}' in Meta blocklist` };
  }
  if (nameBlocked) {
    return { excluded: true, reason: `Product name contains blocked brand` };
  }
  return { excluded: false, reason: "" };
}