import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

import {
  questionFrontmatterSchema,
  type QuestionFrontmatter,
} from "./question-schema";

const questionsDirectory = path.join(process.cwd(), "content", "questions");
const categoryOrder: QuestionFrontmatter["category"][] = [
  "web3-basics",
  "wallet",
  "signing",
  "transaction",
  "contract",
  "data",
  "security",
  "performance-ux",
  "architecture",
  "business-scenario",
];

export type QuestionDocument = {
  frontmatter: QuestionFrontmatter;
  body: string;
};

async function findQuestionFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) return findQuestionFiles(entryPath);
      if (/\.mdx?$/.test(entry.name)) return [entryPath];
      return [];
    }),
  );

  return files.flat();
}

async function readQuestion(file: string): Promise<QuestionDocument> {
  const source = await readFile(file, "utf8");
  const { data, content } = matter(source);
  const frontmatter = questionFrontmatterSchema.parse(data);

  return { frontmatter, body: content };
}

export async function getAllQuestions(): Promise<QuestionDocument[]> {
  const files = await findQuestionFiles(questionsDirectory);
  const questions = await Promise.all(files.map(readQuestion));

  return questions.sort((left, right) => {
    const categoryDifference =
      categoryOrder.indexOf(left.frontmatter.category) -
      categoryOrder.indexOf(right.frontmatter.category);

    if (categoryDifference !== 0) return categoryDifference;
    return left.frontmatter.id.localeCompare(right.frontmatter.id, "en");
  });
}

export async function getQuestionBySlug(
  slug: string,
): Promise<QuestionDocument | undefined> {
  const questions = await getAllQuestions();
  return questions.find((question) => question.frontmatter.slug === slug);
}

function contentPreviewEnabled() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.CONTENT_PREVIEW === "true"
  );
}

export async function getVisibleQuestions(): Promise<QuestionDocument[]> {
  const questions = await getAllQuestions();

  if (contentPreviewEnabled()) return questions;
  return questions.filter(
    ({ frontmatter }) => frontmatter.status === "verified",
  );
}

export async function getVisibleQuestionBySlug(
  slug: string,
): Promise<QuestionDocument | undefined> {
  const questions = await getVisibleQuestions();
  return questions.find((question) => question.frontmatter.slug === slug);
}
