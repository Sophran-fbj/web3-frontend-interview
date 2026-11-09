"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { InterviewSetup } from "@/components/interview-setup";
import {
  InterviewAnswering,
  InterviewReview,
} from "@/components/interview-workspace";
import type { QuestionSummary } from "@/content/question-summary";
import { interviewHref } from "@/lib/interviews";
import { useInterviewStore } from "@/stores/use-interview-store";

export type InterviewQuestionContent = {
  id: string;
  prompt: ReactNode;
  answer: ReactNode;
};

export function InterviewApp({
  questions,
  sessionId,
  requestedQuestionId,
  initialStudySetId,
  content,
}: {
  questions: QuestionSummary[];
  sessionId?: string;
  requestedQuestionId?: string;
  initialStudySetId?: string;
  content: InterviewQuestionContent | null;
}) {
  const router = useRouter();
  const sessions = useInterviewStore((state) => state.sessions);
  const hydrated = useInterviewStore((state) => state.hasHydrated);

  if (!hydrated)
    return (
      <p role="status" className="mt-10">
        正在读取本地面试记录…
      </p>
    );
  if (!sessionId)
    return (
      <InterviewSetup
        questions={questions}
        initialStudySetId={initialStudySetId}
      />
    );

  const session = sessions[sessionId];
  if (!session)
    return (
      <div className="mt-10">
        <p>
          当前浏览器中没有这条练习记录，可能已被删除，或是在其他浏览器创建的。
        </p>
        <Link href="/interview" className="study-link mt-4 inline-block">
          返回模拟面试
        </Link>
      </div>
    );

  const expectedId = session.items[session.currentIndex].questionId;
  if (
    (session.status === "answering" && requestedQuestionId !== expectedId) ||
    !session.items.some((item) => item.questionId === requestedQuestionId)
  ) {
    return (
      <div className="mt-10">
        <p>本轮练习已保存。请从当前进度继续。</p>
        <Link
          href={interviewHref(session)}
          className="study-button study-button-primary mt-4"
        >
          继续本轮练习
        </Link>
      </div>
    );
  }

  if (session.status === "answering")
    return (
      <InterviewAnswering
        key={`${session.id}-${expectedId}`}
        session={session}
        content={content?.id === expectedId ? content : null}
        onAdvance={() => {
          useInterviewStore.getState().advanceQuestion(session.id);
          router.push(
            interviewHref(useInterviewStore.getState().sessions[session.id]),
          );
        }}
      />
    );

  return (
    <InterviewReview
      session={session}
      questionId={requestedQuestionId!}
      content={content?.id === requestedQuestionId ? content : null}
      availableQuestionIds={questions.map(({ id }) => id)}
    />
  );
}
