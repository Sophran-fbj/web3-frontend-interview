import { describe, expect, it } from "vitest";

import {
  appendQuestionBackParam,
  createQuestionDetailHref,
  createQuestionListBackQuery,
  createQuestionsHref,
  createQuestionsHrefFromBack,
} from "./question-list-url";

describe("createQuestionsHref", () => {
  it("serializes filters and pagination into a shareable URL", () => {
    expect(
      createQuestionsHref({
        query: "钱包 连接",
        difficulty: "intermediate",
        page: 2,
      }),
    ).toBe(
      "/questions?q=%E9%92%B1%E5%8C%85+%E8%BF%9E%E6%8E%A5&difficulty=intermediate&page=2",
    );
  });

  it("omits empty filters and the first page", () => {
    expect(createQuestionsHref({ page: 1 })).toBe("/questions");
  });
});

describe("question detail back param", () => {
  it("appends the encoded list query to detail links", () => {
    expect(
      createQuestionDetailHref("eth-signature", {
        query: "钱包",
        page: 2,
      }),
    ).toBe("/questions/eth-signature?back=q%3D%E9%92%B1%E5%8C%85%26page%3D2");
  });

  it("keeps default detail links unchanged without filters", () => {
    expect(createQuestionDetailHref("eth-signature", { page: 1 })).toBe(
      "/questions/eth-signature",
    );
    expect(createQuestionListBackQuery({ page: 1 })).toBeUndefined();
  });

  it("restores the list URL from a back param", () => {
    expect(createQuestionsHrefFromBack("q=钱包&page=2")).toBe(
      "/questions?q=%E9%92%B1%E5%8C%85&page=2",
    );
    expect(createQuestionsHrefFromBack(null)).toBe("/questions");
    expect(createQuestionsHrefFromBack("")).toBe("/questions");
  });

  it("normalizes invalid back params into harmless queries", () => {
    expect(createQuestionsHrefFromBack("hacked=1#fragment")).toBe(
      "/questions?hacked=1%23fragment",
    );
  });

  it("appends back params to plain detail hrefs", () => {
    expect(
      appendQuestionBackParam("/questions/eth-signature", "difficulty=basic"),
    ).toBe("/questions/eth-signature?back=difficulty%3Dbasic");
    expect(appendQuestionBackParam("/questions/eth-signature", undefined)).toBe(
      "/questions/eth-signature",
    );
  });
});
