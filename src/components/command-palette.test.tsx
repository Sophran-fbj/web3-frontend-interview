import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CommandPalette } from "@/components/command-palette";
import { useProgressStore } from "@/stores/use-progress-store";

const mocks = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

describe("CommandPalette", () => {
  beforeEach(() => {
    mocks.push.mockReset();
    act(() => {
      useProgressStore.setState({ hasHydrated: true, progress: {} });
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json([
        {
          id: "wallet-001",
          slug: "eip-1193-provider",
          title: "什么是 EIP-1193 Provider？",
          summary: "理解标准以太坊钱包注入接口。",
          category: "wallet",
          difficulty: "beginner",
          questionType: "concept",
          stacks: ["viem"],
        },
      ]),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens with Ctrl+K, searches questions, navigates on click, and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />);

    await user.keyboard("{Control>}k{/Control}");
    expect(
      screen.getByRole("dialog", { name: "全局搜索与快捷导航" }),
    ).toBeInTheDocument();

    const input = screen.getByLabelText("搜索题目与快捷操作");
    await user.type(input, "EIP-1193");

    const item = await screen.findByRole("button", {
      name: /什么是 EIP-1193 Provider/,
    });
    await user.click(item);

    expect(mocks.push).toHaveBeenCalledWith("/questions/eip-1193-provider");
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />);

    await user.click(
      screen.getByRole("button", { name: "快速搜索与命令面板" }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
