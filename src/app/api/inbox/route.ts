import { NextRequest, NextResponse } from "next/server";
import { getUserInbox, getUnreadCount, markMessageAsRead } from "@/lib/inbox";
import { cookies } from "next/headers";

// Get user ID from session (simplified - you may have your own auth)
async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("user_session");
  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value);
      return session.userId || null;
    } catch {
      return null;
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const countOnly = searchParams.get("count") === "true";

    if (countOnly) {
      const count = await getUnreadCount(userId);
      return NextResponse.json({ unreadCount: count });
    }

    const messages = await getUserInbox(userId, limit, offset);
    const unreadCount = await getUnreadCount(userId);

    return NextResponse.json({
      messages,
      unreadCount,
      pagination: {
        limit,
        offset,
        hasMore: messages.length === limit,
      },
    });
  } catch (error) {
    console.error("Get inbox error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inbox" },
      { status: 500 }
    );
  }
}

// Mark message as read
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { messageId, isBroadcast } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    await markMessageAsRead(messageId, userId, isBroadcast || false);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    return NextResponse.json(
      { error: "Failed to mark message as read" },
      { status: 500 }
    );
  }
}
