import type { Metadata } from "next";
import Link from "next/link";

import { StudySetManager } from "@/components/study-set-manager";
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
      <p className="mt-4 text-sm leading-7">
        从现有题目中安排自己的练习顺序。题单和掌握进度只保存在当前浏览器。
      </p>
      <StudySetManager questions={questions} />
    </main>
  );
}
