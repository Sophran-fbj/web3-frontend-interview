// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuth: vi.fn(),
  handler: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ getAuth: mocks.getAuth }));
import { GET, POST } from "@/app/api/auth/[...all]/route";

describe("authentication routes", () => {
  beforeEach(() => {
    mocks.getAuth.mockReset();
    mocks.handler.mockReset();
  });

  it("does not require a database when disabled and refuses foreign origins", async () => {
    mocks.getAuth.mockReturnValue(null);
    expect(
      (await GET(new Request("http://localhost:3000/api/auth/get-session")))
        .status,
    ).toBe(503);
    expect(
      (
        await POST(
          new Request("http://localhost:3000/api/auth/sign-in/social", {
            method: "POST",
            headers: { Origin: "https://untrusted.example" },
          }),
        )
      ).status,
    ).toBe(403);
  });

  it("returns null immediately for unauthenticated get-session without invoking auth handler", async () => {
    mocks.handler.mockResolvedValue(Response.json({ user: { id: "u1" } }));
    mocks.getAuth.mockReturnValue({ handler: mocks.handler });

    const guestResponse = await GET(
      new Request("http://localhost:3000/api/auth/get-session"),
    );
    expect(guestResponse.status).toBe(200);
    expect(await guestResponse.json()).toBeNull();
    expect(mocks.handler).not.toHaveBeenCalled();

    const signedInResponse = await GET(
      new Request("http://localhost:3000/api/auth/get-session", {
        headers: { Cookie: "better-auth.session_token=abc" },
      }),
    );
    expect(signedInResponse.status).toBe(200);
    expect(await signedInResponse.json()).toEqual({ user: { id: "u1" } });
    expect(mocks.handler).toHaveBeenCalledTimes(1);
  });
});
