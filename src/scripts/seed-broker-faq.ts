import fs from "fs";
import path from "path";

for (const envFile of [".env.local", ".env"]) {
  const fullPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(fullPath)) {
    const raw = fs.readFileSync(fullPath, "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

async function main() {
  const { db } = await import("../db");
  const { productFaqs } = await import("../db/schema");
  const { eq } = await import("drizzle-orm");

  const qEn = "What if I already have a broker account?";
  const qFr = "Que faire si j'ai d\u00e9j\u00e0 un compte chez le courtier ?";

  const aEn = "No problem at all! You can keep your existing account and still purchase or use the bot normally. However, if you want to take advantage of our 1-Month FREE offer, you need to register a NEW broker account using our partner link. To avoid double-account penalties from the broker, make sure to delete or close your old account first before creating the new one.";
  const aFr = "Aucun probl\u00e8me ! Vous pouvez garder votre compte actuel et acheter/utiliser le robot normalement. Cependant, si vous souhaitez profiter de l'offre de 1 mois GRATUIT, vous devez cr\u00e9er un NOUVEAU compte via notre lien partenaire. Pensez a supprimer votre ancien compte courtier au pr\u00e9alable pour \u00e9viter tout blocage pour compte double.";

  const [existing] = await db
    .select()
    .from(productFaqs)
    .where(eq(productFaqs.question, qEn))
    .limit(1);

  if (!existing) {
    await db.insert(productFaqs).values({
      question: qEn,
      questionFr: qFr,
      answer: aEn,
      answerFr: aFr,
      active: true,
      sortOrder: 1,
    });
    console.log("Successfully seeded new Broker FAQ item!");
  } else {
    console.log("Broker FAQ item already exists.");
  }
}

main().catch(console.error);