import type { QuestionFrontmatter } from "./question-schema";

export const difficultyLabels: Record<
  QuestionFrontmatter["difficulty"],
  string
> = {
  beginner: "初级",
  intermediate: "中级",
  advanced: "高级",
};

export const categoryLabels: Record<QuestionFrontmatter["category"], string> = {
  "web3-basics": "Web3 基础",
  wallet: "钱包与连接",
  signing: "签名",
  transaction: "交易系统",
  contract: "合约交互",
  data: "链上数据",
  security: "安全",
  "performance-ux": "性能与体验",
  architecture: "架构",
  "business-scenario": "业务场景",
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
