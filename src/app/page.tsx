import Link from "next/link";

import { StrokeHeading } from "@/components/stroke-heading";
import { getVisibleQuestions } from "@/content/question-repository";

export default async function Home() {
  const questions = await getVisibleQuestions();
  const countByCategory = (categories: string[]) =>
    questions.filter(({ frontmatter }) =>
      categories.includes(frontmatter.category),
    ).length;
  const overview = [
    ["钱包与签名", countByCategory(["wallet", "signing"])],
    ["交易与合约", countByCategory(["transaction", "contract"])],
    ["数据与安全", countByCategory(["data", "security"])],
    [
      "架构与体验",
      countByCategory([
        "web3-basics",
        "performance-ux",
        "architecture",
        "business-scenario",
      ]),
    ],
  ] as const;

  return (
    <main
      id="main-content"
      className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-16 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:py-24"
    >
      <section>
        <h1
          aria-label="Web3 前端面试题库"
          className="max-w-4xl text-4xl leading-[1.08] font-semibold tracking-[-0.045em] text-[var(--text-strong)] sm:text-6xl"
        >
          <StrokeHeading />
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--text-muted)]">
          围绕钱包连接、签名、交易和合约交互等工作场景整理。每题提供简答、深入分析、常见错误和参考资料，方便按主题查找和自测。
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-5">
          <Link
            href="/questions"
            className="inline-flex min-h-11 items-center rounded-lg bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--on-accent)] shadow-[0_10px_28px_var(--shadow)] hover:bg-[var(--accent-bright)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-bright)]"
          >
            {questions.length > 0
              ? `浏览 ${questions.length} 道题目`
              : "查看题库"}
          </Link>
        </div>
      </section>

      <aside className="border-y border-[var(--line-strong)] py-2">
        {overview.map(([label, count]) => (
          <div
            key={label}
            className="flex items-center justify-between border-b border-[var(--line)] py-4 last:border-b-0"
          >
            <span className="text-sm text-[var(--text-muted)]">{label}</span>
            <span className="font-mono text-xs text-[var(--text-faint)] tabular-nums">
              {count} 题
            </span>
          </div>
        ))}
      </aside>
    </main>
  );
}
