import type { Product, Review } from "@/db/schema";

/**
 * Returns the product name in the given locale, falling back to English if
 * no translation is provided.
 */
export function getProductName(product: Pick<Product, "name" | "nameFr">, locale: string): string {
  if (locale === "fr" && product.nameFr && product.nameFr.trim().length > 0) {
    return product.nameFr;
  }
  return product.name;
}

/**
 * Returns the short description in the given locale (falls back to
 * description, then English). Used for cards / quick view / listings.
 */
export function getProductShortDescription(
  product: Pick<Product, "shortDescription" | "description" | "shortDescriptionFr" | "descriptionFr">,
  locale: string
): string {
  if (locale === "fr") {
    const fr = (product.shortDescriptionFr && product.shortDescriptionFr.trim())
      || (product.descriptionFr && product.descriptionFr.trim());
    if (fr) return fr;
  }
  return product.shortDescription || product.description || "";
}

/**
 * Returns the long description in the given locale (falls back to
 * description, then English). Used on the product details page.
 */
export function getProductLongDescription(
  product: Pick<Product, "longDescription" | "description" | "longDescriptionFr" | "descriptionFr">,
  locale: string
): string {
  if (locale === "fr") {
    const fr = (product.longDescriptionFr && product.longDescriptionFr.trim())
      || (product.descriptionFr && product.descriptionFr.trim());
    if (fr) return fr;
  }
  return product.longDescription || product.description || "";
}

/**
 * Returns the general description (fallback) in the given locale.
 */
export function getProductDescription(
  product: Pick<Product, "description" | "descriptionFr">,
  locale: string
): string {
  if (locale === "fr" && product.descriptionFr && product.descriptionFr.trim().length > 0) {
    return product.descriptionFr;
  }
  return product.description || "";
}

/**
 * Returns a review comment in the given locale, falling back to the
 * original comment.
 */
export function getReviewComment(
  review: Pick<Review, "comment" | "commentFr">,
  locale: string
): string {
  if (locale === "fr" && review.commentFr && review.commentFr.trim().length > 0) {
    return review.commentFr;
  }
  return review.comment || "";
}
