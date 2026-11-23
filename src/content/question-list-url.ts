import type { QuestionFilters } from "./question-filter";

export type ProgressFilter = "all" | "unmastered" | "review" | "mastered";

export function parseProgressFilter(value: string | undefined): ProgressFilter {
  if (value === "unmastered" || value === "review" || value === "mastered") {
    return value;
  }
  return "all";
}

export type QuestionListState = QuestionFilters & {
  page?: number;
  progress?: ProgressFilter;
};

export function createQuestionsHref(state: QuestionListState) {
  const params = new URLSearchParams();

  if (state.query) params.set("q", state.query);
  if (state.difficulty) params.set("difficulty", state.difficulty);
  if (state.category) params.set("category", state.category);
  if (state.questionType) params.set("type", state.questionType);
  if (state.stack) params.set("stack", state.stack);
  if (state.progress && state.progress !== "all") {
    params.set("progress", state.progress);
  }
  if (state.page && state.page > 1) params.set("page", String(state.page));

  const query = params.toString();
  return query ? `/questions?${query}` : "/questions";
}

/**
 * 题库列表的回程查询串（未编码形态，如 `q=钱包&page=2`）。
 * 值中的 `%&=+#` 会被转义，保证经一次 URL 编码/解码后仍能
 * 被 URLSearchParams 无损还原。默认列表返回 undefined，
 * 详情链接保持原样，不追加参数。
 */
export function createQuestionListBackQuery(state: QuestionListState) {
  const href = createQuestionsHref(state);
  if (href === "/questions") return undefined;
  const params = new URLSearchParams(href.slice("/questions?".length));
  const parts: string[] = [];
  params.forEach((value, key) => {
    parts.push(
      `${key}=${value.replace(/[%&=+#]/g, (char) => encodeURIComponent(char))}`,
    );
  });
  return parts.join("&");
}

/**
 * 为详情页链接追加回程参数；backQuery 为已解码的列表查询串。
 */
export function appendQuestionBackParam(
  detailHref: string,
  backQuery: string | null | undefined,
) {
  return backQuery
    ? `${detailHref}?back=${encodeURIComponent(backQuery)}`
    : detailHref;
}

export function createQuestionDetailHref(
  slug: string,
  state: QuestionListState,
) {
  return appendQuestionBackParam(
    `/questions/${slug}`,
    createQuestionListBackQuery(state),
  );
}

/**
 * 把回程参数还原为题库列表链接；非法输入经 URLSearchParams 规整，
 * 列表页只会忽略未知参数，不会产生副作用。
 */
export function createQuestionsHrefFromBack(
  backQuery: string | null | undefined,
) {
  if (!backQuery) return "/questions";
  const params = new URLSearchParams(backQuery);
  const normalized = params.toString();
  return normalized ? `/questions?${normalized}` : "/questions";
}
