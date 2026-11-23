"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { QuestionFilterMenu } from "@/components/question-filter-menu";
import { categoryLabels } from "@/content/question-config";
import type { QuestionFilters } from "@/content/question-filter";
import {
  difficultyLabels,
  questionTypeLabels,
} from "@/content/question-labels";
import {
  createQuestionsHref,
  type ProgressFilter,
} from "@/content/question-list-url";
import type { QuestionFrontmatter } from "@/content/question-schema";

const progressChipLabels: Record<Exclude<ProgressFilter, "all">, string> = {
  unmastered: "未掌握",
  review: "待复习",
  mastered: "已掌握",
};

export function QuestionFilterBar({
  filters,
  progressFilter,
  difficulties,
  categories,
  questionTypes,
  stacks,
}: {
  filters: QuestionFilters;
  progressFilter: ProgressFilter;
  difficulties: QuestionFrontmatter["difficulty"][];
  categories: QuestionFrontmatter["category"][];
  questionTypes: QuestionFrontmatter["questionType"][];
  stacks: string[];
}) {
  const router = useRouter();
  const urlQuery = filters.query ?? "";
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  const [draftQuery, setDraftQuery] = useState(urlQuery);

  if (prevUrlQuery !== urlQuery) {
    setPrevUrlQuery(urlQuery);
    setDraftQuery(urlQuery);
  }

  const liveQuery = draftQuery.trim() || undefined;
  const filterHref = (changes: Partial<QuestionFilters>) =>
    createQuestionsHref({
      ...filters,
      query: liveQuery,
      progress: progressFilter,
      ...changes,
      page: undefined,
    });

  const activeChips: Array<{ key: string; label: string; href: string }> = [];
  if (filters.query) {
    activeChips.push({
      key: "query",
      label: `关键词：${filters.query}`,
      href: createQuestionsHref({
        ...filters,
        progress: progressFilter,
        query: undefined,
        page: undefined,
      }),
    });
  }
  if (filters.difficulty) {
    activeChips.push({
      key: "difficulty",
      label: `难度：${difficultyLabels[filters.difficulty]}`,
      href: filterHref({ difficulty: undefined }),
    });
  }
  if (filters.category) {
    activeChips.push({
      key: "category",
      label: `分类：${categoryLabels[filters.category]}`,
      href: filterHref({ category: undefined }),
    });
  }
  if (filters.questionType) {
    activeChips.push({
      key: "type",
      label: `题型：${questionTypeLabels[filters.questionType]}`,
      href: filterHref({ questionType: undefined }),
    });
  }
  if (filters.stack) {
    activeChips.push({
      key: "stack",
      label: `技术栈：${filters.stack}`,
      href: filterHref({ stack: undefined }),
    });
  }
  if (progressFilter !== "all") {
    activeChips.push({
      key: "progress",
      label: `状态：${progressChipLabels[progressFilter]}`,
      href: createQuestionsHref({
        ...filters,
        query: liveQuery,
        progress: "all",
        page: undefined,
      }),
    });
  }

  function clearSearchDraft() {
    setDraftQuery("");
    if (filters.query) {
      router.push(
        createQuestionsHref({
          ...filters,
          progress: progressFilter,
          query: undefined,
          page: undefined,
        }),
      );
    }
  }

  return (
    <section aria-label="题目筛选" className="study-card mt-10 p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,1.4fr)_repeat(4,minmax(0,0.85fr))] lg:items-end">
        <form action="/questions" method="get" className="min-w-0">
          {filters.difficulty && (
            <input type="hidden" name="difficulty" value={filters.difficulty} />
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
          {progressFilter !== "all" && (
            <input type="hidden" name="progress" value={progressFilter} />
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
                value={draftQuery}
                onChange={(event) => setDraftQuery(event.target.value)}
                placeholder="例如：钱包连接、EIP-712…"
                autoComplete="off"
                className="min-h-11 w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] pr-16 pl-10 text-sm text-[var(--text-strong)] shadow-[inset_0_1px_0_var(--control-highlight)] transition-colors placeholder:text-[var(--text-faint)] hover:border-[var(--accent)] focus-visible:border-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] [&::-webkit-search-cancel-button]:hidden"
              />
              <span className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-1">
                {draftQuery && (
                  <button
                    type="button"
                    onClick={clearSearchDraft}
                    aria-label="清空搜索词"
                    className="inline-flex size-7 items-center justify-center rounded-md text-[var(--text-faint)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      className="size-3.5"
                    >
                      <path
                        d="m4.5 4.5 7 7m0-7-7 7"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.6"
                      />
                    </svg>
                  </button>
                )}
                <button
                  type="submit"
                  aria-label="执行搜索"
                  className="inline-flex size-8 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--canvas-raised)] text-xs text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                >
                  ↵
                </button>
              </span>
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
      </div>

      {activeChips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-3.5">
          <div className="flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <Link
                key={chip.key}
                href={chip.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--text-strong)] transition-colors hover:border-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                <span>{chip.label}</span>
                <span aria-hidden="true" className="text-[var(--text-faint)]">
                  ×
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/questions"
            className="text-xs text-[var(--text-muted)] underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            清除全部
          </Link>
        </div>
      )}
    </section>
  );
}
