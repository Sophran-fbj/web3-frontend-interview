import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RandomQuestionButton } from "./random-question-button";

const mocks = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

const candidates = [
  { id: "wallet-001", slug: "wallet-one" },
  { id: "wallet-002", slug: "wallet-two" },
];

describe("RandomQuestionButton", () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.push.mockClear();
    vi.restoreAllMocks();
  });

  it("stores the selection and opens its detail page", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const user = userEvent.setup();
    render(<RandomQuestionButton candidates={candidates} />);

    await user.click(screen.getByRole("button", { name: "随机抽一题" }));

    expect(localStorage.getItem("web3-interview-last-random-question")).toBe(
      "wallet-001",
    );
    expect(mocks.push).toHaveBeenCalledWith("/questions/wallet-one");
  });

  it("still navigates when local storage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    vi.spyOn(Math, "random").mockReturnValue(0.999);
    const user = userEvent.setup();
    render(<RandomQuestionButton candidates={candidates} />);

    await user.click(screen.getByRole("button", { name: "随机抽一题" }));

    expect(mocks.push).toHaveBeenCalledWith("/questions/wallet-two");
  });
});
