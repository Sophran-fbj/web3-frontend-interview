import { describe, expect, it } from "vitest";

import { filterQuestions } from "./question-filter";
import { getAllQuestions } from "./question-repository";

describe("filterQuestions", () => {
  it("searches the title and question body", async () => {
    const questions = await getAllQuestions();

    expect(
      filterQuestions(questions, { query: "BigInt" }).map(
        ({ frontmatter }) => frontmatter.id,
      ),
    ).toContain("web3-basics-001");
    expect(
      filterQuestions(questions, { query: "accountsChanged" }),
    ).not.toHaveLength(0);
  });

  it("combines difficulty, category and type filters", async () => {
    const questions = await getAllQuestions();
    const result = filterQuestions(questions, {
      difficulty: "beginner",
      category: "wallet",
      questionType: "comparison",
    });

    expect(result).not.toHaveLength(0);
    expect(result.map(({ frontmatter }) => frontmatter.id)).toContain(
      "wallet-003",
    );
    expect(
      result.every(
        ({ frontmatter }) =>
          frontmatter.difficulty === "beginner" &&
          frontmatter.category === "wallet" &&
          frontmatter.questionType === "comparison",
      ),
    ).toBe(true);
  });

  it("excludes questions that do not satisfy every filter", async () => {
    const questions = await getAllQuestions();
    const result = filterQuestions(questions, {
      difficulty: "advanced",
      category: "web3-basics",
    });

    expect(result).not.toHaveLength(0);
    expect(result.map(({ frontmatter }) => frontmatter.id)).not.toContain(
      "web3-basics-001",
    );
    expect(
      result.every(
        ({ frontmatter }) =>
          frontmatter.difficulty === "advanced" &&
          frontmatter.category === "web3-basics",
      ),
    ).toBe(true);
  });

  it("filters by a stack declared in frontmatter", async () => {
    const questions = await getAllQuestions();
    const result = filterQuestions(questions, {
      difficulty: "advanced",
      stack: "wagmi",
    });

    expect(result).not.toHaveLength(0);
    expect(result.map(({ frontmatter }) => frontmatter.id)).toContain(
      "transaction-001",
    );
    expect(
      result.every(
        ({ frontmatter }) =>
          frontmatter.difficulty === "advanced" &&
          "wagmi" in frontmatter.stacks,
      ),
    ).toBe(true);
  });
});
