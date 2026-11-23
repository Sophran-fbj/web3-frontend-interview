import Link from "next/link";

import { HomeProgressBanner } from "@/components/home-progress-banner";
import { StrokeHeading } from "@/components/stroke-heading";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import {
  categoryLabels,
  questionOverviewGroups,
} from "@/content/question-config";
import { getVisibleQuestions } from "@/content/question-repository";

const highlights = [
  {
    index: "01",
    title: "结构化作答维度",
    description:
      "先隐去答案口述思路，再按 30 秒简答、深入分析、常见错误、追问与分级评分逐层复盘。",
  },
  {
    index: "02",
    title: "明确技术版本边界",
    description:
      "聚焦 DApp 钱包、签名、交易、合约交互与安全，标注 wagmi / viem / ethers 版本与官方来源。",
  },
  {
    index: "03",
    title: "本地优先练习闭环",
    description:
      "无需登录即可标记掌握度、整理错题复习、编排自定义题单并开展逐题计时模拟面试。",
  },
] as const;

export default async function Home() {
  const questions = await getVisibleQuestions();

  const categoryCounts = new Map<string, number>();
  for (const { frontmatter } of questions) {
    categoryCounts.set(
      frontmatter.category,
      (categoryCounts.get(frontmatter.category) ?? 0) + 1,
    );
  }

  const overview = questionOverviewGroups.map(({ label, categories }) => ({
    label,
    count: categories.reduce(
      (sum, category) => sum + (categoryCounts.get(category) ?? 0),
      0,
    ),
    items: categories
      .map((category) => ({
        category,
        label: categoryLabels[category],
        count: categoryCounts.get(category) ?? 0,
      }))
      .filter((item) => item.count > 0),
  }));

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 lg:py-20"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-14">
        <section>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--canvas-raised)] px-3.5 py-1.5 text-xs text-[var(--text-muted)] shadow-[inset_0_1px_0_var(--control-highlight)]">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-[var(--success)]"
            />
            <span className="font-mono tabular-nums">
              {questions.length > 0
                ? `${questions.length} 道真实场景题库 · 持续更新`
                : "中文 Web3 前端面试手册"}
            </span>
          </div>

          <h1
            aria-label="Web3 前端面试题库"
            className="max-w-4xl text-4xl leading-[1.08] font-semibold tracking-[-0.045em] text-[var(--text-strong)] sm:text-6xl"
          >
            <StrokeHeading />
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--text-muted)] sm:text-lg">
            围绕钱包连接、签名、交易、合约交互与链上安全整理。每题提供简答、深入分析、常见错误和分级评分标准，方便按主题查找与自测。
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
            <Link
              href="/questions"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--on-accent)] shadow-[0_12px_28px_-6px_var(--shadow)] transition-[background-color,transform] duration-150 hover:bg-[var(--accent-bright)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-bright)] active:scale-[0.985] motion-reduce:transform-none"
            >
              <span>
                {questions.length > 0
                  ? `浏览 ${questions.length} 道题目`
                  : "查看题库"}
              </span>
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="size-4 shrink-0"
              >
                <path
                  d="M3.5 8h9m-3.5-3.5L12.5 8 9 11.5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                />
              </svg>
            </Link>
            <Link href="/interview" className="study-button">
              模拟面试
            </Link>
            <Link
              href="/contribute"
              className="ml-1 text-sm text-[var(--text-muted)] underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              反馈与投稿
            </Link>
          </div>
        </section>

        <SpotlightCard className="p-5 sm:p-6">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3.5">
            <h2 className="text-sm font-semibold text-[var(--text-strong)]">
              按知识域进入练习
            </h2>
            <Link
              href="/questions"
              className="font-mono text-xs text-[var(--accent-bright)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              全部 →
            </Link>
          </div>
          <div className="divide-y divide-[var(--line)]">
            {overview.map(({ label, count, items }) => (
              <div key={label} className="py-4 first:pt-4 last:pb-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--text-strong)]">
                    {label}
                  </span>
                  <span className="font-mono text-xs text-[var(--text-faint)] tabular-nums">
                    {count} 题
                  </span>
                </div>
                {items.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {items.map((item) => (
                      <Link
                        key={item.category}
                        href={`/questions?category=${item.category}`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--surface)]/80 px-2.5 py-1 text-xs text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                      >
                        <span>{item.label}</span>
                        <span className="font-mono text-[11px] text-[var(--text-faint)] tabular-nums">
                          {item.count}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SpotlightCard>
      </div>

      <HomeProgressBanner totalQuestions={questions.length} />

      <section
        aria-label="题库特点"
        className="mt-12 grid gap-4 md:grid-cols-3"
      >
        {highlights.map((item) => (
          <SpotlightCard key={item.index} className="p-5 sm:p-6">
            <span className="font-mono text-xs font-medium text-[var(--accent-bright)]">
              {item.index}
            </span>
            <h2 className="mt-2.5 text-base font-semibold text-[var(--text-strong)]">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              {item.description}
            </p>
          </SpotlightCard>
        ))}
      </section>
    </main>
  );
}
