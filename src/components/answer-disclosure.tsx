import type { ReactNode } from "react";

export function AnswerDisclosure({
  children,
  defaultOpen = false,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen || undefined}
      className="answer-disclosure group mt-12 overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-[var(--canvas-raised)] shadow-[0_12px_36px_-18px_var(--shadow)]"
    >
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 px-5 py-4 text-left text-base font-semibold text-[var(--text-strong)] transition-colors hover:bg-[var(--surface)]/45 hover:text-[var(--accent-bright)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)] sm:px-6 [&::-webkit-details-marker]:hidden">
        <span>
          查看参考答案
          <span className="mt-1 block text-xs font-normal text-[var(--text-faint)]">
            包含简要回答、深入分析、常见错误与评分标准
          </span>
        </span>
        <span
          aria-hidden="true"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--line-strong)] bg-[var(--surface)] font-mono text-lg font-normal text-[var(--accent-bright)] transition-colors group-open:rotate-45 group-open:border-[var(--accent)] group-open:bg-[var(--accent)] group-open:text-[var(--on-accent)]"
        >
          +
        </span>
      </summary>
      <div className="border-t border-[var(--line)] px-5 py-8 sm:px-6 sm:py-10">
        {children}
      </div>
    </details>
  );
}
