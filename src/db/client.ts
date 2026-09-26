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

  pool ??= new Pool({ connectionString });
  return drizzle({ client: pool, schema });
}
