import { db } from "@/db";
import { submissions, products, services } from "@/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import { generateOrderNumber, generateBookingNumber } from "@/lib/otp";
import { sendReceipt } from "@/lib/receipt";
import { sendInboxMessage } from "@/lib/inbox";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const status = url.searchParams.get("status");

    const conditions = [];
    if (type) conditions.push(eq(submissions.type, type));
    if (status) conditions.push(eq(submissions.status, status));

    const rows = await db
      .select()
      .from(submissions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(submissions.createdAt))
      .limit(500);

    const data = rows.map((r) => ({
      id: r.id,
      type: r.type,
      status: r.status,
      total: r.total ? parseFloat(r.total) : undefined,
      currency: r.currency,
      customer: r.firstName ? { firstName: r.firstName, lastName: r.lastName, email: r.email, phone: r.phone } : undefined,
      summary: r.summary,
      payload: r.payload || {},
      createdAt: r.createdAt.toISOString(),
    }));

    return Response.json({ ok: true, data });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, total, currency, customer, summary, payload } = body;

    if (!type) {
      return Response.json({ ok: false, error: "type is required" }, { status: 400 });
    }

    // Generate tracking number based on type
    const trackingNumber = type === "marketplace" 
      ? generateOrderNumber() 
      : generateBookingNumber();

    // For marketplace orders, check and reduce stock
    if (type === "marketplace" && payload?.items) {
      const items = payload.items as Array<{ productId: string; quantity: number; name?: string }>;
      
      // Check stock for all items first
      for (const item of items) {
        if (item.productId) {
          const [product] = await db
            .select({ stock: products.stock, name: products.name })
            .from(products)
            .where(eq(products.id, item.productId))
            .limit(1);

          if (!product || (product.stock || 0) < item.quantity) {
            return Response.json({ 
              ok: false, 
              error: `Insufficient stock for ${product?.name || item.name || 'product'}. Available: ${product?.stock || 0}` 
            }, { status: 400 });
          }
        }
      }

      // Reduce stock for all items
      for (const item of items) {
        if (item.productId) {
          await db
            .update(products)
            .set({
              stock: sql`GREATEST(0, ${products.stock} - ${item.quantity})`,
              updatedAt: new Date(),
            })
            .where(eq(products.id, item.productId));
          
          console.log(`[STOCK] Reduced ${item.quantity} units for product ${item.productId}`);
        }
      }
    }

    // For service bookings, check and reduce slots
    if (type !== "marketplace" && payload?.serviceId) {
      const [service] = await db
        .select({ 
          availableSlots: services.availableSlots, 
          name: services.name 
        })
        .from(services)
        .where(eq(services.id, payload.serviceId))
        .limit(1);

      if (service && (service.availableSlots || 0) < 1) {
        return Response.json({ 
          ok: false, 
          error: `No slots available for ${service.name}. Please try another time.` 
        }, { status: 400 });
      }

      // Reduce slot
      if (payload.serviceId) {
        await db
          .update(services)
          .set({
            availableSlots: sql`GREATEST(0, ${services.availableSlots} - 1)`,
            updatedAt: new Date(),
          })
          .where(eq(services.id, payload.serviceId));
        
        console.log(`[SLOTS] Reduced 1 slot for service ${payload.serviceId}`);
      }
    }

    // Create the submission with tracking number
    const [row] = await db
      .insert(submissions)
      .values({
        type,
        total: total ? String(total) : undefined,
        currency: currency || "GHS",
        firstName: customer?.firstName,
        lastName: customer?.lastName,
        email: customer?.email,
        phone: customer?.phone,
        summary: summary || trackingNumber,
        payload: { 
          ...payload, 
          trackingNumber,
          whatsapp: customer?.whatsapp || payload?.whatsapp,
        },
      })
      .returning();

    // Send receipt via email and/or WhatsApp
    const customerName = `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim() || "Customer";
    const items = type === "marketplace" && payload?.items 
      ? (payload.items as Array<{ name: string; quantity: number; price: number }>)
      : undefined;

    let receiptResult;
    if (customer?.email || customer?.phone || customer?.whatsapp) {
      try {
        receiptResult = await sendReceipt({
          trackingNumber,
          type: type === "marketplace" ? "order" : "booking",
          customerName,
          customerEmail: customer?.email,
          customerPhone: customer?.phone,
          customerWhatsApp: customer?.whatsapp || payload?.whatsapp,
          items,
          serviceName: payload?.serviceName as string,
          serviceDate: payload?.date as string,
          serviceTime: payload?.time as string,
          subtotal: payload?.subtotal as number,
          total: total || 0,
          currency: currency || "GHS",
          paymentMethod: payload?.paymentMethod as string,
          notes: payload?.notes as string,
        });
        console.log(`[RECEIPT] Sent for ${trackingNumber}:`, receiptResult);
      } catch (err) {
        console.error("[RECEIPT] Error sending:", err);
      }
    }

    return Response.json({
      ok: true,
      data: {
        id: row.id,
        type: row.type,
        status: row.status,
        trackingNumber,
        total: row.total ? parseFloat(row.total) : undefined,
        currency: row.currency,
        customer: row.firstName ? { firstName: row.firstName, lastName: row.lastName, email: row.email, phone: row.phone } : undefined,
        summary: row.summary,
        payload: row.payload || {},
        createdAt: row.createdAt.toISOString(),
        receipt: receiptResult,
      },
    });
  } catch (e) {
    console.error("[SUBMISSION] Error:", e);
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
