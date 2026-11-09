import type { Metadata } from "next";
import Link from "next/link";

import {
  InterviewApp,
  type InterviewQuestionContent,
} from "@/components/interview-app";
import { QuestionBody } from "@/components/question-body";
import { LearningStorageNotice } from "@/components/learning-storage-notice";
import { getVisibleQuestions } from "@/content/question-repository";
import { splitQuestionSections } from "@/content/question-sections";
import { toQuestionSummary } from "@/content/question-summary";

export const metadata: Metadata = {
  title: "模拟面试",
  robots: { index: false, follow: false },
};

export default async function InterviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sessionId =
    typeof params.session === "string" ? params.session : undefined;
  const requestedQuestionId =
    typeof params.question === "string" ? params.question : undefined;
  const initialStudySetId =
    typeof params.set === "string" ? params.set : undefined;
  const questions = await getVisibleQuestions();
  const question = questions.find(
    ({ frontmatter }) => frontmatter.id === requestedQuestionId,
  );
  let content: InterviewQuestionContent | null = null;
  if (question) {
    const sections = splitQuestionSections(question.body);
    content = {
      id: question.frontmatter.id,
      prompt: <QuestionBody source={sections.prompt} />,
      answer: sections.answer ? (
        <QuestionBody source={sections.answer} />
      ) : (
        <p>这道题暂未提供参考答案。</p>
      ),
    };
  }

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 sm:py-20"
    >
      <Link href="/questions" className="study-link">
        返回题库
      </Link>
      <h1 className="mt-8 text-3xl font-semibold tracking-[-0.035em] text-[var(--text-strong)] sm:text-5xl">
        模拟面试
      </h1>
      <p className="mt-4 text-sm leading-7">
        逐题限时作答，结束后对照参考答案自评。草稿随输入保存，可从练习记录继续。
      </p>
      <p className="mt-3 text-xs leading-6">
        <LearningStorageNotice />
      </p>
      <InterviewApp
        questions={questions.map(toQuestionSummary)}
        sessionId={sessionId}
        requestedQuestionId={requestedQuestionId}
        initialStudySetId={initialStudySetId}
        content={content}
      />
    </main>
  );
}
