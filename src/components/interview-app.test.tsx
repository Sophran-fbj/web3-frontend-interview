import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InterviewApp } from "@/components/interview-app";
import type { QuestionSummary } from "@/content/question-summary";
import { useBookmarkStore } from "@/stores/use-bookmark-store";
import { useInterviewStore } from "@/stores/use-interview-store";
import { useProgressStore } from "@/stores/use-progress-store";
import { useStudySetStore } from "@/stores/use-study-set-store";

const mocks = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));

const questions: QuestionSummary[] = ["one", "two"].map((id) => ({
  id,
  slug: id,
  title: `题目 ${id}`,
  summary: "摘要",
  category: "wallet",
  difficulty: "intermediate",
  questionType: "scenario",
}));
const content = {
  id: "one",
  prompt: <p>本题的完整问题</p>,
  answer: <p>本题的完整参考答案和评分标准</p>,
};

describe("interview flow", () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.push.mockReset();
    act(() => {
      useInterviewStore.setState({ sessions: {}, hasHydrated: true });
      useProgressStore.setState({ hasHydrated: true, progress: {} });
      useBookmarkStore.setState({ hasHydrated: true, bookmarks: {} });
      useStudySetStore.setState({ hasHydrated: true, studySets: {} });
    });
  });
  afterEach(() => vi.useRealTimers());

  it("restores a timed answer, hides references until the end, and applies self-assessment only on request", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    vi.setSystemTime(new Date("2026-11-10T00:00:00Z"));
    const user = userEvent.setup();
    let id = "";
    act(() => {
      id = useInterviewStore.getState().createSession({
        source: "filtered",
        sourceId: null,
        sourceLabel: "题库",
        secondsPerQuestion: 60,
        questions: [questions[0]],
      })!;
    });
    const props = {
      questions,
      sessionId: id,
      requestedQuestionId: "one",
      content,
    };
    const view = render(<InterviewApp {...props} />);
    expect(screen.queryByText("本题的完整问题")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "开始本题" }));
    await user.type(
      screen.getByRole("textbox", { name: /你的回答/ }),
      "我先解释钱包连接",
    );
    expect(
      screen.queryByText("本题的完整参考答案和评分标准"),
    ).not.toBeInTheDocument();
    view.unmount();

    const snapshot = localStorage.getItem("web3-interview-sessions")!;
    act(() => useInterviewStore.setState({ sessions: {}, hasHydrated: false }));
    localStorage.setItem("web3-interview-sessions", snapshot);
    vi.setSystemTime(new Date("2026-11-10T00:01:01Z"));
    await act(async () => {
      await useInterviewStore.persist.rehydrate();
    });
    render(<InterviewApp {...props} />);
    expect(screen.getByRole("textbox", { name: /你的回答/ })).toHaveValue(
      "我先解释钱包连接",
    );
    expect(screen.getByRole("textbox", { name: /你的回答/ })).toBeDisabled();
    act(() => vi.advanceTimersByTime(250));
    expect(
      screen.getByText(/时间到，已保存回答并停止编辑/),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "结束作答，开始自评" }),
    );
    expect(
      screen.getByText("本题的完整参考答案和评分标准"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "已掌握" }));
    await user.click(screen.getByRole("button", { name: "完成本轮自评" }));
    expect(useProgressStore.getState().progress.one).toBeUndefined();
    await user.click(
      screen.getByRole("button", { name: "将本轮自评更新到学习状态" }),
    );
    expect(useProgressStore.getState().progress.one.status).toBe("mastered");
    expect(useInterviewStore.getState().sessions[id].status).toBe("completed");
  });

  it("uses available study-set questions in their saved order", async () => {
    const user = userEvent.setup();
    let setId = "";
    act(() => {
      const store = useStudySetStore.getState();
      setId = store.createStudySet("按顺序复习")!;
      store.addQuestion(setId, "two");
      store.addQuestion(setId, "unavailable");
      store.addQuestion(setId, "one");
    });
    render(
      <InterviewApp
        questions={questions}
        initialStudySetId={setId}
        content={null}
      />,
    );
    expect(screen.getByText(/本轮练习 2 道/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "开始一轮面试" }));
    const session = Object.values(useInterviewStore.getState().sessions)[0];
    expect(session.items.map((item) => item.questionId)).toEqual([
      "two",
      "one",
    ]);
    expect(session.sourceId).toBe(setId);
    expect(mocks.push).toHaveBeenCalledWith(
      expect.stringContaining(`session=${session.id}`),
    );
  });

  it("does not recreate or overwrite a missing local session", () => {
    render(
      <InterviewApp
        questions={questions}
        sessionId="not-on-this-device"
        requestedQuestionId="one"
        content={content}
      />,
    );
    expect(
      screen.getByText(/当前浏览器中没有这条练习记录/),
    ).toBeInTheDocument();
    expect(Object.keys(useInterviewStore.getState().sessions)).toHaveLength(0);
  });
});
