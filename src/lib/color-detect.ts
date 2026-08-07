// Client-side dominant color detector for product images.
// No external deps - uses canvas pixel sampling.

interface NamedColor {
  name: string;
  r: number;
  g: number;
  b: number;
}

// Curated palette focused on shoe colors (~55 entries)
const PALETTE: NamedColor[] = [
  { name: "Black",       r: 20,  g: 20,  b: 20  },
  { name: "White",       r: 245, g: 245, b: 245 },
  { name: "Off-White",   r: 235, g: 232, b: 220 },
  { name: "Cream",       r: 240, g: 230, b: 210 },
  { name: "Ivory",       r: 250, g: 245, b: 230 },
  { name: "Beige",       r: 220, g: 200, b: 170 },
  { name: "Sand",        r: 210, g: 190, b: 155 },
  { name: "Tan",         r: 190, g: 155, b: 115 },
  { name: "Brown",       r: 120, g: 80,  b: 50  },
  { name: "Dark Brown",  r: 75,  g: 50,  b: 30  },
  { name: "Chocolate",   r: 90,  g: 55,  b: 35  },
  { name: "Grey",        r: 130, g: 130, b: 130 },
  { name: "Light Grey",  r: 190, g: 190, b: 190 },
  { name: "Dark Grey",   r: 75,  g: 75,  b: 75  },
  { name: "Charcoal",    r: 55,  g: 55,  b: 60  },
  { name: "Silver",      r: 200, g: 200, b: 205 },
  { name: "Navy",        r: 25,  g: 40,  b: 85  },
  { name: "Blue",        r: 45,  g: 90,  b: 190 },
  { name: "Royal Blue",  r: 30,  g: 60,  b: 200 },
  { name: "Sky Blue",    r: 120, g: 180, b: 230 },
  { name: "Teal",        r: 30,  g: 140, b: 150 },
  { name: "Green",       r: 50,  g: 140, b: 60  },
  { name: "Olive",       r: 110, g: 115, b: 60  },
  { name: "Forest Green",r: 40,  g: 90,  b: 50  },
  { name: "Mint",        r: 170, g: 220, b: 190 },
  { name: "Red",         r: 200, g: 40,  b: 45  },
  { name: "Dark Red",    r: 140, g: 25,  b: 30  },
  { name: "Maroon",      r: 110, g: 30,  b: 40  },
  { name: "Burgundy",    r: 95,  g: 30,  b: 45  },
  { name: "Pink",        r: 235, g: 150, b: 180 },
  { name: "Hot Pink",    r: 230, g: 60,  b: 130 },
  { name: "Rose",        r: 210, g: 130, b: 140 },
  { name: "Coral",       r: 235, g: 130, b: 110 },
  { name: "Orange",      r: 235, g: 130, b: 40  },
  { name: "Yellow",      r: 235, g: 210, b: 60  },
  { name: "Gold",        r: 210, g: 175, b: 55  },
  { name: "Mustard",     r: 200, g: 155, b: 40  },
  { name: "Purple",      r: 130, g: 60,  b: 165 },
  { name: "Violet",      r: 155, g: 100, b: 200 },
  { name: "Lavender",    r: 195, g: 175, b: 220 },
  { name: "Khaki",       r: 175, g: 160, b: 115 },
  { name: "Camo",        r: 100, g: 105, b: 75  },
  { name: "Nude",        r: 225, g: 200, b: 175 },
  { name: "Blush",       r: 230, g: 200, b: 195 },
  { name: "Rose Gold",   r: 210, g: 170, b: 165 },
  { name: "Bronze",      r: 175, g: 125, b: 75  },
  { name: "Copper",      r: 190, g: 115, b: 75  },
  { name: "Grey-Blue",   r: 110, g: 130, b: 155 },
  { name: "Ice",         r: 220, g: 235, b: 240 },
  { name: "Neon Green",  r: 130, g: 240, b: 50  },
];

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  // Weighted Euclidean distance (perceptual)
  const rMean = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt((2 + rMean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rMean) / 256) * db * db);
}

function closestPaletteName(r: number, g: number, b: number): string {
  let best = PALETTE[0];
  let bestD = Infinity;
  for (const p of PALETTE) {
    const d = colorDistance(r, g, b, p.r, p.g, p.b);
    if (d < bestD) { bestD = d; best = p; }
  }
  return best.name;
}

// Detect if a pixel is likely skin (rough filter to skip hand-holding photos)
function isSkinLike(r: number, g: number, b: number): boolean {
  return r > 95 && g > 40 && b > 20 &&
         r > g && r > b &&
         (r - g) > 15 && (r - b) > 15 &&
         r < 240 && Math.abs(r - g) < 60;
}

// Detect if pixel is likely background wood/floor (warm neutrals)
function isBackgroundBrownish(r: number, g: number, b: number): boolean {
  return Math.abs(r - g) < 25 && Math.abs(g - b) < 30 && r > 100 && r < 200 && r > b;
}

export async function detectColorsFromUrl(url: string, maxColors: number = 2): Promise<string> {
  return new Promise((resolve) => {
    if (!url) return resolve("");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 100;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve("");
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        // Sample pixels from center 60% area (skip edges/background)
        const start = Math.floor(size * 0.2);
        const end = Math.floor(size * 0.8);
        const counts = new Map<string, number>();

        for (let y = start; y < end; y += 3) {
          for (let x = start; x < end; x += 3) {
            const i = (y * size + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
            if (a < 200) continue;
            if (isSkinLike(r, g, b)) continue;
            if (isBackgroundBrownish(r, g, b)) continue;
            const name = closestPaletteName(r, g, b);
            counts.set(name, (counts.get(name) || 0) + 1);
          }
        }

        if (counts.size === 0) return resolve("");

        const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
        const total = sorted.reduce((s, [, c]) => s + c, 0);
        // Keep colors that represent at least 12% of sampled pixels
        const picked = sorted.filter(([, c]) => c / total >= 0.12).slice(0, maxColors).map(([n]) => n);
        if (picked.length === 0) picked.push(sorted[0][0]);
        resolve(picked.join("/"));
      } catch {
        resolve("");
      }
    };
    img.onerror = () => resolve("");
    img.src = url;
  });
}