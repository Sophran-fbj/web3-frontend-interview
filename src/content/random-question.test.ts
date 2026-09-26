import { describe, expect, it } from "vitest";

import { pickRandomQuestion } from "./random-question";

const candidates = [
  { id: "wallet-001", slug: "wallet-one" },
  { id: "wallet-002", slug: "wallet-two" },
  { id: "wallet-003", slug: "wallet-three" },
];

describe("pickRandomQuestion", () => {
  it("does not immediately repeat the previous question", () => {
    expect(pickRandomQuestion(candidates, "wallet-002", 0)?.id).toBe(
      "wallet-001",
    );
    expect(pickRandomQuestion(candidates, "wallet-002", 0.999)?.id).toBe(
      "wallet-003",
    );
  });

  it("returns the only candidate even if it was selected last time", () => {
    expect(pickRandomQuestion([candidates[0]], "wallet-001", 0)).toEqual(
      candidates[0],
    );
  });

  it("returns undefined for an empty scope", () => {
    expect(pickRandomQuestion([], undefined, 0.5)).toBeUndefined();
  });
});
