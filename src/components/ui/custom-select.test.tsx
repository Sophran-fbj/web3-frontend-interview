import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CustomSelect } from "@/components/ui/custom-select";

const options = [
  { value: "", label: "全部" },
  { value: "beginner", label: "初级" },
  { value: "intermediate", label: "中级" },
];

describe("CustomSelect", () => {
  it("opens, navigates options with keyboard, selects an option, and closes on Escape", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <CustomSelect
        label="难度"
        value=""
        options={options}
        onChange={onChange}
      />,
    );

    const trigger = screen.getByLabelText("难度");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    trigger.focus();
    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith("beginner");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });
});
