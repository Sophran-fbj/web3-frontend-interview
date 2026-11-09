import { beforeEach, describe, expect, it } from "vitest";

import {
  currentLearningOwner,
  getLearningSnapshot,
  readStoredLearning,
  saveLearningCache,
  switchLearningOwner,
} from "@/lib/learning-local";
import { emptyLearningSnapshot } from "@/lib/learning-snapshot";
import { useProgressStore } from "@/stores/use-progress-store";

describe("account-scoped browser data", () => {
  beforeEach(() => {
    localStorage.clear();
    switchLearningOwner(null);
  });

  it("keeps guest and two accounts separate and restores each scope on switching", () => {
    useProgressStore.getState().setStatus("guest-question", "unclear");
    const original = localStorage.getItem("web3-interview-progress");
    switchLearningOwner("a");
    expect(getLearningSnapshot().progress).toEqual({});
    useProgressStore.getState().setStatus("a-question", "mastered");
    switchLearningOwner("b");
    expect(getLearningSnapshot().progress).toEqual({});
    useProgressStore.getState().setStatus("b-question", "review");
    switchLearningOwner("a");
    expect(Object.keys(getLearningSnapshot().progress)).toEqual(["a-question"]);
    switchLearningOwner(null);
    expect(Object.keys(getLearningSnapshot().progress)).toEqual([
      "guest-question",
    ]);
    expect(localStorage.getItem("web3-interview-progress")).toBe(original);
  });

  it("preserves offline edits newer than the last successful synchronization cache", () => {
    switchLearningOwner("a");
    const base = {
      userId: "a",
      revision: 1,
      snapshot: emptyLearningSnapshot(),
    };
    saveLearningCache(base, emptyLearningSnapshot());
    useProgressStore.getState().setStatus("offline-question", "review");
    switchLearningOwner(null);
    switchLearningOwner("a");
    expect(getLearningSnapshot().progress["offline-question"].status).toBe(
      "review",
    );
    expect(readStoredLearning(null).progress).toEqual({});
  });

  it("refuses an unsupported cache version before changing the current scope", () => {
    useProgressStore.getState().setStatus("guest-question", "unclear");
    const unsupported = JSON.stringify({
      version: 99,
      state: { progress: {} },
    });
    localStorage.setItem("web3-interview-progress:user:a", unsupported);
    expect(() => switchLearningOwner("a")).toThrow();
    expect(currentLearningOwner()).toBeNull();
    expect(getLearningSnapshot().progress["guest-question"].status).toBe(
      "unclear",
    );
    expect(localStorage.getItem("web3-interview-progress:user:a")).toBe(
      unsupported,
    );
  });
});
