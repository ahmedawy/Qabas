import React, { useState, useEffect } from 'react';
import type { Book } from '../../types';

interface SearchBarProps {
  allBooks: Book[];
  preselectedBookId: number;
  onSearch: (query: string, bookId: number) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  allBooks,
  preselectedBookId,
  onSearch,
}) => {
  const [query, setQuery] = useState('');
  const [bookId, setBookId] = useState(preselectedBookId);

  // Update book selection if prop changes
  useEffect(() => {
    setBookId(preselectedBookId);
  }, [preselectedBookId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, bookId);
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg text-right flex flex-col md:flex-row gap-4 items-stretch md:items-end w-full"
    >
      {/* Query Input */}
      <div className="flex-grow flex flex-col gap-1.5">
        <label htmlFor="txtSearchQuery" className="text-xs text-slate-400 dark:text-slate-500 font-semibold">نص البحث الفقهي:</label>
        <div className="relative">
          <input
            type="text"
            id="txtSearchQuery"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="اكتب كلمة البحث هنا (مثال: الأعمال بالنيات، بني الإسلام على خمس)..."
            className="w-full text-right py-2.5 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute left-3.5 top-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Book Filter Dropdown */}
      <div className="w-full md:w-64 flex flex-col gap-1.5">
        <label htmlFor="ddlSearchBook" className="text-xs text-slate-400 dark:text-slate-500 font-semibold">فلترة حسب الكتاب:</label>
        <select
          id="ddlSearchBook"
          value={bookId}
          onChange={(e) => setBookId(parseInt(e.target.value, 10))}
          className="w-full text-right py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        >
          <option value="0">بحث عام (في جميع الكتب والمدونات)</option>
          {allBooks.map((book) => (
            <option key={book.ID} value={book.ID}>
              {book.Title}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={query.trim() === ''}
        className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:dark:bg-slate-850 disabled:text-slate-400 disabled:shadow-none text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all duration-300 flex items-center justify-center gap-2"
      >
        <span>ابحث في السنّة</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
};
