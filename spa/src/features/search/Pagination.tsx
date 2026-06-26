import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  // Determine page window to render
  const range = 2; // number of pages to show on either side of current page
  const pages: number[] = [];
  const start = Math.max(1, currentPage - range);
  const end = Math.min(totalPages, currentPage + range);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-row justify-center items-center gap-1.5 py-4 font-mono text-sm select-none" dir="ltr">
      {/* First Page */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold transition-all duration-200"
        title="الصفحة الأولى"
      >
        &lt;&lt;
      </button>

      {/* Prev Page */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold transition-all duration-200"
        title="الصفحة السابقة"
      >
        &lt;
      </button>

      {/* Start Ellipsis */}
      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 transition-all duration-200"
          >
            1
          </button>
          {start > 2 && <span className="px-2 text-slate-400">...</span>}
        </>
      )}

      {/* Page Numbers */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-10 h-10 rounded-xl border transition-all duration-200 font-bold ${
            currentPage === p
              ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
          }`}
        >
          {p}
        </button>
      ))}

      {/* End Ellipsis */}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-slate-400">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 transition-all duration-200"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Page */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold transition-all duration-200"
        title="الصفحة التالية"
      >
        &gt;
      </button>

      {/* Last Page */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold transition-all duration-200"
        title="الصفحة الأخيرة"
      >
        &gt;&gt;
      </button>
    </div>
  );
};
