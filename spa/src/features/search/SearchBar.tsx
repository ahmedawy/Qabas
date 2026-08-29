import React, { useState, useEffect } from 'react';
import type { Book } from '../../types';

interface SearchBarProps {
  allBooks: Book[];
  preselectedBookId: number;
  onSearch: (query: string, bookId: number, hadithTypes?: string[]) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  allBooks,
  preselectedBookId,
  onSearch,
}) => {
  const [query, setQuery] = useState('');
  const [bookId, setBookId] = useState(preselectedBookId);
  const [selectedHadithTypes, setSelectedHadithTypes] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Update book selection if prop changes
  useEffect(() => {
    setBookId(preselectedBookId);
  }, [preselectedBookId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, bookId, selectedHadithTypes);
  };

  const handleTypeToggle = (typeId: string) => {
    setSelectedHadithTypes((prev) =>
      prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]
    );
  };

  const hadithTypesList = [
    { id: 'qudsi', label: 'أحاديث قدسية' },
    { id: 'marfu', label: 'أحاديث مرفوعة' },
    { id: 'mawkof', label: 'قول صحابي (موقوف)' },
    { id: 'maktoa', label: 'قول تابعي (مقطوع)' },
    { id: 'marfu_hukman', label: 'ما له حكم الرفع' },
    { id: 'qawliyyah', label: 'سنة قولية' },
    { id: 'fiiliyyah', label: 'سنة فعلية' },
    { id: 'taqririyyah', label: 'سنة تقريرية' },
    { id: 'wasfiyyah', label: 'صفات وشمائل' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg text-right w-full flex flex-col gap-4">
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col md:flex-row gap-4 items-stretch md:items-end w-full"
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
                className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
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

        {/* Submit / Advanced Toggle Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-4 py-2.5 border rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
              showAdvanced || selectedHadithTypes.length > 0
                ? 'border-emerald-500 text-emerald-500 bg-emerald-500/5'
                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
            title="خيارات تصفية نوع الحديث"
          >
            <span>خيارات متقدمة</span>
            {selectedHadithTypes.length > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {selectedHadithTypes.length}
              </span>
            )}
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <button
            type="submit"
            disabled={query.trim() === '' && selectedHadithTypes.length === 0}
            className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:dark:bg-slate-850 disabled:text-slate-400 disabled:shadow-none text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>ابحث في السنّة</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 animate-in slide-in-from-top duration-200">
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-3">تصفية حسب نوع وتخصيص الحديث:</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {hadithTypesList.map((type) => (
              <label
                key={type.id}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all duration-200 select-none ${
                  selectedHadithTypes.includes(type.id)
                    ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950 text-slate-400 hover:border-slate-350 dark:hover:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedHadithTypes.includes(type.id)}
                  onChange={() => handleTypeToggle(type.id)}
                  className="rounded border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-900 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900 w-4 h-4 cursor-pointer"
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
