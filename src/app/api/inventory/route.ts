import { NextRequest, NextResponse } from "next/server";
import { 
  checkProductStock, 
  checkServiceSlots,
  processOrderStock,
  processBookingSlot,
  cancelOrderAndRestoreStock,
  cancelBookingAndRestoreSlot
} from "@/lib/inventory";

// Check stock/slots availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "product" or "service"
    const id = searchParams.get("id");
    const quantity = parseInt(searchParams.get("quantity") || "1");

    if (!type || !id) {
      return NextResponse.json(
        { error: "Type and ID are required" },
        { status: 400 }
      );
    }

    if (type === "product") {
      const result = await checkProductStock(id, quantity);
      return NextResponse.json(result);
    } else if (type === "service") {
      const result = await checkServiceSlots(id, quantity);
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: "Invalid type. Use 'product' or 'service'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Check inventory error:", error);
    return NextResponse.json(
      { error: "Failed to check inventory" },
      { status: 500 }
    );
  }
}

// Process orders/bookings or handle cancellations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, orderId, bookingId, reason } = body;

    switch (action) {
      case "confirm_order":
        if (!orderId) {
          return NextResponse.json(
            { error: "Order ID is required" },
            { status: 400 }
          );
        }
        const orderResult = await processOrderStock(orderId);
        return NextResponse.json(orderResult);

      case "confirm_booking":
        if (!bookingId) {
          return NextResponse.json(
            { error: "Booking ID is required" },
            { status: 400 }
          );
        }
        const bookingResult = await processBookingSlot(bookingId);
        return NextResponse.json(bookingResult);

      case "cancel_order":
        if (!orderId) {
          return NextResponse.json(
            { error: "Order ID is required" },
            { status: 400 }
          );
        }
        const cancelOrderResult = await cancelOrderAndRestoreStock(orderId, reason);
        return NextResponse.json(cancelOrderResult);

      case "cancel_booking":
        if (!bookingId) {
          return NextResponse.json(
            { error: "Booking ID is required" },
            { status: 400 }
          );
        }
        const cancelBookingResult = await cancelBookingAndRestoreSlot(bookingId, reason);
        return NextResponse.json(cancelBookingResult);

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: confirm_order, confirm_booking, cancel_order, cancel_booking" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Inventory action error:", error);
    return NextResponse.json(
      { error: "Failed to process inventory action" },
      { status: 500 }
    );
  }
}
