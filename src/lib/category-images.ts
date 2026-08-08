/**
 * Single source of truth for category thumbnail images.
 * Used by:
 *  - Homepage "Shop by Category" section
 *  - Shop page CategoryShowcase carousel
 *  - CategoryShowcase component fallbacks
 *
 * To change a category image, update it here and it will apply everywhere.
 */

export const CATEGORY_IMAGES: Record<string, string> = {
  sneakers: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
  running:  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80",
  formal:   "https://plus.unsplash.com/premium_photo-1670984281009-863453504c52?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  boots:    "https://3v40dosnpnvxrirm.public.blob.vercel-storage.com/products/msjxv6rj-whatsapp-image-2026-08-07-at-11.08.42-am.webp",
  sandals:  "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80",
  casual:   "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80",
};

export const DEFAULT_CATEGORY_IMAGE = "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80";

export const CATEGORY_IMAGE_ALL = "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&q=80";

/**
 * Get image for a category slug with sensible fallback.
 */
export function getCategoryImage(slug: string): string {
  return CATEGORY_IMAGES[slug] || DEFAULT_CATEGORY_IMAGE;
}