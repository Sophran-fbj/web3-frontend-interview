"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

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

export function InterviewSetup({
  questions,
  initialStudySetId,
}: {
  questions: QuestionSummary[];
  initialStudySetId?: string;
}) {
  const router = useRouter();
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

  if (!progressHydrated || !bookmarksHydrated || !setsHydrated)
    return (
      <p role="status" className="mt-10">
        正在读取本地选题范围…
      </p>
    );

  return (
    <div className="mt-10">
      <form
        onSubmit={start}
        className="grid gap-5 border-y border-[var(--line-strong)] py-6"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="study-label">
            选题范围
            <select
              className="study-input"
              value={source}
              onChange={(event) => setSource(event.target.value)}
            >
              <option value="filtered">题库（随机抽题）</option>
              <option value="review">复习列表</option>
              <option value="bookmarks">我的收藏</option>
              {source.startsWith("set:") && !selectedSet && (
                <option value={source} disabled>
                  题单暂不可用
                </option>
              )}
              {Object.values(studySets).map((set) => (
                <option key={set.id} value={`set:${set.id}`}>
                  题单：{set.name}
                </option>
              ))}
            </select>
          </label>
          <label className="study-label">
            分类
            <select
              className="study-input"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">全部分类</option>
              {categoryOrder.map((id) => (
                <option key={id} value={id}>
                  {categoryLabels[id]}
                </option>
              ))}
            </select>
          </label>
          <label className="study-label">
            难度
            <select
              className="study-input"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
            >
              <option value="">全部难度</option>
              {Object.entries(difficultyLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="study-label">
            每题限时
            <select
              className="study-input"
              value={seconds}
              onChange={(event) => setSeconds(Number(event.target.value))}
            >
              {[60, 120, 180, 300].map((value) => (
                <option key={value} value={value}>
                  {value / 60} 分钟
                </option>
              ))}
            </select>
          </label>
          <label className="study-label">
            本轮题数（1–20）
            <input
              className="study-input"
              type="number"
              required
              min={1}
              max={20}
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
            />
          </label>
        </div>
        <p role="status" className="text-sm leading-7">
          可选 {candidates.length} 道，本轮练习 {actualCount} 道。
          {selectedSet ? "按题单顺序取题。" : "随机抽取，题目不重复。"}
          每题点击开始后计时，刷新或离开页面不会重置计时。
        </p>
        {candidates.length === 0 && (
          <p className="text-sm">
            这个范围没有可练习的题目，请调整筛选，或先收藏、标记题目。
          </p>
        )}
        {error && <p role="alert">{error}</p>}
        <button
          type="submit"
          disabled={actualCount === 0}
          className="study-button study-button-primary justify-self-start"
        >
          开始一轮面试
        </button>
      </form>

      <section className="mt-12" aria-labelledby="interview-history-title">
        <h2
          id="interview-history-title"
          className="text-xl font-medium text-[var(--text-strong)]"
        >
          本地练习记录
        </h2>
        {Object.keys(sessions).length === 0 && (
          <p className="mt-4 text-sm">
            还没有练习记录。开始后可以随时返回这里继续。
          </p>
        )}
        <ul className="mt-4 divide-y divide-[var(--line)]">
          {Object.values(sessions)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((session) => (
              <li key={session.id} className="py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-[var(--text-strong)]">
                      {session.sourceLabel}：{session.items.length} 道题
                    </p>
                    <p className="mt-2 text-xs">
                      {statusLabels[session.status]}，
                      {new Date(session.createdAt).toLocaleString("zh-CN")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={interviewHref(session)}
                      className="study-button"
                    >
                      {session.status === "answering" ? "继续面试" : "查看结果"}
                    </Link>
                    <button
                      type="button"
                      className="study-button"
                      aria-label={`删除练习记录：${session.sourceLabel}`}
                      onClick={() => setDeleting(session.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
                {deleting === session.id && (
                  <div className="mt-4">
                    <p className="text-sm">
                      删除本轮草稿和自评记录？已更新的学习状态会保留。
                    </p>
                    <div className="mt-3 flex gap-3">
                      <button
                        className="study-button"
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
      </section>
    </div>
  );
}
