import { NextRequest, NextResponse } from "next/server";
import { getUserInbox, getUnreadCount, markMessageAsRead } from "@/lib/inbox";
import { getSessionUser } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));
    const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0"));
    const countOnly = searchParams.get("count") === "true";

    if (countOnly) {
      const count = await getUnreadCount(sessionUser.id);
      return NextResponse.json({ unreadCount: count });
    }

    const [messages, unreadCount] = await Promise.all([
      getUserInbox(sessionUser.id, limit, offset),
      getUnreadCount(sessionUser.id),
    ]);

    return NextResponse.json({
      messages,
      unreadCount,
      pagination: { limit, offset, hasMore: messages.length === limit },
    });
  } catch (error) {
    console.error("[INBOX] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch inbox" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { messageId, isBroadcast } = body as {
      messageId?: string;
      isBroadcast?: boolean;
    };

    if (!messageId) {
      return NextResponse.json({ error: "messageId is required" }, { status: 400 });
    }

    await markMessageAsRead(messageId, sessionUser.id, isBroadcast ?? false);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[INBOX] PATCH error:", error);
    return NextResponse.json({ error: "Failed to mark message as read" }, { status: 500 });
  }
}
