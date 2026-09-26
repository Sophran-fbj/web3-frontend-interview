import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it } from "vitest";

import { ThemeSwitcher } from "./theme-switcher";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.dataset.theme = "graphite";
});

it("selects a theme from its own sector and persists it", async () => {
  const user = userEvent.setup();
  const { container } = render(<ThemeSwitcher />);

  await user.click(screen.getByRole("button", { name: "切换为冷白主题" }));

  expect(document.documentElement.dataset.theme).toBe("cold-white");
  expect(localStorage.getItem("web3-interview-theme")).toBe("cold-white");
  expect(
    screen.getByRole("button", { name: "切换为冷白主题" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    container.querySelector('[data-theme-sector="cold-white"]'),
  ).toHaveAttribute("stroke", "#4169e1");
});
