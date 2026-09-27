const issueBase =
  "https://github.com/Sophran-fbj/web3-frontend-interview/issues/new";

function issueLink(template: string, fields: Record<string, string> = {}) {
  const params = new URLSearchParams({ template, ...fields });
  return `${issueBase}?${params}`;
}

export const correctionIssueLink = (question?: string) =>
  issueLink("content-correction.yml", question ? { question } : {});

export const questionSuggestionLink = issueLink("question-suggestion.yml");
export const interviewExperienceLink = issueLink("interview-experience.yml");
