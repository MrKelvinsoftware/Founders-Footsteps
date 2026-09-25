import { db } from "@/db";
import { cmsContent } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";

const SLUG = "site-branding";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [row] = await db
      .select()
      .from(cmsContent)
      .where(eq(cmsContent.slug, SLUG))
      .limit(1);
    return Response.json({ ok: true, data: row?.content ?? null });
  } catch {
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const [existing] = await db
      .select()
      .from(cmsContent)
      .where(eq(cmsContent.slug, SLUG))
      .limit(1);

    if (existing) {
      await db
        .update(cmsContent)
        .set({ content: body, updatedAt: new Date() })
        .where(eq(cmsContent.slug, SLUG));
    } else {
      await db.insert(cmsContent).values({
        slug: SLUG,
        title: "Site Branding",
        content: body,
        isPublished: true,
      });
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
