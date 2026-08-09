import { db } from "@/db";
import { submissions } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";

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
        summary,
        payload: payload || {},
      })
      .returning();

    return Response.json({
      ok: true,
      data: {
        id: row.id,
        type: row.type,
        status: row.status,
        total: row.total ? parseFloat(row.total) : undefined,
        currency: row.currency,
        customer: row.firstName ? { firstName: row.firstName, lastName: row.lastName, email: row.email, phone: row.phone } : undefined,
        summary: row.summary,
        payload: row.payload || {},
        createdAt: row.createdAt.toISOString(),
      },
    });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
