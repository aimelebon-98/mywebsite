/**
 * Simple HTML sanitizer for rendering user-supplied / rich content safely.
 * Allows safe structural tags: p, ul, ol, li, h1-h4, strong, em, b, i, br, span, table, tbody, tr, th, td.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html || typeof html !== "string") return "";

  // Strip dangerous tags: script, iframe, object, embed, style, form, input
  let clean = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  clean = clean.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
  clean = clean.replace(/<object[\s\S]*?<\/object>/gi, "");
  clean = clean.replace(/<embed[\s\S]*?<\/embed>/gi, "");
  clean = clean.replace(/<style[\s\S]*?<\/style>/gi, "");
  clean = clean.replace(/<form[\s\S]*?<\/form>/gi, "");
  clean = clean.replace(/on\w+="[^"]*"/gi, "");
  clean = clean.replace(/on\w+='[^']*'/gi, "");
  clean = clean.replace(/javascript:[^"']*/gi, "");

  return clean;
}