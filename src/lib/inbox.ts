import { db } from "@/db";
import { inboxMessages, broadcastMessages, broadcastReads, users } from "@/db/schema";
import { eq, and, desc, isNull, or, lte, gte, sql } from "drizzle-orm";

export type MessageType = 
  | "order_update" 
  | "booking_update" 
  | "promotion" 
  | "announcement" 
  | "system"
  | "delivery_update"
  | "payment_update"
  | "welcome";

export type MessagePriority = "low" | "normal" | "high" | "urgent";

interface SendMessageOptions {
  userId: string;
  title: string;
  message: string;
  type: MessageType;
  priority?: MessagePriority;
  relatedType?: "order" | "booking" | "product" | "service";
  relatedId?: string;
  trackingNumber?: string;
  metadata?: Record<string, unknown>;
}

// Send a direct message to a specific user
export async function sendInboxMessage(options: SendMessageOptions) {
  const {
    userId,
    title,
    message,
    type,
    priority = "normal",
    relatedType,
    relatedId,
    trackingNumber,
    metadata,
  } = options;

  const [msg] = await db
    .insert(inboxMessages)
    .values({
      userId,
      title,
      message,
      type,
      priority,
      relatedType,
      relatedId,
      trackingNumber,
      metadata,
    })
    .returning();

  return msg;
}

// Send order update notification
export async function sendOrderUpdateNotification(
  userId: string,
  orderNumber: string,
  status: string,
  details?: string
) {
  const statusMessages: Record<string, { title: string; message: string }> = {
    confirmed: {
      title: "Order Confirmed! 🎉",
      message: `Your order ${orderNumber} has been confirmed and is being processed.`,
    },
    processing: {
      title: "Order Being Prepared 📦",
      message: `Good news! Your order ${orderNumber} is being prepared for shipment.`,
    },
    shipped: {
      title: "Order Shipped! 🚚",
      message: `Your order ${orderNumber} is on its way! ${details || "Track your package for delivery updates."}`,
    },
    out_for_delivery: {
      title: "Out for Delivery! 🏃",
      message: `Your order ${orderNumber} is out for delivery and will arrive soon!`,
    },
    delivered: {
      title: "Order Delivered! ✅",
      message: `Your order ${orderNumber} has been delivered. Thank you for shopping with us!`,
    },
    cancelled: {
      title: "Order Cancelled",
      message: `Your order ${orderNumber} has been cancelled. ${details || "If you have questions, please contact support."}`,
    },
  };

  const content = statusMessages[status] || {
    title: "Order Update",
    message: `Your order ${orderNumber} status has been updated to: ${status}`,
  };

  return sendInboxMessage({
    userId,
    title: content.title,
    message: content.message,
    type: "order_update",
    priority: status === "delivered" ? "normal" : "high",
    relatedType: "order",
    trackingNumber: orderNumber,
    metadata: { status, details },
  });
}

// Send booking update notification
export async function sendBookingUpdateNotification(
  userId: string,
  bookingNumber: string,
  status: string,
  serviceName: string,
  details?: string
) {
  const statusMessages: Record<string, { title: string; message: string }> = {
    confirmed: {
      title: "Booking Confirmed! ✅",
      message: `Your ${serviceName} booking (${bookingNumber}) has been confirmed!`,
    },
    scheduled: {
      title: "Booking Scheduled 📅",
      message: `Your ${serviceName} booking (${bookingNumber}) is scheduled. ${details || "We look forward to serving you!"}`,
    },
    in_progress: {
      title: "Service In Progress 🔄",
      message: `Your ${serviceName} booking (${bookingNumber}) is currently in progress.`,
    },
    completed: {
      title: "Service Completed! 🎉",
      message: `Your ${serviceName} booking (${bookingNumber}) has been completed. Thank you for choosing us!`,
    },
    cancelled: {
      title: "Booking Cancelled",
      message: `Your ${serviceName} booking (${bookingNumber}) has been cancelled. ${details || ""}`,
    },
  };

  const content = statusMessages[status] || {
    title: "Booking Update",
    message: `Your booking ${bookingNumber} for ${serviceName} has been updated.`,
  };

  return sendInboxMessage({
    userId,
    title: content.title,
    message: content.message,
    type: "booking_update",
    priority: "high",
    relatedType: "booking",
    trackingNumber: bookingNumber,
    metadata: { status, serviceName, details },
  });
}

// Send welcome message to new user
export async function sendWelcomeMessage(userId: string, firstName: string) {
  return sendInboxMessage({
    userId,
    title: "Welcome to Founders & Footsteps! 🎉",
    message: `Hi ${firstName}! Welcome to Founders & Footsteps - your one-stop platform for all your needs. From construction to car rentals, catering to travel, we've got you covered. Start exploring our services and enjoy exclusive member benefits!`,
    type: "welcome",
    priority: "normal",
  });
}

// Create a broadcast message (admin sends to all users)
interface BroadcastOptions {
  title: string;
  message: string;
  type: "promotion" | "announcement" | "system" | "maintenance";
  priority?: MessagePriority;
  targetRole?: "customer" | "staff" | null; // null = all users
  serviceLine?: string | null; // Filter by service line slug
  scheduledAt?: Date;
  expiresAt?: Date;
}

export async function createBroadcastMessage(options: BroadcastOptions) {
  const {
    title,
    message,
    type,
    priority = "normal",
    targetRole,
    serviceLine,
    scheduledAt,
    expiresAt,
  } = options;

  const [broadcast] = await db
    .insert(broadcastMessages)
    .values({
      title,
      message,
      type,
      priority,
      targetRole,
      serviceLine,
      scheduledAt,
      expiresAt,
      isActive: true,
    })
    .returning();

  return broadcast;
}

// Get user inbox (direct messages + relevant broadcasts)
export async function getUserInbox(userId: string, limit = 50, offset = 0) {
  // Get user info to filter broadcasts
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const userRole = user?.role || "customer";

  // Get direct messages
  const directMessages = await db
    .select()
    .from(inboxMessages)
    .where(eq(inboxMessages.userId, userId))
    .orderBy(desc(inboxMessages.createdAt))
    .limit(limit)
    .offset(offset);

  // Get relevant broadcasts (not read by user, active, not expired)
  const broadcasts = await db
    .select({
      id: broadcastMessages.id,
      title: broadcastMessages.title,
      message: broadcastMessages.message,
      type: broadcastMessages.type,
      priority: broadcastMessages.priority,
      createdAt: broadcastMessages.createdAt,
      isRead: sql<boolean>`EXISTS (
        SELECT 1 FROM broadcast_reads 
        WHERE broadcast_reads.broadcast_id = ${broadcastMessages.id} 
        AND broadcast_reads.user_id = ${userId}
      )`,
    })
    .from(broadcastMessages)
    .where(
      and(
        eq(broadcastMessages.isActive, true),
        or(
          isNull(broadcastMessages.targetRole),
          eq(broadcastMessages.targetRole, userRole)
        ),
        or(
          isNull(broadcastMessages.expiresAt),
          gte(broadcastMessages.expiresAt, new Date())
        ),
        or(
          isNull(broadcastMessages.scheduledAt),
          lte(broadcastMessages.scheduledAt, new Date())
        )
      )
    )
    .orderBy(desc(broadcastMessages.createdAt))
    .limit(20);

  // Combine and sort
  const allMessages = [
    ...directMessages.map((m) => ({
      ...m,
      isBroadcast: false,
      isRead: m.isRead,
    })),
    ...broadcasts.map((b) => ({
      id: b.id,
      userId: null,
      title: b.title,
      message: b.message,
      type: b.type as MessageType,
      priority: b.priority,
      relatedType: null,
      relatedId: null,
      trackingNumber: null,
      metadata: null,
      isRead: b.isRead,
      readAt: null,
      createdAt: b.createdAt,
      isBroadcast: true,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return allMessages;
}

// Mark message as read
export async function markMessageAsRead(messageId: string, userId: string, isBroadcast: boolean) {
  if (isBroadcast) {
    // Check if already read
    const [existing] = await db
      .select()
      .from(broadcastReads)
      .where(
        and(
          eq(broadcastReads.broadcastId, messageId),
          eq(broadcastReads.userId, userId)
        )
      )
      .limit(1);

    if (!existing) {
      await db.insert(broadcastReads).values({
        broadcastId: messageId,
        userId,
      });
    }
  } else {
    await db
      .update(inboxMessages)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(inboxMessages.id, messageId),
          eq(inboxMessages.userId, userId)
        )
      );
  }
}

// Get unread count
export async function getUnreadCount(userId: string): Promise<number> {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const userRole = user?.role || "customer";

  // Count unread direct messages
  const [directCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(inboxMessages)
    .where(
      and(
        eq(inboxMessages.userId, userId),
        eq(inboxMessages.isRead, false)
      )
    );

  // Count unread broadcasts
  const [broadcastCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(broadcastMessages)
    .where(
      and(
        eq(broadcastMessages.isActive, true),
        or(
          isNull(broadcastMessages.targetRole),
          eq(broadcastMessages.targetRole, userRole)
        ),
        or(
          isNull(broadcastMessages.expiresAt),
          gte(broadcastMessages.expiresAt, new Date())
        ),
        sql`NOT EXISTS (
          SELECT 1 FROM broadcast_reads 
          WHERE broadcast_reads.broadcast_id = ${broadcastMessages.id} 
          AND broadcast_reads.user_id = ${userId}
        )`
      )
    );

  return Number(directCount?.count || 0) + Number(broadcastCount?.count || 0);
}
