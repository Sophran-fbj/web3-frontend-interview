import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { useProgressStore } from "@/stores/use-progress-store";

import { LearningStatusControl } from "./learning-status-control";

describe("LearningStatusControl", () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      useProgressStore.setState({ progress: {}, hasHydrated: true });
    });
  });

  it("stores the selected status in local storage", async () => {
    const user = userEvent.setup();
    render(<LearningStatusControl questionId="wallet-003" />);

    await user.click(screen.getByRole("button", { name: "已掌握" }));
    await user.click(screen.getByRole("button", { name: "已掌握" }));

    expect(screen.getByRole("button", { name: "已掌握" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    const persisted = JSON.parse(
      localStorage.getItem("web3-interview-progress") ?? "{}",
    );
    expect(persisted.state.progress["wallet-003"].status).toBe("mastered");
    expect(persisted.state.progress["wallet-003"].reviewCount).toBe(1);
  });

  it("removes the local record when reset to unseen", async () => {
    const user = userEvent.setup();
    render(<LearningStatusControl questionId="wallet-003" />);

    await user.click(screen.getByRole("button", { name: "待复习" }));
    await user.click(screen.getByRole("button", { name: "未标记" }));

    expect(useProgressStore.getState().progress["wallet-003"]).toBeUndefined();
  });
});
