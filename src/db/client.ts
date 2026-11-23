import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/db/schema";

let pool: Pool | undefined;

export function getDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is required when database features are enabled.",
    );
  }

  pool ??= new Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 60000,
    keepAlive: true,
    allowExitOnIdle: true,
  });
  return drizzle({ client: pool, schema });
}
