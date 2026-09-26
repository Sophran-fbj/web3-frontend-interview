import Link from "next/link";

import {
  createQuestionsHref,
  type QuestionListState,
} from "@/content/question-list-url";

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

      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (page) =>
          page === currentPage ? (
            <span
              key={page}
              aria-current="page"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-[var(--accent)] px-3 text-sm font-semibold text-[var(--on-accent)]"
            >
              {page}
            </span>
          ) : (
            <Link
              key={page}
              href={createQuestionsHref({ ...state, page })}
              aria-label={`第 ${page} 页`}
              className={linkClassName}
            >
              {page}
            </Link>
          ),
      )}

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
    </nav>
  );
}
