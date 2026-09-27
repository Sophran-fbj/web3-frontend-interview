import Link from "next/link";

import {
  createQuestionsHref,
  type QuestionListState,
} from "@/content/question-list-url";
import { getVisiblePageNumbers } from "@/content/question-pagination";

type QuestionPaginationProps = {
  currentPage: number;
  totalPages: number;
  state: QuestionListState;
};

const linkClassName =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--line-strong)] px-3 text-sm font-medium text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";
const disabledClassName =
  "inline-flex min-h-11 min-w-11 cursor-not-allowed items-center justify-center rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--text-faint)] opacity-55";

export function QuestionPagination({
  currentPage,
  totalPages,
  state,
}: QuestionPaginationProps) {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="题库分页"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      {currentPage > 1 ? (
        <Link
          href={createQuestionsHref({ ...state, page: currentPage - 1 })}
          className={linkClassName}
        >
          上一页
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClassName}>
          上一页
        </span>
      )}

      {visiblePages.map((page, index) => (
        <span key={page} className="contents">
          {index > 0 && page - visiblePages[index - 1] > 1 && (
            <span
              aria-hidden="true"
              className="inline-flex min-h-11 min-w-6 items-center justify-center text-sm text-[var(--text-faint)]"
            >
              …
            </span>
          )}
          {page === currentPage ? (
            <span
              aria-current="page"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-[var(--accent)] px-3 text-sm font-semibold text-[var(--on-accent)]"
            >
              {page}
            </span>
          ) : (
            <Link
              href={createQuestionsHref({ ...state, page })}
              aria-label={`第 ${page} 页`}
              className={linkClassName}
            >
              {page}
            </Link>
          )}
        </span>
      ))}

      {currentPage < totalPages ? (
        <Link
          href={createQuestionsHref({ ...state, page: currentPage + 1 })}
          className={linkClassName}
        >
          下一页
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClassName}>
          下一页
        </span>
      )}

      <form
        action="/questions"
        method="get"
        className="flex items-center gap-2 text-sm text-[var(--text-muted)]"
      >
        {state.query && <input type="hidden" name="q" value={state.query} />}
        {state.difficulty && (
          <input type="hidden" name="difficulty" value={state.difficulty} />
        )}
        {state.category && (
          <input type="hidden" name="category" value={state.category} />
        )}
        {state.questionType && (
          <input type="hidden" name="type" value={state.questionType} />
        )}
        {state.stack && (
          <input type="hidden" name="stack" value={state.stack} />
        )}
        <label htmlFor="jump-to-page">跳至</label>
        <input
          id="jump-to-page"
          type="number"
          name="page"
          min={1}
          max={totalPages}
          step={1}
          required
          defaultValue={currentPage}
          className="page-jump-input min-h-11 w-16 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-2 text-center text-sm text-[var(--text-strong)] tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        />
        <span>页</span>
        <button type="submit" className={linkClassName}>
          跳转
        </button>
      </form>
    </nav>
  );
}
