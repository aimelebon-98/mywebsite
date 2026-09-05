import { pgTable, uuid, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  comparePrice: numeric("compare_price", { precision: 10, scale: 2 }),
  costPrice: numeric("cost_price", { precision: 10, scale: 2 }),
  supplierPrice: numeric("supplier_price", { precision: 10, scale: 2 }),
  supplierCurrency: text("supplier_currency").notNull().default("NGN"),
  description: text("description").notNull(),
  shortDescription: text("short_description").notNull().default(""),
  longDescription: text("long_description").notNull().default(""),
  category: text("category").notNull(),
  brand: text("brand").notNull().default(""),
  sku: text("sku").notNull().default(""),
  material: text("material").notNull().default(""),
  originCountry: text("origin_country").notNull().default("NG"),
  originCity: text("origin_city").notNull().default("Abuja"),
  sizes: text("sizes").notNull().default("[]"),
  colors: text("colors").notNull().default("[]"),
  images: text("images").notNull().default("[]"),
  imageUrl: text("image_url").notNull(),
  stock: integer("stock").notNull().default(0),
  active: boolean("active").notNull().default(true),
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  tags: text("tags").notNull().default("[]"),
  nameFr: text("name_fr"),
  slugFr: text("slug_fr"),
  descriptionFr: text("description_fr"),
  shortDescriptionFr: text("short_description_fr"),
  longDescriptionFr: text("long_description_fr"),
  tagsFr: text("tags_fr"),
  seoTitle: text("seo_title"),
  seoTitleFr: text("seo_title_fr"),
  metaDescription: text("meta_description"),
  metaDescriptionFr: text("meta_description_fr"),
  focusKeyphrase: text("focus_keyphrase"),
  focusKeyphraseFr: text("focus_keyphrase_fr"),
  ogImage: text("og_image"),
  canonicalUrl: text("canonical_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameFr: text("name_fr"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  imageProductId: uuid("image_product_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull(),
  customerName: text("customer_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
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
  storeName: text("store_name").notNull().default("New Deal Zone"),
  whatsappNumber: text("whatsapp_number").notNull().default("2348000000000"),
  currency: text("currency").notNull().default("NGN"),
  adminPassword: text("admin_password").notNull().default("admin123"),
  adminPath: text("admin_path"),
  accessCode: text("access_code"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adminSessions = pgTable("admin_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address").notNull().default(""),
  userAgent: text("user_agent").notNull().default(""),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const loginAttempts = pgTable("login_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  ipAddress: text("ip_address").notNull(),
  attempts: integer("attempts").notNull().default(1),
  lastAttempt: timestamp("last_attempt").defaultNow().notNull(),
  blockedUntil: timestamp("blocked_until"),
});

export const wishlist = pgTable("wishlist", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: uuid("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  avatar: text("avatar").notNull().default(""),
  addresses: text("addresses").notNull().default("[]"),
  rewardPoints: integer("reward_points").notNull().default(0),
  preferredCurrency: text("preferred_currency").notNull().default("USD"),
  preferredLocale: text("preferred_locale").notNull().default("en"),
  active: boolean("active").notNull().default(true),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customerSessions = pgTable("customer_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(),
  customerId: uuid("customer_id").notNull(),
  ipAddress: text("ip_address").notNull().default(""),
  userAgent: text("user_agent").notNull().default(""),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const authors = pgTable("authors", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  avatar: text("avatar").notNull().default(""),
  email: text("email").notNull().default(""),
  bio: text("bio").notNull().default(""),
  bioFr: text("bio_fr").notNull().default(""),
  role: text("role").notNull().default("Contributor"),
  roleFr: text("role_fr").notNull().default("Contributeur"),
  twitter: text("twitter").notNull().default(""),
  instagram: text("instagram").notNull().default(""),
  linkedin: text("linkedin").notNull().default(""),
  website: text("website").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(100),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  titleFr: text("title_fr"),
  slug: text("slug").notNull().unique(),
  slugFr: text("slug_fr"),
  excerpt: text("excerpt").notNull().default(""),
  excerptFr: text("excerpt_fr"),
  content: text("content").notNull().default(""),
  contentFr: text("content_fr"),
  coverImage: text("cover_image").notNull().default(""),
  category: text("category").notNull().default("sneaker-news"),
  categoryFr: text("category_fr"),
  tags: text("tags").notNull().default("[]"),
  tagsFr: text("tags_fr"),
  authorId: uuid("author_id"),
  readTime: integer("read_time").notNull().default(3),
  published: boolean("published").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  viewCount: integer("view_count").notNull().default(0),
  seoTitle: text("seo_title"),
  seoTitleFr: text("seo_title_fr"),
  metaDescription: text("meta_description"),
  metaDescriptionFr: text("meta_description_fr"),
  focusKeyphrase: text("focus_keyphrase"),
  focusKeyphraseFr: text("focus_keyphrase_fr"),
  canonicalUrl: text("canonical_url"),
  noIndex: boolean("no_index").notNull().default(false),
  publishedAt: timestamp("published_at"),
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
  locale: text("locale").notNull().default("en"),
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
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email").notNull().default(""),
  customerId: uuid("customer_id"),
  customerAddress: text("customer_address").notNull(),
  items: text("items").notNull().default("[]"),
  itemCount: integer("item_count").notNull().default(0),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  discountCode: text("discount_code").notNull().default(""),
  shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("$"),
  status: text("status").notNull().default("pending"),
  trackingNumber: text("tracking_number").notNull().default(""),
  trackingCarrier: text("tracking_carrier").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const vendors = pgTable("vendors", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  storeName: text("store_name").notNull(),
  storeSlug: text("store_slug").notNull().unique(),
  storeDescription: text("store_description").notNull().default(""),
  storeDescriptionFr: text("store_description_fr").notNull().default(""),
  logo: text("logo").notNull().default(""),
  banner: text("banner").notNull().default(""),
  trustTagline: text("trust_tagline").notNull().default(""),
  trustTaglineFr: text("trust_tagline_fr").notNull().default(""),
  contactName: text("contact_name").notNull().default(""),
  phone: text("phone").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  country: text("country").notNull().default("NG"),
  city: text("city").notNull().default("Abuja"),
  bankName: text("bank_name").notNull().default(""),
  bankAccount: text("bank_account").notNull().default(""),
  bankAccountName: text("bank_account_name").notNull().default(""),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull().default("10.00"),
  status: text("status").notNull().default("pending"),
  fulfillmentRate: numeric("fulfillment_rate", { precision: 5, scale: 2 }).notNull().default("100.00"),
  totalSales: integer("total_sales").notNull().default(0),
  totalEarnings: numeric("total_earnings", { precision: 10, scale: 2 }).notNull().default("0.00"),
  pendingPayout: numeric("pending_payout", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalPaidOut: numeric("total_paid_out", { precision: 10, scale: 2 }).notNull().default("0.00"),
  conciergeDebt: numeric("concierge_debt", { precision: 10, scale: 2 }).notNull().default("0.00"),
  conciergePaidTotal: numeric("concierge_paid_total", { precision: 10, scale: 2 }).notNull().default("0.00"),
  preferredCurrency: text("preferred_currency").notNull().default("USD"),
  mustChangePassword: boolean("must_change_password").notNull().default(true),
  adminNote: text("admin_note").notNull().default(""),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const vendorSessions = pgTable("vendor_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(),
  vendorId: uuid("vendor_id").notNull(),
  ipAddress: text("ip_address").notNull().default(""),
  userAgent: text("user_agent").notNull().default(""),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vendorApplications = pgTable("vendor_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  applicantName: text("applicant_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp").notNull().default(""),
  storeName: text("store_name").notNull(),
  storeDescription: text("store_description").notNull().default(""),
  productCategories: text("product_categories").notNull().default("[]"),
  country: text("country").notNull().default("NG"),
  city: text("city").notNull().default("Abuja"),
  instagramUrl: text("instagram_url").notNull().default(""),
  websiteUrl: text("website_url").notNull().default(""),
  additionalInfo: text("additional_info").notNull().default(""),
  status: text("status").notNull().default("pending"),
  adminNote: text("admin_note").notNull().default(""),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vendorProducts = pgTable("vendor_products", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull(),
  vendorId: uuid("vendor_id").notNull(),
  status: text("status").notNull().default("pending"),
  adminNote: text("admin_note").notNull().default(""),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
});

export const vendorOrders = pgTable("vendor_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull(),
  vendorId: uuid("vendor_id").notNull(),
  items: text("items").notNull().default("[]"),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull(),
  commissionAmount: numeric("commission_amount", { precision: 10, scale: 2 }).notNull(),
  vendorEarning: numeric("vendor_earning", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vendorPayouts = pgTable("vendor_payouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  vendorId: uuid("vendor_id").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  method: text("method").notNull().default("bank_transfer"),
  reference: text("reference").notNull().default(""),
  note: text("note").notNull().default(""),
  status: text("status").notNull().default("pending"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
  processedBy: text("processed_by").notNull().default(""),
});

export const conciergeRequests = pgTable("concierge_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  vendorId: uuid("vendor_id").notNull(),
  tier: text("tier").notNull(),
  fee: numeric("fee", { precision: 10, scale: 2 }).notNull(),
  productName: text("product_name").notNull(),
  productBrand: text("product_brand").notNull().default(""),
  productCategory: text("product_category").notNull().default("sneakers"),
  productPrice: numeric("product_price", { precision: 10, scale: 2 }).notNull(),
  productComparePrice: numeric("product_compare_price", { precision: 10, scale: 2 }),
  productMaterial: text("product_material").notNull().default(""),
  productSizes: text("product_sizes").notNull().default("[]"),
  productColors: text("product_colors").notNull().default("[]"),
  productStock: integer("product_stock").notNull().default(10),
  sourceImages: text("source_images").notNull().default("[]"),
  notes: text("notes").notNull().default(""),
  status: text("status").notNull().default("pending"),
  adminNote: text("admin_note").notNull().default(""),
  vendorResponse: text("vendor_response").notNull().default(""),
  createdProductId: uuid("created_product_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type Newsletter = typeof newsletter.$inferSelect;

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;

export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;
export type VendorApplication = typeof vendorApplications.$inferSelect;
export type NewVendorApplication = typeof vendorApplications.$inferInsert;
export type VendorProduct = typeof vendorProducts.$inferSelect;
export type VendorOrder = typeof vendorOrders.$inferSelect;
export type VendorPayout = typeof vendorPayouts.$inferSelect;
export type ConciergeRequest = typeof conciergeRequests.$inferSelect;