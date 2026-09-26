import type { Metadata } from "next";
import Link from "next/link";

import { QuestionFilterMenu } from "@/components/question-filter-menu";
import { QuestionPagination } from "@/components/question-pagination";
import { RandomQuestionButton } from "@/components/random-question-button";
import {
  categoryLabels,
  difficultyLabels,
  questionTypeLabels,
} from "@/content/question-labels";
import {
  filterQuestions,
  type QuestionFilters,
} from "@/content/question-filter";
import { createQuestionsHref } from "@/content/question-list-url";
import {
  paginateQuestions,
  questionsPerPage,
} from "@/content/question-pagination";
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

const difficultyOrder = Object.keys(
  difficultyLabels,
) as QuestionFrontmatter["difficulty"][];
const categoryOrder = Object.keys(
  categoryLabels,
) as QuestionFrontmatter["category"][];
const questionTypeOrder = Object.keys(
  questionTypeLabels,
) as QuestionFrontmatter["questionType"][];

export default async function QuestionsPage({
  searchParams,
}: QuestionsPageProps) {
  const params = await searchParams;
  const allQuestions = await getVisibleQuestions();
  const difficulties = difficultyOrder.filter((difficulty) =>
    allQuestions.some(
      ({ frontmatter }) => frontmatter.difficulty === difficulty,
    ),
  );
  const categories = categoryOrder.filter((category) =>
    allQuestions.some(({ frontmatter }) => frontmatter.category === category),
  );
  const questionTypes = questionTypeOrder.filter((questionType) =>
    allQuestions.some(
      ({ frontmatter }) => frontmatter.questionType === questionType,
    ),
  );
  const stacks = Array.from(
    new Set(
      allQuestions.flatMap(({ frontmatter }) =>
        Object.keys(frontmatter.stacks),
      ),
    ),
  ).sort((left, right) => left.localeCompare(right, "en"));
  const tags = Array.from(
    new Set(allQuestions.flatMap(({ frontmatter }) => frontmatter.tags)),
  ).sort((left, right) => left.localeCompare(right, "en"));
  const filters: QuestionFilters = {
    query: firstParam(params.q)?.trim(),
    difficulty: findOption(firstParam(params.difficulty), difficulties),
    category: findOption(firstParam(params.category), categories),
    questionType: findOption(firstParam(params.type), questionTypes),
    stack: findOption(firstParam(params.stack), stacks),
    tag: findOption(firstParam(params.tag), tags),
  };
  const filteredQuestions = filterQuestions(allQuestions, filters);
  const requestedPage = Number.parseInt(firstParam(params.page) ?? "1", 10);
  const {
    currentPage,
    totalPages,
    items: pageQuestions,
  } = paginateQuestions(filteredQuestions, requestedPage);
  const hasActiveFilters = Boolean(
    filters.query ||
    filters.difficulty ||
    filters.category ||
    filters.questionType ||
    filters.stack ||
    filters.tag,
  );
  const filterHref = (changes: Partial<QuestionFilters>) =>
    createQuestionsHref({ ...filters, ...changes, page: undefined });

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
        <section
          aria-label="题目筛选"
          className="mt-12 rounded-2xl border border-[var(--line)] bg-[var(--canvas-raised)] p-4 shadow-[0_18px_48px_var(--shadow)] sm:p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,1.35fr)_repeat(5,minmax(0,0.85fr))] lg:items-end">
            <form action="/questions" method="get" className="min-w-0">
              {filters.difficulty && (
                <input
                  type="hidden"
                  name="difficulty"
                  value={filters.difficulty}
                />
              )}
              {filters.category && (
                <input type="hidden" name="category" value={filters.category} />
              )}
              {filters.questionType && (
                <input type="hidden" name="type" value={filters.questionType} />
              )}
              {filters.stack && (
                <input type="hidden" name="stack" value={filters.stack} />
              )}
              {filters.tag && (
                <input type="hidden" name="tag" value={filters.tag} />
              )}
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-[var(--text-muted)]">
                  搜索题目
                </span>
                <span className="relative block">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--text-faint)]"
                  >
                    <circle
                      cx="8.5"
                      cy="8.5"
                      r="5.25"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="m12.5 12.5 4 4"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <input
                    type="search"
                    name="q"
                    defaultValue={filters.query}
                    placeholder="例如：钱包连接…"
                    autoComplete="off"
                    className="min-h-11 w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] pr-3.5 pl-10 text-sm text-[var(--text-strong)] shadow-[inset_0_1px_0_var(--control-highlight)] placeholder:text-[var(--text-faint)] hover:border-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  />
                </span>
              </label>
            </form>

            <QuestionFilterMenu
              label="难度"
              value={filters.difficulty}
              allLabel="全部难度"
              allHref={filterHref({ difficulty: undefined })}
              options={difficulties.map((difficulty) => ({
                value: difficulty,
                label: difficultyLabels[difficulty],
                href: filterHref({ difficulty }),
              }))}
            />

            <QuestionFilterMenu
              label="分类"
              value={filters.category}
              allLabel="全部分类"
              allHref={filterHref({ category: undefined })}
              options={categories.map((category) => ({
                value: category,
                label: categoryLabels[category],
                href: filterHref({ category }),
              }))}
            />

            <QuestionFilterMenu
              label="题型"
              value={filters.questionType}
              allLabel="全部题型"
              allHref={filterHref({ questionType: undefined })}
              options={questionTypes.map((questionType) => ({
                value: questionType,
                label: questionTypeLabels[questionType],
                href: filterHref({ questionType }),
              }))}
            />

            <QuestionFilterMenu
              label="技术栈"
              value={filters.stack}
              allLabel="全部技术栈"
              allHref={filterHref({ stack: undefined })}
              options={stacks.map((stack) => ({
                value: stack,
                label: stack,
                href: filterHref({ stack }),
              }))}
            />

            <QuestionFilterMenu
              label="标签"
              value={filters.tag}
              allLabel="全部标签"
              allHref={filterHref({ tag: undefined })}
              options={tags.map((tag) => ({
                value: tag,
                label: `#${tag}`,
                href: filterHref({ tag }),
              }))}
            />
          </div>

          <div className="mt-3 flex min-h-6 items-center justify-between gap-4 text-xs text-[var(--text-faint)]">
            <p>搜索后按 Enter，选择筛选项后立即更新</p>
            {hasActiveFilters && (
              <Link
                href="/questions"
                className="shrink-0 text-[var(--text-muted)] underline decoration-[var(--line-strong)] underline-offset-4 hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
              >
                清除全部
              </Link>
            )}
          </div>
        </section>
      )}

      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line-strong)] pb-4">
        <h2 className="text-base font-semibold text-[var(--text-strong)]">
          {hasActiveFilters ? "筛选结果" : "全部题目"}
        </h2>
        <div className="flex items-center gap-4">
          {filteredQuestions.length > 0 && (
            <RandomQuestionButton
              candidates={filteredQuestions.map(({ frontmatter }) => ({
                id: frontmatter.id,
                slug: frontmatter.slug,
              }))}
            />
          )}
          <p className="font-mono text-sm text-[var(--text-faint)] tabular-nums">
            {hasActiveFilters
              ? `${filteredQuestions.length} / ${allQuestions.length} 题`
              : `共 ${filteredQuestions.length} 题`}
            {totalPages > 1 && ` · 第 ${currentPage} / ${totalPages} 页`}
          </p>
        </div>
      </div>

      {allQuestions.length === 0 ? (
        <div className="border-b border-[var(--line)] py-14">
          <p className="text-lg font-medium text-[var(--text-strong)]">
            暂无可公开题目
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
            内容完整的题目会在这里公开。当前可以先了解项目目标，稍后再回来查看。
          </p>
        </div>
      ) : filteredQuestions.length === 0 ? (
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
        <>
          <ol className="divide-y divide-[var(--line)]">
            {pageQuestions.map(({ frontmatter }, index) => (
              <li
                key={frontmatter.id}
                className="grid gap-4 py-7 sm:grid-cols-[3.5rem_minmax(0,1fr)_11rem] sm:items-start sm:gap-5"
              >
                <span className="font-mono text-sm text-[var(--text-faint)] tabular-nums">
                  {String(
                    (currentPage - 1) * questionsPerPage + index + 1,
                  ).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3>
                    <Link
                      href={`/questions/${frontmatter.slug}`}
                      className="text-lg leading-7 font-medium tracking-[-0.015em] text-[var(--text-strong)] hover:text-[var(--accent-bright)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] sm:text-xl"
                    >
                      {frontmatter.title}
                    </Link>
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                    {frontmatter.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {frontmatter.tags.slice(0, 4).map((tag) => (
                      <Link
                        key={tag}
                        href={createQuestionsHref({ tag })}
                        className="inline-flex min-h-8 items-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-2.5 font-mono text-xs text-[var(--text-faint)] hover:border-[var(--accent)] hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 text-sm sm:flex-col sm:items-end sm:gap-1">
                  <span className="font-medium text-[var(--accent-bright)]">
                    {difficultyLabels[frontmatter.difficulty]}
                  </span>
                  <span className="text-[var(--text-faint)]">
                    {categoryLabels[frontmatter.category]}
                  </span>
                  <span className="text-[var(--text-faint)]">
                    {questionTypeLabels[frontmatter.questionType]}
                  </span>
                </div>
              </li>
            ))}
          </ol>
          <QuestionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            state={filters}
          />
        </>
      )}
    </main>
  );
}
