import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { AddToStudySetButton } from "@/components/add-to-study-set-button";
import { useStudySetStore } from "@/stores/use-study-set-store";

describe("AddToStudySetButton", () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      useStudySetStore.setState({ studySets: {}, hasHydrated: true });
    });
  });

  it("toggles membership in existing sets and creates a new set inline", async () => {
    let existingId = "";
    act(() => {
      existingId = useStudySetStore.getState().createStudySet("高频交易题")!;
    });

    const user = userEvent.setup();
    render(<AddToStudySetButton questionId="tx-001" />);

    await user.click(screen.getByRole("button", { name: "加入题单" }));
    await user.click(screen.getByRole("button", { name: /高频交易题/ }));

    expect(
      useStudySetStore.getState().studySets[existingId].questionIds,
    ).toEqual(["tx-001"]);

    await user.type(screen.getByLabelText("新建题单名称"), "冲刺复盘");
    await user.click(screen.getByRole("button", { name: "新建" }));

    const sets = Object.values(useStudySetStore.getState().studySets);
    expect(sets).toHaveLength(2);
    expect(sets.find((s) => s.name === "冲刺复盘")?.questionIds).toEqual([
      "tx-001",
    ]);
  });
});
