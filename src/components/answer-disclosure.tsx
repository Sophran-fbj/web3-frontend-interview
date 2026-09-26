import type { ReactNode } from "react";

export function AnswerDisclosure({ children }: { children: ReactNode }) {
  return (
    <details className="answer-disclosure group mt-12 border-y border-[var(--line-strong)]">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4 text-left text-base font-semibold text-[var(--text-strong)] hover:text-[var(--accent-bright)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] [&::-webkit-details-marker]:hidden">
        <span>
          查看参考答案
          <span className="mt-1 block text-sm font-normal text-[var(--text-faint)]">
            包含简要回答、深入分析、常见错误与评分标准
          </span>
        </span>
        <span
          aria-hidden="true"
          className="font-mono text-xl font-normal text-[var(--accent-bright)] group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="border-t border-[var(--line)] py-10">{children}</div>
    </details>
  );
}
