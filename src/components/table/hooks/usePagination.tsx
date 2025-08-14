
import { useState, useMemo } from 'react';

export const usePagination = (totalItems: number, initialPageSize: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialPageSize);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Reset to page 1 if current page exceeds total pages
  const validCurrentPage = useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
      return 1;
    }
    return currentPage;
  }, [currentPage, totalPages]);

  const paginateItems = <T,>(items: T[]): T[] => {
    if (!items || items.length === 0) return [];
    const validStartIndex = (validCurrentPage - 1) * itemsPerPage;
    const validEndIndex = validStartIndex + itemsPerPage;
    return items.slice(validStartIndex, validEndIndex);
  };

  return {
    currentPage: validCurrentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    paginateItems
  };
};
