import React, { useState } from 'react';
import type { HadithSummary } from '../../types';

interface BookmarksPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHadith: (id: number) => void;
  searchHistory: Array<{ query: string; bookId: number; bookName: string }>;
  onSelectSearch: (query: string, bookId: number) => void;
  onClearHistory: () => void;
  onRemoveHistoryItem: (index: number) => void;
  bookmarkedList: HadithSummary[];
  onToggleBookmark: (hadith: HadithSummary) => void;
  loading: boolean;
}

export const BookmarksPanel: React.FC<BookmarksPanelProps> = ({
  isOpen,
  onClose,
  onSelectHadith,
  searchHistory,
  onSelectSearch,
  onClearHistory,
  onRemoveHistoryItem,
  bookmarkedList,
  onToggleBookmark,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history'>('bookmarks');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop overlay */}
        <div 
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300" 
          onClick={onClose}
        ></div>

        {/* Panel Container (Slides in from the left) */}
        <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10 text-right">
          <div className="pointer-events-auto w-screen max-w-md transform transition-transform duration-300 ease-in-out translate-x-0">
            <div className="flex h-full flex-col overflow-y-hidden border-r border-slate-800 bg-slate-900 text-slate-100 shadow-2xl">
              
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4 backdrop-blur-md">
                <button
                  type="button"
                  className="rounded-full bg-slate-800 p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                  onClick={onClose}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-base font-bold text-slate-150">
                  المفضلة وسجل المتابعة
                </h2>
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-950/50 p-1 border-b border-slate-800">
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className={`flex-1 py-3 text-xs font-bold transition-all relative cursor-pointer ${
                    activeTab === 'bookmarks'
                      ? 'text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  الأحاديث المفضلة ({bookmarkedList.length})
                  {activeTab === 'bookmarks' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-3 text-xs font-bold transition-all relative cursor-pointer ${
                    activeTab === 'history'
                      ? 'text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  سجل عمليات البحث ({searchHistory.length})
                  {activeTab === 'history' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></span>
                  )}
                </button>
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {activeTab === 'bookmarks' ? (
                  <div className="space-y-4">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-400 text-xs">جاري تحميل المفضلة...</span>
                      </div>
                    ) : bookmarkedList.length === 0 ? (
                      <div className="text-center py-20 text-slate-500 space-y-3">
                        <div className="text-3xl">⭐</div>
                        <h4 className="text-sm font-bold text-slate-300">مفضلتك فارغة حالياً</h4>
                        <p className="text-xs leading-relaxed max-w-[250px] mx-auto">
                          قم بالبحث وتصفح الأحاديث النبوية الشريفة واضغط على نجمة التفضيل لحفظها هنا للرجوع السريع.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {bookmarkedList.map((h) => (
                          <div 
                            key={h.MainID}
                            className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800 rounded-2xl p-4 transition-all duration-200 flex flex-col gap-3 group relative"
                          >
                            {/* Card Header */}
                            <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-900 pb-2">
                              <span className="text-emerald-400 font-bold">{h.BookName}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">حديث رقم: {h.HadithNum}</span>
                                <button
                                  onClick={() => onToggleBookmark(h)}
                                  className="text-amber-500 hover:text-rose-500 transition-colors p-0.5 rounded cursor-pointer"
                                  title="إزالة من المفضلة"
                                >
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            
                            {/* Card Text snippet */}
                            <p 
                              onClick={() => onSelectHadith(h.MainID)}
                              className="text-xs leading-relaxed text-slate-350 cursor-pointer font-serif truncate hover:text-emerald-300"
                            >
                              {h.CleanContent}
                            </p>

                            <button
                              onClick={() => onSelectHadith(h.MainID)}
                              className="text-[10px] font-bold text-emerald-400 flex items-center justify-end gap-1 hover:underline cursor-pointer"
                            >
                              <span>استعراض السند والتفاصيل</span>
                              <span>◀</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // SEARCH HISTORY VIEW
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-xs text-slate-400">الكلمات المفتاحية المبحوث عنها:</span>
                      {searchHistory.length > 0 && (
                        <button
                          onClick={onClearHistory}
                          className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 px-2 py-1 rounded-lg cursor-pointer"
                        >
                          مسح السجل بالكامل
                        </button>
                      )}
                    </div>

                    {searchHistory.length === 0 ? (
                      <div className="text-center py-20 text-slate-500 space-y-3">
                        <div className="text-3xl">🔍</div>
                        <h4 className="text-sm font-bold text-slate-300">سجل البحث فارغ</h4>
                        <p className="text-xs max-w-[200px] mx-auto leading-relaxed">
                          عمليات البحث التي تجريها في محرك البحث للمنصة ستظهر هنا لتسهيل العودة إليها لاحقاً.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {searchHistory.map((item, index) => (
                          <div 
                            key={index}
                            className="bg-slate-950/40 hover:bg-slate-950/70 border border-slate-850 rounded-xl p-3.5 transition-all flex items-center justify-between text-right"
                          >
                            <button
                              onClick={() => onRemoveHistoryItem(index)}
                              className="text-slate-550 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                              title="إزالة من السجل"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>

                            <div 
                              onClick={() => onSelectSearch(item.query, item.bookId)}
                              className="flex-1 cursor-pointer pr-3 text-right"
                            >
                              <span className="text-xs font-bold text-slate-200 block">
                                {item.query}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                في كتاب: {item.bookName}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
