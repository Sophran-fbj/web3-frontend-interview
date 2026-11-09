import { z } from "zod";

export const studySetMetadataSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500),
});

export const studySetSchema = studySetMetadataSchema.extend({
  id: z.uuid(),
  questionIds: z
    .array(z.string().min(1))
    .refine((ids) => new Set(ids).size === ids.length),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type StudySet = z.infer<typeof studySetSchema>;

export function restoreStudySets(persisted: unknown): Record<string, StudySet> {
  const result = z
    .object({ studySets: z.record(z.string(), z.unknown()) })
    .safeParse(persisted);
  if (!result.success) return {};

  return Object.fromEntries(
    Object.entries(result.data.studySets).flatMap(([id, value]) => {
      const set = studySetSchema.safeParse(value);
      return set.success && set.data.id === id ? [[id, set.data]] : [];
    }),
  );
}
