"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { useLearningReady } from "@/components/learning-account-provider";
import { DifficultyBadge } from "@/components/ui/semantic-badges";
import {
  categoryLabels,
  type QuestionCategory,
} from "@/content/question-config";
import {
  difficultyLabels,
  questionTypeLabels,
} from "@/content/question-labels";
import type { QuestionFrontmatter } from "@/content/question-schema";
import { pickRandomQuestion } from "@/content/random-question";
import {
  applyTheme,
  getServerThemeSnapshot,
  getThemeSnapshot,
  subscribeToTheme,
  themeDescriptions,
  themeLabels,
  themes,
  type Theme,
} from "@/lib/theme";
import {
  useProgressStore,
  type LearningStatus,
} from "@/stores/use-progress-store";
import { useSyncExternalStore } from "react";

export type IndexedQuestion = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: QuestionCategory;
  difficulty: QuestionFrontmatter["difficulty"];
  questionType: QuestionFrontmatter["questionType"];
  stacks: string[];
};

type PaletteItem =
  | {
      key: string;
      kind: "question";
      question: IndexedQuestion;
    }
  | {
      key: string;
      kind: "action";
      action: "random" | "navigate" | "search";
      label: string;
      hint: string;
      href?: string;
    }
  | {
      key: string;
      kind: "theme";
      theme: Theme;
    };

let cachedQuestions: IndexedQuestion[] | null = null;
const lastRandomQuestionKey = "web3-interview-last-random-question";

const statusDotColors: Record<Exclude<LearningStatus, "unseen">, string> = {
  mastered: "bg-[var(--success)]",
  review: "bg-[var(--warning)]",
  unclear: "bg-[var(--danger)]",
};

const statusTitles: Record<Exclude<LearningStatus, "unseen">, string> = {
  mastered: "已掌握",
  review: "待复习",
  unclear: "不清楚",
};

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

function normalizeText(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("zh-CN").trim();
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<IndexedQuestion[]>(
    () => cachedQuestions ?? [],
  );
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const learningReady = useLearningReady();
  const progress = useProgressStore((state) => state.progress);
  const progressHydrated = useProgressStore((state) => state.hasHydrated);
  const progressReady = progressHydrated && learningReady;
  const currentTheme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const loadIndex = useCallback(async () => {
    if (cachedQuestions) {
      setItems(cachedQuestions);
      return;
    }
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetch("/api/questions-index");
      if (!response.ok) throw new Error("failed");
      const data = (await response.json()) as IndexedQuestion[];
      cachedQuestions = data;
      setItems(data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const openPalette = useCallback(() => {
    lastFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
    void loadIndex();
  }, [loadIndex]);

  const closePalette = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => {
      lastFocusedRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    function handleGlobalKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) {
          closePalette();
        } else {
          openPalette();
        }
        return;
      }

      if (
        !open &&
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !isEditableElement(event.target)
      ) {
        event.preventDefault();
        openPalette();
      }
    }

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [open, openPalette, closePalette]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [open]);

  const openRandom = useCallback(() => {
    let lastId: string | undefined;
    try {
      lastId = localStorage.getItem(lastRandomQuestionKey) ?? undefined;
    } catch {
      // 忽略本地存储读取异常。
    }
    const picked = pickRandomQuestion(items, lastId);
    if (!picked) {
      closePalette();
      router.push("/questions");
      return;
    }
    try {
      localStorage.setItem(lastRandomQuestionKey, picked.id);
    } catch {
      // 忽略本地存储写入异常。
    }
    setOpen(false);
    router.push(`/questions/${picked.slug}`);
  }, [closePalette, items, router]);

  const trimmedQuery = normalizeText(query);

  const matchedQuestions = useMemo(() => {
    if (!trimmedQuery) return [];
    const tokens = trimmedQuery.split(/\s+/).filter(Boolean);
    return items
      .filter((question) => {
        const haystack = normalizeText(
          [
            question.title,
            question.summary,
            categoryLabels[question.category],
            difficultyLabels[question.difficulty],
            questionTypeLabels[question.questionType],
            question.stacks.join(" "),
          ].join(" "),
        );
        return tokens.every((token) => haystack.includes(token));
      })
      .slice(0, 12);
  }, [items, trimmedQuery]);

  const paletteItems: PaletteItem[] = useMemo(() => {
    if (!trimmedQuery) {
      const actions: PaletteItem[] = [
        {
          key: "action-random",
          kind: "action",
          action: "random",
          label: "随机抽一题",
          hint:
            items.length > 0 ? `从 ${items.length} 题中随机抽取` : "随机练习",
        },
        {
          key: "action-questions",
          kind: "action",
          action: "navigate",
          label: "浏览全部题目",
          hint: "/questions",
          href: "/questions",
        },
        {
          key: "action-interview",
          kind: "action",
          action: "navigate",
          label: "开始模拟面试",
          hint: "/interview",
          href: "/interview",
        },
        {
          key: "action-review",
          kind: "action",
          action: "navigate",
          label: "复习列表与错题本",
          hint: "/review",
          href: "/review",
        },
        {
          key: "action-bookmarks",
          kind: "action",
          action: "navigate",
          label: "我的收藏",
          hint: "/bookmarks",
          href: "/bookmarks",
        },
        {
          key: "action-study-sets",
          kind: "action",
          action: "navigate",
          label: "我的题单",
          hint: "/study-sets",
          href: "/study-sets",
        },
      ];
      const themeActions: PaletteItem[] = themes.map((theme) => ({
        key: `theme-${theme}`,
        kind: "theme",
        theme,
      }));
      return [...actions, ...themeActions];
    }

    const questionRows: PaletteItem[] = matchedQuestions.map((question) => ({
      key: `question-${question.id}`,
      kind: "question",
      question,
    }));

    questionRows.push({
      key: "action-search-page",
      kind: "action",
      action: "search",
      label: `在题库中筛选“${query.trim()}”`,
      hint: "跳转题库页",
      href: `/questions?q=${encodeURIComponent(query.trim())}`,
    });

    return questionRows;
  }, [items.length, matchedQuestions, query, trimmedQuery]);

  const clampedActiveIndex =
    paletteItems.length === 0
      ? 0
      : Math.min(activeIndex, paletteItems.length - 1);

  function executeItem(item: PaletteItem | undefined) {
    if (!item) return;
    if (item.kind === "question") {
      setOpen(false);
      router.push(`/questions/${item.question.slug}`);
    } else if (item.kind === "theme") {
      applyTheme(item.theme);
      closePalette();
    } else if (item.action === "random") {
      openRandom();
    } else if (item.href) {
      setOpen(false);
      router.push(item.href);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closePalette();
      return;
    }

    if (paletteItems.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = (clampedActiveIndex + 1) % paletteItems.length;
      setActiveIndex(next);
      optionRefs.current[next]?.scrollIntoView?.({ block: "nearest" });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const next =
        (clampedActiveIndex - 1 + paletteItems.length) % paletteItems.length;
      setActiveIndex(next);
      optionRefs.current[next]?.scrollIntoView?.({ block: "nearest" });
    } else if (event.key === "Enter") {
      event.preventDefault();
      executeItem(paletteItems[clampedActiveIndex]);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        aria-label="快速搜索与命令面板"
        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)]/85 px-2.5 text-xs text-[var(--text-muted)] shadow-[inset_0_1px_0_var(--control-highlight)] transition-colors duration-150 hover:border-[var(--accent)] hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:px-3"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="size-3.5 shrink-0 text-[var(--text-faint)]"
        >
          <circle
            cx="8.5"
            cy="8.5"
            r="5.25"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="m12.5 12.5 4 4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.6"
          />
        </svg>
        <span className="hidden sm:inline">搜索题目…</span>
        <kbd className="hidden rounded border border-[var(--line)] bg-[var(--canvas-raised)] px-1.5 py-0.5 font-mono text-[10px] leading-none text-[var(--text-faint)] md:inline">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-[var(--canvas)]/72 px-4 pt-14 backdrop-blur-sm sm:pt-24"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) closePalette();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="全局搜索与快捷导航"
            onKeyDown={handleKeyDown}
            className="popover-panel w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-[var(--canvas-raised)] shadow-[0_24px_64px_var(--shadow)]"
          >
            <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3.5">
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="size-4 shrink-0 text-[var(--accent-bright)]"
              >
                <circle
                  cx="8.5"
                  cy="8.5"
                  r="5.25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="m12.5 12.5 4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.6"
                />
              </svg>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                placeholder="输入关键词、技术栈（如 viem / EIP-712）或分类…"
                aria-label="搜索题目与快捷操作"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-strong)] placeholder:text-[var(--text-faint)] focus:outline-none"
              />
              <button
                type="button"
                onClick={closePalette}
                aria-label="关闭命令面板"
                className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 py-1 font-mono text-[11px] text-[var(--text-faint)] hover:text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                ESC
              </button>
            </div>

            <div className="filter-options max-h-[60vh] overflow-y-auto p-2">
              {loading && (
                <p
                  role="status"
                  className="px-3 py-4 text-xs text-[var(--text-faint)]"
                >
                  正在索引题库…
                </p>
              )}
              {loadError && (
                <p
                  role="alert"
                  className="px-3 py-3 text-xs text-[var(--danger)]"
                >
                  题库索引读取失败，仍可使用下方快捷跳转。
                </p>
              )}

              {!trimmedQuery ? (
                <div className="space-y-2 py-1">
                  <p className="px-3 pt-1 text-[11px] font-medium tracking-wider text-[var(--text-faint)] uppercase">
                    快捷导航
                  </p>
                  {paletteItems.map((item, index) => {
                    if (item.kind !== "action") return null;
                    const active = index === clampedActiveIndex;
                    return (
                      <button
                        key={item.key}
                        ref={(node) => {
                          optionRefs.current[index] = node;
                        }}
                        type="button"
                        onClick={() => executeItem(item)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                          active
                            ? "bg-[var(--surface)] text-[var(--text-strong)]"
                            : "text-[var(--text-muted)] hover:bg-[var(--surface)]/70"
                        }`}
                      >
                        <span className="font-medium">{item.label}</span>
                        <span className="font-mono text-xs text-[var(--text-faint)]">
                          {item.hint}
                        </span>
                      </button>
                    );
                  })}

                  <p className="px-3 pt-3 text-[11px] font-medium tracking-wider text-[var(--text-faint)] uppercase">
                    切换阅读主题
                  </p>
                  {paletteItems.map((item, index) => {
                    if (item.kind !== "theme") return null;
                    const active = index === clampedActiveIndex;
                    const selected = currentTheme === item.theme;
                    return (
                      <button
                        key={item.key}
                        ref={(node) => {
                          optionRefs.current[index] = node;
                        }}
                        type="button"
                        onClick={() => executeItem(item)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                          active
                            ? "bg-[var(--surface)] text-[var(--text-strong)]"
                            : "text-[var(--text-muted)] hover:bg-[var(--surface)]/70"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="font-medium">
                            {themeLabels[item.theme]}主题
                          </span>
                          <span className="text-xs text-[var(--text-faint)]">
                            {themeDescriptions[item.theme]}
                          </span>
                        </span>
                        {selected && (
                          <span className="study-badge study-badge-info">
                            当前
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1 py-1">
                  {matchedQuestions.length === 0 && !loading && (
                    <p className="px-3 py-4 text-sm text-[var(--text-muted)]">
                      未找到直接匹配的题目，按回车前往题库页进行正文搜索。
                    </p>
                  )}
                  {paletteItems.map((item, index) => {
                    const active = index === clampedActiveIndex;
                    if (item.kind === "question") {
                      const q = item.question;
                      const record = progressReady ? progress[q.id] : undefined;
                      const status =
                        record && record.status !== "unseen"
                          ? record.status
                          : null;

                      return (
                        <button
                          key={item.key}
                          ref={(node) => {
                            optionRefs.current[index] = node;
                          }}
                          type="button"
                          onClick={() => executeItem(item)}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={`flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                            active
                              ? "bg-[var(--surface)] text-[var(--text-strong)]"
                              : "text-[var(--text-muted)] hover:bg-[var(--surface)]/70"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              {status && (
                                <span
                                  aria-label={statusTitles[status]}
                                  title={statusTitles[status]}
                                  className={`size-2 shrink-0 rounded-full ${statusDotColors[status]}`}
                                />
                              )}
                              <span className="truncate text-sm font-medium text-[var(--text-strong)]">
                                {q.title}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-xs text-[var(--text-faint)]">
                              {categoryLabels[q.category]} · {q.summary}
                            </p>
                          </div>
                          <DifficultyBadge
                            difficulty={q.difficulty}
                            className="mt-0.5 shrink-0"
                          />
                        </button>
                      );
                    }

                    if (item.kind === "action") {
                      return (
                        <button
                          key={item.key}
                          ref={(node) => {
                            optionRefs.current[index] = node;
                          }}
                          type="button"
                          onClick={() => executeItem(item)}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={`mt-1 flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-dashed border-[var(--line)] px-3 py-2 text-left text-sm transition-colors ${
                            active
                              ? "border-[var(--accent)] bg-[var(--surface)] text-[var(--text-strong)]"
                              : "text-[var(--accent-bright)] hover:bg-[var(--surface)]/70"
                          }`}
                        >
                          <span className="font-medium">{item.label}</span>
                          <span className="font-mono text-xs text-[var(--text-faint)]">
                            ↵
                          </span>
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[var(--line)] bg-[var(--surface)]/45 px-4 py-2 text-[11px] text-[var(--text-faint)]">
              <div className="flex items-center gap-3">
                <span>↑↓ 移动</span>
                <span>↵ 打开</span>
                <span>ESC 关闭</span>
              </div>
              <span className="font-mono tabular-nums">
                {items.length > 0 ? `${items.length} 道题已索引` : ""}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
