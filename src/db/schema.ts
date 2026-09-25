import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  jsonb,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    phone: text("phone"),
    role: text("role").notNull().default("customer"), // "customer" | "staff" | "admin"
    emailVerified: boolean("email_verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("users_email_idx").on(t.email),
    index("users_role_idx").on(t.role),
  ]
);

// ─────────────────────────────────────────────
// PENDING REGISTRATIONS  (staged sign-up before OTP verify)
// ─────────────────────────────────────────────
export const pendingRegistrations = pgTable(
  "pending_registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phone: text("phone"),
    otpCode: text("otp_code").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("pending_reg_email_idx").on(t.email)]
);

// ─────────────────────────────────────────────
// OTP CODES
// ─────────────────────────────────────────────
export const otpCodes = pgTable(
  "otp_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    code: text("code").notNull(),
    type: text("type").notNull(), // "email_verification" | "password_reset" | "login"
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("otp_email_type_idx").on(t.email, t.type),
    index("otp_user_idx").on(t.userId),
  ]
);

// ─────────────────────────────────────────────
// PRODUCTS  (marketplace inventory)
// ─────────────────────────────────────────────
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0"),
    stock: integer("stock").notNull().default(0),
    category: text("category"),
    imageUrl: text("image_url"),
    isActive: boolean("is_active").notNull().default(true),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("products_category_idx").on(t.category),
    index("products_active_idx").on(t.isActive),
  ]
);

// ─────────────────────────────────────────────
// SERVICES  (bookable service offerings)
// ─────────────────────────────────────────────
export const services = pgTable(
  "services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0"),
    maxSlots: integer("max_slots").notNull().default(10),
    availableSlots: integer("available_slots").notNull().default(10),
    category: text("category"),
    imageUrl: text("image_url"),
    isActive: boolean("is_active").notNull().default(true),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("services_category_idx").on(t.category)]
);

// ─────────────────────────────────────────────
// SUBMISSIONS  (bookings & orders from public forms)
// ─────────────────────────────────────────────
export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").notNull(), // "marketplace" | "construction" | "event" | etc.
    status: text("status").notNull().default("pending"), // "pending" | "reviewed" | "accepted" | "completed" | "rejected"
    total: numeric("total", { precision: 12, scale: 2 }),
    currency: text("currency").notNull().default("GHS"),
    // customer snapshot (denormalised so we keep it even if user deletes their account)
    firstName: text("first_name"),
    lastName: text("last_name"),
    email: text("email"),
    phone: text("phone"),
    summary: text("summary"),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("submissions_type_idx").on(t.type),
    index("submissions_status_idx").on(t.status),
    index("submissions_email_idx").on(t.email),
    index("submissions_created_idx").on(t.createdAt),
  ]
);

// ─────────────────────────────────────────────
// ORDERS  (processed marketplace orders)
// ─────────────────────────────────────────────
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull().unique(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    status: text("status").notNull().default("pending"), // "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("GHS"),
    submissionId: uuid("submission_id").references(() => submissions.id, { onDelete: "set null" }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("orders_user_idx").on(t.userId),
    index("orders_status_idx").on(t.status),
    uniqueIndex("orders_number_idx").on(t.orderNumber),
  ]
);

// ─────────────────────────────────────────────
// ORDER ITEMS
// ─────────────────────────────────────────────
export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)]
);

// ─────────────────────────────────────────────
// BOOKINGS  (processed service bookings)
// ─────────────────────────────────────────────
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingNumber: text("booking_number").notNull().unique(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
    status: text("status").notNull().default("pending"), // "pending" | "confirmed" | "scheduled" | "in_progress" | "completed" | "cancelled"
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    submissionId: uuid("submission_id").references(() => submissions.id, { onDelete: "set null" }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("bookings_user_idx").on(t.userId),
    index("bookings_service_idx").on(t.serviceId),
    index("bookings_status_idx").on(t.status),
    uniqueIndex("bookings_number_idx").on(t.bookingNumber),
  ]
);

// ─────────────────────────────────────────────
// RECEIPTS  (POS receipts / estimates / tickets)
// ─────────────────────────────────────────────
export const receipts = pgTable(
  "receipts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    receiptNumber: text("receipt_number").notNull().unique(),
    type: text("type").notNull().default("service_receipt"), // "construction_estimate" | "trip_ticket" | "event_receipt" | "service_receipt" | "order_receipt"
    status: text("status").notNull().default("draft"), // "draft" | "sent" | "paid" | "void"
    customerName: text("customer_name"),
    customerEmail: text("customer_email"),
    customerPhone: text("customer_phone"),
    customerAddress: text("customer_address"),
    title: text("title"),
    description: text("description"),
    notes: text("notes"),
    terms: text("terms"),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    items: jsonb("items"), // Array of { name, qty, unitPrice, total }
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }),
    laborCost: numeric("labor_cost", { precision: 12, scale: 2 }),
    tax: numeric("tax", { precision: 12, scale: 2 }),
    discount: numeric("discount", { precision: 12, scale: 2 }),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    amountPaid: numeric("amount_paid", { precision: 12, scale: 2 }),
    currency: text("currency").notNull().default("GHS"),
    tripDetails: jsonb("trip_details"),
    metadata: jsonb("metadata"),
    submissionId: uuid("submission_id").references(() => submissions.id, { onDelete: "set null" }),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("receipts_status_idx").on(t.status),
    index("receipts_customer_email_idx").on(t.customerEmail),
    uniqueIndex("receipts_number_idx").on(t.receiptNumber),
  ]
);

// ─────────────────────────────────────────────
// CMS CONTENT  (branding, settings, pages)
// ─────────────────────────────────────────────
export const cmsContent = pgTable(
  "cms_content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title"),
    content: jsonb("content"),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("cms_slug_idx").on(t.slug)]
);

// ─────────────────────────────────────────────
// INBOX MESSAGES  (direct user notifications)
// ─────────────────────────────────────────────
export const inboxMessages = pgTable(
  "inbox_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: text("type").notNull().default("system"), // "order_update" | "booking_update" | "promotion" | "announcement" | "system" | "welcome" | etc.
    priority: text("priority").notNull().default("normal"), // "low" | "normal" | "high" | "urgent"
    relatedType: text("related_type"), // "order" | "booking" | "product" | "service"
    relatedId: uuid("related_id"),
    trackingNumber: text("tracking_number"),
    metadata: jsonb("metadata"),
    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("inbox_user_idx").on(t.userId),
    index("inbox_read_idx").on(t.userId, t.isRead),
  ]
);

// ─────────────────────────────────────────────
// BROADCAST MESSAGES  (admin → all/role)
// ─────────────────────────────────────────────
export const broadcastMessages = pgTable(
  "broadcast_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: text("type").notNull().default("announcement"), // "promotion" | "announcement" | "system" | "maintenance"
    priority: text("priority").notNull().default("normal"),
    targetRole: text("target_role"), // null = all; "customer" | "staff"
    serviceLine: text("service_line"),
    isActive: boolean("is_active").notNull().default(true),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("broadcast_active_idx").on(t.isActive)]
);

// ─────────────────────────────────────────────
// BROADCAST READS  (track per-user read state)
// ─────────────────────────────────────────────
export const broadcastReads = pgTable(
  "broadcast_reads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    broadcastId: uuid("broadcast_id")
      .notNull()
      .references(() => broadcastMessages.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("broadcast_reads_user_idx").on(t.userId),
    uniqueIndex("broadcast_reads_unique_idx").on(t.broadcastId, t.userId),
  ]
);
