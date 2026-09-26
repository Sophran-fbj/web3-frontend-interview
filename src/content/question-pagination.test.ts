import { describe, expect, it } from "vitest";

import { paginateQuestions, questionsPerPage } from "./question-pagination";

describe("paginateQuestions", () => {
  const questions = Array.from({ length: 25 }, (_, index) => index + 1);

  it("shows ten questions per page", () => {
    const firstPage = paginateQuestions(questions, 1);

    expect(questionsPerPage).toBe(10);
    expect(firstPage.items).toEqual(questions.slice(0, 10));
    expect(firstPage.totalPages).toBe(3);
  });

  it("shows the remaining questions on the final page", () => {
    const finalPage = paginateQuestions(questions, 3);

    expect(finalPage.items).toEqual(questions.slice(20));
  });

  it("clamps invalid and out-of-range pages", () => {
    expect(paginateQuestions(questions, 0).currentPage).toBe(1);
    expect(paginateQuestions(questions, 99).currentPage).toBe(3);
  });
});
