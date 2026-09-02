/**
 * Formats product long descriptions into clean HTML.
 * - Keeps real HTML if already structured
 * - Turns plain text into paragraphs + Key Features list
 * - Strips legacy jammed Brand/Model/Colour dumps
 */
export function formatProductDescription(raw: string): string {
  if (!raw || !raw.trim()) return "";

  let text = raw.trim();

  // Already structured HTML
  if (/<(p|h[1-6]|ul|ol|table|div|section)\b/i.test(text)) {
    // Remove duplicate inline product-spec tables (UI shows live specs)
    text = text.replace(/<table[\s\S]*?class=["'][^"']*product-spec-table[^"']*["'][\s\S]*?<\/table>/gi, "");
    text = text.replace(/<table[\s\S]*?<\/table>/gi, (table) => {
      if (/Brand|Marque|SKU|Category|Catégorie|Material|Matière/i.test(table) && table.length < 4000) {
        return "";
      }
      return table;
    });
    return text.trim();
  }

  // Decode common entities that sometimes appear as text
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  // Strip leftover tags if someone saved stripped-broken html as text
  const looksLikeStrippedHtml =
    /Key Features|Caract/i.test(text) &&
    /Brand|Marque/i.test(text) &&
    !/</.test(text);

  let featuresHtml = "";
  let intro = text;
  let rest = "";

  const featuresRe =
    /(Key Features|Features|Caract[eé]ristiques principales|Caract[eé]ristiques)\s*:?\s*/i;
  const featuresMatch = text.match(featuresRe);

  if (featuresMatch && featuresMatch.index != null) {
    const start = featuresMatch.index;
    const afterHeading = start + featuresMatch[0].length;
    intro = text.slice(0, start).trim();

    const after = text.slice(afterHeading);
    const stopRe =
      /\b(Brand|Marque|Model|Mod[eè]le|Styling|Conseil|Order today|Commandez|Ships from|Exp[eé]di)/i;
    const stop = after.search(stopRe);
    const featureBody = (stop >= 0 ? after.slice(0, stop) : after).trim();
    rest = (stop >= 0 ? after.slice(stop) : "").trim();

    const items = splitFeatureItems(featureBody);
    if (items.length > 0) {
      const heading = featuresMatch[1];
      featuresHtml =
        `<h3>${escapeHtml(heading)}</h3><ul>` +
        items.map((it) => `<li>${escapeHtml(it)}</li>`).join("") +
        `</ul>`;
    } else {
      intro = text;
      rest = "";
    }
  }

  // Remove jammed legacy spec dump from rest/intro
  intro = stripLegacySpecDump(intro);
  rest = stripLegacySpecDump(rest);

  // Keep a sensible styling / CTA paragraph if present after dump
  if (!rest) {
    const styleMatch = text.match(
      /\b(Styling|Conseil de style|Pair with|Associez|Order today|Commandez aujourd)[\s\S]+$/i
    );
    if (styleMatch) {
      rest = styleMatch[0].trim();
      // avoid duplicating if already in intro
      if (intro.includes(rest.slice(0, 40))) {
        rest = "";
      }
    }
  }

  rest = stripLegacySpecDump(rest);

  const parts: string[] = [];
  for (const block of [intro, rest]) {
    if (!block) continue;
    const paras = block
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s+/g, " ").trim())
      .filter((p) => p.length > 0);
    for (const p of paras) {
      // Skip pure dump leftovers
      if (isLegacyDumpLine(p)) continue;
      parts.push(`<p>${escapeHtml(p)}</p>`);
    }
  }

  // If everything was one blob with no features, still paragraph it
  if (parts.length === 0 && !featuresHtml) {
    const cleaned = stripLegacySpecDump(text).replace(/\s+/g, " ").trim();
    if (cleaned) parts.push(`<p>${escapeHtml(cleaned)}</p>`);
  }

  // Structure: intro paragraph(s) then features (caller may inject specs between)
  return parts.join("") + featuresHtml;
}

/**
 * Split description HTML into before/after chunks so the live specs table
 * can sit between intro and the rest (features, styling, CTA).
 */
export function splitDescriptionForSpecs(html: string): { before: string; after: string } {
  if (!html || !html.trim()) return { before: "", after: "" };

  // Prefer split before Key Features heading
  const featureHeading = html.search(/<h3[^>]*>\s*(Key Features|Features|Caract)/i);
  if (featureHeading > 0) {
    return {
      before: html.slice(0, featureHeading).trim(),
      after: html.slice(featureHeading).trim(),
    };
  }

  // Split after first paragraph
  const m = html.match(/<\/p>/i);
  if (m && m.index != null) {
    const cut = m.index + m[0].length;
    const before = html.slice(0, cut).trim();
    const after = html.slice(cut).trim();
    if (before && after) return { before, after };
  }

  // All before specs (specs still show after full text)
  return { before: html, after: "" };
}

function splitFeatureItems(body: string): string[] {
  if (!body) return [];
  let t = body.trim();

  // Bullet-separated
  if (/[\u2022\u25cf]/.test(t) || /^\s*[-*]\s/m.test(t)) {
    return t
      .split(/[\u2022\u25cf]|\n\s*[-*]\s+/)
      .map((s) => s.replace(/^\s*[-*]\s*/, "").trim())
      .filter((s) => s.length > 2);
  }

  // "Item. Item. Item" 
  if ((t.match(/\.\s+/g) || []).length >= 2) {
    return t
      .split(/\.\s+/)
      .map((s) => s.replace(/\.$/, "").trim())
      .filter((s) => s.length > 3);
  }

  // Camel glue: "height and comfort Cushioned insole" -> split before capital runs
  const camelSplit = t
    .split(/(?<=[a-z0-9\)])\s+(?=[A-Z][a-z])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3 && !isLegacyDumpLine(s));

  if (camelSplit.length >= 2) return camelSplit;

  return t.length > 3 ? [t] : [];
}

function stripLegacySpecDump(s: string): string {
  if (!s) return "";
  let out = s;

  // Jammed: BrandX ModelY ColourZ ... Includes...
  out = out.replace(
    /\bBrand\s*[A-Za-z0-9][\s\S]{0,800}?(?:Includes?[^\n]*|Ships from[^\n]*)/gi,
    " "
  );
  out = out.replace(
    /\bMarque\s*[A-Za-z0-9][\s\S]{0,800}?(?:Inclus[^\n]*|Exp[eé]di[^\n]*)/gi,
    " "
  );

  // Label glue without spaces: BrandPrestige ModelCroc...
  out = out.replace(
    /\b(Brand|Model|Colour|Color|Material|Cushioning\/?Sole|Signature Detail|Closure|Style|Sizes|Ships from|Includes|Marque|Mod[eè]le|Couleur|Mati[eè]re|Amorti|D[eé]tail|Fermeture|Tailles|Exp[eé]di)[A-Z]/g,
    " "
  );

  return out.replace(/\s{2,}/g, " ").trim();
}

function isLegacyDumpLine(p: string): boolean {
  return (
    /^(Brand|Marque|Model|Mod[eè]le)\s*\S+/i.test(p) &&
    /(Material|Mati|SKU|Ships from|Exp[eé]di|Includes|Inclus)/i.test(p)
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
