import { describe, expect, it, vi } from "vitest";

import {
  getAllQuestions,
  getQuestionBySlug,
  getVisibleQuestions,
  isPublicQuestionStatus,
} from "./question-repository";

describe("question repository", () => {
  it("loads every question with unique ids and slugs", async () => {
    const questions = await getAllQuestions();
    const ids = questions.map(({ frontmatter }) => frontmatter.id);
    const slugs = questions.map(({ frontmatter }) => frontmatter.slug);

    expect(questions).toHaveLength(125);
    expect(new Set(ids)).toHaveLength(ids.length);
    expect(new Set(slugs)).toHaveLength(slugs.length);
  });

  it("finds a question by its stable slug", async () => {
    const question = await getQuestionBySlug(
      "eth-accounts-vs-eth-request-accounts",
    );

    expect(question?.frontmatter.id).toBe("wallet-003");
    expect(question?.body).toContain("## 30 秒回答");
  });

  it("publishes complete review content outside preview mode", async () => {
    let questions: Awaited<ReturnType<typeof getVisibleQuestions>> | undefined;

    try {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("CONTENT_PREVIEW", "false");

      questions = await getVisibleQuestions();
    } finally {
      vi.unstubAllEnvs();
    }

    expect(questions).toHaveLength(125);
  });

  it.each([
    ["review", true],
    ["verified", true],
    ["draft", false],
    ["needs-review", false],
    ["deprecated", false],
    ["archived", false],
  ] as const)("maps %s to public=%s", (status, expected) => {
    expect(isPublicQuestionStatus(status)).toBe(expected);
  });
});
