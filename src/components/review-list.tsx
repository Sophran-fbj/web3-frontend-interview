"use client";

import Link from "next/link";
import { useState } from "react";

import { useLearningReady } from "@/components/learning-account-provider";
import { LearningStatusControl } from "@/components/learning-status-control";
import {
  DifficultyBadge,
  QuestionTypeBadge,
} from "@/components/ui/semantic-badges";
import { categoryLabels } from "@/content/question-config";
import type { QuestionSummary } from "@/content/question-summary";
import { useProgressStore } from "@/stores/use-progress-store";

const filters = [
  { value: "all", label: "全部待复习" },
  { value: "unclear", label: "不清楚（错题本）" },
  { value: "review", label: "待复习" },
] as const;

export function ReviewList({ questions }: { questions: QuestionSummary[] }) {
  const [filter, setFilter] =
    useState<(typeof filters)[number]["value"]>("all");
  const learningReady = useLearningReady();
  const progress = useProgressStore((state) => state.progress);
  const hasHydrated = useProgressStore((state) => state.hasHydrated);
  const pending = questions.filter(
    ({ id }) =>
      progress[id]?.status === "unclear" || progress[id]?.status === "review",
  );
  const unclearCount = pending.filter(
    ({ id }) => progress[id]?.status === "unclear",
  ).length;
  const reviewCount = pending.filter(
    ({ id }) => progress[id]?.status === "review",
  ).length;
  const filterCounts = {
    all: pending.length,
    unclear: unclearCount,
    review: reviewCount,
  };

  const visible = pending
    .filter(({ id }) => filter === "all" || progress[id].status === filter)
    .sort((a, b) =>
      progress[a.id].updatedAt.localeCompare(progress[b.id].updatedAt),
    );

  if (!hasHydrated || !learningReady)
    return (
      <p role="status" className="mt-10 text-sm text-[var(--text-muted)]">
        正在读取本地复习记录…
      </p>
    );

  return (
    <div className="mt-10">
      <div className="study-card flex flex-wrap items-center justify-between gap-4 p-4 sm:px-5">
        <div
          role="group"
          aria-label="复习状态筛选"
          className="flex flex-wrap gap-2"
        >
          {filters.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className="study-button"
              aria-label={label}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              <span>{label}</span>
              <span
                aria-hidden="true"
                className="font-mono text-xs tabular-nums opacity-75"
              >
                ({filterCounts[value]})
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <p
            role="status"
            className="font-mono text-sm text-[var(--text-faint)] tabular-nums"
          >
            共 {visible.length} 道
          </p>
          {visible.length > 0 && (
            <Link
              href={`/questions/${visible[0].slug}`}
              className="study-button study-button-primary"
            >
              开始复习
            </Link>
          )}
        </div>
      </div>

      {visible.length > 0 ? (
        <ol className="mt-6 space-y-4">
          {visible.map((question) => (
            <li
              key={question.id}
              className="rounded-2xl border border-[var(--line)] bg-[var(--canvas-raised)] p-5 transition-colors hover:border-[var(--line-strong)] sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <DifficultyBadge difficulty={question.difficulty} />
                <span className="study-badge study-badge-neutral">
                  {categoryLabels[question.category]}
                </span>
                <QuestionTypeBadge questionType={question.questionType} />
              </div>
              <h2 className="mt-3 text-lg font-semibold text-[var(--text-strong)] sm:text-xl">
                <Link
                  href={`/questions/${question.slug}`}
                  className="transition-colors hover:text-[var(--accent-bright)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
                >
                  {question.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                {question.summary}
              </p>
              <LearningStatusControl questionId={question.id} compact />
            </li>
          ))}
        </ol>
      ) : (
        <div className="study-card mt-6 p-8 text-center">
          <p className="text-lg font-medium text-[var(--text-strong)]">
            {pending.length === 0
              ? "目前没有待复习的题目"
              : "这个筛选下没有题目"}
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
            在题目详情标记“不清楚”或“待复习”，就可以在这里集中练习。
          </p>
          <Link href="/questions" className="study-button mt-5">
            浏览题库
          </Link>
        </div>
      )}
    </div>
  );
}
