import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Re-export all schema tables so callers can import from "@/db" directly
export * from "./schema";

const globalForDb = globalThis as typeof globalThis & {
  _ffPool?: Pool;
  _ffDb?: ReturnType<typeof drizzle<typeof schema>>;
};

function createPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your .env.local or Vercel environment variables."
    );
  }

  return new Pool({
    connectionString: databaseUrl,
    // Neon requires SSL; local Postgres typically doesn't
    ssl:
      databaseUrl.includes("neon.tech") ||
      databaseUrl.includes("supabase.co") ||
      process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}

function getPool(): Pool {
  if (!globalForDb._ffPool) {
    globalForDb._ffPool = createPool();
  }
  return globalForDb._ffPool;
}

function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!globalForDb._ffDb) {
    globalForDb._ffDb = drizzle(getPool(), { schema });
  }
  return globalForDb._ffDb;
}

// Lazy proxies — the pool/db are only initialised on first access at
// request-time, not at module-evaluation time (avoids build-time errors
// when DATABASE_URL isn't available in the build environment).
export const pool = new Proxy({} as Pool, {
  get(_, prop) {
    return Reflect.get(getPool(), prop);
  },
});

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    return Reflect.get(getDb(), prop);
  },
});
