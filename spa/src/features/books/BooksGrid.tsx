import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { Book } from '../../types';
import { BookCard } from './BookCard';

interface BooksGridProps {
  selectedBook: Book | null;
  onSelectBook: (book: Book) => void;
  filterType?: 'hadith' | 'services' | 'all';
  activeTab?: 'primary' | 'auxiliary';
  onTabChange?: (tab: 'primary' | 'auxiliary') => void;
}

export const BooksGrid: React.FC<BooksGridProps> = ({ 
  selectedBook, 
  onSelectBook, 
  filterType = 'all',
  activeTab: propActiveTab,
  onTabChange
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [localActiveTab, setLocalActiveTab] = useState<'primary' | 'auxiliary'>('primary');

  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = onTabChange !== undefined ? onTabChange : setLocalActiveTab;

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getAllBooks()
      .then((data) => {
        if (active) {
          setBooks(data.books);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'فشل تحميل الكتب');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredBooks = books.filter((book) => {
    // Apply type filters using the new 'type' field
    if (filterType === 'hadith' && book.type !== 'hadith') return false;
    if (filterType === 'services' && book.type !== 'service') return false;
    if (filterType === 'all') {
      if (activeTab === 'primary' && book.type !== 'hadith') return false;
      if (activeTab === 'auxiliary' && book.type !== 'service') return false;
    }

    // Apply search query filter
    if (searchTerm.trim() === '') return true;
    const cleanSearch = searchTerm.toLowerCase();
    return (
      book.Title.toLowerCase().includes(cleanSearch) ||
      book.AuthorName.toLowerCase().includes(cleanSearch)
    );
  });

  if (loading) {
    return (
      <div className="app-stack-2">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">جاري تحميل كتب منصة قبس...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="books-grid-text-3">
        <svg className="books-grid-text-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="books-grid-title-5">خطأ في التحميل</h3>
        <p className="books-grid-text-1">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            api.getAllBooks().then(data => { setBooks(data.books); setLoading(false); }).catch(err => { setError(err.message); setLoading(false); });
          }}
          className="books-grid-text-6"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {filterType === 'all' && (
        <div className="books-grid-wrapper-7">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 gap-1.5 w-full max-w-md shadow-inner">
            <button
              onClick={() => setActiveTab('primary')}
              className={`flex-1 text-center py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                activeTab === 'primary'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              كتب المتون (الأصول)
            </button>
            <button
              onClick={() => setActiveTab('auxiliary')}
              className={`flex-1 text-center py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                activeTab === 'auxiliary'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              الكتب الخدمية والشروح
            </button>
          </div>
        </div>
      )}

      {/* Search and Category Headers */}
      <div className="books-grid-wrapper-9">
        <h2 className="books-grid-title-2">
          <span className="books-grid-badge-10"></span>
          {filterType === 'hadith' && 'كتب متون الحديث المسندة'}
          {filterType === 'services' && 'الكتب والخدمات العلمية'}
          {filterType === 'all' && (activeTab === 'primary' ? 'كتب متون الحديث المسندة' : 'الكتب العلمية الخدمية والشروح')}
          <span className="text-xs font-normal text-slate-400 dark:text-slate-500 font-mono">
            ({filteredBooks.length} كتاب)
          </span>
        </h2>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث باسم الكتاب أو المصنف..."
            className="w-full text-right py-2 pl-4 pr-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
          />
          <svg className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-sm">
          لم يتم العثور على أي كتب تطابق البحث.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.ID}
              book={book}
              isSelected={selectedBook?.ID === book.ID}
              onSelect={onSelectBook}
            />
          ))}
        </div>
      )}
    </div>
  );
};
