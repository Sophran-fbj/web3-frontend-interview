import type { QuestionDocument } from "./question-repository";
import type { QuestionFrontmatter } from "./question-schema";

export type QuestionFilters = {
  query?: string;
  difficulty?: QuestionFrontmatter["difficulty"];
  category?: QuestionFrontmatter["category"];
  questionType?: QuestionFrontmatter["questionType"];
  stack?: string;
};

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("zh-CN").trim();
}

export function filterQuestions(
  questions: QuestionDocument[],
  filters: QuestionFilters,
): QuestionDocument[] {
  const query = filters.query ? normalize(filters.query) : "";

  return questions.filter(({ frontmatter, body }) => {
    if (filters.difficulty && frontmatter.difficulty !== filters.difficulty)
      return false;

    if (filters.category && frontmatter.category !== filters.category)
      return false;

    if (
      filters.questionType &&
      frontmatter.questionType !== filters.questionType
    )
      return false;

    if (filters.stack && !(filters.stack in frontmatter.stacks)) return false;

    if (!query) return true;

    const searchableText = normalize(
      [
        frontmatter.title,
        frontmatter.summary,
        frontmatter.tags.join(" "),
        frontmatter.ecosystems.join(" "),
        Object.keys(frontmatter.stacks).join(" "),
        body,
      ].join("\n"),
    );

    return searchableText.includes(query);
  });
}
