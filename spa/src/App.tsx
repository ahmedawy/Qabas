import { useState, useEffect } from 'react';
import { api } from './api/client';
import type { Book, TocNode, HadithSummary } from './types';
import { BooksGrid } from './features/books/BooksGrid';
import { TocTree } from './features/books/TocTree';
import { DisplayMethodPanel } from './features/books/DisplayMethodPanel';
import { HadithCard, HadithContentRenderer } from './features/hadiths/HadithCard';
import { HadithDetailModal } from './features/hadiths/HadithDetailModal';
import { SearchBar } from './features/search/SearchBar';
import { SearchResults } from './features/search/SearchResults';
import { Pagination } from './features/search/Pagination';
import { NarratorHub } from './features/narrators/NarratorHub';
import { NarratorDrawer } from './features/narrators/NarratorDrawer';
import { AtrafHub } from './features/atraf/AtrafHub';
import { ThematicHub } from './features/thematic/ThematicHub';
import { SciencesHub } from './features/sciences/SciencesHub';
import { StatisticsHub } from './features/statistics/StatisticsHub';
import { AuthModal } from './features/auth/AuthModal';
import { BookmarksPanel } from './features/auth/BookmarksPanel';
import { NavigationMenu } from './components/NavigationMenu';

// Import custom hooks
import { useAuth } from './hooks/useAuth';
import { useBookmarks } from './hooks/useBookmarks';
import { useSearch } from './hooks/useSearch';
import { useUrlSync } from './hooks/useUrlSync';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedNode, setSelectedNode] = useState<TocNode | null>(null);
  const [allBooks, setAllBooks] = useState<Book[]>([]);

  const [hadiths, setHadiths] = useState<HadithSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextChapterPage, setNextChapterPage] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeHadithId, setActiveHadithId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Subsystems views
  const [currentView, setCurrentView] = useState<'library' | 'narrators' | 'atraf' | 'thematics' | 'sciences' | 'statistics'>('library');
  const [currentTab, setCurrentTab] = useState<string | null>(null);
  const [activeNarratorId, setActiveNarratorId] = useState<number | null>(null);
  const [activeWordId, setActiveWordId] = useState<number | null>(null);
  const [wordDefinition, setWordDefinition] = useState<string | null>(null);
  const [wordAnnotations, setWordAnnotations] = useState<any>(null);
  const [wordLoading, setWordLoading] = useState(false);

  // 1. Core integration hooks
  const auth = useAuth();
  const bookmarks = useBookmarks(auth.user, () => auth.setIsAuthModalOpen(true));
  const search = useSearch(allBooks);

  useUrlSync(currentView, setCurrentView, currentTab, setCurrentTab, selectedBook);

  // Load books for the sidebar dropdown and read URL book parameter
  useEffect(() => {
    api.getBooks()
      .then((data) => {
        setAllBooks(data.books);
        const params = new URLSearchParams(window.location.search);
        const bookIdStr = params.get('book');
        if (bookIdStr) {
          const bookId = parseInt(bookIdStr, 10);
          const book = data.books.find(b => b.ID === bookId);
          if (book) {
            setSelectedBook(book);
          }
        }
      })
      .catch((err) => console.error('Error loading dropdown books', err));
  }, []);

  // Wrap logout to also clear bookmark lists
  const handleLogoutClick = () => {
    auth.handleLogout(() => {
      bookmarks.clearBookmarks();
    });
  };

  // Search execution wrapper
  const onSearchQuery = (query: string, bookId: number, page: number = 1) => {
    setError(null);
    search.handleSearch(query, bookId, page, (msg) => {
      setError(msg);
    });
  };

  const handleSelectSearch = (query: string, bookId: number) => {
    onSearchQuery(query, bookId, 1);
    auth.setIsBookmarksOpen(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Load Obscure Word Definition on demand
  useEffect(() => {
    if (activeWordId === null) {
      setWordDefinition(null);
      setWordAnnotations(null);
      return;
    }
    let active = true;
    setWordLoading(true);
    api.getLexiconWord(activeWordId)
      .then((res) => {
        if (active) {
          setWordDefinition(res.content);
          setWordAnnotations(res.annotations);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setWordDefinition('فشل تحميل تعريف الكلمة الغريبة من قاعدة البيانات');
          setWordAnnotations(null);
        }
      })
      .finally(() => {
        if (active) {
          setWordLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [activeWordId]);

  // 1. Select Book
  const handleSelectBook = (book: Book | null) => {
    setSelectedBook(book);
    setSelectedNode(null);
    setHadiths([]);
    setError(null);
    search.setIsSearching(false); // Stop searching when selecting a book
  };

  // 2. Select Chapter from TOC tree
  const handleSelectNode = (node: TocNode) => {
    setSelectedNode(node);
    setLoading(true);
    setError(null);
    setNextChapterPage(null);

    if (selectedBook) {
      api.getChapterHadiths(selectedBook.ID, node.MainID, 1)
        .then((data) => {
          setHadiths(data.hadiths);
          setNextChapterPage(data.next_page || null);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'فشل تحميل أحاديث الباب');
          setLoading(false);
        });
    }
  };

  const handleLoadMoreChapterHadiths = () => {
    if (!selectedBook || !selectedNode || !nextChapterPage || loadingMore) return;
    setLoadingMore(true);

    api.getChapterHadiths(selectedBook.ID, selectedNode.MainID, nextChapterPage)
      .then((data) => {
        setHadiths(prev => [...prev, ...data.hadiths]);
        setNextChapterPage(data.next_page || null);
      })
      .catch((err) => {
        console.error('Failed to load more hadiths:', err);
      })
      .finally(() => {
        setLoadingMore(false);
      });
  };

  // 3. Load Hadith by Number
  const handleLoadHadithByNum = (num: string | number, tarqeem: string) => {
    if (!selectedBook) return;
    setLoading(true);
    setError(null);
    setHadiths([]);

    api.getHadithByNum(selectedBook.ID, num, tarqeem)
      .then((data) => {
        setHadiths([data.hadith]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'لم يتم العثور على الحديث بالرقم المحدد');
        setLoading(false);
      });
  };

  // 4. Load Hadith by Page
  const handleLoadHadithByPage = (page: number, part?: number) => {
    if (!selectedBook) return;
    setLoading(true);
    setError(null);
    setHadiths([]);

    api.getHadithByPage(selectedBook.ID, page, part)
      .then((data) => {
        setHadiths(data.hadiths);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'لم يتم العثور على أحاديث في الصفحة المحددة');
        setLoading(false);
      });
  };

  // Clear search and return to home
  const handleHomeClick = () => {
    setSelectedBook(null);
    setSelectedNode(null);
    setHadiths([]);
    setError(null);
    search.setIsSearching(false);
    search.setSearchQuery('');
  };

  // Interactive handles for inside Hadith texts
  const handleNarratorClick = (id: number) => {
    setActiveNarratorId(id);
  };

  const handleLexiconClick = (wordId: number) => {
    setActiveWordId(wordId);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans flex flex-col ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>

      {/* Premium Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Sidebar toggle button (visible when a book is selected) */}
            {selectedBook && !search.isSearching && currentView === 'library' && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                aria-label="Toggle sidebar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isSidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}

            <span
              onClick={handleHomeClick}
              className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent cursor-pointer font-sans">
              منصة قبس للسنة النبوية
            </span>

            {/* Navigation Tabs */}
            <NavigationMenu
              currentView={currentView}
              setCurrentView={setCurrentView}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              onClearSearch={() => search.setIsSearching(false)}
            />
          </div>



          <div className="flex items-center gap-3">
            {/* User Profile / Auth Controls */}
            {auth.user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => auth.setIsBookmarksOpen(true)}
                  className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold"
                  title="المفضلة وسجل البحث"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span className="hidden sm:inline">المفضلة</span>
                  <span className="bg-amber-500 text-slate-900 rounded-full w-4 h-4 flex items-center justify-center font-mono font-bold text-[9px]">
                    {bookmarks.bookmarkedList.length}
                  </span>
                </button>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350 px-2 truncate max-w-[100px] hidden md:inline">
                    {auth.user.name}
                  </span>
                  <button
                    onClick={handleLogoutClick}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-500 hover:text-rose-600 transition-all cursor-pointer"
                    title="تسجيل الخروج"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => auth.setIsAuthModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">تسجيل الدخول</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828 0l-.707-.707m12.728-12.728l-.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-700 dark:text-slate-350" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb Section */}
      {((!search.isSearching && selectedBook && currentView === 'library') || (search.isSearching && currentView === 'library')) && (
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
            <span
              onClick={handleHomeClick}
              className="cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              الرئيسية
            </span>
            <span className="text-[10px]">◀</span>
            {!search.isSearching && selectedBook ? (
              <>
                <span className="text-emerald-600 dark:text-emerald-400 font-amiri text-sm">{selectedBook.Title}</span>
                {selectedNode && (
                  <>
                    <span className="text-[10px]">◀</span>
                    <span className="truncate max-w-[200px] md:max-w-md text-slate-600 dark:text-slate-350">{selectedNode.Title}</span>
                  </>
                )}
              </>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">البحث الجاري</span>
            )}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-grow flex flex-row overflow-hidden max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">

        {/* RIGHT SIDEBAR: TOC and Book Select (Collapsible, only in reading mode) */}
        {currentView === 'library' && selectedBook && isSidebarOpen && !search.isSearching && (
          <aside className="w-80 shrink-0 hidden md:flex flex-col bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-6 text-right overflow-hidden shadow-sm animate-in slide-in-from-right duration-200">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">تغيير مصدر الكتاب:</h2>
              <select
                id="bookSelector"
                value={selectedBook.ID}
                onChange={(e) => {
                  const book = allBooks.find(b => b.ID === parseInt(e.target.value, 10));
                  if (book) handleSelectBook(book);
                }}
                className="w-full text-right py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-emerald-500"
              >
                {allBooks.map((b) => (
                  <option key={b.ID} value={b.ID}>{b.Title}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col flex-grow overflow-hidden">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">شجرة التبويب (الفهرس):</h2>
              <div className="flex-grow overflow-hidden">
                <TocTree
                  bookId={selectedBook.ID}
                  selectedNodeId={selectedNode?.MainID || null}
                  onSelectNode={handleSelectNode}
                />
              </div>
            </div>
          </aside>
        )}

        {/* LEFT/MAIN VIEW: Reading and Search Panel */}
        <main className="flex-grow overflow-y-auto pr-1 flex flex-col gap-6 custom-scrollbar">
          {currentView === 'narrators' ? (
            <NarratorHub
              onSelectNarrator={handleNarratorClick}
              activeTab={currentTab}
              onTabChange={setCurrentTab}
            />
          ) : currentView === 'atraf' ? (
            <AtrafHub
              onSelectHadith={(id) => setActiveHadithId(id)}
              onSelectNarrator={handleNarratorClick}
              activeTab={currentTab}
              onTabChange={setCurrentTab}
            />
          ) : currentView === 'thematics' ? (
            <ThematicHub
              onSelectHadith={(id) => setActiveHadithId(id)}
              activeTab={currentTab}
              onTabChange={setCurrentTab}
            />
          ) : currentView === 'sciences' ? (
            <SciencesHub
              onSelectHadith={(id) => setActiveHadithId(id)}
              onSelectNarrator={handleNarratorClick}
              activeTab={currentTab}
              onTabChange={setCurrentTab}
            />
          ) : currentView === 'statistics' ? (
            <StatisticsHub />
          ) : (
            <>
              {/* Always display search bar at the top */}
              <SearchBar
                allBooks={allBooks}
                preselectedBookId={selectedBook ? selectedBook.ID : 0}
                onSearch={onSearchQuery}
              />

              {search.isSearching ? (
                // SEARCH RESULTS VIEW
                <div className="space-y-6">
                  <button
                    onClick={() => search.setIsSearching(false)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors select-none"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    إغلاق نتائج البحث والعودة للتصفح
                  </button>

                  {error && (
                    <div className="text-center py-8 bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
                      <p className="text-sm text-red-600 dark:text-red-400 font-semibold">{error}</p>
                    </div>
                  )}

                  <SearchResults
                    results={search.searchResults}
                    query={search.searchQuery}
                    total={search.searchTotal}
                    loading={search.searchLoading}
                    onNarratorClick={handleNarratorClick}
                    onLexiconClick={handleLexiconClick}
                    onDetailClick={(item) => setActiveHadithId(item.MainID)}
                    bookmarkedIds={bookmarks.bookmarkedIds}
                    onToggleBookmark={bookmarks.handleToggleBookmark}
                  />

                  <Pagination
                    currentPage={search.searchPage}
                    totalItems={search.searchTotal}
                    itemsPerPage={10}
                    onPageChange={(page) => onSearchQuery(search.searchQuery, search.searchBookId, page)}
                  />
                </div>
              ) : selectedBook ? (
                // READING MODE
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Back Link */}
                  <button
                    onClick={() => handleSelectBook(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors select-none"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    العودة لدليل الكتب الرئيسي
                  </button>

                  {/* Browse Selector Option panel */}
                  <DisplayMethodPanel
                    selectedBook={selectedBook}
                    onLoadHadithByNum={handleLoadHadithByNum}
                    onLoadHadithByPage={handleLoadHadithByPage}
                  />

                  {/* Hadith List Results */}
                  <div className="space-y-6">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-400 dark:text-slate-500 text-sm">جاري تحميل النصوص النبوية...</span>
                      </div>
                    ) : error ? (
                      <div className="text-center py-12 bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
                        <p className="text-sm text-red-500 dark:text-red-400 font-semibold">{error}</p>
                      </div>
                    ) : hadiths.length === 0 ? (
                      <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-sm bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h4 className="text-lg font-bold font-sans mb-1">استعرض محتويات الكتاب</h4>
                        <p className="text-xs">اختر رقماً للحديث في الأعلى أو تصفح الأبواب عبر الفهرس الجانبي.</p>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in fade-in duration-300">
                        {hadiths.map((h) => (
                          <HadithCard
                            key={h.MainID}
                            hadith={h}
                            onNarratorClick={handleNarratorClick}
                            onLexiconClick={handleLexiconClick}
                            onDetailClick={(item) => setActiveHadithId(item.MainID)}
                            isBookmarked={bookmarks.bookmarkedIds.has(h.MainID)}
                            onToggleBookmark={bookmarks.handleToggleBookmark}
                          />
                        ))}

                        {nextChapterPage && (
                          <div className="flex justify-center pt-4 pb-8">
                            <button
                              onClick={handleLoadMoreChapterHadiths}
                              disabled={loadingMore}
                              className="px-6 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:hover:bg-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-bold text-sm transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                            >
                              {loadingMore && (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              )}
                              {loadingMore ? 'جاري التحميل...' : 'تحميل المزيد من الأحاديث'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // HOME: BOOKS GRID
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-gradient-to-r from-emerald-600/10 to-teal-500/10 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-500/10 rounded-3xl p-8 text-center space-y-3">

                    <h1 className="text-3xl font-extrabold tracking-tight">
                      منصة قبس للسنة النبوية
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed font-sans">
                      اختر أحد المصنفات والكتب المسندة في الأسفل لبدء التصفح الفقهي التفصيلي وقراءة الأحاديث والتحقق من تخريج السند وحكم المحدثين.
                    </p>
                  </div>

                  <BooksGrid
                    selectedBook={null}
                    onSelectBook={handleSelectBook}
                    filterType="all"
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* DETAIL MODAL OVERLAY */}
      {activeHadithId !== null && (
        <HadithDetailModal
          hadithId={activeHadithId}
          onClose={() => setActiveHadithId(null)}
          onNarratorClick={handleNarratorClick}
          onLexiconClick={handleLexiconClick}
        />
      )}

      {/* NARRATOR DETAIL DRAWER OVERLAY */}
      <NarratorDrawer
        narratorId={activeNarratorId}
        onClose={() => setActiveNarratorId(null)}
      />

      {/* LEXICON WORD DEFINITION OVERLAY POPUP */}
      {activeWordId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60 transition-opacity">
          <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl w-full max-w-md p-6 text-right font-sans animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 shrink-0">
              <button
                onClick={() => setActiveWordId(null)}
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-sm font-bold text-slate-400">شرح غريب الحديث (المعجم)</h3>
            </div>
            <div className="py-4 overflow-y-auto custom-scrollbar">
              {wordLoading ? (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                </div>
              ) : (
                <div className="text-slate-200 text-base leading-relaxed font-semibold font-amiri bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                  {wordDefinition ? (
                    <HadithContentRenderer
                      content={wordDefinition}
                      annotations={wordAnnotations}
                      onNarratorClick={handleNarratorClick}
                      onLexiconClick={handleLexiconClick}
                    />
                  ) : (
                    'لا يوجد شرح متوفر لهذه الكلمة في المعجم'
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-800 shrink-0">
              <button
                onClick={() => setActiveWordId(null)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={auth.isAuthModalOpen}
        onClose={() => auth.setIsAuthModalOpen(false)}
        onSuccess={(newUser) => auth.setUser(newUser)}
      />

      {/* BOOKMARKS AND HISTORY PANEL DRAWER */}
      <BookmarksPanel
        isOpen={auth.isBookmarksOpen}
        onClose={() => auth.setIsBookmarksOpen(false)}
        onSelectHadith={(id) => {
          setActiveHadithId(id);
          auth.setIsBookmarksOpen(false);
        }}
        searchHistory={search.searchHistory}
        onSelectSearch={handleSelectSearch}
        onClearHistory={search.handleClearHistory}
        onRemoveHistoryItem={search.handleRemoveHistoryItem}
        bookmarkedList={bookmarks.bookmarkedList}
        onToggleBookmark={bookmarks.handleToggleBookmark}
        loading={bookmarks.bookmarksLoading}
      />
    </div>
  );
}

export default App;
