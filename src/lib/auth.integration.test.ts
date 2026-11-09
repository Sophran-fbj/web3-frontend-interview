// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createAuth } from "@/lib/auth";
import { createTestDatabase } from "@/test/database";

const baseURL = "http://localhost:3000";
let database: Awaited<ReturnType<typeof createTestDatabase>>;
let auth: ReturnType<typeof createAuth>;

function cookies(response: Response) {
  return response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
}

describe("GitHub authentication with a migrated PostgreSQL engine", () => {
  beforeAll(async () => {
    database = await createTestDatabase();
    auth = createAuth(
      {
        baseURL,
        secret: "integration-secret-for-tests-at-least-32-characters",
        githubClientId: "fixture-client",
        githubClientSecret: "fixture-secret",
      },
      database.db,
    );
  }, 30000);
  afterAll(async () => {
    vi.restoreAllMocks();
    await database?.client.close();
  });

  it("completes OAuth, reads a private verified email, encrypts the token and revokes the session on logout", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      if (url.startsWith("https://github.com/login/oauth/access_token"))
        return Response.json({
          access_token: "github-fixture-access-token",
          token_type: "bearer",
          scope: "read:user,user:email",
        });
      if (url.startsWith("https://api.github.com/user/emails"))
        return Response.json([
          { email: "candidate@example.com", primary: true, verified: true },
        ]);
      if (url.startsWith("https://api.github.com/user"))
        return Response.json({
          id: 12345,
          login: "candidate",
          name: "Candidate",
          email: null,
          avatar_url: "https://example.com/avatar.png",
        });
      throw new Error(`Unexpected test request: ${url}`);
    });
    const headers = {
      "Content-Type": "application/json",
      Origin: baseURL,
      "X-Forwarded-For": "127.0.0.1",
    };
    const signIn = await auth.handler(
      new Request(`${baseURL}/api/auth/sign-in/social`, {
        method: "POST",
        headers,
        body: JSON.stringify({ provider: "github", callbackURL: "/account" }),
      }),
    );
    expect(signIn.status).toBe(200);
    const authorization = new URL((await signIn.json()).url);
    expect(authorization.origin).toBe("https://github.com");
    expect(authorization.searchParams.get("scope")).toContain("user:email");
    const callback = await auth.handler(
      new Request(
        `${baseURL}/api/auth/callback/github?code=fixture&state=${authorization.searchParams.get("state")}`,
        { headers: { Cookie: cookies(signIn) } },
      ),
    );
    expect(callback.status).toBe(302);
    expect(callback.headers.get("location")).toContain("/account");
    const sessionCookie = cookies(callback);
    const response = await auth.handler(
      new Request(`${baseURL}/api/auth/get-session`, {
        headers: { Cookie: sessionCookie },
      }),
    );
    const session = await response.json();
    expect(session.user).toMatchObject({
      name: "Candidate",
      email: "candidate@example.com",
      emailVerified: true,
    });
    const accounts = await database.db.query.account.findMany();
    expect(accounts[0].accessToken).not.toBe("github-fixture-access-token");
    expect(accounts[0].accessToken).toBeTruthy();
    const signOut = await auth.handler(
      new Request(`${baseURL}/api/auth/sign-out`, {
        method: "POST",
        headers: { ...headers, Cookie: sessionCookie },
      }),
    );
    expect(signOut.status).toBe(200);
    const revoked = await auth.handler(
      new Request(`${baseURL}/api/auth/get-session`, {
        headers: { Cookie: sessionCookie },
      }),
    );
    expect(await revoked.json()).toBeNull();
    vi.restoreAllMocks();
  });

  it("rejects a cross-origin authentication mutation with a session cookie", async () => {
    const response = await auth.handler(
      new Request(`${baseURL}/api/auth/sign-in/social`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://untrusted.example",
          Cookie: "better-auth.session_token=fixture",
          "X-Forwarded-For": "127.0.0.2",
        },
        body: JSON.stringify({ provider: "github" }),
      }),
    );
    expect(response.status).toBe(403);
  });

  it("persists login throttling in the database", async () => {
    for (let index = 0; index < 10; index++) {
      const response = await auth.handler(
        new Request(`${baseURL}/api/auth/sign-in/social`, {
          method: "POST",
          headers: {
            Origin: baseURL,
            "Content-Type": "application/json",
            "X-Forwarded-For": "127.0.0.3",
          },
          body: JSON.stringify({ provider: "github", callbackURL: "/account" }),
        }),
      );
      expect(response.status).toBe(200);
    }
    const throttled = await auth.handler(
      new Request(`${baseURL}/api/auth/sign-in/social`, {
        method: "POST",
        headers: {
          Origin: baseURL,
          "Content-Type": "application/json",
          "X-Forwarded-For": "127.0.0.3",
        },
        body: JSON.stringify({ provider: "github", callbackURL: "/account" }),
      }),
    );
    expect(throttled.status).toBe(429);
    expect(
      (await database.db.query.rateLimit.findMany()).some(
        (row) => row.count >= 10,
      ),
    ).toBe(true);
  });
});
