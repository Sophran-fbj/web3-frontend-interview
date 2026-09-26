import type { Metadata } from "next";
import Link from "next/link";

import {
  categoryLabels,
  difficultyLabels,
  questionTypeLabels,
} from "@/content/question-labels";
import {
  filterQuestions,
  type QuestionFilters,
} from "@/content/question-filter";
import { getVisibleQuestions } from "@/content/question-repository";
import type { QuestionFrontmatter } from "@/content/question-schema";

export const metadata: Metadata = {
  title: "题库",
  description: "按主题浏览 Web3 前端面试题。",
};

type QuestionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function findOption<T extends string>(value: string | undefined, options: T[]) {
  return options.find((option) => option === value);
}

const difficulties = Object.keys(
  difficultyLabels,
) as QuestionFrontmatter["difficulty"][];
const categories = Object.keys(
  categoryLabels,
) as QuestionFrontmatter["category"][];
const questionTypes = Object.keys(
  questionTypeLabels,
) as QuestionFrontmatter["questionType"][];

export default async function QuestionsPage({
  searchParams,
}: QuestionsPageProps) {
  const params = await searchParams;
  const allQuestions = await getVisibleQuestions();
  const filters: QuestionFilters = {
    query: firstParam(params.q)?.trim(),
    difficulty: findOption(firstParam(params.difficulty), difficulties),
    category: findOption(firstParam(params.category), categories),
    questionType: findOption(firstParam(params.type), questionTypes),
  };
  const questions = filterQuestions(allQuestions, filters);
  const hasActiveFilters = Boolean(
    filters.query ||
    filters.difficulty ||
    filters.category ||
    filters.questionType,
  );

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

      {allQuestions.length > 0 && (
        <form
          action="/questions"
          method="get"
          className="mt-12 grid gap-4 border-y border-[var(--line-strong)] py-6 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,1fr)_10rem_11rem_10rem_auto] lg:items-end"
        >
          <label className="block sm:col-span-2 lg:col-span-1">
            <span className="mb-2 block text-sm font-medium text-[var(--text-strong)]">
              搜索题目
            </span>
            <input
              type="search"
              name="q"
              defaultValue={filters.query}
              placeholder="例如：钱包连接…"
              autoComplete="off"
              className="min-h-11 w-full border border-[var(--line-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-faint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--text-strong)]">
              难度
            </span>
            <select
              name="difficulty"
              defaultValue={filters.difficulty ?? ""}
              className="min-h-11 w-full border border-[var(--line-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              <option value="">全部难度</option>
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficultyLabels[difficulty]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--text-strong)]">
              分类
            </span>
            <select
              name="category"
              defaultValue={filters.category ?? ""}
              className="min-h-11 w-full border border-[var(--line-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              <option value="">全部分类</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {categoryLabels[category]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--text-strong)]">
              题型
            </span>
            <select
              name="type"
              defaultValue={filters.questionType ?? ""}
              className="min-h-11 w-full border border-[var(--line-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              <option value="">全部题型</option>
              {questionTypes.map((questionType) => (
                <option key={questionType} value={questionType}>
                  {questionTypeLabels[questionType]}
                </option>
              ))}
            </select>
          </label>

          <div className="flex min-h-11 items-center gap-4">
            <button
              type="submit"
              className="min-h-11 bg-[var(--accent)] px-5 text-sm font-semibold text-white hover:bg-[var(--accent-bright)] hover:text-[var(--canvas)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-bright)]"
            >
              查看结果
            </button>
            {hasActiveFilters && (
              <Link
                href="/questions"
                className="text-sm text-[var(--text-muted)] underline decoration-[var(--line-strong)] underline-offset-4 hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
              >
                清除
              </Link>
            )}
          </div>
        </form>
      )}

      <div className="mt-14 flex items-baseline justify-between border-b border-[var(--line-strong)] pb-4">
        <h2 className="text-base font-semibold text-[var(--text-strong)]">
          {hasActiveFilters ? "筛选结果" : "全部题目"}
        </h2>
        <p className="font-mono text-sm text-[var(--text-faint)] tabular-nums">
          {hasActiveFilters
            ? `${questions.length} / ${allQuestions.length} 题`
            : `共 ${questions.length} 题`}
        </p>
      </div>

      {allQuestions.length === 0 ? (
        <div className="border-b border-[var(--line)] py-14">
          <p className="text-lg font-medium text-[var(--text-strong)]">
            题目正在完成最终校验
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
            通过人工确认的题目会在这里公开。当前可以先了解项目目标，稍后再回来查看。
          </p>
        </div>
      ) : questions.length === 0 ? (
        <div className="border-b border-[var(--line)] py-14">
          <p className="text-lg font-medium text-[var(--text-strong)]">
            没有匹配的题目
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
            尝试缩短关键词或减少筛选条件，也可以
            <Link
              href="/questions"
              className="ml-1 text-[var(--accent-bright)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
            >
              查看全部题目
            </Link>
            。
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
