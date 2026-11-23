import "server-only";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import {
  readAuthConfiguration,
  type AuthConfiguration,
} from "@/lib/auth-config";

export function createAuth(
  config: AuthConfiguration,
  db: PgDatabase<PgQueryResultHKT, typeof schema>,
) {
  return betterAuth({
    appName: "Web3 前端面试题库",
    baseURL: config.baseURL,
    secret: config.secret,
    trustedOrigins: [config.baseURL],
    advanced: { disableOriginCheck: false, disableCSRFCheck: false },
    database: drizzleAdapter(db, { provider: "pg", schema }),
    socialProviders: {
      github: {
        clientId: config.githubClientId,
        clientSecret: config.githubClientSecret,
        scope: ["read:user", "user:email"],
      },
    },
    account: { encryptOAuthTokens: true, accountLinking: { enabled: false } },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 120,
      customRules: {
        "/get-session": false,
        "/sign-in/social": { window: 60, max: 10 },
      },
    },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  });
}

let auth: ReturnType<typeof createAuth> | undefined;

export function getAuth() {
  const settings = readAuthConfiguration();
  if (!settings.available || !settings.config) return null;
  auth ??= createAuth(settings.config, getDb());
  return auth;
}
