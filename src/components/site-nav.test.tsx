import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteNav } from "./site-nav";

const pathnames: string[] = [];

vi.mock("next/navigation", () => ({
  usePathname: () => pathnames.at(-1) ?? "/",
}));

function renderAt(pathname: string) {
  pathnames.push(pathname);
  return render(<SiteNav />);
}

beforeEach(() => {
  pathnames.length = 0;
});

describe("SiteNav", () => {
  it("暴露题库与模拟面试一级入口", () => {
    renderAt("/");

    expect(screen.getByRole("link", { name: "题库" })).toHaveAttribute(
      "href",
      "/questions",
    );
    expect(screen.getByRole("link", { name: "模拟面试" })).toHaveAttribute(
      "href",
      "/interview",
    );
  });

  it("键盘展开「我的学习」并可用 Esc 收起", async () => {
    const user = userEvent.setup();
    renderAt("/");

    const trigger = screen.getByRole("button", { name: "我的学习" });
    trigger.focus();
    await user.keyboard("{Enter}");

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "复习" })).toHaveAttribute(
      "href",
      "/review",
    );
    expect(screen.getByRole("link", { name: "我的收藏" })).toHaveAttribute(
      "href",
      "/bookmarks",
    );
    expect(screen.getByRole("link", { name: "题单" })).toHaveAttribute(
      "href",
      "/study-sets",
    );

    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("空格键也能展开菜单", async () => {
    const user = userEvent.setup();
    renderAt("/");

    const trigger = screen.getByRole("button", { name: "我的学习" });
    trigger.focus();
    await user.keyboard(" ");

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("位于 /questions 时「题库」为当前页", () => {
    renderAt("/questions/some-question");

    expect(screen.getByRole("link", { name: "题库" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("位于 /review 时子项在展开菜单中标记为当前页", async () => {
    const user = userEvent.setup();
    renderAt("/review");

    await user.click(screen.getByRole("button", { name: "我的学习" }));

    expect(screen.getByRole("link", { name: "复习" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "题库" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
