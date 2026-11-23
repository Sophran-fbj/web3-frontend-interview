"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useLearningReady } from "@/components/learning-account-provider";
import { CustomSelect } from "@/components/ui/custom-select";
import { categoryLabels, categoryOrder } from "@/content/question-config";
import { difficultyLabels } from "@/content/question-labels";
import type { QuestionSummary } from "@/content/question-summary";
import {
  interviewHref,
  selectInterviewQuestions,
  type InterviewSource,
} from "@/lib/interviews";
import { useBookmarkStore } from "@/stores/use-bookmark-store";
import { useInterviewStore } from "@/stores/use-interview-store";
import { useProgressStore } from "@/stores/use-progress-store";
import { useStudySetStore } from "@/stores/use-study-set-store";

const sourceLabels = {
  filtered: "题库",
  review: "复习列表",
  bookmarks: "我的收藏",
} as const;
const statusLabels = {
  answering: "练习中",
  reviewing: "待自评",
  completed: "已完成",
} as const;
const statusBadgeClass = {
  answering: "study-badge study-badge-info",
  reviewing: "study-badge study-badge-warning",
  completed: "study-badge study-badge-success",
} as const;

export function InterviewSetup({
  questions,
  initialStudySetId,
}: {
  questions: QuestionSummary[];
  initialStudySetId?: string;
}) {
  const router = useRouter();
  const learningReady = useLearningReady();
  const progress = useProgressStore((state) => state.progress);
  const progressHydrated = useProgressStore((state) => state.hasHydrated);
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const bookmarksHydrated = useBookmarkStore((state) => state.hasHydrated);
  const studySets = useStudySetStore((state) => state.studySets);
  const setsHydrated = useStudySetStore((state) => state.hasHydrated);
  const sessions = useInterviewStore((state) => state.sessions);
  const createSession = useInterviewStore((state) => state.createSession);
  const deleteSession = useInterviewStore((state) => state.deleteSession);
  const [source, setSource] = useState(
    initialStudySetId ? `set:${initialStudySetId}` : "filtered",
  );
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [count, setCount] = useState(5);
  const [seconds, setSeconds] = useState(120);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string>();
  const selectedSet = source.startsWith("set:")
    ? studySets[source.slice(4)]
    : undefined;
  const byId = new Map(questions.map((question) => [question.id, question]));
  const pool = source.startsWith("set:")
    ? (selectedSet?.questionIds ?? []).flatMap((id) =>
        byId.get(id) ? [byId.get(id)!] : [],
      )
    : questions.filter(({ id }) =>
        source === "review"
          ? progress[id]?.status === "unclear" ||
            progress[id]?.status === "review"
          : source === "bookmarks"
            ? !!bookmarks[id]
            : true,
      );
  const candidates = pool.filter(
    (question) =>
      (!category || question.category === category) &&
      (!difficulty || question.difficulty === difficulty),
  );
  const actualCount = Math.min(candidates.length, Math.max(1, count), 20);

  function start(event: FormEvent) {
    event.preventDefault();
    const sourceType: InterviewSource = source.startsWith("set:")
      ? "study-set"
      : source === "review"
        ? "review"
        : source === "bookmarks"
          ? "bookmarks"
          : "filtered";
    const id = createSession({
      source: sourceType,
      sourceId: selectedSet?.id ?? null,
      sourceLabel:
        selectedSet?.name ??
        sourceLabels[sourceType === "study-set" ? "filtered" : sourceType],
      secondsPerQuestion: seconds,
      questions: selectInterviewQuestions(
        candidates,
        count,
        sourceType === "study-set",
      ),
    });
    if (!id) {
      setError("无法开始练习，请检查题目数量和限时设置。");
      return;
    }
    router.push(interviewHref(useInterviewStore.getState().sessions[id]));
  }

  if (
    !progressHydrated ||
    !bookmarksHydrated ||
    !setsHydrated ||
    !learningReady
  )
    return (
      <p role="status" className="mt-10 text-sm text-[var(--text-muted)]">
        正在读取本地选题范围…
      </p>
    );

  const sourceOptions = [
    { value: "filtered", label: "题库（随机抽题）" },
    { value: "review", label: "复习列表" },
    { value: "bookmarks", label: "我的收藏" },
    ...(source.startsWith("set:") && !selectedSet
      ? [{ value: source, label: "题单暂不可用", disabled: true }]
      : []),
    ...Object.values(studySets).map((set) => ({
      value: `set:${set.id}`,
      label: `题单：${set.name}`,
    })),
  ];

  const categoryOptions = [
    { value: "", label: "全部分类" },
    ...categoryOrder.map((id) => ({
      value: id,
      label: categoryLabels[id],
    })),
  ];

  const difficultyOptions = [
    { value: "", label: "全部难度" },
    ...Object.entries(difficultyLabels).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  const timeOptions = [60, 120, 180, 300].map((value) => ({
    value: String(value),
    label: `${value / 60} 分钟`,
  }));

  return (
    <div className="mt-10 space-y-10">
      <form onSubmit={start} className="study-card grid gap-5 p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <CustomSelect
            label="选题范围"
            value={source}
            onChange={setSource}
            options={sourceOptions}
          />
          <CustomSelect
            label="分类"
            value={category}
            onChange={setCategory}
            options={categoryOptions}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <CustomSelect
            label="难度"
            value={difficulty}
            onChange={setDifficulty}
            options={difficultyOptions}
          />
          <CustomSelect
            label="每题限时"
            value={String(seconds)}
            onChange={(value) => setSeconds(Number(value))}
            options={timeOptions}
          />
          <label className="study-label">
            本轮题数（1–20）
            <input
              className="study-input font-mono tabular-nums"
              type="number"
              required
              min={1}
              max={20}
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="flex flex-col gap-4 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              role="status"
              className="text-sm leading-6 text-[var(--text-muted)]"
            >
              可选 {candidates.length} 道，本轮练习 {actualCount} 道。
              {selectedSet ? "按题单顺序取题。" : "随机抽取，题目不重复。"}
            </p>
            <p className="mt-1 text-xs text-[var(--text-faint)]">
              每题点击开始后计时，刷新或离开页面不会重置计时。
            </p>
          </div>
          <button
            type="submit"
            disabled={actualCount === 0}
            className="study-button study-button-primary shrink-0"
          >
            开始一轮面试
          </button>
        </div>

        {candidates.length === 0 && (
          <p className="rounded-xl border border-[var(--warning-border)] bg-[var(--warning-soft)] px-4 py-3 text-sm text-[var(--warning)]">
            这个范围没有可练习的题目，请调整筛选，或先收藏、标记题目。
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-[var(--danger)]">
            {error}
          </p>
        )}
      </form>

      <section aria-labelledby="interview-history-title">
        <h2
          id="interview-history-title"
          className="text-xl font-semibold text-[var(--text-strong)]"
        >
          本地练习记录
        </h2>
        {Object.keys(sessions).length === 0 ? (
          <div className="study-card mt-4 p-6 text-sm text-[var(--text-muted)]">
            还没有练习记录。开始一轮面试后，可随时返回这里继续或回看自评。
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {Object.values(sessions)
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((session) => (
                <li
                  key={session.id}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--canvas-raised)] p-5 transition-colors hover:border-[var(--line-strong)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <p className="font-medium text-[var(--text-strong)]">
                          {session.sourceLabel}：{session.items.length} 道题
                        </p>
                        <span className={statusBadgeClass[session.status]}>
                          {statusLabels[session.status]}
                        </span>
                      </div>
                      <p className="mt-2 font-mono text-xs text-[var(--text-faint)] tabular-nums">
                        {new Date(session.createdAt).toLocaleString("zh-CN")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={interviewHref(session)}
                        className="study-button"
                      >
                        {session.status === "answering"
                          ? "继续面试"
                          : "查看结果"}
                      </Link>
                      <button
                        type="button"
                        className="study-button study-button-danger"
                        aria-label={`删除练习记录：${session.sourceLabel}`}
                        onClick={() => setDeleting(session.id)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  {deleting === session.id && (
                    <div className="study-alert-danger mt-4">
                      <p className="text-sm">
                        删除本轮草稿和自评记录？已更新的学习状态会保留。
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <button
                          className="study-button study-button-danger"
                          type="button"
                          onClick={() => {
                            deleteSession(session.id);
                            setDeleting(undefined);
                          }}
                        >
                          确认删除练习记录
                        </button>
                        <button
                          className="study-button"
                          type="button"
                          onClick={() => setDeleting(undefined)}
                        >
                          保留记录
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
