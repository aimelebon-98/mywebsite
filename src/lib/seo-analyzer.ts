// Yoast-style SEO analyzer for blog posts

export type CheckStatus = "good" | "ok" | "bad" | "empty";

export interface SeoCheck {
  id: string;
  label: string;
  status: CheckStatus;
  message: string;
  weight: number;
}

export interface SeoAnalysis {
  score: number;
  status: CheckStatus;
  goodCount: number;
  okCount: number;
  badCount: number;
  emptyCount: number;
  checks: SeoCheck[];
}

interface AnalyzeInput {
  title: string;
  seoTitle?: string;
  metaDescription?: string;
  focusKeyphrase?: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  coverImageAlt?: string;
  tags?: string[];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function containsKeyphrase(text: string, keyphrase: string): boolean {
  if (!keyphrase || !text) return false;
  return text.toLowerCase().includes(keyphrase.toLowerCase());
}

function countKeyphrase(text: string, keyphrase: string): number {
  if (!keyphrase || !text) return 0;
  const regex = new RegExp(keyphrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return (text.match(regex) || []).length;
}

export function analyzeSeo(input: AnalyzeInput): SeoAnalysis {
  const checks: SeoCheck[] = [];
  const plainContent = stripHtml(input.content || "");
  const words = wordCount(plainContent);
  const kp = (input.focusKeyphrase || "").trim();
  const displayTitle = input.seoTitle || input.title || "";

  checks.push({
    id: "keyphrase",
    label: "Focus keyphrase",
    weight: 10,
    ...(kp
      ? { status: "good" as CheckStatus, message: `Focus keyphrase is set: "${kp}"` }
      : { status: "empty" as CheckStatus, message: "Add a focus keyphrase to enable SEO analysis" }),
  });

  if (kp) {
    checks.push({
      id: "keyphrase-in-title",
      label: "Keyphrase in SEO title",
      weight: 9,
      ...(containsKeyphrase(displayTitle, kp)
        ? { status: "good" as CheckStatus, message: "Your focus keyphrase appears in the SEO title" }
        : { status: "bad" as CheckStatus, message: "Add your focus keyphrase to the SEO title" }),
    });
  } else {
    checks.push({ id: "keyphrase-in-title", label: "Keyphrase in SEO title", status: "empty", message: "Waiting for focus keyphrase", weight: 9 });
  }

  if (kp) {
    const slugText = input.slug.toLowerCase().replace(/-/g, " ");
    checks.push({
      id: "keyphrase-in-slug",
      label: "Keyphrase in URL slug",
      weight: 7,
      ...(containsKeyphrase(slugText, kp)
        ? { status: "good" as CheckStatus, message: "Focus keyphrase appears in the URL slug" }
        : { status: "ok" as CheckStatus, message: "Consider adding the keyphrase to the URL slug" }),
    });
  } else {
    checks.push({ id: "keyphrase-in-slug", label: "Keyphrase in URL slug", status: "empty", message: "Waiting for focus keyphrase", weight: 7 });
  }

  const meta = input.metaDescription || "";
  if (kp) {
    checks.push({
      id: "keyphrase-in-meta",
      label: "Keyphrase in meta description",
      weight: 8,
      ...(containsKeyphrase(meta, kp)
        ? { status: "good" as CheckStatus, message: "Focus keyphrase found in meta description" }
        : { status: "bad" as CheckStatus, message: "Add your focus keyphrase to the meta description" }),
    });
  } else {
    checks.push({ id: "keyphrase-in-meta", label: "Keyphrase in meta description", status: "empty", message: "Waiting for focus keyphrase", weight: 8 });
  }

  if (kp) {
    const firstParagraph = plainContent.substring(0, 300);
    checks.push({
      id: "keyphrase-in-intro",
      label: "Keyphrase in introduction",
      weight: 8,
      ...(containsKeyphrase(firstParagraph, kp)
        ? { status: "good" as CheckStatus, message: "Focus keyphrase appears in the first paragraph" }
        : { status: "ok" as CheckStatus, message: "Add focus keyphrase to the first 300 characters" }),
    });
  } else {
    checks.push({ id: "keyphrase-in-intro", label: "Keyphrase in introduction", status: "empty", message: "Waiting for focus keyphrase", weight: 8 });
  }

  if (kp && words > 100) {
    const occurrences = countKeyphrase(plainContent, kp);
    const kpWords = wordCount(kp);
    const density = (occurrences * kpWords / words) * 100;
    if (density < 0.5) {
      checks.push({ id: "keyphrase-density", label: "Keyphrase density", weight: 6, status: "ok", message: `Density ${density.toFixed(2)}% - a bit low. Try to use the keyphrase more (target 0.5%-2.5%)` });
    } else if (density > 3) {
      checks.push({ id: "keyphrase-density", label: "Keyphrase density", weight: 6, status: "bad", message: `Density ${density.toFixed(2)}% - too high, may be seen as keyword stuffing` });
    } else {
      checks.push({ id: "keyphrase-density", label: "Keyphrase density", weight: 6, status: "good", message: `Density ${density.toFixed(2)}% - good range` });
    }
  } else {
    checks.push({ id: "keyphrase-density", label: "Keyphrase density", status: "empty", message: "Need keyphrase and 100+ words", weight: 6 });
  }

  const titleLen = displayTitle.length;
  if (titleLen === 0) {
    checks.push({ id: "title-length", label: "SEO title length", status: "empty", message: "Add an SEO title", weight: 8 });
  } else if (titleLen < 30) {
    checks.push({ id: "title-length", label: "SEO title length", status: "bad", message: `Only ${titleLen} chars - too short (aim for 50-60)`, weight: 8 });
  } else if (titleLen > 60) {
    checks.push({ id: "title-length", label: "SEO title length", status: "ok", message: `${titleLen} chars - a bit long, may be truncated in search results`, weight: 8 });
  } else if (titleLen < 50) {
    checks.push({ id: "title-length", label: "SEO title length", status: "ok", message: `${titleLen} chars - decent, could be a bit longer`, weight: 8 });
  } else {
    checks.push({ id: "title-length", label: "SEO title length", status: "good", message: `${titleLen} chars - perfect length`, weight: 8 });
  }

  const metaLen = meta.length;
  if (metaLen === 0) {
    checks.push({ id: "meta-length", label: "Meta description length", status: "empty", message: "Add a meta description", weight: 8 });
  } else if (metaLen < 70) {
    checks.push({ id: "meta-length", label: "Meta description length", status: "bad", message: `Only ${metaLen} chars - too short (aim for 120-155)`, weight: 8 });
  } else if (metaLen > 160) {
    checks.push({ id: "meta-length", label: "Meta description length", status: "ok", message: `${metaLen} chars - too long, may be truncated`, weight: 8 });
  } else if (metaLen < 120) {
    checks.push({ id: "meta-length", label: "Meta description length", status: "ok", message: `${metaLen} chars - decent, could be a bit longer`, weight: 8 });
  } else {
    checks.push({ id: "meta-length", label: "Meta description length", status: "good", message: `${metaLen} chars - perfect length`, weight: 8 });
  }

  if (words === 0) {
    checks.push({ id: "content-length", label: "Content length", status: "empty", message: "Add content to your post", weight: 8 });
  } else if (words < 300) {
    checks.push({ id: "content-length", label: "Content length", status: "bad", message: `${words} words - too short. Aim for 600+ words for SEO`, weight: 8 });
  } else if (words < 600) {
    checks.push({ id: "content-length", label: "Content length", status: "ok", message: `${words} words - decent. 600+ words is ideal for ranking`, weight: 8 });
  } else if (words < 1500) {
    checks.push({ id: "content-length", label: "Content length", status: "good", message: `${words} words - great length`, weight: 8 });
  } else {
    checks.push({ id: "content-length", label: "Content length", status: "good", message: `${words} words - excellent long-form content`, weight: 8 });
  }

  const h2Count = (input.content.match(/<h2[\s>]/gi) || []).length;
  const h3Count = (input.content.match(/<h3[\s>]/gi) || []).length;
  if (h2Count === 0 && words > 300) {
    checks.push({ id: "subheadings", label: "Subheadings", status: "bad", message: "No H2 subheadings - add them to structure your content", weight: 7 });
  } else if (h2Count >= 2) {
    checks.push({ id: "subheadings", label: "Subheadings", status: "good", message: `${h2Count} H2 and ${h3Count} H3 subheadings - well structured`, weight: 7 });
  } else if (h2Count === 1) {
    checks.push({ id: "subheadings", label: "Subheadings", status: "ok", message: "Only 1 H2 - consider adding more for structure", weight: 7 });
  } else {
    checks.push({ id: "subheadings", label: "Subheadings", status: "ok", message: "Short content may not need subheadings", weight: 7 });
  }

  if (kp && h2Count > 0) {
    const h2Matches = input.content.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
    const hasKpInH2 = h2Matches.some(h => containsKeyphrase(stripHtml(h), kp));
    checks.push({
      id: "keyphrase-in-subheading",
      label: "Keyphrase in subheadings",
      weight: 6,
      ...(hasKpInH2
        ? { status: "good" as CheckStatus, message: "Focus keyphrase appears in at least one H2" }
        : { status: "ok" as CheckStatus, message: "Consider adding the keyphrase to at least one H2" }),
    });
  } else {
    checks.push({ id: "keyphrase-in-subheading", label: "Keyphrase in subheadings", status: "empty", message: "Need keyphrase and H2 headings", weight: 6 });
  }

  checks.push({
    id: "cover-image",
    label: "Cover image",
    weight: 6,
    ...(input.coverImage
      ? { status: "good" as CheckStatus, message: "Cover image is set" }
      : { status: "bad" as CheckStatus, message: "Add a cover image for social sharing and visual appeal" }),
  });

  if (input.coverImage) {
    checks.push({
      id: "cover-image-alt",
      label: "Cover image alt text",
      weight: 7,
      ...(input.coverImageAlt && input.coverImageAlt.length > 5
        ? { status: "good" as CheckStatus, message: "Alt text is set for accessibility and SEO" }
        : { status: "bad" as CheckStatus, message: "Add descriptive alt text for the cover image" }),
    });
  } else {
    checks.push({ id: "cover-image-alt", label: "Cover image alt text", status: "empty", message: "Add cover image first", weight: 7 });
  }

  const imgTags = input.content.match(/<img[^>]*>/gi) || [];
  if (imgTags.length > 0) {
    const withAlt = imgTags.filter(img => /alt="[^"]+"/i.test(img)).length;
    const missing = imgTags.length - withAlt;
    if (missing === 0) {
      checks.push({ id: "content-images-alt", label: "Content images alt text", status: "good", message: `All ${imgTags.length} images have alt text`, weight: 5 });
    } else {
      checks.push({ id: "content-images-alt", label: "Content images alt text", status: "bad", message: `${missing} image(s) missing alt text`, weight: 5 });
    }
  } else {
    checks.push({ id: "content-images-alt", label: "Content images alt text", status: "empty", message: "No images in content", weight: 5 });
  }

  const links = input.content.match(/<a[^>]+href=[^>]+>/gi) || [];
  if (links.length === 0 && words > 300) {
    checks.push({ id: "links", label: "Outbound links", status: "ok", message: "Consider adding internal/external links to boost SEO", weight: 5 });
  } else if (links.length > 0) {
    checks.push({ id: "links", label: "Outbound links", status: "good", message: `${links.length} link(s) found`, weight: 5 });
  } else {
    checks.push({ id: "links", label: "Outbound links", status: "empty", message: "Short content may not need links", weight: 5 });
  }

  if (input.tags && input.tags.length > 0) {
    checks.push({ id: "tags", label: "Tags", status: "good", message: `${input.tags.length} tag(s) set`, weight: 4 });
  } else {
    checks.push({ id: "tags", label: "Tags", status: "ok", message: "Add tags to help categorize this post", weight: 4 });
  }

  let earnedPoints = 0;
  let maxPoints = 0;
  for (const c of checks) {
    if (c.status === "empty") continue;
    maxPoints += c.weight;
    if (c.status === "good") earnedPoints += c.weight;
    else if (c.status === "ok") earnedPoints += c.weight * 0.5;
  }
  const score = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;

  let overallStatus: CheckStatus;
  if (score >= 80) overallStatus = "good";
  else if (score >= 50) overallStatus = "ok";
  else if (score > 0) overallStatus = "bad";
  else overallStatus = "empty";

  return {
    score,
    status: overallStatus,
    goodCount: checks.filter(c => c.status === "good").length,
    okCount: checks.filter(c => c.status === "ok").length,
    badCount: checks.filter(c => c.status === "bad").length,
    emptyCount: checks.filter(c => c.status === "empty").length,
    checks,
  };
}
