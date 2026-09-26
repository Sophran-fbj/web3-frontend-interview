import "server-only";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";

/** Authentication infrastructure is dormant in P0; no route or UI is exposed. */
export function createAuth() {
  return betterAuth({
    database: drizzleAdapter(getDb(), { provider: "pg", schema }),
  });
}
