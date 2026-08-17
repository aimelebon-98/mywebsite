import { pgTable, text, numeric, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().default(""),
  slugFr: text("slug_fr"),
  description: text("description").notNull().default(""),
  shortDescription: text("short_description").notNull().default(""),
  longDescription: text("long_description").notNull().default(""),
  nameFr: text("name_fr"),
  descriptionFr: text("description_fr"),
  shortDescriptionFr: text("short_description_fr"),
  longDescriptionFr: text("long_description_fr"),
  tagsFr: text("tags_fr"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  costPrice: numeric("cost_price", { precision: 12, scale: 2 }).notNull().default("0"),
  comparePrice: numeric("compare_price", { precision: 10, scale: 2 }),
  category: text("category").notNull().default("sneakers"),
  brand: text("brand").notNull().default(""),
  sizes: text("sizes").notNull().default("[]"),
  colors: text("colors").notNull().default("[]"),
  imageUrl: text("image_url").notNull().default(""),
  images: text("images").notNull().default("[]"),
  stock: integer("stock").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  metaEligible: boolean("meta_eligible").notNull().default(true),
  metaExclusionReason: text("meta_exclusion_reason").default(""),
  saleEndsAt: timestamp("sale_ends_at"),
  active: boolean("active").notNull().default(true),
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  tags: text("tags").notNull().default("[]"),
  material: text("material").notNull().default(""),
  weight: text("weight").notNull().default(""),
  sku: text("sku").notNull().default(""),
  seoTitle: text("seo_title"),
  metaDescription: text("meta_description"),
  focusKeyphrase: text("focus_keyphrase"),
  ogImage: text("og_image"),
  canonicalUrl: text("canonical_url"),
  noIndex: boolean("no_index").notNull().default(false),
  seoTitleFr: text("seo_title_fr"),
  metaDescriptionFr: text("meta_description_fr"),
  focusKeyphraseFr: text("focus_keyphrase_fr"),
  originCountry: text("origin_country").notNull().default("NG"),
  originCity: text("origin_city").notNull().default("Abuja"),
  supplierPrice: numeric("supplier_price", { precision: 12, scale: 2 }).notNull().default("0"),
  supplierCurrency: text("supplier_currency").notNull().default("NGN"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameFr: text("name_fr"),
  imageProductId: uuid("image_product_id"),
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
  commentFr: text("comment_fr"),
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
  storeName: text("store_name").notNull().default("NewDealZone"),
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
  visitorId: text("visitor_id"),
  customerId: uuid("customer_id"),
  productId: uuid("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// BLOG: Authors
// ============================================
export const authors = pgTable("authors", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  avatar: text("avatar").notNull().default(""),
  email: text("email").notNull().default(""),
  bio: text("bio").notNull().default(""),
  bioFr: text("bio_fr"),
  role: text("role").notNull().default(""),
  roleFr: text("role_fr"),
  twitter: text("twitter").notNull().default(""),
  instagram: text("instagram").notNull().default(""),
  linkedin: text("linkedin").notNull().default(""),
  website: text("website").notNull().default(""),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(100),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// BLOG: Posts
// ============================================
export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  slugFr: text("slug_fr"),
  excerpt: text("excerpt").notNull().default(""),
  content: text("content").notNull().default(""),
  coverImage: text("cover_image").notNull().default(""),
  coverImageAlt: text("cover_image_alt").default(""),
  coverImageAltFr: text("cover_image_alt_fr").default(""),
  // French
  titleFr: text("title_fr"),
  excerptFr: text("excerpt_fr"),
  contentFr: text("content_fr"),
  // Meta
  category: text("category").notNull().default("style-tips"),
  tags: text("tags").notNull().default("[]"),
  tagsFr: text("tags_fr"),
  authorId: uuid("author_id"),
  readTime: integer("read_time").notNull().default(5),
  // Status
  published: boolean("published").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  publishedAt: timestamp("published_at"),
  viewCount: integer("view_count").notNull().default(0),
  // SEO
  seoTitle: text("seo_title"),
  metaDescription: text("meta_description"),
  focusKeyphrase: text("focus_keyphrase"),
  ogImage: text("og_image"),
  canonicalUrl: text("canonical_url"),
  noIndex: boolean("no_index").notNull().default(false),
  seoTitleFr: text("seo_title_fr"),
  metaDescriptionFr: text("meta_description_fr"),
  focusKeyphraseFr: text("focus_keyphrase_fr"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blogComments = pgTable("blog_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id").notNull(),
  parentId: uuid("parent_id"),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull().default(""),
  content: text("content").notNull(),
  approved: boolean("approved").notNull().default(false),
  likes: integer("likes").notNull().default(0),
  ipAddress: text("ip_address").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BlogComment = typeof blogComments.$inferSelect;
export type NewBlogComment = typeof blogComments.$inferInsert;

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  // Customer info
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email").notNull().default(""),
  customerId: uuid("customer_id"),
  customerAddress: text("customer_address").notNull(),
  // Order data (JSON string of items)
  items: text("items").notNull().default("[]"),
  itemCount: integer("item_count").notNull().default(0),
  // Financials
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  discountCode: text("discount_code").notNull().default(""),
  shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("$"),
  // Status: pending, confirmed, shipped, delivered, cancelled
  status: text("status").notNull().default("pending"),
  // Fulfillment
  trackingNumber: text("tracking_number").notNull().default(""),
  trackingCarrier: text("tracking_carrier").notNull().default(""),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  // Notes
  adminNotes: text("admin_notes").notNull().default(""),
  customerNotes: text("customer_notes").notNull().default(""),
  // Metadata
  locale: text("locale").notNull().default("en"),
  ipAddress: text("ip_address").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type Newsletter = typeof newsletter.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type AdminSession = typeof adminSessions.$inferSelect;
export type Wishlist = typeof wishlist.$inferSelect;
export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;

export const productFaqs = pgTable("product_faqs", {
  id: uuid("id").defaultRandom().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  questionFr: text("question_fr"),
  answerFr: text("answer_fr"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ProductFaq = typeof productFaqs.$inferSelect;
export type NewProductFaq = typeof productFaqs.$inferInsert;

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: text("event_type").notNull(),
  path: text("path").notNull().default(""),
  productId: uuid("product_id"),
  productName: text("product_name"),
  postId: uuid("post_id"),
  searchQuery: text("search_query"),
  referrer: text("referrer").default(""),
  visitorId: text("visitor_id").notNull().default(""),
  country: text("country").default(""),
  userAgent: text("user_agent").default(""),
  metadata: text("metadata").default("{}"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;

export const bundles = pgTable("bundles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  nameFr: text("name_fr"),
  description: text("description").default(""),
  descriptionFr: text("description_fr"),
  minItems: integer("min_items").notNull().default(2),
  discountPercent: integer("discount_percent").notNull().default(10),
  category: text("category").default(""),
  active: boolean("active").notNull().default(true),
  priority: integer("priority").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Bundle = typeof bundles.$inferSelect;
export type NewBundle = typeof bundles.$inferInsert;

export const blogCategories = pgTable("blog_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  nameFr: text("name_fr"),
  color: text("color").notNull().default("bg-gray-100 text-gray-700"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BlogCategory = typeof blogCategories.$inferSelect;
export type NewBlogCategory = typeof blogCategories.$inferInsert;

// ============================================================
// CUSTOMER ACCOUNTS
// ============================================================
export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull().default(""),
  phone: text("phone").default(""),
  verified: boolean("verified").notNull().default(false),
  locale: text("locale").notNull().default("en"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const customerSessions = pgTable("customer_sessions", {
  token: text("token").primaryKey(),
  customerId: uuid("customer_id").notNull(),
  ipAddress: text("ip_address").default(""),
  userAgent: text("user_agent").default(""),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const customerAddresses = pgTable("customer_addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").notNull(),
  label: text("label").notNull().default("Home"),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  state: text("state").default(""),
  country: text("country").notNull().default("Nigeria"),
  postalCode: text("postal_code").default(""),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  token: text("token").primaryKey(),
  customerId: uuid("customer_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type CustomerAddress = typeof customerAddresses.$inferSelect;


// ============================================
// SUPPORT TICKETS
// ============================================
export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").notNull(),
  subject: text("subject").notNull(),
  category: text("category").notNull().default("general"),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("normal"),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  unreadByAdmin: boolean("unread_by_admin").notNull().default(true),
  unreadByCustomer: boolean("unread_by_customer").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const supportMessages = pgTable("support_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketId: uuid("ticket_id").notNull(),
  senderType: text("sender_type").notNull(),
  senderName: text("sender_name").notNull().default(""),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type SupportMessage = typeof supportMessages.$inferSelect;
// ============================================
// COUPONS & REWARDS
// ============================================
export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type").notNull().default("percent"),
  value: numeric("value", { precision: 10, scale: 2 }).notNull().default("0"),
  minOrder: numeric("min_order", { precision: 10, scale: 2 }).notNull().default("0"),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  active: boolean("active").notNull().default(true),
  description: text("description").notNull().default(""),
  descriptionFr: text("description_fr"),
  isWelcome: boolean("is_welcome").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerCoupons = pgTable("customer_coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").notNull(),
  couponId: uuid("coupon_id").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
export type CustomerCoupon = typeof customerCoupons.$inferSelect;
