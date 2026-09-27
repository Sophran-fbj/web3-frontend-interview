import type { Metadata } from "next";
import Link from "next/link";

import { BookmarkList } from "@/components/bookmark-list";
import { getVisibleQuestions } from "@/content/question-repository";

export const metadata: Metadata = {
  title: "我的收藏",
  robots: { index: false, follow: false },
};

export default async function BookmarksPage() {
  const questions = (await getVisibleQuestions()).map(({ frontmatter }) => ({
    id: frontmatter.id,
    slug: frontmatter.slug,
    title: frontmatter.title,
    summary: frontmatter.summary,
  }));

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 sm:py-20"
    >
      <Link
        href="/questions"
        className="text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
      >
        返回题库
      </Link>
      <h1 className="mt-8 text-3xl font-semibold tracking-[-0.035em] text-[var(--text-strong)] sm:text-5xl">
        我的收藏
      </h1>
      <p className="mt-4 text-sm text-[var(--text-muted)]">
        收藏只保存在当前浏览器。
      </p>
      <BookmarkList questions={questions} />
    </main>
  );
}
