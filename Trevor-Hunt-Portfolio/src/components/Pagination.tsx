import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}) => {
  // Calculate the range of items being shown
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    // Responsive max visible pages - fewer on mobile
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const maxVisiblePages = isMobile ? 3 : 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, current page range, and last page
      const showRange = Math.floor(maxVisiblePages / 2);

      if (currentPage <= showRange + 1) {
        // Show first pages + ... + last page
        for (
          let i = 1;
          i <= Math.min(maxVisiblePages - 1, totalPages - 1);
          i++
        ) {
          pages.push(i);
        }
        if (totalPages > maxVisiblePages) {
          pages.push("...");
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - showRange) {
        // Show first page + ... + last pages
        pages.push(1);
        if (totalPages > maxVisiblePages) {
          pages.push("...");
        }
        for (let i = totalPages - (maxVisiblePages - 2); i <= totalPages; i++) {
          if (i > 1) pages.push(i);
        }
      } else {
        // Show first page + ... + current page range + ... + last page
        pages.push(1);
        pages.push("...");
        for (
          let i = currentPage - Math.floor(showRange / 2);
          i <= currentPage + Math.floor(showRange / 2);
          i++
        ) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col items-center space-y-3 mt-8">
      {/* Items count - hidden on very small screens */}
      <div className="hidden xs:block text-sm text-gray-600 text-center">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2 sm:px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
          }`}
          aria-label="Go to previous page"
        >
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </button>

        {/* Page numbers - show fewer on mobile */}
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="px-2 sm:px-3 py-1 text-gray-500">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`px-2 sm:px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 min-w-[32px] sm:min-w-[36px] ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-2 sm:px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
          }`}
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
        </button>
      </div>

      {/* Mobile-friendly page info */}
      <div className="xs:hidden text-xs text-gray-500 text-center">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;
