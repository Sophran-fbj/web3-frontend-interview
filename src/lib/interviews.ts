import { z } from "zod";

export const assessmentSchema = z.enum(["unclear", "review", "mastered"]);
export type InterviewAssessment = z.infer<typeof assessmentSchema>;

const responseSchema = z.object({
  questionId: z.string().min(1),
  questionTitle: z.string().min(1),
  text: z.string().max(10000),
  startedAt: z.iso.datetime().nullable(),
  submittedAt: z.iso.datetime().nullable(),
  elapsedSeconds: z.number().int().nonnegative(),
  timedOut: z.boolean(),
  skipped: z.boolean(),
  assessment: assessmentSchema.nullable(),
});

export const interviewSessionSchema = z
  .object({
    id: z.uuid(),
    source: z.enum(["filtered", "review", "bookmarks", "study-set"]),
    sourceId: z.string().nullable(),
    sourceLabel: z.string().min(1),
    secondsPerQuestion: z.number().int().min(30).max(900),
    status: z.enum(["answering", "reviewing", "completed"]),
    currentIndex: z.number().int().nonnegative(),
    items: z.array(responseSchema).min(1).max(20),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    completedAt: z.iso.datetime().nullable(),
  })
  .superRefine((session, context) => {
    if (
      session.currentIndex >= session.items.length ||
      new Set(session.items.map((item) => item.questionId)).size !==
        session.items.length
    ) {
      context.addIssue({ code: "custom", message: "题目顺序无效" });
    }
    if (
      session.items.some(
        (item, index) =>
          (index < session.currentIndex || session.status !== "answering") &&
          !item.submittedAt,
      )
    ) {
      context.addIssue({ code: "custom", message: "已结束的题目缺少提交记录" });
    }
    if (
      session.status === "completed" &&
      (!session.completedAt ||
        session.items.some((item) => !item.skipped && !item.assessment))
    ) {
      context.addIssue({ code: "custom", message: "自评尚未完成" });
    }
  });

export type InterviewSession = z.infer<typeof interviewSessionSchema>;
export type InterviewSource = InterviewSession["source"];

export function remainingSeconds(
  startedAt: string,
  limit: number,
  now: number,
): number {
  return Math.max(
    0,
    Math.min(
      limit,
      Math.ceil((Date.parse(startedAt) + limit * 1000 - now) / 1000),
    ),
  );
}

export function selectInterviewQuestions<T>(
  candidates: readonly T[],
  count: number,
  preserveOrder: boolean,
  random = Math.random,
): T[] {
  const items = [...candidates];
  if (!preserveOrder) {
    for (let index = items.length - 1; index > 0; index--) {
      const target = Math.floor(random() * (index + 1));
      [items[index], items[target]] = [items[target], items[index]];
    }
  }
  return items.slice(0, Math.max(0, Math.min(20, count)));
}

export function interviewHref(
  session: InterviewSession,
  questionId?: string,
): string {
  const id =
    questionId ??
    session.items[session.status === "answering" ? session.currentIndex : 0]
      .questionId;
  return `/interview?${new URLSearchParams({ session: session.id, question: id })}`;
}

export function restoreInterviews(
  persisted: unknown,
): Record<string, InterviewSession> {
  const result = z
    .object({ sessions: z.record(z.string(), z.unknown()) })
    .safeParse(persisted);
  if (!result.success) return {};
  return Object.fromEntries(
    Object.entries(result.data.sessions).flatMap(([id, value]) => {
      const session = interviewSessionSchema.safeParse(value);
      return session.success && session.data.id === id
        ? [[id, session.data]]
        : [];
    }),
  );
}
