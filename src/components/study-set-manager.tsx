"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { useLearningReady } from "@/components/learning-account-provider";
import { CustomSelect } from "@/components/ui/custom-select";
import { DifficultyBadge } from "@/components/ui/semantic-badges";
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
  const learningReady = useLearningReady();
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

  if (!hydrated || !learningReady)
    return (
      <p role="status" className="mt-10 text-sm text-[var(--text-muted)]">
        正在读取本地题单…
      </p>
    );

  return (
    <div className="mt-10 grid items-start gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="study-card min-w-0 p-4 sm:p-5">
        <form onSubmit={create} className="grid gap-3">
          <label className="study-label">
            新题单名称
            <input
              className="study-input"
              required
              maxLength={80}
              placeholder="例如：钱包与签名冲刺"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <button className="study-button study-button-primary" type="submit">
            创建题单
          </button>
          {error && (
            <p role="alert" className="text-xs text-[var(--danger)]">
              {error}
            </p>
          )}
        </form>
        {ordered.length > 0 && (
          <nav
            aria-label="我的题单"
            className="mt-5 grid gap-2 border-t border-[var(--line)] pt-5"
          >
            {ordered.map((item) => (
              <button
                key={item.id}
                className="study-button justify-between text-left break-all"
                type="button"
                aria-pressed={selected?.id === item.id}
                onClick={() => setSelectedId(item.id)}
              >
                <span className="truncate">{item.name}</span>
                <span className="shrink-0 font-mono text-xs tabular-nums opacity-80">
                  {item.questionIds.length} 题
                </span>
              </button>
            ))}
          </nav>
        )}
      </aside>
      {selected ? (
        <StudySetEditor
          key={selected.id}
          studySet={selected}
          questions={questions}
        />
      ) : (
        <div className="study-card p-8 text-center">
          <p className="text-base font-medium text-[var(--text-strong)]">
            还没有自定义题单
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
            先在左侧创建一个题单，再从题库中选择要练习的题目。
          </p>
        </div>
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
  const learningReady = useLearningReady();
  const progress = useProgressStore((state) => state.progress);
  const progressHydrated = useProgressStore((state) => state.hasHydrated);
  const progressReady = progressHydrated && learningReady;
  const [editingMeta, setEditingMeta] = useState(false);
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
  const progressPct =
    available.length > 0 ? Math.round((mastered / available.length) * 100) : 0;
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
    const saved = updateMetadata(studySet.id, name, description);
    setMessage(
      saved
        ? "题单信息已保存。"
        : "名称需为 1–80 个字符，说明最多 500 个字符。",
    );
    if (saved) setEditingMeta(false);
  }

  return (
    <section className="min-w-0 space-y-6" aria-label="题单编辑">
      <div className="study-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-[var(--text-strong)] sm:text-2xl">
              {studySet.name}
            </h2>
            {studySet.description && (
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                {studySet.description}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="study-button"
              onClick={() => {
                setEditingMeta((current) => !current);
                setMessage("");
              }}
            >
              {editingMeta ? "取消编辑" : "编辑信息"}
            </button>
            <button
              type="button"
              className="study-button study-button-danger"
              onClick={() => setConfirmDelete(true)}
            >
              删除题单
            </button>
          </div>
        </div>

        <div className="mt-5 border-t border-[var(--line)] pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p
              className="font-mono text-sm text-[var(--text-muted)] tabular-nums"
              role="status"
            >
              {progressReady
                ? `已掌握 ${mastered} / ${available.length} 道`
                : "正在读取本地进度…"}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {next && progressReady && (
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
          </div>
          {progressReady && available.length > 0 && (
            <div
              aria-hidden="true"
              className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface)]"
            >
              <div
                className="h-full bg-[var(--success)] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}
        </div>

        {message && (
          <p role="status" className="mt-4 text-xs text-[var(--success)]">
            {message}
          </p>
        )}

        {editingMeta && (
          <form
            onSubmit={save}
            className="mt-5 grid gap-4 border-t border-[var(--line)] pt-5"
          >
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
              <button
                type="submit"
                className="study-button study-button-primary"
              >
                保存题单信息
              </button>
            </div>
          </form>
        )}

        {confirmDelete && (
          <div
            role="group"
            aria-label="确认删除题单"
            className="study-alert-danger mt-5"
          >
            <p className="leading-6">
              删除“{studySet.name}”？题目的学习状态和收藏会保留。
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                className="study-button study-button-danger"
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
      </div>

      {available.length < studySet.questionIds.length && (
        <p className="rounded-xl border border-[var(--warning-border)] bg-[var(--warning-soft)] px-4 py-3 text-sm text-[var(--warning)]">
          有 {studySet.questionIds.length - available.length}{" "}
          道题暂不可用，未计入进度；原有引用已保留，可以手动移除。
        </p>
      )}

      <div className="study-card p-5 sm:p-6">
        <h3 className="text-base font-semibold text-[var(--text-strong)]">
          题单列表
        </h3>
        <ol
          aria-label="题单中的题目"
          className="mt-2 divide-y divide-[var(--line)]"
        >
          {studySet.questionIds.map((id, index) => {
            const question = byId.get(id);
            const title = question?.title ?? `暂不可用的题目（${id}）`;
            const isMastered =
              progressReady && progress[id]?.status === "mastered";

            return (
              <li
                key={id}
                className="flex flex-wrap items-start justify-between gap-3 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-[var(--text-faint)] tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {question ? (
                      <Link
                        href={`/questions/${question.slug}`}
                        className="font-medium break-words text-[var(--text-strong)] transition-colors hover:text-[var(--accent-bright)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
                      >
                        {title}
                      </Link>
                    ) : (
                      <span className="text-sm break-all text-[var(--text-muted)]">
                        {title}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 pl-6 text-xs">
                    {question && (
                      <>
                        <DifficultyBadge difficulty={question.difficulty} />
                        <span className="text-[var(--text-faint)]">
                          {categoryLabels[question.category]}
                        </span>
                      </>
                    )}
                    {isMastered && (
                      <span className="study-badge study-badge-success">
                        已掌握
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    className="study-button min-h-9 px-2.5 text-xs"
                    aria-label={`上移：${title}`}
                    disabled={index === 0}
                    onClick={() => moveQuestion(studySet.id, id, -1)}
                  >
                    上移
                  </button>
                  <button
                    type="button"
                    className="study-button min-h-9 px-2.5 text-xs"
                    aria-label={`下移：${title}`}
                    disabled={index === studySet.questionIds.length - 1}
                    onClick={() => moveQuestion(studySet.id, id, 1)}
                  >
                    下移
                  </button>
                  <button
                    type="button"
                    className="study-button min-h-9 px-2.5 text-xs text-[var(--danger)] hover:border-[var(--danger)]"
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
          <p className="py-6 text-sm text-[var(--text-muted)]">
            题单还是空的，从下方选择题目加入。
          </p>
        )}
      </div>

      <section
        className="study-card p-5 sm:p-6"
        aria-labelledby="add-questions-title"
      >
        <h2
          id="add-questions-title"
          className="text-lg font-semibold text-[var(--text-strong)]"
        >
          添加题目
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="study-label">
            搜索题目
            <input
              type="search"
              className="study-input"
              placeholder="输入标题或关键词…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <CustomSelect
            label="分类"
            value={category}
            onChange={setCategory}
            options={[
              { value: "", label: "全部分类" },
              ...categoryOrder.map((id) => ({
                value: id,
                label: categoryLabels[id],
              })),
            ]}
          />
        </div>
        <p
          role="status"
          className="mt-4 font-mono text-xs text-[var(--text-faint)] tabular-nums"
        >
          找到 {candidates.length} 道题
        </p>
        <ul
          aria-label="可添加的题目"
          className="filter-options mt-3 max-h-96 divide-y divide-[var(--line)] overflow-y-auto"
        >
          {candidates.map((question) => {
            const added = studySet.questionIds.includes(question.id);
            return (
              <li
                key={question.id}
                className="flex items-start justify-between gap-3 py-3.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-strong)]">
                    {question.title}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                    <DifficultyBadge difficulty={question.difficulty} />
                    <span className="text-[var(--text-faint)]">
                      {categoryLabels[question.category]}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="study-button min-h-9 shrink-0 px-3 text-xs"
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
          <p className="py-6 text-sm text-[var(--text-muted)]">
            没有找到题目，请调整关键词或分类。
          </p>
        )}
      </section>
    </section>
  );
}
