// Handles both legacy (string[]) and new ({name, image}[]) color formats.
// Fully backward-compatible - existing products continue to work.

export interface ColorVariant {
  name: string;
  image: string; // empty string if none
}

/**
 * Parse the `colors` JSON string from the DB into a normalized array.
 * Accepts both old format ["Black", "White"] and new format [{name, image}].
 */
export function parseColorVariants(colorsJson: string | null | undefined): ColorVariant[] {
  if (!colorsJson) return [];
  try {
    const raw = JSON.parse(colorsJson);
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => {
      if (typeof item === "string") {
        return { name: item, image: "" };
      }
      if (item && typeof item === "object" && typeof item.name === "string") {
        return { name: item.name, image: typeof item.image === "string" ? item.image : "" };
      }
      return { name: String(item), image: "" };
    }).filter((v) => v.name.trim().length > 0);
  } catch {
    return [];
  }
}

/**
 * Serialize back to JSON string for DB storage.
 * If NO variant has an image, store as legacy string[] to keep DB clean.
 * Otherwise store as {name, image}[].
 */
export function serializeColorVariants(variants: ColorVariant[]): string {
  const cleaned = variants.filter((v) => v.name.trim().length > 0);
  const hasAnyImage = cleaned.some((v) => v.image.trim().length > 0);
  if (!hasAnyImage) {
    return JSON.stringify(cleaned.map((v) => v.name));
  }
  return JSON.stringify(cleaned.map((v) => ({ name: v.name, image: v.image })));
}

/** Get just the names (for legacy display code). */
export function getColorNames(colorsJson: string | null | undefined): string[] {
  return parseColorVariants(colorsJson).map((v) => v.name);
}

/** Find variant by name. */
export function findVariantByName(variants: ColorVariant[], name: string): ColorVariant | undefined {
  return variants.find((v) => v.name === name);
}