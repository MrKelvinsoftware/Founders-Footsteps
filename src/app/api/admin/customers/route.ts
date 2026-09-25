import { db } from "@/db";
import { users, submissions, inboxMessages } from "@/db/schema";
import { desc, eq, or, ilike, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/session";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50")));
    const offset = (page - 1) * limit;

    // Build search condition — escape wildcard chars to prevent abuse
    const whereClause = search
      ? or(
          ilike(users.email, `%${search}%`),
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`),
          ilike(users.phone, `%${search}%`)
        )
      : undefined;

    const [allUsers, [{ count }]] = await Promise.all([
      db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          role: users.role,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(whereClause),
    ]);

    // Enrich each user with submission activity (batch query by email)
    const submissionActivity =
      allUsers.length > 0
        ? await db
            .select({
              email: submissions.email,
              count: sql<number>`count(*)`.as("count"),
              totalSpent: sql<number>`COALESCE(SUM(CAST(${submissions.total} AS DECIMAL)), 0)`.as(
                "total_spent"
              ),
              lastActivity: sql<string>`MAX(${submissions.createdAt})`.as("last_activity"),
            })
            .from(submissions)
            .where(
              sql`${submissions.email} IN (${sql.join(
                allUsers.map((u) => sql`${u.email}`),
                sql`, `
              )})`
            )
            .groupBy(submissions.email)
        : [];

    const activityMap = new Map(submissionActivity.map((s) => [s.email?.toLowerCase(), s]));

    const enriched = allUsers.map((user) => {
      const activity = activityMap.get(user.email.toLowerCase());
      const now = Date.now();
      const accountAgeDays = Math.floor(
        (now - new Date(user.createdAt).getTime()) / 86_400_000
      );
      const lastActivityDate = activity?.lastActivity
        ? new Date(activity.lastActivity)
        : new Date(user.updatedAt);
      const daysSinceActivity = Math.floor(
        (now - lastActivityDate.getTime()) / 86_400_000
      );
      return {
        ...user,
        name:
          `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
          user.email.split("@")[0],
        orderCount: Number(activity?.count ?? 0),
        totalSpent: Number(activity?.totalSpent ?? 0),
        lastActivity: activity?.lastActivity ?? user.updatedAt,
        accountAgeDays,
        daysSinceActivity,
        isInactive: daysSinceActivity > 90,
      };
    });

    return Response.json({
      ok: true,
      customers: enriched,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    });
  } catch (e) {
    console.error("[CUSTOMERS] GET error:", e);
    return Response.json({ ok: false, customers: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, userId, title, message, type = "system" } = body as {
      action?: string;
      userId?: string;
      title?: string;
      message?: string;
      type?: string;
    };

    if (action === "send_message") {
      if (!userId || !title || !message) {
        return Response.json({ ok: false, error: "userId, title, and message are required" }, { status: 400 });
      }

      const [newMessage] = await db
        .insert(inboxMessages)
        .values({ userId, title, message, type, priority: "normal" })
        .returning();

      return Response.json({ ok: true, message: newMessage });
    }

    if (action === "delete_user") {
      if (!userId) {
        return Response.json({ ok: false, error: "userId is required" }, { status: 400 });
      }

      // Prevent deleting the built-in admin account
      const [target] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!target) {
        return Response.json({ ok: false, error: "User not found" }, { status: 404 });
      }

      const adminEmail = process.env.ADMIN_EMAIL ?? "admin@foundersfootsteps.com";
      if (target.email.toLowerCase() === adminEmail.toLowerCase()) {
        return Response.json(
          { ok: false, error: "Cannot delete the built-in admin account" },
          { status: 403 }
        );
      }

      await db.delete(users).where(eq(users.id, userId));
      return Response.json({ ok: true });
    }

    return Response.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error("[CUSTOMERS] POST error:", e);
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
