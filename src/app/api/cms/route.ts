import { db } from "@/db";
import { cmsContent } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (slug) {
      const rows = await db.select().from(cmsContent).where(eq(cmsContent.slug, slug)).limit(1);
      if (rows.length === 0) return Response.json({ ok: true, data: null });
      return Response.json({ ok: true, data: rows[0] });
    }

    const rows = await db.select().from(cmsContent);
    return Response.json({ ok: true, data: rows });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, title, content } = body;

    if (!slug || !title) {
      return Response.json({ ok: false, error: "slug and title are required" }, { status: 400 });
    }

    const existing = await db.select().from(cmsContent).where(eq(cmsContent.slug, slug)).limit(1);

    if (existing.length > 0) {
      await db.update(cmsContent).set({ title, content, updatedAt: new Date() }).where(eq(cmsContent.slug, slug));
    } else {
      await db.insert(cmsContent).values({ slug, title, content });
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
