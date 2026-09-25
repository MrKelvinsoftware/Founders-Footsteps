import { db } from "@/db";
import { receipts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const [receipt] = await db
      .select()
      .from(receipts)
      .where(eq(receipts.id, id))
      .limit(1);

    if (!receipt) {
      return Response.json({ ok: false, error: "Receipt not found" }, { status: 404 });
    }
    return Response.json({ ok: true, receipt });
  } catch (e) {
    console.error("[POS] GET /[id] error:", e);
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    const textFields = [
      "status", "customerName", "customerEmail", "customerPhone", "customerAddress",
      "title", "description", "notes", "terms", "currency",
    ];
    const numericFields = ["subtotal", "laborCost", "tax", "discount", "total", "amountPaid"];
    const jsonFields = ["items", "tripDetails", "metadata"];

    for (const f of textFields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }
    for (const f of numericFields) {
      if (body[f] !== undefined) updateData[f] = body[f]?.toString() ?? null;
    }
    for (const f of jsonFields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }
    if (body.validUntil) {
      updateData.validUntil = new Date(body.validUntil);
    }

    // Auto-timestamp on status transitions
    if (body.status === "sent" && !body.sentAt) updateData.sentAt = new Date();
    if (body.status === "paid" && !body.paidAt) updateData.paidAt = new Date();

    const [updated] = await db
      .update(receipts)
      .set(updateData)
      .where(eq(receipts.id, id))
      .returning();

    if (!updated) {
      return Response.json({ ok: false, error: "Receipt not found" }, { status: 404 });
    }

    return Response.json({ ok: true, receipt: updated });
  } catch (e) {
    console.error("[POS] PUT /[id] error:", e);
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(receipts)
      .where(eq(receipts.id, id))
      .returning({ id: receipts.id });

    if (!deleted) {
      return Response.json({ ok: false, error: "Receipt not found" }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error("[POS] DELETE /[id] error:", e);
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
