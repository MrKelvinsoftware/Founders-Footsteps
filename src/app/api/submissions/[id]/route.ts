import { db } from "@/db";
import { submissions, products, services } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return Response.json({ ok: false, error: "status is required" }, { status: 400 });
    }

    // Get current submission to check type and previous status
    const [current] = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, id))
      .limit(1);

    if (!current) {
      return Response.json({ ok: false, error: "Submission not found" }, { status: 404 });
    }

    // If cancelling, restore stock/slots
    if (status === "cancelled" && current.status !== "cancelled") {
      const payload = current.payload as Record<string, unknown> || {};

      if (current.type === "marketplace" && payload.items) {
        // Restore product stock
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
            
            console.log(`[STOCK] Restored ${item.quantity} units for product ${item.productId}`);
          }
        }
      } else if (payload.serviceId) {
        // Restore service slot
        await db
          .update(services)
          .set({
            availableSlots: sql`LEAST(${services.maxSlots}, ${services.availableSlots} + 1)`,
            updatedAt: new Date(),
          })
          .where(eq(services.id, payload.serviceId as string));
        
        console.log(`[SLOTS] Restored 1 slot for service ${payload.serviceId}`);
      }
    }

    await db.update(submissions).set({ status, updatedAt: new Date() }).where(eq(submissions.id, id));
    return Response.json({ ok: true, message: status === "cancelled" ? "Cancelled and inventory restored" : "Status updated" });
  } catch (e) {
    console.error("[SUBMISSION] Update error:", e);
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(submissions).where(eq(submissions.id, id));
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
