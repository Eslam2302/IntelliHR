"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  itemName?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  total,
  perPage,
  onPageChange,
  isLoading = false,
  itemName = "items",
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={`bg-gray-50 px-6 py-4 border-t border-gray-200 ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-700">
          Showing{" "}
          <span className="font-semibold">
            {Math.min((currentPage - 1) * perPage + 1, total)}
          </span>{" "}
          to <span className="font-semibold">{Math.min(currentPage * perPage, total)}</span> of{" "}
          <span className="font-semibold">{total}</span> {itemName}
          <span className="ml-2 text-xs text-gray-500">
            (Page {currentPage} of {totalPages})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || isLoading}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  disabled={isLoading}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentPage === page
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  {page}
                </button>
              ),
            )}
          </div>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || isLoading}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
