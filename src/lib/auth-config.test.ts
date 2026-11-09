import { describe, expect, it } from "vitest";

import { readAuthConfiguration } from "@/lib/auth-config";

const configured = {
  AUTH_ENABLED: "true",
  NODE_ENV: "development",
  DATABASE_URL: "postgresql://test:test@localhost/test",
  BETTER_AUTH_URL: "http://localhost:3000",
  BETTER_AUTH_SECRET: "unit-test-auth-secret-at-least-32-characters",
  GITHUB_CLIENT_ID: "test-client",
  GITHUB_CLIENT_SECRET: "test-secret",
};

describe("authentication configuration", () => {
  it("keeps authentication disabled without infrastructure", () => {
    expect(readAuthConfiguration({}).available).toBe(false);
    expect(
      readAuthConfiguration({ ...configured, AUTH_ENABLED: "false" }).available,
    ).toBe(false);
    expect(readAuthConfiguration(configured).available).toBe(true);
  });
  it("rejects incomplete secrets, invalid URLs and insecure production origins", () => {
    for (const invalid of [
      { GITHUB_CLIENT_SECRET: "" },
      { BETTER_AUTH_SECRET: "short" },
      { BETTER_AUTH_SECRET: "replace-with-at-least-32-random-characters" },
      { BETTER_AUTH_URL: "https://example.com/path" },
      { DATABASE_URL: "https://example.com" },
      { NODE_ENV: "production" },
    ]) {
      expect(
        readAuthConfiguration({ ...configured, ...invalid }).available,
      ).toBe(false);
    }
    expect(
      readAuthConfiguration({
        ...configured,
        NODE_ENV: "production",
        BETTER_AUTH_URL: "https://example.com",
      }).available,
    ).toBe(true);
  });
});
