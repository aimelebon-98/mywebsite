/**
 * Formats raw product descriptions (both rich HTML from Tiptap and plain text)
 * ensuring proper block headers, bullet lists, tables, and paragraph spacing.
 */
export function formatProductDescription(content: string | null | undefined): string {
  if (!content || typeof content !== "string") return "";

  const trimmed = content.trim();
  if (!trimmed) return "";

  // Check if content already contains HTML block elements
  const hasHtmlBlocks = /<\/(p|ul|ol|li|h1|h2|h3|h4|div|table|blockquote)>|<br\s*\/?>/i.test(trimmed);

  if (hasHtmlBlocks) {
    return trimmed;
  }

  // Handle plain text or flattened HTML strings
  let text = trimmed;

  const headerKeywords = [
    "Key Features",
    "Features",
    "Styling",
    "Overview",
    "Details",
    "Specifications",
    "Description",
    "Care Instructions",
    "Delivery & Returns",
    "Caractéristiques",
    "Caractéristiques clés",
    "Conseils de style",
    "Aperçu",
    "Détails",
    "Spécifications"
  ];

  headerKeywords.forEach((kw) => {
    const regex = new RegExp(`(?:^|\\s)(${kw})(?:\\s|:|$)`, "gi");
    text = text.replace(regex, (match, p1) => `\n\n<h3>${p1}</h3>\n`);
  });

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let resultHtml = "";
  let inList = false;

  for (const line of lines) {
    if (/^<h[1-6]>/i.test(line)) {
      if (inList) {
        resultHtml += "</ul>";
        inList = false;
      }
      resultHtml += line;
    } else if (/^[-•*]\s+/.test(line) || /^[0-9]+\.\s+/.test(line)) {
      if (!inList) {
        resultHtml += "<ul>";
        inList = true;
      }
      const cleanLine = line.replace(/^([-•*]|[0-9]+\.)\s+/, "");
      resultHtml += `<li>${cleanLine}</li>`;
    } else {
      if (inList) {
        resultHtml += "</ul>";
        inList = false;
      }
      resultHtml += `<p>${line}</p>`;
    }
  }

  if (inList) {
    resultHtml += "</ul>";
  }

  return resultHtml;
}