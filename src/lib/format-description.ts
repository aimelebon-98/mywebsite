/**
 * Formats and splits product long descriptions for the product page.
 * Handles Tiptap HTML, stripped plain text, bullet lists, and flattened spec strings.
 */

export function formatProductDescription(content: string | null | undefined): string {
  if (!content || typeof content !== "string") return "";

  let html = content.trim();
  if (!html) return "";

  // Check if text contains flattened spec string (e.g. BrandPrestigeModelPebble...)
  if (/Brand[A-Z0-9].*Model[A-Z0-9]/i.test(html) && !html.includes("<table")) {
    html = formatFlattenedSpecs(html);
  }

  // Already proper block HTML — normalize headers
  const hasBlocks = /<\/(p|ul|ol|li|h[1-4]|div|table|blockquote)>/i.test(html);
  if (hasBlocks) {
    html = html.replace(
      /<(?:p|div)[^>]*>\s*(?:<strong>|<b>)?\s*(Key Features|Features|Styling|Specifications|Care Instructions|Caract[e\u00e9]ristiques(?: cl[e\u00e9]s)?|Conseils de style|Sp[e\u00e9]cifications)\s*(?:<\/strong>|<\/b>)?\s*:?\s*<\/(?:p|div)>/gi,
      "<h3>$1</h3>"
    );
    return html;
  }

  // Plain / flattened text parsing
  let text = html;

  const headers = [
    "Key Features",
    "Features",
    "Styling",
    "Overview",
    "Details",
    "Specifications",
    "Description",
    "Care Instructions",
    "Delivery & Returns",
    "Caract\u00e9ristiques cl\u00e9s",
    "Caract\u00e9ristiques",
    "Conseils de style",
    "Aper\u00e7u",
    "D\u00e9tails",
    "Sp\u00e9cifications",
  ];

  for (const kw of headers) {
    const re = new RegExp("(?:^|\\s)(" + escapeRegExp(kw) + ")(?=\\s|:|[A-Z\u00c0-\u024f]|$)", "gi");
    text = text.replace(re, "\n\n<h3>$1</h3>\n");
  }

  const rawLines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  let out = "";
  let inList = false;

  for (const line of rawLines) {
    if (/^<h[1-6][\s>]/i.test(line)) {
      if (inList) {
        out += "</ul>";
        inList = false;
      }
      out += line;
      continue;
    }

    if (/^[-•*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      if (!inList) {
        out += "<ul>";
        inList = true;
      }
      out += "<li>" + line.replace(/^([-•*]|\d+\.)\s+/, "") + "</li>";
      continue;
    }

    if (inList) {
      out += "</ul>";
      inList = false;
    }
    out += "<p>" + line + "</p>";
  }

  if (inList) out += "</ul>";
  return out;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatFlattenedSpecs(text: string): string {
  const keys = [
    "Brand", "Model", "Colour", "Color", "Material", "Cushioning/Sole", "Cushioning",
    "Signature Detail", "Closure", "Style", "Sizes", "Ships from", "Includes",
    "Marque", "Mod\u00e8le", "Couleur", "Mati\u00e8re", "Amorti", "D\u00e9tail Signature", "Fermeture", "Tailles"
  ];
  const pattern = new RegExp("(" + keys.map((k) => escapeRegExp(k)).join("|") + ")", "g");
  const matches = [...text.matchAll(pattern)];

  if (matches.length >= 3) {
    const firstIndex = matches[0].index!;
    const mainDesc = text.substring(0, firstIndex).trim();
    let rowsHtml = "";

    for (let i = 0; i < matches.length; i++) {
      const key = matches[i][0];
      const start = matches[i].index! + key.length;
      const end = i < matches.length - 1 ? matches[i + 1].index! : text.length;
      const val = text.substring(start, end).trim();
      if (val) {
        rowsHtml += `<tr><th>${key}</th><td>${val}</td></tr>`;
      }
    }

    const tableHtml = `<table class="product-spec-table"><tbody>${rowsHtml}</tbody></table>`;
    return (mainDesc ? `<p>${mainDesc}</p>` : "") + tableHtml;
  }
  return text;
}

export interface SplitDescriptionResult {
  before: string;
  after: string;
  specsTableHtml: string;
  specsHtml: string;
  specs: string;
  mainDesc: string;
  main: string;
}

export function splitDescriptionForSpecs(content: string | null | undefined): SplitDescriptionResult {
  const empty: SplitDescriptionResult = {
    before: "",
    after: "",
    specsTableHtml: "",
    specsHtml: "",
    specs: "",
    mainDesc: "",
    main: "",
  };

  if (!content || typeof content !== "string") return empty;

  const formatted = formatProductDescription(content);
  if (!formatted) return empty;

  const tableRe = /<table[\s\S]*?<\/table>/i;
  const tableMatch = formatted.match(tableRe);

  if (tableMatch && tableMatch.index !== undefined) {
    const before = formatted.slice(0, tableMatch.index).trim();
    const specsTableHtml = tableMatch[0];
    const after = formatted.slice(tableMatch.index + tableMatch[0].length).trim();
    const mainDesc = (before + " " + after).trim();
    return {
      before,
      after,
      specsTableHtml,
      specsHtml: specsTableHtml,
      specs: specsTableHtml,
      mainDesc,
      main: mainDesc,
    };
  }

  return {
    before: formatted,
    after: "",
    specsTableHtml: "",
    specsHtml: "",
    specs: "",
    mainDesc: formatted,
    main: formatted,
  };
}