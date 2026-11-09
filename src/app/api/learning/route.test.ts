// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const identity = vi.hoisted(() => ({
  id: "api-user" as string | null,
  enabled: true,
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth", () => ({
  getAuth: () =>
    identity.enabled
      ? {
          api: {
            getSession: async () =>
              identity.id ? { user: { id: identity.id } } : null,
          },
        }
      : null,
}));
vi.mock("@/db/client", () => ({ getDb: () => database.db }));

import { GET, POST } from "@/app/api/learning/route";
import { user } from "@/db/schema";
import { emptyLearningSnapshot } from "@/lib/learning-snapshot";
import { createTestDatabase } from "@/test/database";

let database: Awaited<ReturnType<typeof createTestDatabase>>;
const base = "http://localhost:3000";
function request(body: unknown, origin = base) {
  return new Request(`${base}/api/learning`, {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("authenticated learning endpoint", () => {
  beforeAll(async () => {
    database = await createTestDatabase();
    await database.db
      .insert(user)
      .values({ id: "api-user", name: "API", email: "api@example.com" });
  }, 30000);
  afterAll(async () => {
    await database?.client.close();
  });

  it("requires a session and prevents callers from supplying a different owner", async () => {
    identity.id = null;
    expect((await GET(new Request(`${base}/api/learning`))).status).toBe(401);
    identity.id = "api-user";
    const body = {
      expectedUserId: "api-user",
      baseRevision: 0,
      mutationId: crypto.randomUUID(),
      snapshot: emptyLearningSnapshot(),
    };
    expect(
      (await POST(request({ ...body, userId: "someone-else" }))).status,
    ).toBe(400);
    expect(
      (await POST(request(body, "https://untrusted.example"))).status,
    ).toBe(403);
    expect((await POST(request(body))).status).toBe(200);
    expect(
      (await POST(request({ ...body, expectedUserId: "someone-else" }))).status,
    ).toBe(409);
    const remote = await GET(new Request(`${base}/api/learning`));
    expect(remote.headers.get("cache-control")).toBe("no-store");
    expect((await remote.json()).userId).toBe("api-user");
    expect(
      (await POST(request({ ...body, mutationId: crypto.randomUUID() })))
        .status,
    ).toBe(409);
  });

  it("rejects oversized payloads while keeping the server data unchanged", async () => {
    const response = await POST(request({ text: "x".repeat(3 * 1024 * 1024) }));
    expect(response.status).toBe(413);
    expect(
      (await (await GET(new Request(`${base}/api/learning`))).json()).revision,
    ).toBe(1);
  });
});
