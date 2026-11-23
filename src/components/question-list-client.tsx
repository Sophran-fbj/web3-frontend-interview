"use client";

import Link from "next/link";

import { BookmarkButton } from "@/components/bookmark-button";
import { useLearningReady } from "@/components/learning-account-provider";
import { QuestionPagination } from "@/components/question-pagination";
import { RandomQuestionButton } from "@/components/random-question-button";
import { QuestionStatusPill } from "@/components/ui/question-status-pill";
import {
  DifficultyBadge,
  QuestionTypeBadge,
} from "@/components/ui/semantic-badges";
import { categoryLabels } from "@/content/question-config";
import type { QuestionFilters } from "@/content/question-filter";
import {
  createQuestionDetailHref,
  createQuestionListBackQuery,
  createQuestionsHref,
  type ProgressFilter,
  type QuestionListState,
} from "@/content/question-list-url";
import {
  paginateQuestions,
  questionsPerPage,
} from "@/content/question-pagination";
import type { QuestionSummary } from "@/content/question-summary";
import { useProgressStore } from "@/stores/use-progress-store";

export type QuestionListItem = QuestionSummary & {
  stacks: string[];
};

const progressTabs: Array<{ value: ProgressFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "unmastered", label: "未掌握" },
  { value: "review", label: "待复习" },
  { value: "mastered", label: "已掌握" },
];

export function QuestionListClient({
  questions,
  totalAllCount,
  filters,
  requestedPage,
  progressFilter,
}: {
  questions: QuestionListItem[];
  totalAllCount: number;
  filters: QuestionFilters;
  requestedPage: number;
  progressFilter: ProgressFilter;
}) {
  const learningReady = useLearningReady();
  const progress = useProgressStore((state) => state.progress);
  const progressHydrated = useProgressStore((state) => state.hasHydrated);
  const progressReady = progressHydrated && learningReady;

  const hasServerFilters = Boolean(
    filters.query ||
    filters.difficulty ||
    filters.category ||
    filters.questionType ||
    filters.stack,
  );
  const hasAnyFilter = hasServerFilters || progressFilter !== "all";

  const waitingForLocalProgress = progressFilter !== "all" && !progressReady;

  const visibleQuestions =
    progressFilter === "all" || !progressReady
      ? questions
      : questions.filter(({ id }) => {
          const status = progress[id]?.status;
          if (progressFilter === "mastered") return status === "mastered";
          if (progressFilter === "review") {
            return status === "review" || status === "unclear";
          }
          return status !== "mastered";
        });

  const {
    currentPage,
    totalPages,
    items: pageQuestions,
  } = paginateQuestions(visibleQuestions, requestedPage);

  const listState: QuestionListState = {
    ...filters,
    progress: progressFilter,
    page: currentPage,
  };
  const backQuery = createQuestionListBackQuery(listState);

  return (
    <>
      <div className="mt-10 flex flex-col gap-4 border-b border-[var(--line-strong)] pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-base font-semibold text-[var(--text-strong)]">
            {hasAnyFilter ? "筛选结果" : "全部题目"}
          </h2>
          <div
            role="navigation"
            aria-label="按掌握状态筛选"
            className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--canvas-raised)] p-1"
          >
            {progressTabs.map((tab) => {
              const active = progressFilter === tab.value;
              return (
                <Link
                  key={tab.value}
                  href={createQuestionsHref({
                    ...filters,
                    progress: tab.value,
                    page: undefined,
                  })}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                    active
                      ? "bg-[var(--accent)] text-[var(--on-accent)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-strong)]"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
          {!waitingForLocalProgress && visibleQuestions.length > 0 && (
            <RandomQuestionButton
              candidates={visibleQuestions.map(({ id, slug }) => ({
                id,
                slug,
              }))}
              backQuery={backQuery}
            />
          )}
          <p className="font-mono text-sm text-[var(--text-faint)] tabular-nums">
            {waitingForLocalProgress
              ? "读取进度中…"
              : hasAnyFilter
                ? `${visibleQuestions.length} / ${totalAllCount} 题`
                : `共 ${visibleQuestions.length} 题`}
            {!waitingForLocalProgress &&
              totalPages > 1 &&
              ` · 第 ${currentPage} / ${totalPages} 页`}
          </p>
        </div>
      </div>

      {totalAllCount === 0 ? (
        <div className="border-b border-[var(--line)] py-14">
          <p className="text-lg font-medium text-[var(--text-strong)]">
            暂无可公开题目
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
            内容完整的题目会在这里公开。当前可以先了解项目目标，稍后再回来查看。
          </p>
        </div>
      ) : waitingForLocalProgress ? (
        <p role="status" className="py-14 text-sm text-[var(--text-muted)]">
          正在读取本地学习状态…
        </p>
      ) : visibleQuestions.length === 0 ? (
        <div className="border-b border-[var(--line)] py-14">
          <p className="text-lg font-medium text-[var(--text-strong)]">
            没有匹配的题目
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
            {progressFilter !== "all"
              ? "当前学习状态筛选下暂无题目，尝试切换状态或"
              : "尝试缩短关键词或减少筛选条件，也可以"}
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
            {pageQuestions.map((question, index) => (
              <li
                key={question.id}
                className="group -mx-3 grid grid-cols-[2rem_minmax(0,1fr)_2.75rem] items-start gap-x-3 gap-y-3 rounded-xl px-3 py-6 transition-colors duration-150 hover:bg-[var(--surface)]/45 sm:grid-cols-[3.25rem_minmax(0,1fr)_12.5rem_2.75rem] sm:gap-5"
              >
                <span className="pt-1 font-mono text-xs text-[var(--text-faint)] tabular-nums">
                  {String(
                    (currentPage - 1) * questionsPerPage + index + 1,
                  ).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="min-w-0">
                      <Link
                        href={createQuestionDetailHref(
                          question.slug,
                          listState,
                        )}
                        className="text-lg leading-7 font-medium tracking-[-0.015em] text-[var(--text-strong)] transition-colors group-hover:text-[var(--accent-bright)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] sm:text-xl"
                      >
                        {question.title}
                      </Link>
                    </h3>
                    <QuestionStatusPill questionId={question.id} />
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                    {question.summary}
                  </p>
                  {question.stacks.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {question.stacks.slice(0, 3).map((stack) => (
                        <span
                          key={stack}
                          className="rounded border border-[var(--line)] bg-[var(--canvas-raised)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-faint)]"
                        >
                          {stack}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-start-2 row-start-2 flex flex-wrap items-center gap-2 text-xs sm:col-start-3 sm:row-start-1 sm:flex-col sm:items-end sm:gap-1.5">
                  <DifficultyBadge difficulty={question.difficulty} />
                  <span className="text-[var(--text-muted)]">
                    {categoryLabels[question.category]}
                  </span>
                  <QuestionTypeBadge questionType={question.questionType} />
                </div>
                <div className="col-start-3 row-span-2 row-start-1 self-center sm:col-start-4 sm:row-span-1">
                  <BookmarkButton questionId={question.id} />
                </div>
              </li>
            ))}
          </ol>
          <QuestionPagination
            currentPage={currentPage}
            totalPages={totalPages}
            state={{ ...filters, progress: progressFilter }}
          />
        </>
      )}
    </>
  );
}
