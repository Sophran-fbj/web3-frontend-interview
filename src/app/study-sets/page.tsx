import type { Metadata } from "next";
import Link from "next/link";

import { StudySetManager } from "@/components/study-set-manager";
import { LearningStorageNotice } from "@/components/learning-storage-notice";
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
      className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20"
    >
      <Link href="/questions" className="study-link">
        返回题库
      </Link>
      <h1 className="mt-8 text-3xl font-semibold tracking-[-0.035em] text-[var(--text-strong)] sm:text-5xl">
        我的题单
      </h1>
      <p className="mt-4 text-sm leading-7">从现有题目中安排自己的练习顺序。</p>
      <p className="mt-3 text-xs leading-6">
        <LearningStorageNotice />
      </p>
      <StudySetManager questions={questions} />
    </main>
  );
}
