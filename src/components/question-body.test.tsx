import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { QuestionBody } from "@/components/question-body";

describe("QuestionBody", () => {
  it("renders GFM tables inside a scrollable table wrapper", async () => {
    const source = [
      "| 方式 | 特点 |",
      "| --- | --- |",
      "| RPC | 实时读状态 |",
    ].join("\n");

    const { container } = render(await QuestionBody({ source }));

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
    expect(table.parentElement).toHaveClass("table-scroll");
    expect(container.querySelectorAll("thead th").length).toBe(2);
  });

  it("highlights fenced code blocks with Shiki and provides copy feedback", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    const source = ["```ts", "const chainId: number = 1;", "```"].join("\n");
    const { container } = render(await QuestionBody({ source }));

    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    const pre = container.querySelector("pre.shiki");
    expect(pre).toBeInTheDocument();
    expect(pre?.querySelectorAll("span").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "复制代码" }));

    expect(writeText).toHaveBeenCalledWith("const chainId: number = 1;");
    expect(screen.getByText("已复制")).toBeInTheDocument();
  });
});
