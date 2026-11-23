"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AnswerDisclosure } from "@/components/answer-disclosure";
import type { InterviewQuestionContent } from "@/components/interview-app";
import { useLearningReady } from "@/components/learning-account-provider";
import {
  interviewHref,
  remainingSeconds,
  type InterviewAssessment,
  type InterviewSession,
} from "@/lib/interviews";
import { useInterviewStore } from "@/stores/use-interview-store";
import { useProgressStore } from "@/stores/use-progress-store";

const assessments: {
  value: InterviewAssessment;
  label: string;
  activeClass: string;
}[] = [
  {
    value: "unclear",
    label: "不清楚",
    activeClass:
      "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]",
  },
  {
    value: "review",
    label: "待复习",
    activeClass:
      "border-[var(--warning-border)] bg-[var(--warning-soft)] text-[var(--warning)]",
  },
  {
    value: "mastered",
    label: "已掌握",
    activeClass:
      "border-[var(--success-border)] bg-[var(--success-soft)] text-[var(--success)]",
  },
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

  const timerTone =
    remaining <= 10
      ? "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)]"
      : remaining <= 30
        ? "border-[var(--warning-border)] bg-[var(--warning-soft)] text-[var(--warning)]"
        : "border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text-strong)]";

  const progressPct = Math.round(
    ((session.currentIndex + (item.submittedAt ? 1 : 0)) /
      session.items.length) *
      100,
  );

  return (
    <section className="mt-10" aria-label="限时作答">
      <div className="study-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-medium text-[var(--text-strong)] tabular-nums">
              第 {session.currentIndex + 1} / {session.items.length} 题
            </span>
          </div>
          <p
            role="timer"
            aria-label="本题剩余时间"
            className={`rounded-lg border px-3 py-1 font-mono text-lg font-semibold tabular-nums transition-colors ${timerTone}`}
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
        <div aria-hidden="true" className="h-1 w-full bg-[var(--surface)]">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${Math.max(progressPct, 4)}%` }}
          />
        </div>
      </div>

      <h2 className="mt-8 text-2xl leading-snug font-semibold text-[var(--text-strong)]">
        {item.questionTitle}
      </h2>

      {!content && (
        <p className="mt-5 leading-7 text-[var(--text-muted)]">
          这道题已暂不可用。原有回答会保留，可以跳过本题后继续。
        </p>
      )}

      {!item.startedAt && !item.submittedAt && content && (
        <div className="study-card mt-6 p-6">
          <p className="text-sm leading-6 text-[var(--text-muted)]">
            开始后展示完整题目并计时，参考答案在整轮作答结束后统一展示。
          </p>
          <button
            type="button"
            className="study-button study-button-primary mt-4"
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
        <div className="mt-8">
          <label className="study-label">
            <span className="flex items-center justify-between gap-2">
              <span>你的回答（可留空）</span>
              <span className="font-mono text-xs font-normal text-[var(--text-faint)] tabular-nums">
                {item.text.length} / 10000
              </span>
            </span>
            <textarea
              className="study-input min-h-56 leading-7"
              maxLength={10000}
              placeholder="在此梳理关键点、边界条件或状态流……"
              value={item.text}
              disabled={!!item.submittedAt || remaining === 0}
              onChange={(event) => saveDraft(session.id, event.target.value)}
            />
          </label>
          <p className="mt-2 text-xs text-[var(--text-faint)]">
            可以口述，也可以记录文字。最多 10000 字，输入时自动保存。
          </p>
        </div>
      )}

      {item.submittedAt ? (
        <div className="study-card mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
          <p role="status" className="text-sm text-[var(--text-strong)]">
            {item.skipped
              ? "本题已跳过。"
              : item.timedOut
                ? "时间到，已保存回答并停止编辑。"
                : "本题已提交。"}{" "}
            <span className="font-mono text-xs text-[var(--text-muted)] tabular-nums">
              用时 {item.elapsedSeconds} 秒
            </span>
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
  const learningReady = useLearningReady();
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
      <div className="study-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-[var(--text-strong)]">
            {completed ? "本轮自评已完成" : "对照答案，完成本轮自评"}
          </h2>
          <span
            className={
              completed
                ? "study-badge study-badge-success"
                : "study-badge study-badge-warning"
            }
          >
            {completed ? "已完成" : `待自评 ${unassessed} 题`}
          </span>
        </div>

        <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
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
              className="study-button study-button-primary"
              disabled={!progressHydrated || !learningReady}
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
          <p role="status" className="mt-3 text-xs text-[var(--text-faint)]">
            还有 {unassessed} 道已作答题目待自评。跳过的题目可不自评。
          </p>
        )}
        {message && (
          <p role="status" className="mt-3 text-sm text-[var(--success)]">
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
            className={`study-button font-mono tabular-nums ${response.questionId === questionId ? "study-button-primary" : ""}`}
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
      <p className="mt-2 font-mono text-xs text-[var(--text-faint)] tabular-nums">
        用时 {item.elapsedSeconds} 秒{item.timedOut ? " · 限时结束" : ""}
        {item.skipped ? " · 已跳过" : ""}
      </p>

      {content && <div className="mt-6">{content.prompt}</div>}

      <section
        className="study-card mt-8 border-l-2 border-l-[var(--accent)] p-5"
        aria-label="已保存的回答"
      >
        <h4 className="text-sm font-semibold text-[var(--text-strong)]">
          我的回答
        </h4>
        <p className="mt-3 text-sm leading-7 break-words whitespace-pre-wrap text-[var(--text-muted)]">
          {item.text || "没有记录文字回答。"}
        </p>
      </section>

      {content ? (
        <AnswerDisclosure defaultOpen>{content.answer}</AnswerDisclosure>
      ) : (
        <p className="mt-8 text-sm text-[var(--text-muted)]">
          这道题暂不可用，回答和自评记录仍保留。
        </p>
      )}
      <p className="mt-3 text-xs text-[var(--text-faint)]">
        参考答案使用当前题库内容。
      </p>

      <div className="study-card mt-6 p-5">
        <p className="text-sm font-semibold text-[var(--text-strong)]">
          本题自评
        </p>
        <div
          role="group"
          aria-label="本题自评"
          className="mt-3 flex flex-wrap gap-3"
        >
          {assessments.map(({ value, label, activeClass }) => {
            const pressed = item.assessment === value;
            return (
              <button
                key={value}
                type="button"
                className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 ${
                  pressed
                    ? activeClass
                    : "border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text-strong)] hover:border-[var(--accent)]"
                }`}
                aria-pressed={pressed}
                disabled={completed}
                onClick={() =>
                  assessQuestion(session.id, item.questionId, value)
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
