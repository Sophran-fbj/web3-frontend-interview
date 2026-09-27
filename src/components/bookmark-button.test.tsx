import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { useBookmarkStore } from "@/stores/use-bookmark-store";

import { BookmarkButton } from "./bookmark-button";
import { BookmarkList } from "./bookmark-list";

describe("local bookmarks", () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      useBookmarkStore.setState({ bookmarks: {}, hasHydrated: true });
    });
  });

  it("saves and removes a bookmark by stable question id", async () => {
    const user = userEvent.setup();
    render(<BookmarkButton questionId="wallet-003" />);

    await user.click(screen.getByRole("button", { name: "收藏题目" }));
    expect(screen.getByRole("button", { name: "取消收藏" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    const persisted = JSON.parse(
      localStorage.getItem("web3-interview-bookmarks") ?? "{}",
    );
    expect(persisted.version).toBe(1);
    expect(persisted.state.bookmarks["wallet-003"].createdAt).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "取消收藏" }));
    expect(useBookmarkStore.getState().bookmarks["wallet-003"]).toBeUndefined();
  });

  it("shows only saved questions and updates the list when removed", async () => {
    const user = userEvent.setup();
    act(() => {
      useBookmarkStore.setState({
        bookmarks: { "wallet-003": { createdAt: "2026-09-28T00:00:00.000Z" } },
      });
    });
    render(
      <BookmarkList
        questions={[
          {
            id: "wallet-003",
            slug: "wallet-three",
            title: "钱包题",
            summary: "钱包摘要",
          },
          {
            id: "wallet-004",
            slug: "wallet-four",
            title: "另一题",
            summary: "另一摘要",
          },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "钱包题" })).toHaveAttribute(
      "href",
      "/questions/wallet-three",
    );
    expect(screen.queryByText("另一题")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "取消收藏" }));
    expect(screen.getByText("还没有收藏的题目")).toBeInTheDocument();
  });
});
