import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it } from "vitest";

import { ThemeSwitcher } from "./theme-switcher";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.dataset.theme = "graphite";
});

it("cycles themes and persists the selected theme", async () => {
  const user = userEvent.setup();
  render(<ThemeSwitcher />);

  await user.click(
    screen.getByRole("button", { name: "切换主题，当前为石墨" }),
  );

  expect(document.documentElement.dataset.theme).toBe("warm-sand");
  expect(localStorage.getItem("web3-interview-theme")).toBe("warm-sand");
  expect(
    screen.getByRole("button", { name: "切换主题，当前为暖砂" }),
  ).toBeInTheDocument();
});
