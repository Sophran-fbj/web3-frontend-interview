"use client";

import {
  type LearningStatus,
  useProgressStore,
} from "@/stores/use-progress-store";

const statusOptions: Array<{ value: LearningStatus; label: string }> = [
  { value: "unseen", label: "未标记" },
  { value: "unclear", label: "不清楚" },
  { value: "review", label: "待复习" },
  { value: "mastered", label: "已掌握" },
];

export function LearningStatusControl({ questionId }: { questionId: string }) {
  const hasHydrated = useProgressStore((state) => state.hasHydrated);
  const status = useProgressStore(
    (state) => state.progress[questionId]?.status ?? "unseen",
  );
  const setStatus = useProgressStore((state) => state.setStatus);

  if (!hasHydrated)
    return (
      <div
        role="status"
        className="mt-6 border-t border-[var(--line)] pt-5 text-sm text-[var(--text-faint)]"
      >
        正在读取本地进度…
      </div>
    );

  return (
    <section
      aria-labelledby="learning-status-title"
      className="mt-6 border-t border-[var(--line)] pt-5"
    >
      <h2
        id="learning-status-title"
        className="text-sm font-medium text-[var(--text-strong)]"
      >
        我的掌握状态
      </h2>
      <p className="mt-1 text-xs leading-5 text-[var(--text-faint)]">
        只保存在当前浏览器
      </p>
      <div
        className="mt-3 grid grid-cols-2 gap-2"
        role="group"
        aria-labelledby="learning-status-title"
      >
        {statusOptions.map((option) => {
          const selected = status === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => setStatus(questionId, option.value)}
              className={`min-h-10 rounded-lg border px-2 text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                selected
                  ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]"
                  : "border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text-strong)]"
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
