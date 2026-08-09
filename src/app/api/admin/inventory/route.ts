import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, services } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// GET: List products with stock or services with slots
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "products";

    if (type === "products") {
      const rows = await db
        .select({ id: products.id, name: products.name, stock: products.stock, price: products.price, isActive: products.isActive })
        .from(products)
        .limit(200);
      return NextResponse.json({ items: rows });
    } else {
      const rows = await db
        .select({ id: services.id, name: services.name, maxSlots: services.maxSlots, availableSlots: services.availableSlots, price: services.price, isActive: services.isActive })
        .from(services)
        .limit(200);
      return NextResponse.json({ items: rows });
    }
  } catch (error) {
    console.error("Admin inventory GET error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

// PATCH: Restock product or add slots to service
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, action, amount } = body;

    if (!type || !id || !action || !amount) {
      return NextResponse.json({ error: "type, id, action, and amount are required" }, { status: 400 });
    }

    const qty = parseInt(amount);
    if (isNaN(qty) || qty < 1) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    if (type === "product") {
      if (action === "restock") {
        const [updated] = await db
          .update(products)
          .set({ stock: sql`${products.stock} + ${qty}`, updatedAt: new Date() })
          .where(eq(products.id, id))
          .returning({ name: products.name, stock: products.stock });

        return NextResponse.json({ success: true, message: `Restocked ${updated?.name}: now ${updated?.stock} units`, item: updated });
      } else if (action === "set") {
        const [updated] = await db
          .update(products)
          .set({ stock: qty, updatedAt: new Date() })
          .where(eq(products.id, id))
          .returning({ name: products.name, stock: products.stock });

        return NextResponse.json({ success: true, message: `Set ${updated?.name} stock to ${updated?.stock}`, item: updated });
      }
    } else if (type === "service") {
      if (action === "add-slots") {
        const [updated] = await db
          .update(services)
          .set({
            availableSlots: sql`${services.availableSlots} + ${qty}`,
            maxSlots: sql`GREATEST(${services.maxSlots}, ${services.availableSlots} + ${qty})`,
            updatedAt: new Date(),
          })
          .where(eq(services.id, id))
          .returning({ name: services.name, availableSlots: services.availableSlots, maxSlots: services.maxSlots });

        return NextResponse.json({ success: true, message: `Added ${qty} slots to ${updated?.name}: now ${updated?.availableSlots} available`, item: updated });
      } else if (action === "set-slots") {
        const [updated] = await db
          .update(services)
          .set({
            availableSlots: qty,
            maxSlots: sql`GREATEST(${services.maxSlots}, ${qty})`,
            updatedAt: new Date(),
          })
          .where(eq(services.id, id))
          .returning({ name: services.name, availableSlots: services.availableSlots, maxSlots: services.maxSlots });

        return NextResponse.json({ success: true, message: `Set ${updated?.name} to ${updated?.availableSlots} slots`, item: updated });
      } else if (action === "reset-slots") {
        const [updated] = await db
          .update(services)
          .set({ availableSlots: services.maxSlots, updatedAt: new Date() })
          .where(eq(services.id, id))
          .returning({ name: services.name, availableSlots: services.availableSlots, maxSlots: services.maxSlots });

        return NextResponse.json({ success: true, message: `Reset ${updated?.name} slots to max (${updated?.maxSlots})`, item: updated });
      }
    }

    return NextResponse.json({ error: "Invalid type or action" }, { status: 400 });
  } catch (error) {
    console.error("Admin inventory PATCH error:", error);
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}
