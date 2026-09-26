import type { QuestionFilters } from "./question-filter";

export type QuestionListState = QuestionFilters & {
  page?: number;
};

export function createQuestionsHref(state: QuestionListState) {
  const params = new URLSearchParams();

  if (state.query) params.set("q", state.query);
  if (state.difficulty) params.set("difficulty", state.difficulty);
  if (state.category) params.set("category", state.category);
  if (state.questionType) params.set("type", state.questionType);
  if (state.stack) params.set("stack", state.stack);
  if (state.page && state.page > 1) params.set("page", String(state.page));

  const query = params.toString();
  return query ? `/questions?${query}` : "/questions";
}
