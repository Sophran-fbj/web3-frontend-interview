"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import {
  appendQuestionBackParam,
  createQuestionsHrefFromBack,
} from "@/content/question-list-url";

export type AdjacentQuestion = {
  slug: string;
  title: string;
};

/**
 * 详情页的回程上下文来自 `?back=` 查询参数（由题库列表页生成），
 * 直接打开不带参数的旧链接时，返回默认题库列表。
 * 外层 Suspense 保证 `generateStaticParams` 静态导出不因
 * `useSearchParams` 退化为动态渲染，静态 HTML 中渲染默认链接。
 */
export function BackToQuestionsLink() {
  return (
    <Suspense fallback={<BackToQuestionsLinkContent />}>
      <BackToQuestionsLinkWithParams />
    </Suspense>
  );
}

function BackToQuestionsLinkWithParams() {
  const backQuery = useSearchParams().get("back");

  return <BackToQuestionsLinkContent backQuery={backQuery} />;
}

function BackToQuestionsLinkContent({
  backQuery,
}: {
  backQuery?: string | null;
} = {}) {
  return (
    <Link
      href={createQuestionsHrefFromBack(backQuery)}
      className="study-link inline-flex items-center gap-1.5"
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 shrink-0">
        <path
          d="M10 3.5 5.5 8 10 12.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
      返回题库
    </Link>
  );
}

type AdjacentQuestionNavProps = {
  previous: AdjacentQuestion | null;
  next: AdjacentQuestion | null;
};

export function AdjacentQuestionNav({
  previous,
  next,
}: AdjacentQuestionNavProps) {
  return (
    <Suspense
      fallback={<AdjacentQuestionNavContent previous={previous} next={next} />}
    >
      <AdjacentQuestionNavWithParams previous={previous} next={next} />
    </Suspense>
  );
}

function AdjacentQuestionNavWithParams({
  previous,
  next,
}: AdjacentQuestionNavProps) {
  const backQuery = useSearchParams().get("back");

  return (
    <AdjacentQuestionNavContent
      previous={previous}
      next={next}
      backQuery={backQuery}
    />
  );
}

function AdjacentQuestionNavContent({
  previous,
  next,
  backQuery,
}: AdjacentQuestionNavProps & {
  backQuery?: string | null;
}) {
  return (
    <nav aria-label="题目导航" className="mt-14 grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas-raised)] p-5 transition-colors hover:border-[var(--accent)]">
        {previous ? (
          <Link
            href={appendQuestionBackParam(
              `/questions/${previous.slug}`,
              backQuery,
            )}
            className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            <span className="inline-flex items-center gap-1 text-xs text-[var(--text-faint)]">
              <span aria-hidden="true">←</span>
              上一题
            </span>
            <span className="mt-2 block leading-6 font-medium text-[var(--text-strong)] transition-colors group-hover:text-[var(--accent-bright)]">
              {previous.title}
            </span>
          </Link>
        ) : (
          <div aria-disabled="true" className="cursor-not-allowed opacity-55">
            <span className="block text-xs text-[var(--text-faint)]">
              上一题
            </span>
            <span className="mt-2 block leading-6 font-medium text-[var(--text-muted)]">
              当前为第一题
            </span>
          </div>
        )}
      </div>
      <div className="rounded-xl border border-[var(--line)] bg-[var(--canvas-raised)] p-5 transition-colors hover:border-[var(--accent)] sm:text-right">
        {next ? (
          <Link
            href={appendQuestionBackParam(`/questions/${next.slug}`, backQuery)}
            className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
          >
            <span className="inline-flex items-center gap-1 text-xs text-[var(--text-faint)]">
              下一题
              <span aria-hidden="true">→</span>
            </span>
            <span className="mt-2 block leading-6 font-medium text-[var(--text-strong)] transition-colors group-hover:text-[var(--accent-bright)]">
              {next.title}
            </span>
          </Link>
        ) : (
          <div aria-disabled="true" className="cursor-not-allowed opacity-55">
            <span className="block text-xs text-[var(--text-faint)]">
              下一题
            </span>
            <span className="mt-2 block leading-6 font-medium text-[var(--text-muted)]">
              当前为最后一题
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}
