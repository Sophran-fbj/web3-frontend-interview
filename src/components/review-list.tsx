"use client";

import Link from "next/link";
import { useState } from "react";

import { LearningStatusControl } from "@/components/learning-status-control";
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
  const progress = useProgressStore((state) => state.progress);
  const hasHydrated = useProgressStore((state) => state.hasHydrated);
  const pending = questions.filter(
    ({ id }) =>
      progress[id]?.status === "unclear" || progress[id]?.status === "review",
  );
  const visible = pending
    .filter(({ id }) => filter === "all" || progress[id].status === filter)
    .sort((a, b) =>
      progress[a.id].updatedAt.localeCompare(progress[b.id].updatedAt),
    );

  if (!hasHydrated)
    return (
      <p role="status" className="mt-10">
        正在读取本地复习记录…
      </p>
    );

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-[var(--line)] py-4">
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
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <p role="status" className="text-sm">
          共 {visible.length} 道
        </p>
      </div>
      {visible.length > 0 ? (
        <>
          <Link
            href={`/questions/${visible[0].slug}`}
            className="study-button study-button-primary mt-6"
          >
            开始复习
          </Link>
          <ol className="mt-6 divide-y divide-[var(--line)]">
            {visible.map((question) => (
              <li key={question.id} className="py-7">
                <p className="mb-2 text-xs text-[var(--text-faint)]">
                  {categoryLabels[question.category]}
                </p>
                <h2 className="text-lg font-medium text-[var(--text-strong)]">
                  <Link
                    href={`/questions/${question.slug}`}
                    className="study-link"
                  >
                    {question.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm leading-7">{question.summary}</p>
                <LearningStatusControl questionId={question.id} />
              </li>
            ))}
          </ol>
        </>
      ) : (
        <div className="py-12">
          <p className="text-lg text-[var(--text-strong)]">
            {pending.length === 0
              ? "目前没有待复习的题目"
              : "这个筛选下没有题目"}
          </p>
          <p className="mt-3 text-sm leading-7">
            在题目详情标记“不清楚”或“待复习”，就可以在这里集中练习。
          </p>
          <Link href="/questions" className="study-link mt-4 inline-block">
            浏览题库
          </Link>
        </div>
      )}
    </div>
  );
}
