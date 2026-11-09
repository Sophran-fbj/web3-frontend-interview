import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { StudySetManager } from "@/components/study-set-manager";
import type { QuestionSummary } from "@/content/question-summary";
import { useProgressStore } from "@/stores/use-progress-store";
import { useStudySetStore } from "@/stores/use-study-set-store";

const questions: QuestionSummary[] = ["one", "two"].map((id) => ({
  id,
  slug: id,
  title: `题目 ${id}`,
  summary: "摘要",
  category: "wallet",
  difficulty: "intermediate",
  questionType: "scenario",
}));

describe("study set manager", () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      useStudySetStore.setState({ studySets: {}, hasHydrated: true });
      useProgressStore.setState({
        hasHydrated: true,
        progress: {
          one: {
            status: "mastered",
            reviewCount: 1,
            updatedAt: "2026-11-01T00:00:00Z",
          },
        },
      });
    });
  });

  it("creates a set, selects questions, changes order and preserves progress on deletion", async () => {
    const user = userEvent.setup();
    render(<StudySetManager questions={questions} />);
    await user.type(screen.getByLabelText("新题单名称"), "钱包复习");
    await user.click(screen.getByRole("button", { name: "创建题单" }));
    await user.click(
      screen.getByRole("button", { name: "加入题单：题目 one" }),
    );
    await user.click(
      screen.getByRole("button", { name: "加入题单：题目 two" }),
    );
    expect(screen.getByText("已掌握 1 / 2 道")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "继续练习" })).toHaveAttribute(
      "href",
      "/questions/two",
    );
    await user.click(screen.getByRole("button", { name: "上移：题目 two" }));
    const list = screen.getByRole("list", { name: "题单中的题目" });
    expect(within(list).getAllByRole("link")[0]).toHaveTextContent("题目 two");
    await user.click(screen.getByRole("button", { name: "删除题单" }));
    await user.click(screen.getByRole("button", { name: "确认删除题单" }));
    expect(Object.keys(useStudySetStore.getState().studySets)).toHaveLength(0);
    expect(useProgressStore.getState().progress.one.status).toBe("mastered");
  });

  it("retains unavailable question references for explicit removal", () => {
    act(() => {
      const id = useStudySetStore.getState().createStudySet("旧题单")!;
      useStudySetStore.getState().addQuestion(id, "no-longer-public");
    });
    render(<StudySetManager questions={questions} />);
    expect(
      screen.getByText("暂不可用的题目（no-longer-public）"),
    ).toBeInTheDocument();
    expect(screen.getByText("已掌握 0 / 0 道")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "继续练习" }),
    ).not.toBeInTheDocument();
  });
});
