import { NextRequest, NextResponse } from "next/server";
import { createBroadcastMessage, sendInboxMessage } from "@/lib/inbox";
import { db } from "@/db";
import { broadcastMessages } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const broadcasts = await db
      .select()
      .from(broadcastMessages)
      .orderBy(desc(broadcastMessages.createdAt))
      .limit(100);

    return NextResponse.json({ broadcasts });
  } catch (error) {
    console.error("[ADMIN INBOX] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch broadcasts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      type: messageType,
      title,
      message,
      notificationType,
      priority,
      targetRole,
      serviceLine,
      targetUserId,
      expiresAt,
    } = body as {
      type?: string;
      title?: string;
      message?: string;
      notificationType?: string;
      priority?: string;
      targetRole?: string;
      serviceLine?: string;
      targetUserId?: string;
      expiresAt?: string;
    };

    if (!title || !message || !notificationType) {
      return NextResponse.json(
        { error: "title, message, and notificationType are required" },
        { status: 400 }
      );
    }

    if (messageType === "broadcast") {
      const broadcast = await createBroadcastMessage({
        title,
        message,
        type: notificationType as "promotion" | "announcement" | "system" | "maintenance",
        priority: (priority as "low" | "normal" | "high" | "urgent") ?? "normal",
        targetRole: (targetRole as "customer" | "staff") ?? null,
        serviceLine: serviceLine ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      });
      return NextResponse.json({ success: true, message: "Broadcast sent", broadcast });
    }

    if (messageType === "direct" && targetUserId) {
      const msg = await sendInboxMessage({
        userId: targetUserId,
        title,
        message,
        type: notificationType as Parameters<typeof sendInboxMessage>[0]["type"],
        priority: (priority as "low" | "normal" | "high" | "urgent") ?? "normal",
      });
      return NextResponse.json({ success: true, message: "Message sent", inboxMessage: msg });
    }

    return NextResponse.json(
      { error: "Invalid messageType or missing targetUserId for direct message" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[ADMIN INBOX] POST error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
