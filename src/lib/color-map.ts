// Shared color name -> hex map for color swatches.
// Used by ProductCard, ProductDetails, QuickViewModal.

export const COLOR_MAP: Record<string, string> = {
  black: "#1a1a1a", white: "#ffffff", red: "#dc2626", blue: "#2563eb",
  green: "#16a34a", yellow: "#eab308", orange: "#f97316", pink: "#ec4899",
  purple: "#9333ea", brown: "#78350f", gray: "#6b7280", grey: "#6b7280",
  beige: "#d4b896", navy: "#1e3a8a", cream: "#f5f5dc", tan: "#d2b48c",
  silver: "#c0c0c0", gold: "#d4af37", charcoal: "#36454f", ivory: "#fffff0",
  olive: "#556b2f", teal: "#008080", maroon: "#800000", burgundy: "#800020",
  rose: "#c48189", coral: "#e6795c", mint: "#98ff98", khaki: "#c3b091",
  camo: "#666a4b", nude: "#e3bc9a", bronze: "#af7745", copper: "#b87333",
  lavender: "#c3afdd", violet: "#9b6bcc",
};

/**
 * Resolve a color name to hex. Supports:
 *   - Single: "Black" -> #1a1a1a
 *   - Compound with /: "Black/Grey" -> #1a1a1a (uses first part)
 *   - Compound with dash: "Black-Grey" -> #1a1a1a
 * Returns fallback gray if unknown.
 */
export function getColorHex(name: string): string {
  if (!name) return "#d1d5db";
  const first = name.toLowerCase().split(/[/\-]/)[0].trim();
  return COLOR_MAP[first] || "#d1d5db";
}

/**
 * For dual-color variants like "Black/White", get BOTH hex values.
 * Used to render half-and-half color chips.
 */
export function getColorHexPair(name: string): [string, string | null] {
  if (!name) return ["#d1d5db", null];
  const parts = name.toLowerCase().split(/[/\-]/).map(s => s.trim()).filter(Boolean);
  const first = COLOR_MAP[parts[0]] || "#d1d5db";
  const second = parts[1] ? (COLOR_MAP[parts[1]] || null) : null;
  return [first, second];
}

/**
 * Normalize a color name for consistent storage.
 * "black/white" -> "Black/White"
 * "BLACK-grey"  -> "Black/Grey"
 * Trims and title-cases each part; joins with "/".
 */
export function normalizeColorName(raw: string): string {
  if (!raw) return "";
  return raw
    .split(/[/\-]/)
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("/");
}