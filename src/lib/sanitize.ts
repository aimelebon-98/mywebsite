import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize rich HTML content (e.g. blog posts, product long descriptions)
 * Allows safe formatting tags while stripping script tags, event handlers, and iframes.
 */
export function sanitizeRichHtml(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return "";
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p", "b", "i", "em", "strong", "a", "ul", "ol", "li",
      "h2", "h3", "h4", "h5", "h6", "blockquote", "table",
      "thead", "tbody", "tr", "th", "td", "span", "div", "br", "hr", "img"
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class", "src", "alt", "width", "height"],
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "svg"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
  });
}

/**
 * Strip all HTML tags completely for plain text fields (names, comments, reviews, addresses)
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== "string") return "";
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
}

/**
 * Alias for sanitizeHtml for customer account fields
 */
export function stripHtml(input: string): string {
  return sanitizeHtml(input);
}

/**
 * Alias for sanitizeHtml specifically for comments and reviews
 */
export function sanitizeComment(input: string): string {
  return sanitizeHtml(input);
}