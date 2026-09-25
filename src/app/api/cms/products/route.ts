import { db } from "@/db";
import { cmsContent } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

const SLUG = "cms-products";

export async function GET() {
  try {
    const [row] = await db.select().from(cmsContent).where(eq(cmsContent.slug, SLUG)).limit(1);
    if (row?.content) {
      const data = row.content as { products: unknown[]; hidden: string[] };
      return Response.json({ ok: true, products: data.products || [], hidden: data.hidden || [] });
    }
    return Response.json({ ok: true, products: [], hidden: [] });
  } catch (e) {
    console.error("Error fetching products:", e);
    return Response.json({ ok: false, products: [], hidden: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { products, hidden } = body;
    
    const [existing] = await db.select().from(cmsContent).where(eq(cmsContent.slug, SLUG)).limit(1);
    
    const content = { products: products || [], hidden: hidden || [] };
    
    if (existing) {
      await db.update(cmsContent)
        .set({ content, updatedAt: new Date() })
        .where(eq(cmsContent.slug, SLUG));
    } else {
      await db.insert(cmsContent).values({
        slug: SLUG,
        title: "CMS Products",
        content,
      });
    }
    
    return Response.json({ ok: true });
  } catch (e) {
    console.error("Error saving products:", e);
    return Response.json({ ok: false }, { status: 500 });
  }
}
