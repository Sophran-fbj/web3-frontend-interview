import type { QuestionDocument } from "@/content/question-repository";
import type { QuestionFrontmatter } from "@/content/question-schema";

export type QuestionSummary = Pick<
  QuestionFrontmatter,
  | "id"
  | "slug"
  | "title"
  | "summary"
  | "category"
  | "difficulty"
  | "questionType"
>;

export function toQuestionSummary({
  frontmatter,
}: QuestionDocument): QuestionSummary {
  const { id, slug, title, summary, category, difficulty, questionType } =
    frontmatter;
  return { id, slug, title, summary, category, difficulty, questionType };
}
