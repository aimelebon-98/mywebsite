import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateSlug } from "@/lib/slug";

// English -> French dictionary for common shoe/product terms
const DICT: Record<string, string> = {
  // Types
  "runner": "coureur",
  "runners": "coureurs",
  "running": "course",
  "sneaker": "basket",
  "sneakers": "baskets",
  "shoe": "chaussure",
  "shoes": "chaussures",
  "boot": "botte",
  "boots": "bottes",
  "sandal": "sandale",
  "sandals": "sandales",
  "slipper": "chausson",
  "slippers": "chaussons",
  "trainer": "basket",
  "trainers": "baskets",
  "walker": "marcheur",
  "trekker": "randonneur",
  "hiker": "randonneur",
  "climber": "grimpeur",

  // Adjectives
  "urban": "urbain",
  "classic": "classique",
  "vintage": "vintage",
  "modern": "moderne",
  "premium": "premium",
  "pro": "pro",
  "professional": "professionnel",
  "black": "noir",
  "white": "blanc",
  "red": "rouge",
  "blue": "bleu",
  "green": "vert",
  "leather": "cuir",
  "canvas": "toile",
  "knit": "tricote",
  "mesh": "mesh",
  "high": "haut",
  "low": "bas",
  "high-top": "montante",
  "low-top": "basse",
  "top": "haut",
  "edition": "edition",
  "series": "serie",
  "essential": "essentiel",
  "essentials": "essentiels",
  "core": "essentiel",
  "elite": "elite",
  "sport": "sport",
  "casual": "casual",
  "comfort": "confort",
  "light": "leger",
  "lightweight": "leger",
  "waterproof": "impermeable",
  "breathable": "respirant",
  "flex": "flex",
  "flexible": "flexible",
  "adventure": "aventure",
  "trail": "sentier",
  "street": "rue",
  "night": "nuit",
  "day": "jour",
  "star": "star",
  "storm": "tempete",
  "flash": "eclair",
  "thunder": "tonnerre",
  "shadow": "ombre",
  "velocity": "velocite",
  "speed": "vitesse",
  "rush": "rush",
  "boost": "boost",
  "power": "puissance",
  "royal": "royal",
  "gold": "or",
  "silver": "argent",
  "platform": "plateforme",
  "rise": "montante",
  "breeze": "brise",
  "wave": "vague",
  "ocean": "ocean",
  "cloud": "nuage",
  "metro": "metro",
  "city": "ville",
  "culture": "culture",
  "retro": "retro",
  "neon": "neon",
  "pulse": "pulse",
  "minimalist": "minimaliste",
  "streetflex": "streetflex",
};

function translateWord(word: string): string {
  const lower = word.toLowerCase();
  return DICT[lower] || word;
}

function translateName(name: string): string {
  // Preserve original case for words not in dictionary
  const words = name.split(/(\s+|[-])/); // keep separators
  return words.map(w => {
    if (/^\s+$/.test(w) || w === "-") return w;
    const translated = translateWord(w);
    if (translated === w.toLowerCase()) return w; // no translation, keep original
    // Preserve capitalization from original
    if (w[0] === w[0].toUpperCase()) {
      return translated.charAt(0).toUpperCase() + translated.slice(1);
    }
    return translated;
  }).join("");
}

export async function GET() {
  const results = {
    total: 0,
    translated: 0,
    skipped: 0,
    details: [] as Array<{ name: string; nameFr: string; slugFr: string; status: string }>,
    errors: [] as string[],
  };

  try {
    const all = await db.select().from(products);
    results.total = all.length;

    for (const p of all) {
      // Skip if already has FR translation
      if (p.nameFr && p.slugFr) {
        results.skipped++;
        continue;
      }

      const nameFr = p.nameFr || translateName(p.name);
      const slugFr = p.slugFr || generateSlug(nameFr);

      // Skip if translation didn't change anything AND no slugFr
      if (nameFr === p.name && !p.slugFr) {
        // Still set slugFr from English name (better than nothing)
        // Actually skip fully - no point creating identical duplicate
        results.skipped++;
        results.details.push({ name: p.name, nameFr: "(no change)", slugFr: "(skipped)", status: "no translation available" });
        continue;
      }

      try {
        await db.update(products).set({
          nameFr,
          slugFr,
        }).where(eq(products.id, p.id));
        results.translated++;
        results.details.push({ name: p.name, nameFr, slugFr, status: "translated" });
      } catch (err) {
        // Slug conflict - append short ID
        try {
          const uniqueSlug = `${slugFr}-${p.id.slice(0, 6)}`;
          await db.update(products).set({ nameFr, slugFr: uniqueSlug }).where(eq(products.id, p.id));
          results.translated++;
          results.details.push({ name: p.name, nameFr, slugFr: uniqueSlug, status: "translated (id suffix)" });
        } catch (err2) {
          results.errors.push(`${p.name}: ${String(err2)}`);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Auto-translated ${results.translated} of ${results.total} products (${results.skipped} skipped)`,
      ...results,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), ...results }, { status: 500 });
  }
}
