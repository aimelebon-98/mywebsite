import sanitizeHtmlLib from "sanitize-html";

const PRODUCT_HTML_OPTIONS: sanitizeHtmlLib.IOptions = {
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
    a: sanitizeHtmlLib.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
  },
  allowedScriptDomains: [],
  allowedScriptHostnames: [],
};

const COMMENT_HTML_OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: ["p", "br", "strong", "em", "b", "i"],
  allowedAttributes: {},
  allowedSchemes: [],
};

const PLAIN_TEXT_OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

export function sanitizeContent(html: string): string {
  if (!html) return "";
  return sanitizeHtmlLib(html, PRODUCT_HTML_OPTIONS);
}

export function sanitizeHtml(html: string): string {
  return sanitizeContent(html);
}

export function sanitizeComment(text: string): string {
  if (!text) return "";
  return sanitizeHtmlLib(text, COMMENT_HTML_OPTIONS);
}

export function stripHtml(text: string): string {
  if (!text) return "";
  return sanitizeHtmlLib(text, PLAIN_TEXT_OPTIONS).trim();
}

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

export function validateLength(
  value: string,
  maxLength: number,
  fieldName: string
): string | null {
  if (value && value.length > maxLength) {
    return fieldName + " exceeds maximum length of " + maxLength + " characters";
  }
  return null;
}
