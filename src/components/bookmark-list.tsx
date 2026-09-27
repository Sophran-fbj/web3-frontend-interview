"use client";

import Link from "next/link";

import { BookmarkButton } from "@/components/bookmark-button";
import { useBookmarkStore } from "@/stores/use-bookmark-store";

type BookmarkQuestion = {
  id: string;
  slug: string;
  title: string;
  summary: string;
};

export function BookmarkList({ questions }: { questions: BookmarkQuestion[] }) {
  const hasHydrated = useBookmarkStore((state) => state.hasHydrated);
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const savedQuestions = questions.filter((question) => bookmarks[question.id]);

  if (!hasHydrated) {
    return (
      <p role="status" className="mt-10 text-sm text-[var(--text-muted)]">
        正在读取本地收藏…
      </p>
    );
  }

  if (savedQuestions.length === 0) {
    return (
      <div className="mt-10 border-t border-[var(--line)] py-10">
        <p className="text-lg font-medium text-[var(--text-strong)]">
          还没有收藏的题目
        </p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          打开题目，点击心形按钮即可收藏。
        </p>
        <Link
          href="/questions"
          className="mt-5 inline-flex text-sm text-[var(--accent-bright)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
        >
          浏览题库
        </Link>
      </div>
    );
  }

  return (
    <ol className="mt-10 divide-y divide-[var(--line)] border-t border-[var(--line-strong)]">
      {savedQuestions.map((question) => (
        <li key={question.id} className="flex items-start gap-4 py-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-medium text-[var(--text-strong)]">
              <Link
                href={`/questions/${question.slug}`}
                className="hover:text-[var(--accent-bright)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
              >
                {question.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              {question.summary}
            </p>
          </div>
          <BookmarkButton questionId={question.id} />
        </li>
      ))}
    </ol>
  );
}
