import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AdjacentQuestionNav,
  BackToQuestionsLink,
} from "./question-detail-nav";

const searchParams: URLSearchParams[] = [];

vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams.at(-1) ?? new URLSearchParams(),
}));

function renderWithParams(query: string) {
  searchParams.push(new URLSearchParams(query));
  return render(<BackToQuestionsLink />);
}

beforeEach(() => {
  searchParams.length = 0;
});

describe("BackToQuestionsLink", () => {
  it("返回题库时保留回程参数中的搜索词和页码", () => {
    renderWithParams("back=q%3D%E9%92%B1%E5%8C%85%26page%3D2");

    expect(screen.getByRole("link", { name: "返回题库" })).toHaveAttribute(
      "href",
      "/questions?q=%E9%92%B1%E5%8C%85&page=2",
    );
  });

  it("直接打开旧链接时回到默认题库列表", () => {
    renderWithParams("");

    expect(screen.getByRole("link", { name: "返回题库" })).toHaveAttribute(
      "href",
      "/questions",
    );
  });
});

describe("AdjacentQuestionNav", () => {
  it("上一题/下一题链接携带回程参数", () => {
    searchParams.push(
      new URLSearchParams("back=difficulty%3Dbasic%26page%3D2"),
    );
    render(
      <AdjacentQuestionNav
        previous={{ slug: "prev-question", title: "上一道题" }}
        next={{ slug: "next-question", title: "下一道题" }}
      />,
    );

    expect(screen.getByRole("link", { name: /上一道题/ })).toHaveAttribute(
      "href",
      "/questions/prev-question?back=difficulty%3Dbasic%26page%3D2",
    );
    expect(screen.getByRole("link", { name: /下一道题/ })).toHaveAttribute(
      "href",
      "/questions/next-question?back=difficulty%3Dbasic%26page%3D2",
    );
  });

  it("无回程参数时上一题/下一题保持原始链接", () => {
    render(
      <AdjacentQuestionNav
        previous={{ slug: "prev-question", title: "上一道题" }}
        next={null}
      />,
    );

    expect(screen.getByRole("link", { name: /上一道题/ })).toHaveAttribute(
      "href",
      "/questions/prev-question",
    );
    expect(screen.getByText("当前为最后一题")).toBeInTheDocument();
  });
});
