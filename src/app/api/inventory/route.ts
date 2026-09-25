import { NextRequest, NextResponse } from "next/server";
import {
  checkProductStock,
  checkServiceSlots,
  processOrderStock,
  processBookingSlot,
  cancelOrderAndRestoreStock,
  cancelBookingAndRestoreSlot,
} from "@/lib/inventory";

// Check stock/slot availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "product" or "service"
    const id = searchParams.get("id");
    const quantity = parseInt(searchParams.get("quantity") ?? "1");

    if (!type || !id) {
      return NextResponse.json({ error: "type and id are required" }, { status: 400 });
    }

    if (type === "product") {
      return NextResponse.json(await checkProductStock(id, quantity));
    }
    if (type === "service") {
      return NextResponse.json(await checkServiceSlots(id, quantity));
    }
    return NextResponse.json({ error: "Invalid type — use 'product' or 'service'" }, { status: 400 });
  } catch (error) {
    console.error("[INVENTORY] GET error:", error);
    return NextResponse.json({ error: "Failed to check inventory" }, { status: 500 });
  }
}

// Process orders/bookings or handle cancellations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, orderId, bookingId, reason } = body as {
      action?: string;
      orderId?: string;
      bookingId?: string;
      reason?: string;
    };

    if (action === "confirm_order") {
      if (!orderId) return NextResponse.json({ error: "orderId is required" }, { status: 400 });
      return NextResponse.json(await processOrderStock(orderId));
    }

    if (action === "confirm_booking") {
      if (!bookingId) return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
      return NextResponse.json(await processBookingSlot(bookingId));
    }

    if (action === "cancel_order") {
      if (!orderId) return NextResponse.json({ error: "orderId is required" }, { status: 400 });
      return NextResponse.json(await cancelOrderAndRestoreStock(orderId, reason));
    }

    if (action === "cancel_booking") {
      if (!bookingId) return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
      return NextResponse.json(await cancelBookingAndRestoreSlot(bookingId, reason));
    }

    return NextResponse.json(
      { error: "Invalid action — use: confirm_order, confirm_booking, cancel_order, cancel_booking" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[INVENTORY] POST error:", error);
    return NextResponse.json({ error: "Failed to process inventory action" }, { status: 500 });
  }
}
