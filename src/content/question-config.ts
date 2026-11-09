// 分类的声明顺序同时用于题目排序与筛选菜单。
export const categoryLabels = {
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
} as const;

export type QuestionCategory = keyof typeof categoryLabels;

export const categoryOrder = Object.keys(categoryLabels) as QuestionCategory[];

export const questionOverviewGroups: {
  label: string;
  categories: QuestionCategory[];
}[] = [
  { label: "钱包与签名", categories: ["wallet", "signing"] },
  { label: "交易与合约", categories: ["transaction", "contract"] },
  { label: "数据与安全", categories: ["data", "security"] },
  {
    label: "架构与体验",
    categories: [
      "web3-basics",
      "performance-ux",
      "architecture",
      "business-scenario",
    ],
  },
];
