import React from 'react';
import type { HadithSummary } from '../../types';
import { HadithCard } from '../hadiths/HadithCard';

interface SearchResultsProps {
  results: HadithSummary[];
  query: string;
  total: number;
  loading: boolean;
  onNarratorClick?: (id: number) => void;
  onLexiconClick?: (wordId: number) => void;
  onDetailClick?: (hadith: HadithSummary) => void;
  bookmarkedIds?: Set<number>;
  onToggleBookmark?: (hadith: HadithSummary) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  query,
  total,
  loading,
  onNarratorClick,
  onLexiconClick,
  onDetailClick,
  bookmarkedIds,
  onToggleBookmark,
}) => {
  if (loading) {
    return (
      <div className="app-stack-2">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-400 dark:text-slate-500 text-sm">جاري البحث في الأحاديث...</span>
      </div>
    );
  }

  if (query.trim() === '') return null;

  return (
    <div className="space-y-6">
      {/* Search Stats Header */}
      <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-right">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
          نتائج البحث عن كلمة:{' '}
          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10">
            "{query}"
          </span>
          <span className="mx-2 text-slate-300 dark:text-slate-700">|</span>
          وجدنا{' '}
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
            {total}
          </span>{' '}
          نتيجة مطابقة.
        </h3>
      </div>

      {/* Results List */}
      {results.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500 text-sm bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
          لم يتم العثور على أي نتائج مطابقة لكلمة البحث في الموضع المحدد.
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          {results.map((h) => (
            <HadithCard
              key={h.MainID}
              hadith={h}
              onNarratorClick={onNarratorClick}
              onLexiconClick={onLexiconClick}
              onDetailClick={onDetailClick}
              isBookmarked={bookmarkedIds?.has(h.MainID)}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
};
