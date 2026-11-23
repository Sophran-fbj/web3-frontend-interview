import type { Metadata } from "next";

import { LearningStorageNotice } from "@/components/learning-storage-notice";
import { StudySetManager } from "@/components/study-set-manager";
import { PageHeader } from "@/components/ui/page-header";
import { getVisibleQuestions } from "@/content/question-repository";
import { toQuestionSummary } from "@/content/question-summary";

export const metadata: Metadata = {
  title: "我的题单",
  robots: { index: false, follow: false },
};

export default async function StudySetsPage() {
  const questions = (await getVisibleQuestions()).map(toQuestionSummary);
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16"
    >
      <PageHeader
        backLink={{ href: "/questions", label: "返回题库" }}
        eyebrow="STUDY SETS"
        title="我的题单"
        description="从现有题目中编排自己的专项练习顺序，追踪掌握进度并一键发起模拟面试。"
        meta={<LearningStorageNotice />}
      />
      <StudySetManager questions={questions} />
    </main>
  );
}
