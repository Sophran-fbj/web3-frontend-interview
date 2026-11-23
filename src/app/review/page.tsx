import type { Metadata } from "next";

import { LearningStorageNotice } from "@/components/learning-storage-notice";
import { ReviewList } from "@/components/review-list";
import { PageHeader } from "@/components/ui/page-header";
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
      className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16"
    >
      <PageHeader
        backLink={{ href: "/questions", label: "返回题库" }}
        eyebrow="REVIEW QUEUE"
        title="复习列表与错题本"
        description="汇总标记为“不清楚”和“待复习”的题目。掌握后更新状态，题目会自动移出列表。"
        meta={<LearningStorageNotice />}
      />
      <ReviewList questions={questions} />
    </main>
  );
}
