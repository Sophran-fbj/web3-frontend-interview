import type { MetadataRoute } from "next";

import {
  getAllQuestions,
  isPublicQuestionStatus,
} from "@/content/question-repository";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  if (!siteUrl || process.env.CONTENT_PREVIEW === "true") return [];

  const questions = await getAllQuestions();

  return [
    { url: new URL("/", siteUrl).toString() },
    { url: new URL("/questions", siteUrl).toString() },
    ...questions
      .filter(({ frontmatter }) => isPublicQuestionStatus(frontmatter.status))
      .map(({ frontmatter }) => ({
        url: new URL(`/questions/${frontmatter.slug}`, siteUrl).toString(),
      })),
  ];
}
