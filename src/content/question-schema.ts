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

export const questionSourceTypeSchema = z.enum([
  "real-interview",
  "job-description",
  "official-docs",
  "production-case",
  "security-incident",
  "maintainer-interview",
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
    sourceTypes: z.array(questionSourceTypeSchema).min(1),
    updatedAt: dateStringSchema,
    verifiedAt: dateStringSchema.optional(),
    reviewers: z.array(z.string().min(1)).default([]),
    changeLog: z
      .array(
        z.object({
          date: dateStringSchema,
          summary: z.string().min(1),
          author: z.string().min(1).optional(),
        }),
      )
      .default([]),
    references: z
      .array(
        z.object({
          title: z.string().min(1),
          url: z.url().refine((url) => url.startsWith("https://"), {
            message: "参考资料必须使用 HTTPS",
          }),
        }),
      )
      .default([]),
  })
  .superRefine((question, context) => {
    const requiresCompleteContent =
      question.status === "review" || question.status === "verified";

    if (requiresCompleteContent && question.references.length === 0)
      context.addIssue({
        code: "custom",
        path: ["references"],
        message: "待审核或已验证题目至少需要一个参考资料",
      });

    if (
      new Set(question.references.map(({ url }) => url)).size !==
      question.references.length
    )
      context.addIssue({
        code: "custom",
        path: ["references"],
        message: "同一道题不能包含重复的参考资料 URL",
      });

    if (question.status === "review") {
      if (question.verifiedAt)
        context.addIssue({
          code: "custom",
          path: ["verifiedAt"],
          message: "待审核题目不能提前填写验证日期",
        });

      if (question.reviewers.length > 0)
        context.addIssue({
          code: "custom",
          path: ["reviewers"],
          message: "待审核题目不能提前填写审核者",
        });
    }

    if (question.status !== "verified") return;

    if (!question.verifiedAt)
      context.addIssue({
        code: "custom",
        path: ["verifiedAt"],
        message: "已验证题目必须填写验证日期",
      });

    if (question.reviewers.length === 0)
      context.addIssue({
        code: "custom",
        path: ["reviewers"],
        message: "已验证题目至少需要一名审核者",
      });

    if (
      question.verifiedAt &&
      question.verifiedAt.localeCompare(question.updatedAt) < 0
    )
      context.addIssue({
        code: "custom",
        path: ["verifiedAt"],
        message: "验证日期不能早于最近修改日期",
      });
  });

export type QuestionFrontmatter = z.infer<typeof questionFrontmatterSchema>;
