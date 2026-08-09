import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cmsContent } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET settings
export async function GET() {
  try {
    const [row] = await db
      .select()
      .from(cmsContent)
      .where(eq(cmsContent.slug, "site-settings"))
      .limit(1);

    const defaults = {
      freeDeliveryThreshold: 500,
      freeDeliveryEnabled: true,
    };

    if (!row || !row.content) {
      return NextResponse.json(defaults);
    }

    return NextResponse.json({ ...defaults, ...(row.content as Record<string, unknown>) });
  } catch {
    return NextResponse.json({ freeDeliveryThreshold: 500, freeDeliveryEnabled: true });
  }
}

// PATCH settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    // Get existing settings
    const [existing] = await db
      .select()
      .from(cmsContent)
      .where(eq(cmsContent.slug, "site-settings"))
      .limit(1);

    const currentSettings = (existing?.content as Record<string, unknown>) || {};
    const newSettings = { ...currentSettings, ...body };

    if (existing) {
      await db
        .update(cmsContent)
        .set({ content: newSettings, updatedAt: new Date() })
        .where(eq(cmsContent.slug, "site-settings"));
    } else {
      await db.insert(cmsContent).values({
        slug: "site-settings",
        title: "Site Settings",
        content: newSettings,
        isPublished: true,
      });
    }

    return NextResponse.json({ success: true, settings: newSettings });
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
