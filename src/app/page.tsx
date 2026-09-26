import Link from "next/link";

import { getVisibleQuestions } from "@/content/question-repository";

export default async function Home() {
  const questions = await getVisibleQuestions();
  const countByCategory = (categories: string[]) =>
    questions.filter(({ frontmatter }) =>
      categories.includes(frontmatter.category),
    ).length;
  const overview = [
    ["钱包与连接", countByCategory(["wallet"])],
    ["签名与交易", countByCategory(["signing", "transaction"])],
    ["合约与链上数据", countByCategory(["contract", "data"])],
    ["Web3 基础", countByCategory(["web3-basics"])],
  ] as const;

  return (
    <main
      id="main-content"
      className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-16 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:py-24"
    >
      <section>
        <p className="mb-6 font-mono text-sm text-[var(--accent-bright)]">
          Web3 Frontend Interview
        </p>
        <h1 className="max-w-4xl text-4xl leading-[1.08] font-semibold tracking-[-0.045em] text-[var(--text-strong)] sm:text-6xl">
          不是背答案，是真正理解 Web3 前端。
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--text-muted)]">
          面向候选人的中文专项题库。聚焦钱包、签名、交易、合约交互、安全与工程化，给出可以继续追问的答案，而不只是一句结论。
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-5">
          <Link
            href="/questions"
            className="inline-flex min-h-11 items-center bg-[var(--accent)] px-5 text-sm font-semibold text-white hover:bg-[var(--accent-bright)] hover:text-[var(--canvas)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-bright)]"
          >
            {questions.length > 0
              ? `浏览 ${questions.length} 道题目`
              : "查看题库"}
          </Link>
          <span className="text-sm text-[var(--text-faint)]">
            首批目标 100 道
          </span>
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
