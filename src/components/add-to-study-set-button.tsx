"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { useLearningReady } from "@/components/learning-account-provider";
import { useStudySetStore } from "@/stores/use-study-set-store";

export function AddToStudySetButton({ questionId }: { questionId: string }) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const learningReady = useLearningReady();
  const studySets = useStudySetStore((state) => state.studySets);
  const hasHydrated = useStudySetStore((state) => state.hasHydrated);
  const ready = hasHydrated && learningReady;
  const createStudySet = useStudySetStore((state) => state.createStudySet);
  const addQuestion = useStudySetStore((state) => state.addQuestion);
  const removeQuestion = useStudySetStore((state) => state.removeQuestion);

  const orderedSets = Object.values(studySets).sort(
    (a, b) =>
      a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
  );
  const joinedCount = ready
    ? orderedSets.filter((set) => set.questionIds.includes(questionId)).length
    : 0;

  useEffect(() => {
    if (!open) return;

    function handleOutsidePointer(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("pointerdown", handleOutsidePointer);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleQuickCreate(event: FormEvent) {
    event.preventDefault();
    const id = createStudySet(newName);
    if (!id) {
      setError("请输入 1–80 个字符的题单名称。");
      return;
    }
    addQuestion(id, questionId);
    setNewName("");
    setError("");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={
          joinedCount > 0 ? `加入题单（已加入 ${joinedCount} 个）` : "加入题单"
        }
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex h-11 items-center gap-2 rounded-full border px-3.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
          joinedCount > 0
            ? "border-[var(--accent)] bg-[var(--surface-hover)] text-[var(--accent-bright)]"
            : "border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text-strong)]"
        }`}
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0">
          <path
            d="M2.5 4h7M2.5 8h7M2.5 12h4.5M12 9.5v4M10 11.5h4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
        </svg>
        <span className="hidden sm:inline">加入题单</span>
        {joinedCount > 0 && (
          <span className="rounded-full bg-[var(--accent)] px-1.5 py-0.5 font-mono text-[10px] leading-none text-[var(--on-accent)] tabular-nums">
            {joinedCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="选择或新建题单"
          className="popover-panel absolute top-[calc(100%+0.5rem)] right-0 z-40 w-72 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-[var(--line-strong)] bg-[var(--canvas-raised)] p-3.5 shadow-[0_18px_48px_var(--shadow)]"
        >
          <p className="text-xs font-semibold text-[var(--text-strong)]">
            加入自定义题单
          </p>

          {!ready ? (
            <p role="status" className="mt-3 text-xs text-[var(--text-faint)]">
              正在读取本地题单…
            </p>
          ) : (
            <>
              {orderedSets.length === 0 ? (
                <p className="mt-2.5 text-xs text-[var(--text-faint)]">
                  还没有题单，在下方创建一个并自动加入本题。
                </p>
              ) : (
                <ul className="filter-options mt-2.5 max-h-48 space-y-1 overflow-y-auto">
                  {orderedSets.map((set) => {
                    const included = set.questionIds.includes(questionId);
                    return (
                      <li key={set.id}>
                        <button
                          type="button"
                          aria-pressed={included}
                          onClick={() =>
                            included
                              ? removeQuestion(set.id, questionId)
                              : addQuestion(set.id, questionId)
                          }
                          className={`flex min-h-9 w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
                            included
                              ? "bg-[var(--surface)] font-medium text-[var(--text-strong)]"
                              : "text-[var(--text-muted)] hover:bg-[var(--surface)]/70 hover:text-[var(--text-strong)]"
                          }`}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span
                              aria-hidden="true"
                              className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                                included
                                  ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]"
                                  : "border-[var(--line-strong)] bg-[var(--canvas-raised)]"
                              }`}
                            >
                              {included && (
                                <svg viewBox="0 0 12 12" className="size-3">
                                  <path
                                    d="M2.5 6.2 5 8.7 9.5 3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.6"
                                  />
                                </svg>
                              )}
                            </span>
                            <span className="truncate">{set.name}</span>
                          </span>
                          <span className="shrink-0 font-mono text-[11px] text-[var(--text-faint)] tabular-nums">
                            {set.questionIds.length}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <form
                onSubmit={handleQuickCreate}
                className="mt-3 flex gap-2 border-t border-[var(--line)] pt-3"
              >
                <input
                  type="text"
                  value={newName}
                  maxLength={80}
                  onChange={(event) => {
                    setNewName(event.target.value);
                    if (error) setError("");
                  }}
                  placeholder="新建题单名称…"
                  aria-label="新建题单名称"
                  className="min-h-9 min-w-0 flex-1 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-2.5 text-xs text-[var(--text-strong)] placeholder:text-[var(--text-faint)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-9 shrink-0 items-center rounded-lg bg-[var(--accent)] px-3 text-xs font-medium text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-bright)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                >
                  新建
                </button>
              </form>
              {error && (
                <p
                  role="alert"
                  className="mt-1.5 text-[11px] text-[var(--danger)]"
                >
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
