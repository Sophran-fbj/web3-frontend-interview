import { z } from "zod";

const dateStringSchema = z
  .union([
    z.string(),
    z.date().transform((value) => value.toISOString().slice(0, 10)),
  ])
  .pipe(
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期必须使用 YYYY-MM-DD 格式"),
  );

export const questionStatusSchema = z.enum([
  "draft",
  "review",
  "verified",
  "needs-review",
  "deprecated",
  "archived",
]);

export const questionFrontmatterSchema = z
  .object({
    id: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id 必须使用 kebab-case"),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 必须使用 kebab-case"),
    title: z.string().min(8),
    summary: z.string().min(12),
    status: questionStatusSchema,
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    category: z.enum([
      "web3-basics",
      "wallet",
      "signing",
      "transaction",
      "contract",
      "data",
      "security",
      "performance-ux",
      "architecture",
      "business-scenario",
    ]),
    questionType: z.enum([
      "concept",
      "comparison",
      "scenario",
      "debugging",
      "code-review",
      "coding",
      "system-design",
      "retrospective",
    ]),
    ecosystems: z.array(z.string().min(1)).min(1),
    tags: z.array(z.string().min(1)).min(1),
    stacks: z.record(z.string(), z.string()).default({}),
    sourceTypes: z.array(z.string().min(1)).min(1),
    verifiedAt: dateStringSchema,
    reviewers: z.array(z.string().min(1)).min(1),
    references: z
      .array(z.object({ title: z.string().min(1), url: z.url() }))
      .default([]),
  })
  .superRefine((question, context) => {
    if (question.status === "verified" && question.references.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["references"],
        message: "已验证题目至少需要一个参考资料",
      });
    }
  });

export type QuestionFrontmatter = z.infer<typeof questionFrontmatterSchema>;
