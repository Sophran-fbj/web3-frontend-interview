export const questionsPerPage = 10;

export function paginateQuestions<T>(items: T[], requestedPage: number) {
  const totalPages = Math.ceil(items.length / questionsPerPage);
  const validPage =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const currentPage = Math.min(validPage, Math.max(totalPages, 1));

  return {
    currentPage,
    totalPages,
    items: items.slice(
      (currentPage - 1) * questionsPerPage,
      currentPage * questionsPerPage,
    ),
  };
}
