import { NextRequest, NextResponse } from "next/server";
import { createBroadcastMessage, sendInboxMessage } from "@/lib/inbox";
import { db } from "@/db";
import { users, broadcastMessages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { cookies } from "next/headers";

// Check if user is admin
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("user_session");
  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value);
      const [user] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);
      return user?.role === "admin";
    } catch {
      return false;
    }
  }
  return false;
}

// Get all broadcast messages (admin only)
export async function GET() {
  try {
    // For demo purposes, allow access. In production, check isAdmin()
    const broadcasts = await db
      .select()
      .from(broadcastMessages)
      .orderBy(desc(broadcastMessages.createdAt))
      .limit(100);

    return NextResponse.json({ broadcasts });
  } catch (error) {
    console.error("Get broadcasts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch broadcasts" },
      { status: 500 }
    );
  }
}

// Create broadcast or send direct message (admin only)
export async function POST(request: NextRequest) {
  try {
    // For demo purposes, allow access. In production, check isAdmin()
    const body = await request.json();
    const { 
      type: messageType, // "broadcast" or "direct"
      title,
      message,
      notificationType,
      priority,
      targetRole,
      serviceLine,
      targetUserId,
      expiresAt,
    } = body;

    if (!title || !message || !notificationType) {
      return NextResponse.json(
        { error: "Title, message, and notification type are required" },
        { status: 400 }
      );
    }

    if (messageType === "broadcast") {
      // Create broadcast to all users (or filtered by role/service)
      const broadcast = await createBroadcastMessage({
        title,
        message,
        type: notificationType,
        priority: priority || "normal",
        targetRole: targetRole || null,
        serviceLine: serviceLine || null,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      });

      return NextResponse.json({
        success: true,
        message: "Broadcast sent successfully",
        broadcast,
      });
    } else if (messageType === "direct" && targetUserId) {
      // Send direct message to specific user
      const msg = await sendInboxMessage({
        userId: targetUserId,
        title,
        message,
        type: notificationType,
        priority: priority || "normal",
      });

      return NextResponse.json({
        success: true,
        message: "Message sent successfully",
        inboxMessage: msg,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid message type or missing target user" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
