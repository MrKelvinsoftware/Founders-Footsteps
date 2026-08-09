import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsPostgresqlDb?: ReturnType<typeof drizzle>;
};

function getPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required. Please set it in your environment variables.");
  }

  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    globalForDb.__arenaNextJsPostgresqlPool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("neon.tech") || databaseUrl.includes("supabase") 
        ? { rejectUnauthorized: false } 
        : undefined,
    });
  }

  return globalForDb.__arenaNextJsPostgresqlPool;
}

function getDb() {
  if (!globalForDb.__arenaNextJsPostgresqlDb) {
    globalForDb.__arenaNextJsPostgresqlDb = drizzle(getPool());
  }
  return globalForDb.__arenaNextJsPostgresqlDb;
}

// Lazy exports - only connect when actually used at runtime
export const pool = new Proxy({} as Pool, {
  get(_, prop) {
    return Reflect.get(getPool(), prop);
  },
});

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    return Reflect.get(getDb(), prop);
  },
});
