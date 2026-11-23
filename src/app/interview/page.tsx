import type { Metadata } from "next";

import {
  InterviewApp,
  type InterviewQuestionContent,
} from "@/components/interview-app";
import { LearningStorageNotice } from "@/components/learning-storage-notice";
import { QuestionBody } from "@/components/question-body";
import { PageHeader } from "@/components/ui/page-header";
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
      className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16"
    >
      <PageHeader
        backLink={{ href: "/questions", label: "返回题库" }}
        eyebrow="MOCK INTERVIEW"
        title="模拟面试"
        description="逐题限时作答，结束后对照参考答案自评。草稿随输入保存，可从练习记录继续。"
        meta={<LearningStorageNotice />}
      />
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
