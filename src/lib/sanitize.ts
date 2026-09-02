/**
 * HTML Sanitizer & Helper utilities for New Deal Zone content.
 */

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html || typeof html !== "string") return "";

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

export function sanitizeRichHtml(html: string | null | undefined): string {
  return sanitizeHtml(html);
}

export function stripHtml(html: string | null | undefined): string {
  if (!html || typeof html !== "string") return "";
  return html.replace(/<[^>]*>/g, "").trim();
}