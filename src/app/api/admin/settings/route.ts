import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cmsContent } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";

const SLUG = "site-settings";

const DEFAULTS = {
  freeDeliveryThreshold: 500,
  freeDeliveryEnabled: true,
};

export async function GET() {
  // GET is intentionally public — the cart page reads the free delivery threshold
  // No auth required for reading site settings

  try {
    const [row] = await db
      .select()
      .from(cmsContent)
      .where(eq(cmsContent.slug, SLUG))
      .limit(1);

    return NextResponse.json({
      ...DEFAULTS,
      ...((row?.content as Record<string, unknown>) ?? {}),
    });
  } catch {
    return NextResponse.json(DEFAULTS);
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const [existing] = await db
      .select()
      .from(cmsContent)
      .where(eq(cmsContent.slug, SLUG))
      .limit(1);

    const current = (existing?.content as Record<string, unknown>) ?? {};
    const merged = { ...current, ...body };

    if (existing) {
      await db
        .update(cmsContent)
        .set({ content: merged, updatedAt: new Date() })
        .where(eq(cmsContent.slug, SLUG));
    } else {
      await db.insert(cmsContent).values({
        slug: SLUG,
        title: "Site Settings",
        content: merged,
        isPublished: true,
      });
    }

    return NextResponse.json({ success: true, settings: merged });
  } catch (error) {
    console.error("[SETTINGS] Update error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
