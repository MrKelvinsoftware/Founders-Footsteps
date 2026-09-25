import { db } from "@/db";
import { receipts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/session";

function generateReceiptNumber(type: string): string {
  const prefix =
    ({
      construction_estimate: "EST",
      trip_ticket: "TRP",
      event_receipt: "EVT",
      service_receipt: "SVC",
      order_receipt: "ORD",
    } as Record<string, string>)[type] ?? "RCP";

  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FF-${prefix}-${year}${month}-${rand}`;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allReceipts = await db
      .select({
        id: receipts.id,
        receiptNumber: receipts.receiptNumber,
        type: receipts.type,
        status: receipts.status,
        customerName: receipts.customerName,
        customerEmail: receipts.customerEmail,
        customerPhone: receipts.customerPhone,
        total: receipts.total,
        currency: receipts.currency,
        title: receipts.title,
        createdAt: receipts.createdAt,
        sentAt: receipts.sentAt,
        paidAt: receipts.paidAt,
      })
      .from(receipts)
      .orderBy(desc(receipts.createdAt));

    return Response.json({ ok: true, receipts: allReceipts });
  } catch (e) {
    console.error("[POS] GET error:", e);
    return Response.json({ ok: false, receipts: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      type,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      title,
      description,
      notes,
      terms,
      validUntil,
      items,
      subtotal,
      laborCost,
      tax,
      discount,
      total,
      currency,
      tripDetails,
      metadata,
      submissionId,
      bookingId,
      orderId,
      userId,
    } = body;

    if (!total) {
      return Response.json({ ok: false, error: "total is required" }, { status: 400 });
    }

    const receiptNumber = generateReceiptNumber(type ?? "service_receipt");

    const [newReceipt] = await db
      .insert(receipts)
      .values({
        receiptNumber,
        type: type ?? "service_receipt",
        status: "draft",
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        title,
        description,
        notes,
        terms,
        validUntil: validUntil ? new Date(validUntil) : null,
        items,
        subtotal: subtotal?.toString() ?? null,
        laborCost: laborCost?.toString() ?? null,
        tax: tax?.toString() ?? null,
        discount: discount?.toString() ?? null,
        total: total.toString(),
        currency: currency ?? "GHS",
        tripDetails,
        metadata,
        submissionId: submissionId ?? null,
        bookingId: bookingId ?? null,
        orderId: orderId ?? null,
        userId: userId ?? null,
      })
      .returning();

    return Response.json({ ok: true, receipt: newReceipt });
  } catch (e) {
    console.error("[POS] POST error:", e);
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
