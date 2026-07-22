import { pgTable, text, numeric, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().default(""),
  description: text("description").notNull().default(""),
  shortDescription: text("short_description").notNull().default(""),
  longDescription: text("long_description").notNull().default(""),
  // French translations (nullable - product only shows in French when nameFr is filled)
  nameFr: text("name_fr"),
  descriptionFr: text("description_fr"),
  shortDescriptionFr: text("short_description_fr"),
  longDescriptionFr: text("long_description_fr"),
  tagsFr: text("tags_fr"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  comparePrice: numeric("compare_price", { precision: 10, scale: 2 }),
  category: text("category").notNull().default("sneakers"),
  brand: text("brand").notNull().default(""),
  sizes: text("sizes").notNull().default("[]"),
  colors: text("colors").notNull().default("[]"),
  imageUrl: text("image_url").notNull().default(""),
  images: text("images").notNull().default("[]"),
  stock: integer("stock").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  tags: text("tags").notNull().default("[]"),
  material: text("material").notNull().default(""),
  weight: text("weight").notNull().default(""),
  sku: text("sku").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// New: dynamic categories table
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameFr: text("name_fr"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull(),
  customerName: text("customer_name").notNull(),
  rating: integer("rating").notNull().default(5),
  comment: text("comment").notNull().default(""),
  avatar: text("avatar").notNull().default(""),
  verified: boolean("verified").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsletter = pgTable("newsletter", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  storeName: text("store_name").notNull().default("SoleVault"),
  whatsappNumber: text("whatsapp_number").notNull().default(""),
  currency: text("currency").notNull().default("$"),
  adminPassword: text("admin_password").notNull().default("admin123"),
  adminAccessCode: text("admin_access_code").notNull().default(""),
  adminPath: text("admin_path").notNull().default("admin"),
  sessionSecret: text("session_secret").notNull().default(""),
  maxLoginAttempts: integer("max_login_attempts").notNull().default(5),
  lockoutMinutes: integer("lockout_minutes").notNull().default(15),
});

export const adminSessions = pgTable("admin_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address").notNull().default(""),
  userAgent: text("user_agent").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const loginAttempts = pgTable("login_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  ipAddress: text("ip_address").notNull(),
  success: boolean("success").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wishlist = pgTable("wishlist", {
  id: uuid("id").defaultRandom().primaryKey(),
  visitorId: text("visitor_id").notNull(),
  productId: uuid("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type Newsletter = typeof newsletter.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type AdminSession = typeof adminSessions.$inferSelect;
export type Wishlist = typeof wishlist.$inferSelect;
