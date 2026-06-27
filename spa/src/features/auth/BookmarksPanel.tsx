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
    <div className="bookmarks-panel-element-3" role="dialog" aria-modal="true">
      <div className="bookmarks-panel-overlay-4">
        {/* Backdrop overlay */}
        <div 
          className="bookmarks-panel-overlay-8" 
          onClick={onClose}
        ></div>

        {/* Panel Container (Slides in from the left) */}
        <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10 text-right">
          <div className="bookmarks-panel-element-10">
            <div className="bookmarks-panel-text-11">
              
              {/* Header */}
              <div className="bookmarks-panel-card-5">
                <button
                  type="button"
                  className="rounded-full bg-slate-800 p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                  onClick={onClose}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="bookmarks-panel-title-13">
                  المفضلة وسجل المتابعة
                </h2>
              </div>

              {/* Tabs */}
              <div className="bookmarks-panel-card-14">
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
                    <span className="bookmarks-panel-overlay-6"></span>
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
                    <span className="bookmarks-panel-overlay-6"></span>
                  )}
                </button>
              </div>

              {/* Content Body */}
              <div className="bookmarks-panel-element-15">
                {activeTab === 'bookmarks' ? (
                  <div className="space-y-4">
                    {loading ? (
                      <div className="app-stack-2">
                        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-400 text-xs">جاري تحميل المفضلة...</span>
                      </div>
                    ) : bookmarkedList.length === 0 ? (
                      <div className="text-center py-20 text-slate-500 space-y-3">
                        <div className="text-3xl">⭐</div>
                        <h4 className="text-sm font-bold text-slate-300">مفضلتك فارغة حالياً</h4>
                        <p className="bookmarks-panel-text-17">
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
                              <span className="bookmarks-panel-title-20">{h.BookName}</span>
                              <div className="app-element-4">
                                <span className="font-mono">حديث رقم: {h.HadithNum}</span>
                                <button
                                  onClick={() => onToggleBookmark(h)}
                                  className="bookmarks-panel-text-21"
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
                              className="bookmarks-panel-text-22"
                            >
                              {h.CleanContent}
                            </p>

                            <button
                              onClick={() => onSelectHadith(h.MainID)}
                              className="bookmarks-panel-title-23"
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
                    <div className="bookmarks-panel-wrapper-24">
                      <span className="text-xs text-slate-400">الكلمات المفتاحية المبحوث عنها:</span>
                      {searchHistory.length > 0 && (
                        <button
                          onClick={onClearHistory}
                          className="bookmarks-panel-title-25"
                        >
                          مسح السجل بالكامل
                        </button>
                      )}
                    </div>

                    {searchHistory.length === 0 ? (
                      <div className="text-center py-20 text-slate-500 space-y-3">
                        <div className="text-3xl">🔍</div>
                        <h4 className="text-sm font-bold text-slate-300">سجل البحث فارغ</h4>
                        <p className="bookmarks-panel-text-26">
                          عمليات البحث التي تجريها في محرك البحث للمنصة ستظهر هنا لتسهيل العودة إليها لاحقاً.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {searchHistory.map((item, index) => (
                          <div 
                            key={index}
                            className="bookmarks-panel-text-27"
                          >
                            <button
                              onClick={() => onRemoveHistoryItem(index)}
                              className="bookmarks-panel-text-28"
                              title="إزالة من السجل"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>

                            <div 
                              onClick={() => onSelectSearch(item.query, item.bookId)}
                              className="bookmarks-panel-text-29"
                            >
                              <span className="bookmarks-panel-title-30">
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
