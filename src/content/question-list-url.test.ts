import { describe, expect, it } from "vitest";

import { createQuestionsHref } from "./question-list-url";

describe("createQuestionsHref", () => {
  it("serializes filters and pagination into a shareable URL", () => {
    expect(
      createQuestionsHref({
        query: "钱包 连接",
        difficulty: "intermediate",
        tag: "eip-1193",
        page: 2,
      }),
    ).toBe(
      "/questions?q=%E9%92%B1%E5%8C%85+%E8%BF%9E%E6%8E%A5&difficulty=intermediate&tag=eip-1193&page=2",
    );
  });

  it("omits empty filters and the first page", () => {
    expect(createQuestionsHref({ page: 1 })).toBe("/questions");
  });
});
