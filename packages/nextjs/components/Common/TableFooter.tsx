import React, { useState } from "react";

interface TableFooterProps {
  totalRows: number;
  currentPage?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  className?: string;
}

export function TableFooter({
  totalRows,
  currentPage = 1,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  className = "",
}: TableFooterProps) {
  const [rowsPerPageState, setRowsPerPageState] = useState(rowsPerPage);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const totalPages = Math.ceil(totalRows / rowsPerPageState);
  const pageNumbers = [];

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPageState(newRowsPerPage);
    onRowsPerPageChange?.(newRowsPerPage);
    setDropdownOpen(false);
  };

  return (
    <div
      className={`bg-background border-l border-r border-b border-primary-divider content-stretch flex items-center justify-between px-5 py-3 relative rounded-bl-2xl rounded-br-2xl ${className}`}
      data-name="TableFooter"
    >
      {/* Pagination Controls */}
      <div className="flex gap-2 items-start">
        {/* First Button */}
        <button
          disabled={totalPages === 0 || currentPage === 1}
          onClick={() => onPageChange?.(1)}
          className="flex flex-col h-8 items-center justify-center overflow-clip px-3 py-2 relative rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <p className="font-medium leading-5 text-sm text-text-secondary">First</p>
        </button>

        {/* Previous Button */}
        <button
          disabled={totalPages === 0 || currentPage === 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          className="flex flex-col h-8 items-center justify-center overflow-clip px-3 py-2 relative rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <p className="font-medium leading-5 text-sm text-primary-blue">Previous</p>
        </button>

        {/* Page Numbers */}
        <div className="flex gap-1 items-start px-2 py-0">
          {generatePageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && onPageChange?.(page)}
              disabled={page === "..." || page === currentPage}
              className={`flex flex-col h-8 items-center justify-center px-3 py-2 relative rounded-lg ${
                page === currentPage
                  ? "bg-primary-blue text-white"
                  : "text-text-primary hover:bg-gray-100 disabled:opacity-50"
              }`}
            >
              <p className="font-medium leading-5 text-sm">{page}</p>
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          disabled={totalPages === 0 || currentPage === totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          className="flex flex-col h-8 items-center justify-center overflow-clip px-3 py-2 relative rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <p className="font-medium leading-5 text-sm text-primary-blue">Next</p>
        </button>

        {/* Last Button */}
        <button
          disabled={totalPages === 0 || currentPage === totalPages}
          onClick={() => onPageChange?.(totalPages)}
          className="flex flex-col h-8 items-center justify-center overflow-clip px-3 py-2 relative rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          <p className="font-medium leading-5 text-sm text-text-secondary">Last</p>
        </button>
      </div>

      {/* Rows Per Page Selector */}
      <div className="flex gap-2 items-center">
        <p className="font-medium leading-5 text-sm text-text-primary">Rows per page:</p>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-background border border-primary-divider border-solid flex gap-2 items-center px-4 py-2 relative rounded-lg cursor-pointer"
          >
            <p className="font-medium leading-6 text-base text-text-primary">{rowsPerPageState}</p>
            <img alt="dropdown" className="w-4" src="/arrow/chevron-down.svg" />
          </button>

          {dropdownOpen && (
            <div className="absolute bottom-full right-0 mb-1 bg-background border border-primary-divider rounded-lg shadow-lg z-10">
              {[5, 10, 25, 50].map(option => (
                <button
                  key={option}
                  onClick={() => handleRowsPerPageChange(option)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                    option === rowsPerPageState ? "bg-blue-50 font-medium" : ""
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
