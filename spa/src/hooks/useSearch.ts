import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Book, HadithSummary } from '../types';

export interface SearchHistoryItem {
  query: string;
  bookId: number;
  bookName: string;
}

export function useSearch(allBooks: Book[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBookId, setSearchBookId] = useState(0);
  const [searchResults, setSearchResults] = useState<HadithSummary[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [selectedHadithTypes, setSelectedHadithTypes] = useState<string[]>([]);

  // Load search history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('search_history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSearch = (
    query: string,
    bookId: number,
    page: number = 1,
    onError?: (msg: string | null) => void,
    hadithTypes?: string[]
  ) => {
    const typesToUse = hadithTypes !== undefined ? hadithTypes : selectedHadithTypes;
    setSearchQuery(query);
    setSearchBookId(bookId);
    setSearchPage(page);
    if (hadithTypes !== undefined) {
      setSelectedHadithTypes(hadithTypes);
    }
    setSearchLoading(true);
    setIsSearching(true);

    // Record to search history
    if (query.trim() !== '') {
      const bookName =
        bookId === 0
          ? 'جميع الكتب'
          : allBooks.find((b) => b.ID === bookId)?.Title || 'كتاب غير معروف';
      setSearchHistory((prev) => {
        const filtered = prev.filter(
          (item) => !(item.query === query && item.bookId === bookId)
        );
        const updated = [{ query, bookId, bookName }, ...filtered].slice(0, 15);
        localStorage.setItem('search_history', JSON.stringify(updated));
        return updated;
      });
    }

    api.search(query, bookId, page, 10, typesToUse)
      .then((data) => {
        setSearchResults(data.results);
        setSearchTotal(data.total);
        if (onError) onError(null);
      })
      .catch((err) => {
        if (onError) {
          onError(err.message || 'فشل البحث في الأحاديث');
        }
      })
      .finally(() => {
        setSearchLoading(false);
      });
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('search_history');
  };

  const handleRemoveHistoryItem = (index: number) => {
    const updated = searchHistory.filter((_, idx) => idx !== index);
    setSearchHistory(updated);
    localStorage.setItem('search_history', JSON.stringify(updated));
  };

  return {
    searchQuery,
    setSearchQuery,
    searchBookId,
    setSearchBookId,
    searchResults,
    setSearchResults,
    searchTotal,
    setSearchTotal,
    searchPage,
    setSearchPage,
    searchLoading,
    setSearchLoading,
    isSearching,
    setIsSearching,
    searchHistory,
    setSearchHistory,
    selectedHadithTypes,
    setSelectedHadithTypes,
    handleSearch,
    handleClearHistory,
    handleRemoveHistoryItem,
  };
}
