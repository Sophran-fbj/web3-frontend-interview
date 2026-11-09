import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { ReviewList } from "@/components/review-list";
import type { QuestionSummary } from "@/content/question-summary";
import { useProgressStore } from "@/stores/use-progress-store";

const questions: QuestionSummary[] = ["one", "two", "three"].map((id) => ({
  id,
  slug: id,
  title: `题目 ${id}`,
  summary: "摘要",
  category: "wallet",
  difficulty: "intermediate",
  questionType: "scenario",
}));

describe("review list", () => {
  beforeEach(() => {
    localStorage.clear();
    act(() =>
      useProgressStore.setState({
        hasHydrated: true,
        progress: {
          one: {
            status: "unclear",
            reviewCount: 1,
            updatedAt: "2026-11-01T00:00:00Z",
          },
          two: {
            status: "review",
            reviewCount: 1,
            updatedAt: "2026-11-02T00:00:00Z",
          },
          three: {
            status: "mastered",
            reviewCount: 1,
            updatedAt: "2026-11-03T00:00:00Z",
          },
          missing: {
            status: "unclear",
            reviewCount: 1,
            updatedAt: "2026-11-01T00:00:00Z",
          },
        },
      }),
    );
  });

  it("filters existing local progress and removes mastered questions immediately", async () => {
    const user = userEvent.setup();
    render(<ReviewList questions={questions} />);
    expect(screen.getByRole("link", { name: "开始复习" })).toHaveAttribute(
      "href",
      "/questions/one",
    );
    expect(screen.queryByText("题目 three")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "不清楚（错题本）" }));
    expect(screen.queryByText("题目 two")).not.toBeInTheDocument();
    const item = screen.getByRole("link", { name: "题目 one" }).closest("li")!;
    await user.click(within(item).getByRole("button", { name: "已掌握" }));
    expect(screen.queryByText("题目 one")).not.toBeInTheDocument();
    expect(useProgressStore.getState().progress.one.status).toBe("mastered");
    await user.click(screen.getByRole("button", { name: "待复习" }));
    expect(screen.getByText("题目 two")).toBeInTheDocument();
  });

  it("waits for persisted progress before showing an empty list", () => {
    act(() => useProgressStore.setState({ hasHydrated: false }));
    render(<ReviewList questions={questions} />);
    expect(screen.getByText("正在读取本地复习记录…")).toBeInTheDocument();
    expect(screen.queryByText("目前没有待复习的题目")).not.toBeInTheDocument();
  });
});
