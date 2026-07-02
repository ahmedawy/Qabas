import { useState, useEffect, useCallback } from 'react';
import { api } from './api/client';
import type { Book, TocNode, HadithSummary, HadithServiceType } from './types';
import { BooksGrid } from './features/books/BooksGrid';
import { TocTree } from './features/books/TocTree';
import { DisplayMethodPanel } from './features/books/DisplayMethodPanel';
import { HadithCard, HadithContentRenderer } from './features/hadiths/HadithCard';
import { HadithServiceModal } from './features/hadiths/HadithServiceModal';
import { MatnComparisonModal } from './features/hadiths/MatnComparisonModal';
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
import qabasLogo from './assets/Qabas-Logo.gif';

// Import custom hooks
import { useAuth } from './hooks/useAuth';
import { useBookmarks } from './hooks/useBookmarks';
import { useSearch } from './hooks/useSearch';
import { useUrlSync } from './hooks/useUrlSync';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedNode, setSelectedNode] = useState<TocNode | null>(null);
  const [tocNodes, setTocNodes] = useState<TocNode[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);

  // Deep linking states
  const [activeDeepLink, setActiveDeepLink] = useState<{ hadith?: string; tarqeem?: string; page?: string; part?: string }>(() => {
    const params = new URLSearchParams(window.location.search);
    const hadith = params.get('hadith') || undefined;
    const tarqeem = params.get('tarqeem') || undefined;
    const page = params.get('page') || undefined;
    const part = params.get('part') || undefined;
    return { hadith, tarqeem, page, part };
  });
  const [isUrlInitialized, setIsUrlInitialized] = useState(false);
  const [pendingInitialLoad, setPendingInitialLoad] = useState<{ hadith?: string; tarqeem?: string; page?: string; part?: string } | null>(null);

  const [hadiths, setHadiths] = useState<HadithSummary[]>([]);
  const [hadithNum, setHadithNum] = useState<string>('1');
  const [tarqeem, setTarqeem] = useState<string>('ID');
  const [partNum, setPartNum] = useState<string>('1');
  const [pageNum, setPageNum] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [nextChapterPage, setNextChapterPage] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeServiceHadithId, setActiveServiceHadithId] = useState<number | null>(null);
  const [activeServiceType, setActiveServiceType] = useState<HadithServiceType | null>(null);
  const [activeSubjectId, setActiveSubjectId] = useState<number | null>(null);
  const [activeSubjectPathIds, setActiveSubjectPathIds] = useState<number[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Subsystems views
  const [currentView, setCurrentViewRaw] = useState<'library' | 'narrators' | 'atraf' | 'thematics' | 'sciences' | 'statistics'>('library');
  const setCurrentView = useCallback((view: 'library' | 'narrators' | 'atraf' | 'thematics' | 'sciences' | 'statistics') => {
    if (view === 'library') {
      setSelectedBook(null);
      setSelectedNode(null);
      setHadiths([]);
    }
    setCurrentViewRaw(view);
  }, []);
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

  useUrlSync(currentView, setCurrentView, currentTab, setCurrentTab, selectedBook, activeDeepLink, isUrlInitialized);

  // Load books for the sidebar dropdown and read URL book parameter
  useEffect(() => {
    api.getAllBooks()
      .then((data) => {
        setAllBooks(data.books);
        const params = new URLSearchParams(window.location.search);
        const bookIdStr = params.get('book');
        console.log('[Qabas Debug] Mount - bookIdStr:', bookIdStr, 'Search params:', params.toString());
        if (bookIdStr) {
          const bookId = parseInt(bookIdStr, 10);
          const book = data.books.find(b => Number(b.ID) === bookId);
          console.log('[Qabas Debug] Mount - Resolved book:', book, 'Available book IDs:', data.books.map(b => b.ID));
          if (book) {
            setSelectedBook(book);

            // Read hadith/page deep link parameters
            const hadithParam = params.get('hadith');
            const tarqeemParam = params.get('tarqeem') || 'ID';
            const pageParam = params.get('page');
            const partParam = params.get('part') || '1';
            console.log('[Qabas Debug] Mount - Deep link parameters:', { hadithParam, tarqeemParam, pageParam, partParam });

            if (hadithParam) {
              setPendingInitialLoad({ hadith: hadithParam, tarqeem: tarqeemParam });
            } else if (pageParam) {
              setPendingInitialLoad({ page: pageParam, part: partParam });
            }
          }
        }
        setIsUrlInitialized(true);
      })
      .catch((err) => {
        console.error('Error loading dropdown books', err);
        setIsUrlInitialized(true);
      });
  }, []);

  // Effect to trigger deep link loads once the book is fully selected
  useEffect(() => {
    if (selectedBook && pendingInitialLoad) {
      if (pendingInitialLoad.hadith) {
        setHadithNum(pendingInitialLoad.hadith);
        setTarqeem(pendingInitialLoad.tarqeem || 'ID');
        handleLoadHadithByNum(pendingInitialLoad.hadith, pendingInitialLoad.tarqeem || 'ID');
        setActiveDeepLink({ hadith: pendingInitialLoad.hadith, tarqeem: pendingInitialLoad.tarqeem });
      } else if (pendingInitialLoad.page) {
        setPageNum(pendingInitialLoad.page);
        setPartNum(pendingInitialLoad.part || '1');
        handleLoadHadithByPage(parseInt(pendingInitialLoad.page, 10), parseInt(pendingInitialLoad.part || '1', 10));
        setActiveDeepLink({ page: pendingInitialLoad.page, part: pendingInitialLoad.part });
      }
      setPendingInitialLoad(null); // Clear after executing once
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBook, pendingInitialLoad]);

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

  // Helper to check if a node is an ancestor or self of another node in the TOC tree
  const isAncestorOrSelf = (ancestorId: number, nodeId: number, allNodes: TocNode[]): boolean => {
    if (nodeId === ancestorId) return true;
    const node = allNodes.find(n => n.MainID === nodeId);
    if (node && node.ParentID) {
      return isAncestorOrSelf(ancestorId, node.ParentID, allNodes);
    }
    return false;
  };

  // Auto-sync selected TOC node when hadiths or tocNodes update
  useEffect(() => {
    if (hadiths.length > 0 && tocNodes.length > 0) {
      const firstHadith = hadiths[0];
      if (firstHadith && firstHadith.ParentID) {
        // Skip auto-syncing if the currently selected node is already the parent or an ancestor of the loaded hadith's parent.
        // This prevents the selection from jumping/scrolling to a leaf node when a branch node is clicked.
        if (selectedNode && isAncestorOrSelf(selectedNode.MainID, firstHadith.ParentID, tocNodes)) {
          return;
        }

        if (!selectedNode || selectedNode.MainID !== firstHadith.ParentID) {
          const matchingNode = tocNodes.find(node => node.MainID === firstHadith.ParentID);
          if (matchingNode) {
            setSelectedNode(matchingNode);
          }
        }
      }
    }
  }, [hadiths, tocNodes, selectedNode]);

  // 1. Select Book
  const handleSelectBook = (book: Book | null) => {
    setSelectedBook(book);
    setSelectedNode(null);
    setHadiths([]);
    setTocNodes([]);
    setError(null);
    search.setIsSearching(false); // Stop searching when selecting a book
    setActiveDeepLink({}); // Clear deep link parameters
  };

  // 2. Select Chapter from TOC tree
  const handleSelectNode = (node: TocNode) => {
    setSelectedNode(node);
    setLoading(true);
    setError(null);
    setNextChapterPage(null);
    setActiveDeepLink({}); // Clear hadith/page deep link parameters since we are browsing by TOC node

    // Scroll window and main reading panel to the top
    window.scrollTo(0, 0);
    const mainPane = document.querySelector('.app-stack-28');
    if (mainPane) {
      mainPane.scrollTop = 0;
    }

    if (selectedBook) {
      api.getChapterHadiths(selectedBook.ID, node.MainID, 1, selectedBook.type)
        .then((data) => {
          setHadiths(data.hadiths);
          setNextChapterPage(data.next_page || null);
          setLoading(false);
          if (data.hadiths && data.hadiths.length > 0) {
            const firstHadith = data.hadiths[0];
            if (firstHadith.HadithNum !== undefined && firstHadith.HadithNum !== null) {
              setHadithNum(String(firstHadith.HadithNum));
            }
            if (firstHadith.PartNum !== undefined && firstHadith.PartNum !== null) {
              setPartNum(String(firstHadith.PartNum));
            }
            if (firstHadith.PageNum !== undefined && firstHadith.PageNum !== null) {
              setPageNum(String(firstHadith.PageNum));
            }
          }
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

    api.getChapterHadiths(selectedBook.ID, selectedNode.MainID, nextChapterPage, selectedBook.type)
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
    if (!selectedBook) return Promise.resolve(null);
    setLoading(true);
    setError(null);
    setHadiths([]);
    setActiveDeepLink({ hadith: String(num), tarqeem: tarqeem });

    return api.getHadithByNum(selectedBook.ID, num, tarqeem)
      .then((data) => {
        setHadiths([data.hadith]);
        setLoading(false);
        return data.hadith;
      })
      .catch((err) => {
        setError(err.message || 'لم يتم العثور على الحديث بالرقم المحدد');
        setLoading(false);
        return null;
      });
  };

  // 4. Load Hadith by Page
  const handleLoadHadithByPage = (page: number, part?: number) => {
    if (!selectedBook) return;
    setLoading(true);
    setError(null);
    setHadiths([]);
    setActiveDeepLink({ page: String(page), part: String(part || 1) });

    api.getHadithByPage(selectedBook.ID, page, part, selectedBook.type)
      .then((data) => {
        setHadiths(data.hadiths);
        setLoading(false);
        if (data.hadiths && data.hadiths.length > 0) {
          const firstHadith = data.hadiths[0];
          if (firstHadith.HadithNum !== undefined && firstHadith.HadithNum !== null) {
            setHadithNum(String(firstHadith.HadithNum));
          }
          if (firstHadith.PartNum !== undefined && firstHadith.PartNum !== null) {
            setPartNum(String(firstHadith.PartNum));
          }
          if (firstHadith.PageNum !== undefined && firstHadith.PageNum !== null) {
            setPageNum(String(firstHadith.PageNum));
          }
        }
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
    setActiveDeepLink({}); // Clear deep link parameters
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
          <div className="app-element-6">
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

            <div onClick={handleHomeClick} className="app-logo">
              <img src={qabasLogo} alt="Qabas Logo" className="app-logo-image" />
            </div>

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
              <div className="app-element-4">
                <button
                  onClick={() => auth.setIsBookmarksOpen(true)}
                  className="app-title-8"
                  title="المفضلة وسجل البحث"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span className="hidden sm:inline">المفضلة</span>
                  <span className="app-title-9">
                    {bookmarks.bookmarkedList.length}
                  </span>
                </button>

                <div className="app-card-10">
                  <span className="app-title-11">
                    {auth.user.name}
                  </span>
                  <button
                    onClick={handleLogoutClick}
                    className="app-text-12"
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
                className="app-title-13"
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
              className="app-element-14"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <svg className="app-text-15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828 0l-.707-.707m12.728-12.728l-.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="app-text-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className="app-text-18"
            >
              الرئيسية
            </span>
            <span className="text-[10px]">◀</span>
            {!search.isSearching && selectedBook ? (
              <>
                <span className="app-text-19">{selectedBook.Title}</span>
                {selectedNode && (
                  <>
                    <span className="text-[10px]">◀</span>
                    <span className="app-text-20">{selectedNode.Title}</span>
                  </>
                )}
              </>
            ) : (
              <span className="app-text-21">البحث الجاري</span>
            )}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-grow flex flex-row overflow-hidden max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">

        {/* RIGHT SIDEBAR: TOC and Book Select (Collapsible, only in reading mode) */}
        {currentView === 'library' && selectedBook && isSidebarOpen && !search.isSearching && (
          <aside className="w-80 shrink-0 hidden md:flex flex-col bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-6 text-right overflow-hidden shadow-sm animate-in slide-in-from-right duration-200 sticky top-28 self-start h-[calc(100vh-9rem)]">
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

            <div className="app-stack-26">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">شجرة التبويب (الفهرس):</h2>
              <div className="flex-grow overflow-hidden">
                <TocTree
                  bookId={selectedBook.ID}
                  bookType={selectedBook.type}
                  selectedNodeId={selectedNode?.MainID || null}
                  onSelectNode={handleSelectNode}
                  onTocLoaded={setTocNodes}
                />
              </div>
            </div>
          </aside>
        )}

        {/* LEFT/MAIN VIEW: Reading and Search Panel */}
        <main className="app-stack-28">
          {currentView === 'narrators' ? (
            <NarratorHub
              onSelectNarrator={handleNarratorClick}
              activeTab={currentTab}
              onTabChange={setCurrentTab}
            />
          ) : currentView === 'atraf' ? (
            <AtrafHub
              onSelectHadith={(id) => {
                setActiveServiceHadithId(id);
                setActiveServiceType('takhreeg');
              }}
              onSelectNarrator={handleNarratorClick}
              onNarratorClick={handleNarratorClick}
              onLexiconClick={handleLexiconClick}
              onServiceClick={(hadith, type) => {
                setActiveServiceHadithId(hadith.MainID || null);
                setActiveServiceType(type);
              }}
              bookmarkedIds={bookmarks.bookmarkedIds}
              onToggleBookmark={(hadith) => bookmarks.handleToggleBookmark(hadith as any)}
              activeTab={currentTab}
              onTabChange={setCurrentTab}
            />
          ) : currentView === 'thematics' ? (
            <ThematicHub
              onNarratorClick={handleNarratorClick}
              onLexiconClick={handleLexiconClick}
              onServiceClick={(hadith, type) => {
                setActiveServiceHadithId(hadith.MainID || null);
                setActiveServiceType(type);
              }}
              bookmarkedIds={bookmarks.bookmarkedIds}
              onToggleBookmark={(hadith) => bookmarks.handleToggleBookmark(hadith as any)}
              activeTab={currentTab}
              onTabChange={setCurrentTab}
              initialSelectedSubjectId={activeSubjectId}
              initialSubjectPathIds={activeSubjectPathIds}
            />
          ) : currentView === 'sciences' ? (
            <SciencesHub
              onSelectHadith={(id) => {
                setActiveServiceHadithId(id);
                setActiveServiceType('takhreeg');
              }}
              onSelectNarrator={handleNarratorClick}
              onNarratorClick={handleNarratorClick}
              onLexiconClick={handleLexiconClick}
              onServiceClick={(hadith: any, type: any) => {
                setActiveServiceHadithId(hadith.MainID || null);
                setActiveServiceType(type);
              }}
              bookmarkedIds={bookmarks.bookmarkedIds}
              onToggleBookmark={(hadith: any) => bookmarks.handleToggleBookmark(hadith as any)}
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
                    <div className="app-text-29">
                      <p className="app-text-30">{error}</p>
                    </div>
                  )}

                  <SearchResults
                    results={search.searchResults}
                    query={search.searchQuery}
                    total={search.searchTotal}
                    loading={search.searchLoading}
                    onNarratorClick={handleNarratorClick}
                    onLexiconClick={handleLexiconClick}
                    onServiceClick={(id, type) => {
                      setActiveServiceHadithId(id);
                      setActiveServiceType(type);
                    }}
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
                    hadithNum={hadithNum}
                    setHadithNum={setHadithNum}
                    tarqeem={tarqeem}
                    setTarqeem={setTarqeem}
                    partNum={partNum}
                    setPartNum={setPartNum}
                    pageNum={pageNum}
                    setPageNum={setPageNum}
                    onLoadHadithByNum={handleLoadHadithByNum}
                    onLoadHadithByPage={handleLoadHadithByPage}
                  />

                  {/* Hadith List Results */}
                  <div className="space-y-6">
                    {loading ? (
                      <div className="app-stack-2">
                        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-400 dark:text-slate-500 text-sm">جاري تحميل النصوص النبوية...</span>
                      </div>
                    ) : error ? (
                      <div className="app-text-31">
                        <p className="app-text-32">{error}</p>
                      </div>
                    ) : hadiths.length === 0 ? (
                      <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-sm bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h4 className="app-title-34">استعرض محتويات الكتاب</h4>
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
                            onServiceClick={(hadith, type) => {
                              if (hadith.HadithNum !== undefined && hadith.HadithNum !== null) {
                                setHadithNum(String(hadith.HadithNum));
                              }
                              if (hadith.PartNum !== undefined && hadith.PartNum !== null) {
                                setPartNum(String(hadith.PartNum));
                              }
                              if (hadith.PageNum !== undefined && hadith.PageNum !== null) {
                                setPageNum(String(hadith.PageNum));
                              }
                              setActiveServiceHadithId(hadith.MainID || null);
                              setActiveServiceType(type);
                            }}
                            onClick={() => {
                              if (h.HadithNum !== undefined && h.HadithNum !== null) {
                                setHadithNum(String(h.HadithNum));
                              }
                              if (h.PartNum !== undefined && h.PartNum !== null) {
                                setPartNum(String(h.PartNum));
                              }
                              if (h.PageNum !== undefined && h.PageNum !== null) {
                                setPageNum(String(h.PageNum));
                              }
                            }}
                            isBookmarked={bookmarks.bookmarkedIds.has(h.MainID)}
                            onToggleBookmark={(hadith) => bookmarks.handleToggleBookmark(hadith as any)}
                          />
                        ))}

                        {nextChapterPage && (
                          <div className="app-wrapper-35">
                            <button
                              onClick={handleLoadMoreChapterHadiths}
                              disabled={loadingMore}
                              className="app-title-36"
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
                    activeTab={(currentTab === 'auxiliary' || currentTab === 'primary') ? currentTab : 'primary'}
                    onTabChange={(tab) => setCurrentTab(tab)}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* DETAIL MODAL OVERLAY */}
      {activeServiceHadithId !== null && activeServiceType !== null && activeServiceType !== 'matn_comparison' && (
        <HadithServiceModal
          hadithId={activeServiceHadithId}
          serviceType={activeServiceType}
          onClose={() => {
            setActiveServiceHadithId(null);
            setActiveServiceType(null);
          }}
          onNarratorClick={handleNarratorClick}
          onLexiconClick={handleLexiconClick}
          onSelectSubjectNode={(subjectId, pathNodeIds) => {
            setActiveServiceHadithId(null);
            setActiveServiceType(null);
            setActiveSubjectId(subjectId);
            setActiveSubjectPathIds(pathNodeIds);
            setCurrentView('thematics');
            setCurrentTab('subject');
          }}
        />
      )}

      {activeServiceHadithId !== null && activeServiceType === 'matn_comparison' && (
        <MatnComparisonModal
          hadithId={activeServiceHadithId}
          onClose={() => {
            setActiveServiceHadithId(null);
            setActiveServiceType(null);
          }}
        />
      )}

      {/* NARRATOR DETAIL DRAWER OVERLAY */}
      <NarratorDrawer
        narratorId={activeNarratorId}
        onClose={() => setActiveNarratorId(null)}
      />

      {/* LEXICON WORD DEFINITION OVERLAY POPUP */}
      {activeWordId !== null && (
        <div className="app-element-37">
          <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl w-full max-w-md p-6 text-right font-sans animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="app-wrapper-39">
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
            <div className="app-element-41">
              {wordLoading ? (
                <div className="app-wrapper-42">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                </div>
              ) : (
                <div className="app-text-43">
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
            <div className="app-wrapper-44">
              <button
                onClick={() => setActiveWordId(null)}
                className="app-title-45"
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
          setActiveServiceHadithId(id);
          setActiveServiceType('takhreeg');
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
