/**
 * Transaction-capable Database Connection
 * 
 * Uses Neon's WebSocket driver for ACID transaction support.
 * The regular HTTP connection is kept for fast reads,
 * this WebSocket connection is used for transactional writes.
 */

import { neon, neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleNeonServerless } from "drizzle-orm/neon-serverless";
import ws from "ws";

// Configure WebSocket for Neon (required for transactions)
neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// HTTP connection for fast reads (existing behavior)
const httpSql = neon(databaseUrl);
export const db = drizzleNeonHttp(httpSql);

// WebSocket Pool for transactions
let pool: Pool | null = null;
let transactionDb: ReturnType<typeof drizzleNeonServerless> | null = null;

export function getTransactionDb() {
  if (!pool) {
    pool = new Pool({ connectionString: databaseUrl });
    transactionDb = drizzleNeonServerless(pool);
  }
  return transactionDb!;
}

export async function withTransaction<T>(
  callback: (tx: ReturnType<typeof drizzleNeonServerless>) => Promise<T>
): Promise<T> {
  const txDb = getTransactionDb();
  
  return txDb.transaction(async (tx) => {
    return callback(tx as any);
  });
}

// Cleanup function for graceful shutdown
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    transactionDb = null;
  }
}
