"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AnswerDisclosure } from "@/components/answer-disclosure";
import type { InterviewQuestionContent } from "@/components/interview-app";
import {
  interviewHref,
  remainingSeconds,
  type InterviewAssessment,
  type InterviewSession,
} from "@/lib/interviews";
import { useInterviewStore } from "@/stores/use-interview-store";
import { useProgressStore } from "@/stores/use-progress-store";

const assessments: { value: InterviewAssessment; label: string }[] = [
  { value: "unclear", label: "不清楚" },
  { value: "review", label: "待复习" },
  { value: "mastered", label: "已掌握" },
];

export function InterviewAnswering({
  session,
  content,
  onAdvance,
}: {
  session: InterviewSession;
  content: InterviewQuestionContent | null;
  onAdvance: () => void;
}) {
  const item = session.items[session.currentIndex];
  const startQuestion = useInterviewStore((state) => state.startQuestion);
  const saveDraft = useInterviewStore((state) => state.saveDraft);
  const submitQuestion = useInterviewStore((state) => state.submitQuestion);
  const [now, setNow] = useState(Date.now);
  const remaining = item.startedAt
    ? remainingSeconds(item.startedAt, session.secondsPerQuestion, now)
    : session.secondsPerQuestion;

  useEffect(() => {
    if (!item.startedAt || item.submittedAt) return;
    const startedAt = item.startedAt;
    const interval = setInterval(() => {
      const time = Date.now();
      setNow(time);
      if (remainingSeconds(startedAt, session.secondsPerQuestion, time) === 0)
        submitQuestion(session.id);
    }, 250);
    return () => clearInterval(interval);
  }, [
    item.startedAt,
    item.submittedAt,
    session.id,
    session.secondsPerQuestion,
    submitQuestion,
  ]);

  return (
    <section className="mt-10" aria-label="限时作答">
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-[var(--line-strong)] py-4">
        <p>
          第 {session.currentIndex + 1} / {session.items.length} 题
        </p>
        <p
          role="timer"
          aria-label="本题剩余时间"
          className="text-lg font-semibold text-[var(--text-strong)]"
        >
          {Math.floor(remaining / 60)
            .toString()
            .padStart(2, "0")}
          :{(remaining % 60).toString().padStart(2, "0")}
        </p>
        <Link href="/interview" className="study-link">
          保存并返回
        </Link>
      </div>
      <h2 className="mt-6 text-2xl leading-snug font-semibold text-[var(--text-strong)]">
        {item.questionTitle}
      </h2>
      {!content && (
        <p className="mt-5 leading-7">
          这道题已暂不可用。原有回答会保留，可以跳过本题后继续。
        </p>
      )}
      {!item.startedAt && !item.submittedAt && content && (
        <div className="mt-6">
          <p className="mb-4 text-sm">
            开始后展示完整题目并计时，参考答案在整轮作答结束后显示。
          </p>
          <button
            type="button"
            className="study-button study-button-primary"
            onClick={() => startQuestion(session.id)}
          >
            开始本题
          </button>
        </div>
      )}
      {item.startedAt && content && (
        <div className="mt-8">{content.prompt}</div>
      )}
      {item.startedAt && (
        <label className="study-label mt-8">
          你的回答（可留空）
          <textarea
            className="study-input min-h-56 leading-7"
            maxLength={10000}
            value={item.text}
            disabled={!!item.submittedAt || remaining === 0}
            onChange={(event) => saveDraft(session.id, event.target.value)}
          />
          <span className="text-xs font-normal text-[var(--text-faint)]">
            可以口述，也可以记录文字。最多 10000 字，输入时保存。
          </span>
        </label>
      )}
      {item.submittedAt ? (
        <div className="mt-6">
          <p role="status" className="mb-4 text-sm">
            {item.skipped
              ? "本题已跳过。"
              : item.timedOut
                ? "时间到，已保存回答并停止编辑。"
                : "本题已提交。"}{" "}
            用时 {item.elapsedSeconds} 秒。
          </p>
          <button
            className="study-button study-button-primary"
            type="button"
            onClick={onAdvance}
          >
            {session.currentIndex + 1 === session.items.length
              ? "结束作答，开始自评"
              : "下一题"}
          </button>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="study-button study-button-primary"
            type="button"
            disabled={!item.startedAt || remaining === 0 || !content}
            onClick={() => submitQuestion(session.id)}
          >
            提交本题
          </button>
          <button
            className="study-button"
            type="button"
            onClick={() => submitQuestion(session.id, true)}
          >
            跳过本题
          </button>
        </div>
      )}
    </section>
  );
}

export function InterviewReview({
  session,
  questionId,
  content,
  availableQuestionIds,
}: {
  session: InterviewSession;
  questionId: string;
  content: InterviewQuestionContent | null;
  availableQuestionIds: string[];
}) {
  const assessQuestion = useInterviewStore((state) => state.assessQuestion);
  const completeSession = useInterviewStore((state) => state.completeSession);
  const setStatus = useProgressStore((state) => state.setStatus);
  const progressHydrated = useProgressStore((state) => state.hasHydrated);
  const [message, setMessage] = useState("");
  const item = session.items.find((value) => value.questionId === questionId)!;
  const unassessed = session.items.filter(
    (value) => !value.skipped && !value.assessment,
  ).length;
  const completed = session.status === "completed";

  function applyAssessments() {
    let count = 0;
    for (const response of session.items) {
      if (
        response.assessment &&
        availableQuestionIds.includes(response.questionId)
      ) {
        setStatus(response.questionId, response.assessment);
        count++;
      }
    }
    setMessage(`已将 ${count} 道题的自评更新到学习状态。`);
  }

  return (
    <section className="mt-10" aria-label="本轮面试结果">
      <div className="border-y border-[var(--line-strong)] py-5">
        <h2 className="text-xl font-medium text-[var(--text-strong)]">
          {completed ? "本轮自评已完成" : "对照答案，完成本轮自评"}
        </h2>
        <p className="mt-3 text-sm leading-7">
          {assessments
            .map(
              ({ value, label }) =>
                `${label} ${session.items.filter((response) => response.assessment === value).length} 道`,
            )
            .join("，")}
          ，跳过 {session.items.filter((response) => response.skipped).length}{" "}
          道。结果来自你的自评，不是自动评分。
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {completed ? (
            <button
              type="button"
              className="study-button"
              disabled={!progressHydrated}
              onClick={applyAssessments}
            >
              将本轮自评更新到学习状态
            </button>
          ) : (
            <button
              type="button"
              className="study-button study-button-primary"
              disabled={unassessed > 0}
              onClick={() => completeSession(session.id)}
            >
              完成本轮自评
            </button>
          )}
          <Link href="/interview" className="study-button">
            返回模拟面试
          </Link>
        </div>
        {!completed && (
          <p role="status" className="mt-3 text-sm">
            还有 {unassessed} 道已作答题目待自评。跳过的题目可不自评。
          </p>
        )}
        {message && (
          <p role="status" className="mt-3 text-sm">
            {message}
          </p>
        )}
      </div>
      <nav aria-label="自评题目导航" className="my-6 flex flex-wrap gap-2">
        {session.items.map((response, index) => (
          <Link
            key={response.questionId}
            href={interviewHref(session, response.questionId)}
            aria-current={
              response.questionId === questionId ? "page" : undefined
            }
            className={`study-button ${response.questionId === questionId ? "study-button-primary" : ""}`}
            aria-label={`查看第 ${index + 1} 题${response.assessment ? "，已自评" : ""}`}
          >
            {index + 1}
            {response.assessment ? " ✓" : ""}
          </Link>
        ))}
      </nav>
      <h3 className="text-2xl leading-snug font-semibold text-[var(--text-strong)]">
        {item.questionTitle}
      </h3>
      <p className="mt-3 text-sm">
        用时 {item.elapsedSeconds} 秒{item.timedOut ? "，限时结束" : ""}
        {item.skipped ? "，已跳过" : ""}
      </p>
      {content && <div className="mt-6">{content.prompt}</div>}
      <section
        className="mt-8 border-l-2 border-[var(--accent)] pl-5"
        aria-label="已保存的回答"
      >
        <h4 className="font-medium text-[var(--text-strong)]">我的回答</h4>
        <p className="mt-3 text-sm leading-7 break-words whitespace-pre-wrap">
          {item.text || "没有记录文字回答。"}
        </p>
      </section>
      {content ? (
        <AnswerDisclosure>{content.answer}</AnswerDisclosure>
      ) : (
        <p className="mt-8 text-sm">这道题暂不可用，回答和自评记录仍保留。</p>
      )}
      <p className="mt-3 text-xs">参考答案使用当前题库内容。</p>
      <div
        role="group"
        aria-label="本题自评"
        className="mt-6 flex flex-wrap gap-3"
      >
        {assessments.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className="study-button"
            aria-pressed={item.assessment === value}
            disabled={completed}
            onClick={() => assessQuestion(session.id, item.questionId, value)}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
