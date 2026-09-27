import { describe, expect, it } from "vitest";

import { correctionIssueLink } from "./contribution-links";

describe("correctionIssueLink", () => {
  it("prefills the issue form with the current question", () => {
    const url = new URL(
      correctionIssueLink("钱包签名（/questions/wallet-signing）"),
    );

    expect(url.pathname).toBe(
      "/Sophran-fbj/web3-frontend-interview/issues/new",
    );
    expect(url.searchParams.get("template")).toBe("content-correction.yml");
    expect(url.searchParams.get("question")).toBe(
      "钱包签名（/questions/wallet-signing）",
    );
  });
});
