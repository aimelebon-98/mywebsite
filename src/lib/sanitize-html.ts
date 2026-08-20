/**
 * Lightweight HTML sanitizer for server-rendered rich content.
 * Strips script tags, event handlers, javascript: URLs, and dangerous elements.
 * Defense-in-depth: Tiptap editor already generates safe HTML,
 * this catches edge cases from vendor/admin paste or DB tampering.
 */

const DANGEROUS_TAGS = /<\/?(?:script|iframe|object|embed|form|input|textarea|select|button|style|link|meta|base|applet)[^>]*>/gi;
const EVENT_HANDLERS = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;
const JS_URLS = /(?:href|src|action|formaction|data|poster)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi;
const CSS_EXPRESSIONS = /style\s*=\s*"[^"]*(?:expression|url\s*\(|import\s|behavior)[^"]*"/gi;
const DATA_URLS = /(?:href|src)\s*=\s*(?:"data:text\/html[^"]*"|'data:text\/html[^']*')/gi;

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  let clean = html;
  clean = clean.replace(DANGEROUS_TAGS, "");
  clean = clean.replace(EVENT_HANDLERS, "");
  clean = clean.replace(JS_URLS, 'href="#"');
  clean = clean.replace(CSS_EXPRESSIONS, "");
  clean = clean.replace(DATA_URLS, 'href="#"');
  return clean;
}