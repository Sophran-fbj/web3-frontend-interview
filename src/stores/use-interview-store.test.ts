import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { remainingSeconds, selectInterviewQuestions } from "@/lib/interviews";
import { useInterviewStore } from "@/stores/use-interview-store";

const input = {
  source: "filtered" as const,
  sourceId: null,
  sourceLabel: "题库",
  secondsPerQuestion: 60,
  questions: [
    { id: "one", title: "题目一" },
    { id: "two", title: "题目二" },
  ],
};

describe("local interview sessions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-10T00:00:00Z"));
    localStorage.clear();
    useInterviewStore.setState({ sessions: {}, hasHydrated: true });
  });
  afterEach(() => vi.useRealTimers());

  it("locks submitted answers, enforces ordering and restores a completed self-assessment", async () => {
    const store = useInterviewStore.getState();
    const id = store.createSession(input)!;
    store.advanceQuestion(id);
    expect(useInterviewStore.getState().sessions[id].currentIndex).toBe(0);
    store.startQuestion(id);
    store.saveDraft(id, "自己的回答");
    vi.advanceTimersByTime(15000);
    store.submitQuestion(id);
    store.saveDraft(id, "不能覆盖已提交答案");
    expect(useInterviewStore.getState().sessions[id].items[0]).toMatchObject({
      text: "自己的回答",
      elapsedSeconds: 15,
      timedOut: false,
    });
    store.advanceQuestion(id);
    store.submitQuestion(id, true);
    store.advanceQuestion(id);
    store.completeSession(id);
    expect(useInterviewStore.getState().sessions[id].status).toBe("reviewing");
    store.assessQuestion(id, "one", "mastered");
    store.completeSession(id);
    const session = useInterviewStore.getState().sessions[id];
    expect(session.status).toBe("completed");
    expect(session.items[1].skipped).toBe(true);
    expect(session.completedAt).toBeTruthy();

    const snapshot = localStorage.getItem("web3-interview-sessions")!;
    expect(JSON.parse(snapshot).version).toBe(1);
    useInterviewStore.setState({ sessions: {} });
    localStorage.setItem("web3-interview-sessions", snapshot);
    await useInterviewStore.persist.rehydrate();
    expect(useInterviewStore.getState().sessions[id]).toEqual(session);
    store.deleteSession(id);
    expect(useInterviewStore.getState().sessions[id]).toBeUndefined();
  });

  it("uses the original deadline after absence and prevents late edits or repeated submissions", () => {
    const store = useInterviewStore.getState();
    const id = store.createSession(input)!;
    store.startQuestion(id);
    store.saveDraft(id, "截止前的草稿");
    const start = useInterviewStore.getState().sessions[id].items[0].startedAt!;
    vi.setSystemTime(new Date("2026-11-10T00:02:00Z"));
    expect(remainingSeconds(start, 60, Date.now())).toBe(0);
    store.startQuestion(id);
    store.saveDraft(id, "截止后的修改");
    store.submitQuestion(id);
    const submitted = useInterviewStore.getState().sessions[id].items[0];
    expect(submitted).toMatchObject({
      text: "截止前的草稿",
      startedAt: start,
      timedOut: true,
      elapsedSeconds: 60,
    });
    vi.advanceTimersByTime(5000);
    store.submitQuestion(id);
    expect(useInterviewStore.getState().sessions[id].items[0]).toEqual(
      submitted,
    );
  });

  it("rejects invalid sessions and preserves valid records during hydration", async () => {
    const store = useInterviewStore.getState();
    expect(store.createSession({ ...input, questions: [] })).toBeUndefined();
    expect(
      store.createSession({
        ...input,
        questions: [input.questions[0], input.questions[0]],
      }),
    ).toBeUndefined();
    const id = store.createSession(input)!;
    const session = useInterviewStore.getState().sessions[id];
    localStorage.setItem(
      "web3-interview-sessions",
      JSON.stringify({
        version: 1,
        state: { sessions: { [id]: session, bad: { currentIndex: 999 } } },
      }),
    );
    await useInterviewStore.persist.rehydrate();
    expect(Object.keys(useInterviewStore.getState().sessions)).toEqual([id]);
  });

  it("samples without repetition, preserves study-set order and leaves the source untouched", () => {
    const candidates = ["a", "b", "c", "d"];
    const picked = selectInterviewQuestions(candidates, 3, false, () => 0.25);
    expect(picked).toHaveLength(3);
    expect(new Set(picked).size).toBe(3);
    expect(selectInterviewQuestions(candidates, 2, true)).toEqual(["a", "b"]);
    expect(candidates).toEqual(["a", "b", "c", "d"]);
  });
});
