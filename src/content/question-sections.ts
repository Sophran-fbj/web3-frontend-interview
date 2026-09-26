const answerHeading = "## 30 秒回答";

export type QuestionSections = {
  prompt: string;
  answer?: string;
};

export function splitQuestionSections(body: string): QuestionSections {
  const answerStart = body.indexOf(answerHeading);

  if (answerStart === -1) return { prompt: body.trim() };

  return {
    prompt: body.slice(0, answerStart).trim(),
    answer: body.slice(answerStart).trim(),
  };
}
