import { NextRequest, NextResponse } from "next/server";
import { sendReceipt } from "@/lib/receipt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      trackingNumber,
      type,
      customerName,
      customerEmail,
      customerPhone,
      customerWhatsApp,
      items,
      serviceName,
      serviceDate,
      serviceTime,
      subtotal,
      tax,
      shipping,
      total,
      currency,
      paymentMethod,
      estimatedDelivery,
      notes,
    } = body;

    if (!trackingNumber || !type || !customerName || !total) {
      return NextResponse.json(
        { error: "trackingNumber, type, customerName, and total are required" },
        { status: 400 }
      );
    }

    if (!customerEmail && !customerWhatsApp && !customerPhone) {
      return NextResponse.json(
        { error: "At least one contact method (email, phone, or WhatsApp) is required" },
        { status: 400 }
      );
    }

    const result = await sendReceipt({
      trackingNumber,
      type,
      customerName,
      customerEmail,
      customerPhone,
      customerWhatsApp,
      items,
      serviceName,
      serviceDate,
      serviceTime,
      subtotal,
      tax,
      shipping,
      total,
      currency,
      paymentMethod,
      estimatedDelivery,
      notes,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Receipt error:", error);
    return NextResponse.json(
      { error: "Failed to send receipt" },
      { status: 500 }
    );
  }
}
