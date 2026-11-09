import { beforeEach, describe, expect, it } from "vitest";

import { useStudySetStore } from "@/stores/use-study-set-store";

describe("local study sets", () => {
  beforeEach(() => {
    localStorage.clear();
    useStudySetStore.setState({ studySets: {}, hasHydrated: true });
  });

  it("preserves identity, order and metadata across edits and hydration", async () => {
    const store = useStudySetStore.getState();
    const id = store.createStudySet("  交易冲刺  ")!;
    const createdAt = useStudySetStore.getState().studySets[id].createdAt;
    store.addQuestion(id, "a");
    store.addQuestion(id, "b");
    store.addQuestion(id, "a");
    store.moveQuestion(id, "b", -1);
    store.moveQuestion(id, "b", -1);
    store.updateMetadata(id, "交易复习", "按顺序练习");
    expect(useStudySetStore.getState().studySets[id]).toMatchObject({
      id,
      name: "交易复习",
      description: "按顺序练习",
      createdAt,
      questionIds: ["b", "a"],
    });
    expect(store.updateMetadata(id, " ", "")).toBe(false);
    expect(store.createStudySet(" ")).toBeUndefined();

    const snapshot = localStorage.getItem("web3-interview-study-sets")!;
    expect(JSON.parse(snapshot).version).toBe(1);
    useStudySetStore.setState({ studySets: {} });
    localStorage.setItem("web3-interview-study-sets", snapshot);
    await useStudySetStore.persist.rehydrate();
    expect(useStudySetStore.getState().studySets[id].questionIds).toEqual([
      "b",
      "a",
    ]);
    store.removeQuestion(id, "b");
    expect(useStudySetStore.getState().studySets[id].questionIds).toEqual([
      "a",
    ]);
    store.deleteStudySet(id);
    expect(useStudySetStore.getState().studySets[id]).toBeUndefined();
  });

  it("keeps valid records when another persisted record is malformed", async () => {
    const id = useStudySetStore.getState().createStudySet("有效题单")!;
    const valid = useStudySetStore.getState().studySets[id];
    localStorage.setItem(
      "web3-interview-study-sets",
      JSON.stringify({
        version: 1,
        state: { studySets: { [id]: valid, broken: { name: "缺少字段" } } },
      }),
    );
    await useStudySetStore.persist.rehydrate();
    expect(Object.keys(useStudySetStore.getState().studySets)).toEqual([id]);
  });
});
