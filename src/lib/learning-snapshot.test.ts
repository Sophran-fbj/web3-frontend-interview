import { describe, expect, it } from "vitest";

import {
  emptyLearningSnapshot,
  mergeLearningSnapshots,
} from "@/lib/learning-snapshot";

const record = {
  status: "review" as const,
  reviewCount: 1,
  updatedAt: "2026-11-10T00:00:00.000Z",
};

describe("three-way learning merge", () => {
  it("keeps independent changes and propagates explicit deletion without reviving old records", () => {
    const base = emptyLearningSnapshot();
    base.progress.a = record;
    base.bookmarks.a = { createdAt: record.updatedAt };
    const local = structuredClone(base);
    delete local.bookmarks.a;
    local.progress.b = record;
    const remote = structuredClone(base);
    remote.progress.c = record;
    const result = mergeLearningSnapshots(base, local, remote);
    expect(result.conflicts).toEqual([]);
    expect(Object.keys(result.snapshot.progress).sort()).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(result.snapshot.bookmarks.a).toBeUndefined();
    expect(
      mergeLearningSnapshots(base, base, result.snapshot).snapshot.bookmarks.a,
    ).toBeUndefined();
  });
  it("requires a choice for concurrent edits and deletion-versus-edit conflicts", () => {
    const base = emptyLearningSnapshot();
    base.progress.a = record;
    const local = structuredClone(base);
    delete local.progress.a;
    const remote = structuredClone(base);
    remote.progress.a = { ...record, status: "mastered", reviewCount: 2 };
    expect(mergeLearningSnapshots(base, local, remote).conflicts).toEqual([
      { collection: "progress", id: "a" },
    ]);
    expect(
      mergeLearningSnapshots(base, local, remote, "local").snapshot.progress.a,
    ).toBeUndefined();
    expect(
      mergeLearningSnapshots(base, local, remote, "remote").snapshot.progress.a
        .reviewCount,
    ).toBe(2);
    expect(mergeLearningSnapshots(base, remote, remote).conflicts).toHaveLength(
      0,
    );
  });
});
