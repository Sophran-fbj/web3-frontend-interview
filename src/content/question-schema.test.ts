import { describe, expect, it } from "vitest";

import { questionFrontmatterSchema } from "./question-schema";

const validQuestion = {
  id: "wallet-001",
  slug: "wallet-provider-rpc-responsibilities",
  title: "浏览器钱包 Provider 和公共 RPC 应如何分工？",
  summary: "考察钱包注入 Provider 与只读 RPC 的职责边界和降级策略。",
  status: "verified",
  difficulty: "intermediate",
  category: "wallet",
  questionType: "system-design",
  ecosystems: ["evm"],
  tags: ["provider", "rpc"],
  stacks: { viem: "2" },
  sourceTypes: ["official-docs"],
  verifiedAt: "2026-09-27",
  reviewers: ["maintainer"],
  references: [
    { title: "EIP-1193", url: "https://eips.ethereum.org/EIPS/eip-1193" },
  ],
};

describe("questionFrontmatterSchema", () => {
  it("accepts a complete verified question", () => {
    expect(questionFrontmatterSchema.safeParse(validQuestion).success).toBe(
      true,
    );
  });

  it("rejects a verified question without references", () => {
    const result = questionFrontmatterSchema.safeParse({
      ...validQuestion,
      references: [],
    });
    expect(result.success).toBe(false);
  });
});
