import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { Book, AtrafResult, AtrafExtraResult, GroupedMtnResult, NarratorSummary, ServiceText, Annotation } from '../../types';
import { highlightArabicText } from '../../utils/arabicHighlighter';
import { HadithCard, HadithContentRenderer } from '../hadiths/HadithCard';
import { AtrafAsanedTab } from './AtrafAsanedTab';

interface AtrafHubProps {
  onSelectHadith?: (id: number) => void;
  onSelectNarrator?: (id: number) => void;
  activeTab?: string | null;
  onTabChange?: (tab: string) => void;
  onNarratorClick?: (id: number) => void;
  onLexiconClick?: (wordId: number) => void;
  onServiceClick?: (hadith: any, serviceType: any) => void;
  bookmarkedIds?: Set<number>;
  onToggleBookmark?: (hadith: any) => void;
}

type TabType = 'list' | 'atraf_asaned' | 'comparison' | 'rwah_extra' | 'grouped';

export const AtrafHub: React.FC<AtrafHubProps> = ({ 
  onSelectHadith, 
  onSelectNarrator,
  activeTab: propActiveTab,
  onTabChange,
  onNarratorClick,
  onLexiconClick,
  onServiceClick,
  bookmarkedIds,
  onToggleBookmark,
}) => {
  const [localActiveTab, setLocalActiveTab] = useState<TabType>('list');
  const activeTab = (propActiveTab as TabType) || localActiveTab;
  const setActiveTab = (tab: TabType) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setLocalActiveTab(tab);
    }
  };
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  // Tab 1: Atraf List & Chains state
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [atrafResults, setAtrafResults] = useState<AtrafResult[]>([]);
  const [selectedHadithTypes, setSelectedHadithTypes] = useState<string[]>([]);
  const [pagination, setPagination] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null>(null);

  // Tab 2: Parallel Comparison state
  const [sourceBookId, setSourceBookId] = useState<number>(0);
  const [targetBookId, setTargetBookId] = useState<number>(0);
  const [comparisonResults, setComparisonResults] = useState<AtrafExtraResult[]>([]);

  // Tab 3: Extra Narrators state
  const [extraBookIds, setExtraBookIds] = useState<number[]>([]);
  const [extraQuery, setExtraQuery] = useState('');
  const [extraResults, setExtraResults] = useState<NarratorSummary[]>([]);

  // Tab 4: Grouped/Compound Matns state
  const [groupedQuery, setGroupedQuery] = useState('');
  const [groupedResults, setGroupedResults] = useState<GroupedMtnResult[]>([]);
  const [selectedGroupHadith, setSelectedGroupHadith] = useState<number | null>(null);
  const [groupedHadiths, setGroupedHadiths] = useState<ServiceText[]>([]);
  const [groupedVisibleCount, setGroupedVisibleCount] = useState(20);

  // Local Hadith Detail modal state
  const [selectedHadithDetail, setSelectedHadithDetail] = useState<{
    MainID?: number;
    Title: string;
    BookName: string;
    HadithNum: string | number;
    PartNum?: number;
    PageNum?: number;
    CleanContent: string;
    Annotations: Annotation[] | null;
  } | null>(null);

  // Load books list
  useEffect(() => {
    api.getHadithBooks().then((res) => {
      setBooks(res.books);
      if (res.books.length > 0) {
        setSelectedBookIds(res.books.map(b => b.ID)); // Default select all books like legacy UI
        setSourceBookId(res.books[0].ID);
        if (res.books.length > 1) {
          setTargetBookId(res.books[1].ID);
        }
      }
    }).catch(console.error);
  }, []);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Trigger Atraf Search (Tab 1)
  const handleAtrafSearch = async (e?: React.FormEvent, targetPage: number = 1) => {
    if (e) e.preventDefault();
    if (selectedBookIds.length === 0) return;
    setLoading(true);
    try {
      const res = await api.getAtrafList(
        selectedBookIds.join(','),
        '',
        undefined,
        selectedHadithTypes,
        targetPage,
        20
      );
      setAtrafResults(res.results || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAllBooks = () => {
    if (selectedBookIds.length === books.length) {
      setSelectedBookIds([]);
    } else {
      setSelectedBookIds(books.map((b) => b.ID));
    }
  };

  const ALL_HADITH_TYPE_IDS = ['qudsi', 'marfu', 'qawliyyah', 'fiiliyyah', 'taqririyyah', 'wasfiyyah', 'mawkof', 'maktoa', 'marfu_hukman'];

  const handleToggleAllTypes = () => {
    if (selectedHadithTypes.length === ALL_HADITH_TYPE_IDS.length) {
      setSelectedHadithTypes([]);
    } else {
      setSelectedHadithTypes([...ALL_HADITH_TYPE_IDS]);
    }
  };

  const handleTypeToggle = (typeId: string) => {
    setSelectedHadithTypes((prev) => {
      let next: string[];
      if (typeId === 'marfu') {
        const marfuGroup = ['marfu', 'qawliyyah', 'fiiliyyah', 'taqririyyah', 'wasfiyyah'];
        const allSelected = marfuGroup.every((id) => prev.includes(id));
        if (allSelected) {
          next = prev.filter((id) => !marfuGroup.includes(id));
        } else {
          next = Array.from(new Set([...prev, ...marfuGroup]));
        }
      } else {
        if (prev.includes(typeId)) {
          next = prev.filter((id) => id !== typeId);
        } else {
          next = [...prev, typeId];
        }
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setSelectedBookIds(books.map(b => b.ID));
    setSelectedHadithTypes([]);
    setAtrafResults([]);
    setPagination(null);
  };

  // Trigger Comparison Load (Tab 2)
  const handleComparisonLoad = async () => {
    if (!sourceBookId || !targetBookId || sourceBookId === targetBookId) return;
    setLoading(true);
    try {
      const res = await api.getAtrafExtra(sourceBookId, targetBookId);
      setComparisonResults(res.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Extra Narrators Search (Tab 3)
  const handleExtraSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (extraBookIds.length === 0) return;
    setLoading(true);
    try {
      const res = await api.getRwahExtra(extraBookIds.join(','), extraQuery);
      setExtraResults(res.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Grouped Matns Search (Tab 4)
  const handleGroupedSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.getGroupedMtn(groupedQuery);
      if (res.results) {
        setGroupedResults(res.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Resolve grouped variants when a Compound Matn is clicked
  const handleGroupedMatnClick = async (hadithMainId: number) => {
    setSelectedGroupHadith(hadithMainId);
    setLoading(true);
    setGroupedVisibleCount(20);
    try {
      const res = await api.getGroupedMtn('', hadithMainId);
      if (res.group_hadiths) {
        setGroupedHadiths(res.group_hadiths);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Show detailed content in a local overlay modal
  const showDetailModal = (mainId: number | undefined, title: string, bookName: string, num: string | number, part: number | undefined, page: number | undefined, content: string, annotations: Annotation[] | null) => {
    setSelectedHadithDetail({ MainID: mainId, Title: title, BookName: bookName, HadithNum: num, PartNum: part, PageNum: page, CleanContent: content, Annotations: annotations });
  };

  const handleBookToggle = (bookId: number) => {
    setSelectedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const handleExtraBookToggle = (bookId: number) => {
    setExtraBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const renderHighlighted = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    const segments = highlightArabicText(text, query);
    return (
      <>
        {segments.map((seg, i) => (
          <span
            key={i}
            className={seg.isHighlighted ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-1 rounded font-bold' : ''}
          >
            {seg.text}
          </span>
        ))}
      </>
    );
  };

  const filteredSidebarBooks = selectedCategoryFilter === 'all' 
    ? books 
    : books.filter(b => b.category === selectedCategoryFilter);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-50 via-teal-50/40 to-slate-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-500/20 p-8 mb-8 shadow-sm">
        <div className="atraf-hub-grid-11"></div>
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl font-black text-emerald-800 dark:text-emerald-400 leading-tight">
            بوابة الأطراف والمقارنات البينية
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            استعرض أطراف الأحاديث ومقارنة نصوص المتون جنباً إلى جنب للتعرف على وجوه الاختلاف والزيادة، مع بيان رواة الزوائد والمتون المشتركة لمختلف سلاسل الأسانيد.
          </p>
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto">
        <nav className="-mb-px flex space-x-8 space-x-reverse" aria-label="Tabs">
          {(
            [
              { id: 'list', label: 'أطراف الأحاديث والأسانيد' },
              { id: 'atraf_asaned', label: 'أطراف على الأسانيد' },
              { id: 'comparison', label: 'مقارنة المتون الثنائية' },
              { id: 'rwah_extra', label: 'رواة الزوائد والوفرة' },
              { id: 'grouped', label: 'المتون المشتركة والمجموعات' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-semibold transition-all duration-200 cursor-pointer
                ${activeTab === tab.id
                  ? 'border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab: Atraf Asaned (Tree View) */}
      {activeTab === 'atraf_asaned' && (
        <AtrafAsanedTab onSelectHadith={onSelectHadith} />
      )}

      {/* Tab 1: Atraf List & Chains */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with Legacy Filter Criteria */}
          <div className="lg:col-span-1 space-y-5">
            {/* Books Filter Panel */}
            <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <span>📚</span> كتب المتون ({books.length})
                </h3>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={books.length > 0 && selectedBookIds.length === books.length}
                    onChange={handleToggleAllBooks}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>كل الكتب</span>
                </label>
              </div>

              {/* Quick Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'الصحاح', label: 'الصحاح' },
                  { id: 'السنن', label: 'السنن' },
                  { id: 'المسانيد', label: 'المسانيد' },
                  { id: 'المصنفات', label: 'المصنفات' },
                  { id: 'المعاجم', label: 'المعاجم' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${selectedCategoryFilter === cat.id ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200/80 dark:border-slate-700/50'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Legacy Books Data Table Grid */}
              <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 custom-scrollbar">
                <table className="w-full text-right text-xs">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 backdrop-blur-xs border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                    <tr>
                      <th className="p-2 text-center w-8">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">م({selectedBookIds.length})</span>
                      </th>
                      <th className="p-2">الكتاب</th>
                      <th className="p-2 text-center">التصنيف</th>
                      <th className="p-2 text-left">الوفاة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                    {filteredSidebarBooks.map((book) => {
                      const isChecked = selectedBookIds.includes(book.ID);
                      return (
                        <tr
                          key={book.ID}
                          onClick={() => handleBookToggle(book.ID)}
                          className={`cursor-pointer transition-colors ${isChecked ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 font-medium border-r-2 border-emerald-600' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                        >
                          <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleBookToggle(book.ID)}
                              className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                            />
                          </td>
                          <td className="p-2 leading-relaxed">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{book.Title}</div>
                            {book.AuthorName && (
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">{book.AuthorName}</div>
                            )}
                          </td>
                          <td className="p-2 text-center whitespace-nowrap">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50">
                              {book.category}
                            </span>
                          </td>
                          <td className="p-2 text-left whitespace-nowrap text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {book.AuthorDeath ? `${book.AuthorDeath} هـ` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legacy Hadith Type Filter Panel */}
            <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <span>📜</span> نوع الحديث
                </h3>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={ALL_HADITH_TYPE_IDS.length > 0 && selectedHadithTypes.length === ALL_HADITH_TYPE_IDS.length}
                    onChange={handleToggleAllTypes}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>كل أنواع الحديث</span>
                </label>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                {/* 1. قدسية */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none leading-relaxed hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedHadithTypes.includes('qudsi')}
                    onChange={() => handleTypeToggle('qudsi')}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold">أحاديث قدسية</span>
                </label>

                {/* 2. مرفوعة + sub-types */}
                <div className="space-y-2 border-r-2 border-emerald-500/40 pr-3 my-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none leading-relaxed hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={['marfu', 'qawliyyah', 'fiiliyyah', 'taqririyyah', 'wasfiyyah'].every((id) => selectedHadithTypes.includes(id))}
                      onChange={() => handleTypeToggle('marfu')}
                      className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">أحاديث مرفوعة</span>
                  </label>

                  {/* Sub-types for Marfu */}
                  <div className="grid grid-cols-2 gap-2 pr-4 pt-1">
                    {[
                      { id: 'qawliyyah', label: 'سنة قولية' },
                      { id: 'fiiliyyah', label: 'سنة فعلية' },
                      { id: 'taqririyyah', label: 'سنة تقريرية' },
                      { id: 'wasfiyyah', label: 'صفات وشمائل' },
                    ].map((st) => (
                      <label key={st.id} className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
                        <input
                          type="checkbox"
                          checked={selectedHadithTypes.includes(st.id)}
                          onChange={() => handleTypeToggle(st.id)}
                          className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>{st.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 3. قول صحابي */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none leading-relaxed hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedHadithTypes.includes('mawkof')}
                    onChange={() => handleTypeToggle('mawkof')}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>قول صحابي (موقوف)</span>
                </label>

                {/* 4. قول تابعي */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none leading-relaxed hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedHadithTypes.includes('maktoa')}
                    onChange={() => handleTypeToggle('maktoa')}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>قول تابعي (مقطوع)</span>
                </label>

                {/* 5. ما له حكم الرفع */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none leading-relaxed hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedHadithTypes.includes('marfu_hukman')}
                    onChange={() => handleTypeToggle('marfu_hukman')}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>ما له حكم الرفع</span>
                </label>
              </div>
            </div>

            {/* Control Reset Button */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700/80 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🔄</span> إعادة ضبط المعايير
              </button>
            </div>
          </div>

          {/* Main Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Action Header Bar */}
            <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>عرض نتائج الأطراف حسب المعايير المختارة</span>
                </h4>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3">
                  <span>المصادر: <strong className="text-emerald-600 dark:text-emerald-400">{selectedBookIds.length}</strong> كتاباً</span>
                  <span>•</span>
                  <span>الأنواع: <strong className="text-emerald-600 dark:text-emerald-400">{selectedHadithTypes.length === 0 ? 'كل الأنواع' : `${selectedHadithTypes.length} تصنيفاً`}</strong></span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => handleAtrafSearch(e, 1)}
                disabled={loading || selectedBookIds.length === 0}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/10 transition-all disabled:opacity-40 flex items-center gap-2.5 cursor-pointer"
              >
                <span>🔍</span>
                <span>{loading ? 'جاري التحميل...' : 'عرض النتائج'}</span>
              </button>
            </div>

            {selectedBookIds.length === 0 && (
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                ⚠️ الرجاء اختيار كتاب واحد على الأقل من القائمة اليمنى لعرض النتائج.
              </p>
            )}

            {/* Results Grid & Pagination */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  أطراف الأحاديث المكتشفة {pagination ? `(${pagination.total})` : `(${atrafResults.length})`}
                </h4>
                {pagination && pagination.total > 0 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                    الصفحة {pagination.current_page} من {pagination.last_page}
                  </span>
                )}
              </div>

              {atrafResults.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 py-16 text-center text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-slate-900/20 space-y-3">
                  <div className="text-4xl">📚</div>
                  <div className="font-bold text-slate-700 dark:text-slate-300">اختر معايير البحث من الجانب الأيمن</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    حدد الكتب وأنواع الحديث المطلوبة من القائمة اليمنى، ثم اضغط على زر <strong className="text-emerald-600 dark:text-emerald-400">"عرض النتائج"</strong> لمطالعة قائمة أطراف الأحاديث المكتشفة.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {atrafResults.map((atraf) => (
                      <div
                        key={atraf.MainID}
                        onClick={() => onSelectHadith ? onSelectHadith(atraf.MainID) : showDetailModal(atraf.MainID, atraf.Text, atraf.BookName, atraf.HadithNum, atraf.PartNum, atraf.PageNum, 'الرجاء النقر على تفاصيل الكتاب لقراءة المتن الكامل.', null)}
                        className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 hover:border-emerald-500 dark:hover:border-emerald-500/50 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
                      >
                        <h5 className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-relaxed text-sm">
                          {atraf.Text}
                        </h5>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700/50">
                            {atraf.BookName}
                          </span>
                          <div className="flex gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            <span>رقم: {atraf.HadithNum}</span>
                            {atraf.PartNum !== undefined && <span>ج: {atraf.PartNum}</span>}
                            {atraf.PageNum !== undefined && <span>ص: {atraf.PageNum}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Bar */}
                  {pagination && pagination.last_page > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                      <div className="text-slate-500 dark:text-slate-400">
                        إجمالي النتائج: <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">{pagination.total}</span> طرف حديث
                      </div>

                      <div className="flex items-center gap-1.5 dir-rtl">
                        {/* First Page */}
                        <button
                          type="button"
                          onClick={() => handleAtrafSearch(undefined, 1)}
                          disabled={loading || pagination.current_page <= 1}
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
                        >
                          « الأول
                        </button>

                        {/* Previous Page */}
                        <button
                          type="button"
                          onClick={() => handleAtrafSearch(undefined, Math.max(1, pagination.current_page - 1))}
                          disabled={loading || pagination.current_page <= 1}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
                        >
                          ‹ السابق
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: Math.min(5, pagination.last_page) }, (_, idx) => {
                          let pageNum: number;
                          if (pagination.last_page <= 5) {
                            pageNum = idx + 1;
                          } else if (pagination.current_page <= 3) {
                            pageNum = idx + 1;
                          } else if (pagination.current_page >= pagination.last_page - 2) {
                            pageNum = pagination.last_page - 4 + idx;
                          } else {
                            pageNum = pagination.current_page - 2 + idx;
                          }
                          const isActive = pageNum === pagination.current_page;
                          return (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => handleAtrafSearch(undefined, pageNum)}
                              disabled={loading}
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${isActive ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        {/* Next Page */}
                        <button
                          type="button"
                          onClick={() => handleAtrafSearch(undefined, Math.min(pagination.last_page, pagination.current_page + 1))}
                          disabled={loading || pagination.current_page >= pagination.last_page}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
                        >
                          التالي ›
                        </button>

                        {/* Last Page */}
                        <button
                          type="button"
                          onClick={() => handleAtrafSearch(undefined, pagination.last_page)}
                          disabled={loading || pagination.current_page >= pagination.last_page}
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors cursor-pointer"
                        >
                          الأخير »
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Side-by-Side Comparison */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <div className="atraf-hub-card-35">
            <h3 className="text-sm font-bold text-slate-200 mb-4">قارن بين كتابين لمعاينة مقارنة المتون وجمل الاختلاف</h3>
            <div className="atraf-hub-grid-36">
              <div>
                <label className="block text-xs text-slate-400 mb-2">الكتاب المصدر الرئيسي (Source)</label>
                <select
                  value={sourceBookId}
                  onChange={(e) => setSourceBookId(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-emerald-500 focus:outline-hidden"
                >
                  {books.map(b => (
                    <option key={b.ID} value={b.ID}>{b.Title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">الكتاب المقارن به (Target)</label>
                <select
                  value={targetBookId}
                  onChange={(e) => setTargetBookId(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-emerald-500 focus:outline-hidden"
                >
                  {books.map(b => (
                    <option key={b.ID} value={b.ID}>{b.Title}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleComparisonLoad}
              disabled={loading || !sourceBookId || !targetBookId || sourceBookId === targetBookId}
              className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-500 transition-colors disabled:opacity-40"
            >
              {loading ? 'جاري تحميل المقارنة البينية البارزة...' : 'قارن المتون البينية الآن'}
            </button>
            {sourceBookId === targetBookId && (
              <p className="atraf-hub-text-38">⚠️ يجب اختيار كتابين مختلفين للمقارنة.</p>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="atraf-hub-title-5">نصوص المقارنة الجملية البينية ({comparisonResults.length} متناً)</h4>
            {comparisonResults.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 py-12 text-center text-slate-500 text-sm">
                لم يتم إيجاد متون مقارنة مقابلة بين الكتابين المحددين أو اختر كتابين آخرين
              </div>
            ) : (
              <div className="space-y-6">
                {comparisonResults.map((item) => (
                  <div key={item.MainID} className="atraf-hub-element-39">
                    <div className="atraf-hub-element-40">
                      <span className="atraf-hub-title-20">الحديث الرئيسي: {item.Title}</span>
                    </div>
                    <div className="atraf-hub-grid-41">
                      {/* Source */}
                      <div className="p-5 space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 block">المصدر الرئيسي الأول:</span>
                        <div className="text-sm text-slate-300 leading-relaxed font-semibold bg-emerald-950/5 p-3 rounded-lg border border-emerald-950/10">
                          <HadithContentRenderer content={item.SrcCleanContent} annotations={item.SrcAnnotations || undefined} />
                        </div>
                      </div>
                      {/* Target */}
                      <div className="p-5 space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 block">المقارن به الثاني:</span>
                        <div className="atraf-hub-text-43">
                          <HadithContentRenderer content={item.TgtCleanContent} annotations={item.TgtAnnotations || undefined} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Extra Narrators */}
      {activeTab === 'rwah_extra' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="atraf-hub-title-2">حدد المصنف للزوائد</h3>
              <div className="atraf-hub-element-16">
                {books.map((book) => (
                  <label key={book.ID} className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer select-none leading-relaxed">
                    <input
                      type="checkbox"
                      checked={extraBookIds.includes(book.ID)}
                      onChange={() => handleExtraBookToggle(book.ID)}
                      className="atraf-hub-text-18"
                    />
                    <span>{book.Title}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="atraf-hub-card-6">
              <h3 className="text-sm font-bold text-slate-200 mb-4">ابحث في رواة زوائد الكتاب المحدّد</h3>
              <form onSubmit={handleExtraSearch} className="atraf-hub-element-14">
                <input
                  type="text"
                  placeholder="ابحث باسم الراوي داخل الزوائد..."
                  value={extraQuery}
                  onChange={(e) => setExtraQuery(e.target.value)}
                  className="atraf-hub-text-15"
                  dir="rtl"
                />
                <button
                  type="submit"
                  disabled={loading || extraBookIds.length === 0}
                  className="atraf-hub-text-19"
                >
                  {loading ? 'جاري التحميل...' : 'اعرض الرواة'}
                </button>
              </form>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400">رواة الزوائد المكتشفين ({extraResults.length} راوٍ)</h4>
              {extraResults.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 py-12 text-center text-slate-500 text-sm">
                  أدخل خيارات التصفية وانقر عرض الرواة لرؤية رواة الزوائد مع تكرار مروياتهم داخل الكتاب
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {extraResults.map((n) => (
                    <div
                      key={n.ID}
                      onClick={() => onSelectNarrator ? onSelectNarrator(n.ID) : null}
                      className="group atraf-hub-card-44"
                    >
                      <h5 className="atraf-hub-text-45">
                        {renderHighlighted(n.Name, extraQuery)}
                      </h5>
                      <div className="atraf-hub-wrapper-21">
                        <span className="text-slate-500">{n.Tabaqa || 'الطبقة غير معروفة'}</span>
                        <span className="atraf-hub-title-46">
                          {n.HadithsCount} مرويات زائدة
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Grouped/Compound Matns */}
      {activeTab === 'grouped' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-1 space-y-6">
            <div className="atraf-hub-card-6">
              <h3 className="text-sm font-bold text-slate-200 mb-4">ابحث في متون ومجموعات المتون المشتركة</h3>
              <form onSubmit={handleGroupedSearch} className="atraf-hub-element-14">
                <input
                  type="text"
                  placeholder="ابحث بكلمة في المتون المشتركة..."
                  value={groupedQuery}
                  onChange={(e) => setGroupedQuery(e.target.value)}
                  className="atraf-hub-text-15"
                  dir="rtl"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="atraf-hub-text-47"
                >
                  {loading ? '...' : 'ابحث'}
                </button>
              </form>
            </div>

            {/* List */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400">المجموعات البينية ({groupedResults.length})</h4>
              <div className="atraf-hub-element-48">
                {groupedResults.map((item) => (
                  <div
                    key={item.ID}
                    onClick={() => handleGroupedMatnClick(item.HadithMainID)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedGroupHadith === item.HadithMainID
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-850'
                      : 'bg-slate-900/30 text-slate-350 border-slate-800/80 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="atraf-hub-text-49">
                      <HadithContentRenderer content={item.CleanMatn} annotations={item.MatnAnnotations || undefined} />
                    </div>
                    <div className="mt-2.5 flex justify-between text-[10px] text-slate-500">
                      <span>{item.BookName}</span>
                      <span>حديث رقم: {item.HadithNum}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details & Variants */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-sm font-bold text-slate-400">المتن المقابل ونسخ المتون المشتركة</h4>
            {selectedGroupHadith === null ? (
              <div className="rounded-xl border border-dashed border-slate-800 py-24 text-center text-slate-500 text-sm">
                اختر متنًا مشتركًا من القائمة اليمنى لعرض كافة نصوص المتون المنسجمة معه من الكتب الأخرى
              </div>
            ) : (
              <div className="space-y-6">
                {loading ? (
                  <div className="flex py-12 justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Compound Matn with highlights */}
                    <div className="atraf-hub-card-51">
                      <span className="atraf-hub-title-52">نص المتن الجامع مع الشواهد والفروق</span>
                      <div className="atraf-hub-title-53">
                        {(() => {
                          const found = groupedResults.find(r => r.HadithMainID === selectedGroupHadith);
                          return found ? (
                            <HadithContentRenderer content={found.CleanMatn} annotations={found.MatnAnnotations || undefined} />
                          ) : null;
                        })()}
                      </div>
                    </div>

                    <h5 className="text-xs font-bold text-slate-500">الأحاديث المطابقة والنسخ المشتركة في الكتب الأخرى:</h5>
                    {groupedHadiths.length === 0 ? (
                      <div className="atraf-hub-text-55">لا توجد نسخ خارجية مسجلة في مجموعات الربط البيني لهذا الحديث.</div>
                    ) : (
                      <div className="space-y-4">
                        {groupedHadiths.slice(0, groupedVisibleCount).map((h, i) => (
                          <HadithCard
                            key={i}
                            hadith={h as any}
                            onNarratorClick={onNarratorClick}
                            onLexiconClick={onLexiconClick}
                            onServiceClick={onServiceClick}
                            isBookmarked={bookmarkedIds?.has(h.MainID)}
                            onToggleBookmark={onToggleBookmark}
                          />
                        ))}
                        {groupedVisibleCount < groupedHadiths.length && (
                          <div className="flex justify-center mt-4">
                            <button
                              onClick={() => setGroupedVisibleCount(prev => prev + 20)}
                              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold py-2 px-6 rounded-lg transition-colors border border-slate-700"
                            >
                              عرض المزيد من النتائج
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Local Hadith Detail Modal */}
      {selectedHadithDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
              <h3 className="atraf-hub-title-25">
                تفاصيل موضع الحديث والطرف
              </h3>
              <button
                onClick={() => setSelectedHadithDetail(null)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              <HadithCard
                hadith={{
                  MainID: selectedHadithDetail.MainID,
                  CleanContent: selectedHadithDetail.CleanContent,
                  Annotations: selectedHadithDetail.Annotations,
                  BookName: selectedHadithDetail.BookName,
                  HadithNum: selectedHadithDetail.HadithNum,
                  PartNum: selectedHadithDetail.PartNum,
                  PageNum: selectedHadithDetail.PageNum,
                }}
                onNarratorClick={onNarratorClick}
                onLexiconClick={onLexiconClick}
                onServiceClick={(hadith, type) => {
                  setSelectedHadithDetail(null); // Close detail modal first if they navigate to a service
                  onServiceClick?.(hadith, type);
                }}
                isBookmarked={selectedHadithDetail.MainID ? bookmarkedIds?.has(selectedHadithDetail.MainID) : false}
                onToggleBookmark={onToggleBookmark}
                extraHeaderContent={
                  <h4 className="text-base font-black text-emerald-600 dark:text-emerald-450 leading-relaxed">
                    {selectedHadithDetail.Title}
                  </h4>
                }
              />
            </div>
            <div className="atraf-hub-wrapper-29">
              <button
                onClick={() => setSelectedHadithDetail(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-all"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
