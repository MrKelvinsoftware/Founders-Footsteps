import { db } from "@/db";
import { submissions, products, services } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body as { status?: string };

    if (!status) {
      return Response.json({ ok: false, error: "status is required" }, { status: 400 });
    }

    const [current] = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, id))
      .limit(1);

    if (!current) {
      return Response.json({ ok: false, error: "Submission not found" }, { status: 404 });
    }

    // On cancellation, restore stock/slots
    if (status === "cancelled" && current.status !== "cancelled") {
      const payload = (current.payload as Record<string, unknown>) ?? {};

      if (current.type === "marketplace" && payload.items) {
        const items = payload.items as Array<{ productId: string; quantity: number }>;
        for (const item of items) {
          if (item.productId) {
            await db
              .update(products)
              .set({
                stock: sql`${products.stock} + ${item.quantity}`,
                updatedAt: new Date(),
              })
              .where(eq(products.id, item.productId));
          }
        }
      } else if (payload.serviceId) {
        await db
          .update(services)
          .set({
            availableSlots: sql`LEAST(${services.maxSlots}, ${services.availableSlots} + 1)`,
            updatedAt: new Date(),
          })
          .where(eq(services.id, payload.serviceId as string));
      }
    }

    await db
      .update(submissions)
      .set({ status, updatedAt: new Date() })
      .where(eq(submissions.id, id));

    return Response.json({
      ok: true,
      message:
        status === "cancelled" ? "Cancelled and inventory restored" : "Status updated",
    });
  } catch (e) {
    console.error("[SUBMISSION] PATCH error:", e);
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(submissions)
      .where(eq(submissions.id, id))
      .returning({ id: submissions.id });

    if (!deleted) {
      return Response.json({ ok: false, error: "Submission not found" }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error("[SUBMISSION] DELETE error:", e);
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
