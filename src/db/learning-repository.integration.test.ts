// @vitest-environment node
import { readFile, readdir } from "node:fs/promises";

import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { readLearning, writeLearning } from "@/db/learning-repository";
import { user } from "@/db/schema";
import { emptyLearningSnapshot } from "@/lib/learning-snapshot";
import { createTestDatabase } from "@/test/database";

let database: Awaited<ReturnType<typeof createTestDatabase>>;
const date = "2026-11-10T00:00:00.000Z";
const setId = "00000000-0000-4000-8000-000000000001";

describe("transactional learning storage", () => {
  beforeAll(async () => {
    database = await createTestDatabase();
    await database.db.insert(user).values([
      { id: "a", name: "A", email: "a@example.com" },
      { id: "b", name: "B", email: "b@example.com" },
    ]);
  }, 30000);
  afterAll(async () => {
    await database?.client.close();
  });

  it("round-trips records, preserves ordering and isolates identical local IDs across accounts", async () => {
    const snapshot = emptyLearningSnapshot();
    snapshot.progress.q = { status: "review", reviewCount: 3, updatedAt: date };
    snapshot.bookmarks.q = { createdAt: date };
    snapshot.studySets[setId] = {
      id: setId,
      name: "顺序题单",
      description: "说明",
      questionIds: ["z", "a"],
      createdAt: date,
      updatedAt: date,
    };
    const first = await writeLearning(database.db, "a", {
      baseRevision: 0,
      mutationId: crypto.randomUUID(),
      snapshot,
    });
    expect(first.conflict).toBe(false);
    expect((await readLearning(database.db, "a")).snapshot).toEqual(snapshot);
    const other = structuredClone(snapshot);
    other.studySets[setId].name = "B 的题单";
    await writeLearning(database.db, "b", {
      baseRevision: 0,
      mutationId: crypto.randomUUID(),
      snapshot: other,
    });
    expect(
      (await readLearning(database.db, "a")).snapshot.studySets[setId].name,
    ).toBe("顺序题单");
    expect(
      (await readLearning(database.db, "b")).snapshot.studySets[setId].name,
    ).toBe("B 的题单");
  });

  it("rejects stale writes and makes retrying the same mutation idempotent", async () => {
    const remote = await readLearning(database.db, "a");
    const write = {
      baseRevision: remote.revision,
      mutationId: crypto.randomUUID(),
      snapshot: remote.snapshot,
    };
    const first = await writeLearning(database.db, "a", write);
    const duplicate = await writeLearning(database.db, "a", write);
    expect(duplicate.data.revision).toBe(first.data.revision);
    expect(duplicate.conflict).toBe(false);
    const stale = await writeLearning(database.db, "a", {
      ...write,
      mutationId: crypto.randomUUID(),
      snapshot: emptyLearningSnapshot(),
    });
    expect(stale.conflict).toBe(true);
    expect(stale.data.snapshot).toEqual(remote.snapshot);
  });

  it("rolls back deletions and revision when a later insert fails", async () => {
    const before = await readLearning(database.db, "a");
    await database.client.exec(
      "CREATE FUNCTION fail_progress() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture failure'; END $$; CREATE TRIGGER fail_progress BEFORE INSERT ON question_progress FOR EACH ROW EXECUTE FUNCTION fail_progress();",
    );
    await expect(
      writeLearning(database.db, "a", {
        baseRevision: before.revision,
        mutationId: crypto.randomUUID(),
        snapshot: before.snapshot,
      }),
    ).rejects.toThrow();
    await database.client.exec(
      "DROP TRIGGER fail_progress ON question_progress; DROP FUNCTION fail_progress();",
    );
    expect(await readLearning(database.db, "a")).toEqual(before);
  });

  it("migrates existing study-set entries without discarding their owner or order", async () => {
    const legacy = new PGlite();
    try {
      const files = (await readdir("drizzle"))
        .filter((file) => file.endsWith(".sql"))
        .sort();
      await legacy.exec(await readFile(`drizzle/${files[0]}`, "utf8"));
      await legacy.exec(
        "INSERT INTO \"user\" (id,name,email) VALUES ('legacy','Legacy','legacy@example.com'); INSERT INTO study_set (id,user_id,name) VALUES ('legacy-set','legacy','Legacy set'); INSERT INTO study_set_item (study_set_id,question_id,position) VALUES ('legacy-set','q',2);",
      );
      for (const file of files.slice(1))
        await legacy.exec(await readFile(`drizzle/${file}`, "utf8"));
      const result = await legacy.query(
        "SELECT user_id,question_id,position FROM study_set_item",
      );
      expect(result.rows).toEqual([
        { user_id: "legacy", question_id: "q", position: 2 },
      ]);
    } finally {
      await legacy.close();
    }
  });
});
