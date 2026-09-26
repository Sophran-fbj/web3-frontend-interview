import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { AutoSubmitSelect } from "./auto-submit-select";

it("submits its parent form after selecting an option", async () => {
  const handleSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  });
  const user = userEvent.setup();

  render(
    <form onSubmit={handleSubmit}>
      <AutoSubmitSelect
        label="难度"
        name="difficulty"
        allLabel="全部难度"
        options={[
          { value: "beginner", label: "入门" },
          { value: "advanced", label: "进阶" },
        ]}
      />
    </form>,
  );

  await user.selectOptions(
    screen.getByRole("combobox", { name: "难度" }),
    "advanced",
  );

  expect(handleSubmit).toHaveBeenCalledOnce();
});
