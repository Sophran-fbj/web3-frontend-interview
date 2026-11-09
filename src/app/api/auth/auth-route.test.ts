// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ getAuth: () => null }));
import { GET, POST } from "@/app/api/auth/[...all]/route";

describe("disabled authentication routes", () => {
  it("does not require a database when disabled and refuses foreign origins", async () => {
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
});
