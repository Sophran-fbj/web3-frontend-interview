import type { Metadata } from "next";

import { BookmarkList } from "@/components/bookmark-list";
import { LearningStorageNotice } from "@/components/learning-storage-notice";
import { PageHeader } from "@/components/ui/page-header";
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
    difficulty: frontmatter.difficulty,
    category: frontmatter.category,
    questionType: frontmatter.questionType,
  }));

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16"
    >
      <PageHeader
        backLink={{ href: "/questions", label: "返回题库" }}
        eyebrow="BOOKMARKS"
        title="我的收藏"
        description="集中整理个人重点关注的题目，方便面试前快速复盘。"
        meta={<LearningStorageNotice />}
      />
      <BookmarkList questions={questions} />
    </main>
  );
}
