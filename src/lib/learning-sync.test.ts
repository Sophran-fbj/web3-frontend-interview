import { afterEach, describe, expect, it, vi } from "vitest";

import {
  emptyLearningSnapshot,
  type LearningSnapshot,
  type RemoteLearning,
} from "@/lib/learning-snapshot";
import { LearningSyncController } from "@/lib/learning-sync";

const progress = {
  status: "review" as const,
  reviewCount: 1,
  updatedAt: "2026-11-10T00:00:00.000Z",
};

function harness(base: RemoteLearning | null = null) {
  const state = {
    local: structuredClone(base?.snapshot ?? emptyLearningSnapshot()),
    guest: emptyLearningSnapshot(),
    remote: structuredClone(
      base ?? { userId: "a", revision: 0, snapshot: emptyLearningSnapshot() },
    ),
    current: true,
    fail: false,
    changed: () => {},
  };
  const readRemote = vi.fn(async () => {
    if (state.fail) throw new Error("fixture network failure");
    return structuredClone(state.remote);
  });
  const writeRemote = vi.fn(
    async (remote: RemoteLearning, snapshot: LearningSnapshot) => {
      state.remote = {
        userId: "a",
        revision: remote.revision + 1,
        snapshot: structuredClone(snapshot),
      };
      return state.remote;
    },
  );
  const applyLocal = vi.fn((snapshot: LearningSnapshot) => {
    state.local = snapshot;
  });
  const saveCache = vi.fn();
  const controller = new LearningSyncController({
    userId: "a",
    base,
    readLocal: () => state.local,
    readGuest: () => state.guest,
    applyLocal,
    saveCache,
    isCurrent: () => state.current,
    subscribeLocal: (listener) => {
      state.changed = listener;
      return () => {
        state.changed = () => {};
      };
    },
    readRemote,
    writeRemote,
  });
  return { state, controller, readRemote, writeRemote, applyLocal, saveCache };
}

afterEach(() => vi.useRealTimers());

describe("learning synchronization controller", () => {
  it("waits for consent, preserves the guest copy and makes subsequent synchronization idempotent", async () => {
    const h = harness();
    h.state.guest.progress.guest = progress;
    h.state.remote.snapshot.progress.cloud = progress;
    await h.controller.synchronize();
    expect(h.controller.getSnapshot().phase).toBe("confirmation");
    expect(h.writeRemote).not.toHaveBeenCalled();
    expect(h.state.local.progress).toEqual({});
    await h.controller.synchronize("local", true);
    expect(Object.keys(h.state.local.progress).sort()).toEqual([
      "cloud",
      "guest",
    ]);
    expect(h.state.guest.progress.guest).toEqual(progress);
    await h.controller.synchronize();
    expect(h.writeRemote).toHaveBeenCalledTimes(1);
    h.controller.dispose();
  });

  it("pauses on concurrent edits and applies the explicit conflict choice", async () => {
    const base = {
      userId: "a",
      revision: 1,
      snapshot: emptyLearningSnapshot(),
    };
    base.snapshot.progress.q = progress;
    const h = harness(base);
    h.state.local.progress.q = { ...progress, status: "mastered" };
    h.state.remote.snapshot.progress.q = { ...progress, status: "unclear" };
    h.state.remote.revision = 2;
    await h.controller.synchronize();
    expect(h.controller.getSnapshot().phase).toBe("conflict");
    expect(h.writeRemote).not.toHaveBeenCalled();
    expect(h.state.local.progress.q.status).toBe("mastered");
    await h.controller.synchronize("remote");
    expect(h.state.local.progress.q.status).toBe("unclear");
    h.controller.dispose();
  });

  it("keeps edits made while an upload is in flight for the next synchronization", async () => {
    const h = harness({
      userId: "a",
      revision: 1,
      snapshot: emptyLearningSnapshot(),
    });
    h.state.local.progress.first = progress;
    let resolve!: (value: RemoteLearning) => void;
    let started!: () => void;
    const uploading = new Promise<void>((done) => {
      started = done;
    });
    h.writeRemote.mockImplementationOnce(async (remote, snapshot) => {
      started();
      return new Promise<RemoteLearning>((done) => {
        resolve = () =>
          done({ userId: "a", revision: remote.revision + 1, snapshot });
      });
    });
    const request = h.controller.synchronize();
    await uploading;
    h.state.local = {
      ...h.state.local,
      progress: { ...h.state.local.progress, later: progress },
    };
    resolve(h.state.remote);
    await request;
    expect(Object.keys(h.state.local.progress).sort()).toEqual([
      "first",
      "later",
    ]);
    h.controller.dispose();
  });

  it("debounces updates, retries a network failure and stops timers on disposal", async () => {
    vi.useFakeTimers();
    const h = harness({
      userId: "a",
      revision: 1,
      snapshot: emptyLearningSnapshot(),
    });
    h.controller.start();
    await vi.advanceTimersByTimeAsync(0);
    h.state.local.progress.q = progress;
    h.state.fail = true;
    h.state.changed();
    await vi.advanceTimersByTimeAsync(1500);
    expect(h.controller.getSnapshot().phase).toBe("error");
    expect(h.state.local.progress.q).toEqual(progress);
    h.state.fail = false;
    await vi.advanceTimersByTimeAsync(5000);
    expect(h.controller.getSnapshot().phase).toBe("ready");
    expect(h.state.remote.snapshot.progress.q).toEqual(progress);
    h.controller.dispose();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not apply an old account's delayed response after disposal", async () => {
    const h = harness();
    let resolve!: (value: RemoteLearning) => void;
    h.readRemote.mockImplementationOnce(
      () =>
        new Promise<RemoteLearning>((done) => {
          resolve = done;
        }),
    );
    const request = h.controller.synchronize("local", true);
    h.state.current = false;
    h.controller.dispose();
    resolve({ userId: "a", revision: 1, snapshot: emptyLearningSnapshot() });
    await request;
    expect(h.applyLocal).not.toHaveBeenCalled();
    expect(h.writeRemote).not.toHaveBeenCalled();
  });
});
