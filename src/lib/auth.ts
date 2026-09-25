import "server-only";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";

// ─────────────────────────────────────────────
// Admin account config — set via env vars in production.
// Fallbacks are intentionally weak so devs notice they need to override them.
// ─────────────────────────────────────────────
export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ?? "admin@foundersfootsteps.com";

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ?? "ChangeMe_SetADMIN_PASSWORD_EnvVar!";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type SafeUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: "customer" | "admin" | "staff";
  emailVerified: boolean;
};

const VALID_ROLES = ["customer", "admin", "staff"] as const;
type ValidRole = (typeof VALID_ROLES)[number];

function isValidRole(r: unknown): r is ValidRole {
  return VALID_ROLES.includes(r as ValidRole);
}

export function toSafeUser(row: typeof users.$inferSelect): SafeUser {
  return {
    id: row.id,
    email: row.email,
    firstName: row.firstName ?? "",
    lastName: row.lastName ?? "",
    phone: row.phone ?? null,
    role: isValidRole(row.role) ? row.role : "customer",
    emailVerified: row.emailVerified ?? false,
  };
}

// ─────────────────────────────────────────────
// Ensure the fixed admin account exists in the DB.
// Safe to call on every login attempt (idempotent).
// ─────────────────────────────────────────────
export async function ensureAdminSeeded(): Promise<void> {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) return;

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await db.insert(users).values({
    email: ADMIN_EMAIL,
    passwordHash,
    firstName: "Admin",
    lastName: "",
    role: "admin",
    emailVerified: true,
  });
}

// ─────────────────────────────────────────────
// Lookups
// ─────────────────────────────────────────────

/** Find a user by email (case-insensitive). */
export async function findUserByEmail(
  email: string
): Promise<(typeof users.$inferSelect) | null> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Find a user by email OR phone.
 * Used by the login route so customers can sign in with either identifier.
 */
export async function findUserByEmailOrPhone(
  identifier: string
): Promise<(typeof users.$inferSelect) | null> {
  const value = identifier.trim();
  const rows = await db
    .select()
    .from(users)
    .where(
      or(
        eq(users.email, value.toLowerCase()),
        eq(users.phone, value)
      )
    )
    .limit(1);
  return rows[0] ?? null;
}

// ─────────────────────────────────────────────
// Password helpers
// ─────────────────────────────────────────────

export async function verifyPassword(
  plain: string,
  hash: string | null | undefined
): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

// ─────────────────────────────────────────────
// User creation
// ─────────────────────────────────────────────

export async function createUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<SafeUser> {
  const passwordHash = await hashPassword(data.password);
  const [row] = await db
    .insert(users)
    .values({
      email: data.email.toLowerCase().trim(),
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone ?? null,
      role: "customer",
      emailVerified: false,
    })
    .returning();
  return toSafeUser(row);
}
