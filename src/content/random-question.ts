export type RandomQuestionCandidate = {
  id: string;
  slug: string;
};

export function pickRandomQuestion(
  candidates: RandomQuestionCandidate[],
  lastQuestionId?: string,
  randomValue = Math.random(),
): RandomQuestionCandidate | undefined {
  if (candidates.length === 0) return undefined;

  const eligible =
    candidates.length > 1
      ? candidates.filter((candidate) => candidate.id !== lastQuestionId)
      : candidates;
  const normalizedRandom = Math.min(Math.max(randomValue, 0), 0.999999999999);
  return eligible[Math.floor(normalizedRandom * eligible.length)];
}
