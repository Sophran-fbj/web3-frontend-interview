import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { QuestionFilterMenu } from "./question-filter-menu";

describe("QuestionFilterMenu", () => {
  it("opens the options and exposes navigation URLs", async () => {
    const user = userEvent.setup();

    render(
      <QuestionFilterMenu
        label="难度"
        value="beginner"
        allLabel="全部难度"
        allHref="/questions"
        options={[
          {
            value: "beginner",
            label: "初级",
            href: "/questions?difficulty=beginner",
          },
        ]}
      />,
    );

    const trigger = screen.getByRole("button", { name: "难度：初级" });
    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "初级" })).toHaveAttribute(
      "href",
      "/questions?difficulty=beginner",
    );

    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });
});
