import type { Metadata } from "next";
import Link from "next/link";

import { ReviewList } from "@/components/review-list";
import { LearningStorageNotice } from "@/components/learning-storage-notice";
import { getVisibleQuestions } from "@/content/question-repository";
import { toQuestionSummary } from "@/content/question-summary";

export const metadata: Metadata = {
  title: "复习列表与错题本",
  robots: { index: false, follow: false },
};

export default async function ReviewPage() {
  const questions = (await getVisibleQuestions()).map(toQuestionSummary);

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 sm:py-20"
    >
      <Link href="/questions" className="study-link">
        返回题库
      </Link>
      <h1 className="mt-8 text-3xl font-semibold tracking-[-0.035em] text-[var(--text-strong)] sm:text-5xl">
        复习列表与错题本
      </h1>
      <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
        汇总标记为“不清楚”和“待复习”的题目。掌握后更新状态，题目会自动移出列表。
      </p>
      <p className="mt-3 text-xs leading-6">
        <LearningStorageNotice />
      </p>
      <ReviewList questions={questions} />
    </main>
  );
}
