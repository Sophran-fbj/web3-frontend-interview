import { z } from "zod";

import { interviewSessionSchema } from "@/lib/interviews";
import { studySetSchema } from "@/lib/study-sets";

const questionId = z.string().min(1).max(200);
export const progressRecordSchema = z.object({
  status: z.enum(["unclear", "review", "mastered"]),
  reviewCount: z.number().int().nonnegative(),
  updatedAt: z.iso.datetime(),
});
export const learningSnapshotSchema = z
  .object({
    version: z.literal(1),
    progress: z.record(questionId, progressRecordSchema),
    bookmarks: z.record(questionId, z.object({ createdAt: z.iso.datetime() })),
    studySets: z.record(z.uuid(), studySetSchema),
    sessions: z.record(z.uuid(), interviewSessionSchema),
  })
  .strict()
  .superRefine((snapshot, context) => {
    for (const collection of ["studySets", "sessions"] as const) {
      for (const [id, value] of Object.entries(snapshot[collection]))
        if (id !== value.id)
          context.addIssue({
            code: "custom",
            path: [collection, id],
            message: "记录 ID 与键不一致",
          });
    }
    for (const collection of [
      "progress",
      "bookmarks",
      "studySets",
      "sessions",
    ] as const) {
      if (Object.keys(snapshot[collection]).length > 2500)
        context.addIssue({
          code: "custom",
          path: [collection],
          message: "单类记录数量超过同步上限",
        });
    }
  });

export type LearningSnapshot = z.infer<typeof learningSnapshotSchema>;
export type MergePreference = "local" | "remote";
export type LearningCollection =
  "progress" | "bookmarks" | "studySets" | "sessions";
export type MergeConflict = { collection: LearningCollection; id: string };

export const remoteLearningSchema = z.object({
  userId: z.string().min(1),
  revision: z.number().int().nonnegative(),
  snapshot: learningSnapshotSchema,
});
export type RemoteLearning = z.infer<typeof remoteLearningSchema>;
export const learningWriteSchema = z
  .object({
    baseRevision: z.number().int().nonnegative(),
    mutationId: z.uuid(),
    snapshot: learningSnapshotSchema,
  })
  .strict();
export type LearningWrite = z.infer<typeof learningWriteSchema>;
export const learningRequestSchema = learningWriteSchema.extend({
  expectedUserId: z.string().min(1),
});

export function emptyLearningSnapshot(): LearningSnapshot {
  return {
    version: 1,
    progress: {},
    bookmarks: {},
    studySets: {},
    sessions: {},
  };
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, canonical(child)]),
    );
  return value;
}

export function sameLearningValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
}

export function mergeLearningSnapshots(
  base: LearningSnapshot,
  local: LearningSnapshot,
  remote: LearningSnapshot,
  preference: MergePreference = "local",
) {
  const conflicts: MergeConflict[] = [];
  function records<T>(
    collection: LearningCollection,
    previous: Record<string, T>,
    current: Record<string, T>,
    incoming: Record<string, T>,
  ): Record<string, T> {
    const result: Record<string, T> = {};
    for (const id of new Set([
      ...Object.keys(previous),
      ...Object.keys(current),
      ...Object.keys(incoming),
    ])) {
      let value: T | undefined;
      if (sameLearningValue(current[id], incoming[id])) value = current[id];
      else if (sameLearningValue(current[id], previous[id]))
        value = incoming[id];
      else if (sameLearningValue(incoming[id], previous[id]))
        value = current[id];
      else {
        conflicts.push({ collection, id });
        value = preference === "local" ? current[id] : incoming[id];
      }
      if (value !== undefined) result[id] = value;
    }
    return result;
  }
  const snapshot: LearningSnapshot = {
    version: 1,
    progress: records(
      "progress",
      base.progress,
      local.progress,
      remote.progress,
    ),
    bookmarks: records(
      "bookmarks",
      base.bookmarks,
      local.bookmarks,
      remote.bookmarks,
    ),
    studySets: records(
      "studySets",
      base.studySets,
      local.studySets,
      remote.studySets,
    ),
    sessions: records(
      "sessions",
      base.sessions,
      local.sessions,
      remote.sessions,
    ),
  };
  return { snapshot, conflicts };
}
