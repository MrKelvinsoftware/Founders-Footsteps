import "server-only";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const ADMIN_EMAIL = "admin@foundersfootsteps.com";
const ADMIN_DEFAULT_PASSWORD = "password810122";

export type SafeUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: "customer" | "admin" | "staff";
};

export function toSafeUser(row: typeof users.$inferSelect): SafeUser {
  return {
    id: row.id,
    email: row.email,
    firstName: row.firstName ?? "",
    lastName: row.lastName ?? "",
    phone: row.phone,
    role: (row.role as SafeUser["role"]) ?? "customer",
  };
}

export async function ensureAdminSeeded(): Promise<void> {
  const existing = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1);
  if (existing.length > 0) return;
  const passwordHash = await bcrypt.hash(ADMIN_DEFAULT_PASSWORD, 10);
  await db.insert(users).values({
    email: ADMIN_EMAIL,
    passwordHash,
    firstName: "Admin",
    lastName: "User",
    role: "admin",
  });
}

export async function findUserByEmail(email: string) {
  const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
  return rows[0] ?? null;
}

export async function findUserByPhone(phone: string) {
  const rows = await db.select().from(users).where(eq(users.phone, phone.trim())).limit(1);
  return rows[0] ?? null;
}

export async function findUserByEmailOrPhone(identifier: string) {
  // Check if it looks like an email
  if (identifier.includes("@")) {
    return findUserByEmail(identifier);
  }
  // Otherwise try phone
  const byPhone = await findUserByPhone(identifier);
  if (byPhone) return byPhone;
  // Fallback: try as email anyway
  return findUserByEmail(identifier);
}

export async function verifyPassword(plain: string, hash: string | null): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

export async function createUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<SafeUser> {
  const passwordHash = await bcrypt.hash(data.password, 10);
  const [row] = await db
    .insert(users)
    .values({
      email: data.email.toLowerCase().trim(),
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: "customer",
    })
    .returning();
  return toSafeUser(row);
}


