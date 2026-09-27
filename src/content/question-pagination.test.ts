import { describe, expect, it } from "vitest";

import {
  getVisiblePageNumbers,
  paginateQuestions,
  questionsPerPage,
} from "./question-pagination";

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

describe("getVisiblePageNumbers", () => {
  it("shows every page when there are ten or fewer", () => {
    expect(getVisiblePageNumbers(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("keeps the first, last and nearby pages within ten numbers", () => {
    expect(getVisiblePageNumbers(1, 13)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 13,
    ]);
    expect(getVisiblePageNumbers(7, 13)).toEqual([
      1, 3, 4, 5, 6, 7, 8, 9, 10, 13,
    ]);
    expect(getVisiblePageNumbers(13, 13)).toEqual([
      1, 5, 6, 7, 8, 9, 10, 11, 12, 13,
    ]);
  });
});
