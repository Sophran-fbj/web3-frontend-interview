import type { Metadata } from "next";
import Link from "next/link";

import {
  categoryLabels,
  difficultyLabels,
  questionTypeLabels,
} from "@/content/question-labels";
import { getVisibleQuestions } from "@/content/question-repository";

export const metadata: Metadata = {
  title: "题库",
  description: "按主题浏览 Web3 前端面试题。",
};

export default async function QuestionsPage() {
  const questions = await getVisibleQuestions();

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20"
    >
      <header className="max-w-3xl border-l-2 border-[var(--accent)] pl-5 sm:pl-7">
        <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[var(--text-strong)] sm:text-5xl">
          Web3 前端题库
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-muted)] sm:text-lg">
          从单一知识点到完整业务场景。先尝试口述答案，再进入详情对照思路、常见错误和评分标准。
        </p>
      </header>

      <div className="mt-14 flex items-baseline justify-between border-b border-[var(--line-strong)] pb-4">
        <h2 className="text-base font-semibold text-[var(--text-strong)]">
          全部题目
        </h2>
        <p className="font-mono text-sm text-[var(--text-faint)] tabular-nums">
          共 {questions.length} 题
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="border-b border-[var(--line)] py-14">
          <p className="text-lg font-medium text-[var(--text-strong)]">
            题目正在完成最终校验
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
            通过人工确认的题目会在这里公开。当前可以先了解项目目标，稍后再回来查看。
          </p>
        </div>
      ) : (
        <ol className="divide-y divide-[var(--line)]">
          {questions.map(({ frontmatter }, index) => (
            <li key={frontmatter.id}>
              <Link
                href={`/questions/${frontmatter.slug}`}
                className="group grid gap-4 py-7 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] sm:grid-cols-[3.5rem_minmax(0,1fr)_11rem] sm:items-start sm:gap-5"
              >
                <span className="font-mono text-sm text-[var(--text-faint)] tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block text-lg leading-7 font-medium tracking-[-0.015em] text-[var(--text-strong)] group-hover:text-[var(--accent-bright)] sm:text-xl">
                    {frontmatter.title}
                  </span>
                  <span className="mt-2 block max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                    {frontmatter.summary}
                  </span>
                  <span className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-[var(--text-faint)]">
                    {frontmatter.tags.slice(0, 4).map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </span>
                </span>
                <span className="flex gap-3 text-sm sm:flex-col sm:items-end sm:gap-1">
                  <span className="font-medium text-[var(--accent-bright)]">
                    {difficultyLabels[frontmatter.difficulty]}
                  </span>
                  <span className="text-[var(--text-faint)]">
                    {categoryLabels[frontmatter.category]}
                  </span>
                  <span className="text-[var(--text-faint)]">
                    {questionTypeLabels[frontmatter.questionType]}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
