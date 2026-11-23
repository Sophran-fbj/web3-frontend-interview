"use client";

import { useId } from "react";

import { useLearningReady } from "@/components/learning-account-provider";
import { LearningStorageNotice } from "@/components/learning-storage-notice";
import {
  type LearningStatus,
  useProgressStore,
} from "@/stores/use-progress-store";

const statusOptions: Array<{
  value: LearningStatus;
  label: string;
  activeClass: string;
}> = [
  {
    value: "unseen",
    label: "未标记",
    activeClass:
      "border-[var(--line-strong)] bg-[var(--surface-hover)] text-[var(--text-strong)] shadow-[inset_0_1px_0_var(--control-highlight)]",
  },
  {
    value: "unclear",
    label: "不清楚",
    activeClass:
      "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]",
  },
  {
    value: "review",
    label: "待复习",
    activeClass:
      "border-[var(--warning-border)] bg-[var(--warning-soft)] text-[var(--warning)]",
  },
  {
    value: "mastered",
    label: "已掌握",
    activeClass:
      "border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]",
  },
];

export function LearningStatusControl({
  questionId,
  compact = false,
}: {
  questionId: string;
  compact?: boolean;
}) {
  const titleId = useId();
  const learningReady = useLearningReady();
  const hasHydrated = useProgressStore((state) => state.hasHydrated);
  const status = useProgressStore(
    (state) => state.progress[questionId]?.status ?? "unseen",
  );
  const setStatus = useProgressStore((state) => state.setStatus);

  if (!hasHydrated || !learningReady) {
    return (
      <div
        role="status"
        className={
          compact
            ? "mt-3 text-xs text-[var(--text-faint)]"
            : "study-card p-4 text-sm text-[var(--text-faint)]"
        }
      >
        正在读取本地进度…
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className="mt-4 flex flex-wrap gap-2"
        role="group"
        aria-label="更新掌握状态"
      >
        {statusOptions.map((option) => {
          const selected = status === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => setStatus(questionId, option.value)}
              className={`min-h-9 rounded-lg border px-3 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                selected
                  ? option.activeClass
                  : "border-[var(--line)] bg-[var(--canvas-raised)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text-strong)]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <section aria-labelledby={titleId} className="study-card p-4">
      <h2
        id={titleId}
        className="text-sm font-semibold text-[var(--text-strong)]"
      >
        我的掌握状态
      </h2>
      <p className="mt-1 text-xs leading-5 text-[var(--text-faint)]">
        <LearningStorageNotice />
      </p>
      <div
        className="mt-3 grid grid-cols-2 gap-2"
        role="group"
        aria-labelledby={titleId}
      >
        {statusOptions.map((option) => {
          const selected = status === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => setStatus(questionId, option.value)}
              className={`min-h-10 rounded-lg border px-2 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                selected
                  ? option.activeClass
                  : "border-[var(--line)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text-strong)]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
