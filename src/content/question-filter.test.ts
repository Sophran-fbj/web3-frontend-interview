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

    expect(result.map(({ frontmatter }) => frontmatter.id)).toEqual([
      "wallet-003",
    ]);
  });

  it("returns no results when filters do not overlap", async () => {
    const questions = await getAllQuestions();
    const result = filterQuestions(questions, {
      difficulty: "advanced",
      category: "web3-basics",
    });

    expect(result).toHaveLength(0);
  });

  it("filters by a stack declared in frontmatter", async () => {
    const questions = await getAllQuestions();
    const result = filterQuestions(questions, {
      difficulty: "advanced",
      stack: "wagmi",
    });

    expect(result.map(({ frontmatter }) => frontmatter.id)).toEqual([
      "transaction-001",
    ]);
  });
});
