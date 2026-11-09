"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { categoryLabels, categoryOrder } from "@/content/question-config";
import type { QuestionSummary } from "@/content/question-summary";
import type { StudySet } from "@/lib/study-sets";
import { useProgressStore } from "@/stores/use-progress-store";
import { useStudySetStore } from "@/stores/use-study-set-store";

export function StudySetManager({
  questions,
}: {
  questions: QuestionSummary[];
}) {
  const sets = useStudySetStore((state) => state.studySets);
  const hydrated = useStudySetStore((state) => state.hasHydrated);
  const createStudySet = useStudySetStore((state) => state.createStudySet);
  const [selectedId, setSelectedId] = useState<string>();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const ordered = Object.values(sets).sort(
    (a, b) =>
      a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
  );
  const selected = ordered.find((item) => item.id === selectedId) ?? ordered[0];

  function create(event: FormEvent) {
    event.preventDefault();
    const id = createStudySet(name);
    if (!id) {
      setError("请输入 1–80 个字符的题单名称。");
      return;
    }
    setSelectedId(id);
    setName("");
    setError("");
  }

  if (!hydrated)
    return (
      <p role="status" className="mt-10">
        正在读取本地题单…
      </p>
    );

  return (
    <div className="mt-10 grid items-start gap-10 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="min-w-0 border-y border-[var(--line)] py-5">
        <form onSubmit={create} className="grid gap-3">
          <label className="study-label">
            新题单名称
            <input
              className="study-input"
              required
              maxLength={80}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <button className="study-button study-button-primary" type="submit">
            创建题单
          </button>
          {error && (
            <p role="alert" className="text-sm">
              {error}
            </p>
          )}
        </form>
        <nav aria-label="我的题单" className="mt-6 grid gap-2">
          {ordered.map((item) => (
            <button
              key={item.id}
              className="study-button justify-between text-left break-all"
              type="button"
              aria-pressed={selected?.id === item.id}
              onClick={() => setSelectedId(item.id)}
            >
              <span>{item.name}</span>
              <span className="shrink-0 text-xs">
                {item.questionIds.length} 题
              </span>
            </button>
          ))}
        </nav>
      </aside>
      {selected ? (
        <StudySetEditor
          key={selected.id}
          studySet={selected}
          questions={questions}
        />
      ) : (
        <p className="py-6 text-sm leading-7">
          还没有题单。先创建一个，再从题库中选择要练习的题目。
        </p>
      )}
    </div>
  );
}

function StudySetEditor({
  studySet,
  questions,
}: {
  studySet: StudySet;
  questions: QuestionSummary[];
}) {
  const updateMetadata = useStudySetStore((state) => state.updateMetadata);
  const deleteStudySet = useStudySetStore((state) => state.deleteStudySet);
  const addQuestion = useStudySetStore((state) => state.addQuestion);
  const removeQuestion = useStudySetStore((state) => state.removeQuestion);
  const moveQuestion = useStudySetStore((state) => state.moveQuestion);
  const progress = useProgressStore((state) => state.progress);
  const progressHydrated = useProgressStore((state) => state.hasHydrated);
  const [name, setName] = useState(studySet.name);
  const [description, setDescription] = useState(studySet.description);
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const byId = new Map(questions.map((question) => [question.id, question]));
  const available = studySet.questionIds.flatMap((id) =>
    byId.get(id) ? [byId.get(id)!] : [],
  );
  const mastered = available.filter(
    ({ id }) => progress[id]?.status === "mastered",
  ).length;
  const next =
    available.find(({ id }) => progress[id]?.status !== "mastered") ??
    available[0];
  const candidates = questions.filter(
    (question) =>
      (!category || question.category === category) &&
      `${question.title} ${question.summary}`
        .normalize("NFKC")
        .toLocaleLowerCase("zh-CN")
        .includes(query.normalize("NFKC").trim().toLocaleLowerCase("zh-CN")),
  );

  function save(event: FormEvent) {
    event.preventDefault();
    setMessage(
      updateMetadata(studySet.id, name, description)
        ? "题单信息已保存。"
        : "名称需为 1–80 个字符，说明最多 500 个字符。",
    );
  }

  return (
    <section className="min-w-0" aria-label="题单编辑">
      <form onSubmit={save} className="grid gap-4">
        <label className="study-label">
          题单名称
          <input
            className="study-input"
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="study-label">
          题单说明
          <textarea
            className="study-input min-h-24"
            maxLength={500}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="study-button">
            保存题单信息
          </button>
          <button
            type="button"
            className="study-button"
            onClick={() => setConfirmDelete(true)}
          >
            删除题单
          </button>
        </div>
        {message && (
          <p role="status" className="text-sm">
            {message}
          </p>
        )}
      </form>
      {confirmDelete && (
        <div
          role="group"
          aria-label="确认删除题单"
          className="mt-4 border border-[var(--line-strong)] p-4"
        >
          <p className="text-sm leading-7">
            删除“{studySet.name}”？题目的学习状态和收藏会保留。
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              className="study-button"
              onClick={() => deleteStudySet(studySet.id)}
            >
              确认删除题单
            </button>
            <button
              type="button"
              className="study-button"
              onClick={() => setConfirmDelete(false)}
            >
              保留题单
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-[var(--line)] py-4">
        <p className="text-sm" role="status">
          {progressHydrated
            ? `已掌握 ${mastered} / ${available.length} 道`
            : "正在读取本地进度…"}
        </p>
        {next && progressHydrated && (
          <Link
            href={`/questions/${next.slug}`}
            className="study-button study-button-primary"
          >
            继续练习
          </Link>
        )}
        {available.length > 0 && (
          <Link
            href={`/interview?${new URLSearchParams({ set: studySet.id })}`}
            className="study-button"
          >
            按题单模拟面试
          </Link>
        )}
      </div>
      {available.length < studySet.questionIds.length && (
        <p className="mt-3 text-sm">
          有 {studySet.questionIds.length - available.length}{" "}
          道题暂不可用，未计入进度；原有引用已保留，可以手动移除。
        </p>
      )}
      <ol aria-label="题单中的题目" className="divide-y divide-[var(--line)]">
        {studySet.questionIds.map((id, index) => {
          const question = byId.get(id);
          const title = question?.title ?? `暂不可用的题目（${id}）`;
          return (
            <li
              key={id}
              className="flex flex-wrap items-start justify-between gap-3 py-5"
            >
              <div className="min-w-0 flex-1">
                <span className="mr-2 text-xs text-[var(--text-faint)]">
                  {index + 1}.
                </span>
                {question ? (
                  <Link
                    href={`/questions/${question.slug}`}
                    className="study-link break-words"
                  >
                    {title}
                  </Link>
                ) : (
                  <span className="text-sm break-all">{title}</span>
                )}
                {progressHydrated && progress[id]?.status === "mastered" && (
                  <p className="mt-2 text-xs text-[var(--accent-bright)]">
                    已掌握
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="study-button px-2"
                  aria-label={`上移：${title}`}
                  disabled={index === 0}
                  onClick={() => moveQuestion(studySet.id, id, -1)}
                >
                  上移
                </button>
                <button
                  type="button"
                  className="study-button px-2"
                  aria-label={`下移：${title}`}
                  disabled={index === studySet.questionIds.length - 1}
                  onClick={() => moveQuestion(studySet.id, id, 1)}
                >
                  下移
                </button>
                <button
                  type="button"
                  className="study-button px-2"
                  aria-label={`移除：${title}`}
                  onClick={() => removeQuestion(studySet.id, id)}
                >
                  移除
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      {studySet.questionIds.length === 0 && (
        <p className="py-6 text-sm">题单还是空的，从下方选择题目加入。</p>
      )}

      <section
        className="mt-10 border-t border-[var(--line-strong)] pt-6"
        aria-labelledby="add-questions-title"
      >
        <h2
          id="add-questions-title"
          className="text-lg font-medium text-[var(--text-strong)]"
        >
          添加题目
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="study-label">
            搜索题目
            <input
              type="search"
              className="study-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
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
        </div>
        <p role="status" className="mt-4 text-xs">
          找到 {candidates.length} 道题
        </p>
        <ul
          aria-label="可添加的题目"
          className="mt-3 max-h-96 divide-y divide-[var(--line)] overflow-y-auto"
        >
          {candidates.map((question) => {
            const added = studySet.questionIds.includes(question.id);
            return (
              <li
                key={question.id}
                className="flex items-start justify-between gap-3 py-4"
              >
                <div className="min-w-0">
                  <p className="text-sm text-[var(--text-strong)]">
                    {question.title}
                  </p>
                  <p className="mt-1 text-xs">
                    {categoryLabels[question.category]}
                  </p>
                </div>
                <button
                  type="button"
                  className="study-button shrink-0"
                  disabled={added}
                  aria-label={`${added ? "已加入" : "加入题单"}：${question.title}`}
                  onClick={() => addQuestion(studySet.id, question.id)}
                >
                  {added ? "已加入" : "加入"}
                </button>
              </li>
            );
          })}
        </ul>
        {candidates.length === 0 && (
          <p className="py-6 text-sm">没有找到题目，请调整关键词或分类。</p>
        )}
      </section>
    </section>
  );
}
