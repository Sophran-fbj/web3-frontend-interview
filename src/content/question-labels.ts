import type { QuestionFrontmatter } from "./question-schema";

export const difficultyLabels: Record<
  QuestionFrontmatter["difficulty"],
  string
> = {
  beginner: "初级",
  intermediate: "中级",
  advanced: "高级",
};

export const questionTypeLabels: Record<
  QuestionFrontmatter["questionType"],
  string
> = {
  concept: "概念题",
  comparison: "对比题",
  scenario: "场景题",
  debugging: "排障题",
  "code-review": "代码审查",
  coding: "编码题",
  "system-design": "系统设计",
  retrospective: "复盘题",
};
