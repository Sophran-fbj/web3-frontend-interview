import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import * as React from "react";

import matter from "gray-matter";

import { categoryOrder } from "@/content/question-config";

import {
  questionFrontmatterSchema,
  type QuestionFrontmatter,
} from "./question-schema";

const questionsDirectory = path.join(process.cwd(), "content", "questions");
const devCacheTtlMs = 3000;

export type QuestionDocument = {
  frontmatter: QuestionFrontmatter;
  body: string;
};

type RepositoryCache = {
  questions: QuestionDocument[];
  bySlug: Map<string, QuestionDocument>;
  expiresAt: number;
};

let repoCache: RepositoryCache | undefined;
let pendingLoad: Promise<RepositoryCache> | undefined;

const requestCache: <T extends (...args: never[]) => unknown>(fn: T) => T =
  typeof React.cache === "function"
    ? React.cache
    : <T extends (...args: never[]) => unknown>(fn: T): T => fn;

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

async function loadRepository(): Promise<RepositoryCache> {
  const now = Date.now();
  if (repoCache && now < repoCache.expiresAt) {
    return repoCache;
  }

  if (!pendingLoad) {
    pendingLoad = (async () => {
      const files = await findQuestionFiles(questionsDirectory);
      const questions = (await Promise.all(files.map(readQuestion))).sort(
        (left, right) => {
          const categoryDifference =
            categoryOrder.indexOf(left.frontmatter.category) -
            categoryOrder.indexOf(right.frontmatter.category);

          if (categoryDifference !== 0) return categoryDifference;
          return left.frontmatter.id.localeCompare(right.frontmatter.id, "en");
        },
      );

      const bySlug = new Map(
        questions.map((question) => [question.frontmatter.slug, question]),
      );

      const expiresAt =
        process.env.NODE_ENV === "development"
          ? Date.now() + devCacheTtlMs
          : Number.POSITIVE_INFINITY;

      const snapshot: RepositoryCache = { questions, bySlug, expiresAt };
      repoCache = snapshot;
      return snapshot;
    })().finally(() => {
      pendingLoad = undefined;
    });
  }

  return pendingLoad;
}

export async function getAllQuestions(): Promise<QuestionDocument[]> {
  const { questions } = await loadRepository();
  return questions;
}

export async function getQuestionBySlug(
  slug: string,
): Promise<QuestionDocument | undefined> {
  const { bySlug } = await loadRepository();
  return bySlug.get(slug);
}

function contentPreviewEnabled() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.CONTENT_PREVIEW === "true"
  );
}

export function isPublicQuestionStatus(status: QuestionFrontmatter["status"]) {
  return status === "review" || status === "verified";
}

export const getVisibleQuestions = requestCache(
  async (): Promise<QuestionDocument[]> => {
    const questions = await getAllQuestions();

    if (contentPreviewEnabled()) return questions;
    return questions.filter(({ frontmatter }) =>
      isPublicQuestionStatus(frontmatter.status),
    );
  },
);

export const getVisibleQuestionBySlug = requestCache(
  async (slug: string): Promise<QuestionDocument | undefined> => {
    const question = await getQuestionBySlug(slug);
    if (!question) return undefined;

    if (
      contentPreviewEnabled() ||
      isPublicQuestionStatus(question.frontmatter.status)
    ) {
      return question;
    }
    return undefined;
  },
);
