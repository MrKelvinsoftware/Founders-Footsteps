import { pgTable, text, integer, decimal, timestamp, jsonb, uuid, varchar, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// USER & AUTHENTICATION
// ============================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  avatar: text("avatar"),
  role: varchar("role", { length: 20 }).default("customer"), // customer, admin, staff
  emailVerified: boolean("email_verified").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// OTP VERIFICATION (Email & Phone)
// ============================================

export const otpCodes = pgTable("otp_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  code: varchar("code", { length: 6 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // email_verification, phone_verification, password_reset, login
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// INBOX / NOTIFICATIONS (Universal Messaging)
// ============================================

export const inboxMessages = pgTable("inbox_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id), // null means broadcast to all
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 30 }).notNull(), // order_update, booking_update, promotion, announcement, system
  priority: varchar("priority", { length: 10 }).default("normal"), // low, normal, high, urgent
  relatedType: varchar("related_type", { length: 30 }), // order, booking, product, service
  relatedId: uuid("related_id"), // ID of related order/booking/etc
  trackingNumber: varchar("tracking_number", { length: 50 }), // For order/booking tracking reference
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Broadcast messages that go to all users
export const broadcastMessages = pgTable("broadcast_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 30 }).notNull(), // promotion, announcement, system, maintenance
  targetRole: varchar("target_role", { length: 20 }), // null = all users, or customer, staff
  serviceLine: varchar("service_line", { length: 50 }), // null = all, or specific service line slug
  priority: varchar("priority", { length: 10 }).default("normal"),
  scheduledAt: timestamp("scheduled_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Track which users have read broadcast messages
export const broadcastReads = pgTable("broadcast_reads", {
  id: uuid("id").primaryKey().defaultRandom(),
  broadcastId: uuid("broadcast_id").references(() => broadcastMessages.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  readAt: timestamp("read_at").defaultNow().notNull(),
});

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  street: varchar("street", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// SERVICE LINES & SERVICES (Unified Model)
// ============================================

export const serviceLines = pgTable("service_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 20 }).default("#3B82F6"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceLineId: uuid("service_line_id").references(() => serviceLines.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  kind: varchar("kind", { length: 20 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  duration: integer("duration"),
  images: jsonb("images").$type<string[]>(),
  features: jsonb("features").$type<string[]>(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// BOOKINGS (For all service lines)
// ============================================

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingNumber: varchar("booking_number", { length: 20 }).notNull().unique(), // e.g., FF-BK-240115-001
  userId: uuid("user_id").references(() => users.id).notNull(),
  serviceId: uuid("service_id").references(() => services.id).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  startTime: varchar("start_time", { length: 10 }),
  endTime: varchar("end_time", { length: 10 }),
  guestCount: integer("guest_count"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  notes: text("notes"),
  customerNotes: text("customer_notes"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookingPayments = pgTable("booking_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").references(() => bookings.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  status: varchar("status", { length: 20 }).default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionId: varchar("transaction_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// MARKETPLACE (Products & Orders)
// ============================================

export const productCategories = pgTable("product_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  parentId: uuid("parent_id"),
  description: text("description"),
  image: text("image"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").references(() => productCategories.id),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  comparePrice: decimal("compare_price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  stock: integer("stock").default(0),
  sku: varchar("sku", { length: 100 }),
  images: jsonb("images").$type<string[]>(),
  features: jsonb("features").$type<string[]>(),
  specifications: jsonb("specifications").$type<Record<string, unknown>>(),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: varchar("order_number", { length: 20 }).notNull().unique(), // e.g., FF-ORD-240115-001
  userId: uuid("user_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, confirmed, processing, shipped, delivered, cancelled
  trackingNumber: varchar("tracking_number", { length: 50 }), // External courier tracking number
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  shippingAddressId: uuid("shipping_address_id").references(() => addresses.id),
  billingAddressId: uuid("billing_address_id").references(() => addresses.id),
  notes: text("notes"),
  estimatedDelivery: timestamp("estimated_delivery"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderPayments = pgTable("order_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  status: varchar("status", { length: 20 }).default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionId: varchar("transaction_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// REVIEWS & RATINGS
// ============================================

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  serviceId: uuid("service_id").references(() => services.id),
  productId: uuid("product_id").references(() => products.id),
  bookingId: uuid("booking_id").references(() => bookings.id),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 255 }),
  comment: text("comment"),
  images: jsonb("images").$type<string[]>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// CONTENT & MARKETING
// ============================================

export const destinations = pgTable("destinations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  country: varchar("country", { length: 100 }).notNull(),
  description: text("description"),
  image: text("image"),
  gallery: jsonb("gallery").$type<string[]>(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  startingPrice: decimal("starting_price", { precision: 10, scale: 2 }),
  isPopular: boolean("is_popular").default(false),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  discountPercent: integer("discount_percent"),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  dealPrice: decimal("deal_price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  serviceId: uuid("service_id").references(() => services.id),
  productId: uuid("product_id").references(() => products.id),
  destinationId: uuid("destination_id").references(() => destinations.id),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  isHotDeal: boolean("is_hot_deal").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  name: varchar("name", { length: 100 }).notNull(),
  avatar: text("avatar"),
  role: varchar("role", { length: 100 }),
  company: varchar("company", { length: 100 }),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  serviceLineId: uuid("service_line_id").references(() => serviceLines.id),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// SUBMISSIONS (Unified bookings & orders inbox)
// ============================================

export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  total: decimal("total", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("GHS"),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 30 }),
  summary: text("summary"),
  payload: jsonb("payload").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// CMS CONTENT TABLE (Admin-managed pages)
// ============================================

export const cmsContent = pgTable("cms_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  content: jsonb("content").$type<Record<string, unknown>>(),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  bookings: many(bookings),
  orders: many(orders),
  reviews: many(reviews),
  otpCodes: many(otpCodes),
  inboxMessages: many(inboxMessages),
  broadcastReads: many(broadcastReads),
}));

export const otpCodesRelations = relations(otpCodes, ({ one }) => ({
  user: one(users, {
    fields: [otpCodes.userId],
    references: [users.id],
  }),
}));

export const inboxMessagesRelations = relations(inboxMessages, ({ one }) => ({
  user: one(users, {
    fields: [inboxMessages.userId],
    references: [users.id],
  }),
}));

export const broadcastMessagesRelations = relations(broadcastMessages, ({ many }) => ({
  reads: many(broadcastReads),
}));

export const broadcastReadsRelations = relations(broadcastReads, ({ one }) => ({
  broadcast: one(broadcastMessages, {
    fields: [broadcastReads.broadcastId],
    references: [broadcastMessages.id],
  }),
  user: one(users, {
    fields: [broadcastReads.userId],
    references: [users.id],
  }),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

export const serviceLinesRelations = relations(serviceLines, ({ many }) => ({
  services: many(services),
  testimonials: many(testimonials),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  serviceLine: one(serviceLines, {
    fields: [services.serviceLineId],
    references: [serviceLines.id],
  }),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  payments: many(bookingPayments),
  reviews: many(reviews),
}));

export const bookingPaymentsRelations = relations(bookingPayments, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingPayments.bookingId],
    references: [bookings.id],
  }),
}));

export const productCategoriesRelations = relations(productCategories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
  orderItems: many(orderItems),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  payments: many(orderPayments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const orderPaymentsRelations = relations(orderPayments, ({ one }) => ({
  order: one(orders, {
    fields: [orderPayments.orderId],
    references: [orders.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [reviews.serviceId],
    references: [services.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
}));
