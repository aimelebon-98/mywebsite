import sanitizeHtml from "sanitize-html";

/**
 * Sanitize user-generated HTML content.
 * Strips all dangerous tags, attributes, and event handlers.
 *
 * Usage:
 *   import { sanitizeContent, sanitizeComment } from "@/lib/sanitize";
 *   const safe = sanitizeContent(body.longDescription);
 */

const PRODUCT_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr",
    "h2", "h3", "h4",
    "ul", "ol", "li",
    "strong", "b", "em", "i", "u", "s",
    "a", "img",
    "table", "thead", "tbody", "tr", "th", "td",
    "blockquote", "pre", "code",
    "span", "div",
    "sup", "sub",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan"],
    span: ["class"],
    div: ["class"],
    table: ["class"],
    "*": [],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {
    img: ["http", "https", "data"],
  },
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
  },
  // Strip all on* event handlers
  allowedScriptDomains: [],
  allowedScriptHostnames: [],
};

const COMMENT_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "em", "b", "i"],
  allowedAttributes: {},
  allowedSchemes: [],
};

const PLAIN_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

/**
 * Sanitize rich HTML content (product descriptions, blog posts).
 * Allows formatting tags, tables, links, images.
 */
export function sanitizeContent(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, PRODUCT_HTML_OPTIONS);
}

/**
 * Sanitize short user comments (reviews, blog comments).
 * Allows only basic text formatting.
 */
export function sanitizeComment(text: string): string {
  if (!text) return "";
  return sanitizeHtml(text, COMMENT_HTML_OPTIONS);
}

/**
 * Strip ALL HTML — returns plain text only.
 * Use for names, subjects, labels, slugs.
 */
export function stripHtml(text: string): string {
  if (!text) return "";
  return sanitizeHtml(text, PLAIN_TEXT_OPTIONS).trim();
}

/**
 * Validate and sanitize a URL.
 * Returns empty string if invalid or javascript: URI.
 */
export function sanitizeUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.toLowerCase().startsWith("javascript:")) return "";
  if (trimmed.toLowerCase().startsWith("data:text/html")) return "";
  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) return "";
    return trimmed;
  } catch {
    return "";
  }
}

/**
 * Validate input length and reject (not truncate) oversized input.
 * Returns null if valid, error message if too long.
 */
export function validateLength(
  value: string,
  maxLength: number,
  fieldName: string
): string | null {
  if (value && value.length > maxLength) {
    return `${fieldName} exceeds maximum length of ${maxLength} characters`;
  }
  return null;
}

// ── Backward-compatible alias ──
// BlogPostContent.tsx imports sanitizeHtml
export const sanitizeHtml = sanitizeContent;