import { db } from "../db";
import { products } from "../db/schema";
import { eq } from "drizzle-orm";
import { ensureSubscriptionTablesExist } from "../lib/ensure-subscription-tables";

async function main() {
  await ensureSubscriptionTablesExist();
  const slug = "ai-trading-bot-pro";
  const [existing] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  const subscriptionConfig = JSON.stringify({ monthlyPrice: 19.99, cryptoOnly: true, allowedCryptos: ["btc", "usdttrc20"] });

  if (!existing) {
    console.log("Seeding AI Trading Bot Pro subscription...");
    await db.insert(products).values({
      name: "AI Trading Bot Pro - Monthly License",
      slug,
      description: "High-performance automated trading bot subscription with 24/7 signals, automated execution, and multi-exchange connectivity.",
      price: "19.99",
      comparePrice: "29.99",
      category: "subscription",
      tags: JSON.stringify(["subscription", "bot", "crypto", "trading"]),
      images: JSON.stringify(["https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1000&q=80"]),
      active: true,
      stock: 9999,
      productType: "subscription",
      subscriptionConfig,
      costPrice: "0",
      supplierPrice: "0",
      supplierCurrency: "USD",
      originCountry: "TG",
      originCity: "Lome",
      shortDescription: "Automated crypto trading bot subscription.",
      longDescription: "<p>Full-featured trading bot with 24/7 market signals.</p>",
      brand: "NewDealZone",
      sku: "NDZ-SUB-BOT-01",
      material: "Digital",
      sizes: JSON.stringify(["digital"]),
      colors: JSON.stringify([{ name: "Digital", image: "" }]),
      imageUrl: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1000&q=80",
    });
    console.log("Seeded!");
  } else {
    await db.update(products).set({ productType: "subscription", subscriptionConfig, category: "subscription" }).where(eq(products.id, existing.id));
    console.log("Updated!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });