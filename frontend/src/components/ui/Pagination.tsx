interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  itemsPerPage: number;
  itemsOnCurrentPage: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  total,
  itemsPerPage,
  itemsOnCurrentPage,
  loading,
  onPageChange,
  onPreviousPage,
  onNextPage
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8">
      {/* Pagination Info */}
      <div className="text-center mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm font-medium text-green-800">
            🌿 Page {currentPage} of {totalPages}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {total} items total • {itemsOnCurrentPage} items on this page
          </p>
          {total > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} items
            </p>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-1">
          {/* First Page Button */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1 || loading}
            className="px-3 py-2 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-green-50 border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Go to first page"
          >
            ⏮️
          </button>

          {/* Previous Button */}
          <button
            onClick={onPreviousPage}
            disabled={currentPage <= 1 || loading}
            className="btn btn-secondary disabled:opacity-50"
          >
            🌲 Previous
          </button>
          
          {/* Page Numbers */}
          <div className="flex space-x-1">
            {(() => {
              const pages = [];
              const maxVisiblePages = 7;
              let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
              let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
              
              // Adjust if we're near the end
              if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
              }
              
              // Add ellipsis if needed
              if (startPage > 1) {
                pages.push(
                  <button
                    key="ellipsis-start"
                    disabled
                    className="px-3 py-2 text-sm font-medium text-gray-400 cursor-default"
                  >
                    ...
                  </button>
                );
              }
              
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    disabled={loading}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      i === currentPage
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-green-50 border border-green-200 hover:shadow-sm'
                    }`}
                  >
                    {loading && i === currentPage ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                    ) : (
                      i
                    )}
                  </button>
                );
              }
              
              // Add ellipsis if needed
              if (endPage < totalPages) {
                pages.push(
                  <button
                    key="ellipsis-end"
                    disabled
                    className="px-3 py-2 text-sm font-medium text-gray-400 cursor-default"
                  >
                    ...
                  </button>
                );
              }
              
              return pages;
            })()}
          </div>
          
          {/* Next Button */}
          <button
            onClick={onNextPage}
            disabled={currentPage >= totalPages || loading}
            className="btn btn-secondary disabled:opacity-50"
          >
            Next 🌿
          </button>

          {/* Last Page Button */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages || loading}
            className="px-3 py-2 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-green-50 border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Go to last page"
          >
            ⏭️
          </button>
        </div>
      </div>

      {/* Additional Page Buttons for Large Datasets */}
      {totalPages > 10 && (
        <div className="text-center mt-4">
          <div className="inline-flex items-center space-x-2 bg-green-50 rounded-lg px-4 py-2 border border-green-200">
            <span className="text-xs text-green-700 font-medium">🌿 More Pages:</span>
            <div className="flex space-x-1 flex-wrap gap-1">
              {(() => {
                const additionalPages: number[] = [];
                const step = Math.max(1, Math.floor(totalPages / 20));
                
                for (let i = 1; i <= totalPages; i += step) {
                  if (i !== currentPage && !additionalPages.includes(i)) {
                    additionalPages.push(i);
                  }
                }
                
                // Add current page if not already included
                if (!additionalPages.includes(currentPage)) {
                  additionalPages.push(currentPage);
                }
                
                // Add last page if not already included
                if (!additionalPages.includes(totalPages)) {
                  additionalPages.push(totalPages);
                }
                
                return additionalPages.sort((a, b) => a - b).slice(0, 15).map(page => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    disabled={loading}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      page === currentPage
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-white text-green-700 hover:bg-green-100 border border-green-300'
                    }`}
                  >
                    {page}
                  </button>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
