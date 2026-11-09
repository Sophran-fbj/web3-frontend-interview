import "server-only";

import { eq } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

import * as schema from "@/db/schema";
import {
  emptyLearningSnapshot,
  learningSnapshotSchema,
  type LearningWrite,
  type LearningSnapshot,
  type RemoteLearning,
} from "@/lib/learning-snapshot";

type LearningDatabase = PgDatabase<PgQueryResultHKT, typeof schema>;

async function readSnapshot(
  db: LearningDatabase,
  userId: string,
): Promise<LearningSnapshot> {
  const snapshot = emptyLearningSnapshot();
  for (const row of await db
    .select()
    .from(schema.questionProgress)
    .where(eq(schema.questionProgress.userId, userId))) {
    if (row.status !== "unseen")
      snapshot.progress[row.questionId] = {
        status: row.status,
        reviewCount: row.reviewCount,
        updatedAt: row.updatedAt.toISOString(),
      };
  }
  for (const row of await db
    .select()
    .from(schema.bookmark)
    .where(eq(schema.bookmark.userId, userId)))
    snapshot.bookmarks[row.questionId] = {
      createdAt: row.createdAt.toISOString(),
    };
  const items = await db
    .select()
    .from(schema.studySetItem)
    .where(eq(schema.studySetItem.userId, userId));
  for (const row of await db
    .select()
    .from(schema.studySet)
    .where(eq(schema.studySet.userId, userId)))
    snapshot.studySets[row.id] = {
      id: row.id,
      name: row.name,
      description: row.description ?? "",
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      questionIds: items
        .filter((item) => item.studySetId === row.id)
        .sort((a, b) => a.position - b.position)
        .map((item) => item.questionId),
    };
  for (const row of await db
    .select()
    .from(schema.interviewRecord)
    .where(eq(schema.interviewRecord.userId, userId)))
    snapshot.sessions[row.id] = row.data;
  return learningSnapshotSchema.parse(snapshot);
}

export async function readLearning(
  db: LearningDatabase,
  userId: string,
): Promise<RemoteLearning> {
  return db.transaction(async (tx) => {
    await tx
      .insert(schema.learningSyncState)
      .values({ userId })
      .onConflictDoNothing();
    const [state] = await tx
      .select()
      .from(schema.learningSyncState)
      .where(eq(schema.learningSyncState.userId, userId))
      .for("share");
    return {
      userId,
      revision: state.revision,
      snapshot: await readSnapshot(tx, userId),
    };
  });
}

function chunks<T>(items: T[]): T[][] {
  return Array.from({ length: Math.ceil(items.length / 500) }, (_, index) =>
    items.slice(index * 500, (index + 1) * 500),
  );
}

export async function writeLearning(
  db: LearningDatabase,
  userId: string,
  write: LearningWrite,
) {
  return db.transaction(async (tx) => {
    await tx
      .insert(schema.learningSyncState)
      .values({ userId })
      .onConflictDoNothing();
    const [state] = await tx
      .select()
      .from(schema.learningSyncState)
      .where(eq(schema.learningSyncState.userId, userId))
      .for("update");
    if (
      state.lastMutationId === write.mutationId ||
      state.revision !== write.baseRevision
    )
      return {
        conflict: state.lastMutationId !== write.mutationId,
        data: {
          userId,
          revision: state.revision,
          snapshot: await readSnapshot(tx, userId),
        },
      };

    const snapshot = learningSnapshotSchema.parse(write.snapshot);
    await tx
      .delete(schema.questionProgress)
      .where(eq(schema.questionProgress.userId, userId));
    await tx.delete(schema.bookmark).where(eq(schema.bookmark.userId, userId));
    await tx.delete(schema.studySet).where(eq(schema.studySet.userId, userId));
    await tx
      .delete(schema.interviewRecord)
      .where(eq(schema.interviewRecord.userId, userId));
    for (const values of chunks(
      Object.entries(snapshot.progress).map(([questionId, record]) => ({
        userId,
        questionId,
        ...record,
        updatedAt: new Date(record.updatedAt),
      })),
    ))
      await tx.insert(schema.questionProgress).values(values);
    for (const values of chunks(
      Object.entries(snapshot.bookmarks).map(([questionId, record]) => ({
        userId,
        questionId,
        createdAt: new Date(record.createdAt),
      })),
    ))
      await tx.insert(schema.bookmark).values(values);
    for (const values of chunks(
      Object.values(snapshot.studySets).map((record) => ({
        userId,
        id: record.id,
        name: record.name,
        description: record.description,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
      })),
    ))
      await tx.insert(schema.studySet).values(values);
    for (const values of chunks(
      Object.values(snapshot.studySets).flatMap((record) =>
        record.questionIds.map((questionId, position) => ({
          userId,
          studySetId: record.id,
          questionId,
          position,
          createdAt: new Date(record.createdAt),
        })),
      ),
    ))
      await tx.insert(schema.studySetItem).values(values);
    for (const values of chunks(
      Object.values(snapshot.sessions).map((record) => ({
        userId,
        id: record.id,
        data: record,
      })),
    ))
      await tx.insert(schema.interviewRecord).values(values);
    const revision = state.revision + 1;
    await tx
      .update(schema.learningSyncState)
      .set({
        revision,
        lastMutationId: write.mutationId,
        updatedAt: new Date(),
      })
      .where(eq(schema.learningSyncState.userId, userId));
    return { conflict: false, data: { userId, revision, snapshot } };
  });
}
