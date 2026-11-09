export type AuthConfiguration = {
  baseURL: string;
  secret: string;
  githubClientId: string;
  githubClientSecret: string;
};

export function readAuthConfiguration(
  env: Record<string, string | undefined> = process.env,
) {
  const enabled = env.AUTH_ENABLED === "true";
  const issues: string[] = [];
  const required = [
    "DATABASE_URL",
    "BETTER_AUTH_URL",
    "BETTER_AUTH_SECRET",
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
  ] as const;
  for (const key of required) {
    if (!env[key]?.trim() || env[key]?.startsWith("replace-")) issues.push(key);
  }
  if (env.BETTER_AUTH_SECRET && env.BETTER_AUTH_SECRET.length < 32)
    issues.push("BETTER_AUTH_SECRET");
  try {
    const url = new URL(env.BETTER_AUTH_URL ?? "");
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (
      url.pathname !== "/" ||
      url.search ||
      url.hash ||
      url.username ||
      url.password ||
      (url.protocol !== "https:" &&
        !(env.NODE_ENV !== "production" && local && url.protocol === "http:"))
    )
      issues.push("BETTER_AUTH_URL");
  } catch {
    issues.push("BETTER_AUTH_URL");
  }
  try {
    const url = new URL(env.DATABASE_URL ?? "");
    if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname)
      issues.push("DATABASE_URL");
  } catch {
    issues.push("DATABASE_URL");
  }

  const config: AuthConfiguration | null = issues.length
    ? null
    : {
        baseURL: new URL(env.BETTER_AUTH_URL!).origin,
        secret: env.BETTER_AUTH_SECRET!,
        githubClientId: env.GITHUB_CLIENT_ID!,
        githubClientSecret: env.GITHUB_CLIENT_SECRET!,
      };
  return {
    enabled,
    available: enabled && config !== null,
    issues: [...new Set(issues)],
    config,
  };
}
