import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize rich HTML (blog posts, product long descriptions, TOC content)
 * Keeps safe formatting tags; strips scripts/event handlers.
 */
export function sanitizeRichHtml(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return "";
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p", "br", "hr", "b", "i", "em", "strong", "u", "s", "a",
      "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "blockquote", "pre", "code",
      "table", "thead", "tbody", "tr", "th", "td",
      "span", "div", "img", "figure", "figcaption",
      "section", "article", "nav"
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel", "class", "id",
      "src", "alt", "width", "height", "title",
      "colspan", "rowspan"
    ],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input", "button", "svg", "math"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "onmouseenter", "onmouseleave"],
  });
}

/**
 * Strip ALL HTML for plain text fields (names, short comments, addresses)
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== "string") return "";
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

/** Alias used by customer routes */
export function stripHtml(input: string): string {
  return sanitizeHtml(input);
}

/** Alias used by customer review routes */
export function sanitizeComment(input: string): string {
  return sanitizeHtml(input);
}