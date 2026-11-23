import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  data: { user: { id: "a" } } as { user: { id: string } } | null,
  isPending: false,
  error: null as Error | null,
}));
vi.mock("@/lib/auth-client", () => ({
  authClient: { useSession: () => auth },
}));

import {
  LearningAccountProvider,
  useAccountLearning,
} from "@/components/learning-account-provider";
import { switchLearningOwner } from "@/lib/learning-local";
import { emptyLearningSnapshot } from "@/lib/learning-snapshot";
import { useProgressStore } from "@/stores/use-progress-store";

function LearningView() {
  const { owner, ready } = useAccountLearning();
  const progress = useProgressStore((state) => state.progress);
  if (!ready) return <p>正在读取学习记录…</p>;
  return (
    <p>
      当前数据：{owner ?? "游客"}，{Object.keys(progress).join("、")}
    </p>
  );
}

describe("learning account lifecycle", () => {
  beforeEach(() => {
    localStorage.clear();
    switchLearningOwner(null);
    auth.data = { user: { id: "a" } };
    auth.isPending = false;
    auth.error = null;
    useProgressStore.getState().setStatus("guest-only", "unclear");
    vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      Response.json({
        userId: auth.data?.user.id ?? "a",
        revision: 0,
        snapshot: emptyLearningSnapshot(),
      }),
    );
  });
  afterEach(() => vi.restoreAllMocks());

  it("switches two users without exposing their data and restores the original guest records on logout", async () => {
    const view = render(
      <LearningAccountProvider enabled>
        <LearningView />
      </LearningAccountProvider>,
    );
    await screen.findByText("当前数据：a，");
    act(() => useProgressStore.getState().setStatus("only-a", "mastered"));
    act(() => {
      auth.data = { user: { id: "b" } };
    });
    view.rerender(
      <LearningAccountProvider enabled>
        <LearningView />
      </LearningAccountProvider>,
    );
    await screen.findByText("当前数据：b，");
    expect(screen.queryByText(/only-a/)).not.toBeInTheDocument();
    act(() => {
      auth.data = { user: { id: "a" } };
    });
    view.rerender(
      <LearningAccountProvider enabled>
        <LearningView />
      </LearningAccountProvider>,
    );
    await screen.findByText("当前数据：a，only-a");
    act(() => {
      auth.data = null;
    });
    view.rerender(
      <LearningAccountProvider enabled>
        <LearningView />
      </LearningAccountProvider>,
    );
    await screen.findByText("当前数据：游客，guest-only");
    expect(
      vi
        .mocked(fetch)
        .mock.calls.every(([, options]) => options?.method !== "POST"),
    ).toBe(true);
  });

  it("allows guest learning when the initial session request fails", async () => {
    auth.data = null;
    auth.error = new Error("offline");
    render(
      <LearningAccountProvider enabled>
        <LearningView />
      </LearningAccountProvider>,
    );
    await screen.findByText("当前数据：游客，guest-only");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("renders public content immediately while keeping learning controls gated during unresolved session", async () => {
    auth.isPending = true;
    render(
      <LearningAccountProvider enabled>
        <div>公开题库内容</div>
        <LearningView />
      </LearningAccountProvider>,
    );
    expect(screen.getByText("公开题库内容")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("正在读取学习记录…")).toBeInTheDocument(),
    );
    expect(screen.queryByText(/当前数据/)).not.toBeInTheDocument();
  });
});
