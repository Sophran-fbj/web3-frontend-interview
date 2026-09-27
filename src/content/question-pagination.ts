export const questionsPerPage = 10;
const maxVisiblePageNumbers = 10;

export function getVisiblePageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= maxVisiblePageNumbers) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const middleCount = maxVisiblePageNumbers - 2;
  const middleStart = Math.min(
    Math.max(currentPage - Math.floor(middleCount / 2), 2),
    totalPages - middleCount,
  );

  return [
    1,
    ...Array.from({ length: middleCount }, (_, index) => middleStart + index),
    totalPages,
  ];
}

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
