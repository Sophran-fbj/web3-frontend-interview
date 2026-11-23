import { describe, expect, it } from "vitest";

import {
  createHeadingId,
  extractQuestionHeadings,
} from "@/content/question-headings";

describe("question headings", () => {
  it("maps standard Chinese section headings to stable English ids", () => {
    expect(createHeadingId("题目")).toBe("question");
    expect(createHeadingId("30 秒回答")).toBe("short-answer");
    expect(createHeadingId("常见错误")).toBe("common-mistakes");
    expect(createHeadingId("评分标准")).toBe("scoring");
  });

  it("extracts h2 and h3 headings while ignoring headings inside fenced code blocks", () => {
    const markdown = [
      "## 题目",
      "",
      "正文描述。",
      "",
      "```ts",
      "## 这不是标题",
      "### 也不是标题",
      "```",
      "",
      "## 深入回答",
      "",
      "### 状态边界",
      "",
      "#### 四级标题不收录",
    ].join("\n");

    expect(extractQuestionHeadings(markdown)).toEqual([
      { id: "question", text: "题目", level: 2 },
      { id: "deep-answer", text: "深入回答", level: 2 },
      { id: "状态边界", text: "状态边界", level: 3 },
    ]);
  });
});
