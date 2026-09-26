import { describe, expect, it } from "vitest";

import { getAllQuestions } from "./question-repository";
import { splitQuestionSections } from "./question-sections";

describe("splitQuestionSections", () => {
  it("keeps the prompt visible and moves answers into the disclosure", () => {
    const sections = splitQuestionSections(`
## 题目

这是一道题。

## 考察目标

- 核心能力。

## 30 秒回答

这是简要回答。
`);

    expect(sections.prompt).toContain("## 题目");
    expect(sections.prompt).toContain("## 考察目标");
    expect(sections.prompt).not.toContain("## 30 秒回答");
    expect(sections.answer).toContain("## 30 秒回答");
  });

  it("can split every current question", async () => {
    const questions = await getAllQuestions();

    for (const { body } of questions) {
      const sections = splitQuestionSections(body);

      expect(sections.prompt).toContain("## 题目");
      expect(sections.answer).toContain("## 30 秒回答");
      expect(sections.answer).toContain("## 评分标准");
      expect(sections.answer).toContain("## 参考资料");
    }
  });
});
